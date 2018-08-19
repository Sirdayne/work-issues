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
</template>
<script>
import http from "services/http"
import {fromVuex} from "services/RecordsLoader"
import moment from "moment"

export default {
  name: "GrainProcessingsTableSaved",
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
        {prop: "formattedStartDate", label: "Дата начала", active: true},
        {prop: "formattedEndDate", label: "Дата завершения", active: true},
        {prop: "number", label: "Номер акта подработки", active: true},
        {prop: "grainProcessingTypeName", label: "Тип подработки", active: true},
        {prop: "weight", label: "Объем партии", active: true},
        {prop: "equipmentName", label: "Оборудование", active: true},
        {prop: "firstInventoryAnalysisCardNumber", label: "Номер(до подработки)", active: true},
        {prop: "secondInventoryAnalysisCardNumber", label: "Номер(после подработки)", active: true},
        {prop: "humidityNaturalDiscountText", label: "Натуральные скидки по влажности", active: true},
        {prop: "grainAdmixtureNaturalDiscountText", label: "Натуральные скидки по зерновой примеси", active: true},
        {prop: "weedAdmixtureNaturalDiscountText", label: "Натуральные скидки по сорной примеси", active: true},
        {prop: "grossWeight", label: "Зачетный вес", active: true},
        {prop: "dryingWeight", label: "Сушка", active: true},
        {prop: "grainWastesWeight", label: "Зерноотход", active: true},
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
      http.getWithoutCache(`grainprocessings/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.setCards(data)
        })
        .catch(() => {
          this.setCards([])
        })
    },
    setCards(cards) {
      let filtered = this.filterCards(cards)
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
          a.formattedStartDate = moment(a.startDate, "YYYY-MM-DDTHH:mm:ss.SSS").format("DD.MM.YYYY HH:mm")
          a.formattedEndDate = moment(a.endDate, "YYYY-MM-DDTHH:mm:ss.SSS").format("DD.MM.YYYY HH:mm")
          let grainProcessingType = fromVuex("grainprocessingtypes").find(act => act.id == a.grainProcessingType)
          a.grainProcessingTypeName = grainProcessingType && grainProcessingType.name
          let equipment = fromVuex("equipments").find(act => act.id == a.equipmentId)
          a.equipmentName = equipment && equipment.name
          return a
        })
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
