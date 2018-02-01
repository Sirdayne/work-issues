import Vue from 'vue'
import injector from 'vue-inject'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import ElementUI from 'element-ui'

import 'normalize.css'
import 'element-ui/lib/theme-default/index.css'
import locale from 'element-ui/lib/locale/lang/ru-RU'
import './misc/patches.styl'

import App from './App.vue'
import routes from './routes'

import Auth  from './services/Auth'
import Crypt from './services/Crypt'

var VueScrollTo = require('vue-scrollto');

import { store } from './store/store';

require('./components/FormFieldsLibrary/_FormFieldsService');

Vue.use(injector)
Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(ElementUI, {
  locale
})

Vue.use(VueScrollTo, {
  container: ".dashboard-page",
  duration: 500,
  easing: "ease",
  offset: -80,
  cancelable: true,
  onDone: false,
  onCancel: false
});

const router = new VueRouter({
  mode: 'hash',
  linkActiveClass: 'active',
  routes
})

Vue.use(Crypt)
Vue.use(Auth, {
  router,
  crypt: Crypt
})

new Vue({
  router,
  store,
  ...App,
}).$mount('#app')
