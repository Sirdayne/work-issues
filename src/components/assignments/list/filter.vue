<template lang="pug">
el-dialog(:visible="visible", title="Фильтр", size="tiny", :before-close="handleClose")
  el-form(label-width="90px")
    el-form-item(label="Свои")
      el-checkbox(v-model="isSelf", @change="setOrganization()")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Поле")
      el-select.form-item-iterable(v-model="filterModel.fieldIds", filterable, multiple)
        el-option(v-for="f in filterModelData.fields", :label="f.displayString", :value="f.id", :key="f.id")
    el-form-item(label="Работа")
      el-select.form-item-iterable(v-model="filterModel.workIds", filterable, multiple)
        el-option(v-for="w in filterModelData.works", :label="w.name", :value="w.id", :key="w.id")
    template(v-if="!isSelf")
      el-form-item(label="Организация")
        el-select.form-item-iterable(v-model="organization", placeholder="Организация", @change="filterByOrg", filterable)
          el-option(v-for="o in organizations", :label="o.name", :value="o.id", :key="o.id")
    el-form-item(label="Водитель")
      el-select.form-item-iterable(v-model="filterModel.employeeIds", filterable, multiple)
        el-option(v-for="e in filterModelData.employees", :label="e.fullName", :value="e.id", :key="e.id")
    el-form-item(label="Машина")
      el-select.form-item-iterable(v-model="filterModel.carIds", filterable, multiple)
        el-option(v-for="c in filterModelData.cars", :label="c.displayString", :value="c.id", :key="c.id")
    el-form-item(label="Орудие")
      el-select.form-item-iterable(v-model="filterModel.instrumentIds", filterable, multiple)
        el-option(v-for="i in filterModelData.instruments", :label="i.displayString", :value="i.id", :key="i.id")
    el-form-item
      el-button-group
        el-button(@click="applyFilter()", type="primary") Применить
        el-button(@click="clearFilter()") Сбросить
</template>

<script>
import GlobalMethods from 'lib/GlobalMethods'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import moment from 'moment'
import {deepClone} from 'lib/utils'

export default {
  name: 'AssignmentsFilter',
  props: [
    'filterVisible',
  ],
  mixins: [
    RecordsLoaderV2,
  ],
  data() {
    return {
      visible: false,
      filterModel: {
        from: new Date(moment().set({'year': this.$root.context.year, 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).subtract(10, 'days')),
        till: new Date(moment().set({'year': this.$root.context.year, 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999})),
        fieldIds: [],
        workIds: [],
        employeeIds: [],
        carIds: [],
        instrumentIds: [],
      },
      filterModelData: {
        works: [],
        fields: [],
        seedlimits: [],
        employees: [],
        cars: [],
        instruments: [],
      },
      organizations: [],
      organization: this.$root.context.organization,
      isSelf: true,
    }
  },
  watch: {
    ['filterVisible'](val, oldVal) {
      this.visible = val
    },
  },
  created() {
    this.initFilter()
    this.applyFilter()
  },
  methods: {
    initFilter() {
      let works = GlobalMethods.getAssignmentsWorks()
        .map(w => {
          let startDate = GlobalMethods.getStartDateFromWorkDatesByWorkId(w.id)
          w.diff = Math.abs(new Date() - w.startDate)
          return w
        })
        .sort((a, b) => a.diff - b.diff);
      this.filterModelData.works = deepClone(works)
      this.filterModelData.fields = this.fromVuex('fields')
      this.filterModelData.seedlimits = this.fromVuex('seedlimits')
      this.organizations = this.fromVuex('organizations')
      this.filterByOrg(this.organization)
    },
    applyFilter() {
      this.$emit("apply", deepClone(this.filterModel))
      this.close()
    },
    clearFilter() {
      this.filterModel.from = new Date(moment().set({'year': this.$root.context.year, 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).subtract(10, 'days'))
      this.filterModel.till = new Date(moment().set({'year': this.$root.context.year, 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999}))
      this.filterModel.fieldIds = []
      this.filterModel.workIds = []
      this.filterModel.employeeIds = []
      this.filterModel.carIds = []
      this.filterModel.instrumentIds = []
      this.applyFilter()
    },
    setOrganization() {
      if (this.isSelf) {
        this.organization = this.$root.context.organization
        this.filterByOrg(this.organization)
      }
    },
    filterByOrg(organizationId) {
      this.filterModelData.employees = this.fromVuex("employeesAll").filter(e => e.organizationId == organizationId)
      this.filterModelData.cars = this.fromVuex("carsAll").filter(c => c.organizationId == organizationId)
      let instruments = this.fromVuex("instrumentsAll").filter(i => i.organizationId == organizationId)
      if (!instruments.length) instruments = this.fromVuex("instrumentsAll")
      this.filterModelData.instruments = instruments
    },
    close() {
      this.visible = false
      this.$emit("closed")
    },
    handleClose(done) {
      this.close()
      done()
    }
  }
}
</script>

<style lang="stylus" scoped>
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
</style>
