<template lang="pug">
.cols
  el-menu.sidebar(
    v-if="sidebarToggleState",
    :default-active='$route.path',
    unique-opened,
    router,
  )
    router-link(:to="`/agrofact/monitoring/speedmonitoring`")
      el-menu-item(:index="`/agrofact/monitoring/speedmonitoring`") Скоростной режим
    router-link(:to="`/agrofact/monitoring/downtime`")
      el-menu-item(:index="`/agrofact/monitoring/downtime`") Простои
    router-link(:to="`/agrofact/monitoring/carstatus`")
      el-menu-item(:index="`/agrofact/monitoring/carstatus`") Статус техники
    router-link(:to="`/agrofact/monitoring/workplan`")
      el-menu-item(:index="`/agrofact/monitoring/workplan`") Календарь работ
    router-link(:to="`/agrofact/monitoring/overdrive`")
      el-menu-item(:index="`/agrofact/monitoring/overdrive`") Перегоны
    router-link(:to="`/agrofact/monitoring/noassignments`")
      el-menu-item(:index="`/agrofact/monitoring/noassignments`") Нет заданий
    router-link(:to="`/agrofact/monitoring/violationrotation`")
      el-menu-item(:index="`/agrofact/monitoring/violationrotation`") Нарушение ротации
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
