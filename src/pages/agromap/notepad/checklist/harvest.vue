<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  div
    h2 Данные чек-листов Уборка

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
      el-table-column(label="Контрольной обмолот(ц/га)", prop="grainMoisture", header-align="center")
      el-table-column(label="Влажность почвы", prop="headerLosses", header-align="center")
      el-table-column(label="Потери за жаткой/подборщиком", prop="thrashingLosses", header-align="center")
      el-table-column(label="Потери за молотилкой(за решетами)", prop="fieldForecastedBalances", header-align="center")
      el-table-column(label="Прогнозируемы остатки на поле", prop="grainCrushing", header-align="center")
      el-table-column(label="Дробление зерна(настройка барабана)", prop="grainCrushing", header-align="center")
      el-table-column(label="Измельчение соломы", prop="strawChopping", header-align="center")
      el-table-column(label="Равномерность распределения измельченной соломы", prop="strawChoppingDistributionUniformBool", header-align="center")

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
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"
import remove from "pages/agromap/notepad/checklist/remove.vue"
import update from "pages/agromap/notepad/checklist/update/harvest"
import checklistDataMixin from "pages/agromap/notepad/checklist/checklistDataMixin"

export default {
  mixins: [
    
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
    fetchEntities([
      "assignments",
      "harvestCheckList"
    ], this.afterFetch );
  },
  computed: {
    formatArray() {
      let array = []
      if (this.arrayCheckList.length > 0){
        this.arrayCheckList.forEach(item => {
          item.strawChoppingDistributionUniformBool = this.getNameFromBoolean(item.strawChoppingDistributionUniform)
          item.formatDate = moment(this.dateCreated).format("DD/MM/YYYY HH:mm:ss")
          array.push(item)
        })
      }
      return array
    },
  },
  methods: {
    afterFetch(){
      this.arrayCheckList = fromVuex("harvestCheckList")
      this.assignments = fromVuex("assignments")
      this.loading = false
    },
    refresh() {
      this.hideDialogs()
      fetchEntities([
        "harvestCheckList"
      ], this.afterFetch);
      this.loading = true
    },
    deleteCheckList(id){
      this.deletedId = id
      this.endpointForDelete = "harvestCheckList/"
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
