export default {
  data() {
    return {
      threat: {
        weedTypeId: null,
        weedAmount: null,
        weedsGrowingPhases: null,
        insectId: null,
        insectLevel: null,
        diseaseId: null,
        diseaseLevel: null,
      },
    }
  },
  methods: {
    updateThreatForEdit() {
      this.nullThreats()
      if (this.form.fieldsThreat.insectThreat) {
        this.threat.insectId = this.form.fieldsThreat.insectThreat.insectId
        this.threat.insectLevel = this.form.fieldsThreat.insectThreat.threatLevel
      }
      if (this.form.fieldsThreat.diseaseThreat) {
        this.threat.diseaseId = this.form.fieldsThreat.diseaseThreat.diseaseId
        this.threat.diseaseLevel = this.form.fieldsThreat.diseaseThreat.threatLevel
      }
      if (this.form.fieldsThreat.weedThreat) {
        this.threat.weedTypeId = this.form.fieldsThreat.weedThreat.weedTypeId
        this.threat.weedsGrowingPhases = this.form.fieldsThreat.weedThreat.weedsGrowingPhases
        this.threat.weedAmount = this.form.fieldsThreat.weedThreat.amount
      }
    },
    checkThreats(){
      if (this.threat.weedTypeId && this.threat.weedAmount && this.threat.weedsGrowingPhases){
        this.form.fieldsThreat.weedThreat = {}
        this.form.fieldsThreat.weedThreat.weedTypeId = this.threat.weedTypeId
        this.form.fieldsThreat.weedThreat.amount = this.threat.weedAmount
        this.form.fieldsThreat.weedThreat.weedsGrowingPhases = this.threat.weedsGrowingPhases
      }
      if (this.threat.insectId && this.threat.insectLevel){
        this.form.fieldsThreat.insectThreat = {}
        this.form.fieldsThreat.insectThreat.insectId = this.threat.insectId
        this.form.fieldsThreat.insectThreat.threatLevel = this.threat.insectLevel
      }
      if (this.threat.diseaseId && this.threat.diseaseLevel){
        this.form.fieldsThreat.diseaseThreat = {}
        this.form.fieldsThreat.diseaseThreat.diseaseId = this.threat.diseaseId
        this.form.fieldsThreat.diseaseThreat.threatLevel = this.threat.diseaseLevel
      }
    },
    nullThreats(){
      for (let item in this.threat){
        this.threat[item] = null
      }
    },
  }
}
