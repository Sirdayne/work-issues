<template lang="pug">
.catalog-static-container(v-loading="loading", element-loading-text="Загружается...")
  el-dialog(:visible.sync="formDialogVisible", :title="dialogTitle", size="large", :modal="false")
    template(v-if="showGPTAF")
      gp-table-and-form(:data="gpData", :cultures="culturesData", @onSubmit="submit")
  div(style="margin-bottom: 10px")
    el-button(@click="add()", type="primary") Новая запись
  template(v-if="tableData.length")
    el-form(
      :model="formItem",
      :inline="true",
      ref="form",
      :label-position="'left'"
    )
      el-form-item(label="Культура")
        el-select(v-model="formItem.cultures", multiple, disabled)
          el-option(
            v-for="c in cultures",
            :key="c.id",
            :label="c.name",
            :value="c.id"
            )
      el-form-item.invisible-color(label=".")
        template(v-if="tableData.length")
          el-button(@click="edit()", icon="edit", title="Редактировать")
          el-button(@click="remove()", icon="delete", title="Удалить")
    .fx-table
      .fx-row.fx-light-grey.header
        .fx-cell.code(style="font-weight: bold;") Код
        .fx-cell(style="font-weight: bold;") Стадия развития
      template(v-for="ph in tableData")
        .fx-row.fx-light-grey.header
          .fx-cell(style="font-weight: bold;") {{ph.name}}
        .fx-row(v-for="st in ph.stages")
          .fx-cell.code {{ st.code }}
          .fx-cell {{ st.name }}
    el-pagination(
      layout="total, prev, pager, next",
      :total="growingphases.length",
      :page-size="page.per",
      :current-page.sync="page.current",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange",
    )
</template>
<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import GpTableAndForm from './gp-table-and-form'
import {deepClone} from 'lib/utils';

export default {
  components: {
    GpTableAndForm,
  },
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  data() {
    return {
      api: "growingphases",
      growingphases: [],
      cultures: [],
      loading: false,
      formItem: {
        cultures: [],
      },
      formDialogVisible: false,
      showGPTAF: false,
      httpMethod: "",
      dialogTitle: "",
      page: {
        per: 1,
        current: 1,
      },
      gpByPage: {},
      tableData: [],
      gpData: [],
      culturesData: [],
    }
  },
  computed: {
    remainingCultures() {
      let cultures = deepClone(this.cultures)
      let used = this.growingphases.reduce((arr, gp) => {
        return arr.concat(gp.cultures)
      }, [])
      cultures = cultures.filter(c => !used.includes(c.id))
      return cultures
    },
    remainingCulturesAndSelected() {
      let cultures = deepClone(this.cultures)
      cultures = cultures.filter(c => this.gpByPage.cultures.includes(c.id))
      return this.remainingCultures.concat(cultures)
    },
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      this.fetchEntities([
        'growingphases',
        'cultures',
      ], this.afterFetch);
    },
    afterFetch() {
      this.growingphases = this.fromVuex('growingphases')
      this.cultures = this.fromVuex('cultures')
      this.setData()
      this.loading = false
    },
    setData(num = 1) {
      if (!this.growingphases.length) {
        this.gpByPage = {cultures: []}
        this.tableData = []
        return;
      }
      this.gpByPage = deepClone(this.growingphases[num - 1])
      this.formItem.cultures = deepClone(this.gpByPage.cultures)
      this.setTableData()
    },
    setTableData() {
      let phases = deepClone(this.gpByPage.phases)
      let phKeys = Object.keys(phases)
      let tableData = phKeys.map(phKey => {
        let phase = phases[phKey]
        let stages = phase.stages
        let stKeys = Object.keys(stages)
        let newStages = stKeys.map(stKey => {
          return {
            "code": stKey,
            "name": stages[stKey],
          }
        })
        return {
          "id": phKey,
          "name": phase.phaseName,
          "stages": newStages,
        }
      })
      this.tableData = tableData
    },
    refresh() {
      this.page.current = 1
      this.load()
    },
    handleClose(done) {
      this.gpData = null
      this.showGPTAF = false
      done();
    },
    onCurrentPageChange(num) {
      this.setData(num)
    },
    edit() {
      this.mode = "edit"
      this.dialogTitle = "Редактирование"
      let item = deepClone(this.gpByPage)
      item.cultures = deepClone(this.formItem.cultures)
      item.phases = deepClone(this.tableData)
      this.gpData = item
      this.culturesData = deepClone(this.remainingCulturesAndSelected)
      this.formDialogVisible = true
      this.showGPTAF = true
    },
    add() {
      this.mode = "add"
      this.dialogTitle = "Добавление"
      let item = {}
      item.cultures = []
      item.phases = []
      this.gpData = item
      this.culturesData = deepClone(this.remainingCultures)
      this.formDialogVisible = true
      this.showGPTAF = true
    },
    submit(item) {
      this.formDialogVisible = false
      let httpMethod = (this.mode == "edit") ? "put" : "post"
      http[httpMethod](this.api, item)
        .then(() => {
          this.refresh()
        })
      this.gpData = null
      this.showGPTAF = false
    },
    remove() {
      this.$confirm('Действительно удалить?', 'Внимание', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        this.loading = true
        let id = this.gpByPage.id
        http.delete(this.api, id)
          .then(() => {
            this.refresh()
          })
      }).catch(() => {});
    },
  }
}
</script>
<style lang="stylus" scoped>
.catalog-static-container
  width 100%
.fx-table
  width 570px
.fx-cell.code
  max-width 75px
.fx-row:not(.header) .fx-cell
  text-align left
  &.code
    text-align right
.grid-content
  display grid
  grid-template 1fr / auto 1fr
.grid-table
  height 400px
  width 570px
  position relative
.grid-form
  height 400px
  width inherit
  margin-left 10px
  overflow-y auto
  overflow-x auto
</style>
