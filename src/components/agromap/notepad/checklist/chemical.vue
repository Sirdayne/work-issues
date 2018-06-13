<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  div
    h2 Данные чек-листов Химия

    el-dialog(v-if="dialogvisibleEdit", :visible.sync="dialogvisibleEdit", title="Редактирование чек-листа")
      update(
        :form="selectedItem"
      )

    el-dialog(v-if="dialogvisibleDelete", :visible.sync="dialogvisibleDelete", title="Удаление чек-листа")
      remove(
        :id="deletedId", :endpoint="endpointForDelete"
      )

    el-table(
      :data="paginate(formatArray)",
      border,
      resizable,
      v-loading="loading",
      element-loading-text="Загружается..."
    )
      el-table-column(label="Дата", prop="formatDate", width="200", header-align="center")
      el-table-column(label="Чистота и промывка бака, предбака, форсунки, фильтров", prop="isCleaningDoneBool", width="200", header-align="center")
      el-table-column(label="Высота штанги(см)", prop="boomHeight", header-align="center")
      el-table-column(label="Равномерность покрытия капель", prop="isDropletsCoatingUniformBool", header-align="center")
      el-table-column(label="Давление", prop="pressure", header-align="center")
      el-table-column(label="Скорость ветра(км/ч)", prop="windSpeed", header-align="center")
      el-table-column(label="Направление ветра", prop="windDirectionName", header-align="center")
      el-table-column(label="Наличие росы", prop="dewyBool", header-align="center")
      el-table-column(label="PH воды", prop="waterPH", header-align="center")
      el-table-column(label="Время наполнения стакана 2 л", prop="glassFillingTime", header-align="center")
      el-table-column(label="Отсутствие использованной тары на земле", prop="usedPackagingAbsence", header-align="center")
      el-table-column(label="Прямолинейность рядков", prop="rowsStraightBool", header-align="center")
      el-table-column(label="Пропуски", prop="omissionsBool", header-align="center")

      el-table-column(
        label="Операции",
        header-align="center",
        align="center",
        width="170"
      )
        template(slot-scope="scope")
          el-button.btn-icon(@click="editCheckList(scope.row.id)", size="small", icon="edit")
          el-button.btn-icon(@click="deleteCheckList(scope.row.id)", size="small", icon="delete2")

    el-pagination(
      v-if="formatArray",
      layout="total, prev, pager, next",
      :total="formatArray.length",
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
  import remove from 'components/agromap/notepad/checklist/remove.vue'
  import update from 'components/agromap/notepad/checklist/update/chemical'
  import checklistDataMixin from 'components/agromap/notepad/checklist/checklistDataMixin'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController,
      checklistDataMixin
    ],
    components: {
      update,
      remove
    },
    data() {
      return {
        arrayCheckList: [],
        assignments: [],
        windDirection: [],
        usedPackagingAbsence: [],
        nozzleColor: [],
        selectedItem: {},
        deletedId: [],
        searchForm: null,
        searchFormMin: 1,
        searchFormMax: 20,
        perPage: 10,
        currentPage: 1,
        dialogvisibleEdit: false,
        dialogvisibleDelete: false,
        endpointForDelete: null,
        loading: true
      }
    },
    created() {
      this.fetchEntities([
        'assignments',
        'windDirection',
        'usedPackagingAbsence',
        'nozzleColor',
        'chemicalCheckList',
      ], this.afterFetch );
    },
    computed: {
      formatArray() {
        let array = []
        if (this.arrayCheckList.length > 0){
          this.arrayCheckList.forEach(item => {
            item.isCleaningDoneBool = this.getNameFromBoolean(item.isCleaningDone)
            item.isDropletsCoatingUniformBool = this.getNameFromBoolean(item.isDropletsCoatingUniform)
            item.dewyBool = this.getNameFromBoolean(item.dewy)
            item.rowsStraightBool = this.getNameFromBoolean(item.rowsStraight)
            item.omissionsBool = this.getNameFromBoolean(item.omissions)
            item.formatDate = moment(this.dateCreated).format('DD/MM/YYYY HH:mm:ss')
            item.windDirectionName = this.getNameFromId(item.windDirection, this.windDirection)
            array.push(item)
          })
        }
        return array
      },
    },
    methods: {
      afterFetch(){
        this.arrayCheckList = this.fromVuex('chemicalCheckList')
        this.assignments = this.fromVuex('assignments')
        this.windDirection = this.fromVuex('windDirection')
        this.usedPackagingAbsence = this.fromVuex('usedPackagingAbsence')
        this.nozzleColor = this.fromVuex('nozzleColor')
        this.loading = false
      },
      refresh() {
        this.hideDialogs()
        this.fetchEntities([
          'chemicalCheckList'
        ], this.afterFetch);
        this.loading = true
      },
      deleteCheckList(id){
        this.deletedId = id
        this.endpointForDelete = 'chemicalCheckList/'
        this.dialogvisibleDelete = true
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
  .loupe div{
    font-size: 14px;
    margin-bottom: 5px;
  }
</style>
