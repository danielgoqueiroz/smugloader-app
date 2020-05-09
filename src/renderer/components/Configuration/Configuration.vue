<template>
  <div>
    <b-container>
      <h3>Configuração <b-icon-check-circle v-if="isValid" variant="success"/><b-icon-exclamation-octagon v-else variant="warning"/> </h3> 
      <br>
      <b-form>
        <b-form-group label="Nome de usuário">
          <b-form-input v-model='user' :state="isUserValid"></b-form-input>
        </b-form-group>
        <br>
        <b-form-group label="Chave (Key)">
          <b-form-input v-model="key" :state="isKeyValid"></b-form-input>
        </b-form-group>
        <br>
        <b-form-group label="Pasta">
          <b-row align-v="start">
            <b-col>
              <b-form-file plain v-model="directoryFile" :browse-text="folder" placeholder="Selecione uma pasta" :state="isFolderValid" class="mt-1" directory></b-form-file>
            </b-col>
            <b-col>
              <b-form-input v-model="folderComputed" :disabled="true"></b-form-input>
            </b-col>
          </b-row>
        </b-form-group>
        <b-button variant="primary" :disabled="!isCenarioValid" v-on:click="saveConfiguration()">Salvar</b-button>
        <b-button variant="primary" v-on:click="getConfiguration()">Carregar</b-button>
      </b-form>
    </b-container>
  </div>
</template>

<script>
// xxSjSsZMRB7bX6BLLK2wKmPL5LZGLKKq
export default {
  mounted () {
    var conf = this.getConfiguration()
    console.log(conf)
    if (conf === undefined) {
      console.log('Indefinido')
      this.$db.insert(this.getInicialConfiguration(), (err, confSalved) => {
        if (err) {
          console.log(err)
        }
        console.log('Item salvo')
        console.log(confSalved)
      })
    }
  },
  data () {
    return {
      isValid: false,
      user: '',
      key: '',
      folder: '',
      directoryFile: null
    }
  },
  computed: {
    folderComputed () {
      if (this.directoryFile != null) {
        this.folder = this.directoryFile.path
        return this.directoryFile.path
      }
      if (this.folder != null && this.folder.length > 0) {
        return this.folder
      }
    },
    dbteste () {
      this.$db.find(this.configuration, function (err, conf) {
        if (err) {
          console.log(err)
          return err
        }
        console.log(conf)
      })
    },
    isUserValid () {
      return this.checkInput(this.user)
    },
    isKeyValid () {
      return this.checkInput(this.key)
    },
    isFolderValid () {
      return this.checkInput(this.folder)
    },
    isCenarioValid () {
      return this.isUserValid && this.isKeyValid
    }
  },
  methods: {
    validateData () {
      var res = this.$http(`user/${this.user}?APIKey=${this.key}`).then(res => {
        var userName = res.data.Response.User.Name
        this.isValid = userName !== undefined && userName.length > 0
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },
    getInicialConfiguration () {
      var conf = {}
      conf._id = 'configuration'
      conf.user = 'Usuário'
      conf.key = 'Key'
      conf.folder = 'pasta'
      return conf
    },
    saveConfiguration () {
      
      var confToSave = {
        _id: 'configuration',
        user: this.user,
        key: this.key,
        folder: this.folder
      }

      this.validateData()
      this.$db.update({_id: 'configuration'}, { $set: { 'user': confToSave.user, 'key': confToSave.key, 'folder': confToSave.folder } }, {multi: true}, (err, conf) => {
        if (err) {
          console.log('Erro ao atualizar configuração')
          console.log(err)
        } else {
          console.log('Configuração atualizada com sucesso.')
        }
      })
      console.log(confToSave)
      this.getConfiguration()
    },
    async getConfiguration () {
      console.log('Buscando configurações')
      this.$db.find({_id: 'configuration'}, (err, confs) => {
        if (err) {
          console.log('Erro ao buscar configuração', err)
        }
        if (confs.length === 0) {
          console.log(confs.length)
          return null
        }
        var conf = confs[0]
        console.log('Existem configurações salvas localmente.')
        this.user = conf.user
        this.key = conf.key
        this.folder = conf.folder
        this.validateData() 
        return conf
      })
      
    },
    checkInput (value) {
      return !(value === undefined || value == null || value === '')
    },
    getParam (param) {
      return this.checkInput(param) ? param : ''
    }
  }
}
</script>

<style lang="stylus"></style>