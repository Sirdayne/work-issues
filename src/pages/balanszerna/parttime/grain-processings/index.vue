<template lang="pug">
div
  div(v-show="mode == 'normal'")
    div(v-loading.lock="loading")
      div
        el-button(type="primary", @click="formCreateVisible = true") Новый акт подработки
      grain-processings-form(:cardId="cardId", :formCreateVisible="formCreateVisible", @closed="formClosed", @saved="saved", @updated="switchToNormal", @ready="formReady = true")
      template(v-if="formReady")
        grain-processings-filter(:filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
      grain-processings-sort(:sortVisible="sortVisible", @closed="sortVisible = false", @apply="applySort")
      h2.func-bar Журнал подработки зерна
        span(:style="{marginRight: '30px'}")
        el-button.filter(@click="filterVisible = true", type="default", title="Фильтр") .
        el-button(@click="sortVisible = true", type="default", title="Сортировка")
          i(class="fas fa-sort", style="font-size: 14px;")
        filter-cols(:cols="cols")
    template(v-if="mode == 'normal'")
      grain-processings-table(:columns="cols", :filter-options="filterOptions", :sort-options="sortOptions", @edit="edit")
  template(v-if="mode == 'saved'")
    div
      el-button(type="primary", @click="switchToNormal") Вернуться
    h2.func-bar Недавно сохраненный акт подработки
    grain-processings-table-saved(:savedData="savedData", @edit="edit")
</template>

<script>
import GrainProcessingsForm from "./form"
import GrainProcessingsFilter from "./filter"
import GrainProcessingsSort from "./sort"
import GrainProcessingsTable from "./table"
import GrainProcessingsTableSaved from "./table-saved"
import filterCols from "components/filterCols"

import fontawesome from "@fortawesome/fontawesome"
import faSort from "@fortawesome/fontawesome-free-solid/faSort"

fontawesome.library.add(faSort)


export default {
  components: {
    GrainProcessingsForm,
    GrainProcessingsFilter,
    GrainProcessingsSort,
    GrainProcessingsTable,
    GrainProcessingsTableSaved,
    filterCols,
  },
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
