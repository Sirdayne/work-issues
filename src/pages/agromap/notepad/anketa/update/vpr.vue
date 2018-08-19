<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 ВПР

  el-form(label-width="200px", label-position="left")
    el-form-item(label="Температура воздуха (C)")
      el-input-number(v-model="form.airTemp")
    el-form-item(label="Температура почвы (C)")
      el-input-number(v-model="form.soilTemp")
    el-form-item(label="Глубина промачивания (см)")
      el-input-number(v-model="form.soakingDepth")
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

    el-button(type="primary", :loading="loading", @click="formPut") Изменить
</template>

<script>
import http from "services/http"
import {EventBus} from "services/EventBus"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import threatsMixin from "pages/agromap/notepad/threatsMixin"
import Threats from "pages/agromap/notepad/threats"

export default {
  mixins: [
    
    ListController,
    threatsMixin
  ],
  props: {
    "form": {
      type: Object,
      default: {},
    },
  },
  components: {
    Threats,
  },
  data() {
    return {
      windDirection: [],
      loading: true,
      endpoint: "FieldSurveys/",
    }
  },
  created() {
    this.form.fieldId = this.$root.context.field
    this.updateThreatForEdit()
    fetchEntities([
      "windDirection",
    ], this.afterFetch );
  },
  computed: {

  },
  methods: {
    afterFetch(){
      this.windDirection = fromVuex("windDirection")
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
