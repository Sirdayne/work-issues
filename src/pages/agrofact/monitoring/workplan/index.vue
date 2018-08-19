<template lang="pug">
div
  el-form(:model="filterOptions", :inline="true", ref="form", label-position="top")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterOptions.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterOptions.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Тип техники", prop="carTypeId")
      el-select(v-model="filterOptions.carTypeId", placeholder="Выбрать", filterable)
        el-option(v-for="c in cartypes", :label="c.name", :value="c.id", :key="c.id")
    el-form-item.invisible-color(label=".")
      el-button(type="primary", @click="getWorkPlan()", :loading="loading") Показать
  h2(class="tableHeading") Календарь работ
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="exportTable('form')") .
  el-table(
    v-if="tableData.length || loading",
    :data="tableData",
    border,
    resizable,
    v-loading="loading",
    element-loading-text="Загружается...",
    height="1",
  ).content
    el-table-column(
      prop="name",
      :label="filterOptions.carTypeId ? getCarTypeName() : 'Машина'",
      header-align="center",
      fixed="left",
    )
    el-table-column(
      v-for="col in cols",
      :label="columns[col] + getDayOfWeek(columns[col])",
      header-align="center",
      class-name="no-escape",
      :key="col",
    )
      template(slot-scope="scope")
        router-link(v-if="scope.row.columns[col].stopType == 1", :to="`/agrofact/map?assignmentId=${scope.row.columns[col].assignmentId}`")
          .inn {{scope.row.columns[col].data}}

        .inn(v-else-if="scope.row.columns[col].stopType == 3", style="text-align: center;")
          p {{scope.row.columns[col].data}}
          router-link(:to="`/agrofact/map?carId=${scope.row.carId}&date=${scope.row.columns[col].formatDate}&tab=car-gps&tabNum=3`", target="_blank")
            el-button(type="primary", size="small") показать трек
        .inn(v-else)

    el-table-column(
      label="Навигация/операции",
      fixed="right",
      header-align="center",
      align="center",
    )
      template(slot-scope="scope")
        el-button(@click="handleClickPrev" type="text" size="big" icon="arrow-left")
        el-button(@click="handleClickNext" type="text" size="big" icon="arrow-right")
  .no-results(v-else) Нет результатов
  el-pagination(
    layout="total, prev, pager, next",
    :total="totalItems",
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

export default {
  mixins: [
    
    ListController
  ],
  data() {
    return {
      filterOptions: {
        carTypeId: null,
        from: moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days"),
        till: moment().set({"year": this.$root.context.year}).endOf("day"),
      },
      workplan: [],
      assignments: [],
      cartypes: [],
      cols: [0, 1, 2, 3, 4],
      perPage: 5,
      currentPage: 1,
      currentCol: 0,
      dayOfWeek: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      loading: true
    }
  },
  created() {
    fetchEntities([
      "assignments",
      "cartypes",
    ], this.afterFetch);
  },
  computed: {
    totalItems: function () {
      return this.filteredData.length;
    },
    paginatedData: function () {
      return this.paginate(this.filteredData)
    },
    columns: function () {
      let columns = []
      let from = this.filterOptions.from || new Date(new Date()
        .getTime() - (5 * 24 * 60 * 60 * 1000))
      let start = new Date(from)
      start.setDate(start.getDate() + this.currentCol * 5)
      for (var i = 0; i < 5; i++) {
        let date = new Date(start);
        columns.push(moment(date).format("DD.MM.YYYY"))
        start.setDate(start.getDate() + 1)
      }
      return columns
    },
    filteredData: function () {
      this.currentCol = 0
      let from = this.filterOptions.from || new Date(new Date()
        .getTime() - (5 * 24 * 60 * 60 * 1000))
      let till = this.filterOptions.till || Date.now()
      return this.workplan.filter(record => {
        let carType = record.carTypeId === this.filterOptions.carTypeId || !this.filterOptions.carTypeId
        return carType && record.columns.filter(c => {
          let d = new Date(c.date)
          return (d >= from && d <= till)
        })
      })
        .sort((a, b) => b.columns.length - a.columns.length)
    },
    tableData: function () {
      if (this.paginatedData.length) this.loading = true
      let tableData = this.paginatedData.map(row => {
        return {
          "name": row.name,
          "carTypeId": row.carTypeId,
          "carId": row.carId,
          "columns": this.columns.map(col => {
            let res = ""
            let ass = ""
            let resDate = ""
            let formatResDate = ""
            let stopType = 0
            for (let i = 0, n = row.columns.length; i < n; i++) {
              let colDate = col.slice(3, 6) + col.slice(0, 3) + col.slice(6)
              let d = new Date(row.columns[i].date)
              let d1 = moment(colDate).format("DD.MM.YYYY")
              let d2 = moment(d).format("DD.MM.YYYY")
              if (d1 === d2) {
                res = row.columns[i].data
                ass = row.columns[i].assignmentId
                resDate = row.columns[i].date
                formatResDate = moment(row.columns[i].date).format("DD/MM/YYYY")
                stopType = row.columns[i].stopType
                break
              }
            }
            return {
              "data": res,
              "assignmentId": ass,
              "stopType": stopType,
              "date": resDate,
              "formatDate": formatResDate
            }
          })
        }
      })
      if (this.paginatedData.length) this.loading = false
      return tableData
    },
  },
  methods: {
    afterFetch() {
      this.assignments = fromVuex("assignments")
      this.cartypes = fromVuex("cartypes")
      if (this.cartypes && this.cartypes.length) this.filterOptions.carTypeId = this.cartypes[0].id
      this.getWorkPlan()
    },
    getWorkPlan() {
      this.loading = true
      let params = this.getParams()
      http.getWithoutCache(`workplan/${params}`)
        .then(data => {
          this.setData(data)
        })
        .catch(() => {
          this.setData([])
        })
    },
    getParams() {
      let params = [], query = []
      params.push(this.$root.context.organization)

      if (!this.filterOptions.from) {
        this.filterOptions.from = moment().set({"year": this.$root.context.year}).startOf("year")
      }
      let date = moment(this.filterOptions.from).format("YYYY-MM-DDTHH:mm:ss")
      let from = `start=${date}`
      query.push(from)

      if (!this.filterOptions.till) {
        this.filterOptions.till = moment().set({"year": this.$root.context.year}).endOf("year")
      }
      date = moment(this.filterOptions.till).format("YYYY-MM-DDTHH:mm:ss")
      let to = `end=${date}`
      query.push(to)

      let carTypeId = `carTypeId=${this.filterOptions.carTypeId}`
      query.push(carTypeId)

      if (query.length) {
        query = "?" + query.join("&")
        params.push(query)
      }
      return params.join("")
    },
    setData(data) {
      this.workplan = data
        .map(wp => {
          if (wp.columns.length) {
            wp.columns.map(c => {
              c.fieldName = c.data.substring( c.data.indexOf("\r\n") + 2, c.data.indexOf("га") + 2 )
              let assignment = this.assignments.find(f => f.fieldNewName === c.fieldName)
              c.assignmentId = assignment ? assignment.id : null
              return c
            })
          }
          return wp
        })
      this.loading = false
    },
    getDayOfWeek(d) {
      let date = d.substr(3, 3) + d.substr(0, 3) + d.substr(6, 4)
      let number = new Date(date)
        .getDay()
      let dayOfWeek = this.dayOfWeek[number]
      return "\n" + dayOfWeek
    },
    getCarTypeName() {
      return this.cartypes.filter(c => this.filterOptions.carTypeId === c.id)[0].name
    },
    handleClickNext() {
      let max = moment(this.filterOptions.till).diff(moment(this.filterOptions.from), "days")
      this.currentCol = Math.min(this.currentCol + 1, Math.floor(max / 5));
    },
    handleClickPrev() {
      this.currentCol = Math.max(this.currentCol - 1, 0);
    },
    exportTable(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let endpoint = "workplan";
          let filename = "Календарь работ";
          let body = {
            OrganizationId: this.$root.context.organization,
            date: {
              start: moment(this.filterOptions.from).format("YYYY-MM-DDTHH:mm:ss"),
              end: moment(this.filterOptions.till).format("YYYY-MM-DDTHH:mm:ss"),
            },
            carTypeId: this.filterOptions.carTypeId
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
<style>
.tableHeading {
  margin-right: 20px;
}

.no-escape>.cell {
  white-space: pre-line;
  padding: 0;
}
.inn {
  padding: 5px 18px;
  font-size: 12px;
}
.inn p{
  margin: 0 0 5px;
  width: 100%;
}
.cell a{
  color: #1f2d3d;
  text-decoration: none;
}
</style>
