<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Новая запись", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item", :rules="rules", ref="ruleCreateForm")
    el-form-item.organizationToggler
      el-checkbox(v-model="isSelf", @change="setOrganization()") Свои
    el-form-item(label="Дата начала", prop="dateTimeRange.start")
      el-date-picker(v-model="item.dateTimeRange.start", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Дата завершения", prop="dateTimeRange.end")
      el-date-picker(v-model="item.dateTimeRange.end", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Работа", prop="subOperationId")
      el-select(v-model.number="item.subOperationId", filterable, clearable, @change="filterByWork")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    template(v-if="isFields")
      el-form-item.form-item-iterable(label="Поле", prop="fieldId")
        el-select(v-model="item.fieldId", filterable, clearable, multiple)
          el-option(v-for="f in fields", :key="f.id", :label="f.newName", :value="f.id")
    template(v-else)
      el-form-item.form-item-iterable(label="Посев", prop="seedLimitId")
        el-select(v-model="item.seedLimitId", filterable, clearable, multiple, @change="setDepthBounds")
          el-option(v-for="s in seedlimits", :key="s.id", :label="s.displayString", :value="s.id", :title="`Сорт: ${s.cultureSortName}\nРепродукция: ${s.reproductionName}`")
    template(v-if="!isSelf")
      el-form-item.form-item-iterable(label="Организация")
        el-select(v-model="organization", placeholder="Организация", @change="filterByOrg", filterable, clearable)
          el-option(v-for="o in organizations", :label="o.name", :value="o.id", :key="o.id")
    el-form-item.form-item-iterable(label="Водитель")
      el-select(v-model="item.employeeId", filterable, clearable)
        el-option(v-for="e in employees", :label="e.fullName", :value="e.id", :key="e.id")
    el-form-item.form-item-iterable(label="Машина", prop="carId")
      el-select(v-model.number="item.carId", filterable, clearable, @change="filterByCar")
        el-option(v-for="c in cars", :label="c.displayString", :value="c.id", :key="c.id")
    el-form-item.form-item-iterable(label="Орудие", prop="instrumentId")
      el-select(v-model.number="item.instrumentId", filterable, clearable)
        el-option(v-for="i in instruments", :label="i.displayString", :value="i.id", :key="i.id")
    template(v-if="isSpecificYield")
      el-form-item(label="Видовая урожайность")
        el-slider(v-model="item.specificYield", :max="maxSpecificYield", show-input)
    template(v-if="isSowingWork")
      el-form-item(label="Глубина посева")
        el-slider(v-model="item.depth", :min="minDepth", :max="maxDepth", show-input)
    template(v-if="isWorkingFluidConsumptionRate")
      el-form-item(label="Норма расхода рабочей жидкости")
        el-slider(v-model="item.workingFluidConsumptionRate", :max="maxWorkingFluidConsumptionRate", show-input)
    el-form-item(align="center")
      el-button.form-btn(type="primary", @click="submit('ruleCreateForm')", :loading="loadingItem.save") Сохранить
</template>

<script>
import AssignmentsFormMixin from "./form-mixin"
import http from "services/http"
import GlobalMethods from "lib/GlobalMethods";
import {deepClone} from "lib/utils"
import moment from "moment"

export default {
  name: "AssignmentsFormCreate",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
  },
  mixins: [
    AssignmentsFormMixin
  ],
  data() {
    var validateDateStart = (rule, value, callback) => {
      if (!value) {
        this.$message("Пожалуйста выберите дату");
        this.isValid["start"] = false
        callback(new Error(" "));
      } else {
        let diff = moment(this.item.dateTimeRange.end).diff(moment(this.item.dateTimeRange.start), "hours");
        if (moment(value).year() != this.$root.context.year) {
          this.$message({
            message: `Контекст года: ${this.$root.context.year}. Год должен совпадать с годом в контексте`,
            duration: 5000,
          });
          this.isValid["start"] = false
          callback(new Error(" "));
        } else if (diff < 0 || diff > 24) {
          this.$message("Разница между датами не должна превышать 24 часа");
          this.isValid["start"] = false
          callback(new Error(" "));
        } else {
          this.isValid["start"] = true
          if (!this.isValid["end"]) this.$refs.ruleCreateForm.validateField("dateTimeRange.end");
          callback();
        }
      }
    };
    var validateDateEnd = (rule, value, callback) => {
      if (!value) {
        this.$message("Пожалуйста выберите дату");
        this.isValid["end"] = false
        callback(new Error(" "));
      } else {
        let diff = moment(this.item.dateTimeRange.end).diff(moment(this.item.dateTimeRange.start), "hours");
        if (moment(value).year() != this.$root.context.year) {
          this.$message({
            message: `Контекст года: ${this.$root.context.year}. Год должен совпадать с годом в контексте`,
            duration: 5000,
          });
          this.isValid["end"] = false
          callback(new Error(" "));
        } else if (diff < 0 || diff > 24) {
          this.$message("Разница между датами не должна превышать 24 часа");
          this.isValid["end"] = false
          callback(new Error(" "));
        } else {
          this.isValid["end"] = true
          if (!this.isValid["start"]) this.$refs.ruleCreateForm.validateField("dateTimeRange.start");
          callback();
        }
      }
    };
    return {
      rules: {
        "dateTimeRange.start": [
          {validator: validateDateStart}
        ],
        "dateTimeRange.end": [
          {validator: validateDateEnd}
        ],
        "subOperationId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        "fieldId": [{type: "array", required: true, message: "Выберите значение", trigger: "change"}],
        "seedLimitId": [{type: "array", required: true, message: "Выберите значение", trigger: "change"}],
        "carId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        "instrumentId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
      },
      isValid: {},
      item: {
        dateTimeRange: {
          start: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
          end: new Date(moment().set({"year": this.$root.context.year, "hour": 18}).startOf("hour"))
        },
        fieldId: [],
        seedLimitId: []
      },
    }
  },
  created() {
  },
  methods: {
    setFieldWorkIndicator(workId) {
      if (workId) {
        let isFields = this.works.find(w => w.id == workId).assignmentType != 1
        if (isFields) {
          delete this.item.seedLimitId
          this.$set(this.item, "fieldId", [])
        } else {
          delete this.item.fieldId
          this.$set(this.item, "seedLimitId", [])
        }
        this.isFields = isFields
      } else {
        delete this.item.fieldId
        this.$set(this.item, "seedLimitId", [])
        this.isFields = false
      }
    },
    save() {
      this.loadingItem.save = true
      this.create()
    },
    create() {
      let body = deepClone(this.item)
      body.dateTimeRange.start = moment(body.dateTimeRange.start).format("YYYY-MM-DDTHH:mm:ss")
      body.dateTimeRange.end = moment(body.dateTimeRange.end).format("YYYY-MM-DDTHH:mm:ss")
      let api = GlobalMethods.getAssignmentTypeByAssignmentTypeId(GlobalMethods.getAssignmentTypeId(this.item.subOperationId)).value + "s"
      this.saved.items = []
      this.saved.from = body.dateTimeRange.start
      this.saved.till = body.dateTimeRange.end
      let promises = this.getPromises(api, body)
      http.all(promises)
        .then(() => {
          this.loadingItem.save = false
          this.reset()
          this.close()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    getPromises(api, body) {
      let promises = [], promise, bodyClone
      if (body.fieldId && body.fieldId.length) {
        body.fieldId.forEach(fieldId => {
          bodyClone = deepClone(body)
          bodyClone.fieldId = fieldId
          promise = new Promise((resolve, reject) => {
            http.post(`${api}/${this.$root.context.organization}`, bodyClone)
              .then((data) => {
                this.saved.items.push(data.id)
                resolve()
              })
              .catch(() => reject())
          });
          promises.push(promise)
        })
      } else if (body.seedLimitId && body.seedLimitId.length) {
        body.seedLimitId.forEach(seedLimitId => {
          bodyClone = deepClone(body)
          bodyClone.seedLimitId = seedLimitId
          promise = new Promise((resolve, reject) => {
            http.post(`${api}/${this.$root.context.organization}`, bodyClone)
              .then((data) => {
                this.saved.items.push(data.id)
                resolve()
              })
              .catch(() => reject())
          });
          promises.push(promise)
        })
      }
      return promises
    },
    reset() {
      delete this.item.employeeId
      delete this.item.carId
      delete this.item.instrumentId
      delete this.item.specificYield
      delete this.item.depth
    },
    close() {
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
