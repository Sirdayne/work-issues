<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      div
        el-button(type="primary", @click="formCreateVisible = true") Новый приказ
      order-for-shipment-form(:orderId="orderId", :formCreateVisible="formCreateVisible", @closed="formClosed", @saved="saved", @updated="switchToNormal", @ready="formReady = true")
      template(v-if="formReady")
        order-for-shipment-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      order-for-shipment-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Приказ на отгрузку
        span(:style="{marginRight: '30px'}")
        el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
        el-button(@click="sortVisible = true", type="default", title="Сортировка")
          i(class="fas fa-sort", style="font-size: 14px;")
        el-button.excel(type="default", @click="exportTable()") .
        filter-cols(:cols="cols")
    template(v-if="mode == 'normal'")
      order-for-shipment-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненный приказ
    order-for-shipment-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import http from "services/http"
import OrderForShipmentForm from "./form"
import OrderForShipmentFilter from "./filter"
import OrderForShipmentSort from "./sort"
import OrderForShipmentTable from "./table"
import OrderForShipmentTableSaved from "./table-saved"
import filterCols from "components/filterCols"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)


export default {
  components: {
    OrderForShipmentForm,
    OrderForShipmentFilter,
    OrderForShipmentSort,
    OrderForShipmentTable,
    OrderForShipmentTableSaved,
    filterCols,
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
      formCreateVisible: false,
      formReady: false,
      savedData: [],
      orderId: null,
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
      let api = "orderforshipmentreport";
      let filename = "Приказ на отгрузку";
      let body = {
        organizationId: this.$root.context.organization,
        year: this.$root.context.year,
      };
      http.downloadXLS(api, body, filename);
    },
    formClosed() {
      this.formCreateVisible = false
      this.orderId = null
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
      this.orderId = id
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
