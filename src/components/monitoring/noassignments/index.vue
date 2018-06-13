<template lang="pug">
div
  div
    el-form(
      :inline="true",
      :label-position="'top'"
    )
      el-form-item(label="Дата:")
        el-date-picker(v-model="filterDate", type="daterange", format="dd.MM.yyyy", placeholder="Выберите дату")
      el-form-item(label="Модель машины:")
        el-select(v-model="filterCar" clearable placeholder="Выбрать")
          el-option(
            v-for="c in carmodels",
            :label="c.name",
            :value="c.id",
            :key="c.id",
          )
      el-form-item(label="Тип техники:")
        el-select(v-model="filterCarType" clearable placeholder="Выбрать")
          el-option(
          v-for="c in cartypes",
          :label="c.name",
          :value="c.id",
          :key="c.id",
          )

    h2(class="tableHeading") Нет заданий
      span(:style="{marginRight: '30px'}")
      el-button.excel(type='default', @click="exportTable('form')") .

    el-table(
      :data="paginate(stopformatFiltered)",
      border,
      resizable,
      v-loading="loading",
      element-loading-text="Загружается..."
    ).content
      el-table-column(label="Дата", prop="formatDate", header-align="center", align="center")
      el-table-column(label="Машина", prop="carName", header-align="center", align="center")
      el-table-column(label="ГеоЗона", prop="geoZone", header-align="center")
      el-table-column(label="Дистанция", prop="distance", header-align="center", align="center")
      el-table-column(
        label="Операции",
        header-align="center",
        align="center",
        width="120"
      )
        template(slot-scope="scope")
          router-link(:to="`/agrofact/map?carIdTabOpen=${scope.row.carId}&carGpsDate=${scope.row.formatDate}`", target="_blank")
            el-button(type="info", class="router-btn") на карту

    el-pagination(
        v-if="stopformatFiltered",
        layout="total, prev, pager, next",
        :total="stopformatFiltered.length",
        :page-size="perPage",
        :current-page="currentPage",
        style="margin-top: 20px;",
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

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController,
    ],
    data() {
      return {
        filterDate: [
          moment().year(this.$root.context.year).subtract(1, 'days').format(),
          moment().year(this.$root.context.year).format(),
        ],
        filterCar: null,
        filterCarType: null,
        cars: [],
        cartypes: [],
        carmodels: [],
        fields: [],
        warehouses: [],
        perPage: 10,
        currentPage: 1,
        loading: true,
        stopjournals: []
      }
    },
    watch: {
      'filterDate'(val, oldVal) {
         this.getStopJournals();
      },
    },
    computed: {
      stopformat() {
        let array = this.stopjournals ? this.stopjournals.slice(0) : []
        let stopformat = []
        array.forEach(a => {
          let finded = stopformat.findIndex(s => s.carId == a.carId && s.formatDate == a.formatDate)
          if (finded == -1){
            let car = this.cars.find(c => c.id == a.carId)
            let carName = car ? car.displayString : 'нет данных'
            stopformat.push({
              formatDate: a.formatDate,
              carId: a.carId,
              carModelId: car.carModelId,
              carTypeId: car.carTypeId,
              carName: carName,
              geoZoneArray: [],
              geoZone: '',
              distance: 0
            })
          }
        })
        stopformat.forEach(s => {
          array.forEach(a => {
            let stopjournal = Object.assign({}, a)
            if (s.carId == stopjournal.carId && s.formatDate == stopjournal.formatDate){
              s.distance += stopjournal.distance
              if (stopjournal.location){
                let finded = s.geoZoneArray.findIndex(g => g == stopjournal.location)
                if (finded == -1){
                  s.geoZoneArray.push(stopjournal.location)
                  s.geoZone += '«' + stopjournal.location + '» '
                }
              } else if (stopjournal.fieldId){
                let field = this.fields.find(f => f.id == stopjournal.fieldId)
                if (field) {
                  let fieldName = field.newName ? field.newName : 'нет данных'
                  if (fieldName != 'нет данных'){
                    let finded = s.geoZoneArray.findIndex(g => g == fieldName)
                    if (finded == -1){
                      s.geoZoneArray.push(fieldName)
                      s.geoZone += '«' + fieldName + '» '
                    }
                  }
                }
              } else if (stopjournal.warehouseId) {
                let warehouse = this.warehouses.find(f => f.id == stopjournal.warehouseId)
                if (warehouse) {
                  let warehouseName = warehouse.name ? warehouse.name : 'нет данных'
                  if (warehouseName != 'нет данных'){
                    let finded = s.geoZoneArray.findIndex(g => g == warehouseName)
                    if (finded == -1){
                      s.geoZoneArray.push(warehouseName)
                      s.geoZone += '«' + warehouseName + '» '
                    }
                  }
                }
              }
            }
          })
          s.distance = s.distance.toFixed(2)
        })
        return stopformat
      },
      stopformatFiltered() {
        let array = this.stopformat ? this.stopformat.slice(0) : []
        if (array) {
          if (this.filterCar){
            array = array.filter(a => a.carModelId == this.filterCar)
          }
          if (this.filterCarType){
            array = array.filter(a => a.carTypeId == this.filterCarType)
          }
        }
        return array
      },
      stopformatXLS(){
        let array = []
        this.stopformatFiltered.forEach(s => {
          array.push({
            "Дата": s.formatDate,
            "ГеоЗона": s.geoZone,
            "Дистанция": s.distance
          })
        })
        return array;
      },
    },
    created() {
      this.getStopJournals()
      this.fetchEntities([
        'cars',
        'carmodels',
        'fields',
        'warehouses',
        'cartypes'
      ], this.afterFetch );
    },
    methods: {
      getStopJournals() {
        this.stopjournals = []
        let id = this.$root.context.organization
        let dateFrom = moment(this.filterDate[0]).format("YYYY-MM-DDTHH:mm:ss")
        let dateTo = moment(this.filterDate[1]).format("YYYY-MM-DDTHH:mm:ss")
        this.loading = true
        http.getWithoutCache(`stopjournals/list?id=${id}&dateFrom=${dateFrom}&dateTo=${dateTo}`)
          .then(data => {
            this.stopjournals = data
            this.modifyStopJournals()
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
      },
      modifyStopJournals() {
        //фильтр, оставляем только "нет задания"
        this.stopjournals = this.stopjournals.filter(s => s.stopType == 3).filter(s => {
          let car = this.cars.find(c => c.id == s.carId)
          let carModel = this.carmodels.find(c => c.id == car.carModelId)
          //фильтр, убираем легковые авто
          if (carModel && carModel.carTypeId != 3){
            return s
          }
        })
        if (this.stopjournals && this.stopjournals.length){
          this.stopjournals.forEach(s => s.formatDate = moment(s.start).format('DD/MM/YYYY'))
        }
      },
      afterFetch(){
        this.cars = this.fromVuex('cars')
        this.carmodels = this.fromVuex('carmodels')
        this.fields= this.fromVuex('fields')
        this.warehouses = this.fromVuex('warehouses')
        this.cartypes = this.fromVuex('cartypes')
        this.loading = false
      },
      exportTable() {
        let name = "Нет заданий"
        let colNum = 4
        let data = this.stopformatXLS
        return json2xls(data, name, colNum)
      },
    }
  }

</script>

<style lang="stylus" scoped>
.router-btn
  padding 5px 10px
</style>
