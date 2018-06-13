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
      el-submenu(:index="`/admin/user/list`")
        template(slot="title") Пользователь
        router-link(:to="`/admin/user/list`")
          el-menu-item(:index="`/admin/user/list`") Список пользователей
        router-link(:to="`/admin/user/add`")
          el-menu-item(:index="`/admin/user/add`") Добавить пользователя
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
