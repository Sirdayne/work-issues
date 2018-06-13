<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Чек-лист Боронование

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

    el-form-item(label="Глубина обработки")
      el-input-number(v-model="form.depth ")

    el-form-item(label="Влажность почвы")
      el-input-number(v-model="form.soilMoisture")

    el-form-item(label="Направление обработки почвы по отношению к севу")
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
          checkListType: 5,
          depth: null,
          grainMoisture: null,
          direction: null,
          fieldsThreat: {},
        },
        assignments: [],
        direction: [],
        loading: true,
        endpoint: 'HarrowingCheckList/',
      }
    },
    created() {
      this.form.areaAssignmentId = this.assignmentId
      this.fetchEntities([
        'assignments',
        'direction'
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
        this.direction = this.fromVuex('direction')
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
        this.form.checkListType = 5
        this.form.fieldsThreat = {}
      },
    }
  }

</script>

<style>

</style>
