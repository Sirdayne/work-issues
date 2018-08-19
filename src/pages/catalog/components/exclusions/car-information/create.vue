<template lang="pug">
el-form(label-width="140px")
  el-form-item(label="Машина:")
    el-select(v-model="form.carId", clearable, filterable)
      el-option(
        v-for="item in cars",
        :label="item.displayString",
        :value="item.id",
        :key="item.id",
      )
  el-form-item(label="Хоз номер")
    el-input(v-model="form.businessNumber")
  el-form-item(v-if="form.imageBytes",label="Фото")
    img(:src="form.imageBytes", class="car-image")
  el-form-item
    input(type="file", id="upload-create", accept=".png, .jpg, .jpeg", @change="readFile('upload-create')")
  el-form-item(label="Год выпуска")
    el-input(v-model="form.year")
  el-form-item(label="Номер двигателя")
    el-input(v-model="form.engineNumber")
  el-form-item(label="Средняя производительность")
    el-input(v-model="form.productivityAverage")
  el-form-item
    el-button(type="primary", @click="formPost") Создать

</template>

<script>
import http from "services/http"
import ListController from "mixins/ListController"
import carInformation from "./carInformation"
import {EventBus} from "services/EventBus"

export default {
  props: {
    "form": {
      type: Object,
      default: {},
    },
    "cars": {
      type: Array,
      default: [],
    }
  },
  mixins: [
    ListController,
    carInformation,
  ],
  data() {
    return {
      endpoint: `carInformation/${this.$root.context.organization}`,
    }
  },
  methods: {
    formPost(){
      let endpoint = this.endpoint;
      http.post(endpoint, this.form).then(() => {
        EventBus.$emit("CatalogStaticCarInformationChanged")
      });
    },
  }
}

</script>

<style scoped>
.car-image{
  max-height: 150px;
  max-width: 150px;
}
.el-dialog__body .el-input{
  max-width: 217px;
}
</style>
