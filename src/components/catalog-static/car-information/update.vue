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
  el-form-item(label="Фото")
    img(v-if="form.imageBytes", :src="form.imageBytes", class="car-image")
    input(type="file", id="upload-edit", accept=".png, .jpg, .jpeg", @change="readFile('upload-edit')")
  el-form-item(label="Год выпуска")
    el-input(v-model="form.year")
  el-form-item(label="Номер двигателя")
    el-input(v-model="form.engineNumber")
  el-form-item(label="Средняя производительность")
    el-input(v-model="form.productivityAverage")
  el-form-item
    el-button(type="primary", @click="formPut") Сохранить

</template>

<script>
  import http from 'lib/httpQueryV2'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import carInformation from './carInformation'
  import {EventBus} from 'services/EventBus'

  export default {
    props: ['form', 'cars', 'id'],
    mixins: [
      RecordsLoaderV2,
      ListController,
      carInformation,
    ],
    data() {
      return {
        endpoint: `carInformation/${this.$root.context.organization}`,
      }
    },
    methods: {
      formPut(){
        let endpoint = this.endpoint;
        let data = Object.assign({}, this.form)
        data.id = this.id
        http.put(endpoint, data).then(() => {
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