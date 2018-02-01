<template lang="pug">
.container-upload
  h3 Загрузка полей
  el-form
    el-form-item
      el-select(v-model="form.fieldId", clearable, filterable)
        el-option(
          v-for="f in fields",
          :key="f.id",
          :label="f.newName",
          :value="f.id"
        )
    el-form-item
      .file-upload
        input(type="file", id="upload", accept=".kml", @change="readFile()")
        .file-name
          p Выберите или перетащите kml файл
          p(v-if="fileName") Имя файла: {{ fileName }}
          p(v-else) Пусто
    el-form-item
      el-button(v-if="form.fieldId && form.upload", type="primary", @click="postKml()") Загрузить
      el-alert(v-else, title="Выберите поле и выберите файл!", type="error", :closable="false", show-icon, style="width: 300px")

</template>

<script>
import http from 'lib/httpQueryV2'
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  data() {
    return {
      form: {
        fieldId: null,
        upload: null,
      },
      fileName: null,
      fields: [],
      endpoint: 'kml/',
    }
  },
  created() {
    this.fetchEntities([
      'fields'
    ], this.afterFetch );
  },
  methods: {
    afterFetch(){
      this.fields = this.fromVuex('fields')
    },
    postKml() {
      let endpoint = this.endpoint + this.$root.context.organization;
      let data = {
        fieldId: this.form.fieldId,
        kml: this.form.upload
      };
      http.post(endpoint, data).then(() => {
        this.refresh();
      });
    },
    readFile() {
      //readFile($event) - html
      //readFile(event) - function
      //let file = event.target.files[0]
      let file = document.getElementById('upload')
      let here = this
      var reader = new FileReader();
      reader.onload = function(event) {
        here.form.upload = event.target.result
      };
      reader.readAsText(file.files[0]);
      let filename = file.value;
      filename = filename.replace(/\\/g, "/").split('/').pop();
      this.fileName = filename
    },
    refresh(){
      this.form.fieldId = null
      this.form.upload = null
      this.fetchEntities([
        'fields'
      ], this.afterFetch )
      this.loading = true
    },
  }
}

</script>

<style lang="stylus" scoped>
.container-upload
  padding 5px 15px

  h3
    margin-top 0

.file-upload
  width 300px
  height 68px
  position relative

#upload
  opacity 0
  width 100%
  height 100%
  position absolute
  top 0px
  left 0px
  cursor pointer
  z-index 5

.file-name
  border 2px dashed #ccc
  width 300px
  height 68px
  position absolute
  top 0px
  left 0px
  z-index 1

  p
    width 100%
    margin 5px 0px
    height 24px
    line-height 24px
    font-size 14px
    text-align center

</style>

