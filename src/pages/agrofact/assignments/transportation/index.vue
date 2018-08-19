<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      div
        el-button(type="primary", @click="add()") Добавить транспортировку
      transportation-form(:assignmentId="assignmentId", :formVisible="formVisible", @closed="formClosed", @saved="saved", @ready="formReady = true")
      template(v-if="formReady")
        transportation-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      transportation-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Список транспортировок
        span(:style="{marginRight: '30px'}")
        json2xls(v-if="xls", :model="xls", :props="xlsProps", :name="xlsName", title="Excel")
        el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
        el-button(@click="sortVisible = true", type="default", title="Сортировка")
          i(class="fas fa-sort", style="font-size: 14px;")
        filter-cols(:cols="cols")
    template(v-if="mode == 'normal'")
      transportation-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @xls-ready="setXls", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненная транспортировка
    transportation-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import TransportationForm from "./form"
import TransportationFilter from "./filter"
import TransportationSort from "./sort"
import TransportationTable from "./table"
import TransportationTableSaved from "./table-saved"
import filterCols from "components/filterCols"
import json2xls from "components/json2xls"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)


export default {
  components: {
    TransportationForm,
    TransportationFilter,
    TransportationSort,
    TransportationTable,
    TransportationTableSaved,
    filterCols,
    json2xls
  },
  data() {
    return {
      cols: [
        {prop: "id", label: "№", active: true},
        {prop: "startDate", label: "Время начала", active: true},
        {prop: "endDate", label: "Время завершения", active: true},
        {prop: "fieldName", label: "Поле/Склад", active: true},
        {prop: "subOperationName", label: "Работа", active: true},
        {prop: "employeeFullName", label: "Водитель", active: true},
        {prop: "carDisplayString", label: "Машина", active: true},
        {prop: "instrumentName", label: "Орудие", active: true}
      ],
      formVisible: false,
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
      xls: null,
      xlsProps: null,
      xlsName: "",
    }
  },
  computed: {
    loading() {
      return !(this.formReady && this.filterReady && this.sortReady)
    },
  },
  methods: {
    formClosed() {
      this.assignmentId = null
      this.formVisible = false
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
    setXls(...xlsArgs) {
      this.xlsName = xlsArgs[2]
      this.xlsProps = xlsArgs[1]
      this.xls = xlsArgs[0]
    },
    add() {
      this.formVisible = true;
    },
    edit(id) {
      this.formVisible = true
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
