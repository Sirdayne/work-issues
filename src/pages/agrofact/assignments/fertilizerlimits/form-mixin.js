import {fromVuex} from "services/RecordsLoader"
import moment from "moment"
import {deepClone} from "lib/utils"

export default {
  data() {
    var validateDate = (rule, value, callback) => {
      if (value) {
        if (moment(value).year() != this.$root.context.year) {
          this.$message({
            message: `Контекст года: ${this.$root.context.year}. Год должен совпадать с годом в контексте`,
            duration: 5000,
          });
          this.isValid["date"] = false
          callback(new Error(" "));
        } else {
          this.isValid["date"] = true
          callback();
        }
      }
    };
    var validateNormative = (rule, value, callback) => {
      if (value === undefined) {
        this.isValid.normative = false
        callback(new Error("Пожалуйста введите значение"));
      } else {
        if (isNaN(value) || !/^(\d+)(\.\d+)?(\d*)$/.test(value)) {
          this.isValid.normative = false
          callback(new Error("Пожалуйста введите положительное число"));
        } else {
          if (!(value >= this.minNorm && value <= this.maxNorm)) {
            this.isValid.normative = false
            callback(new Error(`мин:${this.minNorm}, макс:${this.maxNorm}`));
          } else {
            this.isValid.normative = true
            callback();
          }
        }
      }
    };
    return {
      chemicalpreparations: [],
      reproductions: [],
      seedlimits: [],
      filteredSeedlimits: [],
      works: [],
      item: {
        chemistryChemicalTreatments: [{}],
      },
      saved: {
        items: [],
      },
      loadingItem: {
        save: false,
      },
      minNorm: null,
      maxNorm: null,
      rules: {
        "date": [
          {validator: validateDate}
        ],
        "chemistryChemicalTreatments[0].normative": [
          {validator: validateNormative, trigger: "blur"}
        ],
      },
      isValid: {},
    }
  },
  created() {
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.chemicalpreparations = fromVuex("chemicalpreparations").filter(cp => cp.isMacrofertilizer);
      this.works = fromVuex("works").filter(w => w.isMacrofertilizer)
      this.seedlimits = fromVuex("seedlimits")
    },
    filterSeedlimitsByWork(workId) {
      if (workId) {
        let seedlimitsByWork = fromVuex("chemistrylimits")
          .filter(cl => cl.workTypeParameterPlanWorkTypeId == workId)
          .map(cl => cl.seedLimitId)
        this.filteredSeedlimits = this.seedlimits.filter(s => !seedlimitsByWork.includes(s.id))
      } else {
        this.filteredSeedlimits = []
      }
    },
    extractExtraInfoFromSeedlimit(seedLimitId) {
      if (!seedLimitId) {
        return;
      }
      let seedlimit = deepClone(this.seedlimits).find(s => s.id == seedLimitId);
      this.item.fieldArea = seedlimit.area;
      this.item.fieldName = seedlimit.fieldName;
      this.item.cultureName = seedlimit.cultureName;
    },
    addToCCP(initial) {
      if (!initial) {
        this.$refs.ruleForm.validateField("chemistryChemicalTreatments[0].normative");
      }
      if (this.isValid.normative || initial) {
        this.item.chemistryChemicalTreatments.splice(0, 0, {})
      }
    },
    removeCP(index) {
      this.item.chemistryChemicalTreatments.splice(index, 1)
    },
    getCPName(id) {
      let chemicalpreparation = this.chemicalpreparations.find(сp => сp.id === id)
      let name = chemicalpreparation && chemicalpreparation.name || "Не выбрано"
      return name
    },
    setNormative() {
      let cct = this.item.chemistryChemicalTreatments[0]
      let cpId = cct.chemicalPreparationId
      if (cpId) {
        let chemicalpreparation = this.chemicalpreparations.find(cp => cp.id == cpId)
        let cp = deepClone(chemicalpreparation)
        this.minNorm = cp.minNorm || 0
        this.maxNorm = cp.maxNorm || Number.MAX_SAFE_INTEGER
        cct.normative = cp && cp.minNorm || 0
      }
    },
  }
}
