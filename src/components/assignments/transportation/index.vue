<template lang="pug">
div
  update
  create
  h2 План задания
  .el-table-cont
    el-table(
      v-if="filteredAssignments.length || loading",
      :data="paginate(search(filteredAssignments))",
      resizable,
      border,
      v-loading="loading",
      element-loading-text="Загружается...",
      max-height="500",
    ).content
      el-table-column(
        prop="startDate",
        label="Время начала",
      )
      el-table-column(
        prop="endDate",
        label="Время завершения",
      )
      el-table-column(
        prop="fieldName",
        label="Поле/Склад",
      )
      el-table-column(
        prop="subOperationName",
        label="Работа",
      )
      el-table-column(
        prop="carDisplayString",
        label="Машина",
      )
      el-table-column(
        prop="employeeFullName",
        label="Водитель",
      )
      el-table-column(
        prop="instrumentName",
        label="Орудие",
      )
      el-table-column(
        fixed="right",
        align="center",
        width="100"
      )
        el-button-group(slot-scope="scope")
          el-button(@click="update(scope.row.id)", size="small", icon="edit")
          el-button(@click="removeAssignment(scope.row.id)", size="small", icon="delete2")
    .no-results(v-else) Нет результатов
    el-pagination(
      layout="total, prev, pager, next",
      :total="filteredAssignments.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )
</template>

<script>
import http from 'lib/httpQueryV2'
import {createIndex} from 'lib/utils'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import {EventBus} from 'services/EventBus'
import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods'
import moment from 'moment'
import create from './create.vue'
import update from './update.vue'

export default {
  mixins: [
    GlobalMethods,
    RecordsLoaderV2,
    ListController
  ],
  components: {
    create,
    update
  },
  data() {
    return {
      perPage: 5,
      selectedDate: Date.now(),
      loading: true,
    }
  },
  computed: {
    transportation() {
      return this.fromVuex('transportation')
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        .map(t => {
          let carDisplayString = this.cars.filter(c => c.id === t.carId);
          t.carDisplayString = (carDisplayString && carDisplayString[0]) ? carDisplayString[0].displayString : "";
          if (t.assignmentType == 3) {
            let fieldName = this.fields.filter(f => f.id === t.destinationFieldId);
            t.fieldName = (fieldName && fieldName[0]) ? fieldName[0].displayString : ""
          } else {
            let fieldName = this.warehouses.filter(w => w.id === t.destinationWarehouseId);
            t.fieldName = (fieldName && fieldName[0]) ? fieldName[0].name : ""
          }
          let subOperationName = this.works.filter(f => f.id === t.subOperationId);
          t.subOperationName = (subOperationName && subOperationName[0]) ? subOperationName[0].name : "";
          let employeeFullName = this.employees.filter(e => e.id === t.employeeId);
          t.employeeFullName = (employeeFullName && employeeFullName[0]) ? employeeFullName[0].fullName : "";
          let instrumentName = this.instruments.filter(i => i.id === t.instrumentId);
          t.instrumentName = (instrumentName && instrumentName[0]) ? instrumentName[0].displayString : "";
          return t;
        });
    },
    works() {
      return this.fromVuex('works')
    },
    employees() {
      return this.fromVuex('employees')
    },
    cars() {
      return this.fromVuex('cars')
    },
    employeesAll() {
      return this.fromVuex('employeesAll')
    },
    carsAll() {
      return this.fromVuex('carsAll')
    },
    fields() {
      return this.fromVuex('fields')
    },
    warehouses() {
      return this.fromVuex('warehouses')
    },
    instruments() {
      return this.fromVuex('instruments')
    },
    fuelnorms() {
      return this.fromVuex('fuelnorms')
    },
    filteredAssignments() {
      if (this.transportation.length) this.loading = true
      let transportation = this.transportation.filter(x => {
        let start = x.dateTimeRange.start;
        let end = x.dateTimeRange.end;
        let date = moment(start).format("MM.DD.YYYY")
        let selectedDate = moment(this.selectedDate).format("MM.DD.YYYY")
        if (date === selectedDate) {
          start = Date.parse(start);
          end = Date.parse(end);
          x.startDate = moment(start).format("DD.MM.YYYY HH:mm")
          x.endDate = moment(end).format("DD.MM.YYYY HH:mm")
          return x;
        }
      }).sort((a, b) => new Date(b.dateTimeRange.start) - new Date(a.dateTimeRange.start));
      if (this.transportation.length) this.loading = false
      return transportation
    },
  },
  created() {
    EventBus.$on('Transportation.CreateComponent.DateTimeStartFieldChanged', (dateTimeStart) => {
      this.selectedDate = dateTimeStart;
      this.refresh();
    });
    EventBus.$on('Transportation.CreateComponent.PostObjectCompleted', () => {
      this.refresh();
    });
    EventBus.$on('Transportation.UpdateComponent.PutObjectCompleted', () => {
      this.refresh();
    });
  },
  mounted() {
    this.fetchEntities([
      'cars',
      'carsAll',
      'employees',
      'employeesAll',
      'fields',
      'fuelnorms',
      'instruments',
      'transportation',
      'organizations',
      'warehouses',
      'works',
    ], this.create);
  },
  methods: {
    create() {
      this.$store.dispatch('actionAddEntities', {
        name: 'transportation',
        data: this.transportation
      });
      EventBus.$emit('Transportation.InitCreate');
    },
    update(id) {
      EventBus.$emit('Transportation.InitUpdate', id);
    },
    load() {
      this.fetchEntities([
        'transportation',
      ]);
    },
    refresh() {
      this.loading = true
      this.load();
    },
    removeAssignment(id) {
      const path = "transportation";
      this.$confirm('Действительно удалить задание?', 'Внимание', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        http.delete(path, id).then(() => {
          this.refresh();
        })
      })
    },
  }
}
</script>

<style>
.el-table .editing-row {
  background: rgba(255, 180, 80, 0.5);
}
</style>
