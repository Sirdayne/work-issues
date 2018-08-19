<template lang="pug">
.el-table-cont
  el-table(
    :data="tableData",
    border,
    resizable,
    v-loading="loading",
    max-height="400",
  ).content
    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop")
  el-pagination(
    layout="total",
    :total="tableData.length",
    :page-size="perPage",
  )
</template>
<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"

export default {
  name: "SeedLimitsSaved",
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
      tableData: [],
      loading: null,
      perPage: 1000,
    }
  },
  created() {
    this.loading = true
    this.initTable()
  },
  methods: {
    initTable() {
      this.loadAssignments()
    },
    loadAssignments() {
      this.loading = true
      fetchEntities([
        "seedlimits",
      ], this.afterFetch)
    },
    afterFetch() {
      let seedlimits = fromVuex("seedlimits")
      this.setAssignments(seedlimits)
    },
    setAssignments(assignments) {
      let filtered = this.filterAssignments(assignments)
      let formatted = this.formatAssignments(filtered)
      this.tableData = formatted
      this.sortAssignments()
      this.loading = false
    },
    filterAssignments(assignments) {
      return assignments.filter(a => this.savedData.items.includes(a.id))
    },
    sortAssignments() {
      this.tableData = this.tableData
        .sort((a, b) => {
          let date = (new Date(a.date) - new Date(b.date)) * this.sortOptions.date
          let dateModified = (new Date(a.dateModified) - new Date(b.dateModified)) * this.sortOptions.dateModified
          return date || dateModified
        })
    },
    formatAssignments(filteredAssignments) {
      return filteredAssignments
        .map(sl => {
          let cultureParameter = fromVuex("cultureparameters").find(cp => cp.id == sl.cultureParameterId)
          sl.cultureParameterName = cultureParameter && cultureParameter.name
          return sl;
        })
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
