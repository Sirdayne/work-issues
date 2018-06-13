<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Анкета Сев

  el-form(label-width="200px", label-position="left", v-if="ready")
    el-form-item(label="Температура воздуха (C)")
      el-input-number(v-model="form.airTemp")
    el-form-item(label="Температура почвы (C)")
      el-input-number(v-model="form.soilTemp")
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

    el-form-item(label="Прямолинейность рядков")
      el-switch(v-model="form.rowsStraight", on-text="", off-text="")
    el-form-item(label="Пропуски")
      el-switch(v-model="form.omissions", on-text="", off-text="")


    threats(:threat="threat")

    el-button(type="primary", :loading="loading", @click="formPost") Создать
</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'
  import nprogress from 'lib/NProgress'
  import { Message } from 'element-ui'
  import threatsMixin from 'components/agromap/notepad/threatsMixin'
  import Threats from 'components/agromap/notepad/threats'

  export default {
    mixins: [
      RecordsLoaderV2,
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
          workSeason: 2,
          airTemp: null,
          soilTemp: null,
          soilMoisture: null,
          windDirection: null,
          windSpeed: null,
          precipitationCount: null,
          rowsStraight: false,
          omissions: false,
          fieldsThreat: {},
        },
        windDirection: [],
        loading: true,
        endpoint: 'FieldSurveys/',
      }
    },
    created() {
      this.form.fieldId = this.$root.context.field
      this.fetchEntities([
        'windDirection',
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
        this.windDirection = this.fromVuex('windDirection')
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
        this.form.workSeason = 2
        this.form.fieldsThreat = {}
      },
    }
  }

</script>

<style>

</style>
