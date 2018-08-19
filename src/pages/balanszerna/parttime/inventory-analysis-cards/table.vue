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
    el-table-column(label="Виды качеств", header-align="center")
      template(v-for="qtu in qualityTypesUnique")
        el-table-column(:label="getQualityTypeName(qtu.id)", header-align="center")
          template(slot-scope="scope")
            span {{getQualityTypeValue(qtu.id, scope.row)}}
    el-table-column(label="", align="center", width="100")
      el-button-group(slot-scope="scope")
        el-button(@click="edit(scope.row.id)", size="small", icon="edit", title="редактировать")
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
import {deepClone} from "lib/utils";
import {uniq} from "lib/utils";
import modByLib from "lib/modByLib";
import {fromVuex} from "services/RecordsLoader"
import moment from "moment"
import {EventBus} from "services/EventBus"
import WindowResize from "mixins/window-resize"

export default {
  name: "InventoryAnalysisCardsTable",
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
      qualityTypesUnique: [],
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
      this.loadCards()
    },
    ["sortOptions"](val, oldVal) {
      this.sortCards()
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
      if (this.filterOptions) this.loadCards()
    },
    loadCards() {
      this.loading = true
      http.getWithoutCache(`inventoryanalysiscards/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.$store.dispatch("actionAddEntities", {name: "inventoryanalysiscards", data: data})
          this.setCards(deepClone(data))
        })
        .catch(() => {
          this.setCards([])
        })
    },
    setCards(cards) {
      let filtered = this.filterCards(cards)
      this.getUniqueQualityTypes(deepClone(filtered))
      let formatted = this.formatCards(filtered)
      this.tableData = formatted
      this.sortCards()
      this.loading = false
    },
    filterCards(cards) {
      return cards.filter(a => {
        let from = !this.filterOptions.from || moment(a.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS").isSameOrAfter(moment(this.filterOptions.from))
        let till = !this.filterOptions.till || moment(a.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS").isSameOrBefore(moment(this.filterOptions.till))
        let date = from && till
        let analysisCardType = !this.filterOptions.analysisCardTypeIds.length || this.filterOptions.analysisCardTypeIds.includes(a.analysisCardType)
        let culture = !this.filterOptions.cultureIds.length || this.filterOptions.cultureIds.includes(a.cultureName)
        let finalproducttypes = !this.filterOptions.finalProductTypeIds.length || this.filterOptions.finalProductTypeIds.includes(a.finalProductTypeName)
        let storage = !this.filterOptions.storageIds.length || this.filterOptions.storageIds.includes(a.storageId)
        let warehouse = !this.filterOptions.warehouseIds.length || this.filterOptions.warehouseIds.includes(a.warehouseId)
        let cond = date && analysisCardType && culture && finalproducttypes && storage && warehouse
        return cond
      })
    },
    sortCards() {
      this.tableData = this.tableData
        .sort((a, b) => {
          let date = (new Date(a.dateTime) - new Date(b.dateTime)) * this.sortOptions.date
          let dateModified = (new Date(a.dateModified) - new Date(b.dateModified)) * this.sortOptions.dateModified
          return date || dateModified
        })
    },
    formatCards(filteredCards) {
      return filteredCards
        .map(a => {
          a.formattedDateTime = moment(a.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS").format("DD.MM.YYYY HH:mm")
          let analysisCardType = fromVuex("analysiscardtypes").find(act => act.id == a.analysisCardType)
          a.analysisCardTypeName = analysisCardType && analysisCardType.name
          let storage = fromVuex("storages").find(s => s.id == a.storageId)
          a.storageName = storage && storage.name
          let warehouse = fromVuex("warehouses").find(w => w.id == a.warehouseId)
          a.warehouseName = warehouse && warehouse.name
          let cropBalanceUser = fromVuex("cropbalanceusers").find(cbu => cbu.id == a.cropBalanceUserId)
          a.cropBalanceUserName = cropBalanceUser && `${cropBalanceUser.surname} ${cropBalanceUser.name}`
          return a
        })
    },
    getUniqueQualityTypes(cards) {
      let qualityTypes = cards.reduce((arr, card) => {
        return uniq(arr.concat(card.qualityTypeValues.map(c => {
          return {id: c.qualityTypeId}
        })))
      }, [])
      this.qualityTypesUnique = qualityTypes
    },
    getQualityTypeName(qualityTypeId) {
      let culturequalitytype = fromVuex("culturequalitytypes").find(c => c.qualityTypeId == qualityTypeId)
      return culturequalitytype && culturequalitytype.qualityName
    },
    getQualityTypeValue(qualityTypeId, row) {
      let qualityTypeValue = row.qualityTypeValues.find(q => q.qualityTypeId == qualityTypeId)
      if (qualityTypeValue) {
        if (qualityTypeValue.qualityTypeValueCodes.length) {
          let qualityTypeValueCode = qualityTypeValue.qualityTypeValueCodes.find(q => q.id == qualityTypeValue.qualityTypeValueCodeId)
          return qualityTypeValueCode.name
        } else {
          return qualityTypeValue.value
        }
      }
      return ""
    },
    edit(id) {
      this.$emit("edit", id)
    },
    initPagination() {
      this.page.size = +localStorage.getItem("inventory-analysis-cards/pageSize") || 5
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
      localStorage.setItem("inventory-analysis-cards/pageSize", +num)
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
