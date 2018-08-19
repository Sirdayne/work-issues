import {fromVuex} from "services/RecordsLoader"

export default {
  mixins: [

  ],
  data() {
    return {
      grainprocessingtypes: [],
      equipments: [],
      inventoryanalysiscardsbefore: [],
      inventoryanalysiscardsafter: [],
      loadingItem: {
        save: false,
      },
      saved: {
        items: [],
      },
    }
  },
  created() {
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.grainprocessingtypes = fromVuex("grainprocessingtypes")
      this.equipments = fromVuex("equipments")
      this.inventoryanalysiscardsbefore = fromVuex("inventoryanalysiscards").filter(i => i.analysisCardType == 3)
      this.inventoryanalysiscardsafter = fromVuex("inventoryanalysiscards").filter(i => i.analysisCardType == 4)
    },
    submit() {
      this.save()
    },
  }
}
