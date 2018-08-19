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
      fields: [],
      filteredFields: [],
      weeds: [],
      item: {
        chemistryChemicalTreatments: [{}],
        chemistryLimitWeedTypes: [{}],
      },
      saved: {
        items: [],
      },
      loadingItem: {
        save: false,
      },
      minNorm: null,
      maxNorm: null,
      isFieldWork: false,
      isHerbicide: false,
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
      this.chemicalpreparations = fromVuex("chemicalpreparations").filter(cp => !cp.isMacrofertilizer);
      this.works = fromVuex("works").filter(w => w.planWorkTypeIsChemicalTreatment && !w.isMacrofertilizer)
      this.seedlimits = fromVuex("seedlimits")
      this.fields = fromVuex("fields");
      this.weeds = fromVuex("weed");
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
        this.updateCLWT()
      }
    },
    removeCP(index) {
      this.item.chemistryChemicalTreatments.splice(index, 1)
      this.updateCLWT()
    },
    getCPName(id) {
      let chemicalpreparation = this.chemicalpreparations.find(сp => сp.id === id)
      let name = chemicalpreparation && chemicalpreparation.name || "Не выбрано"
      return name
    },
    updateCLWT() {
      let isHerbicide = this.getHerbicideIndicator()
      if (this.isHerbicide != isHerbicide && !isHerbicide) {
        this.item.chemistryLimitWeedTypes = [{}]
      }
      this.isHerbicide = isHerbicide
    },
    getHerbicideIndicator() {
      let herbicideIds = this.chemicalpreparations.filter(cp => cp.chemicalPreparationTypeId == 2).map(cp => cp.id)
      return this.item.chemistryChemicalTreatments
        .map(cct => cct.chemicalPreparationId)
        .some(cctId => herbicideIds.includes(cctId))
    },
    addToCLWT() {
      this.item.chemistryLimitWeedTypes.splice(0, 0, {})
    },
    removeWeed(index) {
      this.item.chemistryLimitWeedTypes.splice(index, 1)
    },
    getWeedName(id) {
      let weed = this.weeds.find(w => w.id === id)
      let name = weed && weed.name || "Не выбрано"
      return name
    },
    setWeedAmount() {
      this.item.chemistryLimitWeedTypes[0].weedAmount = 0
    },
    setFieldWorkIndicator(workId) {
      if (workId) {
        this.isFieldWork = this.works.find(w => w.id == workId).isFieldWork
        if (this.isFieldWork) {
          delete this.item.seedLimitId
          this.filterFieldsByWork(workId)
        } else {
          delete this.item.fieldId
          this.filterSeedlimitsByWork(workId)
        }
      } else {
        this.isFieldWork = false
        delete this.item.fieldId
        this.filteredFields = []
        this.filteredSeedlimits = []
      }
    },
    filterFieldsByWork(workId) {
      let fieldsByWork = fromVuex("chemistrylimits")
        .filter(cl => cl.workTypeParameterPlanWorkTypeId == workId)
        .map(cl => cl.fieldId)
      this.filteredFields = this.fields.filter(f => !fieldsByWork.includes(f.id))
    },
    filterSeedlimitsByWork(workId) {
      let seedlimitsByWork = fromVuex("chemistrylimits")
        .filter(cl => cl.workTypeParameterPlanWorkTypeId == workId)
        .map(cl => cl.seedLimitId)
      this.filteredSeedlimits = this.seedlimits.filter(s => !seedlimitsByWork.includes(s.id))
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
