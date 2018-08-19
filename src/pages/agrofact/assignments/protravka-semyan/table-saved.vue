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
    el-table-column(label="Тип препарата")
      template(slot-scope="scope")
        el-tag(v-for="cpt in scope.row.chemicalPreparationTypes", :color="cpt.color", :key="cpt.id") {{ cpt.name }}
    el-table-column(label="Препарат")
      template(slot-scope="scope")
        el-tag(v-for="cp in scope.row.chemicalPreparations", :color="cp.color", :key="cp.id") {{ cp.name }}
    el-table-column(label="Норма внесения")
      template(slot-scope="scope")
        el-tag(v-for="n in scope.row.normative", :color="n.color", :key="n.id") {{ n.value }}
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
  name: "SeedMordantSaved",
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
        {label: "Дата обработки", prop: "date", active: true},
        {label: "Культура", prop: "culture", active: true},
        {label: "Сорт", prop: "sort", active: true},
        {label: "Репродукция", prop: "reproduction", active: true},
        {label: "Объем, тонна", prop: "volume", active: true},
        {label: "Протравочная машина", prop: "car", active: true},
      ],
      colors: ["#DF0101", "#FFD100", "#74DF00", "#2E2EFE", "#FF8000"],
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
        "seedmordant",
      ], this.afterFetch)
    },
    afterFetch() {
      let seedmordant = fromVuex("seedmordant")
      this.setAssignments(seedmordant)
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
          let date = (new Date(a.dateTime) - new Date(b.dateTime)) * this.sortOptions.date
          let dateModified = (new Date(a.dateModified) - new Date(b.dateModified)) * this.sortOptions.dateModified
          return date || dateModified
        })
    },
    formatAssignments(filteredAssignments) {
      return filteredAssignments
        .map(sm => {
          sm.date = moment(sm.dateTime, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
          sm.culture = fromVuex("cultures").find(c => c.id == sm.cultureId).name
          sm.sort = fromVuex("sorts").find(s => s.id == sm.cultureSortId).name
          sm.reproduction = fromVuex("reproductions").find(r => r.id == sm.reproductionId).name
          let car = fromVuex("cars").find(s => s.id == sm.carId)
          car = car && car.displayString || ""
          let instrument = fromVuex("instruments").find(i => i.id == sm.instrumentId)
          instrument = instrument && instrument.name || ""
          sm.car = [car, instrument].join(" ")
          sm.chemicalPreparationTypes = []
          sm.chemicalPreparations = []
          sm.normative = []
          sm.seedMordantChemicalTreatments.forEach((smct, i) => {
            let color = this.colors[i % 5]
            let chemicalpreparation = fromVuex("chemicalpreparations").find(cp => cp.id == smct.chemicalPreparationId)
            if (chemicalpreparation) {
              let chemicalpreparationtype = fromVuex("chemicalpreparationtypes").find(cpt => cpt.id == chemicalpreparation.chemicalPreparationTypeId)
              let obj = {id: chemicalpreparationtype.id, name: chemicalpreparationtype.name, color: color}
              if (!sm.chemicalPreparationTypes.find(cpt => cpt.id == obj.id)) sm.chemicalPreparationTypes.push(obj)
              obj = {id: chemicalpreparation.id, name: chemicalpreparation.name, color: color}
              sm.chemicalPreparations.push(obj)
              obj = {id: chemicalpreparation.id, value: [smct.normative, smct.units].join(" "), color: color}
              sm.normative.push(obj)
            }
          })
          return sm
        })
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
