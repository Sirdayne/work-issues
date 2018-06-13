<template lang="pug">
.cols(v-if="model")
  el-dialog(title="Редактирование", v-model="editDialogVisible", size="tiny", :close-on-click-modal="false")
    el-form(:model="modelForEdit", v-if="modelForEdit", :key="modelForEdit.id", label-width="120px"): div(ref="form")
      el-form-item(v-for="field in model.fields", :label="field.label", :class="hideFields(field.name)", :key="field.id")
        field(
          :value="modelForEdit",
          :field="field.name",
          :model="model"
        )
    span(slot="footer")
      el-button(@click.native="closeDialogs") Отмена
      el-button(type="primary", @click.native="saveAction(modelForEdit.id)") Сохранить
  .workspace(v-loading="loading", element-loading-text="Загружается...")
    el-form(:inline="true")
      el-form-item
        router-link(to="/agroplan/sowings/new")
         el-button Новый посев
      el-form-item
        el-button.filter(
          @click="filterUnfolded = true",
          type="default",
          class="tf-filter"
        ) .
        el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
          el-form(:model="filterModel", label-width="70px", label-position="left")
            el-form-item(label="Поле")
              el-select(v-model="filterModel.filterField", clearable, filterable)
                el-option(
                v-for="item in fields",
                :label="item.newName",
                :value="item.id",
                :key="item.id",
                )
            el-form-item(label="Культура")
              el-select(v-model="filterModel.filterCulture", clearable, filterable)
                el-option(
                v-for="item in cultures",
                :label="item.name",
                :value="item.id",
                :key="item.id",
                )
            el-form-item(label="Сорт")
              el-select(v-model="filterModel.filterSort", clearable, filterable)
                el-option(
                v-for="item in sorts",
                :label="item.name",
                :value="item.id",
                :key="item.id",
                )
            el-form-item(label="Репродукция")
              el-select(v-model="filterModel.filterReproduction", clearable, filterable)
                el-option(
                v-for="item in reproductions",
                :label="item.name",
                :value="item.id",
                :key="item.id",
                )
            el-form-item(label="Конечный продукт")
              el-select(v-model="filterModel.filterCultureParameter", clearable, filterable)
                el-option(
                v-for="item in cultureparameters",
                :label="item.name",
                :value="item.id",
                :key="item.id",
                )
            el-form-item
              el-button(@click="resetFilter") Сбросить
      el-form-item(:class="{invisibleColor: true}", class="tf-xls")
        el-button.excel(type='default', @click="exportTable('form')") .
    .el-table-cont
      table.table.el-table(v-if="filtered")
        thead: tr
          th(
            v-for="field in model.fields",
            v-if="field.preview && !isHideFields(field.name)",
            :class="{ \
              'sorted': sortField == field.name \
            }",
            :sort-dir="sortDir",
            @click="setSortField(field.name)", :key="field.id",
            style="text-align:center;",
          ) {{field.label}}
          th Предшественник
          th(style="width: 120px;!important")
        tbody
          tr(
            v-for="record in paginate(filtered)",
            class="el-table__row"
          )
            td.cell(
              :class="field.cssClass",
              v-for="field in model.fields",
              v-if="field.preview && !isHideFields(field.name)", :key="field.id"
            )
              template(v-if="display(record, field) === undefined || display(record, field) === null"): i.el-icon-minus
              template(v-else)
                template(v-if="display(record, field).constructor === Array")
                  el-tag(v-for="tag in display(record, field)", :key="tag.name") {{tag.name}}
                template(v-else)
                  template(v-if="field.type === Boolean"): i.el-icon-check(v-if="display(record, field)")
                  template(v-if="field.type === Number") {{display(record, field)}}
                  template(v-if="field.type === String") {{display(record, field)}}
                  template(v-if="field.type === Date")   {{showDate(display(record, field))}}
            td.cell
              span(v-for="item in record.previousCultures", style="margin: 0 5px", :key="item.key") {{ item.culture }}
            td.cell(style="width: 120px;!important")
              el-button-group
                el-button(@click="edit(record)", size="small", icon="edit")
                el-button(@click="remove(record.id)", size="small", icon="delete")
    .notify(v-if="filtered && !filtered.length") Нет записей
    .notify(v-if="isPreLoading") Загрузка..
    el-pagination.pagination(
      v-if="filtered && perPage < filtered.length",
      @current-change="handleCurrentChange",
      :current-page="pageNum",
      :page-size="perPage",
      layout="total, prev, pager, next",
      :total="filtered? filtered.length : 0"
    )
</template>

<script>
import field from 'components/field'
import datasets from 'mixins/datasets'
import sowingsModel from '_models/Sowings'
import { fromDot } from 'helpers'

import {EventBus} from 'services/EventBus'
import modByLib from "lib/modByLib";
import ListController from 'mixins/ListController'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import {json2xls} from 'lib/utils'

export default {
  components: {
    field
  },
  mixins: [
    datasets,
    RecordsLoaderV2,
    ListController
  ],
  created() {
    this.init()
    this.fetchEntities([
      'fields',
      'cultures',
      'sorts',
      'reproductions',
      'cultureparameters',
      'croprotations',
    ], this.afterFetch );
  },
  data() {
    return {
      model: null,
      editDialogVisible: false,
      modelForEdit: null,
      infoDialogVisible: false,
      records: null,
      sortField: null,
      sortDir: -1,
      pageNum: 1,
      perPage: 10,
      pageCount: 0,
      isPreLoading: false,
      cultures: [],
      fields: [],
      sorts: [],
      reproductions: [],
      croprotations: [],
      cultureparameters: [],
      loading: true
    }
  },
  updated() {
    modByLib.addTooltips( this.paginatedFiltered );
  },
  computed: {
    paginatedFiltered() {
      let paginatedFiltered = [];
      if ( this.filtered ){
        paginatedFiltered = this.paginate( this.filtered )
      }
      return paginatedFiltered;
    },
    filtered() {
      let records = this.records
      if (this.filterModel.filterCulture && records){
        records = records.filter(r => r.cultureId === this.filterModel.filterCulture)
      }
      if (this.filterModel.filterField && records){
        records = records.filter(r => r.fieldId === this.filterModel.filterField)
      }
      if (this.filterModel.filterSort && records){
        records = records.filter(r => r.cultureSortId === this.filterModel.filterSort)
      }
      if (this.filterModel.filterReproduction && records){
        records = records.filter(r => r.reproductionId === this.filterModel.filterReproduction)
      }
      if (this.filterModel.filterCultureParameter && records){
        records = records.filter(r => r.cultureParameterId === this.filterModel.filterCultureParameter)
      }
      // добавление предшественника
      if (records) {
        records.forEach(r => {
          r.previousCultures = this.getPreviousCultures(this.$root.context.year, r.fieldId)
        })
      }
      return records ? records.filter(r => r.year === this.$root.context.year) : null
    },
    sowingsXLS(){
      let records = this.records;
      let array = [];
      records.forEach(r => {
        array.push({
          'Название поля': r.fieldName,
          'Культура': r.cultureName,
          'Площадь посева': r.area,
          'Урожайность': r.yield,
          'Сорт': this.findNameById(r.cultureSortId, this.sorts),
          'Репродукция': this.findNameById(r.reproductionId, this.reproductions),
          'Конечный продукт': this.findNameById(r.cultureParameterId, this.cultureparameters),
          'Норма высева': r.sowingNormative
        });
      });
      return array;
    }
  },
  methods: {
    findNameById(id, array){
      let object = array.find(x => x.id == id)
      if (object){
        return object.name
      } else
        return 'пусто'
    },
    afterFetch(){
      this.fields = this.fromVuex('fields')
      this.cultures = this.fromVuex('cultures')
      this.sorts = this.fromVuex('sorts')
      this.reproductions = this.fromVuex('reproductions')
      this.croprotations = this.fromVuex('croprotations')
      this.cultureparameters = this.fromVuex('cultureparameters')
      this.loading = false
    },
    exportTable() {
      let name = "Список посевов"
      let colNum = 10
      let data = this.sowingsXLS
      return json2xls(data, name, colNum)
    },
    load(isNew = true) {
      this.isPreLoading = true
      if (isNew) this.quickSearch = ''
      if (isNew) this.pageNum = 1
      if (isNew) this.records = null
      this.getEntity(this.model, (isFinal, records, model) => {
        if(this.getFullEndpoint(this.model, true) !== this.getFullEndpoint(model, true)) return
        this.isPreLoading = false
        this.records = records
      }, true)
    },
    onContextChange(to) {
      if (this.model.contexts.indexOf(to) !== -1) {
        this.load()
      }
    },
    init(obj) {
      if (!/token=/.test(document.cookie) || /token=;/.test(document.cookie) || /token=$/.test(document.cookie)) {
        this.$router.replace('/login')
      } else {
        this.$root.isLogined = true
      }
      this.model = sowingsModel
      this.load()
    },
    paginate(arr) {
      let offset = (this.pageNum-1) * this.perPage
      let records = arr.slice(offset, offset + this.perPage)
      return records
    },
    handleCurrentChange(num) {
      this.pageNum = num
      window.scrollTo(0, 0)
    },
    closeDialogs() {
      this.editDialogVisible = false
      this.infoDialogVisible = false
    },
    edit(row) {
      this.editDialogVisible = true
      this.modelForEdit = row
    },
    remove(id) {
      this.$confirm('Удалить посев ?', 'Предупреждение', {
          confirmButtonText: 'Да',
          cancelButtonText: 'Нет',
          type: 'warning'
      }).then(() => {
        this.deleteItem(this.model, id, model => {
          if(this.getFullEndpoint(this.model, true) !== this.getFullEndpoint(model, true)) return
          this.getEntity(this.model, (isFinal, records, model) => {
            this.records = records
          }, true, true)
        }).then(model => {
          if(this.getFullEndpoint(this.model, true) !== this.getFullEndpoint(model, true)) return
          this.load(false)
        })
        this.closeDialogs()
      })
    },
    setSortField() {

    },
    display(record, field) {
      return fromDot(record, field.name)
    },
    showDate(field) {
      return new Date(Date.parse(field)).toLocaleDateString()
    },
    saveAction(id) {
      let data = {}
      this.$refs.form
      .querySelectorAll('.s-form-field')
      .forEach(el => {
        data[el.dataset.to] = Number(el.value)
      })
      data.id = id
      this.saveItem(this.model, data, model => {
        if(this.getFullEndpoint(this.model, true) !== this.getFullEndpoint(model, true)) return
        this.getEntity(this.model, (isFinal, records, model) => {
          this.records = records
        }, true, true)
      }).then(model => {
        if(this.getFullEndpoint(this.model, true) !== this.getFullEndpoint(model, true)) return
        this.load(false)
      })
      this.closeDialogs()
    },
    hideFields(name) {
      return ['cultureParameterId', 'budgetId'].some(el => el === name)? 'hidden' : ''
    },
    isHideFields(name) {
      return ['cultureParameterId', 'budgetId'].some(el => el === name)
    },
    getPreviousCultures(year, field){
      let croprotation = this.croprotations.find(c => c.fieldId === field)
      if (croprotation) {
        return croprotation.columns[year-1]
      } else
        return 'нет данных'
    },
  }
}
</script>

<style lang="stylus" scoped>
.hidden
  display: none
.quick-search
  float left
  margin 18px
  width 480px
.pagination
  text-align right
  float right
  margin 20px
.table
  margin-bottom 20px
  >>> th
    padding 14px 18px
  >>> tr
    transition .2s background
    &:hover
      background #eaeaea
  >>> .el-tag
    height auto
    margin 2px 0
  >>> .cell
    word-break normal !important

.el-form-item .el-form-item
  margin-bottom 14px
</style>
