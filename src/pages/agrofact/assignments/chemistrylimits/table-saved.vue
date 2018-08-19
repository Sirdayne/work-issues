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
    el-table-column(label="Cорняки(кол-во)")
      template(slot-scope="scope")
        el-tag(v-for="(w, index) in scope.row.weeds", :color="w.color", :key="index") {{ w.value }}
    el-table-column(label="Тип препарата")
      template(slot-scope="scope")
        el-tag(v-for="(cpt, index) in scope.row.chemicalPreparationsTypes", :color="cpt.color", :key="index") {{ cpt.name }}
    el-table-column(label="Препарат")
      template(slot-scope="scope")
        el-tag(v-for="cp in scope.row.chemicalPreparations", :color="cp.color", :key="cp.id") {{ cp.name }}
    el-table-column(label="Норма расхода", width="100")
      template(slot-scope="scope")
        el-tag(v-for="n in scope.row.normative", :color="n.color", :key="n.id") {{ n.value }}
    el-table-column(label="Требуется")
      template(slot-scope="scope")
        el-tag(v-for="t in scope.row.total", :color="t.color", :key="t.id") {{ t.value }}
  el-pagination(
    layout="total",
    :total="tableData.length",
    :page-size="perPage",
  )
</template>
<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import moment from "moment"

export default {
  name: "ChemistryLimitsSaved",
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
        {label: "Дата", prop: "shortDate", active: true},
        {label: "Поле", prop: "fieldName", active: true},
        {label: "Площадь, га", prop: "fieldArea", active: true},
        {label: "Работа", prop: "workName", active: true},
        {label: "Культура", prop: "cultureName", active: true},
      ],
      colors: ["#DF0101", "#FFD100", "#74DF00", "#2E2EFE", "#FF8000"],
      works: [],
      tableData: [],
      loading: null,
      perPage: 1000,
    }
  },
  created() {
    this.loading = true
    this.works = fromVuex("works").filter(w => w.planWorkTypeIsChemicalTreatment && !w.isMacrofertilizer)
    this.initTable()
  },
  methods: {
    initTable() {
      this.loadAssignments()
    },
    loadAssignments() {
      this.loading = true
      fetchEntities([
        "chemistrylimits",
      ], this.afterFetch)
    },
    afterFetch() {
      let chemistrylimits = fromVuex("chemistrylimits").filter(cl => !cl.isMacrofertilizer)
      this.setAssignments(chemistrylimits)
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
        .map(cl => {
          cl.shortDate = moment(cl.date).format("DD.MM.YYYY")
          cl.workName =  this.works.filter(w => w.id === cl.workTypeParameterPlanWorkTypeId).length
            ? this.works.filter(w => w.id === cl.workTypeParameterPlanWorkTypeId)[0].name
            : "";
          cl.chemicalPreparations = []
          cl.chemicalPreparationsTypes = []
          cl.normative = []
          cl.total = []
          cl.chemistryChemicalTreatments.forEach((cct, i) => {
            let color = this.colors[i % 5]
            let obj = {id: cct.id, name: cct.chemicalPreparationName, color: color}
            cl.chemicalPreparations.push(obj)
            obj = {name: cct.preparationType, color: color}
            cl.chemicalPreparationsTypes.push(obj)
            obj = {id: cct.id, value: [cct.normative, cct.units].join(" "), color: color}
            cl.normative.push(obj)
            obj = {id: cct.id, value: [cct.total, cct.units].join(" "), color: color}
            cl.total.push(obj)
          })
          cl.weeds = []
          cl.chemistryLimitWeedTypes.forEach((clwt, i) => {
            let color = this.colors[i % 5]
            let weedName = clwt.weedName || "Нет данных"
            let obj = {value: [weedName, `(${clwt.weedAmount})`].join(""), color: color}
            cl.weeds.push(obj)
          })
          return cl;
        })
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
