<template lang="pug">
div
  el-form(:model="item", :inline="true", :rules="rules", ref="form", label-position="top")
    el-form-item(label="Дата от")
      el-date-picker(v-model="item.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="item.selectedDate.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="ТОК", prop="warehouseId")
      el-select(v-model="item.warehouseId", clearable, placeholder="Выбрать", @change="warehouseChange")
        el-option(v-for="w in warehouses", :key="w.id", :label="w.name", :value="w.id")
    el-form-item(label="Культура", prop="cultureId")
      el-select(v-model="item.cultureId", clearable, placeholder="Выбрать", filterable)
        el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.id")
  h2 Журнал весовщика - прием
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="exportTable('form')") .
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
      max-height="500",
    ).content
      el-table-column(prop="rowNumber", label="Номер записи", header-align="center", width="110")
      el-table-column(prop="date", label="Дата", header-align="center", width="180")
      el-table-column(prop="field", label="№ поля", header-align="center", width="110")
      el-table-column(prop="area", label="Площадь", header-align="center", width="170")
      el-table-column(prop="culture", label="Культура", header-align="center", width="120")
      el-table-column(label="Водитель", header-align="center", width="120")
        template(slot-scope="scope")
          span(:class="scope.row.isManuallyEnteredDriver ? 'black' : 'red'") {{scope.row.driver}}
      el-table-column(label="Автомашина", header-align="center")
        el-table-column(label="марка", header-align="center", width="120")
          template(slot-scope="scope")
            span(:class="scope.row.isManuallyEnteredCar ? 'black' : 'red'") {{scope.row.carModel}}
        el-table-column(label="гос номер", header-align="center", width="120")
          template(slot-scope="scope")
            span(:class="scope.row.isManuallyEnteredCar ? 'black' : 'red'") {{scope.row.stateNumber}}
        el-table-column(label="хоз номер", header-align="center", width="120")
          template(slot-scope="scope")
            span(:class="scope.row.isManuallyEnteredCar ? 'black' : 'red'") {{scope.row.organizationNumber}}
      el-table-column(label="вес, кг", header-align="center")
        el-table-column(label="брутто", header-align="center", width="120")
          template(slot-scope="scope")
            span(:class="scope.row.isManuallyEnteredWeightBrutto1 ? 'black' : 'red'") {{scope.row.weightBrutto}}
        el-table-column(label="тара", header-align="center", width="120")
          template(slot-scope="scope")
            span(:class="scope.row.isManuallyEnteredWeightTare1 ? 'black' : 'red'") {{scope.row.weightOfTare}}
        el-table-column(label="нетто", header-align="center", width="120")
          template(slot-scope="scope")
            span(:class="!scope.row.isManuallyEnteredWeightBrutto1 || !scope.row.isManuallyEnteredWeightTare1 ? 'red': 'black'") {{scope.row.weightNetto}}
      el-table-column(label="определяется при взвешивании", header-align="center")
        el-table-column(prop="arrivalTime", label="Время прибытия", header-align="center", width="120")
        el-table-column(prop="departureTime", label="Время убытия", header-align="center", width="120")
      el-table-column(prop="loadingTime", label="время погрузки/разгрузки", header-align="center", width="120")
      el-table-column(prop="isFingerSignature", label="подпись водителя", header-align="center", width="120")
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
import {EventBus} from "services/EventBus"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import moment from "moment"
import paginate from "mixins/paginate"

export default {
  mixins: [
    
    paginate
  ],
  data() {
    return {
      cultures: [],
      incomingtransfers: [],
      warehouses: [],
      item: {
        warehouseId: null,
        cultureId: null,
        culture: "",
        selectedDate: {
          from: new Date(this.$root.context.year + "-05-01"),
          till: new Date()
        }
      },
      rules: {
        warehouseId: [
          {required: true, type: "integer", message: "Поле обязательно", trigger: "change"}
        ]
      },
      perPage: 5,
      currentPage: 1,
      loading: false,
    }
  },
  computed: {
    tableData() {
      let fromDate = this.item.selectedDate.from
      let tillDate = this.item.selectedDate.till
      let warehouseId = this.item.warehouseId
      let cultureId = this.item.cultureId
      let tableData = this.incomingtransfers.filter((record) => {
        let ourDate = new Date(moment(record.date, "DD/MM/YYYY").format("YYYY-MM-DD"))
        let dateBigger = (ourDate >= fromDate) || !fromDate
        let dateLess = (ourDate <= tillDate) || !tillDate
        let warehouse = record.warehouseId === warehouseId || !warehouseId
        let culture = record.cultureId === cultureId || !cultureId
        return dateBigger && dateLess && warehouse && culture
      })
      return tableData
    },
  },
  created() {
    EventBus.$on("AppYearChanged", (year) => {
      this.item.selectedDate.from = moment(this.item.selectedDate.from).set({"year": year});
      this.item.selectedDate.till = moment(this.item.selectedDate.till).set({"year": year});
    });
    EventBus.$on("App.Context.OrganizationChanged", (orgId) => {
      localStorage.removeItem("warehouseId");
    });
    this.loading = true
    fetchEntities([
      "cultures",
      "incomingtransfers",
      "warehouses",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.cultures = fromVuex("cultures")
      this.incomingtransfers = fromVuex("incomingtransfers")
      this.warehouses = fromVuex("warehouses").filter(w => w.warehouseType == 2)
      this.setWarehouseId()
      this.loading = false
    },
    setWarehouseId() {
      if (this.warehouses.length) {
        this.item.warehouseId = this.warehouses[0].id
        let localWarehouseId = localStorage.getItem("warehouseId");
        if (localWarehouseId) {
          this.item.warehouseId = +localWarehouseId;
        } else {
          localStorage.setItem("warehouseId", this.item.warehouseId);
        }
      }
    },
    warehouseChange(value) {
      localStorage.setItem("warehouseId", value);
    },
    exportTable(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let endpoint        = "IncomingTransferReport";
          let filename        = "Журнал весовщика(прием зерна с поля)";
          let body = {
            CultureId: this.item.cultureId,
            WarehouseId: this.item.warehouseId,
            Date: {
              start: moment(this.item.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss"),
              end: moment(this.item.selectedDate.till).format("YYYY-MM-DDTHH:mm:ss"),
            },
            OrganizationId: this.$root.context.organization,
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

<style lang="stylus" scoped>
.black
  color inherit
.red
  color red
</style>
