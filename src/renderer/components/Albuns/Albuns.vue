<template>
  <b-container class="content">
    <b-modal
      id="modal-loader"
      hide-footer
      centered
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
      :title="`Sincronização (${albunsRemoteTotal}/${albunsLoadedCount})`"
    >
      <b-progress
        :value="albunsLoadedCount"
        :max="albunsRemoteTotal"
        show-progress
        animated
      ></b-progress>
      {{ mensagemModal }}
    </b-modal>
    <b-modal
      id="modal-downloader"
      hide-footer
      centered
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
      :title="titleModalDownloader"
    ></b-modal>
    <b-row>
      <b-col md="4">
        <h5>
          Álbuns:
          <b-badge
            :variant="
              albunsRemoteTotal == albumList.length ? 'success' : 'warning'
            "
            >{{ albunsRemoteTotal }} / {{ albumList.length }}
            <b-spinner v-if="!albunsRemoteTotal > 0" small></b-spinner>
          </b-badge>
        </h5>
      </b-col>
      <b-col md="4">
        <h5>
          Imagens: <b-badge>{{ imagesLoadedCount }}</b-badge>
        </h5>
      </b-col>
      <b-col md="2">
        <b-button size="sm" :disabled="isBusy" v-on:click="loadData()"
          ><b-icon icon="arrow-clockwise"></b-icon
        ></b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-form-group label-align-sm="right" label-for="filterInput">
          <b-input-group size="sm">
            <b-form-input
              v-model="filter"
              type="search"
              id="filterInput"
              placeholder="pesquisa"
            ></b-form-input>
            <b-input-group-append>
              <b-button @click="filtrarAlbuns()">Buscar</b-button>
              <b-button :disabled="!filter" @click="filter = ''"
                >Limpar</b-button
              >
            </b-input-group-append>
            <b-form-spinbutton
              inline
              id="sb-wrap"
              wrap
              min="0"
              v-model="perPage"
              :max="albunsCount"
              step="25"
              placeholder="--"
            >
            </b-form-spinbutton>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-container>
      <b-row class="justify-content-md-center">
        <b-button-group>
          <b-button
            variant="secondary "
            size="sm"
            v-on:click="downloadSelected()"
            :disabled="!selected.length > 0"
          >
            Download selecionados
            <b-badge pill variant="light"> {{ selected.length }}</b-badge>
          </b-button>
          <b-button variant="secondary" size="sm" v-on:click="selectAllRows()"
            >Selecionar todos</b-button
          >
          <b-button variant="secondary" size="sm" v-on:click="clearSelected()"
            >Deselecionar todos</b-button
          >
        </b-button-group>
      </b-row>
      <b-container class="content">
        <b-row class="justify-content-md-center">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
          ></b-pagination>
        </b-row>
      </b-container>
    </b-container>
    <b-container>
      <b-row>
        <b-table
          ref="selectableTable"
          :per-page="perPage"
          :items="albumList"
          :fields="fields"
          :busy="isBusy"
          :current-page="currentPage"
          select-mode="range"
          selectable
          @row-selected="onRowSelected"
        >
          <template v-slot:table-busy>
            <div class="text-center text-danger my-2">
              <b-spinner class="align-middle"></b-spinner>
              <strong>
                Carregando lista de álbuns
              </strong>
            </div>
          </template>
          <template v-slot:cell(index)="data">
            {{ data.index + 1 }}
          </template>
          <template v-slot:cell(images)="data">
            <b-badge
              pill
              :variant="data.item.imagesCount == 0 ? 'warning' : 'primary'"
              >{{
                data.item.imagesCount !== undefined ? data.item.imagesCount : 0
              }}</b-badge
            >
          </template>
          <template v-slot:cell(status)="data">
            <b-container col="2">
              <b-row>
                <b-col>
                  <b-button
                    size="sm"
                    v-on:click="getImages(data.index, data.item)"
                    ><b-icon icon="arrow-clockwise"></b-icon
                  ></b-button>
                </b-col>
              </b-row>
            </b-container>
          </template>
          <template v-slot:cell(download)="data">
            <b-col>
              <b-button
                size="sm"
                v-on:click="download(data.item)"
                :disabled="data.item.imagesCount == 0"
                ><b-icon icon="download"></b-icon
              ></b-button>
            </b-col>
          </template>
        </b-table>
      </b-row>
    </b-container>
  </b-container>
</template>

<script>
import { setTimeout } from "timers";
var fs = require("fs");
var Path = require("path");
var Axios = require("axios");
var mkdirp = require("mkdirp");

export default {
  async mounted() {
    this.$bvModal.show("modal-loader");
    this.$bvModal.hide("modal-downloader");
    await this.loadConfiguration();
    await this.getLocalAlbumList();
  },
  data() {
    return {
      titleModalDownloader: "",
      mensagemModal: "",
      showLoadingModal: true,
      selected: [],
      albunsLoadedCount: 0,
      albunsRemoteTotal: 0,
      filter: "",
      perPage: 25,
      currentPage: 1,
      isBusy: true,
      configuration: {
        key: null,
        user: null,
      },
      albumList: [],
      fields: [
        { key: "index", label: "Nº" },
        { key: "UrlPath", label: "Pasta" },
        { key: "images", label: "images" },
        { key: "status", label: "status" },
        { key: "download", label: "download" },
      ],
    };
  },
  methods: {
    async downloadSelected() {
      this.$bvModal.show("modal-downloader");
      this.$bvModal.hide("modal-loader");
      var albuns = this.selected;
      this.titleModalDownloader = `Baixando ${albuns.length} álbuns.`;
      for (let index = 0; index < albuns.length; index++) {
        const album = albuns[index];
        await this.download(album);
      }
    },
    onRowSelected(items) {
      this.selected = items;
    },
    selectAllRows() {
      setTimeout(function() {
        this.perPage = this.albumList.length;
      }, 3000);
      this.$refs.selectableTable.selectAllRows();
    },
    clearSelected() {
      setTimeout(function() {
        this.perPage = 100;
      }, 3000);
      this.$refs.selectableTable.clearSelected();
    },
    selectThirdRow() {
      this.$refs.selectableTable.selectRow(2);
    },
    unselectThirdRow() {
      this.$refs.selectableTable.unselectRow(2);
    },
    getAlbumIndexWithoutImages() {
      for (let index = 0; index < this.albumList.length; index++) {
        if (this.albumList[index].images === undefined) {
          console.log(`Álbum index: ${index}`);
          return index;
        }
      }
    },
    async saveImageOnDisk(url, path) {
      await Axios.get(url, {
        responseType: "arraybuffer",
      })
        .then((response) => {
          const buffer = Buffer.from(response.data, "base64");
          fs.writeFile(path, buffer, (err) => {
            if (err) {
              console.log(err);
            }
          });
        })
        .catch((ex) => {
          console.error(ex);
        });
    },
    filtrarAlbuns() {
      console.log("Realizando pesquisa");
      if (this.filter == "") {
        console.log("Filtro vazio");
        this.isBusy = true;
        this.getLocalAlbumList();
      } else {
        console.log(`Filtro: [${this.filter}]`);
        this.$db.find(
          { "images.FileName": new RegExp(this.filter, "g") },
          (err, albuns) => {
            if (err) {
              console.log(err);
            }
            this.albumList = this.getAlbumListTable(albuns);
          }
        );
      }
      this.isBusy = false;
    },
    isDownloadButtonValid(album) {
      if (album.images === undefined) {
        return true;
      }
      return false;
    },
    async getLocalAlbumImages(album) {
      var albumLoaded = await this.$db.find(
        { _id: album._id },
        (err, success) => {
          if (err) {
            console.log(err);
          } else {
            if (success.length > 0) {
              album.images = success[0].images;
            }
          }
        }
      );
      return album;
    },
    async download(album) {
      this.$bvModal.show("modal-downloader");
      this.titleModalDownloader = "Baixando imagens";
      await this.getLocalAlbumImages(album).then(async (albumLoaded) => {
        this.titleModalDownloader = `Obtendo lista de imagens`;
        var pathAlbum = Path.resolve(this.configuration.folder);
        var relativePath = Path.resolve(Path.join(pathAlbum, album.UrlPath));
        // cria estrutura de diretório
        mkdirp(relativePath)
          .then(async () => {
            this.titleModalDownloader = `Criando pasta \n ${relativePath}`;
            // busca link de imagem original
            for (const [i, image] of album.images.entries()) {
              this.$bvModal.show("modal-downloader");
              this.titleModalDownloader = `Salvando imagem ${i} de ${album.images.length} no disco <br> ${image.FileName}`;

              var imageToSave = {
                path: Path.resolve(
                  this.configuration.folder,
                  relativePath,
                  image.FileName
                ),
              };
              if (fs.existsSync(imageToSave.path)) {
                console.log(imageToSave.path);
                this.titleModalDownloader = `Imagem ${image.FileName} já salva`;
              } else {
                imageToSave.url = await this.getLinkFromFullImage(image);
                this.saveImageOnDisk(imageToSave.url, imageToSave.path);
              }
            }
            this.$bvModal.hide("modal-downloader");
          })
          .catch((err) => {
            consol.log(err);
          });
      });
    },
    async getLinkFromFullImage(image) {
      // buscando link de imagem
      console.log("Buscando link de imagem");
      var url = await this.$http(
        `/image/${image._id}!largestimage?APIKey=${this.configuration.key}`
      )
        .then((res, err) => {
          var url = res.data.Response.LargestImage.Url;
          return url;
        })
        .catch((err) => {
          console.log(`Falha co buscar link de imagem: Erro -> ${err}`);
        });
      return url;
    },
    async makeRecursiveDir(relativePath) {
      var basefolder = Path.resolve(this.configuration.folder);
      var folderPath = Path.resolve(relativePath);
      var path = Path.resolve(basefolder, folderPath);

      mkdirp(path)
        .then(() => {
          console.log("Pasta criada com sucesso");
        })
        .catch((err) => {
          consol.log(err);
        });
    },
    async getImagesFromAlbum(album) {
      this.$bvModal.show("modal-loader");
      console.log(`Baixando imagens de álbum ${album._id}`);
      var imagesToSave = [];

      await this.$http(
        `/album/${album._id}!images?start=0&count=10000&APIKey=${this.configuration.key}`
      )
        .then(async (res) => {
          var images = res.data.Response.AlbumImage;
          if (images !== undefined && images.length > 0) {
            imagesToSave = images.map((image) => {
              var i = {};
              i.FileName = image.FileName;
              i._id = image.ImageKey;
              i.Uri = image.Uri;
              return i;
            });
          } else {
            console.log("Álbum inválido");
          }
        })
        .catch((err) => {
          console.log(err);
        });
      return imagesToSave;
    },
    getImagensCount(album) {
      if (album.images == null || album.images === undefined) {
        return 0;
      }
      return album.images.length;
    },
    async loadConfiguration() {
      this.mensagemModal = "Carregando configurações";
      await this.$db.find({ _id: "configuration" }, async (err, confs) => {
        if (err) {
          meg("Erro", err);
        }
        if (confs != null && confs !== undefined) {
          this.configuration = confs[0];
          this.mensagemModal = "Configurações carregadas com sucesso.";
        }
        if (
          this.configuration.key === undefined ||
          this.configuration.key === null
        ) {
          this.$router.push("/configuration");
        } else {
          await this.getRemoteAlbunsCount();
        }
      });
    },
    async getRemoteAlbunsCount() {
      this.mensagemModal = "Verificando albuns remotos";
      await this.$http(
        `folder/user/${this.configuration.user}!albumlist?APIKey=${this.configuration.key}`
      )
        .then((res) => {
          this.albunsRemoteTotal = res.data.Response.AlbumList.length;
          this.mensagemModal = "Álbums carregados do site";
          this.$bvModal.hide("modal-loader");
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getLocalAlbumList() {
      this.$db.find({ type: "album" }, (err, albuns) => {
        console.log("Buscando imagens");
        if (err) {
          console.log("Erro", err);
        }
        if (albuns.length == 0) {
          console.log("lista vazia");
          this.isBusy = false;
          this.$bvModal.hide("modal-loader");
        } else {
          // carrega lista de albuns
          this.albumList = this.getAlbumListTable(albuns);
          this.albunsLoadedCount = this.albumList.length;
          this.isBusy = false;
          this.$bvModal.hide("modal-loader");
          console.log(`Carregados ${this.albunsLoadedCount} álbuns do disco`);
        }
      });
    },
    getAlbumListTable(albuns) {
      var albumList = [];
      if (albuns !== undefined && albuns.length > 0) {
        albumList = albuns.map((album) => {
          var a = {};
          a._id = album._id;
          a.UrlPath = album.UrlPath;
          a.Name = album.Name;
          a.imagesCount = album.images.length;
          return a;
        });
      }
      return albumList;
    },
    async loadData() {
      this.$bvModal.show("modal-loader");
      var albumList = [];
      this.albunsLoadedCount = 0;
      this.mensagemModal = "Iniciando carregamento de dados";
      await this.$http(
        `folder/user/${this.configuration.user}!albumlist?APIKey=${this.configuration.key}`
      )
        .then((res) => {
          // adciona _id de album
          albumList = res.data.Response.AlbumList;
          // this.albunsRemoteTotal = albumList.length;
          albumList.forEach((album) => {
            album._id = album.Uri.split("/").reverse()[0];
          });
          this.mensagemModal = "Iniciando sincronia";
          return albumList;
        })
        .then(async (albumList) => {
          // atualiza lista de imagens
          for (const [i, album] of albumList.entries()) {
            await this.$db.find({ _id: album._id }, async (err, res) => {
              this.mensagemModal = `Buscando imagens para álbum`;
              if (err) {
                console.log(err);
              }
              if (res.length == 0) {
                album.images = await this.getImagesFromAlbum(album);
                // salva álbum no banco e adiciona na lista
                this.saveAlbum(album);
                // atualiza count de álbum
              } else {
                this.mensagemModal = `Álbum ID ${album._id} já salvo`;
              }
              this.albunsLoadedCount += 1;
            });
          }
          this.showLoadingModal = false;
          this.isBusy = false;
        })
        .then(() => {
          this.getLocalAlbumList();
        })
        .catch((err) => {
          console.log(err);
        });
      return albumList;
    },
    async saveAlbum(album) {
      console.log("Salvando álbum");
      album.type = "album";
      this.$db.find({ _id: album._id }, (err, resultado) => {
        if (err) {
          console.log("Erro ao buscar arquivo");
          console.log(err);
        }
        if (resultado.length == 0) {
          album.imagesCount = album.images.length;
          this.$db.insert(album, (err, success) => {
            if (err) {
              this.mensagemModal = "Álbum já salvo";
            } else {
              this.mensagemModal = `Álbum ${success.UrlPath}/${success.Name} salvo com sucesso`;
            }
          });
        } else {
          /* console.log("Atualizando álbum");
          this.$db.update(
            { _id: album._id },
            {
              $set: {
                album,
              },
            },
            (err, success) => {
              if (err) {
                console.log(err);
              } else {
                console.log("Atualizados " + success + " registros.");
              }
            }
          ); */
        }
      });
    },
    isImagesSincronized() {
      return this.albunsLoaded >= this.albunsCount;
    },
  },
  computed: {
    porcentagem() {
      var percentagem = Math.round(
        (this.albunsRemoteTotal * 100) / this.albunsLoadedCount
      );
      if (isNaN(percentagem)) {
        return 0;
      }
      return percentagem;
    },
    totalRows() {
      return this.albumList.length !== undefined ? this.albumList.length : 0;
    },
    getAlbunsLoadedCount() {
      return this.albumList.length;
    },
    imagesLoadedCount() {
      var counter = 0;
      for (let index = 0; index < this.albumList.length; index++) {
        counter += this.albumList[index].imagesCount;
      }
      return counter;
    },

    albunsCount() {
      return this.albumList === null ? 0 : this.albumList.length;
    },
  },
};
</script>

<style>
.content {
  padding: 20px;
}
.default {
  padding: 10px;
}
</style>
