import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'

import 'normalize.css'
import 'element-ui/lib/theme-default/index.css'
import locale from 'element-ui/lib/locale/lang/ru-RU'
import './misc/patches.styl'
import './misc/eleme.styl'
import './misc/fx-elements.styl'

import App from './App.vue'
import routes from './routes'

import { store } from './store/store';

const AppConstructor = Vue.extend(App);


Vue.use(VueRouter)
Vue.use(ElementUI, {
  locale
})

const router = new VueRouter({
  mode: 'hash',
  linkActiveClass: 'active',
  routes
})

import Auth from 'services/Auth'
router.beforeEach((to, from, next) => {
  let isRoleOk = !to.meta.role || Auth.getProfile() && Auth.getProfile().roles.includes(to.meta.role)
  if ((Auth.isAuthenticated() || to.meta.login) && isRoleOk) {
    document.title = to.meta.title ? to.meta.title + ' - AgroStream' : 'AgroStream'
  }
  if (to.meta.auth !== false && !Auth.isAuthenticated()) {
    next('/login')
  } else if (to.meta.login && Auth.isAuthenticated()) {
    next('/')
  } else if (to.meta.role) {
    isRoleOk ? next() : next(new Error("Недостаточно прав"))
  } else {
    next()
  }
})
router.onError(err => {
  alert(err)
})

new AppConstructor({
  store,
  router,
  el: '#app',
})

if (module.hot) {
  module.hot.accept()
}
