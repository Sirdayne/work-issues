<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Уход

  el-form(label-width="200px", label-position="left")
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

    el-form-item(label="Культура")
      .auto-p {{ cultureFromSeedlimits }}

    el-form-item(label="Фаза роста")
      el-select(v-model="form.phaseNumber", clearable, filterable)
        el-option(
        v-for="p in phases",
        :key="p.id",
        :label="p.phaseName",
        :value="p.id"
        )

    el-form-item(label="Стадия роста")
      el-select(v-model="form.stageNumber", clearable, filterable)
        el-option(
        v-for="s in stages",
        :key="s.id",
        :label="s.name",
        :value="s.id"
        )

    el-form-item(label="Количество растений в 1 кв.м.(шт.)")
      el-input-number(v-model="form.plantCount")
    el-form-item(label="Количество продуктивных плодов в 1 кв.м.(шт.)")
      el-input-number(v-model="form.plantFruitCount")

    el-form-item(label="Билогическая эффективность препарата(да/нет)")
      el-switch(v-model="form.isPreparationEffectively", on-text="", off-text="")
    el-form-item(label="Билогическая эффективность препарата %")
      el-input-number(v-model="form.preparationEffectivenessPercent")

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
      phases: [],
      stages: [],
      windDirection: [],
      loading: true,
      growingPhases: [],
      cultures: [],
      seedlimits: [],
      endpoint: "FieldSurveys/",
    }
  },
  watch: {
    "form.phaseNumber"(val, oldVal) {
      this.stages = []
      let phase = this.phases.find(p => p.id == val)
      if (phase) {
        for(let i in phase.stages) {
          this.stages.push({
            id: i,
            name: phase.stages[i]
          })
        }
      }
    }
  },
  created() {
    this.form.fieldId = this.$root.context.field
    this.updateThreatForEdit()
    fetchEntities([
      "windDirection",
      "cultures",
      "growingPhases",
      "seedlimits",
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
    cultureFromSeedlimits() {
      let name = "нет данных"
      let seedlimit = null
      this.phases = []
      //this.form.phaseNumber = null
      if (this.fieldId){
        seedlimit = this.seedlimits.find(s => s.fieldId == this.fieldId)
      }
      if (seedlimit){
        this.form.cultureId = seedlimit.cultureId
        let growPhase = this.growingPhases.find(gp => gp.cultureId == this.form.cultureId)
        if (growPhase) {
          for(let i in growPhase.phases){
            this.phases.push({
              id: i,
              phaseName: growPhase.phases[i].phaseName,
              stages: growPhase.phases[i].stages
            })
          }
        }
        name = seedlimit.cultureName
      }
      return name
    }
  },
  methods: {
    afterFetch(){
      this.seedlimits = fromVuex("seedlimits")
      this.cultures = fromVuex("cultures")
      this.windDirection = fromVuex("windDirection")
      this.growingPhases = fromVuex("growingPhases")
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
