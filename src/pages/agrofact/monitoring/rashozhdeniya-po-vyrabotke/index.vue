<template lang="pug">
div
  el-form(:model="filterModel", ref="form", :inline="true", :label-position="'top'")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item.invisible-color(label=".")
      el-button(type="primary", @click="getData()", :loading="loading") Показать
  h2(class="tableHeading") Расхождения по выработке
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="exportTable()") .
    el-button.filter(@click="filterVisible = true", type="default", title="Фильтр", :loading="loading") .
    el-dialog(:visible.sync="filterVisible", title="Фильтр", size="tiny")
      el-form(label-width="90px")
        el-form-item(label="Поле")
          el-select.form-item-iterable(v-model="filterModel.fieldIds", filterable, multiple)
            el-option(v-for="f in filterModelData.fields", :label="f.name", :value="f.id", :key="f.id")
        el-form-item(label="Работа")
          el-select.form-item-iterable(v-model="filterModel.workIds", filterable, multiple)
            el-option(v-for="w in filterModelData.works", :label="w.name", :value="w.id", :key="w.id")
        el-form-item(label="Машина")
          el-select.form-item-iterable(v-model="filterModel.carIds", filterable, multiple)
            el-option(v-for="c in filterModelData.cars", :label="c.name", :value="c.id", :key="c.id")
        el-form-item(label="Статус")
          el-select.form-item-iterable(v-model="filterModel.statuses", filterable, multiple)
            el-option(v-for="s in filterModelData.statuses", :label="s.name", :value="s.name", :key="s.id")
        el-form-item
          el-button-group
            el-button(@click="applyFilter()", type="primary") Применить
            el-button(@click="clearFilter()") Сбросить
    filter-cols(:cols="cols")
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      border,
      resizable,
      max-height="500",
      v-loading="loading",
    ).content
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :width="col.width", :key="col.prop", header-align="center")
      el-table-column(
        v-if="isRoleAccountant",
        label="Принять данные учетчика",
        header-align="center",
        align="center"
      )
        template(slot-scope="scope")
          el-checkbox(v-model="scope.row.acceptedByCounter", @change="setAcceptedByCounter(scope.row)")
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
import paginate from "mixins/paginate"
import moment from "moment"
import filterCols from "components/filterCols"
import {uniq} from "lib/utils";

export default {
  components: {
    filterCols
  },
  mixins: [
    paginate
  ],
  data() {
    return {
      cols: [
        {prop: "id", label: "№ задания", active: true},
        {prop: "subOperationName", label: "Работа", active: true},
        {prop: "carName", label: "Машина", active: true},
        {prop: "instrumenName", label: "Орудие", active: true},
        {prop: "dateTimeRangeStart", label: "Дата начала (плановая)", active: true},
        {prop: "dateTimeRangeEnd", label: "Дата завершения (плановая)", active: true},
        {prop: "workStart", label: "Дата начала (фактическая)", active: true},
        {prop: "workEnd", label: "Дата завершения (фактическая)", active: true},
        {prop: "fieldName", label: "Поле", active: true},
        {prop: "processedSquare", label: "Выработка по данным GPS", active: true},
        {prop: "areaByCounter", label: "Выработка по данным учетчика", active: true},
        {prop: "difference", label: "Разница", active: true},
        {prop: "differenceInPercent", label: "Разница, %", active: true},
        {prop: "statusName", label: "Статус", active: true},
      ],
      perPage: 5,
      currentPage: 1,
      loading: true,
      tableData: [],
      filterVisible: false,
      filterModel: {
        from: moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days"),
        till: moment().set({"year": this.$root.context.year}).endOf("day"),
        fieldIds: [],
        workIds: [],
        carIds: [],
        statuses: [],
      },
      filterModelData: {
        fields: [],
        works: [],
        cars: [],
        statuses: [],
      },
      isRoleAccountant: false,
    }
  },
  created() {
    this.checkRoleAccountant()
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      let date = {}
      date.start = moment(this.filterModel.from).format("YYYY-MM-DDTHH:mm:ss")
      date.end = moment(this.filterModel.till).format("YYYY-MM-DDTHH:mm:ss")
      let body = {
        date: date,
        organizationId: this.$root.context.organization
      }
      http.post("AssignmentsAreaReport", body)
        .then(data => {
          this.setTableData(data)
        })
        .catch(() => {
          this.setTableData([])
        })
    },
    setTableData(data) {
      this.initFilter(data)
      let filtered = this.filterData(data)
      this.tableData = filtered.sort((a, b) => b.id - a.id)
      this.loading = false
    },
    initFilter(data) {
      let fields = data.map(d => {return {id: d.fieldId, name: d.fieldName}})
      this.filterModelData.fields = uniq(fields)
      let works = data.map(d => {return {id: d.subOperationId, name: d.subOperationName}})
      this.filterModelData.works = uniq(works)
      let cars = data.map(d => {return {id: d.carId, name: d.carName}})
      this.filterModelData.cars = uniq(cars)
      let statuses = data.map((d, i) => {return {id: d.statusName, name: d.statusName}})
      this.filterModelData.statuses = uniq(statuses)
    },
    filterData(data) {
      return data.filter(d => {
        let fields = !this.filterModel.fieldIds.length || this.filterModel.fieldIds.includes(d.fieldId)
        let works = !this.filterModel.workIds.length || this.filterModel.workIds.includes(d.subOperationId)
        let cars = !this.filterModel.carIds.length || this.filterModel.carIds.includes(d.carId)
        let status = !this.filterModel.statuses.length || this.filterModel.statuses.includes(d.statusName)
        let cond = fields && works && cars && status
        return cond
      })
    },
    applyFilter() {
      this.filterVisible = false
      this.getData()
    },
    clearFilter() {
      this.filterModel.fieldIds = []
      this.filterModel.workIds = []
      this.filterModel.carIds = []
      this.filterModel.statuses = []
      this.applyFilter()
    },
    exportTable() {
      let endpoint = "AssignmentsArea";
      let filename = "Расхождения по выработке";
      let body = {
        OrganizationId: this.$root.context.organization,
        Date: {
          start: moment(this.filterModel.from).format("YYYY-MM-DDTHH:mm:ss"),
          end: moment(this.filterModel.till).format("YYYY-MM-DDTHH:mm:ss"),
        },
      };
      http.downloadXLS(endpoint, body, filename);
    },
    setAcceptedByCounter(elem) {
      let endpoint = `AssignmentsDailyReportItems/AcceptedByCounter?itemId=${elem.id}&acceptedByCounter=${elem.acceptedByCounter}`
      this.loading= true
      http.post(endpoint).then(() => {
        this.$message({
          message: "Данные приняты",
          type: "success",
          duration: 5000,
          showClose: false,
        })
        this.loading = false
      }).catch(error => {
        elem.acceptedByCounter = !elem.acceptedByCounter
        this.loading = false
      })
    },
    checkRoleAccountant(){
      let endpoint = `account/userinfo/`;
      http.get(endpoint)
        .then(data => {
          if (data) {
            this.isRoleAccountant = data.roles.includes("Editor") ? true : false
          }
        })
    },
  }
}
</script>

<style lang="stylus" scoped>
</style>
