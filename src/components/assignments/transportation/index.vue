<template lang="pug">
div
  template(v-if="mode == 'edit'")
    h3 Редактирование
  template(v-else)
    h3 Новая запись
  el-form(:inline="true", :label-position="'top'", :model="item")
    el-form-item.organizationToggler
      el-checkbox(v-model="isSelf", @change="setOrganization()") Свои
    el-form-item(label="Дата начала", prop="dateTimeRange.start")
      el-date-picker(v-model="item.dateTimeRange.start", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Дата завершения", prop="dateTimeRange.end")
      el-date-picker(v-model="item.dateTimeRange.end", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Работа")
      el-select(v-model="item.subOperationId", filterable, clearable, @change="filterByWork", :disabled="mode == 'edit'")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    div
    template(v-if="assignmentType == 3")
      el-form-item.form-item-iterable(label="Откуда(склад)")
        el-select(v-model="item.originWarehouseId", filterable, clearable)
          el-option(v-for="w in warehouses", :key="w.id", :label="w.name", :value="w.id")
      el-form-item.form-item-iterable(label="Куда(поле)")
        el-select(v-model="item.destinationFieldId", filterable, clearable)
          el-option(v-for="f in fields", :key="f.id", :label="f.newName", :value="f.id")
    template(v-if="assignmentType == 4")
      el-form-item.form-item-iterable(label="Откуда(поле)")
        el-select(v-model="item.originFieldId", filterable, clearable)
          el-option(v-for="f in fields", :key="f.id", :label="f.newName", :value="f.id")
      el-form-item.form-item-iterable(label="Куда(склад)")
        el-select(v-model="item.destinationWarehouseId", filterable, clearable)
          el-option(v-for="w in warehouses", :key="w.id", :label="w.name", :value="w.id")
    div
    template(v-if="!isSelf")
      el-form-item.form-item-iterable(label="Организация")
        el-select(v-model="organization", placeholder="Организация", @change="filterByOrg", filterable, clearable)
          el-option(v-for="o in organizations", :label="o.name", :value="o.id", :key="o.id")
    el-form-item.form-item-iterable(label="Водитель")
      el-select(v-model="item.employeeId", filterable, clearable)
        el-option(v-for="e in employees", :label="e.fullName", :value="e.id", :key="e.id")
    el-form-item.form-item-iterable(label="Машина")
      el-select(v-model="item.carId", filterable, clearable, @change="filterByCar")
        el-option(v-for="c in cars", :label="c.displayString", :value="c.id", :key="c.id")
    el-form-item.form-item-iterable(label="Орудие")
      el-select(v-model="item.instrumentId", filterable, clearable)
        el-option(v-for="i in instruments", :label="i.displayString", :value="i.id", :key="i.id")
    div
    el-button.form-btn(type="primary", @click="submit()", :loading="loadingItem.save") Сохранить
    template(v-if="mode == 'edit'")
      el-button.form-btn(@click="switchToCreate()") Отменить
  h2 План задания
    span(:style="{marginRight: '30px'}")
    el-button.filter(@click="showFilter()", type="default", title="Фильтр") .
    el-dialog(:visible.sync="filterVisible", title="Фильтр", size="tiny")
      el-form(label-width="90px")
        el-form-item(label="Дата от")
          el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
        el-form-item(label="Дата до")
          el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
        el-form-item(label="Работа")
          el-select.form-item-iterable(v-model="filterModel.workIds", filterable, multiple)
            el-option(v-for="w in filterModelData.works", :label="w.name", :value="w.id", :key="w.id")
        el-form-item(label="Водитель")
          el-select.form-item-iterable(v-model="filterModel.employeeIds", filterable, multiple)
            el-option(v-for="e in filterModelData.employees", :label="e.fullName", :value="e.id", :key="e.id")
        el-form-item(label="Машина")
          el-select.form-item-iterable(v-model="filterModel.carIds", filterable, multiple)
            el-option(v-for="c in filterModelData.cars", :label="c.displayString", :value="c.id", :key="c.id")
        el-form-item(label="Орудие")
          el-select.form-item-iterable(v-model="filterModel.instrumentIds", filterable, multiple)
            el-option(v-for="i in filterModelData.instruments", :label="i.displayString", :value="i.id", :key="i.id")
        el-form-item
          el-button-group
            el-button(@click="applyFilter()", type="primary") Применить
            el-button(@click="clearFilter()") Сбросить
  .el-table-cont
    el-table(
      :data="paginate(filteredAssignments)",
      resizable,
      border,
      v-loading="loading",
      element-loading-text="Загружается...",
      max-height="500",
      :row-class-name="tableRowClassName",
    ).content
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
      el-table-column(
        label="Операции",
        align="center",
        width="120"
      )
        el-button-group(slot-scope="scope")
          el-button(@click="edit(scope.row.id)", size="small", icon="edit", title="редактировать")
          el-button(@click="remove(scope.row.id)", size="small", icon="delete2", title="удалить")
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
import GlobalMethods from 'lib/GlobalMethods';
import paginate from 'mixins/paginate'
import moment from 'moment'
import filterCols from "components/filterCols"
import {deepClone} from 'lib/utils'

export default {
  mixins: [
    RecordsLoaderV2,
    paginate,
  ],
  components: {
    filterCols,
  },
  data() {
    return {
      perPage: 5,
      cols: [
        {prop: "id", label: "№", active: true},
        {prop:"startDate", label:"Время начала", active:true},
        {prop:"endDate", label:"Время завершения", active:true},
        {prop:"fieldName", label:"Поле/Склад", active:true},
        {prop:"subOperationName", label:"Работа", active:true},
        {prop:"employeeFullName", label:"Водитель", active:true},
        {prop:"carDisplayString", label:"Машина", active:true},
        {prop:"instrumentName", label:"Орудие", active:true}
      ],
      works: [],
      fields: [],
      warehouses: [],
      cars: [],
      instruments: [],
      employees: [],
      organizations: [],
      filteredAssignments: [],
      item: {
        dateTimeRange: {
          start: new Date(moment().set({'year': this.$root.context.year, 'hour': 9, 'minute': 0, 'second': 0, 'millisecond': 0})),
          end: new Date(moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0}))
        },
      },
      assignmentType: null,
      isSelf: true,
      organization: this.$root.context.organization,
      filterModel: {
        from: moment().set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}),
        till: moment().set({'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999}),
        workIds: [],
        employeeIds: [],
        carIds: [],
        instrumentIds: [],
      },
      filterModelData: {
        works: [],
        employees: [],
        cars: [],
        instruments: [],
      },
      filterVisible: false,
      loading: true,
      loadingItem: {
        save: false,
      },
      lastModifiedAssignmentId: null,
      mode: "create",
    }
  },
  created() {
    this.fetchEntities([
      'works',
      'fields',
      'employeesAll',
      'carsAll',
      'instrumentsAll',
      'organizationInstruments',
      'fuelnorms',
      'warehouses',
      'organizations',
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.works = GlobalMethods.getTransportationWorks()
      this.fields = this.fromVuex('fields')
      this.warehouses = this.fromVuex('warehouses')
      this.employees = GlobalMethods.getEmployeesFilteredByOrganization(this.$root.context.organization)
      this.organizations = this.fromVuex('organizations')
      this.prepareFilter()
      this.loadAssignments()
    },
    prepareFilter() {
      this.filterModelData.works = deepClone(this.works)
      this.filterModelData.employees = this.fromVuex("employeesAll")
      this.filterModelData.cars = this.fromVuex("carsAll")
      this.filterModelData.instruments = this.fromVuex("instrumentsAll")
    },
    loadAssignments() {
      this.loading = true
      let params = this.getParams()
      http.getWithoutCache(`transportation/${params}`)
        .then(data => {
          this.setAssignments(data)
        })
        .catch((error) => {
          this.setAssignments([])
        })
    },
    getParams() {
      let params = [], query = []
      params.push(this.$root.context.organization)
      return params.join("")
    },
    setAssignments(data) {
      let assignments = data.map(a => {
        a.startDate = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
        a.endDate = moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
        let field
        if (a.assignmentType == 3) {
          field = this.fields.find(f => f.id == a.destinationFieldId)
        } else if (a.assignmentType == 4) {
          field = this.fields.find(f => f.id == a.originFieldId)
        }
        a.fieldName = field && field.newName
        let subOperation = this.works.find(w => w.id == a.subOperationId)
        a.subOperationName = subOperation && subOperation.name
        let employee = this.fromVuex("employeesAll").find(e => e.id == a.employeeId)
        a.employeeFullName = employee && employee.fullName
        let car = this.fromVuex("carsAll").find(c => c.id == a.carId)
        a.carDisplayString = car && car.displayString
        let instrument = this.fromVuex("instrumentsAll").find(i => i.id == a.instrumentId)
        a.instrumentName = instrument && instrument.displayString
        return a
      })
      .sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));
      this.filterAssignments(assignments)
    },
    filterAssignments(assignments) {
      this.filteredAssignments = assignments.filter(a => {
        let from = !this.filterModel.from || moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").isSameOrAfter(moment(this.filterModel.from))
        let till = !this.filterModel.till || moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").isSameOrBefore(moment(this.filterModel.till))
        let date = from && till
        let employee = !this.filterModel.employeeIds.length || this.filterModel.employeeIds.includes(a.employeeId)
        let work = !this.filterModel.workIds.length || this.filterModel.workIds.includes(a.subOperationId)
        let car = !this.filterModel.carIds.length || this.filterModel.carIds.includes(a.carId)
        let instrument = !this.filterModel.instrumentIds.length || this.filterModel.instrumentIds.includes(a.instrumentId)
        let cond = date && employee && work && car && instrument
        return cond
      })
      this.loading = false
    },
    showFilter() {
      this.filterVisible = true
    },
    applyFilter() {
      this.filterVisible = false
      this.loadAssignments()
    },
    clearFilter() {
      this.filterVisible = false
      this.filterModel.from = null
      this.filterModel.till = null
      this.filterModel.workIds = []
      this.filterModel.employeeIds = []
      this.filterModel.carIds = []
      this.filterModel.instrumentIds = []
      this.loadAssignments()
    },
    filterByOrg(orgId) {
      if (!orgId) {
        delete this.item.employeeId
        delete this.item.carId
        delete this.item.instrumentId
        return;
      }
      this.employees = GlobalMethods.getEmployeesFilteredByOrganization(orgId)
      if (!this.employees.map(e => e.id).includes(this.item.employeeId)) {
        delete this.item.employeeId
      }
      this.filterByWork(this.item.subOperationId)
      this.instruments = []
    },
    filterByWork(workId) {
      if (!workId) {
        delete this.item.carId
        delete this.item.originWarehouseId
        delete this.item.destinationFieldId
        delete this.item.originFieldId
        delete this.item.destinationWarehouseId
        return;
      }
      this.assignmentType = GlobalMethods.getAssignmentTypeId(workId)
      if (this.assignmentType == 3) {
        delete this.item.originFieldId
        delete this.item.destinationWarehouseId
      } else if (this.assignmentType == 4) {
        delete this.item.originWarehouseId
        delete this.item.destinationFieldId
      }
      let orgId = this.organization || this.$root.context.organization
      this.cars = GlobalMethods.getCarsFilteredByWorksAndOrganization(workId, orgId)
        .filter(c => !c.isSecurityGuard);
      if (!this.cars.map(c => c.id).includes(this.item.carId)) {
        delete this.item.carId
      }
    },
    filterByCar(carId) {
      let workId = this.item.subOperationId
      if (!carId || !workId) {
        delete this.item.instrumentId
        return;
      }
      let orgId = this.organization || this.$root.context.organization
      this.instruments = GlobalMethods.getInstrumentsFilteredByWorksAndCarsAndOrganization(workId, carId, orgId)
      if (!this.instruments.map(i => i.id).includes(this.item.instrumentId)) {
        delete this.item.instrumentId
      }
    },
    setOrganization() {
      if (this.isSelf) {
        this.organization = this.$root.context.organization
        this.filterByOrg(this.organization)
      }
    },
    refresh() {
      this.loadAssignments()
    },
    edit(id) {
      this.$el.scrollTop = 0
      this.item = deepClone(this.filteredAssignments.find(a => a.id == id))
      this.mode = "edit"
      this.findOrganizationByEmployeeId(this.item.employeeId)
    },
    findOrganizationByEmployeeId(employeeId) {
      let employee = this.fromVuex("employeesAll").find(e => e.id == employeeId)
      let organization = employee && employee.organizationId
      if (organization) {
        this.isSelf = organization == this.$root.context.organization
        this.organization = organization
      } else {
        this.isSelf = true
        this.setOrganization()
      }
    },
    switchToCreate() {
      this.reset()
    },
    submit() {
      this.save()
    },
    save() {
      this.loadingItem.save = true
      if (this.mode == "create") {
        this.create()
      } else if (this.mode == "edit") {
        this.update()
      }
    },
    create() {
      let body = deepClone(this.item)
      body.dateTimeRange.start = moment(body.dateTimeRange.start).format("YYYY-MM-DDTHH:mm:ss")
      body.dateTimeRange.end = moment(body.dateTimeRange.end).format("YYYY-MM-DDTHH:mm:ss")
      let api = GlobalMethods.getAssignmentTypeId(this.item.subOperationId) == 3 ? "ToFieldTransportation" : "FromFieldTransportation"
      this.lastModifiedAssignmentId = null
      http.post(`${api}/${this.$root.context.organization}`, body)
        .then((data) => {
          this.lastModifiedAssignmentId = data.id
          this.reset(true)
          this.refresh()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    update() {
      let body = deepClone(this.item)
      body.dateTimeRange.start = moment(body.dateTimeRange.start).format("YYYY-MM-DDTHH:mm:ss")
      body.dateTimeRange.end = moment(body.dateTimeRange.end).format("YYYY-MM-DDTHH:mm:ss")
      let api = GlobalMethods.getAssignmentTypeId(this.item.subOperationId) == 3 ? "ToFieldTransportation" : "FromFieldTransportation"
      this.lastModifiedAssignmentId = null
      http.put(`${api}/${this.$root.context.organization}`, body)
        .then(() => {
          this.lastModifiedAssignmentId = body.id
          this.reset()
          this.refresh()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    remove(id) {
      this.$confirm('Действительно удалить задание?', 'Внимание', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        http.delete("transportation", id).then(() => {
          this.reset()
          this.refresh();
        })
      })
    },
    reset(preserve) {
      this.mode = "create"
      this.loadingItem.save = false
      if (preserve) {
        this.filterModel.from = moment(this.item.dateTimeRange.start)
        this.filterModel.till = moment(this.item.dateTimeRange.end)
        delete this.item.employeeId
        delete this.item.carId
        delete this.item.instrumentId
      } else {
        this.item = {
          dateTimeRange: {
            start: new Date(moment().set({'year': this.$root.context.year, 'hour': 9, 'minute': 0, 'second': 0, 'millisecond': 0})),
            end: new Date(moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0}))
          },
        }
      }
    },
    tableRowClassName(row, index) {
      if (row.id == this.lastModifiedAssignmentId) {
        return 'edited-row';
      }
      return ''
    },
  }
}
</script>

<style lang="stylus" scoped>
.organizationToggler
  float right
  margin-right 40px
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
.form-btn
  width fit-content
.el-slider
  width 350px
</style>
