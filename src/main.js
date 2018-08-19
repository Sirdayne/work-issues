import Vue from "vue"
import App from "./App.vue"
import {store} from "./store/store";
import {router} from "./router.js";
import "./ui.js"

const AppConstructor = Vue.extend(App);
new AppConstructor({
  store,
  router,
  el: "#app",
})

if (module.hot) {
  module.hot.accept()
}
