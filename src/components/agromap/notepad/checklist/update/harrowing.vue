<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  el-form(label-width="200px", label-position="left", v-if="ready")
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
        assignments: [],
        direction: [],
        loading: true,
        endpoint: 'HarrowingCheckList/',
      }
    },
    created() {
      this.updateThreatForEdit()
      this.fetchEntities([
        'assignments',
        'direction',
      ], this.afterFetch );
    },
    computed: {

    },
    methods: {
      afterFetch(){
        this.assignments = this.fromVuex('assignments')
        this.direction = this.fromVuex('direction')
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
