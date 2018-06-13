import nprogress from 'lib/NProgress'
import { Message } from 'element-ui'

export default {
  data() {
    return {
      validation: {
        maxSize: 1000000,
        types: ['image/png', 'image/jpeg', 'image/jpg'],
      },
    }
  },
  methods: {
    readFile(id) {
      let file = document.getElementById(id)
      this.form.imageBytes = null
      if (this.validation.types.includes(file.files[0].type)){
        if (file.files[0].size <= this.validation.maxSize){
          this.form.imageBytes = null
          nprogress.start()
          let here = this
          var reader = new FileReader();
          reader.onload = function(event) {
            here.form.imageBytes = event.target.result
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
