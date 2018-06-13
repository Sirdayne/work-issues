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
