<template lang="pug">
div(v-loading="loading", element-loading-text="Загрузка...")
  div(style="margin-bottom: 25px;") Вы хотите исключить из полигона пересечения с существующими полями?
  el-button(@click="postData", type="success") Исключить
  el-button(@click="closeDialog", type="danger") Отменить
</template>
<script>
import http from "services/http"
import {EventBus} from "services/EventBus"

export default {
  props: {
    "response": {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    postData() {
      this.loading = true
      http.post("kml/" + this.$root.context.organization, this.response.data).then(() => {
        this.loading = false
        this.closeDialog()
        this.$message({
          message: "Успешно изменено!",
          type: "success",
          duration: 3000,
          showClose: false,
        })
        EventBus.$emit("MapClearLocalForageForLeafletFields")
      }).catch(e => {
        this.loading = false
      })
    },
    closeDialog() {
      EventBus.$emit("MapCutPolygonToggleDialog", false)
    }
  }
}
</script>
