<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Редактирование", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item", :rules="rules", ref="ruleForm")
    el-form-item.form-item-iterable(label="Поле", prop="fieldId")
      el-select(v-model.number="item.fieldId", filterable, clearable, @change="setFieldEditMaxArea")
        el-option(v-for="f in filteredEditFields", :key="f.id", :label="f.displayString", :value="f.id")
    el-form-item(:label="areaLabel", prop="area")
      el-input.form-input(type="number", v-model.number="item.area", min="0", :max="fieldMaxArea", :disabled="!item.fieldId")
    el-form-item.form-item-iterable(label="Культура", prop="cultureId")
      el-select(v-model.number="item.cultureId", filterable, clearable, @change="onCultureChange")
        el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.id")
    el-form-item.form-item-iterable(label="Сорт", prop="cultureSortId")
      el-select(v-model.number="item.cultureSortId", filterable, clearable)
        el-option(v-for="s in sortsByCulture", :key="s.id", :label="s.name", :value="s.id")
    el-form-item(:label="seedMillionNumberLabel", prop="seedMillionNumber")
      el-input.form-input(type="number", v-model.number="item.seedMillionNumber", :min="seedMillionMinNumber", :max="seedMillionMaxNumber", :step="0.05", :disabled="!isCultureFieldZone")
    el-form-item.form-item-iterable(label="Репродукция", prop="reproductionId")
      el-select(v-model.number="item.reproductionId", filterable, clearable)
        el-option(v-for="r in reproductions", :key="r.id", :label="r.name", :value="r.id")
    el-form-item.form-item-iterable(label="Конечный продукт", prop="cultureParameterId")
      el-select(v-model.number="item.cultureParameterId", filterable, clearable)
        el-option(v-for="cp in cultureparameters", :key="cp.id", :label="cp.name", :value="cp.id")
    el-form-item(label="Чистота семян")
      el-input.form-input(type="number", v-model.number="item.seedFrequency", min="0")
    el-form-item(label="Всхожесть семян")
      el-input.form-input(type="number", v-model.number="item.seedGermination", min="0")
    el-form-item(label="Масса 1000 семян")
      el-input.form-input(type="number", v-model.number="item.seedWeight", min="0")
    el-form-item(label="Расчет нормы высева(кг/га)")
      el-input.form-input(v-model="sowingNormative", readonly, disabled)
    el-form-item(label="Вторая культура")
      template(v-if="item.secondCultureId")
        el-button-group
          el-button(type="primary", @click="showSecondCulture()", icon="edit")
          el-button(type="danger", @click="removeSecondCulture()", icon="delete")
      template(v-else)
        el-button(type="primary", @click="showSecondCulture()") Добавить
    el-form-item(align="center")
      el-button-group
        el-button.form-btn(type="primary", @click="submit('ruleForm')", :loading="loadingItem.save") Сохранить
        el-button.form-btn(@click="switchToCreate()") Отменить
  seed-limits-form-second-culture(:formVisible="secondCultureVisible", :fieldId="item.fieldId", :formData="secondCulture", @save="saveSecondCulture", @close="secondCultureVisible = false")
</template>
<script>
import SeedLimitsFormMixin from "./form-mixin"
import SeedLimitsFormSecondCulture from "./form-second-culture"
import {fromVuex} from "services/RecordsLoader"
import http from "services/http"
import {deepClone} from "lib/utils"
import {uniq} from "lib/utils"

export default {
  name: "SeedLimitsFormEdit",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
    "assignmentId": {
      type: Number,
      default: null,
    },
    "dataUpdated": {
      type: Number,
      default: null,
    },
  },
  components: {
    SeedLimitsFormSecondCulture,
  },
  mixins: [
    SeedLimitsFormMixin,
  ],
  data() {
    return {
      itemClone: {},
      secondCulture: {},
      filteredEditFields: []
    }
  },
  watch: {
    ["assignmentId"](val, oldVal) {
      if (val) {
        this.edit(val)
      } else {
        this.reset()
      }
    },
    ["dataUpdated"](val, oldVal) {
      this.setFields()
    },
  },
  methods: {
    edit(id) {
      let item = deepClone(fromVuex("seedlimits").find(sl => sl.id == id))
      this.itemClone = deepClone(item)
      this.setFilteredEditFields(item.fieldId)
      this.setFieldEditMaxArea(item.fieldId)
      this.item = item
      this.filterSortsByCulture(this.item.cultureId)
    },
    setFilteredEditFields(fieldId) {
      let filteredFields = deepClone(this.filteredFields)
      let field = this.fields.find(f => f.id == fieldId)
      if (field) filteredFields.push(field)
      this.filteredEditFields = uniq(filteredFields).sort((a, b) => a.id - b.id)
    },
    setFieldEditMaxArea(fieldId) {
      if (fieldId) {
        let field = this.filteredFields.find(f => f.id == fieldId)
        this.fieldMaxArea = (field ? field.area : 0) + this.itemClone.area
      } else {
        this.fieldMaxArea = this.itemClone.area
        delete this.item.area
      }
      this.areaLabel = `Площадь (максимум ${this.fieldMaxArea}га)`
    },
    switchToCreate() {
      this.reset()
      this.close()
    },
    showSecondCulture() {
      let item = {}
      Object.keys(this.item).forEach(key => {
        if (/second/i.test(key)) {
          item[key] = this.item[key]
        }
      })
      this.secondCulture = item
      this.secondCultureVisible = true
    },
    saveSecondCulture(item) {
      Object.keys(item).forEach(key => {
        this.item[key] = item[key]
      })
    },
    removeSecondCulture() {
      let item = {}
      Object.keys(this.item).forEach(key => {
        if (!/second/i.test(key)) {
          item[key] = this.item[key]
        }
      })
      this.item = item
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
      let body = deepClone(this.item)
      this.saved.items = []
      http.put(`seedlimits/${this.$root.context.organization}`, body)
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
    reset() {
      this.item = {}
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
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
.form-btn
  width fit-content
.el-slider
  width 350px
.form-input
  width 193px
  max-width 193px
.tags
  margin -10px -5px 15px -3px
  .el-tag
    margin 3px
</style>
