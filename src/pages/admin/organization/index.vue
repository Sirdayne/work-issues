<template lang="pug">
.cols(
  v-loading="false",
  element-loading-text="Загружается...",
)
  sidebar-toggle
  transition(name="slide-fade")
    el-menu.sidebar(
      v-if="sidebarToggleState",
      :default-active="$route.path",
      :unique-opened="true",
      router,
    )
      el-submenu(:index="`/admin/organization/list`")
        template(slot="title") Группа компаний
        router-link(:to="`/admin/organization/list`")
          el-menu-item(:index="`/admin/organization/list`") Список компаний
        router-link(:to="`/admin/organization/add`")
          el-menu-item(:index="`/admin/organization/add`") Добавить компанию
        router-link(:to="`/admin/organization/group-list`")
          el-menu-item(:index="`/admin/organization/group-list`") Группы компаний
        router-link(:to="`/admin/organization/group-add`")
          el-menu-item(:index="`/admin/organization/group-add`") Добавить группу компаний
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
