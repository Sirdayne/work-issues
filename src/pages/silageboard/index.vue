<template lang="pug">
.cols
  el-menu.sidebar(
    unique-opened=true,
    :defaultActive="defaultActive",
    v-if="sidebarToggleState"
  )
    router-link(:to="`/balanszerna/silageboard?path=organization`")
      el-menu-item(:index="`1`") Организация
    router-link(:to="`/balanszerna/silageboard?path=tok`")
      el-menu-item(:index="`2`") ТОК
  .workspace
    template
</template>

<script>
export default {
  data() {
    return {
      path: 'organization',
      defaultActive: "1",
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    }
  },
  created() {
    this.path = (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'organization'
    this.defaultActive = this.path
    this.defineActiveLink()
  },
  watch: {
    ['$route.params.id'] (val) {
      // TODO !! Fast fix
      location.reload()
    },
    ['$route.fullPath'] (val) {
      this.path =  (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'silageboard'
    }
  },
  methods: {
    defineActiveLink() {
      switch(this.defaultActive) {
        case 'organization' :
          this.defaultActive = "1"
          break
        case 'tok' :
          this.defaultActive = "2"
          break
        default :
          this.defaultActive = "1"
      }
    }
  }
}
</script>
