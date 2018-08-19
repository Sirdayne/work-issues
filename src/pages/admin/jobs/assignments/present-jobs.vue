<template lang="pug">
div
  h2 Статистика обработки заданий
    span(:style="{marginRight: '30px'}")
    el-button.filter(@click="showFilter()", type="default", title="Фильтр") .
    el-dialog(:visible.sync="filterVisible", title="Фильтр", size="tiny")
      el-form(label-width="90px")
        el-form-item(label="Задания")
          el-select.form-item-iterable(v-model="filterModel.status", filterable, multiple)
            el-option(v-for="(s, index) in statuses", :label="s.name", :value="s.value", :key="index")
        el-form-item
          el-button-group
            el-button(@click="applyFilter()", type="primary") Применить
            el-button(@click="clearFilter()") Сбросить
  .el-table-cont
    el-table(
      :data="paginate(filteredTableData)",
      border,
      resizable,
      v-loading="loading",
      max-height="500",
    ).content
      el-table-column(prop="blocked", label="Дата начала", width="120px")
      el-table-column(prop="field", label="Поле/Посев", width="170px")
      el-table-column(prop="assignmentType", label="Вид работ", width="150px")
      el-table-column(label="Группа заданий", min-width="300px", header-align="center", class-name="table-inside")
        template(slot-scope="scope")
          el-table.borderless-table(:data="scope.row.assignments", :show-header="false")
            el-table-column(prop="assignmentId", label="Номер", width="90px")
            el-table-column(prop="reason", label="Причина")
            el-table-column(prop="date", label="Дата изменения", width="155px")
      el-table-column(prop="duration", label="Время обработки", width="120px")
    el-pagination(
      layout="total, prev, pager, next",
      :total="filteredTableData.length",
      :page-size="perPage",
      :current-page="currentPage",
      style="margin-top: 10px;",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )
</template>
<script>
import paginate from "mixins/paginate"
import moment from "moment"

export default {
  name: "PresentJobs",
  props: {
    "statusesData": {
      type: Array,
      default: [],
    },
  },
  mixins: [
    paginate,
  ],
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      tableData: [],
      filteredTableData: [],
      filterModel: {status: [false]},
      statuses: [
        {name: "Завершенные", value: true},
        {name: "Незавершенные", value: false},
      ],
      loading: false,
      filterVisible: false,
    }
  },
  created() {
    let statuses = this.statusesData
    this.makeTableData(statuses)
  },
  methods: {
    makeTableData(statuses) {
      this.loading = true
      let tableData = []
      statuses.forEach(s => {
        let obj = {}
        let blocked = +s.blocked.match(/[0-9]/g).join("")
        obj.blocked = moment.utc(blocked).format("DD.MM.YYYY HH:mm:ss")
        obj.field = s.field
        obj.assignmentType = s.assignmentType
        obj.assignments = s.data.map(a => {
          if (a.date) {
            let blocked = +s.blocked.match(/[0-9]/g).join("")
            a.date = moment.utc(blocked).format("DD.MM.YYYY HH:mm:ss")
          }
          return a
        })
        obj.duration = this.getDuration(Math.floor(s.spanSeconds))
        obj.done = s.done
        tableData.push(obj)
      })
      this.tableData = tableData
      this.applyFilter()
    },
    getDuration(seconds) {
      let hh = Math.floor(seconds / 3600)
      hh = hh < 10 ? "0" + hh : hh
      let mm = Math.floor(seconds / 60) % 60
      mm = mm < 10 ? "0" + mm : mm
      let ss = seconds % 60
      ss = ss < 10 ? "0" + ss : ss
      return `${hh}:${mm}:${ss}`
    },
    showFilter() {
      this.filterVisible = true
    },
    applyFilter() {
      this.filterVisible = false
      this.loading = true
      setTimeout(this.filterByStatus, 300)
    },
    filterByStatus() {
      this.filteredTableData = this.tableData.filter(td => this.filterModel.status.includes(td.done))
      this.loading = false
    },
    clearFilter() {
      this.filterModel = {status: [false]}
      this.applyFilter()
    },
  }
}
</script>
<style lang="stylus" scoped>
</style>
