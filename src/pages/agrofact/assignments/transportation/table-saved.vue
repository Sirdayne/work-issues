<template lang="pug">
.el-table-cont
  el-table(
    :data="tableData",
    resizable,
    border,
    v-loading="loading",
    element-loading-text="Загружается...",
    max-height="500",
  ).content
    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
  el-pagination(
    layout="total",
    :total="tableData.length",
    :page-size="perPage",
  )
</template>
<script>
import http from "services/http"
import {fromVuex} from "services/RecordsLoader"
import GlobalMethods from "lib/GlobalMethods";
import moment from "moment"

export default {
  name: "TransportationTableSaved",
  props: {
    "savedData": {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      cols: [
        {prop: "id", label: "№", active: true},
        {prop: "startDate", label: "Время начала", active: true},
        {prop: "endDate", label: "Время завершения", active: true},
        {prop: "fieldName", label: "Поле/Склад", active: true},
        {prop: "subOperationName", label: "Работа", active: true},
        {prop: "employeeFullName", label: "Водитель", active: true},
        {prop: "carDisplayString", label: "Машина", active: true},
        {prop: "instrumentName", label: "Орудие", active: true}
      ],
      tableData: [],
      loading: null,
      perPage: 1000,
      filterOptions: {
        from: null,
        till: null,
      }
    }
  },
  created() {
    this.loading = true
    this.filterOptions.from = this.savedData.from
    this.filterOptions.till = this.savedData.till
    this.initTable()
  },
  methods: {
    initTable() {
      this.loadAssignments()
    },
    loadAssignments() {
      this.loading = true
      let params = this.getParams()
      http.getWithoutCache(`transportation/${params}`)
        .then(data => {
          this.setAssignments(data)
        })
        .catch((error) => {
          this.setAssignments([])
        })
    },
    getParams() {
      let params = [], query = []
      params.push(this.$root.context.organization)
      if (this.filterOptions.from) {
        let date = this.filterOptions.from
        let from = `from=${date}`
        query.push(from)
      }
      if (this.filterOptions.till) {
        let date = this.filterOptions.till
        let to = `to=${date}`
        query.push(to)
      }
      if (query.length) {
        query = "?" + query.join("&")
        params.push(query)
      }
      return params.join("")
    },
    setAssignments(assignments) {
      let filtered = this.filterAssignments(assignments)
      let formatted = this.formatAssignments(filtered)
      this.tableData = formatted
      this.loading = false
    },
    filterAssignments(assignments) {
      return assignments.filter(a => this.savedData.items.includes(a.id))
    },
    formatAssignments(filteredAssignments) {
      let works = GlobalMethods.getTransportationWorks()
      return filteredAssignments
        .map(a => {
          a.startDate = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
          a.endDate = moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
          let field
          if (a.assignmentType == 3) {
            field = fromVuex("fields").find(f => f.id == a.destinationFieldId)
          } else if (a.assignmentType == 4) {
            field = fromVuex("fields").find(f => f.id == a.originFieldId)
          }
          a.fieldName = field && field.newName
          let subOperation = works.find(w => w.id == a.subOperationId)
          a.subOperationName = subOperation && subOperation.name
          let employee = fromVuex("employeesAll").find(e => e.id == a.employeeId)
          a.employeeFullName = employee && employee.fullName
          let car = fromVuex("carsAll").find(c => c.id == a.carId)
          a.carDisplayString = car && car.displayString
          let instrument = fromVuex("instruments").find(i => i.id == a.instrumentId)
          a.instrumentName = instrument && instrument.displayString
          a.formatDateModified = moment(a.dateModified, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
          return a
        })
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
