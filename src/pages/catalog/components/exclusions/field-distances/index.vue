<template lang="pug">
.catalog-static-container(v-loading="loading", element-loading-text="Загружается...")
  el-form(:inline="true", class="top-form")
    el-form-item
      el-button(@click="newDistances") Новая запись
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
        el-form-item(label="Поле")
          el-select(v-model="filterModel.filterField", clearable, filterable)
            el-option(
            v-for="item in fields",
            :label="item.newName",
            :value="item.id",
            :key="item.id",
            )
        el-form-item(label="Место транспортировки")
          el-select(v-model="filterModel.filterWarehouse", clearable, filterable)
            el-option(
            v-for="item in warehouses",
            :label="item.name",
            :value="item.id",
            :key="item.id",
            )
        el-form-item
          el-button(@click="resetFilter") Сбросить
    el-form-item(:class="{invisibleColor: true}", class="tf-xls")
      el-button.excel(type="default", @click="exportTable('form')") .

  el-dialog(v-if="dialogvisibleCreateMany", :visible.sync="dialogvisibleCreateMany", title="Выберите поле и расстояния", :close-on-click-modal="false", class="fd-form")
    el-form(:inline="true", label-position="top")
      el-form-item(class="fd-full")
        el-select(v-model="form.fieldId", clearable, filterable)
          el-option(
              v-for="f in notCreatedFields",
              :key="f.id",
              :label="f.newName",
              :value="f.id"
            )
      el-form-item(v-for="w in warehouses", :label="w.name", :key="w.id")
        el-input(v-model="w.distance")
    el-button(type="primary", @click="formPostMany") Создать

  el-dialog(v-if="dialogvisibleCreate", :visible.sync="dialogvisibleCreate", title="Создать дистанцию", size="tiny", :close-on-click-modal="false")
    el-form
      el-form-item
        el-input-number(v-model="form.distance", :min="0")
      el-form-item
        el-button(type="primary", @click="formPost") Создать

  el-dialog(v-if="dialogvisibleEdit", :visible.sync="dialogvisibleEdit", title="Редактировать дистанцию", size="tiny", :close-on-click-modal="false")
    el-form
      el-form-item
        el-input-number(v-model="form.distance", :min="0")
      el-form-item
        el-button(type="primary", @click="formPut") Сохранить

  .fx-table
    .fx-row.fx-light-grey
      .fx-cell(style="font-weight: bold;") Поле
      .fx-cell(v-for="w in filteredWarehouses", style="font-weight: bold;") {{ w.name }}
    .fx-row(v-for="f in paginate(filteredFields)")
      .fx-cell {{ f.name }}
      .fx-cell(v-for="w in filteredWarehouses")
        p {{ getDistance( f.id, w.id ) }}
        .fx-cell-edit(@click="editDistance(f.id, w.id)")
          i.el-icon-edit
    el-pagination(
        v-if="filteredFields",
        layout="total, prev, pager, next",
        :total="filteredFields.length",
        :page-size="perPage",
        :current-page="currentPage",
        @current-change="onCurrentPageChange",
        @size-change="onPerPageChange"
      )

</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import {json2xls} from "lib/utils"

export default {
  components: {},
  mixins: [
    
    ListController
  ],
  data() {
    return {
      fielddistances: [],
      warehouses: [],
      fields: [],
      notCreatedFields: [],
      dialogvisibleCreate: false,
      dialogvisibleEdit: false,
      dialogvisibleCreateMany: false,
      form: {
        id: null,
        distance: 0,
        fieldId: null,
        warehouseId: null,
      },
      searchForm: null,
      searchFormMin: 1,
      searchFormMax: 20,
      perPage: 10,
      currentPage: 1,
      loading: true,
      endpoint: "FieldDistances/",
    }
  },
  computed: {
    filteredFields() {
      return this.uniqueFields.filter(field => {
        return (!this.searchForm || field.name.toLowerCase().includes(this.searchForm.toLowerCase())) && (!this.filterModel.filterField || field.id === this.filterModel.filterField)
      })
    },
    filteredWarehouses(){
      return this.warehouses.filter(warehouse => {
        return (!this.filterModel.filterWarehouse || warehouse.id === this.filterModel.filterWarehouse)
      })
    },
    uniqueFields() {
      let fields = this.fielddistances.map(x => x.fieldId).filter((item, i, arr) => arr.indexOf(item) === i);
      let uniqueFields = [];
      fields.forEach(x => {
        let field = this.fields.find(y => y.id == x)
        if (field){
          uniqueFields.push({id: x, name: field.newName})
          this.notCreatedFields.splice(this.notCreatedFields.findIndex(f => f.id == x), 1)
        }
      })
      return uniqueFields
    },
    fieldDistancesXLS(){
      let array = []
      let field = ""
      let warehouse = ""
      this.fielddistances.forEach(x => {
        field = this.fields.find(f => f.id == x.fieldId)
        field = field ? field.newName : "удалено"
        warehouse = this.warehouses.find(w => w.id == x.warehouseId)
        warehouse = warehouse ? warehouse.name : "удалено"
        if (field && warehouse) {
          array.push({
            "Поле": field,
            "Место транспортировки": warehouse,
            "Дистанция": x.distance
          })
        }
      })
      array.sort(function (a, b) {
        if (a["Поле"] > b["Поле"]) {
          return 1;
        }
        if (a["Поле"] < b["Поле"]) {
          return -1;
        }
        return 0;
      });
      return array;
    },
  },
  created() {
    fetchEntities([
      "fielddistances",
      "warehouses",
      "fields"
    ], this.afterFetch );
  },
  methods: {
    afterFetch(){
      this.fielddistances = fromVuex("fielddistances")
      this.warehouses = fromVuex("warehouses").map(w => {
        w.distance = 0
        return w
      })
      this.fields = fromVuex("fields")
      this.notCreatedFields = this.fields.slice()
      this.loading = false
    },
    getDistance(fieldId, warehouseId){
      let distance = this.fielddistances.find(x => (x.fieldId == fieldId && x.warehouseId == warehouseId) )
      if (distance){
        distance = distance.distance
      } else {
        distance = "Не определен"
      }
      return distance
    },
    editDistance(fieldId, warehouseId){
      let distance = this.fielddistances.find(x => (x.fieldId == fieldId && x.warehouseId == warehouseId) )
      if (distance){
        this.dialogvisibleEdit = true
        this.form.fieldId = fieldId
        this.form.warehouseId = warehouseId
        this.form.id = distance.id
        this.form.distance = distance.distance
      } else {
        this.dialogvisibleCreate = true
        this.form.fieldId = fieldId
        this.form.warehouseId = warehouseId
        this.form.id = null
        this.form.distance = 0
      }
    },
    newDistances(){
      this.dialogvisibleCreateMany = true
    },
    formPost(){
      let endpoint = this.endpoint + this.$root.context.organization;
      let data = {
        distance: this.form.distance,
        fieldId: this.form.fieldId,
        warehouseId: this.form.warehouseId,
      };
      http.post(endpoint, data).then(() => {
        this.refresh();
      });
    },
    formPut(){
      let endpoint = this.endpoint + this.$root.context.organization;
      let data = {
        id: this.form.id,
        distance: this.form.distance,
        fieldId: this.form.fieldId,
        warehouseId: this.form.warehouseId,
      };
      http.put(endpoint, data).then(() => {
        this.refresh();
      });
    },
    formPostMany(){
      let endpoint = this.endpoint + "many/" + this.$root.context.organization;
      let data = []
      this.warehouses.forEach(w => {
        data.push({
          fieldId: this.form.fieldId,
          warehouseId: w.id,
          distance: parseFloat(w.distance)
        })
      })
      http.post(endpoint, data).then(() => {
        this.refresh();
      });
    },
    refresh(){
      this.hideDialogs()
      this.nullForm()
      fetchEntities([
        "fielddistances",
        "warehouses",
        "fields"
      ], this.afterFetch )
      this.loading = true
    },
    nullForm(){
      for (let item in this.form){
        this.form[item] = null
      }
      this.form.distance = 0
      this.warehouses.forEach(w => w.distance = 0)
    },
    hideDialogs(){
      this.dialogvisibleCreate = false
      this.dialogvisibleEdit = false
      this.dialogvisibleCreateMany = false
    },
    exportTable() {
      let name = "Расстояние полей"
      let colNum = 3
      let data = this.fieldDistancesXLS
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
