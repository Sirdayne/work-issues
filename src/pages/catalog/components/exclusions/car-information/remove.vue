<template lang="pug">
div
  el-button(type="primary", @click="formDelete") Да
  el-button(type="error", @click="closeDialogs") Отмена

</template>

<script>
import http from "services/http"
import ListController from "mixins/ListController"
import carInformation from "./carInformation"
import {EventBus} from "services/EventBus"
import nprogress from "lib/NProgress"

export default {
  props: {
    "id": {
      type: Number,
      default: null,
    },
  },
  mixins: [
    ListController,
    carInformation,
  ],
  data() {
    return {
      endpoint: "carInformation/",
    }
  },
  methods: {
    formDelete(){
      let endpoint = this.endpoint;
      nprogress.start()
      http.delete(endpoint, this.id).then(() => {
        EventBus.$emit("CatalogStaticCarInformationChanged")
        nprogress.done()
      });
    },
    closeDialogs() {
      EventBus.$emit("CatalogStaticDialogsClose")
    }
  }
}

</script>
