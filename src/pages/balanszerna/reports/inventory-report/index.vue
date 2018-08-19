<template lang="pug">
div(v-loading="loading")
  el-form(inline, :label-position="'top'", :model="item", v-loading="loadingItem.inventory")
    el-form-item(label="Дата до")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="ТОК")
      el-select(v-model.number="item.warehouseId", filterable, clearable, :disabled="!item.date", @change="setStorages")
        el-option(v-for="w in warehouses", :label="w.name", :value="w.id", :key="w.id")
    template(v-if="storages.length")
      el-form-item.form-item-iterable(label="Склад")
        el-select(v-model.number="item.storageId", filterable, clearable, :disabled="loadingItem.inventory", @change="getInventory")
          el-option(v-for="s in storages", :label="s.name", :value="s.id", :key="s.id")
    template(v-if="inventories.length")
      el-form-item.form-item-iterable(label="Партия")
        el-select(v-model.number="item.inventoryId", filterable, clearable, @change="getInventoryReportItems")
          el-option(v-for="i in inventories", :label="i.name", :value="i.inventoryId", :key="i.inventoryId")
  h2.func-bar Отчет движения партии
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="getInventoryReport()", :disabled="!item.inventoryId") .
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      resizable,
      border,
      max-height="500",
    ).content
      el-table-column(v-for="col in inventoryReportCols", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
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
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import moment from "moment"
import paginate from "mixins/paginate"
import {uniq} from "lib/utils"
import {deepClone} from "lib/utils"

export default {
  mixins: [
    
    paginate,
  ],
  data() {
    return {
      inventoryReportCols: [
        {prop: "date", label: "Дата"},
        {prop: "operationName", label: "Операция"},
        {prop: "transferId", label: "ID трансфера"},
        {prop: "startWeight", label: "Остаток на начало"},
        {prop: "incomingWeight", label: "Приход"},
        {prop: "outgoingWeight", label: "Расход"},
        {prop: "endWeight", label: "Остаток на конец"},
      ],
      inventoryTableData: [],
      tableData: [],
      warehouses: [],
      storages: [],
      inventories: [],
      item: {
        warehouseId: null,
        storageId: null,
        inventoryId: null,
        date: moment().set({"year": this.$root.context.year}).startOf("day"),
      },
      loadingItem: {
        inventory: false,
      },
      perPage: 5,
      currentPage: 1,
      loading: false,
    }
  },
  watch: {
    "item.date"(val, oldVal) {
      this.resetWarehouse()
    },
  },
  created() {
    fetchEntities([
      "warehouses",
      "storages",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.warehouses = fromVuex("warehouses")
    },
    resetWarehouse() {
      this.item.warehouseId = null
    },
    reset() {
      this.item.inventoryId = null
      this.inventories = []
      this.setTableData([])
    },
    setStorages(warehouseId) {
      this.item.storageId = null
      this.reset()
      if (warehouseId) {
        this.storages = fromVuex("storages").filter(s => s.warehouseId == warehouseId)
      } else {
        this.storages = []
      }
    },
    getInventory(storageId) {
      this.reset()
      if (storageId) {
        this.loadingItem.inventory = true
        let item = deepClone(this.item, true)
        let body = {
          storageId: storageId,
          date: moment(item.date).format("YYYY-MM-DDTHH:mm:ss")
        }
        http.post("inventoryinformations", body)
          .then((data) => {
            this.inventories = uniq(data, "inventoryId")
            this.loadingItem.inventory = false
          })
          .catch(() => {
            this.loadingItem.inventory = false
          })
      }
    },
    getInventoryReportItems(inventoryId) {
      this.setTableData([])
      if (inventoryId) {
        this.loading = true
        let item = deepClone(this.item)
        let body = {
          inventoryId: inventoryId,
          date: moment(item.date).format("YYYY-MM-DDTHH:mm:ss")
        }
        http.post("inventoryreportitems", body)
          .then((data) => {
            this.setTableData(data)
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    setTableData(data) {
      this.tableData = data
    },
    getInventoryReport() {
      let api = "inventoryreport";
      let filename = "Отчет движения партии";
      let item = deepClone(this.item)
      let body = {
        inventoryId: item.inventoryId,
        date: moment(item.date).format("YYYY-MM-DDTHH:mm:ss")
      };
      http.downloadXLS(api, body, filename);
    },
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
</style>
