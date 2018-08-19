<template lang="pug">
.container-upload
  h3 Загрузка полигона
  el-form
    el-form-item
      .file-upload
        input(type="file", id="upload", accept=".kml", @change="readFile()")
        .file-name
          p Выберите или перетащите kml файл
          p(v-if="fileName") Имя файла: {{ fileName }}
          p(v-else) ...

    el-form-item
      el-button(:loading="loadingBtn", type="primary", @click="validateKml()") Загрузить

</template>

<script>
import {EventBus} from "services/EventBus"
import http from "services/http"
import ListController from "mixins/ListController"
import MapCutPolygonMixin from "components/map/MapCutPolygonMixin"

export default {
  mixins: [
    ListController,
    MapCutPolygonMixin
  ],
  props: {
    "fieldId": {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      upload: null,
      fileName: null,
      endpoint: "kml/",
      loading: false,
      loadingBtn: false,
    }
  },
  methods: {
    readFile() {
      //readFile($event) - html
      //readFile(event) - function
      //let file = event.target.files[0]
      let file = document.getElementById("upload")
      var reader = new FileReader();
      reader.onload = (event) => {
        this.upload = event.target.result
      };
      reader.readAsText(file.files[0]);
      let filename = file.value;
      filename = filename.replace(/\\/g, "/").split("/").pop();
      this.fileName = filename
    },
    validateKml() {
      if (this.fieldId && this.upload) {
        this.postKml()
      } else {
        this.$message({
          message: "Выберите поле и выберите файл",
          type: "warning",
          duration: 5000,
          showClose: false,
        })
      }
    },
    postKml() {
      let endpoint = this.endpoint + this.$root.context.organization
      let data = {
        fieldId: this.fieldId,
        kml: this.upload,
      }
      this.loadingBtn = true
      http.post(endpoint, data)
        .then(() => {
          this.$message({
            message: "Полигон добавлен",
            type: "success",
            duration: 5000,
            showClose: false,
          })
          EventBus.$emit("MapClearLocalForageForLeafletFields")
          this.refresh();
        })
        .catch((error) => {
          this.refresh()
          if (error.response.status === 409){
            EventBus.$emit("MapCutPolygonOpenDialog", error.response)
          }
        })
    },
    refresh(){
      this.loadingBtn = false
    },
  }
}

</script>

