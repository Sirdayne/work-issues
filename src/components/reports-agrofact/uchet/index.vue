<template lang="pug">
div
  el-form(
    :model="item",
    ref="form",
    :inline="true",
    :label-position="'top'"
  )
    el-form-item(label="дата от")
      el-date-picker(v-model="item.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="до")
      el-date-picker(v-model="item.selectedDate.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="ФИО водителя")
      el-select(v-model="item.employeeId" placeholder="Выбрать")
        el-option(
          v-for="employee in employees",
          :key="employee.id",
          :label="employee.fullName",
          :value="employee.id",
          )
    el-form-item(label="машина")
      el-select(v-model="item.carId" placeholder="Выбрать")
        el-option(
          v-for="car in cars",
          :key="car.id",
          :label="car.displayString",
          :value="car.id",
          )
    el-form-item(label="орудие")
      el-select(v-model="item.instrumentId" placeholder="Выбрать")
        el-option(
          v-for="instrument in instruments",
          :key="instrument.id",
          :label="instrument.displayString",
          :value="instrument.id",
          )
    el-form-item(label="доплата")
      el-input(v-model="item.addition")
  h2(class="tableHeading") Учетный лист
    span(:style="{marginRight: '30px'}")
    el-button.excel(type='default', @click="exportTable('form')") .
</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'
import MapController from 'components/Map/MapController'
import {EventBus} from 'services/EventBus'

export default {
  components: {
    MapController
  },
  mixins: [
    RecordsLoaderV2,
  ],
  data() {
    return {
      item: {
        selectedDate: {
          from: new Date(new Date(new Date()
              .getTime() - (5 * 24 * 60 * 60 * 1000))
            .setFullYear(this.$root.context.year)),
          till: new Date(new Date()
            .setFullYear(this.$root.context.year)),
        }
      },
      employees: [],
      cars: [],
      instruments: [],
    }
  },
  created() {
    this.fetchEntities([
      'employees',
      'cars',
      'instruments',
    ], this.afterFetch);
    EventBus.$on('AppYearChanged', (year) => {
      this.item.selectedDate.from = new Date(new Date(this.item.selectedDate.from)
        .setFullYear(year));
      this.item.selectedDate.till = new Date(new Date(this.item.selectedDate.till)
        .setFullYear(year));
    });
  },
  methods: {
    afterFetch() {
      this.employees = this.fromVuex("employees")
      this.cars = this.fromVuex("cars")
      this.instruments = this.fromVuex("instruments")
    },
    exportTable(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let endpoint = "RecordSheet";
          let filename = "Учетный лист тракториста-машиниста";
          let body = {
            organizationId: this.$root.context.organization,
            date: {
              start: moment(this.item.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss"),
              end: moment(this.item.selectedDate.till).format("YYYY-MM-DDTHH:mm:ss"),
            },
            addition: this.item.addition,
            employeeId: this.item.employeeId,
            carId: this.item.carId,
            instrumentId: this.item.instrumentId,
          };

          http.downloadXLS(endpoint, body, filename);
        } else {
          return false;
        }
      });
    },
  }
}
</script>

<style scoped lang="scss">
.tableHeading {
    display: block;
    margin-right: 20px;
}
</style>
