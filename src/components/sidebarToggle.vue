<template lang="pug">
div(v-show="isSidebarToggleVisible && !$root.isWaiting")
  transition(name="slide-fade", mode="out-in", appear)
    el-button(v-if="sidebarToggleState === true", key="open", class="sidebar-toggle open", @click="toggleSidebar()") #[i.el-icon-caret-left]
    el-button(v-else, class="sidebar-toggle closed", key="close", @click="toggleSidebar()") #[i.el-icon-caret-right]
</template>

<script>
export default {
  computed: {
    isSidebarToggleVisible() {
      let path = this.$route.path ? this.$route.path : ""
      if (!path || path === "/") return false
      let doNotShowSidebar = [
        "/login",
        "/logout",
        "/modules-tree",
        "/agrofact/news",
        "/agroplan/news",
        "/agroplan/sowings",
        "/agroplan/recipes",
      ]
      let isVisible = !(doNotShowSidebar.some(s => new RegExp("^" + s).test(path)))
      isVisible = isVisible && (this.$root.module != "agrostream")
      return isVisible
    },
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState
    },
  },
  methods: {
    toggleSidebar() {
      this.$store.dispatch("actionSetSidebarToggleState", !this.sidebarToggleState);
    },
  },
}
</script>

<style lang="stylus" scoped>
.sidebar-toggle
  position fixed
  top calc(200px + 60px)
  background #eef1f6
  border 1px solid #e4e8f1
  border-left none
  border-radius 0 7px 7px 0
  width 15px
  height 60px
  font-size 0.7rem
  padding 0
  z-index 401
  &.open
    left 330px
  &.closed
    left 0px
</style>
