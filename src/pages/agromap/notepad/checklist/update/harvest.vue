<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  el-form(label-width="200px", label-position="left")
    el-form-item(v-if="false", label="Задание")
      el-select(v-model="form.areaAssignmentId", clearable, filterable)
        el-option(
        v-for="a in assignments",
        :key="a.id",
        :label="a.subOperationName",
        :value="a.id"
        )

    el-form-item(label="Контрольной обмолот(ц/га)")
      el-input-number(v-model="form.thrashingControl")

    el-form-item(label="Влажность почвы")
      el-input-number(v-model="form.grainMoisture")

    el-form-item(label="Потери за жаткой/подборщиком")
      el-input-number(v-model="form.headerLosses")

    el-form-item(label="Потери за молотилкой(за решетами)")
      el-input-number(v-model="form.thrashingLosses")

    el-form-item(label="Прогнозируемы остатки на поле")
      el-input-number(v-model="form.fieldForecastedBalances")

    el-form-item(label="Дробление зерна(настройка барабана)")
      el-input-number(v-model="form.grainCrushing")

    el-form-item(label="Измельчение соломы")
      el-input-number(v-model="form.strawChopping")

    el-form-item(label="Равномерность распределения измельченной соломы")
      el-switch(v-model="form.strawChoppingDistributionUniform", on-text="", off-text="")

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
    }
  },
  components: {
    Threats,
  },
  data() {
    return {
      assignments: [],
      loading: true,
      endpoint: "HarvestCheckList/",
    }
  },
  created() {
    this.updateThreatForEdit()
    fetchEntities([
      "assignments",
    ], this.afterFetch );
  },
  computed: {

  },
  methods: {
    afterFetch(){
      this.assignments = fromVuex("assignments")
      this.loading = false
    },
    formPut(){
      let endpoint = this.endpoint + this.$root.context.organization;
      this.loading = true
      this.checkThreats()
      http.put(endpoint, this.form).then(() => {
        this.loading = false
        EventBus.$emit("checklistChanged")
      });
    },
  }
}

</script>

<style>

</style>
