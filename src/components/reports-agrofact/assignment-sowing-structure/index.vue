<template lang="pug">
div
  h2(class="heading-margin") Выполнение работ по полям
  div.a-form
    span(v-if="report.parameters.find(p=>p=='date')", label="Дата")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy", @change="getData()", placeholder="Выберите дату", :clearable="dateClearable")
    span(v-if="report.parameters")
      el-button.excel(type='default', @click="download(report)") .
    span(label="Работа")
      el-select(v-model="item.work", placeholder="Выберите работу", filterable, clearable, :loading="loading", @change="filterByWork")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
  .el-table-cont
    el-table(
      :data="tableData",
      resizable,
      border,
      v-loading="loading",
      max-height="500",
      show-summary,
      :summary-method="getSummary"
    ).content
      el-table-column(label="Культура", min-width="120")
        template(slot-scope="scope")
          template(v-if="selectedCulture && scope.row.cultureName == selectedCulture")
            el-button(@click="filterByCulture()", type="text") - {{scope.row.cultureName}}
          template(v-else-if="scope.row.cultureName")
            el-button(@click="filterByCulture(scope.row.cultureName)", type="text") + {{scope.row.cultureName}}
          template(v-else)
            span {{scope.row.cultureName}}
      el-table-column(prop="fieldNewName", label="Поле")
      el-table-column(prop="historyArea", label="Историческая площадь")
      el-table-column(prop="totalArea", label="Посевная площадь")
      el-table-column(prop="area", label="Выработка, га")
      el-table-column(prop="procent", label="% выполненного")
</template>
<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import moment from 'moment'
import {deepClone} from 'lib/utils'

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  data() {
    return {
      item: {
        date: moment().hour(0).minute(0).second(0).subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss"),
        work: null,
      },
      fieldsuboperationprogress: [],
      works: [],
      tableData: [],
      tableDataByWork: [],
      selectedCulture: null,
      dateClearable: false,
      loading: false,
    }
  },
  computed: {
    reports() {
      return this.fromVuex('reports')
    },
    report() {
      let api = this.$route.fullPath.split("/").pop()
      return this.reports.find(r => r.api == api) || {}
    },
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      delete this.item.work
      let date = moment(this.item.date, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("YYYY/MM/DD")
      http.get(`fieldsuboperationprogress/getinfo2?orgId=${this.$root.context.organization}&date=${date}`)
        .then(data => {
          this.setFSP(data)
        })
        .catch(() => {
          this.setFSP({})
        })
    },
    setFSP(data) {
      let fieldsuboperationprogress = data && data.data ? data.data : []
      this.fieldsuboperationprogress = fieldsuboperationprogress.map(fsp => {
        fsp.area = fsp.area.toFixed(2)
        fsp.procent = fsp.procent.toFixed(2)
        return fsp
      })
      let works = []
      if (data && data.types) {
        works = data.types.map(w => {return {id: w.key, name: w.value}}).sort((a, b) => a.id - b.id)
      }
      this.works = works
      this.loading = false
    },
    filterByWork(work) {
      let data = this.fieldsuboperationprogress || []
      this.tableDataByWork = data.filter(td => td.gr == this.item.work)
        .sort((a, b) => {
          let culture = (a.cultureName).localeCompare(b.cultureName)
          let field = (a.fieldNewName).localeCompare(b.fieldNewName)
          let area = a.area - b.area
          return culture || field || area
        })
      this.filterByCulture()
    },
    filterByCulture(culture) {
      this.selectedCulture = culture
      let tableData = deepClone(this.tableDataByWork).filter((td, i, arr) => {
        let cond = td.cultureName && (!culture || culture != td.cultureName)
        if (cond) {
          return arr.map(a => a.cultureName).indexOf(td.cultureName) === i
        }
        return true
      }).map((td, i, arr) => {
        if (!td.cultureName || culture == td.cultureName) {
          let cond = arr.map(a => a.cultureName).indexOf(td.cultureName) === i
          if (!cond) td.cultureName = ""
          return td
        }
        if (!culture || culture != td.cultureName) return {cultureName: td.cultureName}
      })
      this.tableData = tableData
    },
    getSummary(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (!index) {
          sums[index] = "Итого";
          return;
        }
        if (["fieldNewName", "procent"].includes(column.property)) return;
        const values = deepClone(this.tableDataByWork).map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          let floatCount = ["area"].includes(column.property) ? 2 : 0
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0).toFixed(floatCount);
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    download(item) {
      let body = {}
      let contexts = ["organization", "budget", "year", "culture", "date"]
      let keys = ["organizationId", "budgetId", "year", "cultureId", "date"]
      let obj = [this.$root.context, this.$root.context, this.$root.context, this.item, this.item]
      item.parameters.forEach(p => {
        let i = contexts.findIndex(c => c == p)
        let c = contexts[i]
        body[keys[i]] = obj[i][c]
        if (c == "date") {
          body[keys[i]] = moment(obj[i][c], "YYYY-MM-DDTHH:mm:ss.SSSZ").format("YYYY-MM-DDTHH:mm:ss")
        }
      })
      http.downloadXLS(item.api, body, item.name)
    },
  }
}
</script>
<style lang="stylus" scoped>
.heading-margin
  margin 0 0 10px 0
.a-form
  margin-bottom 13px
  & span
    display inline-block
    &:not(:first-child)
      margin-left 10px
</style>
