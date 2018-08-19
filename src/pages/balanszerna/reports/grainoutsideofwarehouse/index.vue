<template lang="pug">
.grainoutsideofwarehouse(v-loading="loading")
  el-dialog(:visible.sync="dialogVisibleEdit", title="Редактирование")
    edit(:form="form")
  el-dialog(:visible.sync="dialogVisibleCreate", title="Создание")
    create(:form="form")

  el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
    el-form(:model="filterModel", label-width="130px", label-position="left")
      el-form-item(label="Место разгрузки")
        el-select(v-model="filterModel.storageId", clearable, filterable)
          el-option(
          v-for="item in storages",
          :label="item.name",
          :value="item.id",
          :key="item.id",
          )
      el-form-item(label="Культура")
        el-select(v-model="filterModel.cultureId", clearable, filterable)
          el-option(
          v-for="item in cultures",
          :label="item.name",
          :value="item.id",
          :key="item.id",
          )
      el-form-item(label="Поле")
        el-select(v-model="filterModel.fieldId", clearable, filterable)
          el-option(
          v-for="item in fields",
          :label="item.newName",
          :value="item.id",
          :key="item.id",
          )
      el-form-item(label="Запах")
        el-select(v-model="filterModel.qualityTypeValueCodeId", clearable, filterable)
          el-option(
          v-for="item in qualitytypevaluecodes",
          :label="item.name",
          :value="item.id",
          :key="item.id",
          )
      el-form-item(label="Автомобиль")
        el-select(v-model="filterModel.carId", clearable, filterable)
          el-option(
          v-for="item in cars",
          :label="item.displayString",
          :value="item.id",
          :key="item.id",
          )
      el-form-item(label="ФИО водителя")
        el-select(v-model="filterModel.employeeId", clearable, filterable)
          el-option(
          v-for="item in employees",
          :label="item.fullName",
          :value="item.id",
          :key="item.id",
          )
      el-form-item(label="Пользователь")
        el-select(v-model="filterModel.cropBalanceUserId", clearable, filterable)
          el-option(
          v-for="item in cropbalanceusers",
          :label="item.userName",
          :value="item.id",
          :key="item.id",
          )
      el-form-item
        el-button(@click="resetFilter") Сбросить

  el-form(:inline="true", label-position="top")
    el-form-item(label="Дата от")
      el-date-picker(v-model="selectedDateFrom", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="selectedDateTill", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label=".")
      el-button.filter(
        @click="filterUnfolded = true",
        type="default",
        class="tf-filter"
      ) .
    el-form-item(label=".")
      el-button(@click="createForm()") Новая запись
  h2.func-bar Журнал учета продукции вне тока
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="getGrainOutsideOfWarehouse()") .
  .el-table-cont
    el-table(
    :data="paginate(tableData)",
    border,
    resizable,
    v-loading="loading",
    max-height="500",
    ).content
      el-table-column(prop="storageName", label="Место разгрузки", header-align="center")
      el-table-column(prop="dateBookmarkFormat", label="Дата закладки", header-align="center")
      el-table-column(prop="cultureName", label="Культура", header-align="center")
      el-table-column(prop="cropYear", label="Год урожая", header-align="center")
      el-table-column(prop="fieldName", label="Поле", header-align="center")
      el-table-column(prop="humidity", label="Влажность %", header-align="center")
      el-table-column(prop="qualityTypeValueCodeName", label="Запах", header-align="center")
      el-table-column(prop="carName", label="Автомобиль", header-align="center")
      el-table-column(prop="employeeName", label="ФИО водителя", header-align="center")
      el-table-column(prop="cropBalanceUserName", label="Пользователь", header-align="center")
      el-table-column(label="", width="80")
        el-button-group(slot-scope="scope")
          el-button(@click="editForm(scope.row)", size="small", icon="edit", title="Редактировать")
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
import modByLib from "lib/modByLib"
import http from "services/http"
import {EventBus} from "services/EventBus"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"
import paginate from "mixins/paginate"
import edit from "./edit"
import create from "./create"

export default {
  mixins: [
    
    ListController,
    paginate
  ],
  components: {
    edit,
    create
  },
  data() {
    return {
      selectedDateFrom: new Date(this.$root.context.year + "-08-01"),
      selectedDateTill: new Date(this.$root.context.year + "-10-01"),
      grainoutsideofwarehouse: [],
      storages: [],
      cultures: [],
      fields: [],
      qualitytypevaluecodes: [],
      cars: [],
      employees: [],
      cropbalanceusers: [],
      perPage: 5,
      currentPage: 1,
      loading: true,
      dialogVisibleEdit: false,
      dialogVisibleCreate: false,
      form: {},
      endpoint: "GrainOutsideOfWarehouse",
    }
  },
  computed: {
    tableData() {
      let tableData = this.grainoutsideofwarehouse.filter(g => {
        let date = new Date(g.dateBookmark)
        let fromDate = this.selectedDateFrom
        let tillDate = this.selectedDateTill
        let isDate = (fromDate <= date) && (tillDate >= date)
        let isStorage = this.filterModel.storageId ? this.filterModel.storageId === g.storageId : true
        let isCulture = this.filterModel.cultureId ? this.filterModel.cultureId === g.cultureId : true
        let isField = this.filterModel.fieldId ? this.filterModel.fieldId === g.fieldId : true
        let isQuality = this.filterModel.qualityTypeValueCodeId ? this.filterModel.qualityTypeValueCodeId === g.qualityTypeValueCodeId : true
        let isCar = this.filterModel.carId ? this.filterModel.carId === g.carId : true
        let isEmployee = this.filterModel.employeeId ? this.filterModel.employeeId === g.employeeId : true
        let isCropBalanceUser = this.filterModel.cropBalanceUserId ? this.filterModel.cropBalanceUserId === g.cropBalanceUserId : true
        return isDate && isStorage && isCulture && isField && isQuality && isCar && isEmployee && isCropBalanceUser
      })
      return tableData
    },
  },
  updated() {
    modByLib.addTooltips(this.paginate(this.tableData));
  },
  created() {
    EventBus.$on("GrainOutsideOfWarehouseChanged", () => {
      this.fetchGrainOutsideOfWarehouse()
    })
    fetchEntities([
      "grainoutsideofwarehouse",
      "storages",
      "cultures",
      "fields",
      "qualitytypevaluecodes",
      "cars",
      "employees",
      "cropbalanceusers"
    ], this.afterFetch);
  },
  methods: {
    fetchGrainOutsideOfWarehouse() {
      this.closeDialogs()
      this.loading = true
      fetchEntities([
        "grainoutsideofwarehouse",
      ], this.afterFetch);
    },
    afterFetch() {
      this.grainoutsideofwarehouse = fromVuex("grainoutsideofwarehouse")
      this.storages = fromVuex("storages")
      this.cultures = fromVuex("cultures")
      this.fields = fromVuex("fields")
      this.qualitytypevaluecodes = fromVuex("qualitytypevaluecodes")
      this.cars = fromVuex("cars")
      this.employees = fromVuex("employees")
      this.cropbalanceusers = fromVuex("cropbalanceusers")
      this.grainoutsideofwarehouse.forEach(g => {
        g.storageName = this.getNameFromId(g.storageId, this.storages)
        g.dateBookmarkFormat = moment(g.dateBookmark).format("DD/MM/YYYY HH:mm:ss")
        g.cultureName = this.getNameFromId(g.cultureId, this.cultures)
        g.fieldName = this.getNameFromId(g.fieldId, this.fields, "newName")
        g.qualityTypeValueCodeName = this.getNameFromId(g.qualityTypeValueCodeId, this.qualitytypevaluecodes)
        g.carName = this.getNameFromId(g.carId, this.cars, "displayString")
        g.employeeName = this.getNameFromId(g.employeeId, this.employees, "fullName")
        g.cropBalanceUserName = this.getNameFromId(g.cropBalanceUserId, this.cropbalanceusers, "userName")
      })
      this.loading = false
    },
    editForm(obj) {
      this.form = obj
      this.dialogVisibleEdit = true
    },
    createForm() {
      this.form = {}
      this.dialogVisibleCreate = true
    },
    getGrainOutsideOfWarehouse() {
      let api = "GrainOutsideOfWarehouseReport";
      let filename = "Журнал учета продукции вне тока";
      let body = {
        OrganizationId: this.$root.context.organization,
        Year: this.$root.context.year
      }
      http.downloadXLS(api, body, filename);
    },
    getNameFromId(id, array, key = "name") {
      let found = array.find(s => s.id === id)
      let out = found ? found[key]: "нет данных"
      return out
    },
    closeDialogs() {
      this.dialogVisibleEdit = false
      this.dialogVisibleCreate = false
    }
  }
}
</script>
<style lang="stylus">
.form-item-iterable
  flex 1 0 auto
  max-width 193px
.func-bar
  flex auto 0 0
  margin 10px 0
  display flex
.grainoutsideofwarehouse
  .el-input
    width 217px
</style>
