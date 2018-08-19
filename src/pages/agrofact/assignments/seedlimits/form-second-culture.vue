<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Вторая культура", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item", :rules="rules", ref="ruleForm")
    el-form-item.form-item-iterable(label="Культура", prop="secondCultureId")
      el-select(v-model.number="item.secondCultureId", filterable, clearable, @change="onCultureChange")
        el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.id")
    el-form-item.form-item-iterable(label="Сорт", prop="secondCultureSortId")
      el-select(v-model.number="item.secondCultureSortId", filterable, clearable)
        el-option(v-for="s in sortsByCulture", :key="s.id", :label="s.name", :value="s.id")
    el-form-item(:label="seedMillionNumberLabel", prop="secondSeedMillionNumber")
      el-input.form-input(type="number", v-model.number="item.secondSeedMillionNumber", :min="seedMillionMinNumber", :max="seedMillionMaxNumber", :step="0.05", :disabled="!isCultureFieldZone")
    el-form-item.form-item-iterable(label="Репродукция", prop="secondReproductionId")
      el-select(v-model.number="item.secondReproductionId", filterable, clearable)
        el-option(v-for="r in reproductions", :key="r.id", :label="r.name", :value="r.id")
    el-form-item.form-item-iterable(label="Конечный продукт", prop="secondCultureParameterId")
      el-select(v-model.number="item.secondCultureParameterId", filterable, clearable)
        el-option(v-for="cp in cultureparameters", :key="cp.id", :label="cp.name", :value="cp.id")
    el-form-item(label="Чистота семян")
      el-input.form-input(type="number", v-model.number="item.secondSeedFrequency", min="0")
    el-form-item(label="Всхожесть семян")
      el-input.form-input(type="number", v-model.number="item.secondSeedGermination", min="0")
    el-form-item(label="Масса 1000 семян")
      el-input.form-input(type="number", v-model.number="item.secondSeedWeight", min="0")
    el-form-item(label="Расчет нормы высева(кг/га)")
      el-input.form-input(v-model="sowingNormative", readonly, disabled)
    el-button.form-btn(type="primary", @click="submit('ruleForm')") Сохранить
</template>
<script>
import {deepClone} from "lib/utils"
import {fromVuex} from "services/RecordsLoader"

export default {
  name: "SeedLimitsFormSecondCulture",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
    "fieldId": {
      type: Number,
      default: null,
    },
    "formData": {
      type: Object,
      default: {},
    },
  },
  data() {
    var validateSeedMillionNumber = (rule, value, callback) => {
      if (value === undefined) {
        callback();
      } else {
        if (isNaN(value) || !/^(\d+)(\.\d+)?(\d*)$/.test(value)) {
          callback(new Error("Пожалуйста введите положительное число"));
        } else {
          if (!(value >= this.seedMillionMinNumber && value <= this.seedMillionMaxNumber)) {
            callback(new Error(`мин:${this.seedMillionMinNumber}, макс:${this.seedMillionMaxNumber}`));
          } else {
            callback();
          }
        }
      }
    };
    return {
      item: {},
      fields: [],
      cultures: [],
      sorts: [],
      reproductions: [],
      culturefieldzones: [],
      culturerotation: [],
      cultureparameters: [],
      sortsByCulture: [],
      seedMillionMinNumber: 0,
      seedMillionMaxNumber: 0,
      seedMillionNumberLabel: "Норма млн/га",
      isCultureFieldZone: null,
      rules: {
        "secondSeedMillionNumber": [
          {validator: validateSeedMillionNumber, trigger: "blur"}
        ],
        "secondCultureId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        "secondCultureSortId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        "secondReproductionId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
      },
    }
  },
  watch: {
    formData(val) {
      if (val) {
        this.item = deepClone(val)
        this.filterSortsByCulture(this.item.secondCultureId)
      } else {
        this.item = {}
      }
    },
    fieldAndCulture() {
      if (this.fieldId && this.item.secondCultureId) {
        if (this.culturefieldzones.length) this.setSeedMillionBounds(this.fieldId, this.item.secondCultureId)
        this.checkCultureRotation(this.fieldId, this.item.secondCultureId)
      } else {
        this.resetSMB()
      }
    },
  },
  computed: {
    fieldAndCulture() {
      return [this.fieldId, this.item.secondCultureId].join()
    },
    sowingNormative() {
      let sowingNormative = Math.round((this.item.secondSeedMillionNumber * this.item.secondSeedWeight * 100) / (this.item.secondSeedGermination * this.item.secondSeedFrequency / 100))
      if (Number.isFinite(sowingNormative)) return sowingNormative
      return ""
    },
  },
  created() {
    this.fields = fromVuex("fields")
    this.cultures = fromVuex("cultures")
    this.sorts = fromVuex("sorts")
    this.reproductions = fromVuex("reproductions")
    this.culturefieldzones = fromVuex("culturefieldzones")
    this.culturerotation = fromVuex("culturerotation")
    this.cultureparameters = fromVuex("cultureparameters")
  },
  methods: {
    onCultureChange(cultureId) {
      if (cultureId == 17) {
        delete this.item.secondCultureSortId
        this.item.secondCultureSortId = 41
        delete this.item.secondReproductionId
        this.item.secondReproductionId = 9
        delete this.item.secondSeedFrequency
        this.item.secondSeedFrequency = 0
        delete this.item.secondSeedGermination
        this.item.secondSeedGermination = 0
        delete this.item.secondSeedWeight
        this.item.secondSeedWeight = 0
      }
      this.filterSortsByCulture(cultureId)
    },
    filterSortsByCulture(cultureId) {
      let sortsByCulture = this.sorts.filter(s => s.cultureId == cultureId)
      this.sortsByCulture = deepClone(sortsByCulture)
    },
    setSeedMillionBounds(fieldId, cultureId) {
      let field = this.fields.find(f => f.id == fieldId)
      let fieldZoneId = field ? field.fieldZoneId : null
      let cultureFieldZone = this.culturefieldzones.find(cfz => cfz.cultureId == cultureId && cfz.fieldZoneId === fieldZoneId)
      if (cultureFieldZone) {
        this.seedMillionMinNumber = cultureFieldZone.minNumber
        this.seedMillionMaxNumber = cultureFieldZone.maxNumber
        this.seedMillionNumberLabel = `Норма млн/га(${this.seedMillionMinNumber} - ${this.seedMillionMaxNumber})`
        this.isCultureFieldZone = true
      } else {
        this.resetSMB()
        this.$message({
          message: "Норма млн/га не найден в справочнике - редактирование невозможно",
          type: "warning",
          duration: 5000,
        });
      }
    },
    resetSMB() {
      this.seedMillionMinNumber = 0
      this.seedMillionMaxNumber = 0
      this.seedMillionNumberLabel = "Норма млн/га"
      this.isCultureFieldZone = false
      delete this.item.secondSeedMillionNumber
    },
    getPrevYearCultures(fieldId) {
      return fromVuex("prevseedlimits")
        .filter(ps => ps.fieldId == fieldId)
        .map(ps => ps.cultureId)
    },
    checkCultureRotation(fieldId, cultureId) {
      let msg = ""
      let cultureRotation = this.culturerotation.find(c => c.cultureId == cultureId)
      if (cultureRotation) {
        let prevYearCultures = this.getPrevYearCultures(fieldId)
        prevYearCultures.forEach(pyc => {
          let fl = cultureRotation.forbiddenList.includes(pyc)
          let nrl = cultureRotation.notRecommendedList.includes(pyc)
          msg = fl ? "Запрещено. Нарушение ротации.": nrl ? "Не рекомендуется. Нарушение ротации." : ""
        })
      }
      if (msg) {
        this.$message({message: msg, type: "warning", duration: 5000});
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
      this.$emit("save", deepClone(this.item))
      this.close()
    },
    reset() {
      this.item = {}
    },
    close() {
      this.reset()
      this.$emit("close")
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
