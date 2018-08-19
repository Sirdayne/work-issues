<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Анкета Пар

  el-form(label-width="200px", label-position="left")
    el-form-item(label="Температура воздуха (C)")
      el-input-number(v-model="form.airTemp")
    el-form-item(label="Влажность почвы (%)")
      el-input-number(v-model="form.soilMoisture")
    el-form-item(label="Направление ветра")
      el-select(v-model="form.windDirection", clearable, filterable)
        el-option(
          v-for="w in windDirection",
          :key="w.id",
          :label="w.name",
          :value="w.id"
        )
    el-form-item(label="Скорость ветра (км/ч)")
      el-input-number(v-model="form.windSpeed")
    el-form-item(label="Количество осадков (мм)")
      el-input-number(v-model="form.precipitationCount")

    threats(:threat="threat")

    el-button(type="primary", :loading="loading", @click="formPost") Создать
</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import threatsMixin from "pages/agromap/notepad/threatsMixin"
import Threats from "pages/agromap/notepad/threats"

export default {
  mixins: [

    ListController,
    threatsMixin
  ],
  components: {
    Threats,
  },
  data() {
    return {
      form: {
        fieldId: null,
        workSeason: 5,
        airTemp: null,
        soilMoisture: null,
        windDirection: null,
        windSpeed: null,
        precipitationCount: null,
        fieldsThreat: {},
      },
      windDirection: [],
      loading: true,
      endpoint: "FieldSurveys/",
    }
  },
  created() {
    this.form.fieldId = this.$root.context.field
    fetchEntities([
      "windDirection",
    ], this.afterFetch );
  },
  computed: {
    fieldId() {
      let fieldId = this.$root.context.field
      this.form.fieldId = fieldId
      if (fieldId){
        return fieldId
      }
      return null
    },
  },
  methods: {
    afterFetch(){
      this.windDirection = fromVuex("windDirection")
      this.loading = false
    },
    refresh() {
      this.nullForm()
    },
    formPost(){
      let endpoint = this.endpoint + this.$root.context.organization;
      this.loading = true
      this.checkThreats()
      http.post(endpoint, this.form).then(() => {
        this.loading = false
        this.refresh();
      })
    },
    nullForm(){
      for (let item in this.form){
        this.form[item] = null
      }
      this.nullThreats()
      this.form.fieldId = this.fieldId
      this.form.workSeason = 5
      this.form.fieldsThreat = {}
    },
  }
}

</script>

<style>

</style>
