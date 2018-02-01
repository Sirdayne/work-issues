<template lang="pug">
.cols
  el-menu.sidebar(
    unique-opened=true,
    :defaultActive="defaultActive",
    v-if="sidebarToggleState"
  )
    router-link(:to="`/parttime?path=cleaning`")
      el-menu-item(:index="`1`") Очистка
    router-link(:to="`/parttime?path=drying`")
      el-menu-item(:index="`2`") Сушка
    router-link(:to="`/parttime?path=parttime`")
      el-menu-item(:index="`3`") Подработка
  .workspace
    template
</template>

<script>
export default {
  data() {
    return {
      path: 'cleaning',
      defaultActive: "1",
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    }
  },
  created() {
    this.path = (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'cleaning'
    this.defaultActive = this.path
    this.defineActiveLink()
  },
  watch: {
    ['$route.params.id'] (val) {
      // TODO !! Fast fix
      location.reload()
    },
    ['$route.fullPath'] (val) {
      this.path =  (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'parttime'
    }
  },
  methods: {
    defineActiveLink() {
      switch(this.defaultActive) {
        case 'cleaning' :
          this.defaultActive = "1"
          break
        case 'drying' :
          this.defaultActive = "2"
          break
        case 'parttime' :
          this.defaultActive = "3"
          break
        default :
          this.defaultActive = "1"
      }
    }
  }
}
</script>
