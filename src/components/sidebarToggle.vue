<template lang="pug">
div(v-show="isSidebarToggleVisible")
  template(v-if="sidebarToggleState === true")
    el-button(class="sidebar-toggle open", @click="toggleSidebar()") #[i.el-icon-caret-left]
  template(v-else)
    el-button(class="sidebar-toggle closed", @click="toggleSidebar()") #[i.el-icon-caret-right]
</template>

<script>
  export default {
    data() {
      return {
        sidebarToggleState: this.$store.getters.getSidebarToggleState,
      }
    },
    methods: {
      toggleSidebar() {
        this.sidebarToggleState = !this.sidebarToggleState;
        this.$store.dispatch('actionSetSidebarToggleState', this.sidebarToggleState);
      },
    },
    computed: {
      isSidebarToggleVisible() {
        let path = this.$route.path ? this.$route.path : ''
        if (!path || path === "/") return false
        let doNotShowSidebar = [
          "/agrostream/dashboard",
          "/login",
          "/logout",
          "/modules-tree",
          "/agrofact/news",
          "/agroplan/news",
          "/agroplan/sowings",
          "/agroplan/recipes",
        ]
        let isVisible = !(doNotShowSidebar.some(s => new RegExp('^' + s).test(path)))
        isVisible = isVisible && (this.$root.module != "agrostream")
        return isVisible
      },
    }
  }
</script>

<style lang="stylus" scoped>
.sidebar-toggle
  position absolute
  top calc(45% - 30px)
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
