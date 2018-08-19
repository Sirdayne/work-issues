<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      seed-limits-form(:assignmentId="assignmentId", :dataUpdated="dataUpdated", @saved="saved", @closed="formDialogClosed", @ready="setFormReady")
      template(v-if="formReady || dataUpdated")
        seed-limits-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      seed-limits-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Расчет семян
        span(:style="{marginRight: '30px'}")
        el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
        el-button(@click="sortVisible = true", type="default", title="Сортировка")
          i(class="fas fa-sort", style="font-size: 14px;")
        el-button.excel(type="default", @click="exportTable()") .
        filter-cols(:cols="cols")
        el-button(@click="lzkVisible = true") ЛЗК
        el-button(@click="getNakladnaya()", :loading="loadingItem.nakladnaya", :disabled="!lzk.date") Накладная
        el-dialog(:visible.sync="lzkVisible", title="ЛЗК", size="tiny", :modal="false")
          el-form(:model="lzk")
            el-form-item(label="Дата")
              el-date-picker(v-model="lzk.date", format="dd.MM.yyyy", placeholder="Выберите дату")
            el-form-item(label="Посев")
              el-select(v-model="lzk.seedLimitIds", filterable, multiple)
                el-option(v-for="s in seedlimits", :key="s.id", :label="s.displayString", :value="s.id")
            el-form-item
              el-button(type="primary", @click="getLZK()", :loading="loadingItem.lzk", :disabled="!lzk.date") Скачать
    template(v-if="mode == 'normal'")
      seed-limits-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненный расчет семян
    seed-limits-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import http from "services/http"
import {fromVuex} from "services/RecordsLoader"
import SeedLimitsForm from "./form"
import SeedLimitsFilter from "./filter"
import SeedLimitsSort from "./sort"
import SeedLimitsTable from "./table"
import SeedLimitsTableSaved from "./table-saved"
import filterCols from "components/filterCols"
import {deepClone} from "lib/utils";
import moment from "moment"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)

export default {
  components: {
    SeedLimitsForm,
    SeedLimitsFilter,
    SeedLimitsSort,
    SeedLimitsTable,
    SeedLimitsTableSaved,
    filterCols,
  },
  data() {
    return {
      cols: [
        {label: "Поле", prop: "fieldNewName", active: true},
        {label: "Площадь", prop: "area", active: true},
        {label: "Культура", prop: "cultureName", active: true},
        {label: "Сорт", prop: "cultureSortName", active: true},
        {label: "Репродукция", prop: "reproductionName", active: true},
        {label: "Норма высева", prop: "sowingNormative", active: false},
        {label: "Чистота семян", prop: "seedFrequency", active: false},
        {label: "Всхожесть семян", prop: "seedGermination", active: false},
        {label: "Масса 1000 семян", prop: "seedWeight", active: false},
        {label: "Норма млн/га", prop: "seedMillionNumber", active: true},
        {label: "Конечный продукт", prop: "cultureParameterName", active: true},
        {label: "Итого", prop: "seedTotal", active: true},
      ],
      formReady: false,
      savedData: [],
      assignmentId: null,
      mode: "normal",
      filterVisible: false,
      filterOptions: null,
      filterReady: false,
      sortVisible: null,
      sortOptions: null,
      sortReady: false,
      lzkVisible: null,
      lzk: {
        organizationid: this.$root.context.organization,
        seedLimitIds: [],
      },
      seedlimits: [],
      loadingItem: {
        lzk: false,
        nakladnaya: false,
      },
      dataUpdated: 0,
    }
  },
  computed: {
    loading() {
      return !(this.formReady && this.filterReady && this.sortReady)
    },
  },
  methods: {
    exportTable() {
      let api = "SeedLimitsReport";
      let filename = "Расчет семян";
      let body = {
        organizationId: this.$root.context.organization,
        year: this.$root.context.year,
      };
      http.downloadXLS(api, body, filename);
    },
    getNakladnaya() {
      this.loadingItem.nakladnaya = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let name = "Накладная за " + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF("SeedLimitInvoiceForm", body, name)
        .then(() => {
          this.loadingItem.nakladnaya = false
        })
    },
    getLZK() {
      this.loadingItem.lzk = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let name = "Лимитно-заборная карта за " + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF("SeedLimitCardForm", body, name)
        .then(() => {
          this.loadingItem.lzk = false
          this.lzkVisible = false
        })
    },
    setFormReady() {
      this.formReady = true
      this.seedlimits = fromVuex("seedlimits")
    },
    formDialogClosed() {
      this.assignmentId = null
    },
    saved(savedData) {
      this.savedData = savedData
      this.mode = "saved"
    },
    switchToNormal() {
      this.dataUpdated++
      this.formReady = false
      this.mode = "normal"
    },
    applyFilter(filterOptions) {
      this.filterOptions = filterOptions
      this.filterReady = true
    },
    edit(id) {
      this.assignmentId = id
    },
    applySort(sortOptions) {
      this.sortOptions = sortOptions
      this.sortReady = true
    },
  },
}
</script>
<style lang="stylus" scoped>
.func-bar
  flex auto 0 0
  margin 10px 0
  display flex
</style>
