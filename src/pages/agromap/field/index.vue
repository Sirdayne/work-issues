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
      router-link(:to="`/agromap/field/passport`")
        el-menu-item(:index="`/agromap/field/passport`") Паспорт поля
      router-link(:to="`/agromap/field/sevoborot`")
        el-menu-item(:index="`/agromap/field/sevoborot`") Севоборот
      router-link(:to="`/agromap/field/gallery`")
        el-menu-item(:index="`/agromap/field/gallery`") Галерея фото
      router-link(:to="`/agromap/field/plan-works`")
        el-menu-item(:index="`/agromap/field/plan-works`") План работ
      router-link(:to="`/agromap/field/history-works`")
        el-menu-item(:index="`/agromap/field/history-works`") История работ
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
