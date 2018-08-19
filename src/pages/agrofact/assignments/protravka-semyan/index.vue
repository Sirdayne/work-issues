<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      seed-mordant-form(:assignmentId="assignmentId", @saved="saved", @closed="formDialogClosed", @ready="formReady = true")
      template(v-if="formReady")
        seed-mordant-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      seed-mordant-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Протравка семян
        span(:style="{marginRight: '30px'}")
        el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
        el-button(@click="sortVisible = true", type="default", title="Сортировка")
          i(class="fas fa-sort", style="font-size: 14px;")
        el-button.excel(type="default", @click="xlsVisible = true") .
        el-dialog(:visible.sync="xlsVisible", title="Отчет", size="tiny", :modal="false")
          el-form(:model="xls")
            el-form-item(label="Дата")
              el-date-picker(v-model="xls.date", format="dd.MM.yyyy", placeholder="Выберите дату")
            el-form-item
              el-button(type="primary", @click="exportTable()") Скачать
        filter-cols(:cols="cols")
        el-button(@click="lzkVisible = true") ЛЗК
        el-button(@click="getNakladnaya()", :loading="loadingItem.nakladnaya", :disabled="!lzk.date") Накладная
        el-dialog(:visible.sync="lzkVisible", title="ЛЗК", size="tiny", :modal="false")
          el-form(:model="lzk")
            el-form-item(label="Дата")
              el-date-picker(v-model="lzk.date", format="dd.MM.yyyy", placeholder="Выберите дату")
            el-form-item(label="Посев с внесением удобрения")
              el-checkbox(v-model="lzk.special")
            el-form-item
              el-button(type="primary", @click="getLZK()", :loading="loadingItem.lzk", :disabled="!lzk.date") Скачать
    template(v-if="mode == 'normal'")
      seed-mordant-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненная протравка семян
    seed-mordant-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import http from "services/http"
import SeedMordantForm from "./form"
import SeedMordantFilter from "./filter"
import SeedMordantSort from "./sort"
import SeedMordantTable from "./table"
import SeedMordantTableSaved from "./table-saved"
import filterCols from "components/filterCols"
import {deepClone} from "lib/utils";
import moment from "moment"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)


export default {
  components: {
    SeedMordantForm,
    SeedMordantFilter,
    SeedMordantSort,
    SeedMordantTable,
    SeedMordantTableSaved,
    filterCols,
  },
  data() {
    return {
      cols: [
        {label: "Дата обработки", prop: "date", active: true},
        {label: "Культура", prop: "culture", active: true},
        {label: "Сорт", prop: "sort", active: true},
        {label: "Репродукция", prop: "reproduction", active: true},
        {label: "Объем, тонна", prop: "volume", active: true},
        {label: "Протравочная машина", prop: "car", active: true},
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
        special: false,
      },
      loadingItem: {
        lzk: false,
        nakladnaya: false,
      },
      xls: {},
      xlsVisible: null,
    }
  },
  computed: {
    loading() {
      return !(this.formReady && this.filterReady && this.sortReady)
    },
  },
  methods: {
    exportTable() {
      let endpoint = "SeedMordantReport";
      let filename = "Отчет по обработке семян";
      let body = {
        organizationId: this.$root.context.organization,
        date: moment(this.xls.date).format("YYYY-MM-DDTHH:mm:ss"),
      };
      http.downloadXLS(endpoint, body, filename)
    },
    getNakladnaya() {
      this.loadingItem.nakladnaya = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let name = "Накладная за " + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF("SeedMordantInvoiceForm", body, name)
        .then(() => {
          this.loadingItem.nakladnaya = false
        })
    },
    getLZK() {
      this.loadingItem.nakladnaya = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let name = "Накладная за " + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF("SeedMordantCardForm", body, name)
        .then(() => {
          this.loadingItem.nakladnaya = false
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
