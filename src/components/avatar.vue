<template lang="pug">
.container-upload
  .img-container(v-if="user.imageByte && !form.base")
    img(:src="user.imageByte")
  .img-container(v-if="form.base")
    img(:src="form.base")
  .upload-avatar
    input(type="file", id="upload-ava", accept=".png, .jpg, .jpeg", @change="readFile()")
  el-button(:loading="loading", type="primary", @click="postAva()") Загрузить

</template>

<script>
import http from "services/http"
import ListController from "mixins/ListController"
import nprogress from "lib/NProgress";

export default {
  props: {
    "user": {
      type: Object,
      default: {},
    },
  },
  mixins: [
    ListController
  ],
  data() {
    return {
      form: {
        base: null,
      },
      endpoint: "SaveUserImage/",
      validation: {
        maxSize: 1000000,
        types: ["image/png", "image/jpeg", "image/jpg"],
      },
      loading: false
    }
  },
  methods: {
    postAva() {
      if (this.form.base) {
        let endpoint = this.endpoint + this.$root.context.organization;
        let data = {
          id: this.user.id,
          imageByte: this.form.base
        }
        this.loading = true
        http.post(endpoint, data).then(() => {
          this.refresh();
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({
          message: `Выберите аватар!`,
          type: "warning",
          duration: 1500,
          showClose: false,
        });
      }
    },
    readFile() {
      let file = document.getElementById("upload-ava")
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
        } else {
          this.$message({
            message: `Размер не должен превышать 1 мб`,
            type: "error",
            duration: 1500,
            showClose: false,
          });
          this.refresh()
        }
      } else {
        this.$message({
          message: `Недопустимый формат файла, выберите *.png/*.jpg`,
          type: "error",
          duration: 1500,
          showClose: false,
        });
        this.refresh()
      }

    },
    refresh(){
      this.form.base = null
      this.$root.loadUserProfile()
      this.loading = false
    },
  }
}

</script>

<style lang="stylus" scoped>
.container-upload
  max-width 400px
  width calc(100%)
  padding 0

.img-container
  width 100%

  img
    max-width 150px
    max-height 150px

.upload-avatar
  width 100%
  margin-bottom 10px
</style>

