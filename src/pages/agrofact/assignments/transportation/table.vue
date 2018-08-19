<template lang="pug">
.el-table-cont
  el-table(
    :data="paginate(tableData)",
    resizable,
    border,
    v-loading="loading",
    :max-height="maxHeight",
  ).content
    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
    el-table-column(
      label="Операции",
      align="center",
      width="120"
    )
      el-button-group(slot-scope="scope")
        el-button(@click="edit(scope.row.id)", size="small", icon="edit", title="редактировать")
        el-button(@click="remove(scope.row.id)", size="small", icon="delete2", title="удалить")
  el-pagination(
    layout="total, sizes, prev, pager, next",
    :total="tableData.length",
    :page-size="page.size",
    :page-sizes="page.sizes",
    :current-page.sync="page.current",
    @current-change="handlePageChange",
    @size-change="handleSizeChange",
  )
</template>
<script>
import http from "services/http"
import {deepClone} from "lib/utils";
import modByLib from "lib/modByLib";
import {fromVuex} from "services/RecordsLoader"
import GlobalMethods from "lib/GlobalMethods";
import moment from "moment"
import {EventBus} from "services/EventBus"
import WindowResize from "mixins/window-resize"

export default {
  name: "TransportationTable",
  props: {
    "columns": {
      type: Array,
      default: [],
    },
    "filterOptions": {
      type: Object,
      default: {},
    },
    "sortOptions": {
      type: Object,
      default: {},
    },
  },
  mixins: [
    WindowResize,
  ],
  data() {
    return {
      cols: [],
      tableData: [],
      loading: null,
      page: {
        current: 1,
        size: 5,
        sizes: [5, 10, 15, 20, 25],
      },
      maxHeight: 450,
    }
  },
  watch: {
    columns: {
      handler: function (val, oldVal) {
        this.cols = deepClone(val)
      },
      deep: true
    },
    ["filterOptions"](val, oldVal) {
      this.loadAssignments()
    },
    ["sortOptions"](val, oldVal) {
      this.sortAssignments()
    },
  },
  updated() {
    modByLib.addTooltips(this.paginate(this.tableData));
  },
  created() {
    this.initPagination()
    this.loading = true
    this.cols = deepClone(this.columns)
    this.initTable()
  },
  mounted() {
    EventBus.$on("WindowResize.windowInnerHeight", (windowInnerHeight) => {
      this.maxHeight = windowInnerHeight - (60 + 10 + 36 + 10 + 36.25 + 10 + 32 + 10)
    })
  },
  methods: {
    initTable() {
      if (this.filterOptions) this.loadAssignments()
    },
    loadAssignments() {
      this.loading = true
      let params = this.getParams()
      http.getWithoutCache(`transportation/${params}`)
        .then(data => {
          this.$store.dispatch("actionAddEntities", {name: "transportation", data: data})
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
        let work = !this.filterOptions.workIds.length || this.filterOptions.workIds.includes(a.subOperationId)
        let car = !this.filterOptions.carIds.length || this.filterOptions.carIds.includes(a.carId)
        let instrument = !this.filterOptions.instrumentIds.length || this.filterOptions.instrumentIds.includes(a.instrumentId)
        let cond = date && employee && work && car && instrument
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
    prepareXls(data) {
      let name = "Список заданий"
      let props = {
        id: "Номер",
        startDate: "Дата начала",
        endDate: "Дата завершения",
        fieldName: "Поле",
        subOperationName: "Работа",
        employeeFullName: "Работник",
        carDisplayString: "Машина",
        instrumentName: "Орудие",
        modifiedByName: "Автор",
        formatDateModified: "Дата изменения",
      }
      this.$emit("xls-ready", deepClone(data), props, name)
    },
    edit(id) {
      this.$emit("edit", id)
    },
    remove(id) {
      this.$confirm("Действительно удалить задание?", "Внимание", {
        confirmButtonText: "OK",
        cancelButtonText: "Отмена",
        type: "warning"
      }).then(() => {
        http.delete("transportation", id).then(() => {
          this.loadAssignments()
        })
      })
    },
    initPagination() {
      this.page.size = +localStorage.getItem("assignments/transportation/pageSize") || 5
      this.page.sizes[this.page.sizes.findIndex(p => p == this.page.size)] = 5
      this.page.sizes[0] = this.page.size
    },
    paginate(table) {
      let from = (this.page.current - 1) * this.page.size
      let till = this.page.current * this.page.size
      return table.slice(from, till)
    },
    handlePageChange(num) {
      this.page.current = num
      modByLib.addTooltips(this.paginate(this.tableData));
    },
    handleSizeChange(num) {
      this.page.size = num
      localStorage.setItem("assignments/transportation/pageSize", +num)
      modByLib.addTooltips(this.paginate(this.tableData));
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
