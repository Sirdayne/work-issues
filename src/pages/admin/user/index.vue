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
      el-submenu(:index="`/admin/user/list`")
        template(slot="title") Пользователь
        router-link(:to="`/admin/user/list`")
          el-menu-item(:index="`/admin/user/list`") Список пользователей
        router-link(:to="`/admin/user/add`")
          el-menu-item(:index="`/admin/user/add`") Добавить пользователя
  transition(name="fade")
    router-view.workspace
</template>
<script>
import sidebarToggle from "components/sidebarToggle"

export default {
  components: {
    sidebarToggle,
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
