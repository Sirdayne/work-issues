<template lang="pug">
div
  h2(class="heading-margin") Отчет по обработке семян
  div.a-form
    span(v-if="report.parameters.find(p=>p=='date')", label="Дата")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy", @change="getData()", placeholder="Выберите дату", :clearable="dateClearable")
    span(v-if="report.parameters")
      el-button.excel(type='default', @click="download(report)") .
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      resizable,
      border,
      v-loading="loading",
      max-height="500",
    ).content
      el-table-column(prop="cultureName", label="Культура")
      el-table-column(prop="cultureSortName", label="Сорт")
      el-table-column(prop="reproductionName", label="Репродукция")
      el-table-column(prop="planMordant", label="План протравка, тн")
      el-table-column(prop="preparationName", label="Наименование препарата")
      el-table-column(label="План норма расхода")
        el-table-column(prop="preparationNormative", label="Норма")
        el-table-column(prop="preparationСonsumption", label="Всего")
      el-table-column(label="Фактически протравлено семян")
        el-table-column(label="За день")
          el-table-column(prop="dailySeedValume", label="Объем,тн")
          el-table-column(label="Израсходовано")
            el-table-column(prop="dailyPreparationNormative", label="Норма")
            el-table-column(prop="dailyPreparationСonsumption", label="Всего")
        el-table-column(label="Всего за период")
          el-table-column(prop="processedSeedValume", label="Объем,тн")
          el-table-column(label="Израсходовано")
            el-table-column(prop="processedPreparationNormative", label="Норма")
            el-table-column(prop="processedPreparationСonsumption", label="Всего")
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
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import paginate from 'mixins/paginate'
import moment from 'moment'
import {deepClone} from 'lib/utils'

export default {
  mixins: [
    RecordsLoaderV2,
    paginate
  ],
  data() {
    return {
      perPage: 5,
      currentPage: 1,
      item: {
        date: moment().hour(0).minute(0).second(0).subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss"),
      },
      tableData: [],
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
      let date = moment(this.item.date).format("YYYY-MM-DDTHH:mm:ss")
      let body = {
        date: date,
        organizationId: this.$root.context.organization
      }
      http.post("SeedMordantReportItems", body)
        .then(data => {
          this.setTableData(data)
        })
        .catch(() => {
          this.setTableData([])
        })
    },
    setTableData(data) {
      this.tableData = data
      this.loading = false
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
