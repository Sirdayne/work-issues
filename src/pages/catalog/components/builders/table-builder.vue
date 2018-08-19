<template lang="pug">
div(v-if="viewable")
  .el-table-cont
    el-table(
      :data="tbodyPaginated",
      border,
      resizable,
      :max-height="maxHeight",
    ).content
      template(v-for="th in thead")
        template(v-if="th.multiple")
          el-table-column(:label="th.label", v-if="th.table")
            template(slot-scope="scope")
              el-tag.el-tag(v-for="(item, index) in scope.row[th.prop]", color="#20a0ff", :key="index")
                span(:title="item") {{ item }}
        template(v-else)
          el-table-column(:prop="th.prop", :label="th.label", v-if="th.table")
      el-table-column(
        fixed="right",
        align="center",
        width="140",
        v-if="changeable"
      )
        el-button-group(slot-scope="scope")
          el-button(icon="view", size="small", @click="view(scope.row)")
          el-button(icon="edit", size="small", @click="edit(scope.row.id)", v-if="isEditable")
          el-button(icon="delete", size="small", @click="remove(scope.row.id)", v-if="isDeletable")
    el-pagination(
      layout="total, sizes, prev, pager, next",
      :total="page.total",
      :page-size="page.size",
      :page-sizes="page.sizes",
      :current-page.sync="page.current",
      @current-change="handlePageChange",
      @size-change="handleSizeChange",
    )
</template>
<script>
import moment from "moment";
import {escapeStringRegexp} from "lib/utils"
import {deepClone} from "lib/utils"
import modByLib from "lib/modByLib";
import {EventBus} from "services/EventBus"
import WindowResize from "mixins/window-resize"

export default {
  name: "TableBuilder",
  props: {
    "data": {
      type: Object,
      default: {},
    },
    "filter": {
      type: Object,
      default: {},
    },
    "search": {
      type: String,
      default: "",
    },
  },
  mixins: [
    WindowResize,
  ],
  data() {
    return {
      api: null,
      filters: null,
      store: null,
      tbody: null,
      thead: null,
      page: {
        current: 1,
        size: 10,
        sizes: [10, 20, 30, 50, 100],
        total: null,
      },
      viewable: false,
      editable: null,
      deletable: null,
      changeable: true,
      maxHeight: 450,
    }
  },
  computed: {
    tbodySearch() {
      let searched = this.tbody.filter(tb => {
        if (!this.search) return true
        return this.search.split(" ")
          .slice(0, 10)
          .every(keyword => {
            if (!keyword) return false
            let regex = new RegExp(escapeStringRegexp(keyword), "i")
            return this.thead.some(h => {
              return regex.test(tb[h.prop])
            })
          })
      })
      this.page.total = searched.length
      if (this.search) this.page.current = 1
      return searched
    },
    tbodyPaginated() {
      let from = (this.page.current - 1) * this.page.size
      let till = this.page.current * this.page.size
      return this.tbodySearch.slice(from, till)
    },
    isEditable() {
      return this.editable === true || this.$root.user.roles.includes("Editor")
    },
    isDeletable() {
      return this.deletable === undefined || this.deletable === true
    },
  },
  watch: {
    ["filter"](val, oldVal) {
      this._reset()
      this.filters = val
      if (this.data) this._build(this.data)
    },
  },
  created() {
    this.page.size = +localStorage.getItem("catalog/pageSize") || 10
    this.page.sizes[this.page.sizes.findIndex(p => p == this.page.size)] = 10
    this.page.sizes[0] = this.page.size
    moment.locale("ru")
    if (this.data) this._build(this.data)
  },
  mounted() {
    EventBus.$on("WindowResize.windowInnerHeight", (windowInnerHeight) => {
      this.maxHeight = windowInnerHeight - (60 + 10 + 10 + 38 + 10 + 32 + 10)
    })
    modByLib.addTooltips( this.tbodyPaginated );
  },
  methods: {
    _build(data) {
      let elementData = data.elementData
      this.store = data.store
      let table = {}
      table.api = elementData.api
      this.editable = elementData.editable
      this.deletable = elementData.deletable
      if(elementData.changeable == false)
        this.changeable = elementData.changeable
      table.headers = this._getHeaders(elementData.attributes)
      table.headers.push({
        label: "Автор",
        prop: "modifiedByName",
        table: false,
        viewable: true,
        type: null
      });
      table.headers.push({
        label: "Дата изменения",
        prop: "dateModified",
        table: false,
        viewable: true,
        type: null
      });
      let props = elementData.attributes.map(a => {
        return a.fkey ? a.fkey : a.prop
      })
      props.push("modifiedByName")
      props.push("dateModified")
      props.push("id")
      let dateHeaders = table.headers.filter(h => h.type == "date")
      table.body = this.store[this.data.elementData.name]
        .map(data => {
          let obj = {}
          props.forEach(p => {
            obj[p] = data[p]
          })
          dateHeaders.forEach(h => {
            if (obj[h.prop]) {
              let cond = moment(obj[h.prop], "M/D/YYYY").isValid()
              if (cond) {
                obj[h.prop] = moment(obj[h.prop], "M/D/YYYY").format("DD MMMM YYYY")
              } else {
                obj[h.prop] = moment(obj[h.prop], "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
              }
            } else {
              obj[h.prop] = ""
            }
          })
          return obj
        })
      table.body = this._filter(this._join(table.body, elementData))
      this.init(table)
    },
    _getHeaders(attributes) {
      return attributes.map(a => {
        let header = {}
        header.label = a.label
        header.prop = a.prop
        header.table = a.table !== false
        header.xls = a.xls === true
        header.viewable = a.viewable !== false
        header.type = a.type !== undefined ? a.type : null
        if (a.fkey) {
          let felement = a.prop.split(".")[0]
          let fprop = a.prop.split(".")[1]
          header.prop = felement + fprop[0].toUpperCase() + fprop.slice(1) + a.fkey
          header.multiple = a.multiple
        }
        return header
      })
    },
    _filter(tableBody) {
      return tableBody.filter(data => {
        if (!this.filters) return true
        return Object.keys(this.filters)
          .every(key => {
            if (Array.isArray(this.filters[key])) {
              if (!this.filters[key].length) return true
              if (Array.isArray(data[key])) {
                return this.filters[key].every(fk => data[key].includes(fk))
              } else {
                return this.filters[key].some(fk => data[key] == fk)
              }
            } else {
              if (this.filters[key] === "") return true
              return data[key] == this.filters[key]
            }
          })
      })
    },
    _join(data, elementData) {
      elementData.attributes.filter(a => a.fkey)
        .forEach(a => {
          let felement = a.prop.split(".")[0]
          let fprop = a.prop.split(".")[1]
          let joinedProp = felement + fprop[0].toUpperCase() + fprop.slice(1) + a.fkey
          data.forEach(d => {
            if (a.multiple) {
              d[joinedProp] = []
              d[a.fkey].forEach(key => {
                let row = this.store[felement].find(s => s.id == key)
                let value = row ? row[fprop] : ""
                if (value !== "") d[joinedProp].push(value)
              })
            } else {
              let row = this.store[felement].find(s => s.id == d[a.fkey])
              d[joinedProp] = row ? row[fprop] : ""
            }
          })
        })
      return data
    },
    init(data) {
      this.api = data.api
      this.tbody = data.body
      this.thead = data.headers
      this.page.total = this.tbody.length
      if (this.$route.query.itemId) {
        let index = this.tbody.findIndex(t => t.id == this.$route.query.itemId) || 0
        this.page.current = Math.ceil(index / this.page.size) || 1
      } else {
        this.page.current = 1
      }
      this._prepareXls()
      this.viewable = true
    },
    _prepareXls() {
      let body = deepClone(this.tbody).map(tb => {
        Object.keys(tb).forEach(key => {
          if (Array.isArray(tb[key])) {
            tb[key] = tb[key].join(", ")
          }
        })
        return tb
      })
      this.$emit("prepareXls", body, this.thead)
    },
    _reset() {
      let pageSize = +localStorage.getItem("catalog/pageSize") || 10
      this.api = null
      this.filters = null
      this.store = null
      this.tbody = null
      this.thead = null
      this.page = {
        current: 1,
        size: pageSize,
        total: null,
      }
      this.viewable = false
    },
    handlePageChange(num) {
      this.page.current = num
      modByLib.addTooltips( this.tbodyPaginated )
    },
    handleSizeChange(num) {
      this.page.size = num
      localStorage.setItem("catalog/pageSize", +num)
      modByLib.addTooltips( this.tbodyPaginated )
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
        this.$emit("remove", this.api, id)
      }).catch(() => {});
    },
    view(row) {
      this.$emit("view", row, this.thead.filter(th => th.viewable))
    },
  },
}
</script>
<style lang="stylus" scoped>
.el-tag
  margin 3px
</style>
