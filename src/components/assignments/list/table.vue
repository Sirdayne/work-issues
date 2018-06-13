<template lang="pug">
.el-table-cont
  el-table(
    :data="paginate(tableData)",
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
    el-table-column(label="", align="center", width="100")
      el-button-group(slot-scope="scope")
        el-button(@click="edit(scope.row.id)", size="small", icon="edit", title="редактировать")
        el-button(@click="remove(scope.row.id)", size="small", icon="delete2", title="удалить")
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
        el-button(@click="$router.push(`/agrofact/map/${scope.row.id}`)", type="primary") Показать трек
  el-pagination(
    layout="total, prev, pager, next",
    :total="tableData.length",
    :page-size="perPage",
    :current-page="currentPage",
    @current-change="onCurrentPageChange",
    @size-change="onPerPageChange"
  )
</template>
<script>
import http from 'lib/httpQueryV2'
import {deepClone} from 'lib/utils';
import modByLib from "lib/modByLib";
import paginate from 'mixins/paginate'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import moment from 'moment'

export default {
  name: 'AssignmentsTable',
  props: [
    'columns',
    'filterOptions',
    'sortOptions',
  ],
  mixins: [
    RecordsLoaderV2,
    paginate
  ],
  data() {
    return {
      cols: [],
      processedstatuses: [],
      tableData: [],
      loading: null,
      currentPage: 1,
      perPage: 5,
    }
  },
  watch: {
    columns: {
      handler: function (val, oldVal) {
        this.cols = deepClone(val)
      },
      deep: true
    },
    ['filterOptions'](val, oldVal) {
      this.loadAssignments()
    },
    ['sortOptions'](val, oldVal) {
      this.sortAssignments()
    },
  },
  updated() {
    modByLib.addTooltips(this.paginate(this.tableData));
  },
  created() {
    this.loading = true
    this.cols = deepClone(this.columns)
    this.initTable()
  },
  methods: {
    initTable() {
      this.processedstatuses = this.fromVuex("processedstatuses")
      this.loadAssignments()
    },
    loadAssignments() {
      this.loading = true
      let params = this.getParams()
      http.getWithoutCache(`areaassignments/${params}`)
        .then(data => {
          this.$store.dispatch("actionAddEntities", {name: "assignments", data: data})
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
        let date = moment(this.filterOptions.from).format("YYYY-MM-DDTHH:mm:ss")
        let from = `from=${date}`
        query.push(from)
      }
      if (this.filterOptions.till) {
        let date = moment(this.filterOptions.till).format("YYYY-MM-DDTHH:mm:ss")
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
      this.sortAssignments()
      this.prepareXls(this.tableData)
      this.loading = false
    },
    filterAssignments(assignments) {
      return assignments.filter(a => {
        let from = !this.filterOptions.from || moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").isSameOrAfter(moment(this.filterOptions.from))
        let till = !this.filterOptions.till || moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").isSameOrBefore(moment(this.filterOptions.till))
        let date = from && till
        let employee = !this.filterOptions.employeeIds.length || this.filterOptions.employeeIds.includes(a.employeeId)
        let field = !this.filterOptions.fieldIds.length || this.filterOptions.fieldIds.includes(a.fieldId)
        let work = !this.filterOptions.workIds.length || this.filterOptions.workIds.includes(a.subOperationId)
        let car = !this.filterOptions.carIds.length || this.filterOptions.carIds.includes(a.carId)
        let instrument = !this.filterOptions.instrumentIds.length || this.filterOptions.instrumentIds.includes(a.instrumentId)
        let cond = date && employee && field && work && car && instrument
        return cond
      })
    },
    sortAssignments() {
      this.tableData = this.tableData
        .sort((a, b) => {
          let date = (new Date(a.dateTimeRange.start) - new Date(b.dateTimeRange.start)) * this.sortOptions.date
          let dateModified = (new Date(a.dateModified) - new Date(b.dateModified)) * this.sortOptions.dateModified
          return date || dateModified
        })
    },
    formatAssignments(filteredAssignments) {
      return filteredAssignments
        .map(a => {
          let processedstatus = this.processedstatuses.find(s => s.id == a.status)
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
          a.areaXls = a.area.toString().replace(".", ",")
          a.distanceInField = parseFloat(a.distanceInField).toFixed(2)
          a.distanceInFieldXls = a.distanceInField.toString().replace(".", ",")
          a.avgSpeed = parseFloat(a.avgSpeed).toFixed(2)
          a.avgSpeedXls = a.avgSpeed.toString().replace(".", ",")
          a.distanceOutsideField = parseFloat(a.distanceOutsideField).toFixed(2)
          a.distanceOutsideFieldXls = a.distanceOutsideField.toString().replace(".", ",")
          a.formatStart = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          a.formatEnd = moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          return a
        })
    },
    prepareXls(data) {
      let name = "Список заданий"
      let props = {
        id: "Номер",
        processedstatus: "Статус",
        formatWorkStart: "Факт начала",
        formatWorkEnd: "Факт завершения",
        formatStart: "План начала",
        formatEnd: "План завершения",
        fieldNewName: "Поле",
        cultureName: "Культура",
        subOperationName: "Работа",
        employeeFullName: "Работник",
        carDisplayString: "Машина",
        instrumentName: "Орудие",
        areaXls: "Площадь",
        distanceInFieldXls: "Пробег по полю",
        avgSpeedXls: "Средняя скорость",
        distanceOutsideFieldXls: "Км вне поля",
        modifiedByName: "Автор",
        formatDateModified: "Дата изменения",
      }
      this.$emit('xls-ready', deepClone(data), props, name)
    },
    edit(id) {
      this.$emit('edit', id)
    },
    remove(id) {
      this.$confirm('Действительно удалить задание?', 'Внимание', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        http.delete("areaassignments", id).then(() => {
          this.loadAssignments()
        })
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
