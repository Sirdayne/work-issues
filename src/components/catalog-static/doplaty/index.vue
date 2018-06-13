<template lang="pug">
.catalog-static-container(v-loading="loading", element-loading-text="Загружается...")
  el-form(:inline="true", class="top-form")
    el-form-item
      el-button(@click="newAdditionals") Новая запись
    el-form-item(class="tf-search")
      el-input(
        placeholder="Поиск...",
        icon="search",
        v-model="searchForm",
        :minlength="searchFormMin",
        :maxlength="searchFormMax",
      )
    el-button.filter(
      @click="filterUnfolded = true",
      type="default",
      class="tf-filter"
    ) .
    el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
      el-form(:model="filterModel", label-width="70px", label-position="left")
        el-form-item(label="Работа")
          el-select(v-model="filterModel.filterWork", clearable, filterable)
            el-option(
            v-for="item in works",
            :label="item.name",
            :value="item.id",
            :key="item.id",
            )
        el-form-item(label="Вид")
          el-select(v-model="filterModel.filterWorkCondition", clearable, filterable)
            el-option(
            v-for="item in workconditions",
            :label="item.name",
            :value="item.id",
            :key="item.id",
            )
        el-form-item
          el-button(@click="resetFilter") Сбросить
    el-form-item(:class="{invisibleColor: true}", class="tf-xls")
      el-button.excel(type='default', @click="exportTable('form')") .

  el-dialog(v-if="dialogvisibleCreateMany", :visible.sync="dialogvisibleCreateMany", title="Выберите работу и размер в % от основной заработной платы", :close-on-click-modal="false", class="fd-form")
    el-form(:inline="true", label-position="top")
      el-form-item(class="fd-full")
        el-select(v-model="form.workTypeParameterPlanWorkTypeId", clearable, filterable)
          el-option(
              v-for="f in notCreatedWorks",
              :key="f.id",
              :label="f.name",
              :value="f.id"
            )
      el-form-item(v-for="w in workconditions", :label="w.name", :key="w.id")
        el-input(v-model="w.additional")
    el-button(type="primary", @click="formPostMany") Создать

  el-dialog(v-if="dialogvisibleCreate", :visible.sync="dialogvisibleCreate", title="Создать доплату", size="tiny", :close-on-click-modal="false")
    el-form
      el-form-item
        el-input-number(v-model="form.additional", :min="0")
      el-form-item
        el-button(type="primary", @click="formPost") Создать

  el-dialog(v-if="dialogvisibleEdit", :visible.sync="dialogvisibleEdit", title="Редактировать доплату", size="tiny", :close-on-click-modal="false")
    el-form
      el-form-item
        el-input-number(v-model="form.additional", :min="0")
      el-form-item
        el-button(type="primary", @click="formPut") Сохранить

  .fx-table
    .fx-row.fx-light-grey
      .fx-cell(style="font-weight: bold;") Работа
      .fx-cell(v-for="w in filteredWorkConditions", style="font-weight: bold;") {{ w.name }}
    .fx-row(v-for="f in paginate(filteredWorks)")
      .fx-cell {{ f.name }}
      .fx-cell(v-for="w in filteredWorkConditions")
        p {{ getAdditional( f.id, w.id ) }}
        .fx-cell-edit(@click="editAdditional(f.id, w.id)")
          i.el-icon-edit
    el-pagination(
        v-if="filteredWorks",
        layout="total, prev, pager, next",
        :total="filteredWorks.length",
        :page-size="perPage",
        :current-page="currentPage",
        @current-change="onCurrentPageChange",
        @size-change="onPerPageChange"
      )

</template>

<script>
  import http from 'lib/httpQueryV2'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import moment from 'moment'
  import ListController from 'mixins/ListController'
  import {json2xls} from 'lib/utils'

  export default {
    components: {},
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        paymentsadditionals: [],
        workconditions: [],
        works: [],
        notCreatedWorks: [],
        dialogvisibleCreate: false,
        dialogvisibleEdit: false,
        dialogvisibleCreateMany: false,
        form: {
          id: null,
          additional: 0,
          workTypeParameterPlanWorkTypeId: null,
          workConditionId: null,
        },
        searchForm: null,
        searchFormMin: 1,
        searchFormMax: 20,
        perPage: 10,
        currentPage: 1,
        loading: true,
        endpoint: 'PaymentsAdditionals/',
        organizationsGroupId: this.$root.context.organizationsGroupId || "",
      }
    },
    computed: {
      filteredWorks() {
        return this.uniqueWorks.filter(work => {
          return (!this.searchForm || work.name.toLowerCase().includes(this.searchForm.toLowerCase())) && (!this.filterModel.filterWork || work.id === this.filterModel.filterWork)
        })
      },
      filteredWorkConditions(){
        return this.workconditions.filter(workCondition => {
          return (!this.filterModel.filterWorkCondition || workCondition.id === this.filterModel.filterWorkCondition)
        })
      },
      uniqueWorks() {
        let works = this.paymentsadditionals.map(x => x.workTypeParameterPlanWorkTypeId).filter((item, i, arr) => arr.indexOf(item) === i);
        let uniqueWorks = [];
        works.forEach(x => {
          let work = this.works.find(y => y.id == x)
          if (work){
            uniqueWorks.push({ id: x, name: work.name })
            this.notCreatedWorks.splice(this.notCreatedWorks.findIndex(f => f.id == x), 1)
          }
        })
        return uniqueWorks
      },
      paymentsAdditionalsXLS(){
        let array = []
        let work = ''
        let workCondition = ''
        this.paymentsadditionals.forEach(x => {
          work = this.works.find(f => f.id == x.workTypeParameterPlanWorkTypeId)
          work = work ? work.name : 'удалено'
          workCondition = this.workconditions.find(w => w.id == x.workConditionId)
          workCondition = workCondition ? workCondition.name : 'удалено'
          if (work && workCondition) {
            array.push({
              'Работа': work,
              'Вид': workCondition,
              'Доплата': x.additional
            })
          }
        })
        array.sort(function (a, b) {
          if (a['Работа'] > b['Работа']) {
            return 1;
          }
          if (a['Работа'] < b['Работа']) {
            return -1;
          }
          return 0;
        });
        return array;
      },
    },
    created() {
      this.fetchEntities([
        'paymentsadditionals',
        "workconditions",
        "works",
      ], this.afterFetch );
    },
    methods: {
      afterFetch(){
        this.paymentsadditionals = this.fromVuex('paymentsadditionals')
        this.workconditions = this.fromVuex('workconditions').map(w => {
          w.additional = 0
          return w
        })
        this.works = this.fromVuex('works')
        this.notCreatedWorks = this.works.slice()
        this.loading = false
      },
      getAdditional(workTypeParameterPlanWorkTypeId, workConditionId){
        let additional = this.paymentsadditionals.find(x => (x.workTypeParameterPlanWorkTypeId == workTypeParameterPlanWorkTypeId && x.workConditionId == workConditionId) )
        if (additional){
          additional = additional.additional
        } else {
          additional = '0'
        }
        return additional
      },
      editAdditional(workTypeParameterPlanWorkTypeId, workConditionId){
        let additional = this.paymentsadditionals.find(x => (x.workTypeParameterPlanWorkTypeId == workTypeParameterPlanWorkTypeId && x.workConditionId == workConditionId) )
        if (additional){
          this.dialogvisibleEdit = true
          this.form.workTypeParameterPlanWorkTypeId = workTypeParameterPlanWorkTypeId
          this.form.workConditionId = workConditionId
          this.form.id = additional.id
          this.form.additional = additional.additional
        } else {
          this.dialogvisibleCreate = true
          this.form.workTypeParameterPlanWorkTypeId = workTypeParameterPlanWorkTypeId
          this.form.workConditionId = workConditionId
          this.form.id = null
          this.form.additional = 0
        }
      },
      newAdditionals(){
        this.dialogvisibleCreateMany = true
      },
      formPost(){
        let endpoint = this.endpoint + this.organizationsGroupId;
        let data = {
          additional: this.form.additional,
          workTypeParameterPlanWorkTypeId: this.form.workTypeParameterPlanWorkTypeId,
          workConditionId: this.form.workConditionId,
        };
        http.post(endpoint, data).then(() => {
          this.refresh();
        });
      },
      formPut(){
        let endpoint = this.endpoint + this.organizationsGroupId;
        let data = {
          id: this.form.id,
          additional: this.form.additional,
          workTypeParameterPlanWorkTypeId: this.form.workTypeParameterPlanWorkTypeId,
          workConditionId: this.form.workConditionId,
        };
        http.put(endpoint, data).then(() => {
          this.refresh();
        });
      },
      formPostMany(){
        let endpoint = this.endpoint + this.organizationsGroupId;
        this.workconditions.forEach(w => {
          let data = {
             workTypeParameterPlanWorkTypeId: this.form.workTypeParameterPlanWorkTypeId,
             workConditionId: w.id,
             additional: parseFloat(w.additional)
          }
          http.post(endpoint, data).then(() => {
            this.refresh();
          });
        })
      },
      refresh(){
        this.hideDialogs()
        this.nullForm()
        this.fetchEntities([
          'paymentsadditionals',
          "workconditions",
          "works",
        ], this.afterFetch )
        this.loading = true
      },
      nullForm(){
        for (let item in this.form){
          this.form[item] = null
        }
        this.form.additional = 0
        this.workconditions.forEach(w => w.additional = 0)
      },
      hideDialogs(){
        this.dialogvisibleCreate = false
        this.dialogvisibleEdit = false
        this.dialogvisibleCreateMany = false
      },
      exportTable() {
        let name = "Доплаты"
        let colNum = 3
        let data = this.paymentsAdditionalsXLS
        return json2xls(data, name, colNum)
      },
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
.catalog-static-container{
  width: 100%;
}
.fx-cell{
  font-size: 14px;
  padding: 10px 0;
  position: relative;
}
.fx-cell-edit{
  position: absolute;
  bottom: 1px;
  right: 1px;
  height: 22px;
  width: 28px;
  padding: 2px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #dfe6ec;
  box-sizing: border-box;
}
.fx-cell p{
  font-size: 14px;
  margin: 0px;
  padding: 0px;
}
.top-form{
  margin-top: 11px;
  display: flex;
}
.top-form .el-form-item{
  margin-bottom: 15px;
}
.tf-search{
  flex: auto 1 0
}
.tf-search>>>.el-form-item__content{
  width: 100%;
  box-shadow: 0 0 11px #bfcbd9;
}
.tf-filter{
  margin: 0 10px 15px 0
}
.tf-xls{
  margin: 0 0 15px 0
}

.fd-full{
  width: 100%;
}
.fd-form .el-input{
  width: 70px;
}
</style>
