<template lang="pug">
.el-table-cont
  el-table(
    :data="tableData",
    resizable,
    border,
    v-loading="loading",
    max-height="500",
  ).content
    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
    el-table-column(label="Виды качеств", header-align="center")
      template(v-for="qtu in qualityTypesUnique")
        el-table-column(:label="getQualityTypeName(qtu.id)", header-align="center")
          template(slot-scope="scope")
            span {{getQualityTypeValue(qtu.id, scope.row)}}
</template>
<script>
import http from "services/http"
import {fromVuex} from "services/RecordsLoader"
import {deepClone} from "lib/utils";
import moment from "moment"

export default {
  name: "InventoryAnalysisCardsTableSaved",
  props: {
    "savedData": {
      type: Object,
      default: {},
    },
  },
  mixins: [

  ],
  data() {
    return {
      cols: [
        {prop: "formattedDateTime", label: "Дата", active: true},
        {prop: "number", label: "Номер карточки", active: true},
        {prop: "analysisCardTypeName", label: "Цель анализа", active: true},
        {prop: "", label: "Владелец", active: false},
        {prop: "cultureName", label: "Культура", active: true},
        {prop: "finalProductTypeName", label: "Тип продукции", active: false},
        {prop: "productCategory", label: "Класс/сорт", active: true},
        {prop: "storageName", label: "Склад", active: true},
        {prop: "warehouseName", label: "ТОК", active: true},
        {prop: "weight", label: "Объем партии", active: true},
        {prop: "cropBalanceUserName", label: "Лаборант", active: true},
      ],
      tableData: [],
      loading: null,
      qualityTypesUnique: [],
    }
  },
  created() {
    this.loading = true
    this.initTable()
  },
  methods: {
    initTable() {
      this.loadCards()
    },
    loadCards() {
      http.getWithoutCache(`inventoryanalysiscards/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.setCards(data)
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
      this.loading = false
    },
    filterCards(cards) {
      return cards.filter(a => this.savedData.items.includes(a.id))
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
        return arr.concat(card.qualityTypeValues.map(c => {
          return {id: c.qualityTypeId}
        }))
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
