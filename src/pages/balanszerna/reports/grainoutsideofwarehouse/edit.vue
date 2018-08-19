<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  el-form(label-width="200px", label-position="left")
    el-form-item(label="Место разгрузки")
      el-select(v-model="form.storageId", clearable, filterable)
        el-option(
        v-for="item in storages",
        :key="item.id",
        :label="item.name",
        :value="item.id"
        )
    el-form-item(label="Дата закладки")
      el-date-picker(v-model="form.dateBookmark", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Культура")
      el-select(v-model="form.cultureId", clearable, filterable)
        el-option(
        v-for="item in cultures",
        :key="item.id",
        :label="item.name",
        :value="item.id"
        )
    el-form-item(label="Год урожая")
      el-input(v-model="form.cropYear")
    el-form-item(label="Поле")
      el-select(v-model="form.fieldId", clearable, filterable)
        el-option(
        v-for="item in fields",
        :key="item.id",
        :label="item.newName",
        :value="item.id"
        )
    el-form-item(label="Влажность %")
      el-input(v-model="form.humidity")
    el-form-item(label="Запах")
      el-select(v-model="form.qualityTypeValueCodeId", clearable, filterable)
        el-option(
        v-for="item in qualitytypevaluecodes",
        :key="item.id",
        :label="item.name",
        :value="item.id"
        )
    el-form-item(label="Автомобиль")
      el-select(v-model="form.carId", clearable, filterable)
        el-option(
        v-for="item in cars",
        :key="item.id",
        :label="item.displayString",
        :value="item.id"
        )
    el-form-item(label="ФИО водителя")
      el-select(v-model="form.employeeId", clearable, filterable)
        el-option(
        v-for="item in employees",
        :key="item.id",
        :label="item.fullName",
        :value="item.id"
        )
    el-form-item(label="Пользователь")
      el-select(v-model="form.cropBalanceUserId", clearable, filterable)
        el-option(
        v-for="item in cropbalanceusers",
        :key="item.id",
        :label="item.userName",
        :value="item.id"
        )
    el-button(type="primary", :loading="loading", @click="formPut") Изменить
</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import {EventBus} from "services/EventBus"
import moment from "moment"

export default {
  mixins: [
    
  ],
  props: {
    "form": {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      grainoutsideofwarehouse: [],
      storages: [],
      cultures: [],
      fields: [],
      qualitytypevaluecodes: [],
      cars: [],
      employees: [],
      cropbalanceusers: [],
      loading: true,
      endpoint: "GrainOutsideOfWarehouse",
    }
  },
  created() {
    this.loading = true
    fetchEntities([
      "storages",
      "cultures",
      "fields",
      "qualitytypevaluecodes",
      "cars",
      "employees",
      "cropbalanceusers"
    ], this.afterFetch );
  },
  methods: {
    afterFetch(){
      this.storages = fromVuex("storages")
      this.cultures = fromVuex("cultures")
      this.fields = fromVuex("fields")
      this.qualitytypevaluecodes = fromVuex("qualitytypevaluecodes")
      this.cars = fromVuex("cars")
      this.employees = fromVuex("employees")
      this.cropbalanceusers = fromVuex("cropbalanceusers")
      this.loading = false
    },
    formPut() {
      let endpoint = this.endpoint
      this.loading = true
      this.form.dateBookmark = moment(this.form.dateBookmark).format("YYYY-MM-DDTHH:mm:ss")
      http.put(endpoint, this.form).then(() => {
        EventBus.$emit("GrainOutsideOfWarehouseChanged")
      }).catch(() => this.loading = false)
    },
  }
}

</script>
