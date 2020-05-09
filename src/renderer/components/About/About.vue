<template>
  <b-container>
    <h1>Sobre</h1><br>
    <b>Usuário:</b> {{ user.NickName }}<br>
    <i>{{ user.Name }}</i>
  </b-container>
</template>

<script>
export default {
  data () {
    return {
      user: '',
      key: ''
    }
  },
  mounted () {
    this.getUser()
  },
  methods: {
    getUser () {
      this.$db.find({_id: 'configuration'}, (err, success) => {
        if (err) {
          console.log(err)
        } else {
          this.key = success[0].key
          this.user = success[0].user
          this.$http(`user/${this.user}?APIKey=${this.key}`).then(res => {
            this.user = res.data.Response.User
          })
        }
      })
    }
  }
}
</script>

<style></style>
