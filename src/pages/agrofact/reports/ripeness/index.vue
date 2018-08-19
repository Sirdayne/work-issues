<template lang="pug">
div
  el-dialog(:visible.sync="pieVisible", title="Доля в общей площади посева")
    .chart-container
      canvas#pie-chart(height="400", width="600")
  h2(class="heading-margin") Размещение семян по группам спелости
  div.a-form
    span
      el-button.excel(type="default", @click="download()") .
    span
      filter-cols(:cols="cols")
    span
      el-button(@click="showPieChart()", :disabled="loading", title="Диаграмма")
        i(class="fas fa-chart-pie")
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      resizable,
      border,
      v-loading="loading",
      max-height="500",
    ).content
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
      el-table-column(label="Поля", width="400", header-align="center")
        template(slot-scope="scope")
          el-tag.el-tag(v-for="(item, index) in scope.row.fields", color="#20a0ff", :key="index")
            span(:title="item") {{ item }}
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
import http from "services/http"
import paginate from "mixins/paginate"
import filterCols from "components/filterCols"
import Chart from "chart.js"
import randomcolor from "randomcolor"

import fontawesome from "@fortawesome/fontawesome"
import faChartPie from "@fortawesome/fontawesome-free-solid/faChartPie"

fontawesome.library.add(faChartPie)

export default {
  mixins: [
    paginate,
  ],
  components: {
    filterCols
  },
  data() {
    return {
      cols: [
        {prop: "culture", label: "Культура", active: true},
        {prop: "cultureArea", label: "Культура, га", active: true},
        {prop: "culturePercent", label: "Культура, %", active: true},
        {prop: "sort", label: "Сорт", active: true},
        {prop: "sortArea", label: "Сорт, га", active: true},
        {prop: "sortPercent", label: "Доля в общей площади посева, %", active: true},
        {prop: "ripenessGroup", label: "Группа спелости", active: true},
        {prop: "sortToCulturePercent", label: "Доля в общей площади культуры, %", active: true},
      ],
      tableData: [],
      loading: false,
      currentPage: 1,
      perPage: 5,
      pieVisible: false,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      http.get(`ripeness/${this.$root.context.organization}?year=${this.$root.context.year}`)
        .then(data => {
          this.setData(data)
        })
        .catch(() => {
          this.setData({})
        })
    },
    setData(data) {
      this.tableData = data
      this.initPieChart()
      this.loading = false
    },
    initPieChart() {
      let sortPercent = this.tableData.map(td => td.sortPercent)
      let sort = this.tableData.map(td => td.sort)
      let colors = randomcolor({count: sort.length})
      let data = {
        datasets: [{
          data: sortPercent,
          backgroundColor: colors,
        }],
        labels: sort
      };
      this.createPieChart = ((data) => {
        let created = false
        return () => {
          if (!created) {
            created = true
            this.$nextTick(function () {
              let pieChart = new Chart("pie-chart", {type: "pie", data: data});
              this.destroyPieChart = () => pieChart.destroy()
            })
          }
        }
      })(data)
    },
    showPieChart() {
      this.pieVisible = true
      this.createPieChart()
    },
    download() {
      let body = {
        organizationId: this.$root.context.organization,
        year: this.$root.context.year,
      }
      let filename = "Размещение семян по группам спелости"
      http.downloadXLS("ripeness", body, filename)
    },
  },
  beforeDestroy() {
    if (this.destroyPieChart) this.destroyPieChart()
  },
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
.el-tag
  margin 3px
</style>
