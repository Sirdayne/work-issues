<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  div
    h2 Анкетные данные

    el-dialog(:visible.sync="dialogvisibleEdit", title="Редактирование анкеты")
      updatevpr(
        v-if="selectedWorkSeasonId == 1",
        :form="selectedFieldSurvey"
      )
      updatesev(
        v-if="selectedWorkSeasonId == 2",
        :form="selectedFieldSurvey"
      )
      updateuhod(
        v-if="selectedWorkSeasonId == 3",
        :form="selectedFieldSurvey"
      )
      updateuborka(
        v-if="selectedWorkSeasonId == 4",
        :form="selectedFieldSurvey"
      )
      updatepar(
        v-if="selectedWorkSeasonId == 5",
        :form="selectedFieldSurvey"
      )

    el-dialog(:visible.sync="dialogvisibleView", title="Подробнее")
      .view(v-if="selectedWorkSeasonId == 1")
        p Глубина промачивания (см): {{ viewAnketa.soakingDepth }}
      .view(v-if="selectedWorkSeasonId == 2")
        p Прямолинейность рядков: {{ viewAnketa.rowsStraightBool }}
        p Пропуски: {{ viewAnketa.omissionsBool }}
      .view(v-if="selectedWorkSeasonId == 3")
        p Количество растений в 1 кв.м.(шт.): {{ viewAnketa.plantCount }}
        p Количество продуктивных плодов в 1 кв.м.(шт.): {{ viewAnketa.plantFruitCount }}
        p Билогическая эффективность препарата: {{ viewAnketa.isPreparationEffectivelyBool }}
        p Билогическая эффективность препарата %: {{ viewAnketa.preparationEffectivenessPercent }}
      .view(v-if="selectedWorkSeasonId == 4")
        p Количество растений в 1 кв.м.(шт.): {{ viewAnketa.plantCount }}
        p Количество продуктивных плодов в 1 кв.м.(шт.): {{ viewAnketa.plantFruitCount }}
        p Масса зерна 30 колосков (гр): {{ viewAnketa.grainWeight }}
        p Влажность зерна (%): {{ viewAnketa.grainMoisture }}
        p Билогическая урожайность(по формуле): {{ viewAnketa.biologicalYield }}
      .view(v-if="viewAnketa.fieldsThreat")
        h4 Угрозы:
        .view(v-if="viewAnketa.fieldsThreat.insectThreat") Насекомые:
          p Вид: {{ viewAnketa.insectName }}
          p Уровень угрозы: {{ viewAnketa.insectLevel }}
        .view(v-if="viewAnketa.fieldsThreat.diseaseThreat") Болезни:
          p Вид: {{ viewAnketa.diseaseName }}
          p Уровень угрозы: {{ viewAnketa.diseaseLevel }}
        .view(v-if="viewAnketa.fieldsThreat.weedThreat") Сорняки:
          p Вид: {{ viewAnketa.weedName }}
          p Фаза роста: {{ viewAnketa.growingPhasesName }}
          p Кол-во: {{ viewAnketa.fieldsThreat.weedThreat.amount }}

    el-dialog(v-if="dialogvisibleDelete", :visible.sync="dialogvisibleDelete", title="Удаление анкеты")
      remove(
        :id="deletedId"
      )

    el-table(
      :data="paginate(formatSurveys)",
      border,
      resizable,
      v-loading="loading",
      element-loading-text="Загружается..."
    )
      el-table-column(label="Дата", prop="formatDate", width="200", header-align="center")
      el-table-column(label="Название анкеты", prop="workSeasonName", header-align="center")
      el-table-column(label="Температура воздуха(C)", prop="airTemp", header-align="center")
      el-table-column(label="Температура почвы(C)", prop="soilTemp", header-align="center")
      el-table-column(label="Влажность почвы(%)", prop="soilMoisture", header-align="center")
      el-table-column(label="Направление ветра", prop="windDirectionName", header-align="center")
      el-table-column(label="Скорость ветра(км/ч)", prop="windSpeed", header-align="center")
      el-table-column(label="Кол-во осадков(мм)", prop="precipitationCount", header-align="center")

      el-table-column(
        label="Операции",
        header-align="center",
        align="center",
        width="170"
      )
        template(slot-scope="scope")
          el-button.btn-icon(@click="loupeViewAnketa(scope.row.id, scope.row.workSeason)", size="small", icon="view")
          el-button.btn-icon(@click="editAnketa(scope.row.id, scope.row.workSeason)", size="small", icon="edit")
          el-button.btn-icon(@click="deleteAnketa(scope.row.id)", size="small", icon="delete2")

    el-pagination(
      v-if="formatSurveys",
      layout="total, prev, pager, next",
      :total="formatSurveys.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'
  import updatepar from 'components/agromap/notepad/anketa/update/par.vue'
  import updatesev from 'components/agromap/notepad/anketa/update/sev.vue'
  import updateuhod from 'components/agromap/notepad/anketa/update/uhod.vue'
  import updateuborka from 'components/agromap/notepad/anketa/update/uborka.vue'
  import updatevpr from 'components/agromap/notepad/anketa/update/vpr.vue'
  import remove from 'components/agromap/notepad/anketa/remove.vue'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    components: {
      updatepar,
      updatesev,
      updateuhod,
      updateuborka,
      updatevpr,
      remove
    },
    data() {
      return {
        selectedFieldSurvey: {},
        selectedWorkSeasonId: null,
        deletedId: [],
        searchForm: null,
        searchFormMin: 1,
        searchFormMax: 20,
        workSeason: [],
        windDirection: [],
        fieldSurveys: [],
        viewAnketa: {},
        threatLevel: [],
        insects: [],
        diseases: [],
        weedTypes: [],
        weedsGrowingPhases: [],
        perPage: 10,
        currentPage: 1,
        dialogvisibleView: false,
        dialogvisibleEdit: false,
        dialogvisibleDelete: false,
        loading: true
      }
    },
    created() {
      EventBus.$on('anketaChanged', () => {
        this.refresh()
      });
      EventBus.$on('anketaDialogsClose', () => {
        this.hideDialogs()
      });
      this.fetchEntities([
        'workSeason',
        'windDirection',
        'fieldSurveys',
        'threatLevel',
        'insects',
        'diseases',
        'weedTypes',
        'weedsGrowingPhases',
      ], this.afterFetch );
    },
    computed: {
      formatSurveys() {
        let array = []
        if (this.fieldSurveys.length > 0){
          this.fieldSurveys.forEach(survey => {
            survey.workSeasonName = this.getNameFromId(survey.workSeason, this.workSeason)
            survey.formatDate = moment(this.dateCreated).format('DD/MM/YYYY HH:mm:ss')
            survey.windDirectionName = this.getNameFromId(survey.windDirection, this.windDirection)
            array.push(survey)
          })
        }
        return array
      },
    },
    methods: {
      afterFetch(){
        this.workSeason = this.fromVuex('workSeason')
        this.windDirection = this.fromVuex('windDirection')
        this.fieldSurveys = this.fromVuex('fieldSurveys')
        this.threatLevel = this.fromVuex('threatLevel')
        this.insects  = this.fromVuex('insects')
        this.diseases  = this.fromVuex('diseases')
        this.weedTypes  = this.fromVuex('weedTypes')
        this.weedsGrowingPhases  = this.fromVuex('weedsGrowingPhases')
        this.loading = false
      },
      refresh() {
        this.hideDialogs()
        this.fetchEntities([
          'fieldSurveys',
        ], this.afterFetch);
        this.loading = true
      },
      loupeViewAnketa(id, workSeasonId){
        this.viewAnketa = {}
        let fieldSurvey = this.fieldSurveys.find(f => f.id == id)
        this.selectedWorkSeasonId = workSeasonId
        if (fieldSurvey) {
          this.viewAnketa = fieldSurvey
          this.viewAnketa.rowsStraightBool = this.getNameFromBoolean(this.viewAnketa.rowsStraight)
          this.viewAnketa.omissionsBool = this.getNameFromBoolean(this.viewAnketa.omissions)
          this.viewAnketa.isPreparationEffectivelyBool = this.getNameFromBoolean(this.viewAnketa.isPreparationEffectively)
          //threats
          if (this.viewAnketa.fieldsThreat.insectThreat){
            this.viewAnketa.insectName = this.getNameFromId(this.viewAnketa.fieldsThreat.insectThreat.insectId, this.insects)
            this.viewAnketa.insectLevel = this.getNameFromId(this.viewAnketa.fieldsThreat.insectThreat.threatLevel, this.threatLevel)
          }
          if (this.viewAnketa.fieldsThreat.diseaseThreat){
            this.viewAnketa.diseaseName = this.getNameFromId(this.viewAnketa.fieldsThreat.diseaseThreat.diseaseId, this.diseases)
            this.viewAnketa.diseaseLevel = this.getNameFromId(this.viewAnketa.fieldsThreat.diseaseThreat.threatLevel, this.threatLevel)
          }
          if (this.viewAnketa.fieldsThreat.weedThreat){
            this.viewAnketa.weedName = this.getNameFromId(this.viewAnketa.fieldsThreat.weedThreat.weedTypeId, this.weedTypes)
            this.viewAnketa.growingPhasesName = this.getNameFromId(this.viewAnketa.fieldsThreat.weedThreat.weedsGrowingPhases, this.weedsGrowingPhases)
          }
          this.dialogvisibleView = true
        }
      },
      editAnketa(id, workSeasonId){
        this.selectedFieldSurvey = {}
        let fieldSurvey = this.fieldSurveys.find(f => f.id == id)
        this.selectedWorkSeasonId = workSeasonId
        if (fieldSurvey) {
          this.selectedFieldSurvey = fieldSurvey
          this.dialogvisibleEdit = true
        }
      },
      deleteAnketa(id){
        this.deletedId = id
        this.dialogvisibleDelete = true
      },
      hideDialogs() {
        this.dialogvisibleEdit = false
        this.dialogvisibleDelete = false
      },
      getNameFromId(id, array){
        if (Array.isArray(array)){
          if (array.length > 0){
            let out =  array.find(x => x.id === id)
            if (out){
              return out.name
            }
          }
        }
        return 'нет данных'
      },
      getNameFromBoolean(bool){
        let out = 'нет'
        if (bool){
          out = 'да'
        }
        return out
      },
    }
  }

</script>

<style>
  .head-notes{
    margin-top: 10px;
  }
  .head-notes h2{
    margin: 0;
    font-size: 24px;
  }
  .tf-search, .tf-search input{
    width: 350px;
  }
  .btn-icon+.btn-icon, .btn-icon{
    margin-left: 0;
    padding: 4px 6px;
  }
  .view{
    margin: 5px 0;
  }
  .view h4{
    margin: 15px 0 5px;
  }
  .view p{
    margin: 5px 0;
  }
</style>
