<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  div
    el-form(
      :inline="true",
      label-position="left",
      class="head-notes"
    )
      el-form-item
        h2 Журнал событий

    el-table(
      :data="paginate(eventlogs)",
      border,
      resizable,
      v-loading="loading",
      element-loading-text="Загружается...",
    )
      el-table-column(label="Дата", width="200" prop="formatDate", header-align="center")
      el-table-column(label="Событие", header-align="center")
        template(slot-scope="scope")
          div(v-if="scope.row.noteId") создал заметку
          div(v-else-if="scope.row.fieldSurveyId") создал анкету
          div(v-else="scope.row.checkListId") создал чек-лист

      el-table-column(label="Автор", width="250", prop="authorFullName", header-align="center")

      el-table-column(
        label="Операции",
        header-align="center",
        align="center",
        width="170"
      )
        template(slot-scope="scope")
          el-button.btn-icon(@click="edit(scope.row.id)", size="small", icon="edit")
          el-button.btn-icon(v-if="false", @click="eventView(scope.row.id)", size="small", icon="view")

    el-pagination(
      v-if="formatEventLogs",
      layout="total, prev, pager, next",
      :total="formatEventLogs.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )

    el-dialog(:visible.sync="dialogViewNote", title="Подробнее")
      viewnote(:form="form")

    el-dialog(:visible.sync="dialogNote", title="Редактирование заметки")
      updatenote(:form="form")

    el-dialog(:visible.sync="dialogPar", title="Редактирование анкеты Пар")
      updatepar(:form="form")
    el-dialog(:visible.sync="dialogSev", title="Редактирование анкеты Сев")
      updatesev(:form="form")
    el-dialog(:visible.sync="dialogUborka", title="Редактирование анкеты Уборка")
      updateuborka(:form="form")
    el-dialog(:visible.sync="dialogUhod", title="Редактирование анкеты Уход")
      updateuhod(:form="form")
    el-dialog(:visible.sync="dialogVpr", title="Редактирование анкеты ВПР")
      updatevpr(:form="form")

    el-dialog(:visible.sync="dialogChemical", title="Редактирование чек-листа Химия")
      updatechemical(:form="form")
    el-dialog(:visible.sync="dialogFertilizer", title="Редактирование чек-листа Удобрения")
      updatefertilizer(:form="form")
    el-dialog(:visible.sync="dialogHarrowing", title="Редактирование чек-листа Боронование")
      updateharrowing(:form="form")
    el-dialog(:visible.sync="dialogHarvest", title="Редактирование чек-листа Уборка")
      updateharvest(:form="form")
    el-dialog(:visible.sync="dialogSowing", title="Редактирование чек-листа Посев")
      updatesowing(:form="form")

</template>

<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"

import updatenote from "pages/agromap/notepad/notes/update"

import updatepar from "pages/agromap/notepad/anketa/update/par"
import updatesev from "pages/agromap/notepad/anketa/update/sev"
import updateuborka from "pages/agromap/notepad/anketa/update/uborka"
import updateuhod from "pages/agromap/notepad/anketa/update/uhod"
import updatevpr from "pages/agromap/notepad/anketa/update/vpr"

import updatechemical from "pages/agromap/notepad/checklist/update/chemical"
import updatefertilizer from "pages/agromap/notepad/checklist/update/fertilizer"
import updateharrowing from "pages/agromap/notepad/checklist/update/harrowing"
import updateharvest from "pages/agromap/notepad/checklist/update/harvest"
import updatesowing from "pages/agromap/notepad/checklist/update/sowing"

import viewnote from "pages/agromap/notepad/notes/view"

export default {
  mixins: [
    
    ListController
  ],
  components: {
    updatenote,
    updatepar,
    updatesev,
    updateuborka,
    updateuhod,
    updatevpr,
    updatechemical,
    updatefertilizer,
    updateharrowing,
    updateharvest,
    updatesowing,
    viewnote,
  },
  data() {
    return {
      form: null,
      searchForm: null,
      searchFormMin: 1,
      searchFormMax: 20,
      eventlogs: [],
      notes: [],
      fieldSurveys: [],
      chemicalCheckList: [],
      harrowingCheckList: [],
      fertilizerCheckList: [],
      sowingCheckList: [],
      harvestCheckList: [],
      perPage: 10,
      currentPage: 1,
      loading: true,
      dialogNote: false,
      dialogPar: false,
      dialogSev: false,
      dialogUborka: false,
      dialogUhod: false,
      dialogVpr: false,
      dialogChemical: false,
      dialogFertilizer: false,
      dialogHarrowing: false,
      dialogHarvest: false,
      dialogSowing: false,
      dialogViewNote: false,
    }
  },
  created() {
    fetchEntities([
      "eventlogs",
      "notes",
      "fieldSurveys",
      "chemicalCheckList",
      "harrowingCheckList",
      "fertilizerCheckList",
      "sowingCheckList",
      "harvestCheckList",
    ], this.afterFetch );
  },
  computed: {
    formatEventLogs() {
      let array = []
      if (this.eventlogs.length > 0){
        this.eventlogs.forEach(e => {
          e.formatDate = moment(e.date).format("HH:mm:ss DD/MM/YYYY")
          array.push(e)
        })
      }
      return array
    }
  },
  methods: {
    afterFetch(){
      this.eventlogs = fromVuex("eventlogs")
      this.notes = fromVuex("notes")
      this.fieldSurveys = fromVuex("fieldSurveys")
      this.chemicalCheckList = fromVuex("chemicalCheckList")
      this.harrowingCheckList = fromVuex("harrowingCheckList")
      this.fertilizerCheckList = fromVuex("fertilizerCheckList")
      this.sowingCheckList = fromVuex("sowingCheckList")
      this.harvestCheckList = fromVuex("harvestCheckList")
      this.loading = false
    },
    edit(eventId) {
      let found = this.eventlogs.find(e => e.id == eventId)
      if (found){
        if (found.noteId){
          this.form = this.notes.find(n => n.id == found.noteId)
          this.dialogNote = true
        } else if (found.fieldSurveyId) {
          this.form = this.fieldSurveys.find(n => n.id == found.fieldSurveyId)
          if (this.form.workSeason == 1) {
            this.dialogVpr = true
          }
          if (this.form.workSeason == 2) {
            this.dialogSev = true
          }
          if (this.form.workSeason == 3) {
            this.dialogUhod = true
          }
          if (this.form.workSeason == 4) {
            this.dialogUborka = true
          }
          if (this.form.workSeason == 5) {
            this.dialogPar = true
          }
        } else if (found.checkListId) {
          if (found.checkListType == 1) {
            this.form = this.chemicalCheckList.find(item => item.id == found.checkListId)
            this.dialogChemical = true
          }
          if (found.checkListType == 2) {
            this.form = this.fertilizerCheckList.find(item => item.id == found.checkListId)
            this.dialogFertilizer = true
          }
          if (found.checkListType == 3) {
            this.form = this.sowingCheckList.find(item => item.id == found.checkListId)
            this.dialogSowing = true
          }
          if (found.checkListType == 4) {
            this.form = this.harvestCheckList.find(item => item.id == found.checkListId)
            this.dialogHarvest = true
          }
          if (found.checkListType == 5) {
            this.form = this.harrowingCheckList.find(item => item.id == found.checkListId)
            this.dialogHarrowing = true
          }
        }
      }
    },
    eventView(eventId) {
      let found = this.eventlogs.find(e => e.id == eventId)
      if (found){
        if (found.noteId){
          this.form = this.notes.find(n => n.id == found.noteId)
          this.dialogViewNote = true
        }

      }
    }
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

  .btn-icon+.btn-icon, .btn-icon{
    margin-left: 0;
    padding: 4px 6px;
  }

  .loupe div{
    font-size: 14px;
    margin-bottom: 5px;
  }

</style>
