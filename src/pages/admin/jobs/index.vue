<template lang="pug">
.cols
  sidebar-toggle
  transition(name="slide-fade")
    el-menu.sidebar(
      v-if="sidebarToggleState",
      :default-active="$route.path",
      :unique-opened="true",
      router,
    )
      el-submenu(:index="`/admin/jobs/assignments/2`")
        template(slot="title") Задания
        router-link(:to="`/admin/jobs/assignments/2`")
          el-menu-item(:index="`/admin/jobs/assignments/2`") Предпосевные задания
        router-link(:to="`/admin/jobs/assignments/1`")
          el-menu-item(:index="`/admin/jobs/assignments/1`") Задания по посеву
  transition(name="fade")
    router-view.workspace
</template>

<script>
import sidebarToggle from "components/sidebarToggle"

export default {
  components: {
    sidebarToggle
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
}
</script>
<style scoped lang="stylus">
</style>
