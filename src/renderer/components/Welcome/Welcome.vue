<template>
  <b-container>
    <img id="logo" src="~@/assets/welcome.png">
  </b-container>
</template>

<script>
import fs from 'fs'
var path = require('path')

export default {
  data () {
    return {
      text: '',
    }
  },
  methods: {
  },
  computed: {
  },
  mounted () {
  }
}
</script>

<style>
#logo {
  position: absolute;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
