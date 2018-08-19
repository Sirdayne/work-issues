<template lang="pug">
.el-table-cont
  el-table(
    :data="tableData",
    resizable,
    border,
    v-loading="loading",
    max-height="400",
  ).content
    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
</template>
<script>
import http from "services/http"
import {fromVuex} from "services/RecordsLoader"
import moment from "moment"

export default {
  name: "OrderForShipmentTableSaved",
  props: {
    "savedData": {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      cols: [
        {prop: "formattedDate", label: "Дата", active: true},
        {prop: "culture", label: "Культура", active: true},
        {prop: "cropYear", label: "Год урожая", active: true},
        {prop: "finalProductType", label: "Тип продукции", active: true},
        {prop: "productCategory", label: "Класс/сорт", active: true},
        {prop: "storage", label: "Место погрузки", active: true},
        {prop: "humidity", label: "Влажность", active: true},
        {prop: "smell", label: "Запах", active: true},
        {prop: "number", label: "Номер карточки", active: true},
        {prop: "shipper", label: "Грузоотправитель", active: true},
        {prop: "consignee", label: "Грузополучатель", active: true},
        {prop: "volumeOfGrain", label: "Объем зерна", active: true},
      ],
      tableData: [],
      loading: null,
    }
  },
  created() {
    this.loading = true
    this.initTable()
  },
  methods: {
    initTable() {
      this.loadOrders()
    },
    loadOrders() {
      http.getWithoutCache(`orderforshipment/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.setOrders(data)
        })
        .catch(() => {
          this.setOrders([])
        })
    },
    setOrders(orders) {
      let filtered = this.filterOrders(orders)
      let formatted = this.formatOrders(filtered)
      this.tableData = formatted
      this.loading = false
    },
    filterOrders(orders) {
      return orders.filter(a => this.savedData.items.includes(a.id))
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
