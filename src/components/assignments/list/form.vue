<template lang="pug">
el-dialog(:visible="visible", :title="formTitle", size="tiny", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item", :rules="rules", ref="ruleForm")
    el-form-item.organizationToggler
      el-checkbox(v-model="isSelf", @change="setOrganization()") Свои
    el-form-item(label="Дата начала", prop="dateTimeRange.start")
      el-date-picker(v-model="item.dateTimeRange.start", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Дата завершения", prop="dateTimeRange.end")
      el-date-picker(v-model="item.dateTimeRange.end", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Работа")
      el-select(v-model="item.subOperationId", filterable, clearable, @change="filterByWork", :disabled="mode == 'edit'")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    template(v-if="isFields")
      el-form-item.form-item-iterable(label="Поле")
        el-select(v-model="item.fieldId", filterable, clearable, :multiple="mode == 'create'")
          el-option(v-for="f in fields", :key="f.id", :label="f.newName", :value="f.id")
    template(v-else)
      el-form-item.form-item-iterable(label="Посев")
        el-select(v-model="item.seedLimitId", filterable, clearable, :multiple="mode == 'create'", @change="setDepthBounds")
          el-option(v-for="s in seedlimits", :key="s.id", :label="s.displayString", :value="s.id")
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
    template(v-if="isSpecificYield")
      el-form-item(label="Видовая урожайность")
        el-slider(v-model="item.specificYield", :max="maxSpecificYield", show-input)
    template(v-if="isSowingWork")
      el-form-item(label="Глубина посева")
        el-slider(v-model="item.depth", :min="minDepth", :max="maxDepth", show-input)
    el-form-item(align="center")
      el-button.form-btn(type="primary", @click="submit('ruleForm')", :loading="loadingItem.save") Сохранить
</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import GlobalMethods from 'lib/GlobalMethods';
import moment from 'moment'
import {deepClone} from 'lib/utils'

export default {
  name: 'AssignmentsForm',
  props: [
    'formVisible',
    'assignmentId',
  ],
  mixins: [
    RecordsLoaderV2,
  ],
  data() {
    var validateDateStart = (rule, value, callback) => {
      if (!value) {
        this.$message('Пожалуйста выберите дату');
        this.isValid["start"] = false
        callback(new Error(" "));
      } else {
        let diff = moment(this.item.dateTimeRange.end).diff(moment(this.item.dateTimeRange.start), 'hours');
        if (diff < 0 || diff > 24) {
          this.$message('Разница между датами не должна превышать 24 часа');
          this.isValid["start"] = false
          callback(new Error(" "));
        } else {
          this.isValid["start"] = true
          if (!this.isValid["end"]) this.$refs.ruleForm.validateField("dateTimeRange.end");
          callback();
        }
      }
    };
    var validateDateEnd = (rule, value, callback) => {
      if (!value) {
        this.$message('Пожалуйста выберите дату');
        this.isValid["end"] = false
        callback(new Error(" "));
      } else {
        let diff = moment(this.item.dateTimeRange.end).diff(moment(this.item.dateTimeRange.start), 'hours');
        if (diff < 0 || diff > 24) {
          this.$message('Разница между датами не должна превышать 24 часа');
          this.isValid["end"] = false
          callback(new Error(" "));
        } else {
          this.isValid["end"] = true
          if (!this.isValid["start"]) this.$refs.ruleForm.validateField("dateTimeRange.start");
          callback();
        }
      }
    };
    return {
      visible: false,
      works: [],
      seedlimits: [],
      fields: [],
      cars: [],
      instruments: [],
      employees: [],
      organizations: [],
      item: {
        dateTimeRange: {
          start: new Date(moment().set({'year': this.$root.context.year, 'hour': 9, 'minute': 0, 'second': 0, 'millisecond': 0})),
          end: new Date(moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0}))
        },
        fieldId: [],
        seedLimitId: []
      },
      isSelf: true,
      organization: this.$root.context.organization,
      isFields: false,
      isSowingWork: false,
      minDepth: null,
      maxDepth: null,
      isSpecificYield: false,
      maxSpecificYield: null,
      loadingItem: {
        save: false,
      },
      rules: {
        "dateTimeRange.start": [
          {validator: validateDateStart}
        ],
        "dateTimeRange.end": [
          {validator: validateDateEnd}
        ],
      },
      isValid: {},
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
    ['formVisible'](val, oldVal) {
      this.visible = val
    },
    ['assignmentId'](val, oldVal) {
      if (val) {
        this.edit(val)
      } else {
        this.reset()
      }
    },
  },
  created() {
    this.fetchEntities([
      'works',
      'fields',
      'seedlimits',
      'employeesAll',
      'carsAll',
      'instrumentsAll',
      'organizationInstruments',
      'culturedepths',
      'fuelnorms',
      'workTypes',
      'workdates',
      'organizations',
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.works = GlobalMethods.getAssignmentsWorks().map(w => {
        let startDate = GlobalMethods.getStartDateFromWorkDatesByWorkId(w.id)
        w.diff = Math.abs(new Date() - w.startDate)
        return w
      })
      .sort((a, b) => a.diff - b.diff);
      this.fields = this.fromVuex('fields')
      this.seedlimits = this.fromVuex('seedlimits')
      this.employees = GlobalMethods.getEmployeesFilteredByOrganization(this.$root.context.organization)
      this.organizations = this.fromVuex('organizations')
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
      this.setFieldWorkIndicator(workId)
      this.setSowingWorkIndicator(workId)
      this.setSpecificYieldIndicator(workId)
      if (!workId) {
        delete this.item.carId
        return;
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
    setFieldWorkIndicator(workId) {
      this.isFields = workId ? this.works.find(w => w.id == workId).assignmentType != 1 : false
    },
    setSowingWorkIndicator(workId) {
      if (workId) {
        this.isSowingWork = this.works.find(w => w.id == workId).planWorkTypeIsSowing
        if (this.isSowingWork) {
          let cultureDepths = GlobalMethods.getMinMaxOfSowingDepths(this.item.seedLimitId);
          this.minDepth = cultureDepths.minDepth;
          this.maxDepth = cultureDepths.maxDepth;
        } else {
          this.minDepth = null;
          this.maxDepth = null;
        }
      } else {
        this.isSowingWork = false
      }
    },
    setDepthBounds(seedLimitId) {
      let id = Array.isArray(seedLimitId) ? seedLimitId[0] : seedLimitId
      let cultureDepths = GlobalMethods.getMinMaxOfSowingDepths(id);
      this.minDepth = cultureDepths.minDepth;
      this.maxDepth = cultureDepths.maxDepth;
    },
    setSpecificYieldIndicator(workId) {
      if (workId) {
        let planWorkTypeId = GlobalMethods.getPlanWorkTypeIdByWorkId(workId);
        this.isSpecificYield = GlobalMethods.getWorkTypesIdsByConditionType(2).includes(planWorkTypeId);
        if (this.isSpecificYield) {
          this.maxSpecificYield = 100
        } else {
          this.maxSpecificYield = null
        }
      } else {
        if (this.item.hasOwnProperty("specificYield")) {
          delete this.item.specificYield
        }
      }
    },
    edit(id) {
      this.item = deepClone(this.fromVuex("assignments").find(a => a.id == id))
      this.formTitle = `Редактирование задания №${id}`
      this.mode = "edit"
      this.findOrganizationByEmployeeId(this.item.employeeId)
      this.filterByOrg(this.organization)
      this.filterByCar(this.item.carId)
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
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.save()
        }
      });
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
      let api = GlobalMethods.getAssignmentTypeByAssignmentTypeId(GlobalMethods.getAssignmentTypeId(this.item.subOperationId)).value + 's'
      let requests = []
      this.saved.items = []
      this.saved.from = body.dateTimeRange.start
      this.saved.till = body.dateTimeRange.end
      if (body.fieldId.length) {
        body.fieldId.forEach(fieldId => {
          let bodyClone = deepClone(body)
          bodyClone.fieldId = fieldId
          let request = new Promise((resolve, reject) => {
            http.post(`${api}/${this.$root.context.organization}`, bodyClone)
              .then((data) => {
                this.saved.items.push(data.id)
                resolve()
              })
              .catch(() => reject())
          });
          requests.push(request)
        })
      } else if (body.seedLimitId.length) {
        body.seedLimitId.forEach(seedLimitId => {
          let bodyClone = deepClone(body)
          bodyClone.seedLimitId = seedLimitId
          let request = new Promise((resolve, reject) => {
            http.post(`${api}/${this.$root.context.organization}`, bodyClone)
              .then((data) => {
                this.saved.items.push(data.id)
                resolve()
              })
              .catch(() => reject())
          });
          requests.push(request)
        })
      }
      http.all(requests)
        .then(() => {
          this.loadingItem.save = false
          this.reset(true)
          this.close()
        })
    },
    update() {
      let body = deepClone(this.item)
      body.dateTimeRange.start = moment(body.dateTimeRange.start).format("YYYY-MM-DDTHH:mm:ss")
      body.dateTimeRange.end = moment(body.dateTimeRange.end).format("YYYY-MM-DDTHH:mm:ss")
      let api = GlobalMethods.getAssignmentTypeByAssignmentTypeId(GlobalMethods.getAssignmentTypeId(this.item.subOperationId)).value + 's'
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
        delete this.item.specificYield
        delete this.item.depth
      } else {
        this.item = {
          dateTimeRange: {
            start: new Date(moment().set({'year': this.$root.context.year, 'hour': 9, 'minute': 0, 'second': 0, 'millisecond': 0})),
            end: new Date(moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0}))
          },
          fieldId: [],
          seedLimitId: []
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
.el-slider
  width 350px
</style>
