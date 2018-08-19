export default {
  methods: {
    getIdFromLabel(stroke) {
      let found = this.cols.find(col => col.label === stroke)
      let elem = found ? found.id : 0
      return elem
    }
  }
}
