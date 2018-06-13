<template lang="pug">
.field-container(v-loading="loading", element-loading-text="Загружается...")
  div
    h2(v-if="routePlan") План работ
    h2(v-else) История работ

    el-dialog(v-if='dialogvisibleAddCheckList', :visible.sync="dialogvisibleAddCheckList", title="Новый чек-лист")
      el-tabs(v-model="activeTab")
        el-tab-pane(label="Химия" name="chemical")
          createchemical(:assignmentId="selectedAssignmentId")
        el-tab-pane(label="Удобрения" name="fertilizer")
          createfertilizer(:assignmentId="selectedAssignmentId")
        el-tab-pane(label="Боронование" name="harrowing")
          createharrowing(:assignmentId="selectedAssignmentId")
        el-tab-pane(label="Уборка" name="harvest")
          createharvest(:assignmentId="selectedAssignmentId")
        el-tab-pane(label="Посев" name="sowing")
          createsowing(:assignmentId="selectedAssignmentId")

    el-dialog(:visible.sync="dialogView", title="Подробнее")
      viewchemical(:form="form")

    el-table(
      :data="paginate(filteredAssignments)",
      border,
      resizable,
    )
      el-table-column(label="Дата", prop="formatDate", header-align="center")
      el-table-column(label="Работа", prop="subOperationName", header-align="center")
      el-table-column(label="Машина", prop="carDisplayString", header-align="center")
      el-table-column(label="Орудие", prop="instrumentName", header-align="center")
      el-table-column(label="Ширина захвата", prop="instrumentWidth", header-align="center")
      el-table-column(label="Примечание", header-align="center")
        template(slot-scope="scope")
          .pw-extra(v-if="scope.row.isSowing")
            p Глубина: {{ scope.row.depth }}
            p Сорт: {{scope.row.sortAndNorm }}
          .pw-extra(v-if="scope.row.isMacrofertilizer || scope.row.isChemicalTreatment")
            el-tag( v-for="item in scope.row.chemistryChemicalTreatments", :key="item.id") {{ item.chemicalPreparationName }} ({{ item.factNormative }} )
          .pw-extra(v-if="scope.row.isHarvest")
            p Урожайность: {{ scope.row.specificYield }}

      el-table-column(v-if="routePlan", label="Добавить чек-лист", header-align="center", align="center", width="170")
        template(slot-scope="scope")
          el-button.btn-icon(@click="addCheckList(scope.row.id)", size="small", icon="plus")
      el-table-column(v-else, label="Подробнее", header-align="center", align="center", width="170")
        template(slot-scope="scope")
          el-button.btn-icon(v-if="false", @click="viewCheckList(scope.row.id)", size="small", icon="view")

    el-pagination(
      v-if="filteredAssignments",
      layout="total, prev, pager, next",
      :total="filteredAssignments.length",
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
  import moment from 'moment'
  import ListController from 'mixins/ListController'
  import createchemical from 'components/agromap/notepad/checklist/add/chemical'
  import createfertilizer from 'components/agromap/notepad/checklist/add/fertilizer'
  import createharrowing from 'components/agromap/notepad/checklist/add/harrowing'
  import createharvest from 'components/agromap/notepad/checklist/add/harvest'
  import createsowing from 'components/agromap/notepad/checklist/add/sowing'

  import viewchemical from 'components/agromap/notepad/checklist/view/chemical'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    components: {
      createchemical,
      createfertilizer,
      createharrowing,
      createharvest,
      createsowing,
      viewchemical
    },
    data() {
      return {
        form: {},
        selecetdAssignmentId: null,
        assignments: [],
        works: [],
        suboperations: [],
        seedlimits: [],
        chemistrylimitfact: [],
        perPage: 10,
        currentPage: 1,
        dialogView: false,
        dialogvisibleAddCheckList: false,
        activeTab: 'chemical',
        loading: true,
      }
    },
    computed: {
      routePlan(){
        let route = this.$route.path
        let out = route == '/agromap/field/plan-works' ? true : false
        return out
      },
      fieldId() {
        let fieldId = this.$root.context.field
        if (fieldId){
          return fieldId
        }
        return null
      },
      filteredAssignments() {
        let array = []
        let today = new Date
        if (this.assignments.length > 0){
          this.assignments.forEach(a => {
            a.compareDate = new Date(a.dateTimeRangeStart);
            let isDate = a.compareDate < today
            if (this.routePlan) {
              isDate = a.compareDate >= today
            }
            if (a.fieldId == this.fieldId && isDate){
              a.formatDate = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
              a.isSowing = false
              a.isMacrofertilizer = false
              a.isChemicalTreatment = false
              a.isHarvest = false
              //check these props below
              this.works.forEach(w => {
                if (w.id == a.subOperationId){
                  if (w.planWorkTypeIsSowing){
                    a.isSowing = true
                  }
                  if (w.isMacrofertilizer){

                  }
                  if (w.planWorkTypeIsChemicalTreatment){
                    a.isChemicalTreatment = true
                  }
                }
              })
              this.suboperations.forEach(s => {
                if (s.id == a.subOperationId){
                  if (s.conditionType == 2){
                    a.isHarvest = true
                  }
                }
              })
              //getting new props from seedlimits and chemistrylimitfact
              if (a.isSowing){
                let seedlimit = this.seedlimits.find(s => s.id === a.seedlimitId)
                if (seedlimit) {
                  a.sortAndNorm = `${seedlimit.cultureSortName}(${seedlimit.sowingNormative})`
                } else {
                  a.sortAndNorm = 'нет данных'
                }
              }
              if (a.isMacrofertilizer || a.isChemicalTreatment){
                let clf = this.chemistrylimitfact.find(c => c.assignmentId === a.id)
                if (clf) {
                  a.chemistryChemicalTreatments = clf.chemistryChemicalTreatments
                } else {
                  a.chemistryChemicalTreatments = []
                }
              }
              array.push(a)
            }
          })
        }
        return array
      },
    },
    created() {
      this.fields = this.$root.fields
      this.fetchEntities([
        'assignments',
        'works',
        'suboperations',
        'seedlimits',
        'chemistrylimitfact'
      ], this.afterFetch );
    },
    methods: {
      afterFetch() {
        this.assignments = this.fromVuex("assignments");
        this.works = this.fromVuex("works");
        this.suboperations = this.fromVuex("suboperations");
        this.seedlimits = this.fromVuex("seedlimits");
        this.chemistrylimitfact = this.fromVuex("chemistrylimitfact");
        this.loading = false
      },
      addCheckList(id) {
        this.selectedAssignmentId = id
        this.dialogvisibleAddCheckList = true
      },
      viewCheckList(id) {
        this.dialogView = true
      }
    }
  }

</script>

<style scoped>
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

<style lang="stylus" scoped>

.field-container span
  font-weight 100

#chart
  display block

.pw-extra
  p
    margin 5px 0px

</style>
