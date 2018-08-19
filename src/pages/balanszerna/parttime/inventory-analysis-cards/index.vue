<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      div
        el-button(type="primary", @click="formCreateVisible = true") Новая карточка
      inventory-analysis-cards-form(:cardId="cardId", :formCreateVisible="formCreateVisible", @closed="formClosed", @saved="saved", @updated="switchToNormal", @ready="formReady = true")
      template(v-if="formReady")
        inventory-analysis-cards-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      inventory-analysis-cards-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Журнал регистрации лабораторных анализов
        span(:style="{marginRight: '30px'}")
        el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
        el-button(@click="sortVisible = true", type="default", title="Сортировка")
          i(class="fas fa-sort", style="font-size: 14px;")
        el-button.excel(type="default", @click="exportTable()") .
        filter-cols(:cols="cols")
    template(v-if="mode == 'normal'")
      inventory-analysis-cards-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненная карточка
    inventory-analysis-cards-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import http from "services/http"
import InventoryAnalysisCardsForm from "./form"
import InventoryAnalysisCardsFilter from "./filter"
import InventoryAnalysisCardsSort from "./sort"
import InventoryAnalysisCardsTable from "./table"
import InventoryAnalysisCardsTableSaved from "./table-saved"
import filterCols from "components/filterCols"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)


export default {
  components: {
    InventoryAnalysisCardsForm,
    InventoryAnalysisCardsFilter,
    InventoryAnalysisCardsSort,
    InventoryAnalysisCardsTable,
    InventoryAnalysisCardsTableSaved,
    filterCols,
  },
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
      formCreateVisible: false,
      formReady: false,
      savedData: [],
      cardId: null,
      mode: "normal",
      filterVisible: false,
      filterOptions: null,
      filterReady: false,
      sortVisible: null,
      sortOptions: null,
      sortReady: false,
    }
  },
  computed: {
    loading() {
      return !(this.formReady && this.filterReady && this.sortReady)
    },
  },
  methods: {
    exportTable() {
      let api = "analysiscardsreport";
      let filename = "Журнал регистрации лабораторных анализов";
      let body = {
        organizationId: this.$root.context.organization,
        year: this.$root.context.year,
      };
      http.downloadXLS(api, body, filename);
    },
    formClosed() {
      this.formCreateVisible = false
      this.cardId = null
    },
    saved(savedData) {
      if (savedData.items && savedData.items.length) {
        this.savedData = savedData
      }
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
      this.cardId = id
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
