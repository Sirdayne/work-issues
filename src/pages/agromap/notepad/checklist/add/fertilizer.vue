<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Чек-лист Удобрения

  el-form(label-width="200px", label-position="left")
    el-form-item(label="Задание №")
      .auto-p {{ form.areaAssignmentId }}

    el-form-item(v-if="false", label="Задание")
      el-select(v-model="form.areaAssignmentId", clearable, filterable)
        el-option(
        v-for="a in assignments",
        :key="a.id",
        :label="a.subOperationName",
        :value="a.id"
        )

    el-form-item(label="Незаделанные удобрения")
      el-switch(v-model="form.unfinishedFertilizer", on-text="", off-text="")

    el-form-item(label="Глубина заделки удобрения")
      el-input-number(v-model="form.fertilizerDepth")

    el-form-item(label="Прямолинейность рядков")
      el-switch(v-model="form.rowsStraight", on-text="", off-text="")

    el-form-item(label="Величина стыковых междурядий")
      el-input-number(v-model="form.buttSpacingValue")

    el-form-item(label="Гребнистость")
      el-input-number(v-model="form.combing")

    el-form-item(label="Направление сева по отношению к предудущей обработке почвы")
      el-select(v-model="form.direction", clearable, filterable)
        el-option(
          v-for="d in direction",
          :key="d.id",
          :label="d.name",
          :value="d.id"
        )

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
  props: {
    "assignmentId": {
      type: Number,
      default: null,
    },
  },
  components: {
    Threats,
  },
  data() {
    return {
      form: {
        areaAssignmentId: null,
        checkListType: 2,
        unfinishedFertilizer: false,
        fertilizerDepth: null,
        rowsStraight: false,
        buttSpacingValue: null,
        combing: null,
        direction: null,
        fieldsThreat: {},
      },
      assignments: [],
      direction: [],
      loading: true,
      endpoint: "FertilizerCheckList/",
    }
  },
  created() {
    this.form.areaAssignmentId = this.assignmentId
    fetchEntities([
      "assignments",
      "direction"
    ], this.afterFetch );
  },
  computed: {
    fieldId() {
      let fieldId = this.$root.context.field
      if (fieldId){
        return fieldId
      }
      return null
    },
  },
  methods: {
    afterFetch(){
      this.assignments = fromVuex("assignments")
      this.direction = fromVuex("direction")
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
      this.form.checkListType = 2
      this.form.fieldsThreat = {}
      this.form.unfinishedFertilizer = false
      this.form.rowsStraight = false
    },
  }
}

</script>

<style>

</style>
