import {fromVuex} from "services/RecordsLoader"
import {deepClone} from "lib/utils"

export default {
  data() {
    var validateArea = (rule, value, callback) => {
      if (value === undefined) {
        callback(new Error("Пожалуйста введите значение"));
      } else {
        if (isNaN(value) || !/^(\d+)(\.\d+)?(\d*)$/.test(value)) {
          callback(new Error("Пожалуйста введите положительное число"));
        } else {
          if (!(value >= 0 && value <= this.fieldMaxArea)) {
            callback(new Error(`мин:0, макс:${this.fieldMaxArea}`));
          } else {
            callback();
          }
        }
      }
    };
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
      fields: [],
      filteredFields: [],
      cultures: [],
      sorts: [],
      reproductions: [],
      culturefieldzones: [],
      culturerotation: [],
      cultureparameters: [],
      sortsByCulture: [],
      item: {},
      fieldMaxArea: 0,
      seedMillionMinNumber: 0,
      seedMillionMaxNumber: 0,
      seedMillionNumberLabel: "Норма млн/га",
      areaLabel: "Площадь",
      isCultureFieldZone: null,
      secondCultureVisible: false,
      saved: {
        items: [],
      },
      loadingItem: {
        save: null,
      },
      rules: {
        "area": [
          {validator: validateArea, trigger: "blur"}
        ],
        "seedMillionNumber": [
          {validator: validateSeedMillionNumber, trigger: "blur"}
        ],
        "fieldId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        "cultureId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        "cultureSortId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        "reproductionId": [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
      },
    }
  },
  watch: {
    fieldAndCulture() {
      if (this.item.fieldId && this.item.cultureId) {
        if (this.culturefieldzones.length) this.setSeedMillionBounds(this.item.fieldId, this.item.cultureId)
        this.checkCultureRotation(this.item.fieldId, this.item.cultureId)
      } else {
        this.resetSMB()
      }
    },
  },
  computed: {
    fieldAndCulture() {
      return [this.item.fieldId, this.item.cultureId].join()
    },
    sowingNormative() {
      let sowingNormative = Math.round((this.item.seedMillionNumber * this.item.seedWeight * 100) / (this.item.seedGermination * this.item.seedFrequency / 100))
      if (Number.isFinite(sowingNormative)) return sowingNormative
      return ""
    },
  },
  created() {
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.fields = fromVuex("fields")
      this.cultures = fromVuex("cultures")
      this.sorts = fromVuex("sorts")
      this.reproductions = fromVuex("reproductions")
      this.culturefieldzones = fromVuex("culturefieldzones")
      this.culturerotation = fromVuex("culturerotation")
      this.cultureparameters = fromVuex("cultureparameters")
      this.setFields()
    },
    setFields() {
      let areas = {}
      fromVuex("seedlimits").forEach(s => {
        if (areas[s.fieldId] === undefined) areas[s.fieldId] = 0;
        areas[s.fieldId] += s.area
      })
      this.filteredFields = fromVuex("fields")
        .map(f => {
          let area = areas[f.id] || 0
          f.area -= area
          return f
        })
        .filter(f => f.area > 0)
    },
    onCultureChange(cultureId) {
      if (cultureId == 17) {
        delete this.item.cultureSortId
        this.item.cultureSortId = 41
        delete this.item.reproductionId
        this.item.reproductionId = 9
        delete this.item.seedFrequency
        this.item.seedFrequency = 0
        delete this.item.seedGermination
        this.item.seedGermination = 0
        delete this.item.seedWeight
        this.item.seedWeight = 0
      }
      this.filterSortsByCulture(cultureId)
    },
    filterSortsByCulture(cultureId) {
      let sortsByCulture = this.sorts.filter(s => s.cultureId == cultureId)
      this.sortsByCulture = deepClone(sortsByCulture)
    },
    setFieldMaxArea(fieldId) {
      if (fieldId) {
        let field = this.filteredFields.find(f => f.id == fieldId)
        this.fieldMaxArea = field ? field.area : 0
        this.areaLabel = `Площадь (осталось ${this.fieldMaxArea}га)`
      } else {
        this.fieldMaxArea = 0
        this.areaLabel = "Площадь"
        delete this.item.area
      }
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
      delete this.item.seedMillionNumber
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
  }
}
