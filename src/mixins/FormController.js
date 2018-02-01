export default {
  created() {
    this.preinitForm(this.$route.params.id)
  },
  data() {
    return {
      notFound: false
    }
  },
  watch: {
    '$route.params.id' (to) {
      this.preinitForm(to)
    }
  },
  methods: {
    preinitForm(id) {
      this.notFound = false
      if (id === undefined) {
        this.resetForm()
        return
      }
      id = parseInt(id)
      this.initForm(id)
    }
  }
}
