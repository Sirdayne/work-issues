<template lang="pug">
.cols(v-loading="isProcessing")
  el-dialog(
    title="Структура посева",
    v-model="showStructure"
  )
    table.infoTable
      tr(v-for="row in info")
        td {{row[0]}}
        td: el-tag.tag(type="gray", v-for="tag in row[1]", :key="tag") {{tag}}
        td {{row[3]}}
      tr
        td(colspan="3"): b Итого: {{totalArea | numberFormat}} га.
  .sidebar.sidebar-new
    el-form( class="el-form-edit", id="step2")
      el-form-item(label="Бюджет:   ")
        .radio-control(v-for="b in budgets"): el-radio(v-model="$root.context.budget", :label="b.id") {{b.name}}

    router-link.link(to="/agroplan/sowings"): el-button(id="step13") Список посевов
    el-form(label-position="top")
      el-tabs.tabs(active-name="first", type="border-card", id="step8")
        el-tab-pane(label="Культура", name="first")
          el-form-item.culture-control
            el-select(
              placeholder="Культура",
              v-model="firstCultureId",
              :loading="Object.keys(culturesSet).length === 0",
              id="step3"
            )
              el-option-group(
                v-if="culturesSet",
                v-for="cultures in Object.values(culturesSet)",
                :label="cultures[0].type.name",
                :key="cultures[0].type.name",
              )
                el-option(
                  v-for="culture in cultures",
                  :label="culture.name",
                  :value="culture.id",
                  :key="culture.id",
                )
          el-form-item.y(label="Урожайность", id="step4")
            el-input-number(v-model="firstProductivity")
          el-form-item(label="Сорт", v-if="firstCultureId", id="step5")
            el-select(
              v-model="firstSortId"
            )
              el-option(
                v-if="cultures && firstCultureId",
                v-for="sort in cultures[firstCultureId].sorts",
                :label="sort.name",
                :value="sort.id",
                :key="sort.id",
              )
          el-form-item(label="Сорт", v-else, id="step5")
            el-select(v-model="stub")
              el-option(v-for="s in stubs",
                :label="s.name",
                :value="s.id",
                :key="s.id",)
          el-form-item(label="Репродукция", id="step6")
            el-select(
              v-model="firstReproductionId",
              :loading="reproductions.length === 0"
            )
              el-option(
                v-for="reproduction in reproductions",
                :label="reproduction.name",
                :value="reproduction.id",
                :key="reproduction.id",
              )
          el-form-item(label="Конечный продукт", id="step7")
            el-select(
              v-model="firstProductId",
              :loading="cultureparameters.length === 0"
            )
              el-option(
                v-for="c in cultureparameters",
                :label="c.name",
                :value="c.id",
                :key="c.id",
              )

          el-form-item(
            label="Норма высева"
          )
            el-input-number(
              v-model="firstNormative"
            )
        el-tab-pane(label="Вторая культура", name="second")
          el-form-item.culture-control
            el-select(
              placeholder="Вторая культура",
              v-model="secondCultureId",
              :loading="Object.keys(culturesSet).length === 0",
              clearable
            )
              el-option-group(
                v-for="cultures in Object.values(culturesSet)",
                :label="cultures[0].type.name",
                :key="cultures[0].type.name",
              )
                el-option(
                  v-for="culture in cultures",
                  :label="culture.name",
                  :value="culture.id",
                  :key="culture.id",
                )
          el-form-item.y(label="Урожайность", v-if="secondCultureId")
            el-input-number(v-model="secondProductivity")
          template(v-if="secondCultureId")
            el-form-item(label="Сорт")
              el-select(
                v-model="secondSortId"
              )
                el-option(
                  v-if="cultures && secondCultureId",
                  v-for="sort in cultures[secondCultureId].sorts",
                  :label="sort.name",
                  :value="sort.id",
                  :key="sort.id",
                )
            el-form-item(label="Репродукция")
              el-select(
                v-model="secondReproductionId",
                :loading="reproductions.length === 0"
              )
                el-option(
                  v-for="reproduction in reproductions",
                  :label="reproduction.name",
                  :value="reproduction.id",
                  :key="reproduction.id",
                )
            el-form-item(label="Конечный продукт")
              el-select(
                v-model="secondProductId",
                :loading="cultureparameters.length === 0"
              )
                el-option(
                  v-for="c in cultureparameters",
                  :label="c.name",
                  :value="c.id",
                  :key="c.id",
                )
            el-form-item(
              label="Норма высева"
            )
              el-input-number(
                v-model="secondNormative"
              )
            el-form-item
              el-button(type="info", @click="secondCultureId = null") Удалить

      el-form-item(label="Площадь поля", id="step8-1")
        .edit-area(v-if="activeFieldId") {{fieldsAreaInitial[activeFieldId]}} га.
        .edit-area(v-else) Выберите поле
          i(class="el-icon-warning")
      el-form-item(label="Площадь посева", id="step8-2")
        el-slider(v-if="activeFieldId", v-model="fieldsArea[activeFieldId]", show-input, :max="fieldsAreaInitial[activeFieldId]", :min="Math.min(1,fieldsAreaInitial[activeFieldId])")
        .edit-area(v-else) Выберите поле
          i(class="el-icon-warning")

    el-button(@click="showStructure = true", v-if="info", id="step14") Структура посева
    el-button(type="success", @click="save", id="step12") Сохранить
  .workspace
    .panel-fields( :class="{ 'panel-fields-active' : showPanelBottom }")
      template(v-if="fields")
        el-form(:inline="true")
          el-form-item(id="step11")
            el-input(v-model="quickFilter")
          el-form-item(id="step10")
            el-select(v-model="brigadeId")
              el-option(
                label="Все бригады",
                :value="null"
              )
              el-option(
                v-for="brigade in brigades",
                :label="brigade.name",
                :value="brigade.id",
                :key="brigade.id",
              )
          el-form-item
            el-button(@click="startHelpSowings", class="btn-help") ?

        fields-controller(id="step9", v-model="checkedFields", :quickFilter="quickFilter", :brigadeId="brigadeId", @fieldClick="showFieldParams")
      .notify(v-else) Загрузка

    .panel-bottom(v-if="ready && showPanelBottom")
      el-button(@click="startHelpSowingsBottom", class="button-help") ?
      sevoborot(:fieldClickedId="fieldClickedId", :fieldClickedName="fieldClickedName", id="bot1")
      lastassignments(:fieldClickedId="fieldClickedId", id="bot2")

</template>

<script>
import fieldsModel          from '_models/Fields'
import sowingsModel         from '_models/Sowings'
import culturesModel        from '_models/Cultures'

import http from 'lib/httpQueryV2'
import datasets  from 'mixins/datasets'
import { createIndexes } from 'helpers'

import FieldsController from 'components/FieldsController'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'

import {EventBus} from 'services/EventBus'
import moment from 'moment'
import ListController from 'mixins/ListController'

import $ from 'jquery'

import introLib from 'lib/introLib'
import Steps from 'components/help/steps'

import sevoborot from "components/panelbottom/sevoborot"
import lastassignments from "components/panelbottom/lastassignments"

export default {
  mixins: [
    datasets,
    RecordsLoaderV2
  ],
  components: {
    FieldsController,
    sevoborot,
    lastassignments
  },
  data() {
    return {
      stub: null,
      stubs: [{
        name: "Выберите культуру",
        id: 0
      }],
      query: null,
      isProcessing: true,
      showStructure: false,
      showPanelBottom: false,

      cultures: {},
      culturesSet: {},
      reproductions: [],
      cultureparameters: [],
      fields: null,
      fieldsIndexed: {},
      brigades: [],
      sowings: null,
      checkedFields: [],
      fieldsAreaInitial: {},
      fieldsArea: {},
      activeFieldId: null,
      culturerotation: [],
      checkedCulture: null,
      seedlimits: [],

      quickFilter: '',
      brigadeId: null,

      firstCultureId: null,
      firstProductivity: 20,
      firstSortId: null,
      firstReproductionId: null,
      firstProductId: null,
      firstNormative: 0,

      secondCultureId: null,
      secondProductivity: null,
      secondSortId: null,
      secondReproductionId: null,
      secondProductId: null,
      secondNormative: null,

      totalArea: 0,
      budgets: null,
      fieldClickedId: null,
      fieldClickedName: null,
      perPage: 5,
      currentPage: 1,
      loading: true,
    }
  },
  watch: {
    firstCultureId(val) {
      this.checkedCulture = val
      this.checkCultureRotation(val)
    },
    secondCultureId(val) {
      this.checkedCulture = val
      this.checkCultureRotation(val)
      this.secondSortId = null
      if (val) {
        this.secondNormative = this.cultures[val].sowingNormative
      } else {
        this.setSecondtoDefault()
      }
    },
    fieldClickedId(val) {
      this.checkCultureRotation(this.checkedCulture)
    },
  },
  created() {
    EventBus.$on('fieldClicked', (field) => {
      this.fieldClickedId = field;
      this.showPanelBottom = true;
    });
    this.loadData()

    if (!/token=/.test(document.cookie) || /token=;/.test(document.cookie) || /token=$/.test(document.cookie)) {
      this.$router.replace('/login')
    } else {
      this.$root.isLogined = true
    }
    this.setSecondtoDefault()
    this.getEntity(culturesModel, (isFinished, records) => {
      this.cultures = createIndexes(records, 'id')
      this.culturesSet = createIndexes(records, 'type.id', true)
    }, true)
    this.getEntity(fieldsModel, (isFinished, records) => {
      this.fieldsIndexed = createIndexes(records, 'id')
      this.fields = records
    }, true)
  },
  computed: {
    previousYearCultures() {
      let array = []
      let previousYear = this.$root.context.year-1
      if (this.fieldClickedId){
        this.seedlimits.forEach(s => {
          if (s.year == previousYear && s.fieldId == this.fieldClickedId){
            array.push(s.cultureId)
          }
        })
      }
      return array
    },
    info() {
      let cultures = this.cultures
      let total = []
      let result =  this.sowings? Object.values(
        createIndexes(this.sowings.filter(s => s.year === this.context.year), 'cultureId', true)
      ).map(group => {
        let groupTotal = group.reduce((a, b) => a + b.area, 0)
        total.push(groupTotal)
        return [
        cultures[group[0].cultureId].name +
        ` (${groupTotal} га.)`,
        group.map(s => {return `${s.fieldShortName ? s.fieldShortName : s.fieldNewName ? s.fieldNewName : null} (${s.area})`}),
        group.reduce((a, b) => a + b.area, 0)
      ]}) : []
      this.totalArea = total.reduce((a, b) => a + b, 0)
      result.forEach((el,i) => {
        result[i].push(((el[2]*100)/this.totalArea).toFixed(2)+"%")
      })
      return result
    }
  },
  methods: {
    loadData(){
      this.fetchEntities([
        'budgets',
        'cultureparameters',
        'reproductions',
        'brigades',
        'culturerotation',
        'seedlimits',
        'sowings',
      ], this.afterFetch );
    },
    checkCultureRotation(cultureId){
      let cultureRotation = null
      cultureRotation = this.culturerotation.find(c => c.cultureId == cultureId)
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
        this.$message({message: `${error}`, type: "error", duration: 5000, showClose: false});
      }
    },
    afterFetch(){
      this.budgets = this.fromVuex('budgets');
      this.cultureparameters = this.fromVuex('cultureparameters');
      this.reproductions = this.fromVuex('reproductions');
      this.brigades = this.fromVuex('brigades');
      this.culturerotation = this.fromVuex('culturerotation')
      this.seedlimits = this.fromVuex('seedlimits')
      this.sowings = this.fromVuex('sowings')
      this.fields.forEach(field => {
        let sowingsSet = createIndexes(this.sowings.filter(sowing => sowing.year === this.context.year), 'fieldId', true)
        let area = field.area - (sowingsSet[field.id]? sowingsSet[field.id].reduce((a,b)=>a + b.area,0) : 0)
        this.fieldsAreaInitial[field.id] = area
        this.$set(this.fieldsArea, field.id, area)
      })
      this.isProcessing = false
    },
    save() {
      this.isProcessing = true
      let query = this.checkedFields.map(fieldId => {
        return {
          fieldId:                      fieldId,
          year:                         this.context.year,
          area:                         this.fieldsArea[fieldId],
          cultureId:                    this.firstCultureId,
          secondCultureId:              this.secondCultureId,
          yield:                        this.firstProductivity,
          secondYield:                  this.secondProductivity,
          cultureParameterId:           this.firstProductId,
          secondCultureParameterId:     this.secondProductId,
          sowingNormative:              this.firstNormative,
          secondCultureSowingNormative: this.secondNormative,
          cultureSortId:                this.firstSortId,
          secondCultureSortId:          this.secondSortId,
          reproductionId:               this.firstReproductionId,
          secondCultureReproductionId:  this.secondReproductionId
        }
      })
      http.post('sowings/many/'+this.context.organization+'/'+this.context.budget, query).then(() => {
        this.setSecondtoDefault()
        this.setFirsttoDefault()
        EventBus.$emit('SowingAdded');
        this.loadData();
        //location.reload()
      })
    },
    setSecondtoDefault() {
      this.secondCultureId = null
      this.secondProductivity = 20
      this.secondSortId = null
      this.secondReproductionId = null
      this.secondProductId = null
      this.secondNormative = 0
    },
    setFirsttoDefault() {
      this.firstCultureId = null
      this.firstProductivity = 20
      this.firstSortId = null
      this.firstReproductionId = null
      this.firstProductId = null
      this.firstNormative = 0
    },
    showFieldParams(field) {
      this.activeFieldId = field.id
    },
    startHelpSowings() {
      if(Steps.sowings)
        introLib.begin(Steps.sowings);
    },
    startHelpSowingsBottom() {
      if(Steps.sowingsBottom)
        introLib.begin(Steps.sowingsBottom);
    }
  },
  filters: {
    numberFormat: function(val) {
      return val.toLocaleString('ru-RU')
    }
  }
}
</script>

<style lang="stylus" scoped>
.sidebar
  padding 0 15px 15px 15px
  background #eff2f7
  box-sizing border-box

.tabs
  width 100%
  margin 10px 0 10px
.infoTable
  border solid 1px
  >>> td
    padding 10px
    border solid 1px
  >>> .tag
    margin 5px

.el-form-edit
  margin-top 10px
  >>> .el-radio
        margin 5px 0 3px
  >>> .el-form-item
        margin-bottom 5px
  >>> .el-form-item__label
        padding 8px 0 4px
  >>> .el-radio__label
        font-size 12px
  >>> .el-radio__inner
        width 14px
        height 14px
  >>> .el-form-item__content
        line-height 20px
        font-size 13px

.el-radio
  width 100%

</style>
<style scoped>
.el-select >>> .el-input >>> .el-input__icon {
  display: none !important;
}
.culture-control >>> .y >>> .el-form-item__content {
  float: right;
}
.workspace{
  padding: 0;
  position: relative;
}
.panel-fields{
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  padding: 15px;
  overflow: auto;
}
.panel-fields-active{
  height: calc(100vh - 280px);
}
.sidebar-new>>>button{
  font-size: 12px;
  padding: 8px;
}
.sidebar-new>>>.el-tabs__item{
  font-size: 12px;
  height: 30px;
  line-height: 30px;
}
.sidebar-new>>>.el-input{
  font-size: 12px;
}
.sidebar-new>>>.el-form-item{
  margin-bottom: 10px;
}
.sidebar-new>>>.el-form-item__label{
  font-size: 12px;
  padding: 0 0 5px;
}
.el-select-dropdown__item{
  font-size: 12px;
  padding: 5px 5px 5px 15px;
  height: 30px;
  line-height: 20px;
}
.edit-area{
  font-size: 12px;
  line-height: 28px;
  color: #48576a;
}
.edit-area i{
  margin-left: 5px;
  color: #48576a;
}
</style>
