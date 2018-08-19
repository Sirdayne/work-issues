<template lang="pug">
.el-table-cont
  el-table(
    :data="paginate(tableData)",
    resizable,
    border,
    v-loading="loading",
    :max-height="maxHeight",
  ).content
    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
    el-table-column(label="", align="center", width="100")
      el-button-group(slot-scope="scope")
        el-button(@click="edit(scope.row.id)", size="small", icon="edit", title="редактировать")
        el-button(@click="remove(scope.row.id)", size="small", icon="delete2", title="удалить")
  el-pagination(
    layout="total, sizes, prev, pager, next",
    :total="tableData.length",
    :page-size="page.size",
    :page-sizes="page.sizes",
    :current-page.sync="page.current",
    @current-change="handlePageChange",
    @size-change="handleSizeChange",
  )
</template>
<script>
import http from "services/http"
import {fromVuex} from "services/RecordsLoader"
import {deepClone} from "lib/utils";
import modByLib from "lib/modByLib";
import moment from "moment"
import {EventBus} from "services/EventBus"
import WindowResize from "mixins/window-resize"

export default {
  name: "OrderForShipmentTable",
  props: {
    "columns": {
      type: Array,
      default: [],
    },
    "filterOptions": {
      type: Object,
      default: {},
    },
    "sortOptions": {
      type: Object,
      default: {},
    },
  },
  mixins: [
    WindowResize,
  ],
  data() {
    return {
      cols: [],
      tableData: [],
      loading: null,
      page: {
        current: 1,
        size: 5,
        sizes: [5, 10, 15, 20, 25],
      },
      maxHeight: 450,
    }
  },
  watch: {
    columns: {
      handler: function (val, oldVal) {
        this.cols = deepClone(val)
      },
      deep: true
    },
    ["filterOptions"](val, oldVal) {
      this.loadOrders()
    },
    ["sortOptions"](val, oldVal) {
      this.sortOrders()
    },
  },
  updated() {
    modByLib.addTooltips(this.paginate(this.tableData));
  },
  created() {
    this.initPagination()
    this.loading = true
    this.cols = deepClone(this.columns)
    this.initTable()
  },
  mounted() {
    EventBus.$on("WindowResize.windowInnerHeight", (windowInnerHeight) => {
      this.maxHeight = windowInnerHeight - (60 + 10 + 36 + 10 + 36.25 + 10 + 32 + 10)
    })
  },
  methods: {
    initTable() {
      if (this.filterOptions) this.loadOrders()
    },
    loadOrders() {
      this.loading = true
      http.getWithoutCache(`orderforshipment/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.$store.dispatch("actionAddEntities", {name: "orderforshipment", data: data})
          this.setOrders(deepClone(data))
        })
        .catch(() => {
          this.setOrders([])
        })
    },
    setOrders(orders) {
      let filtered = this.filterOrders(orders)
      let formatted = this.formatOrders(filtered)
      this.tableData = formatted
      this.sortOrders()
      this.loading = false
    },
    filterOrders(orders) {
      return orders.filter(a => {
        let from = !this.filterOptions.from || moment(a.date, "YYYY-MM-DDTHH:mm:ss").isSameOrAfter(moment(this.filterOptions.from))
        let till = !this.filterOptions.till || moment(a.date, "YYYY-MM-DDTHH:mm:ss").isSameOrBefore(moment(this.filterOptions.till))
        let date = from && till
        let culture = !this.filterOptions.cultureIds.length || this.filterOptions.cultureIds.includes(a.cultureName)
        let finalproducttypes = !this.filterOptions.finalProductTypeIds.length || this.filterOptions.finalProductTypeIds.includes(a.finalProductTypeName)
        let storage = !this.filterOptions.storageIds.length || this.filterOptions.storageIds.includes(a.storageId)
        let cond = date && culture && finalproducttypes && storage
        return cond
      })
    },
    sortOrders() {
      this.tableData = this.tableData
        .sort((a, b) => {
          let date = (new Date(a.date) - new Date(b.date)) * this.sortOptions.date
          let dateModified = (new Date(a.dateModified) - new Date(b.dateModified)) * this.sortOptions.dateModified
          return date || dateModified
        })
    },
    formatOrders(filteredOrders) {
      return filteredOrders
        .map(a => {
          a.formattedDate = moment(a.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
          let culture = fromVuex("cultures").find(s => s.id == a.cultureId)
          a.culture = culture && culture.name
          this.getProductCategory(a)
          let storage = fromVuex("storages").find(s => s.id == a.storageId)
          a.storage = storage && storage.name
          let smell = fromVuex("qualitytypevaluecodes").find(q => q.qualityTypeId == 7 && q.id == a.qualityTypeValueCodeId)
          a.smell = smell && smell.name
          let inventoryanalysiscard = fromVuex("inventoryanalysiscards").find(s => s.id == a.inventoryAnalysisCardId)
          a.number = inventoryanalysiscard && inventoryanalysiscard.number
          let shipper = fromVuex("customorganizations").find(s => s.id == a.shipperId)
          a.shipper = shipper && shipper.name
          let consignee = fromVuex("customorganizations").find(s => s.id == a.consigneeId)
          a.consignee = consignee && consignee.name
          return a
        })
    },
    getProductCategory(a) {
      let productCategory, finalProductType
      if (a.categoryId) {
        productCategory = fromVuex("finalproducts").find(s => s.id == a.categoryId)
        finalProductType = 1
      } else if (a.sortId) {
        productCategory = fromVuex("sorts").find(s => s.id == a.sortId)
        finalProductType = 2
      } else if (a.grainWaste) {
        productCategory = fromVuex("grainwastes").find(s => s.id == a.grainWaste)
        finalProductType = 3
      }
      a.productCategory = productCategory && productCategory.name
      a.finalProductType = fromVuex("finalproducttypes").find(s => s.id == finalProductType).name
    },
    edit(id) {
      this.$emit("edit", id)
    },
    remove(id) {
      this.$confirm("Действительно удалить?", "Внимание", {
        confirmButtonText: "OK",
        cancelButtonText: "Отмена",
        type: "warning"
      }).then(() => {
        http.delete("orderforshipment", id).then(() => {
          this.loadOrders()
        })
      })
    },
    initPagination() {
      this.page.size = +localStorage.getItem("order-for-shipment/pageSize") || 5
      this.page.sizes[this.page.sizes.findIndex(p => p == this.page.size)] = 5
      this.page.sizes[0] = this.page.size
    },
    paginate(table) {
      let from = (this.page.current - 1) * this.page.size
      let till = this.page.current * this.page.size
      return table.slice(from, till)
    },
    handlePageChange(num) {
      this.page.current = num
      modByLib.addTooltips(this.paginate(this.tableData));
    },
    handleSizeChange(num) {
      this.page.size = num
      localStorage.setItem("order-for-shipment/pageSize", +num)
      modByLib.addTooltips(this.paginate(this.tableData));
    },
  },
}
</script>
<style lang="stylus" scoped>
.processed-status-circle
  height 10px
  width 10px
  border-radius 50%
  margin 0 auto
.red
  background-color red
.yellow
  background-color yellow
.green
  background-color green
</style>
