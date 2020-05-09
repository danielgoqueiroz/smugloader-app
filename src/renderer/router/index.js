import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: require('@/components/Welcome').default
    },
    {
      path: '/albuns',
      name: 'Albums',
      component: require('@/components/Albuns/Albuns').default
    },
    {
      path: '/configuration',
      name: 'Configuração',
      component: require('@/components/Configuration/Configuration').default
    },
    {
      path: '/sobre',
      name: 'Sobre',
      component: require('@/components/About/About').default
    },
  ]
})
