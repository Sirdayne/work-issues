<template lang="pug">
div
  el-button(type="primary", @click="formDelete") Да
  el-button(type="error", @click="closeDialogs") Отмена

</template>

<script>
import http from "services/http"
import ListController from "mixins/ListController"
import {EventBus} from "services/EventBus"
import nprogress from "lib/NProgress"

export default {
  props: {
    "id": {
      type: Number,
      default: null,
    },
    "endpoint": {
      type: String,
      default: "",
    },
  },
  mixins: [
    ListController,
  ],
  methods: {
    formDelete(){
      nprogress.start()
      http.delete(this.endpoint, this.id).then(() => {
        EventBus.$emit("checklistChanged")
        nprogress.done()
      });
    },
    closeDialogs() {
      EventBus.$emit("checklistDialogsClose")
    }
  }
}

</script>
