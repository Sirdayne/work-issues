<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Чек-лист Химия

  el-form(label-width="200px", label-position="left", v-if="ready")
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

    el-form-item(label="Чистота и промывка бака, предбака, форсунки, фильтров")
      el-switch(v-model="form.isCleaningDone", on-text="", off-text="")

    el-form-item(label="Цвет форсунки")
      el-select(v-model="form.nozzleType.nozzleColor", clearable, filterable)
        el-option(
        v-for="n in nozzleColor",
        :key="n.id",
        :label="n.name",
        :value="n.id"
        )

    el-form-item(label="Десятичное число форсунки")
      el-input-number(v-model="form.nozzleType.decimalNumber")

    el-form-item(label="Число факелов форсунки")
      el-input-number(v-model="form.nozzleType.torchCount")

    el-form-item(label="Высота штанги(см)")
      el-input-number(v-model="form.boomHeight")

    el-form-item(label="Равномерность покрытия капель")
      el-switch(v-model="form.isDropletsCoatingUniform", on-text="", off-text="")

    el-form-item(label="Давление")
      el-input-number(v-model="form.pressure")

    el-form-item(label="Скорость ветра(км/ч)")
      el-input-number(v-model="form.windSpeed")

    el-form-item(label="Направление ветра")
      el-select(v-model="form.windDirection", clearable, filterable)
        el-option(
          v-for="w in windDirection",
          :key="w.id",
          :label="w.name",
          :value="w.id"
        )

    el-form-item(label="Наличие росы")
      el-switch(v-model="form.dewy", on-text="", off-text="")

    el-form-item(label="PH воды")
      el-input-number(v-model="form.waterPH")

    el-form-item(label="Время наполнения стакана 2 л")
      el-input-number(v-model="form.glassFillingTime")

    el-form-item(label="Отсутствие использованной тары на земле")
      el-select(v-model="form.usedPackagingAbsence", clearable, filterable)
        el-option(
          v-for="u in usedPackagingAbsence",
          :key="u.id",
          :label="u.name",
          :value="u.id"
        )

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
    props: ['assignmentId'],
    components: {
      Threats,
    },
    data() {
      return {
        form: {
          areaAssignmentId: null,
          checkListType: 1,
          isCleaningDone: false,
          nozzleType: {
            nozzleColor: null,
            decimalNumber: null,
            torchCount: null,
          },
          boomHeight: null,
          isDropletsCoatingUniform: false,
          pressure: null,
          windSpeed: null,
          windDirection: null,
          dewy: false,
          waterPH: null,
          glassFillingTime: null,
          usedPackagingAbsence: null,
          rowsStraight: false,
          omissions: false,
          fieldsThreat: {},
        },
        assignments: [],
        windDirection: [],
        usedPackagingAbsence: [],
        nozzleColor: [],
        loading: true,
        endpoint: 'ChemicalCheckList/',
      }
    },
    created() {
      this.form.areaAssignmentId = this.assignmentId
      this.fetchEntities([
        'assignments',
        'windDirection',
        'usedPackagingAbsence',
        'nozzleColor',
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
        this.assignments = this.fromVuex('assignments')
        this.windDirection = this.fromVuex('windDirection')
        this.usedPackagingAbsence = this.fromVuex('usedPackagingAbsence')
        this.nozzleColor = this.fromVuex('nozzleColor')
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
        this.form.checkListType = 1
        this.form.fieldsThreat = {}
        this.form.isCleaningDone = false
        this.form.isDropletsCoatingUniform = false
        this.form.dewy = false
        this.form.rowsStraight = false
        this.form.omissions = false
        this.form.nozzleType = {}
        this.form.nozzleType.nozzleColor = null
        this.form.nozzleType.decimalNumber = null
        this.form.nozzleType.torchCount =  null
      },
    }
  }

</script>

<style>

</style>
