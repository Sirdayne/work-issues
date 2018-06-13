<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Чек-лист Уборка

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

    el-form-item(label="Контрольной обмолот(ц/га)")
      el-input-number(v-model="form.thrashingControl")

    el-form-item(label="Влажность зерна")
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
          checkListType: 4,
          thrashingControl: null,
          grainMoisture: null,
          headerLosses: null,
          thrashingLosses: null,
          fieldForecastedBalances: null,
          grainCrushing: null,
          strawChopping: null,
          strawChoppingDistributionUniform: false,
          fieldsThreat: {},
        },
        assignments: [],
        loading: true,
        endpoint: 'HarvestCheckList/',
      }
    },
    created() {
      this.form.areaAssignmentId = this.assignmentId
      this.fetchEntities([
        'assignments',
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
        this.form.checkListType = 4
        this.form.fieldsThreat = {}
        this.form.strawChoppingDistributionUniform = false
      },
    }
  }

</script>

<style>

</style>
