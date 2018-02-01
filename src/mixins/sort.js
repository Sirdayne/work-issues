import { fromDot } from 'lib/utils'

export default {
  data() {
    return {
      sortColumn: null,
      sortDir: null
    }
  },
  methods: {
    onSort(params) {
      this.currentPage = 1
      this.sortColumn  = params.prop
      this.sortDir     = params.order
    },
    sortFunc(column) {
      return null
    },
    sort(arr) {
      if (!this.sortColumn || arr.length < 2) return arr
      return arr.sort((a, b) => {
        a = fromDot(a, this.sortColumn)
        b = fromDot(b, this.sortColumn)
        const modificator = this.sortFunc(this.sortColumn)
        if (modificator) {
          a = modificator(a)
          b = modificator(b)
        }
        return this.sortDir === 'ascending'? a > b : a < b
      })
    }
  }
}
