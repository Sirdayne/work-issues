<template lang="pug">
div
  el-dialog(:visible.sync="formVisible", :title="formTitle", size="tiny")
    el-form(label-position="top", :model="item")
      el-form-item.form-item-iterable(label="Вид качества")
        el-select(v-model="item.qualityTypeId", filterable, clearable, @change="setQualityTypeValues", :disabled="mode == 'edit'")
          el-option(v-for="c in culturequalitytypes", :key="c.qualityTypeId", :label="c.qualityName", :value="c.qualityTypeId")
      el-form-item.form-item-iterable(label="Культуры")
        el-select(v-model="item.cultureIds", filterable, multiple)
          el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.id")
      el-form-item.form-item-iterable(label="Классы")
        el-select(v-model="item.finalProductIds", filterable, multiple)
          el-option(v-for="f in finalproducts", :key="f.id", :label="f.name", :value="f.id")
      template(v-if="qualityTypeValues.length")
        el-form-item.form-item-iterable(label="Степень качества")
          el-select(v-model="item.codeIds", filterable, multiple)
            el-option(v-for="q in qualityTypeValues", :key="q.id", :label="q.name", :value="q.id")
      template(v-else)
        el-form-item(label="Требование от")
          el-input.form-input(type="number", v-model.number="item.minValue")
        el-form-item(label="Требование до")
          el-input.form-input(type="number", v-model.number="item.maxValue")
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
      el-table-column(prop="qualityName", label="Вид качества")
      el-table-column(label="Культуры")
        template(slot-scope="scope")
          el-tag.el-tag(v-for="(item, index) in scope.row.cultures", color="#20a0ff", :key="index")
            span(:title="item") {{ item }}
      el-table-column(label="Классы")
        template(slot-scope="scope")
          el-tag.el-tag(v-for="(item, index) in scope.row.finalproducts", color="#20a0ff", :key="index")
            span(:title="item") {{ item }}
      el-table-column(prop="minValue", label="Требование от")
      el-table-column(prop="maxValue", label="Требование до")
      el-table-column(label="Степень качества")
        template(slot-scope="scope")
          el-tag.el-tag(v-for="(item, index) in scope.row.qualityTypeValues", color="#20a0ff", :key="index")
            span(:title="item") {{ item }}
      el-table-column(fixed="right", align="center", width="140")
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
      culturequalityconditions: [],
      culturequalitytypes: [],
      cultures: [],
      finalproducts: [],
      tableData: [],
      qualityTypeValues: [],
      maxHeight: 450,
      formVisible: false,
      item: {
        qualityTypeId: null,
        cultureIds: [],
        finalProductIds: [],
        codeIds: [],
        minValue: null,
        maxValue: null,
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
      "culturequalitytypes",
      "finalproducts",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.culturequalitytypes = fromVuex("culturequalitytypes")
      this.cultures = fromVuex("cultures")
      this.finalproducts = fromVuex("finalproducts")
      this.getData()
    },
    getData() {
      this.loading = true
      http.getWithoutCache("culturequalityconditions")
        .then(data => {
          this.setData(data)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    setData(data) {
      this.culturequalityconditions = data
      this.setTableData()
    },
    setTableData() {
      let data = deepClone(this.culturequalityconditions)
      let formatted = this.formatData(data)
      this.tableData = formatted
    },
    formatData(data) {
      return data.map(d => {
        let qualityType = fromVuex("culturequalitytypes").find(c => c.qualityTypeId == d.qualityTypeId)
        d.qualityName = qualityType && qualityType.qualityName
        d.cultures = d.cultureIds.map(id => {
          let culture = fromVuex("cultures").find(c => c.id == id)
          return culture && culture.name
        })
        d.finalproducts = d.finalProductIds.map(id => {
          let finalproduct = fromVuex("finalproducts").find(c => c.id == id)
          return finalproduct && finalproduct.name
        })
        d.qualityTypeValues = d.codeIds.map(id => {
          let qualityTypeValue = qualityType && qualityType.qualityTypeValues.find(q => q.id == id)
          return qualityTypeValue && qualityTypeValue.name
        })
        return d
      })
    },
    setQualityTypeValues(qualityTypeId) {
      if (qualityTypeId) {
        let qualityType = fromVuex("culturequalitytypes").find(c => c.qualityTypeId == qualityTypeId)
        this.qualityTypeValues = deepClone(qualityType.qualityTypeValues)
        if (this.qualityTypeValues.length) {
          delete this.item.minValue
          delete this.item.maxValue
        } else {
          this.$set(this.item, "codeIds", [])
        }
      } else {
        this.qualityTypeValues = []
      }
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
      this.reset()
      this.formTitle = "Новая запись"
      this.formVisible = true
    },
    edit(id) {
      this.mode = "edit"
      this.reset()
      this.formTitle = "Редактирование"
      let item = this.culturequalityconditions.find(c => c.id == id)
      this.setQualityTypeValues(item.qualityTypeId)
      this.item = deepClone(item)
      this.formVisible = true
    },
    save() {
      this.loadingItem.save = true
      let body = deepClone(this.item)
      if (body.codeIds.length) {
        delete body.minValue
        delete body.maxValue
      }
      let httpMethod = (this.mode == "create") ? "post" : "put"
      http[httpMethod]("culturequalityconditions", body)
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
        qualityTypeId: null,
        cultureIds: [],
        finalProductIds: [],
        codeIds: [],
        minValue: null,
        maxValue: null,
      }
    },
    remove(id) {
      this.$confirm("Действительно удалить?", "Внимание", {
        confirmButtonText: "OK",
        cancelButtonText: "Отмена",
        type: "warning"
      }).then(() => {
        http.delete(`culturequalityconditions/${id}`)
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
</style>
