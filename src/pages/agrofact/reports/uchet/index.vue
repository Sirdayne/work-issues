<template lang="pug">
div
  el-dialog(:visible.sync="editFormVisible", title="Редактирование доплаты", size="tiny")
    el-form(label-position="top")
      template(v-for="c in editItem.conditions")
        el-form-item(:label="c.workConditionName")
          el-input.form-input(type="number", v-model.number="c.additional", min="0", :max="c.defaultAdditional")
      el-form-item(label="Примечание")
        el-input.form-input(type="text", v-model="editItem.note")
      el-form-item(align="center")
        el-button-group
          el-button(@click="save()", type="primary", :loading="loadingItem.save") Применить
          el-button(@click="close()") Отменить
  el-form(:model="item", ref="form", :inline="true", label-position="top")
    el-form-item(label="Дата от")
      el-date-picker(v-model="item.date.start", format="dd.MM.yyyy", placeholder="Выберите дату", :clearable="dateClearable")
    el-form-item(label="Дата до")
      el-date-picker(v-model="item.date.end", format="dd.MM.yyyy", placeholder="Выберите дату", :clearable="dateClearable")
    el-form-item(label="ФИО водителя")
      el-select(v-model="item.employeeId", placeholder="Выбрать", filterable)
        el-option(v-for="e in employees", :key="e.id", :label="e.fullName", :value="e.id")
    el-form-item.invisible-color(label=".")
      el-button(type="primary", @click="getData()", :loading="loadingItem.show", :disabled="!item.employeeId") Показать
  h2 Учетный лист
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="exportTable()") .
    el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
    el-dialog(:visible.sync="filterVisible", title="Фильтр", size="tiny")
      el-form(label-width="90px")
        el-form-item(label="Машина")
          el-select(v-model="filterModel.carId", filterable, clearable)
            el-option(v-for="c in filterModelData.cars", :label="c.displayString", :value="c.id", :key="c.id")
        el-form-item
          el-button-group
            el-button(@click="applyFilter()", type="primary") Применить
            el-button(@click="clearFilter()") Сбросить
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loadingItem.show",
      max-height="500",
    ).content
      el-table-column(prop="areaAssignmentId", label="№")
      el-table-column(prop="fieldName", label="Поле")
      el-table-column(prop="cultureName", label="Культура")
      el-table-column(prop="subOperationName", label="Работа")
      el-table-column(prop="instrumentName", label="Инструмент")
      el-table-column(prop="dateTimeRange", label="Отработано часов")
      el-table-column(prop="rateOfOutput", label="Норма выработки")
      el-table-column(prop="tarifCost", label="Расценка")
      el-table-column(label="Фактически выполнено	")
        el-table-column(prop="processSquare", label="в натуре")
        el-table-column(prop="replacementRates", label="сменных норм")
      el-table-column(label="Оплата труда")
        el-table-column(prop="salary", label="основная")
        el-table-column(prop="additional", label="дополнительная")
        el-table-column(prop="totalSalary", label="всего")
      el-table-column(label="Расход горючего по норме")
        el-table-column(prop="fuelConsumption", label="на единицу работы")
        el-table-column(prop="fuelInLitres", label="всего")
      el-table-column(label="Применить коэффициент поля")
        template(slot-scope="scope")
          el-checkbox(v-model="scope.row.appliedFieldCoefficient", @change="updateAFC(scope.row)", :disabled="disabledItem.afc")
      el-table-column(prop="note", label="Примечание")
      el-table-column(width="80")
        el-button-group(slot-scope="scope")
          el-button(@click="edit(scope.row.areaAssignmentId)", size="small", icon="edit", title="редактировать")
    el-pagination(
      layout="total, prev, pager, next",
      :total="tableData.length",
      :page-size="perPage",
      :current-page="currentPage",
      style="margin-top: 10px;",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )
</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import paginate from "mixins/paginate"
import moment from "moment"
import {deepClone} from "lib/utils"
import {uniq} from "lib/utils"

export default {
  mixins: [
    
    paginate,
  ],
  data() {
    return {
      item: {
        date: {
          start: new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days")),
          end: new Date(moment().set({"year": this.$root.context.year}).endOf("day")),
        },
        organizationId: this.$root.context.organization,
        employeeId: null,
      },
      loadingItem: {
        show: false,
        save: false,
      },
      disabledItem: {
        afc: false,
      },
      employees: [],
      tableData: [],
      recordsheetreport: [],
      filterModelData: {
        cars: []
      },
      filterModel: {
        carId: null,
      },
      filterVisible: false,
      perPage: 5,
      currentPage: 1,
      dateClearable: false,
      editItem: {},
      editItemClone: {},
      editFormVisible: false,
    }
  },
  created() {
    fetchEntities([
      "employees",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.employees = fromVuex("employees")
    },
    getData() {
      this.loadingItem.show = true
      let body = deepClone(this.item)
      body.date.start = moment(body.date.start).format("YYYY-MM-DDTHH:mm:ss")
      body.date.end = moment(body.date.end).format("YYYY-MM-DDTHH:mm:ss")
      http.post("RecordSheetReport", body)
        .then((data) => {
          this.setData(data)
        })
        .catch(() => {
          this.setData([])
        })
    },
    setData(data) {
      this.recordsheetreport = data
      this.tableData = deepClone(this.recordsheetreport)
      this.initFilter()
      this.loadingItem.show = false
    },
    initFilter() {
      let recordsheetreport = deepClone(this.recordsheetreport)
      let cars = recordsheetreport.map(rsr => {
        return {id: rsr.carId, displayString: rsr.carName}
      })
      this.filterModelData.cars = uniq(cars)
    },
    applyFilter() {
      this.filterVisible = false
      let tableData = this.recordsheetreport
        .filter(td => {
          let car = !this.filterModel.carId || this.filterModel.carId == td.carId
          let cond = car
          return cond
        })
      this.tableData = deepClone(tableData)
    },
    clearFilter() {
      this.filterModel.carId = null
      this.applyFilter()
    },
    edit(id) {
      let editItem = this.recordsheetreport.find(rsr => rsr.areaAssignmentId == id)
      this.editItem = deepClone(editItem)
      this.editItemClone = deepClone(editItem)
      this.editFormVisible = true
    },
    save() {
      this.loadingItem.save = true
      let promises = this.getPromises()
      http.all(promises)
        .then(() => {
          this.loadingItem.save = false
          this.close()
          this.getData()
        })
        .catch(() => {
          this.loadingItem.save = false
          this.close()
        })
    },
    getPromises() {
      let promises = [], promise
      promise = new Promise((resolve, reject) => {
        http.put("RecordSheetReport", this.editItem)
          .then(() => resolve())
          .catch(() => reject())
      })
      promises.push(promise)
      return promises
    },
    updateAFC(item) {
      this.disabledItem.afc = true
      http.put(`RecordSheetReport/AppliedFieldCoefficient?assignmentId=${item.areaAssignmentId}&AppliedFieldCoefficient=${item.appliedFieldCoefficient}`, null)
        .then(() => {
          this.disabledItem.afc = false
          this.close()
          this.getData()
        })
        .catch(() => {
          this.disabledItem.afc = false
          this.close()
        })
    },
    close() {
      this.editItem = {}
      this.editFormVisible = false
    },
    exportTable() {
      let endpoint = "RecordSheet";
      let filename = "Учетный лист тракториста-машиниста";
      let body = deepClone(this.item)
      body.date.start = moment(body.date.start).format("YYYY-MM-DDTHH:mm:ss")
      body.date.end = moment(body.date.end).format("YYYY-MM-DDTHH:mm:ss")
      http.downloadXLS(endpoint, body, filename);
    },
  }
}
</script>
<style lang="stylus" scoped>
.form-input
  width 193px
  max-width 193px
</style>
