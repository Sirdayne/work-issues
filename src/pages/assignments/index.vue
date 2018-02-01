<template lang="pug">
.cols
  el-menu.sidebar(
    v-if="sidebarToggleState",
    :default-active='$route.path',
    unique-opened,
    router,
  )
    router-link(:to="`/assignments/list`")
      el-menu-item(:index="`/assignments/list`") Список заданий
    router-link(:to="`/assignments/new`")
      el-menu-item(:index="`/assignments/new`") Добавить задание
    router-link(:to="`/assignments/transportation`")
      el-menu-item(:index="`/assignments/transportation`") Добавить транспортировку
    router-link(:to="`/assignments/seed`")
      el-menu-item(:index="`/assignments/seed`") Расчет семян
    router-link(:to="`/assignments/chemistry`")
      el-menu-item(:index="`/assignments/chemistry`") Расчет химии
    router-link(:to="`/assignments/fertilizer`")
      el-menu-item(:index="`/assignments/fertilizer`") Расчет удобрений
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
