<template lang="pug">
.catalog-static-container(v-loading="loading", element-loading-text="Загружается...")
  el-form(:inline="true", class="top-form")
    el-form-item
      el-button(@click="createCarInformation") Новая запись
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
      class="tf-filter",
      v-if="false",
    ) .
    el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
      el-form(:model="filterModel", label-width="70px", label-position="left")

        el-form-item
          el-button(@click="resetFilter") Сбросить
    el-form-item(:class="{invisibleColor: true}", class="tf-xls")
      el-button.excel(type='default', @click="exportTable('form')") .

  el-dialog(v-if='dialogvisibleCreate', :visible.sync="dialogvisibleCreate", title="Новое досье техники", size="tiny", :close-on-click-modal="false")
    create(:form="form", :cars="cars")

  el-dialog(v-if="dialogvisibleEdit", :visible.sync="dialogvisibleEdit", title="Редактировать досье техники", size="tiny", :close-on-click-modal="false")
    update(:form="form", :cars="cars", :id="id")

  el-dialog(v-if='dialogvisibleDelete', :visible.sync="dialogvisibleDelete", title="Вы уверены что хотите удалить?", size="tiny", :close-on-click-modal="false")
    remove(:id="id")

  el-table(
    :data="paginate(filteredCarInformation)",
    border,
    resizable,
  )
    el-table-column(type="expand")
      template(slot-scope="scope")
        .exp-head(v-if="scope.row.imageBytes")
          .exp-row Фото:
          img(:src="scope.row.imageBytes", class="car-image")
        .exp-head(v-if="scope.row.employee") Работники:
          .exp-row(v-for="worker in scope.row.employee") {{ worker.fullName }}

    el-table-column(label="Гос номер", prop="number", header-align="center")
    el-table-column(label="Хоз номер", prop="businessNumber", header-align="center")
    el-table-column(label="Год выпуска", prop="year", header-align="center")
    el-table-column(label="Номер двигателя", prop="engineNumber", header-align="center")
    el-table-column(label="Средняя производительность", prop="productivityAverage", header-align="center")
    el-table-column(
      label="Операции",
      fixed="right",
      header-align="center",
      align="center",
      width="120"
    )
      template(slot-scope="scope")
        el-button(@click="editCarInformation(scope.row.carId)" size="small" icon="edit")
        el-button(@click="deleteCarInformation(scope.row.id)" size="small" icon="delete")

    el-pagination(
        v-if="carInformation",
        layout="total, prev, pager, next",
        :total="carInformation.length",
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
  import nprogress from 'lib/NProgress'
  import { Message } from 'element-ui'
  import {EventBus} from 'services/EventBus'
  import carInformation from './carInformation'
  import create from "components/catalog-static/car-information/create.vue"
  import update from "components/catalog-static/car-information/update.vue"
  import remove from "components/catalog-static/car-information/remove.vue"

  export default {
    components: {
      create,
      update,
      remove
    },
    mixins: [
      RecordsLoaderV2,
      ListController,
      carInformation
    ],
    data() {
      return {
        employees: [],
        carInformation: [],
        cars: [],
        dialogvisibleCreate: false,
        dialogvisibleEdit: false,
        dialogvisibleDelete: false,
        id: null,
        form: {
          carId: null,
          imageBytes: null,
          year: null,
          businessNumber: null,
          engineNumber: null,
          productivityAverage: null,
        },
        searchForm: null,
        searchFormMin: 1,
        searchFormMax: 20,
        perPage: 10,
        currentPage: 1,
        loading: true,
        endpoint: 'carInformation/',
      }
    },
    computed: {
      filteredCarInformation() {
        let carInformation = this.carInformation
        if (carInformation)
          carInformation = carInformation.filter(c => {
          return (!this.searchForm || this.search(c.number, c.businessNumber, c.engineNumber, c.year, c.productivityAverage, c.idleTotalNumber, c.threshingVolume, c.kmForYear, c.fuelForYear, c.fuelFor100km))
        })
        return carInformation
      },
      carInformationXLS(){
        let array = []
        this.carInformation.forEach(c => {
          array.push({
            "Гос номер": c.number,
            "Хоз номер": c.businessNumber,
            "Год выпуска": c.year,
            "Номер двигателя": c.engineNumber,
            "Средняя производительность": c.productivityAverage,
          })
        })
        return array;
      },
    },
    created() {
      EventBus.$on('CatalogStaticCarInformationChanged', () => {
        this.refresh()
      });
      EventBus.$on('CatalogStaticDialogsClose', () => {
        this.hideDialogs()
      });
      this.fetchEntities([
        'employees',
        'cars',
        'carInformation',
      ], this.afterFetch );
    },
    methods: {
      search(...items){
        let res = false
        items.forEach(item => {
          if (item.toString().toLowerCase().includes(this.searchForm.toLowerCase()))
            res = true
        })
        return res
      },
      afterFetch(){
        this.employees = this.fromVuex('employees')
        this.cars = this.fromVuex('cars')
        this.carInformation = this.fromVuex('carInformation')
        this.loading = false
      },
      refresh(){
        this.hideDialogs()
        this.nullForm()
        this.fetchEntities([
          'carInformation',
        ], this.afterFetch )
        this.loading = true
      },
      nullForm(){
        this.id = null
        for (let item in this.form){
          this.form[item] = null
        }
      },
      hideDialogs(){
        this.dialogvisibleCreate = false
        this.dialogvisibleEdit = false
        this.dialogvisibleDelete = false
      },
      editCarInformation(carId){
        this.nullForm()
        let carInformation = this.carInformation.find(x => x.carId == carId)
        if (carInformation){
          this.dialogvisibleEdit = true
          Object.keys(this.form).forEach(key => {
            this.form[key] = carInformation[key]
          })
          this.id = carInformation.id
        } else {
          Message({
            message: 'Нет такой информации по машине',
            type: "error",
            duration: 5000,
            showClose: false,
          })
        }
      },
      createCarInformation(){
        this.nullForm()
        this.dialogvisibleCreate = true
      },
      deleteCarInformation(id){
        this.nullForm()
        this.id = id
        this.dialogvisibleDelete = true
      },
      exportTable() {
        let name = "Досье техники"
        let colNum = 11
        let data = this.carInformationXLS
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

.car-image{
  max-height: 150px;
  max-width: 150px;
}
.exp-head{
  margin: 10px 0;
}
.exp-row{
  margin: 3px 0;
  font-size: 14px;
}
.el-dialog__body .el-input{
  max-width: 217px;
}
</style>
