<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      chemistry-limits-form(:assignmentId="assignmentId", :dataUpdated="dataUpdated", @saved="saved", @closed="formDialogClosed", @ready="formReady = true")
      template(v-if="formReady || dataUpdated")
        chemistry-limits-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      chemistry-limits-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Расчет СЗР
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
            el-form-item
              el-button(type="primary", @click="getLZK()", :loading="loadingItem.lzk", :disabled="!lzk.date") Скачать
    template(v-if="mode == 'normal'")
      chemistry-limits-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненный расчет СЗР
    chemistry-limits-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import http from "services/http"
import ChemistryLimitsForm from "./form"
import ChemistryLimitsFilter from "./filter"
import ChemistryLimitsSort from "./sort"
import ChemistryLimitsTable from "./table"
import ChemistryLimitsTableSaved from "./table-saved"
import filterCols from "components/filterCols"
import {deepClone} from "lib/utils";
import moment from "moment"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)


export default {
  components: {
    ChemistryLimitsForm,
    ChemistryLimitsFilter,
    ChemistryLimitsSort,
    ChemistryLimitsTable,
    ChemistryLimitsTableSaved,
    filterCols,
  },
  data() {
    return {
      cols: [
        {label: "Дата", prop: "shortDate", active: true},
        {label: "Поле", prop: "fieldName", active: true},
        {label: "Площадь, га", prop: "fieldArea", active: true},
        {label: "Работа", prop: "workName", active: true},
        {label: "Культура", prop: "cultureName", active: true},
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
      },
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
      let api = "ChemistryLimitsReport";
      let filename = "Расчет СЗР";
      let body = {
        organizationId: this.$root.context.organization,
        year: this.$root.context.year,
        isMacrofertilizer: 0,
      };
      http.downloadXLS(api, body, filename);
    },
    getNakladnaya() {
      this.loadingItem.nakladnaya = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let name = "Накладная за " + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF("ChemistryLimitInvoiceForm", body, name)
        .then(() => {
          this.loadingItem.nakladnaya = false
        })
    },
    getLZK() {
      this.loadingItem.lzk = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let filename, api
      api = "ChemistryLimitCardForm"
      filename = "Лимитно-заборная карта за "
      let name = filename + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF(api, body, name)
        .then(() => {
          this.loadingItem.lzk = false
          this.lzkVisible = false
        })
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
