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

    el-form-item(label="Чистота и промывка бака, предбака, форсунки, фильтров")
      el-switch(v-model="form.isCleaningDone", on-text="", off-text="")

    el-form-item(v-if="form.nozzleType", label="Цвет форсунки")
      el-select(v-model="form.nozzleType.nozzleColor", clearable, filterable)
        el-option(
        v-for="n in nozzleColor",
        :key="n.id",
        :label="n.name",
        :value="n.id"
        )

    el-form-item(v-if="form.nozzleType",label="Десятичное число форсунки")
      el-input-number(v-model="form.nozzleType.decimalNumber")

    el-form-item(v-if="form.nozzleType",label="Число факелов форсунки")
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
        windDirection: [],
        usedPackagingAbsence: [],
        nozzleColor: [],
        loading: true,
        endpoint: 'ChemicalCheckList/',
      }
    },
    created() {
      this.updateThreatForEdit()
      this.fetchEntities([
        'assignments',
        'windDirection',
        'usedPackagingAbsence',
        'nozzleColor',
      ], this.afterFetch );
    },
    computed: {

    },
    methods: {
      afterFetch(){
        this.assignments = this.fromVuex('assignments')
        this.windDirection = this.fromVuex('windDirection')
        this.usedPackagingAbsence = this.fromVuex('usedPackagingAbsence')
        this.nozzleColor = this.fromVuex('nozzleColor')
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
