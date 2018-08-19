<template lang="pug">
.el-table-cont
  el-table(
    :data="tableData",
    resizable,
    border,
    v-loading="loading",
    max-height="500",
  ).content
    el-table-column(label="Статус", header-align="center")
      template(slot-scope="scope")
        .processed-status-circle(
          :class="{'red': [2, 3, 4].includes(scope.row.status), 'yellow': [0, 5].includes(scope.row.status), 'green': [1].includes(scope.row.status)}",
          :title="scope.row.processedstatus"
        )
    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
    el-table-column(type="expand")
      template(slot-scope="scope")
        p Пробег по полю: {{ scope.row.distanceInField }}
        p Средняя скорость: {{ scope.row.avgSpeed }}
        p Факт начала: {{ scope.row.formatWorkStart }}
        p Факт завершения: {{ scope.row.formatWorkEnd }}
        p План начала: {{ scope.row.formatStart }}
        p План завершения: {{ scope.row.formatEnd }}
        p Мин. скорость: {{scope.row.fixedMinSpeed}}
        p Макс. скорость: {{scope.row.fixedMaxSpeed}}
        p Остановки(&gt;15 минут): {{scope.row.stopMinutes}}
        el-button(@click="$router.push(`/agrofact/map?assignmentId=${scope.row.id}`)", type="primary") Показать трек
  el-pagination(
    layout="total",
    :total="tableData.length",
    :page-size="perPage",
  )
</template>
<script>
import http from "services/http"
import {fromVuex} from "services/RecordsLoader"
import moment from "moment"

export default {
  name: "AssignmentsTableSaved",
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
        {prop: "formattedDateTimeStart", label: "Время начала", active: true},
        {prop: "formattedDateTimeEnd", label: "Время завершения", active: true},
        {prop: "fieldNewName", label: "Поле/посев", active: true},
        {prop: "subOperationName", label: "Работа", active: true},
        {prop: "employeeFullName", label: "Работник", active: true},
        {prop: "carDisplayString", label: "Машина", active: true},
        {prop: "instrumentName", label: "Орудие", active: true},
        {prop: "area", label: "Площадь", active: true},
        {prop: "distanceOutsideField", label: "Км вне поля", active: true},
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
      http.getWithoutCache(`areaassignments/${params}`)
        .then(data => {
          this.setAssignments(data)
        })
        .catch(() => {
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
      return filteredAssignments
        .map(a => {
          let processedstatus = fromVuex("processedstatuses").find(s => s.id == a.status)
          a.processedstatus = processedstatus && processedstatus.name || ""
          a.fixedMinSpeed = a.minSpeed.toFixed(2)
          a.fixedMaxSpeed = a.maxSpeed.toFixed(2)
          a.formattedDateTime = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
          a.formattedDateTimeStart = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
          a.formattedDateTimeEnd = moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
          a.formatWorkStart = moment(a.workStart, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          a.formatWorkEnd = moment(a.workEnd, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          a.formatDateModified = moment(a.dateModified, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          a.area = parseFloat(a.area).toFixed(2)
          a.distanceInField = parseFloat(a.distanceInField).toFixed(2)
          a.avgSpeed = parseFloat(a.avgSpeed).toFixed(2)
          a.distanceOutsideField = parseFloat(a.distanceOutsideField).toFixed(2)
          a.formatStart = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          a.formatEnd = moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          return a
        })
    },
  },
}
</script>
<style lang="stylus" scoped>
.processed-status-circle
  height 10px
  width 10px
  border-radius 50%
  margin 0 auto
.red
  background-color red
.yellow
  background-color yellow
.green
  background-color green
</style>
