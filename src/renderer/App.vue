<template>
  <div id="app">
    <b-container>
      <SidebarMenu :menu="menu" :collapsed="true"  :hideToggle="true" :disableHover="true"/>
    </b-container>
    <b-container>
      <router-view></router-view>
    </b-container>
  </div>
</template>

<script>
import { SidebarMenu } from 'vue-sidebar-menu'

  export default {
  components: {
    SidebarMenu
  },
  data () {
    return {
      menu: [
        {
          href: '/configuration',
          title: 'Configuração',
          icon : 'fa fa-cog'
        },
        {
          href: '/albuns',
          title: 'Albuns',
          icon: 'fa fa-file-image-o'
        },
        {
          href: 'sobre',
          title: 'Sobre',
          icon: 'fa fa-question-circle'
        },
      ]
    }
  },
  name: 'SmugLoader'
  }
</script>

<style>
  /* CSS */
</style>
