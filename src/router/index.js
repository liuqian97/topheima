import Vue from 'vue'
import Router from 'vue-router'
import login from '@/views/login'
import home from '@/views/home'
import tabbar from '@/views/tabbar'

Vue.use(Router)

export default new Router({
  routes: [
    {
      name: 'login',
      path: '/login',
      component: login
    },
    {
      path: '/',
      component: tabbar,
      children: [
        {
          name: 'home',
          path: '',
          component: home
        }
      ]
    }
  ]
})
