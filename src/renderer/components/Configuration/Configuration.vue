<template>
  <div>
    <b-container>
      <h3>
        Configuração
        <b-icon-check-circle
          v-if="isValid"
          variant="success"
        /><b-icon-exclamation-octagon v-else variant="warning" />
      </h3>
      <br />
      <b-form>
        <b-form-group label="Nome de usuário">
          <b-form-input v-model="user" :state="isUserValid"></b-form-input>
        </b-form-group>
        <br />
        <b-form-group label="Chave (Key)">
          <b-form-input v-model="key" :state="isKeyValid"></b-form-input>
        </b-form-group>
        <br />
        <b-form-group label="Pasta">
          <b-row align-v="start">
            <b-col>
              <b-form-file
                plain
                v-model="directoryFile"
                :browse-text="folder"
                placeholder="Selecione uma pasta"
                :state="isFolderValid"
                class="mt-1"
                directory
              ></b-form-file>
            </b-col>
            <b-col>
              <b-form-input
                v-model="folderComputed"
                :disabled="true"
              ></b-form-input>
            </b-col>
          </b-row>
        </b-form-group>
        <b-button
          variant="primary"
          :disabled="!isCenarioValid"
          v-on:click="saveConfiguration()"
          >Salvar</b-button
        >
        <b-button variant="primary" v-on:click="getConfiguration()"
          >Carregar</b-button
        >
      </b-form>
    </b-container>
  </div>
</template>

<script>
export default {
  async mounted() {
    await this.getConfiguration();
  },
  data() {
    return {
      isValid: false,
      user: "",
      key: "",
      folder: "",
      directoryFile: null,
    };
  },
  methods: {
    async getConfiguration() {
      console.log("Buscando configurações");

      this.$db.find({ _id: "configuration" }, (err, confs) => {
        if (err) {
          console.log("Erro ao buscar configuração", err);
        }
        if (confs) {
          if (confs.length === 0) {
            console.log(
              "Nenhuma configuração encontrada, salvando configuração padrão."
            );
            var configuration = this.getInitialConfiguration();

            this.$db.insert(
              {
                _id: configuration._id,
                key: configuration.key,
                user: configuration.user,
                folder: configuration.folder,
              },
              (err, resp) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(
                    `Configuração padrão salva com sucesso: ${configuration.user}`
                  );
                }
              }
            );
          } else {
            this._id = confs[0]._id;
            this.user = confs[0].user;
            this.key = confs[0].key;
            this.folder = confs[0].folder;
          }
          this.validateData();
        }
      });
    },
    async validateData() {
      console.log("iniciando validação");
      if (
        this.user === undefined ||
        this.user === null ||
        this.user.length <= 1 ||
        this.key === undefined ||
        this.key == null ||
        this.key.length <= 5
      ) {
        this.isValid = false;
        return;
      }
      var res = await this.$http(`user/${this.user}?APIKey=${this.key}`)
        .then((res) => {
          var userName = res.data.Response.User.Name;
          this.isValid = userName !== undefined && userName.length > 0;
          return;
        })
        .catch((err) => {
          console.log(`Falha na requisição de validação dos daods ${err}.`);
          this.isValid = false;
        });
    },
    getInitialConfiguration() {
      var conf = {
        _id: "configuration",
        user: "",
        key: "",
        folder: "c:/",
      };
      return conf;
    },
    async saveConfiguration() {
      console.log("Salvando configuração" + this.isValid);
      await this.validateData();

      if (this.isValid) {
        console.log("Atualizando configurações");
        this.$db.update(
          { _id: "configuration" },
          {
            $set: {
              user: this.user,
              key: this.key,
              folder: this.folder,
            },
          },
          { multi: true },
          (err, conf) => {
            if (err) {
              console.log("Erro ao atualizar configuração");
              console.log(err);
            } else {
              console.log("Configuração atualizada com sucesso.");
            }
          }
        );
        this.getConfiguration();
      }
    },
    checkInput(value) {
      return !(value === undefined || value == null || value === "");
    },
    getParam(param) {
      return this.checkInput(param) ? param : "";
    },
  },
  computed: {
    folderComputed() {
      if (this.directoryFile != null) {
        this.folder = this.directoryFile.path;
        return this.directoryFile.path;
      }
      if (this.folder != null && this.folder.length > 0) {
        return this.folder;
      }
    },
    dbteste() {
      this.$db.find(this.configuration, function(err, conf) {
        if (err) {
          console.log(err);
          return err;
        }
        console.log(conf);
      });
    },
    isUserValid() {
      return this.checkInput(this.user);
    },
    isKeyValid() {
      return this.checkInput(this.key);
    },
    isFolderValid() {
      return this.checkInput(this.folder);
    },
    isCenarioValid() {
      return this.isUserValid && this.isKeyValid;
    },
  },
};
</script>

<style lang="stylus"></style>
