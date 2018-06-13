<template lang="pug">
div
  el-dialog(:visible.sync="formVisible", title="Редактирование", size="tiny")
    el-form(label-width="90px", :model="item")
      el-form-item(label="Фактическая норма")
        el-input-number(v-model.number="item.factNormative", :step="0.01")
      el-form-item
        el-button(@click="save()", type="primary", :loading="loadingItem.save") Сохранить
  el-form(:inline="true", :label-position="'top'", :model="item")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату", @change="computeTableData")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.selectedDate.till", format="dd.MM.yyyy", placeholder="Выберите дату", @change="computeTableData")
    el-form-item(label="Бригада")
      el-select(v-model="filterModel.brigadeId", clearable, placeholder="Выбрать", @change="computeTableData")
        el-option(v-for="b in brigades", :key="b.id", :label="b.name", :value="b.id")
    el-form-item(label="Культура")
      el-select(v-model="filterModel.culture", clearable, placeholder="Выбрать", filterable, @change="computeTableData")
        el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.name")
    el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
      el-form(:model="filterModel", label-width="70px", label-position="left")
        el-form-item(label="Поле")
          el-select(v-model="filterModel.field", clearable, filterable)
            el-option(v-for="item in fields", :label="item.newName", :value="item.id", :key="item.id")
        el-form-item
          el-button(type="primary", @click="applyFilter") Применить
          el-button(@click="nullFilter") Сбросить
  h2 Акт списания семян
    span(:style="{marginRight: '30px'}")
    el-button.filter(@click="filterUnfolded = true", type="default") .
    el-button.excel(type='default', @click="exportTable()") .
    filter-cols(:cols="cols")
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
      max-height="500",
    ).content
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :width="col.width", :key="col.prop", header-align="center")
      el-table-column(label="Норма высева", header-align="center")
        el-table-column(prop="seedMillionNumber", label="млн.шт зерен/га", header-align="center")
        el-table-column(prop="sowingNormative", label="кг/га", header-align="center")
      el-table-column(prop="seedTotal", label="Итого согласно ЛЗК", header-align="center")
      el-table-column(prop="deviation", label="Отклонение, кг", header-align="center")
      el-table-column(label="Расход семян факт", header-align="center")
        el-table-column(prop="factNormative", label="кг/га", header-align="center")
        el-table-column(prop="factSeedTotal", label="итого, кг", header-align="center")
      el-table-column(label="Операции", header-align="center", align="center")
        template(slot-scope="scope")
          el-button(@click="edit(scope.row.id)", size="small", icon="edit")
    el-pagination(
      layout="total, prev, pager, next",
      :total="tableData.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange",
    )
</template>
<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import moment from 'moment'
import paginate from 'mixins/paginate'
import filterCols from "components/filterCols"
import {deepClone} from 'lib/utils'

export default {
  components: {
    filterCols
  },
  mixins: [
    RecordsLoaderV2,
    paginate
  ],
  data() {
    return {
      cols: [
        {prop: "date.startFormated", label: "Дата посева", width: 110, active: true},
        {prop: "fieldName", label: "Поле", width: 180, active: true},
        {prop: "sowingArea", label: "Выработка, Га", width: 130, active: true},
        {prop: "previousCulture", label:"Предшественник", width: 170, active: true},
        {prop: "culture", label: "Культура", width: 120, active: true},
        {prop: "sort", label: "Сорт", width: 120, active: true},
        {prop: "reproduction", label: "Репродукция", width: 150, active: true}
      ],
      filterModel: {
        brigadeId: null,
        culture: "",
        selectedDate: {
          from: moment().set({'year': this.$root.context.year, 'month': 4, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}),
          till: moment().set({'year': this.$root.context.year, 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999}),
        }
      },
      filterUnfolded: false,
      item: {},
      perPage: 5,
      currentPage: 1,
      loading: false,
      loadingItem: {
        save: false,
      },
      brigades: [],
      cultures: [],
      fields: [],
      seedlimitfact: [],
      tableData: [],
      formVisible: false,
    }
  },
  created() {
    this.loading = true
    this.fetchEntities([
      'brigades',
      'cultures',
      'fields'
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.brigades = this.fromVuex('brigades')
      this.cultures = this.fromVuex('cultures')
      this.fields = this.fromVuex('fields')
      if (this.brigades && this.brigades.length) this.filterModel.brigadeId = this.brigades[0].id
      this.load()
    },
    load() {
      http.getWithoutCache(`seedlimitfact/${this.$root.context.organization}`)
        .then(data => {
          this.setSLF(data)
        })
        .catch(() => {
          this.setSLF([])
        })
    },
    setSLF(data) {
      this.seedlimitfact = data.map(seedlimit => {
        seedlimit.date.startFormated = moment(seedlimit.date.start).format("DD.MM.YYYY")
        return seedlimit
      })
      .sort((a, b) => new Date(b.date.start) - new Date(a.date.start))
      this.loading = false
      this.computeTableData()
    },
    computeTableData() {
      let from = this.filterModel.selectedDate.from || new Date(moment().set({'year': this.$root.context.year, 'month': 4, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}))
      let till = this.filterModel.selectedDate.till || new Date(moment().set({'year': this.$root.context.year, 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999}))
      let tableData = this.seedlimitfact.filter((slf) => {
        let start = new Date(slf.date.start)
        let end = new Date(slf.date.end)
        let dateRange = (start >= from) && (end <= till)
        let brigade = slf.brigadeId == this.filterModel.brigadeId || !this.filterModel.brigadeId
        let culture = slf.culture == this.filterModel.culture || !this.filterModel.culture
        let field = slf.fieldId == this.filterModel.field || !this.filterModel.field
        return dateRange && brigade && culture && field
      })
      this.tableData = tableData
    },
    applyFilter(){
      this.computeTableData()
      this.filterUnfolded = false
    },
    nullFilter(){
      delete this.filterModel.field
      this.applyFilter()
    },
    edit(id) {
      this.formVisible = true
      let item = this.seedlimitfact.find(slf => slf.id == id)
      this.item = deepClone(item)
    },
    save() {
      this.loadingItem.save = true
      http.put(`seedlimitfact/${this.$root.context.organization}`, this.item)
        .then(() => {
          this.reset()
          this.refresh()
        })
        .catch(() => {
          this.reset()
        })
    },
    reset() {
      this.loadingItem.save = false
      this.formVisible = false
      this.item = {}
    },
    refresh() {
      this.loading = true
      this.load();
    },
    exportTable() {
      let endpoint        = "SeedLimitFactForm";
      let filename        = "Акт списания семян";

      let body = {
        OrganizationId: this.$root.context.organization,
        Date: {
          start: moment(this.filterModel.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss"),
          end: moment(this.filterModel.selectedDate.till).format("YYYY-MM-DDTHH:mm:ss"),
        },
        BrigadeId: this.filterModel.brigadeId
      };

      http.downloadXLS(endpoint, body, filename);
    },
  }
}
</script>
<style>
</style>
