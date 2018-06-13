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
      el-submenu(:index="`/admin/jobs/assignments/2`")
        template(slot="title") Задания
        router-link(:to="`/admin/jobs/assignments/2`")
          el-menu-item(:index="`/admin/jobs/assignments/2`") Предпосевные задания
        router-link(:to="`/admin/jobs/assignments/1`")
          el-menu-item(:index="`/admin/jobs/assignments/1`") Задания по посеву
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
