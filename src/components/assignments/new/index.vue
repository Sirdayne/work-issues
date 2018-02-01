<template lang="pug">
div
  update
  create
  h2 Суточные задания
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
        prop="fieldNewName",
        label="Поле/Посев"
      )
      el-table-column(
        prop="subOperationName",
        label="Работа"
      )
      el-table-column(
        prop="employeeFullName",
        label="Работник"
      )
      el-table-column(
        prop="carDisplayString",
        label="Машина"
      )
      el-table-column(
        prop="instrumentName",
        label="Орудие"
      )
      el-table-column(
        prop="startDate",
        label="Время начала"
      )
      el-table-column(
        prop="endDate",
        label="Время завершения"
      )
      el-table-column(
        prop="planArea",
        label="Норма выработки"
      )
      el-table-column(
        fixed="right",
        align="center",
        width="100"
      )
        el-button-group(slot-scope="scope")
          el-button(@click="update(scope.row.id, scope.row, $event)", size="small", icon="edit")
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
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import {EventBus} from 'services/EventBus'
import moment from 'moment'
import update from './update.vue'
import create from './create.vue'

import modifiedByName from 'lib/modifiedByName'

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  components: {
    update,
    create
  },
  data() {
    return {
      perPage: 5,
      formRules: {
        carId: [{
          required: true,
          type: 'integer',
          message: 'Поле обязательно',
          trigger: 'change'
        }],
        fieldId: [{
          required: true,
          message: 'Поле обязательно',
          trigger: 'blur'
        }]
      },
      selectedDate: Date.now(),
      loading: true
    }
  },
  watch: {
    paginatedFilteredAssignments: function() {
      modifiedByName.addTooltips( this.paginatedFilteredAssignments );
    }
  },
  computed: {
    assignments() {
      return this.fromVuex('assignments')
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
    },
    works() {
      return this.fromVuex('works')
    },
    workdates() {
      return this.fromVuex('workdates')
    },
    workTypes() {
      return this.fromVuex('workTypes')
    },
    employees() {
      return this.fromVuex('employees')
    },
    employeesAll() {
      return this.fromVuex('employeesAll')
    },
    cars() {
      return this.fromVuex('cars')
    },
    carsAll() {
      return this.fromVuex('carsAll')
    },
    fields() {
      return this.fromVuex('fields')
    },
    instruments() {
      return this.fromVuex('instruments')
    },
    organizationInstruments() {
      return this.fromVuex('organizationInstruments')
    },
    instrumentsAll() {
      return this.fromVuex('instrumentsAll')
    },
    fuelnorms() {
      return this.fromVuex('fuelnorms')
    },
    sowings() {
      return this.fromVuex('sowings')
    },
    culturedepths() {
      return this.fromVuex('culturedepths')
    },
    seedlimits() {
      return this.fromVuex('seedlimits')
    },
    cultures() {
      return this.fromVuex('cultures')
    },
    paginatedFilteredAssignments() {
      return this.paginate(this.filteredAssignments);
    },
    filteredAssignments() {
      if (this.assignments.length) this.loading = true
      let assignments = this.updated && this.assignments.map(a => {
        if (a.field !== undefined && a.assignmentType == 2) {
          a.sowingFieldProp = a.fieldNewName;
        } else if (typeof a.seedlimit === 'object') {
          a.sowingFieldProp = a.fieldNewName;
        }
        return a;
      }).filter(x => {
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
      });
      if (this.assignments.length) this.loading = false
      return assignments
    },
  },
  created() {
    this.initEvents();
    this.fetchEntities([
      'assignments',
      'cars',
      'carsAll',
      'culturedepths',
      'cultures',
      'employees',
      'employeesAll',
      'fields',
      'fuelnorms',
      'instruments',
      'instrumentsAll',
      'organizations',
      'organizationInstruments',
      'seedlimits',
      'sowings',
      'workdates',
      'works',
      'workTypes',
    ], this.create);
  },
  methods: {
    initEvents() {
      EventBus.$on('Assignments.CreateComponent.DateTimeStartFieldChanged', (dateTimeStart) => {
        this.selectedDate = dateTimeStart;
      });
      EventBus.$on('Assignments.CreateComponent.DateTimeEndFieldChanged', (dateTimeEnd) => {
      });
      EventBus.$on('Assignments.CreateComponent.PostObjectCompleted', () => {
        this.refresh()
      });
      EventBus.$on('Assignments.UpdateComponent.PutObjectCompleted', () => {
        this.refresh()
      });
    },
    update(id) {
      EventBus.$emit('Assignments.InitUpdate', id);
    },
    load() {
      this.fetchEntities([
        'assignments',
      ]);
    },
    refresh() {
      this.loading = true
      this.load();
    },
    create() {
      this.$store.dispatch('actionAddEntities', {
        name: 'assignments',
        data: this.assignments
      });
      EventBus.$emit('Assignments.InitCreate');
    },
    removeAssignment(id) {
      const path = "AreaAssignments";
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
