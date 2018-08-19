<template lang="pug">
el-button(@click="downloadFile(url, filename)", v-loading="exportLoading", :disabled="exportLoading") {{title}}
</template>

<script>
import http from "services/http"

export default {
  props: {
    "title": {
      type: String,
      default: "",
    },
    "url": {
      type: String,
      default: "",
    },
    "filename": {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      exportLoading: false,
    }
  },
  created() {
  },
  methods: {
    downloadFile(endpoint, filename) {
      this.exportLoading = true
      http.downloadFILE(endpoint, filename).then(() => {
        this.exportLoading = false
      }).catch(() => {
        this.exportLoading = false
      })
    }
  }
}

</script>
