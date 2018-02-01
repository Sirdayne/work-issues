<template lang="pug">
.cols
  el-menu.sidebar(
    v-if="sidebarToggleState",
    :default-active='$route.path',
    unique-opened,
    router,
  )
    router-link(:to="`/monitoring/speedmonitoring`")
      el-menu-item(:index="`/monitoring/speedmonitoring`") Скоростной режим
    router-link(:to="`/monitoring/downtime`")
      el-menu-item(:index="`/monitoring/downtime`") Простои
    router-link(:to="`/monitoring/carstatus`")
      el-menu-item(:index="`/monitoring/carstatus`") Статус техники
    router-link(:to="`/monitoring/workplan`")
      el-menu-item(:index="`/monitoring/workplan`") Календарь работ
    router-link(:to="`/monitoring/overdrive`")
      el-menu-item(:index="`/monitoring/overdrive`") Перегоны
  router-view.workspace
</template>

<script>
export default {
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    }
  },
}
</script>
