<template lang="pug">
.cols(
  v-loading="false",
  element-loading-text="Загружается...",
  )
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
    router-view.workspace
</template>

<script>
export default {
  data() {
    return {
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
  created() {
  },
  methods: {
  }
}
</script>

<style scoped lang="stylus">
</style>
