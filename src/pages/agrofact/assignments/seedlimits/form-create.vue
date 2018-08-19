<template lang="pug">
div
  h3 Новая запись
  el-form(:inline="true", :label-position="'top'", :model="item", :rules="rules", ref="ruleForm")
    el-form-item.form-item-iterable(label="Поле", prop="fieldId")
      el-select(v-model.number="item.fieldId", filterable, clearable, @change="setFieldMaxArea")
        el-option(v-for="f in filteredFields", :key="f.id", :label="f.displayString", :value="f.id")
    el-form-item(:label="areaLabel", prop="area")
      el-input.form-input(type="number", v-model.number="item.area", min="0", :max="fieldMaxArea", :disabled="!item.fieldId")
    el-form-item.form-item-iterable(label="Культура", prop="cultureId")
      el-select(v-model.number="item.cultureId", filterable, clearable, @change="onCultureChange")
        el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.id")
    el-form-item.form-item-iterable(label="Сорт", prop="cultureSortId")
      el-select(v-model.number="item.cultureSortId", filterable, clearable)
        el-option(v-for="s in sortsByCulture", :key="s.id", :label="s.name", :value="s.id")
    div
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
    div
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
        el-button(type="primary", size="small", @click="showSecondCulture()") Добавить
    el-form-item(label="История поля")
      template(v-if="panelBottomVisible")
        el-button(type="primary", size="small", @click="panelBottomVisible = false") Скрыть
      template(v-else)
        el-button(type="primary", size="small", @click="panelBottomVisible = true", :disabled="!item.fieldId") Показать
    div
    el-button.form-btn(type="primary", @click="submit('ruleForm')", :loading="loadingItem.save") Сохранить
  seed-limits-form-second-culture(:formVisible="secondCultureVisible", :fieldId="item.fieldId", :formData="secondCulture", @save="saveSecondCulture", @close="secondCultureVisible = false")
  template(v-if="item.fieldId")
    .panel-bottom(v-show="panelBottomVisible")
      sevoborot(:fieldClickedId="item.fieldId")
      lastassignments(:fieldClickedId="item.fieldId")
</template>
<script>
import SeedLimitsFormMixin from "./form-mixin"
import SeedLimitsFormSecondCulture from "./form-second-culture"
import http from "services/http"
import {deepClone} from "lib/utils"

import sevoborot from "components/panelbottom/sevoborot"
import lastassignments from "components/panelbottom/lastassignments"

export default {
  name: "SeedLimitsFormCreate",
  props: {
    "dataUpdated": {
      type: Number,
      default: null,
    },
  },
  components: {
    SeedLimitsFormSecondCulture,
    sevoborot,
    lastassignments,
  },
  mixins: [
    SeedLimitsFormMixin,
  ],
  data() {
    return {
      secondCulture: {},
      panelBottomVisible: false,
    }
  },
  watch: {
    ["dataUpdated"](val, oldVal) {
      this.setFields()
    },
  },
  methods: {
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
      body.year = this.$root.context.year
      this.saved.items = []
      http.post(`seedlimits/${this.$root.context.organization}`, body)
        .then((data) => {
          this.saved.items.push(data.id)
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
    },
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
