<template lang="pug">
div
  h2(class="heading-margin") Тех. карта факт.
  div.a-form
    span(v-if="report.parameters")
      el-button.excel(type="default", @click="download(report)") .
    span(label="Культура")
      el-select(v-model="item.culture", placeholder="Выберите культуру", filterable, clearable, :loading="loading", @change="filterByCulture")
        el-option(v-for="c in cultures", :label="c.name", :value="c.id", :key="c.id")
    span
      filter-cols(:cols="cols")
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
import {deepClone} from "lib/utils"
import filterCols from "components/filterCols"

export default {
  components: {
    filterCols
  },
  data() {
    return {
      cols: [
        {label: "Поле", prop: "fieldName", active: true},
        {label: "Работа", prop: "workName", active: true},
        {label: "Начало", prop: "workStartString", active: false},
        {label: "Конец", prop: "workEndString", active: false},
        {label: "Культура", prop: "cultureName", active: false},
        {label: "Предшественник", prop: "previousCulture", active: false},
        {label: "Машина", prop: "carModelName", active: true},
        {label: "Орудие", prop: "instrumentName", active: true},
        {label: "Площадь, га", prop: "area", active: false},
        {label: "Аг. условие", prop: "condition", active: false},
        {label: "Норма выработки", prop: "rateOfOutput", active: false},
        {label: "Норма ГСМ", prop: "fuelConsumption", active: false},
        {label: "Кол-во нормосмен", prop: "shiftCount", active: false},
        {label: "Тарифный коэффициент", prop: "tarifCoeficient", active: false},
        {label: "Тарифная расценка", prop: "tarifCost", active: false},
        {label: "Объем", prop: "volume", active: true},
        {label: "ОЗП, тг", prop: "salary", active: false},
        {label: "Доплата, тг", prop: "bonus", active: false},
        {label: "Резерв на отпуска, тг", prop: "holidayReserve", active: false},
        {label: "Налоги, тг", prop: "socialTaxes", active: false},
        {label: "Топливо, л", prop: "fuelInLitres", active: false},
        {label: "Топливо, тг", prop: "fuelInMoney", active: false},
        {label: "Семена, т", prop: "seedsInTones", active: false},
        {label: "Семена, тг", prop: "seedsInMoney", active: false},
        {label: "Семена 2ой культуры, т", prop: "secondSeedsInTones", active: false},
        {label: "Семена 2ой культуры, тг", prop: "secondSeedsInMoney", active: false},
        {label: "Химия, л", prop: "chemistryInfo", active: false},
        {label: "Химия, тг", prop: "chemistryInMoney", active: false},
        {label: "Авиа услуги, тг", prop: "airServices", active: false},
        {label: "Себестоимость на га, тг", prop: "primeCostPerHectare", active: true},
      ],
      item: {
        culture: null,
      },
      accumulativeworkexpend: [],
      tableData: [],
      cultures: [],
      loading: false,
    }
  },
  computed: {
    reports() {
      return fromVuex("reports")
    },
    report() {
      let api = this.$route.fullPath.split("/").pop()
      return this.reports.find(r => r.api == api) || {}
    },
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      http.get(`accumulativeworkexpendreport/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.setData(data)
        })
        .catch(() => {
          this.setData({})
        })
    },
    setData(data) {
      this.accumulativeworkexpend = data
      this.cultures = this.accumulativeworkexpend.map(awe => {return {id: awe.cultureId, name: awe.cultureName}})
      this.loading = false
    },
    filterByCulture(culture) {
      if (culture) {
        let dataByCulture = this.accumulativeworkexpend.find(awe => awe.cultureId == culture)
        this.tableData = deepClone(dataByCulture.items)
      } else {
        this.tableData = []
      }
    },
    download(item) {
      let body = {}
      let contexts = ["organization", "budget", "year", "culture", "date"]
      let keys = ["organizationId", "budgetId", "year", "cultureId", "date"]
      let obj = [this.$root.context, this.$root.context, this.$root.context, this.item, this.item]
      item.parameters.forEach(p => {
        let i = contexts.findIndex(c => c == p)
        let c = contexts[i]
        body[keys[i]] = obj[i][c]
        if (c == "date") {
          body[keys[i]] = moment(obj[i][c], "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DDTHH:mm:ss")
        }
      })
      http.downloadXLS(item.api, body, item.name)
    },
  }
}
</script>
<style lang="stylus" scoped>
.heading-margin
  margin 0 0 10px 0
.a-form
  margin-bottom 13px
  & span
    display inline-block
    &:not(:first-child)
      margin-left 10px
</style>
