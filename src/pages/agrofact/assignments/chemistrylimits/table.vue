<template lang="pug">
.el-table-cont
  el-table(
    :data="paginate(tableData)",
    border,
    resizable,
    v-loading="loading",
    :max-height="maxHeight",
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
    el-table-column(
      fixed="right",
      align="center",
      width="120",
    )
      el-button-group(slot-scope="scope")
        el-button(icon="edit", size="small", @click="edit(scope.row.id)")
        el-button(icon="delete", size="small", @click="remove(scope.row.id)")
  el-pagination(
    layout="total, sizes, prev, pager, next",
    :total="tableData.length",
    :page-size="page.size",
    :page-sizes="page.sizes",
    :current-page.sync="page.current",
    @current-change="handlePageChange",
    @size-change="handleSizeChange",
  )
</template>
<script>
import http from "services/http"
import {deepClone} from "lib/utils";
import modByLib from "lib/modByLib";
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import moment from "moment"
import {EventBus} from "services/EventBus"
import WindowResize from "mixins/window-resize"

export default {
  name: "ChemistryLimitsTable",
  props: {
    "columns": {
      type: Array,
      default: [],
    },
    "filterOptions": {
      type: Object,
      default: {},
    },
    "sortOptions": {
      type: Object,
      default: {},
    },
  },
  mixins: [
    
    WindowResize,
  ],
  data() {
    return {
      cols: [],
      colors: ["#DF0101", "#FFD100", "#74DF00", "#2E2EFE", "#FF8000"],
      works: [],
      tableData: [],
      loading: null,
      page: {
        current: 1,
        size: 5,
        sizes: [5, 10, 15, 20, 25],
      },
      maxHeight: 450,
    }
  },
  watch: {
    columns: {
      handler: function (val, oldVal) {
        this.cols = deepClone(val)
      },
      deep: true
    },
    ["filterOptions"](val, oldVal) {
      this.loadAssignments()
    },
    ["sortOptions"](val, oldVal) {
      this.sortAssignments()
    },
  },
  updated() {
    modByLib.addTooltips(this.paginate(this.tableData));
  },
  created() {
    this.initPagination()
    this.loading = true
    this.cols = deepClone(this.columns)
    this.initTable()
  },
  mounted() {
    EventBus.$on("WindowResize.windowInnerHeight", (windowInnerHeight) => {
      let maxHeight = windowInnerHeight - (60 + 10 + 18.72 + 21 + 18.72 + 205 + 10 + 36.25 + 10 + 32 + 10)
      this.maxHeight = (maxHeight > 450) ? maxHeight : 450
    })
  },
  methods: {
    initTable() {
      if (this.filterOptions) this.loadAssignments()
    },
    loadAssignments() {
      this.loading = true
      this.works = fromVuex("works").filter(w => w.planWorkTypeIsChemicalTreatment && !w.isMacrofertilizer)
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
      return assignments.filter(a => {
        let from = !this.filterOptions.from || moment(a.date, "YYYY-MM-DDTHH:mm:ss.SSS").isSameOrAfter(moment(this.filterOptions.from))
        let till = !this.filterOptions.till || moment(a.date, "YYYY-MM-DDTHH:mm:ss.SSS").isSameOrBefore(moment(this.filterOptions.till))
        let date = from && till
        let seedlimits = !this.filterOptions.seedlimitsIds.length || this.filterOptions.seedlimitsIds.includes(a.seedLimitId)
        let cond = date && seedlimits
        return cond
      })
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
    edit(id) {
      this.$emit("edit", id)
    },
    remove(id) {
      this.$confirm("Действительно удалить?", "Внимание", {
        confirmButtonText: "OK",
        cancelButtonText: "Отмена",
        type: "warning"
      }).then(() => {
        http.delete(`chemistrylimits/${id}`)
          .then(() => {
            this.loadAssignments()
          })
      })
    },
    initPagination() {
      this.page.size = +localStorage.getItem("assignments/chemistrylimits/pageSize") || 5
      this.page.sizes[this.page.sizes.findIndex(p => p == this.page.size)] = 5
      this.page.sizes[0] = this.page.size
    },
    paginate(table) {
      let from = (this.page.current - 1) * this.page.size
      let till = this.page.current * this.page.size
      return table.slice(from, till)
    },
    handlePageChange(num) {
      this.page.current = num
      modByLib.addTooltips(this.paginate(this.tableData));
    },
    handleSizeChange(num) {
      this.page.size = num
      localStorage.setItem("assignments/chemistrylimits/pageSize", +num)
      modByLib.addTooltips(this.paginate(this.tableData));
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
