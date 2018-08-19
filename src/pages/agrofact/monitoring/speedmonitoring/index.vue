<template lang="pug">
div
  el-form(
    :model="item",
    ref="form",
    :inline="true",
    :label-position="'top'"
  )
    el-form-item(label="Дата от:")
      el-date-picker(v-model="item.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до:")
      el-date-picker(v-model="item.selectedDate.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Топ нарушителей:")
      el-select(v-model="item.rowCount" placeholder="Выбрать")
        el-option(
          v-for="count in item.rowCounts",
          :key="count.value",
          :label="count.label",
          :value="count.value"
          )
    el-form-item(label="Параметр нарушения:")
      el-select(v-model="item.violationParam" placeholder="Выбрать")
        el-option(
          v-for="param in item.violationParams",
          :key="param.value",
          :label="param.label",
          :value="param.value"
        )
  h2(class="tableHeading") Нарушения скоростного режима
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="exportTable('form')") .
    filter-cols(:cols="cols")
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      border,
      resizable,
      max-height="500",
      v-loading="loading",
      element-loading-text="Загружается...",
    ).content
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :width="col.width", :key="col.prop", header-align="center")
      el-table-column(
        label="Трек",
        width="130",
        align="center",
      )
        template(slot-scope="scope")
          el-button(@click="$router.push(`/agrofact/map?assignmentId=${scope.row.id}`)", type="primary", size="small") Показать
    el-pagination(
      layout="total, prev, pager, next",
      :total="tableData.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange",
    )
</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"
import filterCols from "components/filterCols"

export default {
  components: {
    filterCols,
  },
  mixins: [
    
    ListController,
  ],
  data() {
    return {
      cols: [
        {prop: "date.startFormated", label: "Дата", active: true},
        {prop: "employee", label: "Водитель", active: true},
        {prop: "car", label: "Машина", active: true},
        {prop: "instrument", label: "Орудие", active: true},
        {prop: "field", label: "Поле", active: true},
        {prop: "work", label: "Работа", active: true},
        {prop: "techMinSpeed", label: "Скорость по технологии мин.", active: true},
        {prop: "techMaxSpeed", label: "Скорость по технологии макс.", active: true},
        {prop: "violationSpeed", label: "Сред. скорость нарушения", active: true},
        {prop: "factSpeed", label: "Фактическая (мин/макс) скорость", active: true},
        {prop: "violationSquare", label: "Площадь обработанная при нарушении", active: true},
        {prop: "processedSquare", label: "Общая площадь обработки", active: true},
        {prop: "avgSpeed", label: "Эксплуатационная скорость задания", active: true},
      ],
      item: {
        violationParam: 1,
        violationParams: [{value: 0, label: "мин."}, {value: 1, label: "макс."}],
        rowCount: -1,
        rowCounts: [
          {value: -1, label: "Все"},
          {value: 3, label: "3"},
          {value: 7, label: "7"},
          {value: 10, label: "10"},
        ],
        selectedDate: {
          from: moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days"),
          till: moment().set({"year": this.$root.context.year}).endOf("day"),
        }
      },
      perPage: 5,
      currentPage: 1,
      loading: true,
      speedmonitoring: [],
    }
  },
  computed: {
    tableData: function () {
      let from = this.item.selectedDate.from || moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days")
      let till = this.item.selectedDate.till || moment().set({"year": this.$root.context.year}).endOf("day")
      let violationParam = this.item.violationParam
      let rowCount = this.item.rowCount
      let tableData = this.speedmonitoring.filter(function (sm) {
        let dateRange = (moment(sm.date.start, "YYYY-MM-DDTHH:mm:ss").isSameOrAfter(moment(from)) &&
          moment(sm.date.end, "YYYY-MM-DDTHH:mm:ss").isSameOrBefore(moment(till)))
        let vp = sm.violationParam == violationParam || sm.violationParam == -1
        return dateRange && vp
      })
        .map(function (sm) {
          sm.deviation = violationParam ? sm.maxDeviation : sm.minDeviation
          sm.speed = violationParam ? sm.maxSpeed : sm.minSpeed
          sm.violationSpeed = violationParam ? sm.violationMaxAvgSpeed : sm.violationMinAvgSpeed;
          return sm
        })
        .sort((a, b) => b.deviation - a.deviation)
      if (rowCount > 0) tableData = tableData.slice(0, rowCount)
      return tableData
    },
  },
  created() {
    this.loading = true
    fetchEntities([
      "speedmonitoring",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.speedmonitoring = fromVuex("speedmonitoring")
        .sort((a, b) => new Date(b.date.start) - new Date(a.date.start))
        .map(sm => {
          sm.date.startFormated = moment(sm.date.start).format("DD.MM.YYYY")
          return sm
        });
      this.loading = false
    },
    exportTable(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let endpoint = "SpeedMonitoringForm";
          let filename = "Нарушения скоростного режима";
          let body = {
            OrganizationId: this.$root.context.organization,
            Date: {
              start: moment(this.item.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss"),
              end: moment(this.item.selectedDate.till).format("YYYY-MM-DDTHH:mm:ss"),
            },
            rowCount: this.item.rowCount,
            ViolationParam: this.item.violationParam,
          };
          http.downloadXLS(endpoint, body, filename);
        } else {
          return false;
        }
      });
    },
  }
}
</script>

<style scoped lang="scss">
.tableHeading {
    display: block;
    margin-right: 20px;
}
</style>
