export default {
  data() {
    return {
      perPage: 10,
      currentPage: 1
    }
  },
  methods: {
    onCurrentPageChange(num) {
      this.currentPage = num
    },
    onPerPageChange(num) {
      this.perPage = num
    },
    paginate(arr) {
      const startPos = (this.currentPage - 1) * this.perPage
      return arr.slice(startPos, startPos + this.perPage)
    }
  }
}
