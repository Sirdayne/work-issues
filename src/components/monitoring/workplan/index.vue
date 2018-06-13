<template lang="pug">
div
  el-form(
    :model="item",
    :inline="true",
    ref="form",
    :label-position="'top'"
  )
    el-form-item(label="Дата от")
      el-date-picker(v-model="item.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="item.selectedDate.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Тип техники", prop="carTypeId")
      el-select(v-model="item.carTypeId" clearable placeholder="Выбрать")
        el-option(
          v-for="c in cartypes",
          :label="c.name",
          :value="c.id",
          :key="c.id",
          )

  h2(class="tableHeading") Календарь работ
    span(:style="{marginRight: '30px'}")
    el-button.excel(type='default', @click="exportTable('form')") .
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
      :label="item.carTypeId ? getCarTypeName() : 'Машина'",
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
        router-link(v-if="scope.row.columns[col].stopType == 1", :to="`/agrofact/map/${scope.row.columns[col].assignmentId}`")
          .inn {{scope.row.columns[col].data}}

        .inn(v-else-if="scope.row.columns[col].stopType == 3", style="text-align: center;")
          p {{scope.row.columns[col].data}}
          router-link(:to="`/agrofact/map?carIdTabOpen=${scope.row.carId}&carGpsDate=${scope.row.columns[col].formatDate}`", old="`/agrofact/map?carId=${scope.row.carId}&date=${scope.row.columns[col].date}`", target="_blank")
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
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  data() {
    return {
      item: {
        carTypeId: null,
        selectedDate: {
          from: moment().set({'year': this.$root.context.year, 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}).subtract(5, "days"),
          till: moment().set({'year': this.$root.context.year, 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999}),
        }
      },
      cols: [0, 1, 2, 3, 4],
      perPage: 5,
      currentPage: 1,
      currentCol: 0,
      dayOfWeek: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      loading: true
    }
  },
  created() {
    this.fetchEntities([
      'workplan',
      'cartypes',
      'assignments']);
  },
  computed: {
    workplan() {
      return this.fromVuex('workplan').map(wp => {
        if (wp.columns.length > 0) {
          wp.columns.map(c => {
            c.fieldName = c.data.substring( c.data.indexOf("\r\n") + 2, c.data.indexOf("га") + 2 )
            c.assignmentId = this.assignments.find(f => f.fieldNewName === c.fieldName)
            c.assignmentId = c.assignmentId ? c.assignmentId.id : null
            return c
          })
        }
        return wp
      })
    },
    assignments() {
      return this.fromVuex('assignments')
    },
    cartypes() {
      let cartypes = this.fromVuex('cartypes')
      if (cartypes && cartypes.length === 1) this.item.carTypeId = cartypes[0].id
      return cartypes
    },
    totalItems: function () {
      return this.filteredData.length;
    },
    paginatedData: function () {
      return this.paginate(this.filteredData)
    },
    columns: function () {
      let columns = []
      let from = this.item.selectedDate.from || new Date(new Date()
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
      let from = this.item.selectedDate.from || new Date(new Date()
        .getTime() - (5 * 24 * 60 * 60 * 1000))
      let till = this.item.selectedDate.till || Date.now()
      return this.workplan.filter(record => {
          let carType = record.carTypeId === this.item.carTypeId || !this.item.carTypeId
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
                formatResDate = moment(row.columns[i].date).format('DD/MM/YYYY')
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
    getDayOfWeek(d) {
      let date = d.substr(3, 3) + d.substr(0, 3) + d.substr(6, 4)
      let number = new Date(date)
        .getDay()
      let dayOfWeek = this.dayOfWeek[number]
      return '\n' + dayOfWeek
    },
    getCarTypeName() {
      return this.cartypes.filter(c => this.item.carTypeId === c.id)[0].name
    },
    handleClickNext() {
      let max = moment(this.item.selectedDate.till).diff(moment(this.item.selectedDate.from), "days")
      this.currentCol = Math.min(this.currentCol + 1, Math.floor(max / 5));
    },
    handleClickPrev() {
      this.currentCol = Math.max(this.currentCol - 1, 0);
    },
    exportTable(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let endpoint = "WorkPlanForm";
          let filename = "Календарь работ";

          let body = {
            OrganizationId: this.$root.context.organization,
            Date: {
              start: moment(this.item.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss"),
              end: moment(this.item.selectedDate.till).format("YYYY-MM-DDTHH:mm:ss"),
            },
            carTypeId: this.item.carTypeId || -1
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
