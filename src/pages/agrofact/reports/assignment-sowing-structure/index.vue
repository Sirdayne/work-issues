<template lang="pug">
div
  h2(class="heading-margin") Выполнение работ по полям
  div.a-form
    span(v-if="report.parameters.find(p=>p=='date')", label="Дата")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy", @change="getData()", placeholder="Выберите дату", :clearable="dateClearable")
    span(v-if="report.parameters")
      el-button.excel(type="default", @click="download(report)") .
    span(label="Работа")
      el-select(v-model="item.work", placeholder="Выберите работу", filterable, clearable, :loading="loading", @change="filterByWork")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    span(label="Фильтр")
      el-button.filter(
        @click="filterUnfolded = true",
        type="default"
      ) .
    filter-cols(:cols="cols")

  el-dialog(title="Фильтр", :visible.sync="filterUnfolded", size="tiny")
    el-form(label-width="70px", label-position="left")
      el-form-item(label="Поле")
        el-select(v-model="selectedField", placeholder="Поле...", filterable, clearable, :loading="loading")
          el-option(v-for="f in fields", :label="f.newName", :value="f.newName", :key="f.id")

      el-form-item
        el-button(type="primary", @click="applyFilter") Применить
        el-button(@click="nullFilter") Сбросить

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
      el-table-column(label="Культура", min-width="120", v-if="cols[getIdFromLabel('Культура')].active")
        template(slot-scope="scope")
          template(v-if="selectedCulture && scope.row.cultureName == selectedCulture")
            el-button.first-mono(@click="filterByCulture()", type="text") - {{scope.row.cultureName}}
          template(v-else-if="scope.row.cultureName")
            el-button.first-mono(@click="filterByCulture(scope.row.cultureName)", type="text") + {{scope.row.cultureName}}
          template(v-else)
            span {{scope.row.cultureName}}
      el-table-column(prop="fieldNewName", label="Поле", v-if="cols[getIdFromLabel('Поле')].active")
      el-table-column(prop="historyArea", label="Историческая площадь", v-if="cols[getIdFromLabel('Историческая площадь')].active")
      el-table-column(prop="totalArea", label="Посевная площадь", v-if="cols[getIdFromLabel('Посевная площадь')].active")
      el-table-column(label="Выработка, га", header-align="center")
        el-table-column(prop="totalAreaBrigades", label="Всего", v-if="cols[getIdFromLabel('Всего')].active")
        template(v-for="b in brigades")
          el-table-column(:label="b.name", :prop="'brigade' + b.id", v-if="cols[getIdFromLabel(b.name)].active")
      el-table-column(label="% выполненного", v-if="cols[getIdFromLabel('% выполненного')].active")
        template(slot-scope="scope")
          template(v-if="selectedCulture && scope.row.cultureName == selectedCulture")
            span {{scope.row.procent}}
          template(v-else)
            span {{ getProcent(scope.row.historyArea, scope.row.totalArea, scope.row.totalAreaBrigades) }}
</template>
<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import moment from "moment"
import {deepClone} from "lib/utils"
import filterCols from "components/filterCols"
import FilterColsMixin from "components/filterCols/FilterColsMixin"

export default {
  mixins: [
    
    FilterColsMixin
  ],
  components: {
    filterCols
  },
  data() {
    return {
      item: {
        date: moment().year(this.$root.context.year).startOf("day").subtract(1, "days").format("YYYY-MM-DDTHH:mm:ss"),
        work: null,
      },
      fieldsuboperationprogress: [],
      filteredByField: [],
      works: [],
      brigades: [],
      fields: [],
      tableData: [],
      tableDataByWork: [],
      selectedCulture: null,
      dateClearable: false,
      selectedField: null,
      cols: [],
      startCols: [
        {id: 0, label: "Культура", active: true},
        {id: 1, label: "Поле", active: true},
        {id: 2, label: "Историческая площадь", active: true},
        {id: 3, label: "Посевная площадь", active: true},
        {id: 4, label: "Всего", active: true},
      ],
      filterUnfolded: false,
      loading: false,
    }
  },
  computed: {
    reports() {
      return fromVuex("reports")
    },
    report() {
      let api = this.$route.fullPath.split("/").pop()
      return this.reports.find(r => r.api == api) || {}
    },
  },
  created() {
    this.cols = deepClone(this.startCols)
    fetchEntities([
      "brigades",
      "fields"
    ], this.afterFetch)
  },
  methods: {
    afterFetch() {
      this.brigades = fromVuex("brigades")
      this.fields = fromVuex("fields")
      this.getData()
    },
    getData() {
      this.loading = true
      delete this.item.work
      let date = moment(this.item.date, "YYYY-MM-DDTHH:mm:ss").format("YYYY/MM/DD")
      this.cols = deepClone(this.startCols)
      http.get(`fieldsuboperationprogress/getinfo2?orgId=${this.$root.context.organization}&date=${date}`)
        .then(data => {
          this.setBrigades(data)
          this.setCols()
          this.setFSP(data)
        })
        .catch(() => {
          this.setFSP({})
        })
    },
    setBrigades(data) {
      let brigadeIds = []
      data.data.forEach(item => {
        let found = brigadeIds.findIndex(brigadeId => brigadeId === item.brigadeId)
        if (found === -1) {
          brigadeIds.push(item.brigadeId)
        }
      })
      this.brigades = this.brigades.filter(brigade => brigadeIds.includes(brigade.id))
    },
    setCols() {
      let colsLength = this.cols.length
      this.brigades.forEach(brigade => {
        this.cols.push({id: colsLength++, label: brigade.name, active: true})
      })
      this.cols.push({id: colsLength++, label: "% выполненного", active: true})
    },
    setFSP(data) {
      let fieldsuboperationprogress = data && data.data ? data.data : []
      this.fieldsuboperationprogress = fieldsuboperationprogress.map(fsp => {
        fsp.area = fsp.area.toFixed(2)
        fsp.procent = fsp.procent.toFixed(2)
        fsp.totalAreaBrigades = fsp.area
        this.brigades.forEach(b => {
          fsp["brigade" + b.id] = fsp.brigadeId == b.id ? fsp.area : ""
        })
        return fsp
      })
      this.filteredByField = deepClone(this.fieldsuboperationprogress)
      let works = []
      if (data && data.types) {
        works = data.types.map(w => {return {id: w.key, name: w.value}}).sort((a, b) => a.id - b.id)
      }
      this.works = works
      this.loading = false
    },
    applyFilter(){
      this.filteredByField = deepClone(this.fieldsuboperationprogress)
      this.filterByField()
      this.filterUnfolded = false
    },
    nullFilter(){
      this.selectedField = null
      this.filteredByField = deepClone(this.fieldsuboperationprogress)
      this.filterByField()
      this.filterUnfolded = false
    },
    filterByField() {
      this.filteredByField = this.selectedField ? this.filteredByField.filter(d => d.fieldNewName === this.selectedField) : deepClone(this.fieldsuboperationprogress)
      this.filterByWork()
    },
    filterByWork() {
      let data = this.filteredByField || []
      this.tableDataByWork = data.filter(td => td.gr == this.item.work)
        .sort((a, b) => {
          let order = a.order - b.order
          let culture = (a.cultureName).localeCompare(b.cultureName)
          let field = (a.fieldNewName).localeCompare(b.fieldNewName)
          let area = a.area - b.area
          return order || culture || field || area
        })
      let isFieldWork = this.tableDataByWork.every(td => !td.totalArea)
      this.cols[this.getIdFromLabel("Посевная площадь")].active = isFieldWork ? false : true
      this.filterByCulture()
    },
    filterByCulture(culture) {
      this.selectedCulture = culture
      let tableData = deepClone(this.tableDataByWork)
        .filter((td, i, arr) => {
          let cond = td.cultureName && (!culture || culture != td.cultureName)
          if (cond) {
            return arr.map(a => a.cultureName).indexOf(td.cultureName) === i
          }
          return true
        })
        .map((td, i, arr) => {
          if (!td.cultureName || culture == td.cultureName) {
            let cond = arr.map(a => a.cultureName).indexOf(td.cultureName) === i
            if (!cond) td.cultureName = ""
            return td
          }
          if (culture != td.cultureName) {
            return this.getSummaryByCulture(td.cultureName)
          }
        })
      if (culture) {
        let rowIndex = tableData.findIndex(td => td.cultureName == culture)
        tableData.splice(rowIndex, 0, {cultureName: tableData[rowIndex].cultureName})
        tableData[rowIndex] = this.getSummaryByCulture(tableData[rowIndex].cultureName)
        tableData[rowIndex].procent = this.getProcent(tableData[rowIndex].historyArea, tableData[rowIndex].totalArea, tableData[rowIndex].totalAreaBrigades)
        tableData[rowIndex + 1].cultureName = ""
      }
      this.tableData = tableData
    },
    getSummaryByCulture(culture) {
      let summary = {}
      summary.cultureName = culture
      let tableDataByCulture = deepClone(this.tableDataByWork.filter(td => td.cultureName == culture))
      let keys = ["historyArea", "totalArea", "totalAreaBrigades"]
      this.brigades.forEach(b => {
        keys.push("brigade" + b.id)
      })
      keys.forEach(key => {
        const values = tableDataByCulture.map(item => Number(item[key]));
        if (!values.every(value => isNaN(value))) {
          let floatCount = ["historyArea", "totalArea"].includes(key) ? 0 : 2
          summary[key] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0).toFixed(floatCount);
        } else {
          summary[key] = "";
        }
      });
      return summary
    },
    getSummary(param) {
      const sums = [];
      param.columns.forEach((column, index) => {
        if (!index) {
          sums[index] = "Итого";
          return;
        }
        if (["fieldNewName", "procent"].includes(column.property)) return;
        const values = deepClone(this.tableDataByWork).map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          let floatCount = ["historyArea", "totalArea"].includes(column.property) ? 0 : 2
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
    getProcent(historyArea, sowingArea, brigadeArea) {
      return sowingArea ? (brigadeArea / sowingArea * 100).toFixed(2) : (brigadeArea / historyArea * 100).toFixed(2)
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
          body[keys[i]] = moment(obj[i][c], "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DDTHH:mm:ss")
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
.first-mono:first-letter
  font-family monospace
  vertical-align top
</style>
