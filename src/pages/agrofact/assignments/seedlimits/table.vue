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
import {EventBus} from "services/EventBus"
import WindowResize from "mixins/window-resize"

export default {
  name: "SeedLimitsTable",
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
      let maxHeight = windowInnerHeight - (60 + 10 + 18.72 + 21 + 18.72 + 282 + 10 + 36.25 + 10 + 32 + 10)
      this.maxHeight = (maxHeight > 450) ? maxHeight : 450
    })
  },
  methods: {
    initTable() {
      if (this.filterOptions) this.loadAssignments()
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
      return assignments.filter(a => {
        let field = !this.filterOptions.fieldIds.length || this.filterOptions.fieldIds.includes(a.fieldId)
        let culture = !this.filterOptions.cultureIds.length || this.filterOptions.cultureIds.includes(a.cultureId)
        let cond = field && culture
        return cond
      })
    },
    sortAssignments() {
      this.tableData = this.tableData
        .sort((a, b) => {
          let date = (new Date(a.dateCreated) - new Date(b.dateCreated)) * this.sortOptions.date
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
    edit(id) {
      this.$emit("edit", id)
    },
    remove(id) {
      this.$confirm("Теперь при удалении посевa все связанные задания будут автоматически удалены. Действительно удалить?", "Внимание!", {
        confirmButtonText: "OK",
        cancelButtonText: "Отмена",
        type: "warning"
      }).then(() => {
        http.delete("seedlimits", id)
          .then(() => {
            this.loadAssignments()
          })
      })
    },
    initPagination() {
      this.page.size = +localStorage.getItem("assignments/seedlimits/pageSize") || 5
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
      localStorage.setItem("assignments/seedlimits/pageSize", +num)
      modByLib.addTooltips(this.paginate(this.tableData));
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
