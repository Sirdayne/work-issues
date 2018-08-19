import {fromDot} from "lib/utils"

export default {
  created() {
    this.resetFilter()
  },
  data() {
    return {
      filterUnfolded: false,
      filterModel: null,
      appliedFilter: null
    }
  },
  methods: {
    setFilter() {
      this.appliedFilter = JSON.parse(JSON.stringify(this.filterModel))
      this.filterUnfolded = false
    },
    initFilter() {
      return {}
    },
    resetFilter() {
      this.appliedFilter = null
      this.filterModel = this.initFilter()
      this.filterUnfolded = false
    },
    filterFunc() {
      return null
    },
    filter(data) {
      if (!this.appliedFilter) return data
      Object.keys(this.appliedFilter).forEach(key => {
        const equalTo = this.appliedFilter[key]
        const equalFunc =
          (equalTo === "" || equalTo.constructor === Array && equalTo.length === 0)?
            () => true :
            null
          || this.filterFunc(key)
          || ( (a, b) => a.toLowerCase().includes(b.toLowerCase()) )
        data = data.filter(item => equalFunc(fromDot(item, key), equalTo))
      })
      return data
    }
  }
}
