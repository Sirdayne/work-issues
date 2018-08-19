<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      div
        el-button(type="primary", @click="formCreateVisible = true") Добавить задание
      assignments-form(:assignmentId="assignmentId", :formCreateVisible="formCreateVisible", @closed="formClosed", @saved="saved", @ready="formReady = true")
      template(v-if="formReady")
        assignments-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      assignments-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Список заданий
        span(:style="{marginRight: '30px'}")
        json2xls(v-if="xls", :model="xls", :props="xlsProps", :name="xlsName", title="Excel")
        el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
        el-button(@click="sortVisible = true", type="default", title="Сортировка")
          i(class="fas fa-sort", style="font-size: 14px;")
        filter-cols(:cols="cols")
        el-button(type="default", @click="exportAssignments()", :disabled="!printFormId") План задания
        el-select(v-model="printFormId", :style="{marginLeft: '5px'}", placeholder="Выберите тип работы")
          el-option(v-for="p in printForms", :label="p.name", :value="p.id", :key="p.id")
    template(v-if="mode == 'normal'")
      assignments-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @xls-ready="setXls", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненные задания
    assignments-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import http from "services/http"
import AssignmentsForm from "./form"
import AssignmentsFilter from "./filter"
import AssignmentsSort from "./sort"
import AssignmentsTable from "./table"
import AssignmentsTableSaved from "./table-saved"
import filterCols from "components/filterCols"
import json2xls from "components/json2xls"
import moment from "moment"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)


export default {
  components: {
    AssignmentsForm,
    AssignmentsFilter,
    AssignmentsSort,
    AssignmentsTable,
    AssignmentsTableSaved,
    filterCols,
    json2xls
  },
  data() {
    return {
      cols: [
        {prop: "id", label: "№", active: true},
        {prop: "formattedDateTimeStart", label: "Время начала", active: true},
        {prop: "formattedDateTimeEnd", label: "Время завершения", active: true},
        {prop: "fieldNewName", label: "Поле/посев", active: true},
        {prop: "subOperationName", label: "Работа", active: true},
        {prop: "employeeFullName", label: "Работник", active: true},
        {prop: "carDisplayString", label: "Машина", active: true},
        {prop: "instrumentName", label: "Орудие", active: true},
        {prop: "area", label: "Площадь", active: true},
        {prop: "distanceOutsideField", label: "Км вне поля", active: true},
      ],
      printFormId: 1,
      printForms: [
        {id: 1, name: "Посев"},
        {id: 2, name: "Посев с внесением удобрений"},
        {id: 4, name: "Химические"},
        {id: 3, name: "Прочие"},
      ],
      formCreateVisible: false,
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
    exportAssignments() {
      let endpoint = "AssignmentSowingForm";
      let body = {
        organizationId: this.$root.context.organization,
        date: {
          start: moment(this.filterOptions.from).format("YYYY-MM-DDTHH:mm:ss"),
          end: moment(this.filterOptions.till).format("YYYY-MM-DDTHH:mm:ss")
        },
        PrintForm: this.printFormId,
      };
      let startDate = moment(this.filterOptions.from).format("DD.MM.YYYY")
      let endDate = moment(this.filterOptions.till).format("DD.MM.YYYY")
      let filename = "Список заданий на период " + startDate + "-" + endDate;
      http.downloadPDF(endpoint, body, filename);
    },
    formClosed() {
      this.formCreateVisible = false
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
    setXls(...xlsArgs) {
      this.xlsName = xlsArgs[2]
      this.xlsProps = xlsArgs[1]
      this.xls = xlsArgs[0]
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
