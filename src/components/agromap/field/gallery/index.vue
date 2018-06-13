<template lang="pug">
.field-container(v-loading="loading", element-loading-text="Загружается...")
  div
    el-form(style="margin-top: 20px")
      el-form-item
        el-button(type="primary", @click="openDialogCreate") Добавить фото
    h2 Галерея
    el-dialog(v-if='dialogvisibleImage', :visible.sync="dialogvisibleImage", title="Картинка", size="large", :close-on-click-modal="true")
      .dialog-photo
        img(:src="chosenImage.url")
        h3(v-if="false") {{ chosenImage.image }}
        h4 {{ chosenImage.createDate }}
    el-dialog(v-if='dialogvisibleCreate', :visible.sync="dialogvisibleCreate", title="Добавить фото", :close-on-click-modal="true")
      el-form(label-width="140px")
        el-form-item(v-if="form.data", label="Фото")
          img(:src="form.data", class="gallery-small-img")
        el-form-item
          input(type="file", id="upload-create", accept=".png, .jpg, .jpeg", @change="readFile('upload-create')")
        el-form-item
          el-button(type="primary", @click="formPost") Создать
    .gallery
      .gallery-photo(v-for="image in formatImages")
        img(:src="image.url", @click="openDialogImage(image.url)")
        h3(v-if="false")  {{ image.author }}
        h4 {{ image.createDate }}

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import moment from 'moment'
  import ListController from 'mixins/ListController'
  import nprogress from 'lib/NProgress'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        form: {
          fieldId: null,
          organizationId: this.$root.context.organization,
          data: null
        },
        images: [],
        chosenImage: {},
        dialogvisibleCreate: false,
        dialogvisibleImage: false,
        validation: {
          maxSize: 1000000,
          types: ['image/png', 'image/jpeg', 'image/jpg'],
        },
        loading: true,
      }
    },
    computed: {
      formatImages() {
        let array = []
        if (this.images.length > 0){
          this.images.forEach(image => {
            array.push(image)
          })
        }
        return array
      },
      fieldId() {
        let fieldId = this.$root.context.field
        this.form.fieldId = fieldId
        if (fieldId){
          return fieldId
        }
        return null
      },
    },
    created() {
      this.form.fieldId = this.$root.context.field
      this.fields = this.$root.fields
      this.getImages()
    },
    methods: {
      refresh(){
        this.loading = true
        this.hideDialogs()
        this.nullForm()
        this.getImages()
      },
      getImages(){
        let endpoint = `/Files/` + this.$root.context.organization
        http.get(endpoint)
          .then(data => {
            if (data) {
              this.images = data
              this.loading = false
            }
            nprogress.done()
          })
          .catch((error) => {
            nprogress.done()
            this.$message({
              message: `Ошибка ${error}`,
              type: "info",
              duration: 5000,
              showClose: false,
            });
          })
      },
      openDialogImage(url){
        this.dialogvisibleImage = true
        let image = this.images.find(img => img.url == url)
        this.chosenImage = image
      },
      openDialogCreate(){
        this.dialogvisibleCreate = true
      },
      hideDialogs() {
        this.dialogvisibleImage = false
        this.dialogvisibleCreate = false
      },
      nullForm(){
        for (let item in this.form){
          if (item != 'fieldId' || item !='organizationId'){
            this.form[item] = null
          }
        }
      },
      formPost(){
        let endpoint = `/Files/`;
        let removeAllBeforeCommaData = this.form.data.slice(this.form.data.indexOf(',') + 1, this.form.data.length)
        this.form.data = removeAllBeforeCommaData
        http.post(endpoint, this.form).then(() => {
          this.refresh()
        });
      },
      readFile(id) {
        let file = document.getElementById(id)
        this.form.data = null
        if (this.validation.types.includes(file.files[0].type)){
          if (file.files[0].size <= this.validation.maxSize){
            this.form.data = null
            nprogress.start()
            let here = this
            var reader = new FileReader();
            reader.onload = function(event) {
              here.form.data = event.target.result
              nprogress.done()
            };
            reader.readAsDataURL(file.files[0]);
          } else {
            Message({
              message: 'Размер не должен превышать 1 мб',
              type: "error",
              duration: 5000,
              showClose: false,
            })
          }
        } else {
          Message({
            message: 'Недопустимый формат файла, выберите *.png/*.jpg',
            type: "error",
            duration: 5000,
            showClose: false,
          })
        }
      },
    }
  }

</script>

<style lang="stylus" scoped>
.gallery-photo, .dialog-photo
  float left
  width calc(50% - 40px)
  margin 20px
  img
    box-sizing border-box
    box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.2);
    height 350px
    width 100%
    object-fit cover
    cursor pointer
  h3, h4
    float left
    width auto
    margin 10px 0
    font-size 14px
    font-weight 100
  h4
    float right

.dialog-photo
  width 100%
  margin 0  0 20px 0
  img
    height 700px
    cursor default

.gallery-small-img
  max-height 250px
  max-width 250px
</style>
