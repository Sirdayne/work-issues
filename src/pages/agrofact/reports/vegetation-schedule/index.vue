<template lang="pug">
div
  el-dialog(:visible.sync="dialogGraph", title="Отчет график уборки по вегетации")
    .chart-container
      canvas#chart-line(height="400", width="600")
  h2(class="heading-margin") Отчет график уборки по вегетации
  div.a-form
    span
      el-button.excel(type="default", @click="download()") .
    span
      filter-cols(:cols="cols")
    span
      el-button(@click="openDialogGraph", :disabled="loading", title="Диаграмма")
        i(class="fas fa-chart-line")
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      resizable,
      border,
      v-loading="loading",
      max-height="500",
    ).content
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
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
import moment from "moment"
import Chart from "chart.js"

import fontawesome from "@fortawesome/fontawesome"
import faChartLine from "@fortawesome/fontawesome-free-solid/faChartLine"

fontawesome.library.add(faChartLine)

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
        {prop: "field", label: "Поле", active: true},
        {prop: "area", label: "Площадь посева, га", active: true},
        {prop: "culture", label: "Культура", active: true},
        {prop: "sort", label: "Сорт", active: true},
        {prop: "vegetationPeriodMax", label: "Вегетационный срок до", active: true},
        {prop: "sowingDate", label: "Дата посева", active: true},
        {prop: "harvestingDate", label: "Рекомендуемая дата уборки", active: true},
      ],
      tableData: [],
      graphData: [],
      loading: false,
      currentPage: 1,
      dialogGraph: false,
      chartData: {},
      chartOptions: {},
      perPage: 5,
      chartLineCreated: false,
    }
  },
  created() {
    moment.locale("ru")
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      http.get(`vegetationschedule/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.setData(data)
        })
        .catch(() => {
          this.setData([])
        })
    },
    setData(data) {
      this.tableData = data.map(d => {
        d.sowingDate = moment(d.sowingDate, "YYYY-MM-DDTHH:mm:ss").format("DD MMMM")
        d.harvestingDate = moment(d.harvestingDate, "YYYY-MM-DDTHH:mm:ss").format("DD MMMM")
        return d
      })
      this.prepareGraphData()
      this.createGraph()
      this.loading = false
    },
    download() {
      let body = {
        organizationId: this.$root.context.organization,
        year: this.$root.context.year,
      }
      let filename = "Отчет график уборки по вегетации"
      http.downloadXLS("vegetationschedule", body, filename)
    },
    collectUniqueDates() {
      this.tableData.forEach(item => {
        let found = this.graphData.findIndex(g => g.date === item.harvestingDate)
        if (found === -1) {
          this.graphData.push({
            area: 0,
            date: item.harvestingDate
          })
        }
      })
    },
    collectAreas() {
      this.graphData.forEach(g => {
        this.tableData.forEach(item => {
          if (g.date === item.harvestingDate) {
            g.area = item.area
          }
        })
      })
    },
    prepareGraphData() {
      this.graphData = []
      this.collectUniqueDates()
      this.collectAreas()
    },
    createGraph() {
      const labels = this.graphData.map(g => g.date)
      const datas = this.graphData.map(g => g.area)

      this.chartData = {
        labels: labels,
        datasets: [{
          label: "Объем посева, га",
          backgroundColor: "#20a0ff",
          borderColor: "#4db2ff",
          data: datas,
          fill: false,
        }]
      }

      this.chartOptions = {
        responsive: true,
        title: {
          display: false,
          text: "График по уборке вегетации"
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Рекомендуемая дата уборки"
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Объем площади посева, га"
            }
          }]
        }
      }
    },
    openDialogGraph() {
      this.dialogGraph = true
      this.$nextTick(() => {
        if (!this.chartLineCreated) {
          this.chartLineCreated = true
          new Chart("chart-line", {type: "line", data: this.chartData, options: this.chartOptions})
        }
      })
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
.el-tag
  margin 3px
.chart-container
  margin 0 auto
</style>
