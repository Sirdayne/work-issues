<template lang="pug">
.container-upload
  .img-container(v-if="user.imageByte && !form.base")
    img(:src="user.imageByte")
  .img-container(v-if="form.base")
    img(:src="form.base")
  .file-upload
    input(type="file", id="upload", accept=".png, .jpg, .jpeg", @change="readFile()")

  el-button(v-if="form.base", type="primary", @click="postAva()") Загрузить
  el-alert(v-else, :title="alertTitle", :type="alertType", :closable="false", show-icon, style="width: 100%")

</template>

<script>
import http from 'lib/httpQueryV2'
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'
import nprogress from 'lib/NProgress';

export default {
  props: [
    "user",
  ],
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  data() {
    return {
      form: {
        base: null,
      },
      endpoint: 'SaveUserImage/',
      alertType: 'warning',
      alertTitle: 'Выберите аватар',
      validation: {
        maxSize: 1000000,
        types: ['image/png', 'image/jpeg', 'image/jpg'],
      },
    }
  },
  methods: {
    postAva() {
      let endpoint = this.endpoint + this.$root.context.organization;
      let data = {
        id: this.user.id,
        imageByte: this.form.base
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
      this.alertType = 'warning'
      this.alertTitle = 'Выберите аватар'
      this.form.base = null
      if (this.validation.types.includes(file.files[0].type)){
        if (file.files[0].size <= this.validation.maxSize){
          nprogress.start()
          this.refresh()
          let here = this
          var reader = new FileReader();
          reader.onload = function(event) {
            here.form.base = event.target.result
            nprogress.done()
          };
          reader.readAsDataURL(file.files[0]);
//          let filename = file.value;
//          filename = filename.replace(/\\/g, "/").split('/').pop();
//          this.fileName = filename
        } else {
          this.alertType = 'error'
          this.alertTitle = 'Размер не должен превышать 1 мб'
          this.refresh()
        }
      } else {
        this.alertType = 'error'
        this.alertTitle = 'Недопустимый формат файла, выберите *.png/*.jpg'
        this.refresh()
      }

    },
    refresh(){
      this.form.base = null
      this.$root.loadUserProfile()
//      this.fileName = null
    },
  }
}

</script>

<style lang="stylus" scoped>
.container-upload
  padding 5px 0

.img-container
  width 100%

  img
    max-width 150px
    max-height 150px

.file-upload
  width 100%
  margin-bottom 10px

</style>

