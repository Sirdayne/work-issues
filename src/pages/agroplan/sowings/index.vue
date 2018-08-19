<template lang="pug">
.workspace-sowings(v-loading="loading", element-loading-text="Загружается...")
  el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
    el-form(:model="filterModel", label-width="130px", label-position="left")
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

  el-dialog(v-if="dialogvisibleEdit", :visible.sync="dialogvisibleEdit", title="Редактировать", size="small", :close-on-click-modal="false")
    update(:form="form", :id="id",
    :sowings="sowings",
    :fields="fields",
    :cultures="cultures",
    :sorts="sorts",
    :reproductions="reproductions",
    :cultureparameters="cultureparameters",
    :croprotations="croprotations"
    )

  el-dialog(v-if="dialogvisibleDelete", :visible.sync="dialogvisibleDelete", title="Вы уверены что хотите удалить?", size="tiny", :close-on-click-modal="false")
    remove(:id="id", :dialogvisibleDelete="dialogvisibleDelete")

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
    el-form-item(:class="{invisibleColor: true}", class="tf-xls")
      el-button.excel(type="default", @click="exportTable('form')") .

  el-table(
    :data="paginate(filteredSowings)",
    border,
    resizable,
  )
    el-table-column(label="Название поля", prop="fieldName", header-align="center")
    el-table-column(label="Новое название", prop="fieldNewName", header-align="center")
    el-table-column(label="Культура", prop="cultureName", header-align="center")
    el-table-column(label="Площадь посева", prop="area", header-align="center")
    el-table-column(label="Урожайность", prop="yield", header-align="center")
    el-table-column(label="Сорт", prop="sortName", header-align="center")
    el-table-column(label="Репродукция", prop="reproductionName", header-align="center")
    el-table-column(label="Конечный продукт", prop="cultureParameterName", header-align="center")
    el-table-column(label="Норма высева", prop="sowingNormative", header-align="center")
    el-table-column(label="Предшественник", prop="previousCultures", header-align="center")
    el-table-column(
      label="Операции",
      fixed="right",
      header-align="center",
      align="center",
      width="120"
    )
      template(slot-scope="scope")
        el-button(@click="editSowing(scope.row.id)" size="small" icon="edit")
        el-button(@click="deleteSowing(scope.row.id)" size="small" icon="delete")

  el-pagination(
    v-if="filteredSowings",
    style="margin-top: 20px"
    layout="total, prev, pager, next",
    :total="filteredSowings.length",
    :page-size="perPage",
    :current-page="currentPage",
    @current-change="onCurrentPageChange",
    @size-change="onPerPageChange"
  )

</template>

<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import {json2xls} from "lib/utils"
import {Message} from "element-ui"
import {EventBus} from "services/EventBus"
import update from "pages/agroplan/sowings/update.vue"
import remove from "pages/agroplan/sowings/remove.vue"

export default {
  mixins: [
    ListController
  ],
  components: {
    update,
    remove,
  },
  data() {
    return {
      sowings: [],
      fields: [],
      cultures: [],
      sorts: [],
      reproductions: [],
      cultureparameters: [],
      croprotations: [],
      budgets: [],
      id: null,
      form: {
        year: null,
        fieldId: null,
        cultureId: null,
        area: null,
        yield: null,
        cultureSortId: null,
        reproductionId: null,
        cultureParameterId: null,
        sowingNormative: null,
      },
      dialogvisibleEdit: false,
      dialogvisibleDelete: false,
      perPage: 10,
      currentPage: 1,
      loading: true,
    }
  },
  created() {
    EventBus.$on("SowingsChanged", () => {
      this.refresh()
    });
    EventBus.$on("SowingsDialogsClose", () => {
      this.hideDialogs()
    });
    fetchEntities([
      "sowings",
      "fields",
      "cultures",
      "sorts",
      "reproductions",
      "cultureparameters",
      "croprotations",
    ], this.afterFetch );
  },
  computed: {
    formatsowings() {
      let array = []
      if (this.sowings.length > 0){

        this.sowings = this.sowings.filter(r => r.year === this.$root.context.year)
        this.sowings.forEach(sowing => {
          sowing.sortName = this.getNameFromId(sowing.cultureSortId, this.sorts)
          sowing.reproductionName = this.getNameFromId(sowing.reproductionId, this.reproductions)
          sowing.cultureParameterName = this.getNameFromId(sowing.cultureParameterId, this.cultureparameters)
          sowing.previousCultures = this.getPreviousCultures(this.$root.context.year, sowing.fieldId)
          array.push(sowing)
        })
      }
      return array
    },
    filteredSowings() {
      let array = []
      if (this.formatsowings.length > 0){
        array = this.formatsowings
        if (this.filterModel.filterCulture && array){
          array = array.filter(r => r.cultureId === this.filterModel.filterCulture)
        }
        if (this.filterModel.filterField && array){
          array = array.filter(r => r.fieldId === this.filterModel.filterField)
        }
        if (this.filterModel.filterSort && array){
          array = array.filter(r => r.cultureSortId === this.filterModel.filterSort)
        }
        if (this.filterModel.filterReproduction && array){
          array = array.filter(r => r.reproductionId === this.filterModel.filterReproduction)
        }
        if (this.filterModel.filterCultureParameter && array){
          array = array.filter(r => r.cultureParameterId === this.filterModel.filterCultureParameter)
        }
      }
      return array
    },
    sowingsXLS(){
      let records = this.filteredSowings;
      let array = [];
      records.forEach(r => {
        array.push({
          "Название поля": r.fieldName,
          "Культура": r.cultureName,
          "Площадь посева": r.area,
          "Урожайность": r.yield,
          "Сорт": r.sortName,
          "Репродукция": r.reproductionName,
          "Конечный продукт": r.cultureParameterName,
          "Норма высева": r.sowingNormative,
          "Предшественник": r.previousCultures
        });
      });
      return array;
    },
  },
  methods: {
    afterFetch() {
      this.sowings = fromVuex("sowings")
      this.fields = fromVuex("fields")
      this.cultures = fromVuex("cultures")
      this.sorts = fromVuex("sorts")
      this.reproductions = fromVuex("reproductions")
      this.croprotations = fromVuex("croprotations")
      this.cultureparameters = fromVuex("cultureparameters")
      this.loading = false
    },
    getPreviousCultures(year, field){
      let croprotation = this.croprotations.find(c => c.fieldId === field)
      if (croprotation) {
        let culture = ""
        croprotation.columns[year-1].forEach(c => {
          culture += c.culture ? `«${c.culture}» ` : ""
        })
        return culture
      } else
        return "нет данных"
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
      return "нет данных"
    },
    editSowing(id){
      this.nullForm()
      let sowing = this.sowings.find(x => x.id == id)
      if (sowing){
        this.dialogvisibleEdit = true
        Object.keys(this.form).forEach(key => {
          this.form[key] = sowing[key]
        })
        this.id = sowing.id
      } else {
        Message({
          message: "Нет такой информации по машине",
          type: "error",
          duration: 5000,
          showClose: false,
        })
      }
    },
    deleteSowing(id){
      this.nullForm()
      this.id = id
      this.dialogvisibleDelete = true
    },
    refresh(){
      this.hideDialogs()
      this.nullForm()
      fetchEntities([
        "sowings",
      ], this.afterFetch )
      this.loading = true
    },
    hideDialogs(){
      this.dialogvisibleCreate = false
      this.dialogvisibleEdit = false
      this.dialogvisibleDelete = false
    },
    nullForm(){
      this.id = null
      for (let item in this.form){
        this.form[item] = null
      }
    },
    exportTable() {
      let name = "Список посевов"
      let colNum = 10
      let data = this.sowingsXLS
      return json2xls(data, name, colNum)
    },
  },
}

</script>

<style lang="stylus" scoped>
.workspace-sowings
  padding: 10px 10px 10px 20px
  overflow auto

</style>

