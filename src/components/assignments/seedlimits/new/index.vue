<template lang="pug">
.workspace-seedlimits(v-if="ready")
  .container-seedlimits(:class="{ 'container-seedlimits-active' : showPanelBottom }")
    el-dialog(:visible.sync="editDialogVisible", title="Редактирование", size="tiny")
      renew(:form="form")

    el-form.form-seedlimits(
      label-position="top",
      label-width="90px",
      :rules="formRules",
      :model="item",
      ref="formStep1Container",
      :inline="true"
    )
      el-form-item(label="Поле")
        el-select(v-model="item.fieldId", filterable)
          el-option(
            v-for="f in fields",
            :label="f.displayString",
            :value="f.id",
            :key="f.id",
          )
      el-form-item(label="Площадь посева")
        el-slider(v-model="item.area", :max="item.areaMax", show-input)
      el-form-item(label="Культура")
        el-select(v-model="item.cultureId", filterable)
          el-option(
            v-for="c in cultures",
            :label="c.name",
            :value="c.id",
            :key="c.id",
          )
      el-form-item(label="Чистота семян")
        el-input(v-model="item.seedFrequency", filterable)
      el-form-item(label="Всхожесть семян")
        el-input(v-model="item.seedGermination", filterable)
      el-form-item(label="Масса 1000 семян")
        el-input(v-model="item.seedWeight", filterable)
      el-form-item(label="Сорт")
        el-select(v-model="item.cultureSortId", filterable)
          el-option(
            v-for="cs in filteredCultureSorts",
            :label="cs.name",
            :value="cs.id",
            :key="cs.id",
          )
      el-form-item(label="Норма млн/га")
        el-slider(v-model="item.seedMillionNumber", :min="minSeedMln", :max="maxSeedMln", :step="0.05", show-input, filterable)
      el-form-item(label="Расчет нормы высева(кг/га)") {{ getSowingNormative }}
      el-form-item(label="Репродукция")
        el-select(v-model="item.reproductionId", filterable)
          el-option(
          v-for="c in reproductions",
          :label="c.name",
          :value="c.id",
          :key="c.id",
          )
      el-form-item(label="Конечный продукт")
        el-select(v-model="item.cultureParameterId", filterable)
          el-option(
            v-for="c in cultureparameters",
            :label="c.name",
            :value="c.id",
            :key="c.id",
          )
      el-form-item(label="Операции")
        el-button(size="small",  type="primary", native-type="submit", @click.prevent="postItem") Добавить #[i.el-icon-check]
        el-button(v-if="showSecondCultureElements", size="small",  type="danger", @click="removeSecondCulture", style="margin-right: 10px;") Убрать вторую культуру
        el-button(v-else, size="small",  type="primary", @click="addSecondCulture", style="margin-right: 10px;") Вторая культура
        .show-panel-buttons(v-if="fieldClickedId")
          el-button(v-if="showPanelBottom", size="small",  type="danger", @click="showPanelBottom = false") Скрыть историю поля
          el-button(v-else, size="small",  type="primary", @click="showPanelBottom = true") История поля

      el-dialog(:visible.sync="showSecondCultureElements", title="Вторая культура", size="large")
        el-form-item(label="Культура")
          el-select(v-model="item.secondCultureId", filterable)
            el-option(
              v-for="c in cultures",
              :label="c.name",
              :value="c.id",
              :key="c.id",
            )
        el-form-item(label="Cорт")
          el-select(v-model="item.secondCultureSortId", filterable)
            el-option(
            v-for="cs in filteredCultureSortsSecondCulture",
            :label="cs.name",
            :value="cs.id",
            :key="cs.id",
            )
        el-form-item(label="Норма млн/га")
          el-slider(v-model="item.secondSeedMillionNumber", :min="secondMinSeedMln", :max="secondMaxSeedMln", :step="0.05", show-input, filterable)
        el-form-item(label="Чистота семян")
          el-input(v-model="item.secondSeedFrequency", filterable)
        el-form-item(label="Всхожесть семян")
          el-input(v-model="item.secondSeedGermination", filterable)
        el-form-item(label="Масса 1000 семян")
          el-input(v-model="item.secondSeedWeight", filterable)
        el-form-item(label="Репродукция")
          el-select(v-model="item.secondReproductionId", filterable)
            el-option(
            v-for="c in reproductions",
            :label="c.name",
            :value="c.id",
            :key="c.id",
            )
        el-form-item(label="Конечный продукт")
          el-select(v-model="item.secondCultureParameterId", filterable)
            el-option(
            v-for="c in cultureparameters",
            :label="c.name",
            :value="c.id",
            :key="c.id",
            )
        el-form-item(label="Расчет нормы высева(кг/га)") {{ getSecondSowingNormative }}

    h2(class="tableHeading") Расчет семян
      span(:style="{marginRight: '30px'}")
      el-button.filter(@click="filterUnfolded = true",) .
      el-button.printer(type="default", @click="downloadButton(3)", :loading="buttonLoadings.includes('print')") .
      filter-cols(:cols="cols")
      template(v-if="filteredSeedLimits.length")
        el-button(type='default', @click="LZKDialogVisible = true") ЛЗК
        el-button(type='default', @click="downloadButton(2)", :loading="buttonLoadings.includes('invoice')") Накладная
    el-dialog(v-if="LZKDialogVisible", :visible.sync="LZKDialogVisible", title="Фильтр", size="tiny", :close-on-click-modal="false")
      div(:class="{downloadLzkStyle: true}")
        el-date-picker(v-model="download.selectedDate")
      div(:class="{downloadLzkStyle: true}")
        el-select(v-model="download.seedLimitIds", filterable, multiple)
          el-option(v-for="s in seedlimits", :label="s.shortFieldCultureName", :value="s.id", :key="s.id")
      div(:class="{downloadLzkStyle: true}")
        el-button.printer(type='default', @click="downloadButton(1)", :loading="buttonLoadings.includes('limit')") .

    el-dialog(title="Фильтр", v-model="filterUnfolded")
      el-form(:model="filterModel", label-width="120px")
        el-form-item(label="Культуры")
          el-select(v-model="filterModel.culturesIds", multiple, filterable)
            el-option(
              v-for="item in cultures",
              :label="item.name",
              :value="item.id",
              :key="item.id",
            )
        el-form-item(label="Поля")
          el-select(v-model="filterModel.fieldsIds", multiple, filterable)
            el-option(
              v-for="item in _fields",
              :label="item.displayString",
              :value="item.id",
              :key="item.id",
            )
        el-form-item
          el-button(@click="applyFilter", type="primary") Применить
          el-button(@click="nullFilter") Сбросить
    .el-table-cont
      el-table(
        :data="paginate(filteredSeedLimits)",
        resizable,
        border,
        v-loading="loading",
        element-loading-text="Загружается...",
        )
        el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")

        el-table-column(
          label="Операции",
          width="120"
        ): template(slot-scope="scope")
          el-button(@click="update(scope.row.id)", size="small", icon="edit", :disabled="loaders[scope.row.id]")
          el-button(@click="removeSeedlimit(scope.row.id)", size="small", icon="delete2", :loading="loaders[scope.row.id]")

      el-pagination(
      layout="total, prev, pager, next",
      :total="filteredSeedLimits.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
      )

  .panel-bottom(v-if="ready && showPanelBottom")
    sevoborot(:fieldClickedId="fieldClickedId")
    lastassignments(:fieldClickedId="fieldClickedId")
</template>

<script>
import http from 'lib/httpQueryV2'
import {createIndex} from 'lib/utils'
import ListController from 'mixins/ListController'
import {EventBus} from 'services/EventBus'
import moment from 'moment'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import renew from './renew.vue'

import filterCols from "components/filterCols"
import { Message } from 'element-ui'

import sevoborot from "components/panelbottom/sevoborot"
import lastassignments from "components/panelbottom/lastassignments"

import {deepClone} from 'lib/utils';

export default {
  components: {
    renew,
    filterCols,
    sevoborot,
    lastassignments
  },
  mixins: [
    ListController,
    RecordsLoaderV2
  ],
  data() {
    return {
      cols: [
        {
          prop: "showField.displayString",
          label: "Поле",
          active: true
        },
        {
          prop: "area",
          label: "Площадь",
          active: true
        },
        {
          prop: "showCulture.name",
          label: "Культура",
          active: true
        },
        {
          prop: "showCultureSort.name",
          label: "Сорт",
          active: true
        },
        {
          prop: "showReproduction.name",
          label: "Репродукция",
          active: true
        },
        {
          prop: "showSowingNormative",
          label: "Норма высева",
          active: false,
        },
        {
          prop: "showSeedFrequency",
          label: "Чистота семян",
          active: false
        },
        {
          prop: "showSeedGermination",
          label: "Всхожесть семян",
          active: false
        },
        {
          prop: "showSeedWeight",
          label: "Масса 1000 семян",
          active: false
        },
        {
          prop: "showSeedMillionNumber",
          label: "Норма млн/га",
          active: true
        },
        {
          prop: "showCultureparameter.name",
          label: "Конечный продукт",
          active: true
        },
        {
          prop: "showSeedTotal",
          label: "Итого",
          active: true
        },
      ],
      perPage: 5,
      loaders: {},
      seedWeight: 0,
      currentPage: 1,
      selectedDate: Date.now(),
      seedFrequency: 0,
      cultureGroups: [],
      seedGermination: 0,
      form: {},
      editDialogVisible: false,
      LZKDialogVisible: false,
      formRules: {
        fieldId: [{
          required: true,
          message: 'Поле обязательно',
          trigger: 'blur'
        }],
        cultureId: [{
          required: true,
          type: 'integer',
          message: 'Поле обязательно',
          trigger: 'change'
        }],
        cultureSortId: [{
          required: true,
          type: 'integer',
          message: 'Поле обязательно',
          trigger: 'change'
        }],
        reproductionId: [{
          required: true,
          type: 'integer',
          message: 'Поле обязательно',
          trigger: 'change'
        }]
      },
      item: {
        area: 0,
        date: null,
        year: null,
        areaMax: 0,
        fieldId: null,
        cultureId: null,
        seedWeight: 0,
        seedFrequency: 0,
        cultureSortId: null,
        reproductionId: null,
        seedMillionNumber: 0,
        seedGermination: 0,
        cultureParameterId: null,

        secondArea: 0,
        secondCultureId: null,
        secondCultureSortId: null,
        secondReproductionId: null,
        secondSeedWeight: 0,
        secondSeedFrequency: 0,
        secondSeedMillionNumber: 0,
        secondSeedGermination: 0,
        secondCultureParameterId: null,
      },
      fieldsForDisplay: [],
      cultureFieldZone: null,
      minSeedMln: 0,
      maxSeedMln: 0,
      secondMinSeedMln: 0,
      secondMaxSeedMln: 0,
      download: {
        fieldId: null,
        selectedDate: Date.now()
      },
      buttonLoadings: [],
      loading: true,
      _seedlimits: [],
      _fields: [],
      fields: [],
      cultures: [],
      cultureSorts: [],
      reproductions: [],
      cultureparameters: [],
      culturefieldzones: [],
      seedlimits: [],
      culturerotation: [],
      clonedSeedLimits: [],
      vuexSeedLimits: [],
      tableSeedLimits: [],
      filteredSeedLimits: [],
      fieldClickedId: null,
      showPanelBottom: false,
      showSecondCultureElements: false,
    }
  },
  computed: {
    getSowingNormative() {
      let sowingNormative = 0
      sowingNormative = Math.round((this.item.seedMillionNumber * this.item.seedWeight * 100) / (this.item.seedGermination * this.item.seedFrequency / 100))
      if (typeof sowingNormative != 'number' || isNaN(sowingNormative)) {
        sowingNormative = 0
      }
      return sowingNormative
    },
    getSecondSowingNormative() {
      let sowingNormative = 0
      sowingNormative = Math.round((this.item.secondSeedMillionNumber * this.item.secondSeedWeight * 100) / (this.item.secondSeedGermination * this.item.secondSeedFrequency / 100))
      if (typeof sowingNormative != 'number' || isNaN(sowingNormative)) {
        sowingNormative = 0
      }
      return sowingNormative
    },
    previousYearCultures() {
      let array = []
      let previousYear = this.$root.context.year-1
      if (this.item.fieldId){
        this.clonedSeedLimits.forEach(s => {
          if (s.year == previousYear && s.fieldId == this.item.fieldId){
            array.push(s.cultureId)
          }
        })
      }
      return array
    },
    _seedlimitsAreas() {
      let areas = {}
      this.seedlimits.map(s => {
        if (!areas[s.fieldId]) areas[s.fieldId] = 0;
        areas[s.fieldId] += s.area
      })
      return areas
    },
    filteredCultureSorts() {
      let sorts = this.cultureSorts.filter(x => x.cultureId === this.item.cultureId);
      let foundCultureSort = sorts.find(x => x.id === this.item.cultureSortId) ? this.item.cultureSortId : null;
      this.item.cultureSortId = foundCultureSort;
      this.item.reproductionId = foundCultureSort ? this.item.reproductionId : null;
      this.item.seedFrequency = foundCultureSort ? this.item.seedFrequency : 0;
      this.item.seedGermination = foundCultureSort ? this.item.seedGermination : 0;
      this.item.seedWeight = foundCultureSort ? this.item.seedWeight : 0;
      return sorts;
    },
    filteredCultureSortsSecondCulture() {
      let sorts = this.cultureSorts.filter(x => x.cultureId === this.item.secondCultureId);
      let foundCultureSort = sorts.find(x => x.id === this.item.secondCultureSortId) ? this.item.secondCultureSortId : null;
      this.item.secondCultureSortId = foundCultureSort;
      this.item.secondReproductionId = foundCultureSort ? this.item.secondReproductionId : null;
      this.item.secondSeedFrequency = foundCultureSort ? this.item.secondSeedFrequency : 0;
      this.item.secondSeedGermination = foundCultureSort ? this.item.secondSeedGermination : 0;
      this.item.secondSeedWeight = foundCultureSort ? this.item.secondSeedWeight : 0;
      return sorts;
    },
  },
  watch: {
    'item.fieldId' (val) {
      this.setAreaAndSliderMinMax();
      this.checkCultureRotation();
      this.fieldClickedId = val
    },
    'item.cultureId' (val) {
      if (val == 17) {
        this.item.cultureSortId = 41
        this.item.reproductionId = 9
        this.item.seedFrequency = 0
        this.item.seedGermination = 0
        this.item.seedWeight = 0
      }
      this.checkCultureRotation();
      this.setSliderMinMax();
    },
    'item.secondCultureId' (val) {
      this.setSecondSliderMinMax();
    },
  },
  created() {
    this.loading = true
    this.fetchEntities([
      'seedlimits',
      'fields',
      'cultures',
      'sorts',
      'reproductions',
      'culturefieldzones',
      'culturerotation',
      'cultureparameters',
    ], this.afterFetch);
    EventBus.$on('SeedLimitsChanged', () => {
      this.editDialogVisible = false
      this.refresh();
    });
    this.item.year = this.$root.context.year;
  },
  methods: {
    applyFilter() {
      this.filteredSeedLimits = deepClone(this.tableSeedLimits)
      this.filteredSeedLimits = this.filteredSeedLimits.filter(x => {
        let filterCulture = !this.filterModel.culturesIds.length > 0 || (this.filterModel.culturesIds && this.filterModel.culturesIds.indexOf(x.cultureId) > -1)
        let filterField = !this.filterModel.fieldsIds.length > 0 || (this.filterModel.culturesIds && this.filterModel.fieldsIds.indexOf(x.fieldId) > -1)
        if (filterCulture && filterField) return x
      })
      this.filterUnfolded = false
    },
    nullFilter() {
      for (let key in this.filterModel){
        this.filterModel[key] = []
      }
      this.filteredSeedLimits = deepClone(this.tableSeedLimits)
      this.filterUnfolded = false
    },
    checkCultureRotation(){
      let cultureRotation = null
      cultureRotation = this.culturerotation.find(c => c.cultureId == this.item.cultureId)
      let error = false
      if (cultureRotation) {
        this.previousYearCultures.forEach(lyc => {
          cultureRotation.notRecommendedList.forEach(crn => {
            if (lyc == crn){
              error = 'Предупреждение: нарушение ротации'
            }
          })
          cultureRotation.forbiddenList.forEach(crn => {
            if (lyc == crn){
              error = 'Предупреждение: нарушение ротации'
            }
          })
        })
      }
      if (error) {
        this.$message({message: `${error}`, type: "error", duration: 6500, showClose: false});
      }
    },
    afterFetch() {
      this._seedlimits = this.fromVuex('seedlimits')
      this.clonedSeedLimits = deepClone(this._seedlimits)
      this.vuexSeedLimits = deepClone(this._seedlimits)
      this._fields = this.fromVuex('fields')
      this.fields = this.fromVuex('fields').map(f => {
        let area = this._seedlimitsAreas[f.id] || 0
        f.area -= area
        return f
      }).filter(f => f.area > 0)
      this.cultures = this.fromVuex('cultures')
      this.cultureSorts = this.fromVuex('sorts')
      this.reproductions = this.fromVuex('reproductions')
      this.culturefieldzones = this.fromVuex('culturefieldzones')
      this.culturerotation = this.fromVuex('culturerotation')
      this.cultureparameters = this.fromVuex('cultureparameters')
      this.setSeedlimits()
    },
    setSeedlimits() {
      const fields = createIndex(this._fields)
      const cultures = createIndex(this.cultures)
      const cultureSorts = createIndex(this.cultureSorts)
      const reproductions = createIndex(this.reproductions)
      const cultureparameters = createIndex(this.cultureparameters)
      this.seedlimits = this._seedlimits
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        .map(seedlimit => {
          this.$set(this.loaders, seedlimit.id, false)
          seedlimit.field = fields[seedlimit.fieldId]
          seedlimit.culture = cultures[seedlimit.cultureId]
          seedlimit.cultureSort = cultureSorts[seedlimit.cultureSortId]
          seedlimit.reproduction = reproductions[seedlimit.reproductionId]
          seedlimit.cultureparameter = cultureparameters[seedlimit.cultureParameterId]
          seedlimit.secondCulture = cultures[seedlimit.secondCultureId]
          seedlimit.secondCultureSort = cultureSorts[seedlimit.secondCultureSortId]
          seedlimit.secondReproduction = reproductions[seedlimit.secondReproductionId]
          seedlimit.secondCultureparameter = cultureparameters[seedlimit.secondCultureParameterId]
          seedlimit.shortFieldCultureName = seedlimit.fieldNewName + ' ' + (seedlimit.culture && seedlimit.culture.shortName);
          return seedlimit
        });
      this.tableSeedLimits = []
      this.seedlimits.forEach(seedlimit => {
        let item = deepClone(seedlimit)
        item.showArea = item.area
        item.showField = item.field
        item.showCulture = item.culture
        item.showCultureSort = item.cultureSort
        item.showReproduction = item.reproduction
        item.showCultureparameter = item.cultureparameter
        item.showSeedFrequency = item.seedFrequency
        item.showSeedGermination = item.seedGermination
        item.showSeedWeight = item.seedWeight
        item.showSeedMillionNumber = item.seedMillionNumber
        item.showSowingNormative = item.sowingNormative
        item.showSeedTotal = item.seedTotal
        this.tableSeedLimits.push(item)
        if (seedlimit.secondCultureId) {
          item = deepClone(seedlimit)
          item.showArea = item.secondArea
          item.showField = item.field
          item.showCulture = item.secondCulture
          item.showCultureSort = item.secondCultureSort
          item.showReproduction = item.secondReproduction
          item.showCultureparameter = item.secondCultureparameter
          item.showSeedFrequency = item.secondSeedFrequency
          item.showSeedGermination = item.secondSeedGermination
          item.showSeedWeight = item.secondSeedWeight
          item.showSeedMillionNumber = item.secondSeedMillionNumber
          item.showSowingNormative = item.secondSowingNormative
          item.showSeedTotal = item.secondSeedTotal
          this.tableSeedLimits.push(item)
        }
      })
      this.filteredSeedLimits = deepClone(this.tableSeedLimits)
      this.loading = false
    },
    update(id) {
      let finded = this.vuexSeedLimits.find(seedlimit => seedlimit.id == id)
      this.form = Object.assign({}, finded)
      this.editDialogVisible = true
    },
    initFilter() {
      return {
        'culturesIds': [],
        'fieldsIds': [],
      }
    },
    setAreaAndSliderMinMax() {
      this.setArea();
      this.setSliderMinMax();
      this.setSecondSliderMinMax();
    },
    setArea() {
      this.item.areaMax = 0;
      this.item.area = 0;
      let fieldAreaMax = this.fields.filter(f => f.id === this.item.fieldId)[0] ? this.fields.filter(f => f.id === this.item.fieldId)[0].area : 0
      this.item.areaMax = fieldAreaMax;
      this.item.area = fieldAreaMax;
    },
    setSliderMinMax() {
      if (this.item.fieldId && this.item.cultureId) {
        let field = this._fields.find(f => f.id === this.item.fieldId)
        this.cultureFieldZone = null
        if (this.culturefieldzones.length > 0 && field) {
          this.cultureFieldZone = this.culturefieldzones.find(cfz => cfz.cultureId == this.item.cultureId && cfz.fieldZoneId == field.fieldZoneId)
          this.maxSeedMln = this.cultureFieldZone ? this.cultureFieldZone.maxNumber : 0
          this.minSeedMln = this.cultureFieldZone ? this.cultureFieldZone.minNumber : 0
        }
        this.item.seedMillionNumber = 0;
      }
    },
    setSecondSliderMinMax() {
      if (this.item.fieldId && this.item.secondCultureId) {
        let field = this._fields.find(f => f.id === this.item.fieldId)
        this.cultureFieldZone = null
        if (this.culturefieldzones.length > 0 && field) {
          this.cultureFieldZone = this.culturefieldzones.find(cfz => cfz.cultureId == this.item.secondCultureId && cfz.fieldZoneId == field.fieldZoneId)
          this.secondMaxSeedMln = this.cultureFieldZone ? this.cultureFieldZone.maxNumber : 0
          this.secondMinSeedMln = this.cultureFieldZone ? this.cultureFieldZone.minNumber : 0
        }
        this.item.secondSeedMillionNumber = 0;
      }
    },
    load() {
      this.fetchEntities([
        'seedlimits',
      ], this.afterFetch);
    },
    refresh() {
      this.loading = true
      this.load();
    },
    removeSeedlimit(id) {
      this.$confirm('Теперь при удалении посевa все связанные задания будут автоматически удалены. Действительно удалить?', 'Внимание!', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        this.loaders[id] = true
        http.delete('seedlimits', id).then(() => {
          this.loaders[id] = false
          this.refresh();
        })
      })
    },
    postItem() {
      this.showPanelBottom = false
      const organization = this.$root.context.organization;
      const path = 'seedlimits/' + organization;
      const dt = moment(this.selectedDate).format("MM.DD.YYYY")
      this.item.date = dt;
      this.item.year = this.$root.context.year;
      this.item.secondArea = this.item.area
      let data = this.item
      this.loading = true
      http.post(path, data).then(() => {
        this.refresh();
        this.nullItem();
        this.removeSecondCulture();
      })
    },
    nullItem() {
      for (let key in this.item){
        this.item[key] = null
      }
      this.item.area = 0
      this.item.secondArea = 0
      this.item.areaMax = 0
      this.item.seedMillionNumber = 0
      this.item.secondSeedMillionNumber = 0
      this.item.seedFrequency = 0
      this.item.secondSeedFrequency = 0
      this.item.seedGermination = 0
      this.item.secondSeedGermination = 0
      this.item.seedWeight = 0
      this.item.secondSeedWeight = 0
    },
    nullItemSecondCulture() {
      this.item.secondArea = 0
      this.item.secondCultureId = null
      this.item.secondCultureSortId = null
      this.item.secondReproductionId = null
      this.item.secondSeedWeight = 0
      this.item.secondSeedFrequency = 0
      this.item.secondSeedMillionNumber = 0
      this.item.secondSeedGermination = 0
      this.item.secondCultureParameterId = null
    },
    downloadButton(formNum) {
      const fieldId = this.item.fieldId;
      const organization = this.$root.context.organization
      let dt = moment(this.download.selectedDate).format("MM.DD.YYYY")
      let path = 'seedlimits/';
      if (formNum === 1) {
        path = 'SeedLimitCardForm';
      } else if (formNum === 2) {
        path = 'SeedLimitInvoiceForm';
      } else if (formNum === 3) {
        path = 'SeedLimitAllCardForm';
      }

      // item.loading = true;
      let filename = 'printForm'
      let buttonLoading = '';
      if (formNum === 1) {
        filename = "Лимитно-заборная-карта"
        buttonLoading = 'limit';
        this.buttonLoadings.push('limit')
      } else if (formNum === 2) {
        filename = 'Накладная'
        buttonLoading = 'invoice';
        this.buttonLoadings.push('invoice')
      } else if (formNum === 3) {
        filename = 'Расчет потребности семян';
        buttonLoading = 'print';
        this.buttonLoadings.push('print');
      }

      let body;
      let landscape = false;

      if (buttonLoading !== 'print') {
        body = {
          organizationId: organization,
          seedLimitIds: this.download.seedLimitIds,
          date: moment(this.download.selectedDate).format("YYYY-MM-DDTHH:mm:ss")
        }
      } else {
        body = {
          organizationId: organization
        }
        landscape = true;
      }

      http.downloadPDF(path, body, filename, landscape).then(() => {
        this.buttonLoadings = [];
      });
    },
    addSecondCulture() {
      this.showSecondCultureElements = true
    },
    removeSecondCulture() {
      this.showSecondCultureElements = false
    },
  }
}
</script>

<style lang="stylus">
.form-seedlimits .el-form-item
  width calc(33% - 30px)
  margin 15px
.form-seedlimits .el-input
  max-width 217px
.form-seedlimits .el-slider
  max-width 350px
.form-seedlimits .show-panel-buttons
  display inline-block
</style>
