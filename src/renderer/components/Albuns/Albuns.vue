<template>
  <b-container>
    <b-row>
      <b-col cols="3">
        <h5>Álbuns: <b-badge>{{albunsCount}}</b-badge></h5>
      </b-col>
      <b-col>
        <h5> Imagens: <b-badge>{{albunsSincronizatedCount}}</b-badge></h5>
      </b-col>
      <b-col>
        <b-button v-on:click='loadData()'><b-icon icon="arrow-clockwise"></b-icon></b-button>
      </b-col>
      <b-col>
        <b-pagination
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="perPage"
              align="fill"
              size="sm"
              class="my-0"
        ></b-pagination>
      </b-col>
    </b-row>
    <b-col lg="6" class="my-1">
        <b-form-group
          label="Filter"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="filterInput"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-input
              v-model="filter"
              type="search"
              id="filterInput"
              placeholder="pesquisa"
            ></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filtrarAlbuns()">Buscar</b-button>
              <b-button :disabled="!filter" @click="filter = ''">Limpar</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    <b-table :per-page="perPage" :items="albumList" :fields="fields" :busy="isBusy" :current-page="currentPage">
      <template v-slot:table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong>Carregando lista de álbuns <br>(isso pode demorar um pouco)...</strong>
        </div>
      </template>
      <template v-slot:cell(index)="data">
        {{ data.index + 1 }}
      </template>
      <template v-slot:cell(images)="data">
        <b-badge pill variant="secondary">{{data.item.images !== undefined ? data.item.images.length : 0 }}</b-badge>
      </template>
      <template v-slot:cell(status)="data">
        <b-container col="4">
          <b-row>
            <b-col>
              <b-button v-on:click='getImages(data.index, data.item)'><b-icon icon="arrow-clockwise"></b-icon></b-button>
            </b-col>
            <b-col>
              <b-button v-on:click='download(data.item)' :disabled=isDownloadButtonValid(data.item)><b-icon icon="download"></b-icon></b-button>
            </b-col>
          </b-row>
        </b-container>
      </template>
    </b-table>
  </b-container>
</template>

<script>
// xxSjSsZMRB7bX6BLLK2wKmPL5LZGLKKq
var fs = require('fs')
var Path = require('path')
var Axios = require('axios')
var mkdirp = require('mkdirp');


export default {
  mounted () {
    this.getConfiguration()
    this.getLocalAlbumList()
  },
  data () {
    return {
      imagesToDownlod: [],
      filter: '',
      perPage: 100,
      currentPage: 1,
      isBusy: true,
      configuration: {
        key: null,
        user: null
      },
      albumList: [],
      fields: [{key: 'index', label: 'Nº'}, {key: 'UrlPath', label: 'Pasta'}, {key: 'images', label: 'images'}, {key: 'status', label: 'status'}]
    }
  },
  methods: {
    msg (title, text, delay) {
      this.$bvToast.toast(text, {
          title: title,
          autoHideDelay: delay,
          appendToast: false
        })
    },
    infoMsg (text) {
      this.msg("Info", text, 3000)
    },
    errorMsg (text) {
      this.msg("Erro", text, 5000)
    },
    saveImageOnDisk (url, path) {
      Axios.get(url, {
        responseType: 'arraybuffer'
      }).then(response => {
        const buffer = Buffer.from(response.data, 'base64');
        fs.writeFile(path, buffer, (err) => {
          if (err) {
            console.log(err)
          }
        })
        console.log('Imagem salva com sucesso.')
      }).catch(ex => {
        console.error(ex);
      });
    },
    filtrarAlbuns () {
      this.$db.find({'images.FileName' : new RegExp(this.filter, 'g')}, (err, res) => {
        if (err) {
          console.log(err)
        }
        console.log('imagem')
        console.log(res)
        this.albumList = res
      })
    },
    isDownloadButtonValid (album) {
      if (album.images === undefined) {
        return true
      }
      return false
    },
    async download (album) {
      var pathAlbum = Path.resolve(this.configuration.folder)
      var relativePath = Path.resolve(Path.join(pathAlbum, album.UrlPath))
      
      // cria estrutura de diretório
      mkdirp(relativePath).then(() => {
        console.log('Pasta criada com sucesso')
      }).catch(err=> {
        consol.log(err)
      })

      // teste 
      var image = album.images[0]

      // busca link de imagem original
      album.images.forEach(image => {
        setTimeout(this.getLinkFromFullImage(image).then((res) => {
            var url = res
          console.log(url)
          var imageToSave = {
            path: Path.resolve(this.configuration.folder, relativePath, image.FileName),
            url : url
          }
          this.saveImageOnDisk(imageToSave.url, imageToSave.path)
        }), 300)
      })
    },
    async getLinkFromFullImage (image) {
        var url = await this.$http(`/image/${image.ImageKey}!largestimage?APIKey=${this.configuration.key}`).then((res, err) => {
          if (err) {
            console.log(err)
          }
          return res.data.Response.LargestImage.Url
        })
        return url
    },
    async makeRecursiveDir (relativePath) {
      var basefolder = Path.resolve(this.configuration.folder)
      var folderPath = Path.resolve(relativePath)
      var path = Path.resolve(basefolder, folderPath)
     
      mkdirp(path).then(() => {
        console.log('Pasta criada com sucesso')
      }).catch(err=> {
        consol.log(err)
      })
      
      /* var folders = folderPath.split(basefolder)[1]
      var foldersList = []
      if (folderPath.includes('\\')) {
        foldersList = folders.split('\\')
      } else {
        foldersList = folders.split('/')
      }
      foldersList = foldersList.filter((el) => {
          if (el.length > 0) {
            return el
          }
        })
      foldersList.forEach(folder => {
          var pathTree = Path.resolve(basefolder, folder)
          if (fs.existsSync(pathTree)) {
            return
          }
          fs.mkdir(pathTree, (err, result) => {
            if (err) {
              console.log(err)
            }
            if (result) {
              console.log(result)
            }
          });
          basefolder = pathTree
      }) */
    },
    async getImages (index, album) {
      await this.$http(`/album/${album._id}!images?start=0&count=10000&APIKey=${this.configuration.key}`).then(res => {
        var images = res.data.Response.AlbumImage
        var imagesToSave = images.map(image => {
          var i = {}
          i.FileName = image.FileName
          i._id = image.ImageKey
          i.Uri = image.Uri
          return i
        })
        album.images = imagesToSave
        this.$set(this.albumList, index, album)
        console.log(this.albumList[index])
        this.$db.update({ _id: album._id }, { $set: {images: images} }, (err, success) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Atualizados ' + success + ' registros.')
          }
        })
      })
      // console.log(album.images)
    },
    getImagensCount (album) {
      if (album.images == null || album.images === undefined) {
        return 0
      }
      return album.images.length
    },
    getConfiguration () {
      this.msg('Carregando configuração')
      this.$db.find({_id: 'configuration'}, (err, confs) => {
        if (err) {
          errorMsg(err)
        }
        if (confs != null && confs !== undefined) {
          this.configuration = confs[0]
          this.infoMsg("Configuração carregada com sucesso")
        }
      })
    },
    getLocalAlbumList () {
      this.$db.find({type: 'album'}, (err, success) => {
        this.msg('Buscando imagens')
        if (err) {
          this.msg(err)
        }
        if (success) {
          this.msg('Albuns locais')
          this.albumList = success
        }
      })
      this.isBusy = false
      console.log(this.albumList)
    },
    async loadData () {
      this.isBusy = true
      this.msg('Carregando dados de álbuns')
      if (this.configuration.key === null) {
        this.$router.push('/configuration')
        this.msg('redirecionando...')
      }
      await this.$http(`folder/user/${this.configuration.user}!albumlist?APIKey=${this.configuration.key}`).then(res => {
        const albuns = res.data.Response.AlbumList
        for (var i = 0; i < albuns.length; i++) {
          var album = albuns[i]
          this.saveAlbum(album)
        }
      })
      this.$db.find({type: 'album'}, (err, success) => {
        if(err) {
          console.log(err)
        }
        console.log(success)
        this.albumList = success
      })
      this.isBusy = false

    },
    saveAlbum (albumTeste) {
      albumTeste._id = albumTeste.Uri.split('/').reverse()[0]
      albumTeste.type = 'album'
      this.$db.find({_id: albumTeste._id}, (err, albunsDB) => {
        if (err) {
          this.msg('Erro ao buscar arquivo')
          console.log(err)
        }
        if (albunsDB) {
          if (albunsDB.length === 0) {
            this.$db.insert(albumTeste, (err, success) => {
              if (err) {
                this.msg('Erro ao salvar arquivo')
              } else {
                this.msg('Álbum ' + albumTeste._id + ' salvo com sucesso')
              }
            })
          } else {
            this.msg('Álbum já salvo')
          }
        }
      })
    }
  },
  computed: {
    totalRows () {
      return this.albumList.length !== undefined ? this.albumList.length : 0
    },
    albunsSincronizatedCount () {
      var sum = this.albumList.reduce((count, album) => {
        if (album.images != null && album.images !== undefined) {
          count += album.images.length
        }
        return count
      }, 0)
      return sum
    },
    albunsCount () {
      return this.albumList === null ? 0 : this.albumList.length
    }
  }
}
</script>

<style></style>
