export default {
  created() {
    this.checkUserProfile()
    this.$router.beforeEach((to, from, next) => {
      this.checkUserProfile()
      next()
    })
  },
  methods: {
    checkUserProfile() {
      if (this.$auth.authenticated) {
        this.$root.loadUserProfile()
      }
    }
  }
}
