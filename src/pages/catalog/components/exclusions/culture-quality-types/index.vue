<template lang="pug">
div
  el-dialog(:visible.sync="formVisible", :title="formTitle", size="tiny")
    el-form(label-position="top", :model="item")
      el-form-item(label="Наименование")
        el-input.form-input(type="text", v-model="item.qualityName")
      el-form-item(label="Сокращенное наименование")
        el-input.form-input(type="text", v-model="item.qualityShortName")
      el-form-item(label="Возможные значения")
        .quality-type-values(v-for="qtv in item.qualityTypeValues")
          el-input.form-input(type="text", v-model="qtv.name")
          el-button.form-btn(icon="delete", @click="removeQTV(qtv.id)", title="Удалить")
        .quality-type-values
          el-input.form-input(type="text", v-model="item.qualityTypeValue")
          el-button.form-btn(icon="plus", @click="addQTV()", title="Добавить")
      el-form-item.form-item-iterable(label="Культуры")
        el-select(v-model="item.cultureIds", filterable, multiple)
          el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.id")
      el-button.form-btn(type="primary", @click="save()", :loading="loadingItem.save") Сохранить
  .func-bar
    el-button(@click="create()") Новая запись
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
      :max-height="maxHeight",
    ).content
      el-table-column(prop="qualityName", label="Наименование")
      el-table-column(prop="qualityShortName", label="Сокращенное наименование")
      el-table-column(label="Возможное значение")
        template(slot-scope="scope")
          el-tag.el-tag(v-for="(item, index) in scope.row.qualityTypeValues", color="#20a0ff", :key="index")
            span(:title="item.name") {{ item.name }}
      el-table-column(label="Культуры")
        template(slot-scope="scope")
          el-tag.el-tag(v-for="(item, index) in scope.row.cultures", color="#20a0ff", :key="index")
            span(:title="item") {{ item }}
      el-table-column(fixed="right", align="center", width="140")
        el-button-group(slot-scope="scope")
          el-button(icon="edit", size="small", @click="edit(scope.row.qualityTypeId)")
          el-button(icon="delete", size="small", @click="remove(scope.row.qualityTypeId)")
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
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import {deepClone} from "lib/utils"
import {EventBus} from "services/EventBus"
import WindowResize from "mixins/window-resize"

export default {
  mixins: [
    
    WindowResize,
  ],
  components: {
  },
  data() {
    return {
      page: {
        current: 1,
        size: 10,
        sizes: [10, 20, 30, 50, 100],
        total: null,
      },
      loadingItem: {
        save: false,
      },
      loading: true,
      culturequalitytypes: [],
      cultures: [],
      tableData: [],
      maxHeight: 450,
      formVisible: false,
      item: {
        qualityName: "",
        qualityShortName: "",
        qualityTypeValue: "",
        qualityTypeValues: [],
        cultureIds: [],
      },
      formTitle: "Новая запись",
      mode: "create",
    }
  },
  created() {
    this.initPagination()
    EventBus.$on("WindowResize.windowInnerHeight", (windowInnerHeight) => {
      this.maxHeight = windowInnerHeight - (60 + 10 + 10 + 38 + 10 + 32 + 10)
    })
    fetchEntities([
      "cultures",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.cultures = fromVuex("cultures")
      this.getData()
    },
    getData() {
      this.loading = true
      http.getWithoutCache("culturequalitytypes")
        .then(data => {
          this.setData(data)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    setData(data) {
      this.culturequalitytypes = data
      this.setTableData()
    },
    setTableData() {
      let data = deepClone(this.culturequalitytypes)
      let formatted = this.formatData(data)
      this.tableData = formatted
    },
    formatData(data) {
      return data.map(d => {
        d.cultures = d.cultureIds.map(id => {
          let culture = fromVuex("cultures").find(c => c.id == id)
          return culture && culture.name
        })
        return d
      })
    },
    initPagination() {
      this.page.size = +localStorage.getItem("catalog/pageSize") || 10
      this.page.sizes[this.page.sizes.findIndex(p => p == this.page.size)] = 10
      this.page.sizes[0] = this.page.size
    },
    paginate(table) {
      let from = (this.page.current - 1) * this.page.size
      let till = this.page.current * this.page.size
      return table.slice(from, till)
    },
    handlePageChange(num) {
      this.page.current = num
    },
    handleSizeChange(num) {
      this.page.size = num
      localStorage.setItem("catalog/pageSize", +num)
    },
    create() {
      this.mode = "create"
      this.formTitle = "Новая запись"
      this.formVisible = true
    },
    edit(id) {
      this.mode = "edit"
      this.formTitle = "Редактирование"
      let item = this.culturequalitytypes.find(td => td.qualityTypeId == id)
      this.item = deepClone(item)
      this.formVisible = true
    },
    save() {
      this.loadingItem.save = true
      let body = deepClone(this.item)
      let httpMethod = (this.mode == "create") ? "post" : "put"
      http[httpMethod]("culturequalitytypes", body)
        .then((data) => {
          this.loadingItem.save = false
          this.formVisible = false
          this.reset()
          this.getData()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    reset() {
      this.item = {
        qualityName: "",
        qualityShortName: "",
        qualityTypeValue: "",
        qualityTypeValues: [],
        cultureIds: [],
      }
    },
    addQTV() {
      if (this.item.qualityTypeValue) {
        let last = this.item.qualityTypeValues.length
        let qualityTypeValue = deepClone({id: 0, name: this.item.qualityTypeValue})
        this.item.qualityTypeValues.splice(last, 0, qualityTypeValue)
        delete this.item.qualityTypeValue
      }
    },
    removeQTV(id) {
      let index = this.item.qualityTypeValues.findIndex(qtv => qtv.id == id)
      this.item.qualityTypeValues.splice(index, 1)
    },
    remove(id) {
      this.$confirm("Действительно удалить?", "Внимание", {
        confirmButtonText: "OK",
        cancelButtonText: "Отмена",
        type: "warning"
      }).then(() => {
        http.delete(`culturequalitytypes/${id}`)
          .then(() => {
            this.getData()
          })
      })
    },
  },
}
</script>
<style lang="stylus" scoped>
.el-tag
  margin 3px
.func-bar
  flex auto 0 0
  margin 10px 0
  display flex
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
.form-btn
  margin-left 5px
.form-input
  display inline-block
  width 193px
  max-width 193px
.quality-type-values
  margin-bottom 5px
</style>
