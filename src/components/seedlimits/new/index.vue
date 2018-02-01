<template lang="pug">
div(v-if="ready")
  update
  el-form(
    :label-position="mediaObject.labelPosition",
    label-width="90px",
    :rules="formRules",
    :model="item",
    ref="formStep1Container",
    :inline="true"
  )
    el-row(ref="rowWidth")
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(label="Поле")
          el-select(v-model="item.fieldId", :style="mediaObject.fieldStyle", filterable)
            el-option(
              v-for="f in fields",
              :label="f.displayString",
              :value="f.id",
              :key="f.id",
            )
      template(v-if="mediaObject.reverse")
        el-col(:span="mediaObject.colNotDivided")
          span(class="el-form-item__label") Площадь посева
          el-slider(v-model="item.area", :max="item.areaMax", show-input, :style="mediaObject.sliderStyle")
      template(v-else)
        el-col(:span=2)
          el-form-item(label="Площадь посева")
        el-col(:span=6)
          el-slider(v-model="item.area", :max="item.areaMax", show-input, :style="mediaObject.sliderStyle")
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(label="Культура", :style="mediaObject.cultureLabelStyle")
          el-select(v-model="item.cultureId", filterable, style="width:100%", :style="mediaObject.cultureSelectStyle")
            el-option(
              v-for="c in cultures",
              :label="c.name",
              :value="c.id",
              :key="c.id",
            )
    el-row
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(label="Частота семян")
          el-input(v-model="item.seedFrequency", filterable, :style="mediaObject.seedFrequencyStyle")
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(label="Всхожесть семян")
          el-input(v-model="item.seedGermination", filterable, :style="mediaObject.seedGerminationStyle")
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(label="Масса 1000 семян", :style="mediaObject.seedWeightLabelStyle")
          el-input(v-model="item.seedWeight", filterable, :style="mediaObject.seedWeightStyle")
    el-row
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(label="Сорт")
          el-select(v-model="item.cultureSortId", filterable, :style="mediaObject.cultureSortStyle")
            el-option(
              v-for="cs in filteredCultureSorts",
              :label="cs.name",
              :value="cs.id",
              :key="cs.id",
            )
      template(v-if="mediaObject.reverse")
        template(v-if="item.hasSeedMillionNumber")
          el-col(:span="mediaObject.colNotDivided")
            span(class="el-form-item__label") Норма млн/га
            el-slider(v-model="item.seedMillionNumber", :min="slider.min", :max="slider.max", :step="0.05", show-input, filterable, :style="mediaObject.sliderStyle")
      template(v-else)
        el-col(:span=2, v-if="item.hasSeedMillionNumber")
          el-form-item(label="Норма млн/га")
        el-col(:span=6, v-if="item.hasSeedMillionNumber")
          el-slider(v-model="item.seedMillionNumber", :min="slider.min", :max="slider.max", :step="0.05", show-input, filterable)
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(label="Репродукция", :style="mediaObject.reproductionLabelStyle")
          el-select(v-model="item.reproductionId", filterable, :style="mediaObject.reproductionStyle")
            el-option(
            v-for="c in reproductions",
            :label="c.name",
            :value="c.id",
            :key="c.id",
            )
      el-col(:span="mediaObject.colNotDivided")
        el-form-item(:style="mediaObject.reproductionLabelStyle", label=".", :class="{invisibleColor: true}")
          el-button(size="small",  type="primary  ", native-type="submit", @click.prevent="save") Добавить #[i.el-icon-check]

  h2(class="tableHeading") Расчет семян
    span(:style="{marginRight: '30px'}")
    el-button.filter(@click="filterUnfolded = true",) .
    el-button.printer(type="default", @click="downloadButton(3)", :loading="buttonLoadings.includes('print')") .
    template(v-if="filteredSeedlimits.length")
      el-button(type='default', @click="LZKDialogVisible = true") ЛЗК
      el-button(type='default', @click="downloadButton(2)", :loading="buttonLoadings.includes('invoice')") Накладная
  el-dialog(v-if="LZKDialogVisible", :visible.sync="LZKDialogVisible", title="Фильтр", size="tiny", :close-on-click-modal="false")
    div(:class="{downloadLzkStyle: true}")
      el-date-picker(v-model="download.selectedDate")
    div(:class="{downloadLzkStyle: true}")
      el-select(v-model="download.fieldId", filterable)
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
            v-for="item in fields",
            :label="item.displayString",
            :value="item.id",
            :key="item.id",
          )
      el-form-item
        el-button(@click="resetFilter") Сбросить
  .el-table-cont
    el-table(
      v-if="filteredSeedlimits.length || loading",
      :data="paginate(search(filteredSeedlimits))",
      resizable,
      border,
      v-loading="loading",
      element-loading-text="Загружается...",
      )
      el-table-column(
        prop="field.displayString",
        label="Поле"
      )
      el-table-column(
        prop="area",
        label="Площадь"
      )
      el-table-column(
        prop="culture.name",
        label="Культура"
      )
      el-table-column(
        prop="cultureSort.name",
        label="Сорт"
      )
      el-table-column(
        prop="reproduction.name",
        label="Репродукция"
      )
      el-table-column(
        prop="sowingNormative",
        label="Норма высева"
      )
      el-table-column(
      prop="seedMillionNumber",
      label="Норма млн/га"
      )
      el-table-column(
        prop="seedTotal",
        label="Итого"
      )

      el-table-column(
        fixed="right",
        label="",
        width="120"
      ): template(slot-scope="scope")
        el-button(@click="update(scope.row.id)", size="small", icon="edit", :disabled="loaders[scope.row.id]")
        el-button(@click="removeSeedlimit(scope.row.id)", size="small", icon="delete2", :loading="loaders[scope.row.id]")
    .no-results(v-else) Нет результатов
    el-pagination(
    layout="total, prev, pager, next",
    :total="filteredSeedlimits.length",
    :page-size="perPage",
    :current-page="currentPage",
    @current-change="onCurrentPageChange",
    @size-change="onPerPageChange"
    )
</template>

<script>
import http from 'lib/httpQueryV2'
import {createIndex} from 'lib/utils'
import ListController from 'mixins/ListController'
import {EventBus} from 'services/EventBus'
import moment from 'moment'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import update from './update.vue'

import modifiedByName from 'lib/modifiedByName'

export default {
  components: {
    update
  },
  mixins: [
    ListController,
    RecordsLoaderV2
  ],
  data() {
    return {
      perPage: 5,
      loaders: {},
      editMode: false,
      seedWeight: 0,
      currentPage: 1,
      windowWidth: 0,
      windowHeight: 0,
      selectedDate: Date.now(),
      seedFrequency: 0,
      cultureGroups: [],
      seedGermination: 0,
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
      editParams: {
        item: {},
        fields: [],
        cultures: [],
        filteredCultureSorts: [],
        reproductions: []
      },
      item: {
        area: 0,
        date: null,
        year: null,
        areaMax: 0,
        fieldId: null,
        cultureId: null,
        seedWeight: null,
        seedFrequency: null,
        fieldEditable: true,
        cultureSortId: null,
        reproductionId: null,
        seedMillionNumber: 0,
        seedGermination: null,
        hasSeedMillionNumber: false,
      },
      fieldsForDisplay: [],
      slider: {
        min: null,
        max: null,
      },
      download: {
        fieldId: null,
        selectedDate: Date.now()
      },
      buttonLoadings: [],
      loading: true,
      updatedEnd: false,
      _seedlimits: [],
      _fields: [],
      cultures: [],
      cultureSorts: [],
      reproductions: [],
      cultureFieldZones: [],
      seedlimits: [],
    }
  },
  computed: {
    _seedlimitsAreas() {
      let areas = {}
      this.seedlimits.map(s => {
        if (!areas[s.fieldId]) areas[s.fieldId] = 0;
        areas[s.fieldId] += s.area
      })
      return areas
    },
    fields() {
      return this._fields
        .map(f => {
          let area = this._seedlimitsAreas[f.id] || 0
          f.area -= area
          return f
        })
        .filter(f => f.area > 0)
    },
    paginatedFilteredSeedlimits() {
      return this.paginate(this.filteredSeedlimits);
    },
    filteredSeedlimits() {
      if (this.seedlimits.length) this.loading = true
      let seedlimits = this.seedlimits.filter(x => {
        let date = moment(x.date).format("YYYY") == this.$root.context.year
        let filterCulture = !this.filterModel.culturesIds.length || (this.filterModel.culturesIds && this.filterModel.culturesIds.indexOf(x.cultureId) > -1)
        let filterField = !this.filterModel.fieldsIds.length || (this.filterModel.culturesIds && this.filterModel.fieldsIds.indexOf(x.fieldId) > -1)
        if (date && filterCulture && filterField) return x
      })
      if (this.seedlimits.length) this.loading = false
      return seedlimits
    },
    filteredCultureSorts() {
      let sorts = this.cultureSorts.filter(x => x.cultureId === this.item.cultureId);
      let foundCultureSort = sorts.find(x => x.id === this.item.cultureSortId) ? this.item.cultureSortId : null;
      this.item.cultureSortId = foundCultureSort;
      this.item.reproductionId = foundCultureSort ? this.item.reproductionId : null;
      this.item.seedFrequency = foundCultureSort ? this.item.seedFrequency : null;
      this.item.seedGermination = foundCultureSort ? this.item.seedGermination : null;
      this.item.seedWeight = foundCultureSort ? this.item.seedWeight : null;
      return sorts;
    },
    mediaObject() {
      // at 1478 px form elements get bizarre
      if (this.windowWidth <= 1478) {
        return {
          colNotDivided: 7,
          labelPosition: 'top',
          fieldStyle: {
            width: '100%'
          },
          cultureLabelStyle: {
            marginLeft: '0px'
          },
          cultureSelectStyle: {
            marginLeft: '0px'
          },
          reverse: true,
          sliderStyle: 'width: 90%',
          seedFrequencyStyle: {
            width: '113%'
          },
          cultureSortStyle: {
            width: '100%'
          },
          seedGerminationStyle: {
            marginLeft: '0px',
            width: '113%'
          },
          reproductionStyle: {
            marginLeft: '0px',
            width: this.item.hasSeedMillionNumber ? '100%' : '100%'
          },
          reproductionLabelStyle: {
            marginLeft: this.item.hasSeedMillionNumber ? '0px' : '0px'
          },
          seedWeightLabelStyle: {
            marginLeft: '0px'
          },
          seedWeightStyle: {
            marginLeft: '0px',
            width: '113%'
          }
        };
      }
      // anything that is greater than 1478 px
      else {
        return {
          colNotDivided: 8,
          labelPosition: 'left',
          fieldStyle: {
            width: '100%'
          },
          cultureLabelStyle: {
            marginLeft: '15px'
          },
          cultureSelectStyle: {
            marginLeft: '27px'
          },
          reverse: false,
          sliderStyle: 'width: 100%',
          seedFrequencyStyle: {
            width: '113%'
          },
          cultureSortStyle: {
            width: '100%'
          },
          seedGerminationStyle: {
            marginLeft: '0px',
            width: '113%'
          },
          reproductionStyle: {
            marginLeft: this.item.hasSeedMillionNumber ? '27px' : '0px',
            width: '100%'
          },
          reproductionLabelStyle: {
            marginLeft: this.item.hasSeedMillionNumber ? '15px' : '0px'
          },
          seedWeightLabelStyle: {
            marginLeft: '15px'
          },
          seedWeightStyle: {
            marginLeft: '27px',
            width: '111%'
          }
        };
      }
    }
  },
  watch: {
    'item.fieldId' (val) {
      this.setAreaAndSliderMinMax();
    },
    'item.cultureId' (val) {
      if (val == 17) {
        this.item.cultureSortId = 41
        this.item.reproductionId = 9
        this.item.seedFrequency = 0
        this.item.seedGermination = 0
        this.item.seedWeight = 0
      }
      this.setSliderMinMax();
    },
    paginatedFilteredSeedlimits: function() {
      if (this.updatedEnd)
        modifiedByName.addTooltips( this.paginatedFilteredSeedlimits );
    }
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.getWindowWidth);
      window.addEventListener('resize', this.getWindowHeight);

      //Init
      this.getWindowWidth();
      this.getWindowHeight();
    });
  },
  created() {
    this.fetchEntities([
      'seedlimits',
      'fields',
      'cultures',
      'sorts',
      'reproductions',
      'culturefieldzones'
    ], this.afterFetch);
    EventBus.$on('SeedLimits.UpdateComponent.PutObjectCompleted', () => {
      this.refresh();
    });
    this.item.year = this.$root.context.year;
  },
  updated() {
    this.updatedEnd = true;
    modifiedByName.addTooltips( this.paginatedFilteredSeedlimits );
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth);
    window.removeEventListener('resize', this.getWindowHeight);
  },
  methods: {
    afterFetch() {
      this._seedlimits = this.fromVuex('seedlimits')
      this._fields = this.fromVuex('fields')
      this.cultures = this.fromVuex('cultures')
      this.cultureSorts = this.fromVuex('sorts')
      this.reproductions = this.fromVuex('reproductions')
      this.cultureFieldZones = this.fromVuex('culturefieldzones')
      this.setSeedlimits()
    },
    setSeedlimits() {
      const fields = createIndex(this._fields)
      const cultures = createIndex(this.cultures)
      const cultureSorts = createIndex(this.cultureSorts)
      const reproductions = createIndex(this.reproductions)
      this.seedlimits = this._seedlimits
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        .map(seedlimit => {
          this.$set(this.loaders, seedlimit.id, false)
          seedlimit.field = fields[seedlimit.fieldId]
          seedlimit.culture = cultures[seedlimit.cultureId]
          seedlimit.cultureSort = cultureSorts[seedlimit.cultureSortId]
          seedlimit.reproduction = reproductions[seedlimit.reproductionId]
          seedlimit.shortFieldCultureName = seedlimit.fieldNewName + ' ' + (seedlimit.culture && seedlimit.culture.shortName);
          return seedlimit
        });
    },
    update(id) {
      EventBus.$emit('SeedLimits.InitUpdate', id);
    },
    initFilter() {
      return {
        'culturesIds': [],
        'fieldsIds': [],
      }
    },
    getWindowWidth(event) {
      this.windowWidth = document.documentElement.clientWidth;
    },
    getWindowHeight(event) {
      this.windowHeight = document.documentElement.clientHeight;
    },
    setAreaAndSliderMinMax(edit = false) {
      this.setArea();
      this.setSliderMinMax();
    },
    setArea(edit = false) {
      let label = 'item';

      let val = this[label].fieldId;

      this[label].areaMax = 0;
      this[label].area = 0;

      let fieldAreaMax = this.fields.filter(f => f.id === val)[0] ? this.fields.filter(f => f.id === val)[0].area : 0;

      this[label].areaMax = fieldAreaMax;
      this[label].area = fieldAreaMax;
    },
    setSliderMinMax(edit = false) {
      let label = 'item';

      if (this[label].fieldId && this[label].cultureId) {
        let fieldId = this[label].fieldId;
        let cultureId = this[label].cultureId;
        let filteredFields = this.fields.filter(field => field.id === fieldId);
        let filteredCulture = this.cultureFieldZones.filter(culture => culture.cultureId === cultureId);
        let filtered = filteredCulture.filter((culture) =>
          true === filteredFields.map(field => field.fieldZoneId === culture.fieldZoneId)[0]
        );
        this.item.seedMillionNumber = 0;

        if (filtered.length) {
          this[label].hasSeedMillionNumber = true;
          this.slider.min = filtered[0].minNumber;
          this.slider.max = filtered[0].maxNumber;
        } else {
          this[label].hasSeedMillionNumber = false;
          this.slider.min = null;
          this.slider.max = null;
        }
      }
    },
    load() {
      this.fetchEntities([
        'seedlimits',
      ]);
    },
    refresh() {
      this.loading = true
      this.load();
    },
    removeSeedlimit(id) {
      this.$confirm('Действительно удалить задание?', 'Внимание', {
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
    save() {
      const organization = this.$root.context.organization;
      const path = 'seedlimits/' + organization;
      const dt = moment(this.selectedDate).format("MM.DD.YYYY")
      if (this.editMode) {
        this.editItem.date = dt;
        this.editItem.year = this.$root.context.year;
      } else {
        this.item.date = dt;
        this.item.year = this.$root.context.year;
      }

      let item = this[this.editMode ? 'editItem' : 'item'];

      this.savingProcess = true;

      http[this.editMode ? 'put' : 'post'](path, item).then(() => {
        this.refresh();
        this.makeFieldsNull(this.editMode);
        this.savingProcess = false;
      })
    },
    makeFieldsNull(edit = false) {
      if (!edit) {
        this.item.fieldId = null
        //        this.item.reproductionId = null
        //        this.item.seedWeight=null
        //        this.item.seedFrequency=null
        //        this.item.cultureId = null
        //        this.item.cultureSortId = null
        //        this.item.seedGermination=null
      } else {
        this.editItem.fieldId = null
        //        this.editItem.reproductionId = null
        this.editItem.seedWeight = null
        this.editItem.seedFrequency = null
        //        this.editItem.cultureId = null
        this.editItem.cultureSortId = null
        this.editItem.seedGermination = null
      }
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
          seedLimitIds: this.download.fieldId,
          date: moment(this.download.selectedDate).format("YYYY-MM-DDTHH:mm:ss")
        }
      } else {
        body = {
          organizationId: organization
        }
        landscape = true;
      }

      http.downloadPDF(path, body, filename, landscape)
    }

  }
}
</script>

<style>
.tableHeading {
  display: inline-block;
  margin-right: 20px;
}

.downloadLzkStyle {
  display: block;
  margin-top: 20px;
}

.downloadFieldSelect {
  width: 250px;
}
</style>
