<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Сев

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

    el-button(type="primary", :loading="loading", @click="formPut") Изменить
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
    props: ['form'],
    components: {
      Threats,
    },
    data() {
      return {
        windDirection: [],
        loading: true,
        endpoint: 'FieldSurveys/',
      }
    },
    created() {
      this.form.fieldId = this.$root.context.field
      this.updateThreatForEdit()
      this.fetchEntities([
        'windDirection',
      ], this.afterFetch );
    },
    computed: {

    },
    methods: {
      afterFetch(){
        this.windDirection = this.fromVuex('windDirection')
        this.loading = false
      },
      formPut(){
        let endpoint = this.endpoint + this.$root.context.organization;
        this.loading = true
        this.checkThreats()
        http.put(endpoint, this.form).then(() => {
          this.loading = false
          EventBus.$emit("anketaChanged")
        });
      },
    }
  }

</script>

<style>

</style>
