<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="visible", :title="formTitle", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item", ref="ruleForm")
    el-form-item.organizationToggler
      el-checkbox(v-model="isSelf", @change="setOrganization()") Свои
    el-form-item(label="Дата начала", prop="dateTimeRange.start")
      el-date-picker(v-model="item.dateTimeRange.start", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Дата завершения", prop="dateTimeRange.end")
      el-date-picker(v-model="item.dateTimeRange.end", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Работа")
      el-select(v-model="item.subOperationId", filterable, clearable, @change="filterByWork", :disabled="mode == 'edit'")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
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
    el-form-item(align="center")
      el-button.form-btn(type="primary", @click="save()", :loading="loadingItem.save") Сохранить
</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import GlobalMethods from "lib/GlobalMethods";
import moment from "moment"
import {deepClone} from "lib/utils"

export default {
  name: "TransportationForm",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
    "assignmentId": {
      type: Number,
      default: null,
    },
  },
  mixins: [
    
  ],
  data() {
    return {
      visible: false,
      works: [],
      fields: [],
      warehouses: [],
      cars: [],
      instruments: [],
      employees: [],
      organizations: [],
      item: {
        dateTimeRange: {
          start: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
          end: new Date(moment().set({"year": this.$root.context.year, "hour": 18}).startOf("hour"))
        },
      },
      assignmentType: null,
      isSelf: true,
      organization: this.$root.context.organization,
      loading: true,
      loadingItem: {
        save: false,
      },
      saved: {
        items: [],
        from: null,
        till: null,
      },
      formTitle: "Новая запись",
      mode: "create",
    }
  },
  watch: {
    ["formVisible"](val, oldVal) {
      this.visible = val
    },
    ["assignmentId"](val, oldVal) {
      if (val) {
        this.edit(val)
      } else {
        this.reset()
      }
    },
  },
  created() {
    fetchEntities([
      "works",
      "fields",
      "employeesAll",
      "carsAll",
      "instruments",
      "organizationInstruments",
      "fuelnorms",
      "warehouses",
      "organizations",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.works = GlobalMethods.getTransportationWorks()
        .map(w => {
          let startDate = GlobalMethods.getStartDateFromWorkDatesByWorkId(w.id)
          w.diff = Math.abs(new Date() - startDate)
          return w
        })
        .sort((a, b) => a.diff - b.diff);
      this.fields = fromVuex("fields")
      this.warehouses = fromVuex("warehouses")
      this.employees = GlobalMethods.getEmployeesFilteredByOrganization(this.$root.context.organization)
      this.organizations = fromVuex("organizations")
      this.$emit("ready")
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
      this.instruments = GlobalMethods.getInstrumentsFilteredByWorksAndCars(workId, carId)
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
    edit(id) {
      this.item = deepClone(fromVuex("transportation").find(t => t.id == id))
      this.formTitle = `Редактирование транспортировки №${id}`
      this.mode = "edit"
      this.findOrganizationByEmployeeId(this.item.employeeId)
      this.filterByOrg(this.organization)
      this.filterByCar(this.item.carId)
    },
    findOrganizationByEmployeeId(employeeId) {
      let employee = fromVuex("employeesAll").find(e => e.id == employeeId)
      let organization = employee && employee.organizationId
      if (organization) {
        this.isSelf = organization == this.$root.context.organization
        this.organization = organization
      } else {
        this.isSelf = true
        this.setOrganization()
      }
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
      this.saved.items = []
      this.saved.from = body.dateTimeRange.start
      this.saved.till = body.dateTimeRange.end
      http.post(`${api}/${this.$root.context.organization}`, body)
        .then((data) => {
          this.saved.items.push(data.id)
          this.loadingItem.save = false
          this.reset(true)
          this.close()
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
      this.saved.items = []
      this.saved.from = body.dateTimeRange.start
      this.saved.till = body.dateTimeRange.end
      http.put(`${api}/${this.$root.context.organization}`, body)
        .then(() => {
          this.saved.items.push(body.id)
          this.loadingItem.save = false
          this.reset()
          this.close()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    reset(preserve) {
      this.formTitle = "Новая запись"
      this.mode = "create"
      if (preserve) {
        delete this.item.employeeId
        delete this.item.carId
        delete this.item.instrumentId
      } else {
        this.item = {
          dateTimeRange: {
            start: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
            end: new Date(moment().set({"year": this.$root.context.year, "hour": 18}).startOf("hour"))
          },
        }
        this.isSelf = true
        this.setOrganization()
      }
    },
    close() {
      this.visible = false
      if (this.saved.items.length) {
        this.$emit("saved", deepClone(this.saved))
        this.saved.items = []
      }
      this.$emit("closed")
    },
    handleClose(done) {
      this.close()
      done()
    }
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
</style>
