<template lang="pug">
el-dialog(:visible="visible", title="Фильтр", size="tiny", :before-close="handleClose")
  el-form(label-width="90px")
    el-form-item(label="Свои")
      el-checkbox(v-model="isSelf", @change="setOrganization()")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
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
import GlobalMethods from "lib/GlobalMethods"
import {fromVuex} from "services/RecordsLoader"
import moment from "moment"
import {deepClone} from "lib/utils"

export default {
  name: "TransportationFilter",
  props: {
    "filterVisible": {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
      filterModel: {
        from: new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(10, "days")),
        till: new Date(moment().set({"year": this.$root.context.year}).endOf("day")),
        workIds: [],
        employeeIds: [],
        carIds: [],
        instrumentIds: [],
      },
      filterModelData: {
        works: [],
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
    ["filterVisible"](val, oldVal) {
      this.visible = val
    },
  },
  created() {
    this.initFilter()
    this.applyFilter()
  },
  methods: {
    initFilter() {
      let works = GlobalMethods.getTransportationWorks()
        .map(w => {
          let startDate = GlobalMethods.getStartDateFromWorkDatesByWorkId(w.id)
          w.diff = Math.abs(new Date() - startDate)
          return w
        })
        .sort((a, b) => a.diff - b.diff);
      this.filterModelData.works = deepClone(works)
      this.organizations = fromVuex("organizations")
      this.filterByOrg(this.organization)
    },
    applyFilter() {
      this.$emit("apply", deepClone(this.filterModel))
      this.close()
    },
    clearFilter() {
      this.filterModel.from = new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(10, "days"))
      this.filterModel.till = new Date(moment().set({"year": this.$root.context.year}).endOf("day"))
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
      this.filterModelData.employees = fromVuex("employeesAll").filter(e => e.organizationId == organizationId)
      this.filterModelData.cars = fromVuex("carsAll").filter(c => c.organizationId == organizationId)
      setTimeout(() => {
        this.filterModelData.instruments = GlobalMethods.getInstrumentsByOrganization(organizationId)
      }, 1)
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
