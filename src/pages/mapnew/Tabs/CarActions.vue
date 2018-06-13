<template lang="pug">
.fx-table.fx-small(v-loading="loading", element-loading-text="Загрузка...")
  .fx-cont-xls
    json2xls(v-if='xls', :model="xls", :props="xlsProps", :name="xlsName")
    el-button.filter.fx-filter(
      @click="filterUnfolded = true",
      type="default"
    ) .
  el-table(
    v-if="filteredStopjournals",
    :data="paginate(filteredStopjournals)",
    border,
    resizable,
    style="margin-bottom: 10px"
  )
    el-table-column(label="Действие", prop="stopTypeDisplay", header-align="center")
    el-table-column(label="Начало", prop="formatStart", header-align="center")
    el-table-column(label="Конец", prop="formatEnd", header-align="center")
    el-table-column(label="Время", prop="duration", header-align="center")
    el-table-column(label="Макс. скорость", prop="maxSpeed", header-align="center")
    el-table-column(label="Дистанция", prop="distance", header-align="center")
    el-table-column(label="Гео зона", prop="geozone", header-align="center")
    el-table-column(fixed="right", label="Новое задание", header-align="center", align="center", width="130")
      template(slot-scope="scope")
        router-link(v-if="scope.row.stopType == 3", :to="`/agrofact/assignments/add?carId=${scope.row.carId}&start=${scope.row.start}&end=${scope.row.end}`")
          el-button(type="primary", size="small") Добавить

  el-pagination(
    v-if="stopjournals",
    layout="total, prev, pager, next",
    :total="filteredStopjournals.length",
    :page-size="perPage",
    :current-page="currentPage",
    @current-change="onCurrentPageChange",
    @size-change="onPerPageChange"
  )

  el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny", :modal="false")
    el-form(:model="filterModel", label-width="70px", label-position="left")
      el-form-item(label="Действие")
        el-select(v-model="filterModel.stoptype", clearable, filterable)
          el-option(
            v-for="item in stoptypes",
            :label="item.name",
            :value="item.id",
            :key="item.id",
          )
      el-form-item(label="Время")
        el-date-picker(
          v-model="filterModel.dateTimeRange"
          type="datetimerange"
          placeholder="Выберите период времени"
          )
      el-form-item
        el-button(@click="resetFilter") Сбросить


</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import moment from 'moment';
import ListController from 'mixins/ListController'
import json2xls from 'components/json2xls'
import {EventBus} from 'services/EventBus'
import nprogress from 'lib/NProgress'

export default {
  name: "CarActions",
  props: [
    "ids",
  ],
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  components: {
    json2xls,
  },
  data() {
    return {
      xlsProps: {},
      xlsName: "Действия техники",
      xls: false,
      perPage: 10,
      currentPage: 1,
      selectedDate: this.$store.getters.getSelectedDate,
      stopjournals: [],
      stoptypes: [],
      fields: [],
      warehouses: [],
      loading: true,
    }
  },
  computed: {
    filteredStopjournals() {
      let filteredStopjournals = this.stopjournals
      let noData = 'нет данных'
      filteredStopjournals = filteredStopjournals.filter(x => x.carId == this.ids[0])
      filteredStopjournals = this.stopjournals.filter(s => moment(s.start).format('L') == moment(this.selectedDate).format('L'))
      filteredStopjournals.forEach(s => {
        s.formatStart = moment(s.start).format("DD.MM.YYYY - HH:mm:ss")
        s.formatEnd = moment(s.end).format("DD.MM.YYYY - HH:mm:ss")
        s.startDate = new Date(s.start)
        s.endDate = new Date(s.end)
        if (s.location) {
          s.geozone = s.location
        } else if (s.fieldId) {
          let field = this.fields.find(f => f.id == s.fieldId)
          if (field) {
            s.geozone = field.newName
          } else {
            s.geozone = noData
          }
        } else if (s.warehouseId) {
          let warehouse = this.warehouses.find(f => f.id == s.warehouseId)
          if (warehouse) {
            s.geozone = warehouse.name
          } else {
            s.geozone = noData
          }
        } else {
          s.geozone = noData
        }
      })
      if (this.filterModel.stoptype || this.filterModel.stoptype === 0){
        filteredStopjournals = filteredStopjournals.filter(f => f.stopType == this.filterModel.stoptype)
      }
      if (this.filterModel.dateTimeRange && this.filterModel.dateTimeRange.length > 1 && this.filterModel.dateTimeRange[0] && this.filterModel.dateTimeRange[1]){
        let start = this.filterModel.dateTimeRange[0]
        let end = this.filterModel.dateTimeRange[1]
        filteredStopjournals = filteredStopjournals.filter(f => f.startDate > start && f.endDate < end)
      }
      this.prepareXls(filteredStopjournals)
      return filteredStopjournals
    },
  },
  created() {
    EventBus.$on('MapController.SelectedDateChanged', (selectedDate) => {
      this.selectedDate = selectedDate;
      this.getStopJournals(this.selectedDate);
    });
    this.getStopJournals(this.selectedDate);
    this.fetchEntities([
      'stoptypes',
      'fields',
      'warehouses'
    ], this.afterFetch);
  },
  methods: {
    getStopJournals(date) {
      //let endpoint = `Stopjournals/${this.$root.context.organization}/${this.ids[0]}` ;
      let endpoint = `Stopjournals/`;
      let body = {
        carId: this.ids[0],
        date: date,
        organizationId: this.$root.context.organization
      }
      nprogress.start()
      http.post(endpoint, body)
        .then(data => {
          if (data) {
            this.stopjournals = data.sort((a, b) => new Date(b.start) - new Date(a.start))
          }
          nprogress.done()
        })
        .catch((error) => {
          nprogress.done()
          this.$message({
            message: `Ошибка ${error}`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        })
    },
    afterFetch() {
      this.stoptypes = this.fromVuex('stoptypes')
      this.fields = this.fromVuex('fields')
      this.warehouses = this.fromVuex('warehouses')
      this.loading = false
    },
    prepareXls(body) {
      this.xlsProps = {
        stopTypeDisplay: "Действие",
        formatStart: "Начало",
        formatEnd: "Конец",
        duration: "Время",
        maxSpeed: "Макс. скорость",
        distance: "Дистанция",
      }
      this.xls = body
    }
  },
}
</script>
