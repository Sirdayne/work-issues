<template lang="pug">
.cols
  sidebar-toggle
  transition(name="slide-fade")
    el-menu.sidebar(
      v-if="sidebarToggleState",
      :default-active="$route.path",
      unique-opened,
      router,
    )
      router-link(:to="`/agrofact/assignments/list`")
        el-menu-item(:index="`/agrofact/assignments/list`") Добавить задание
      router-link(:to="`/agrofact/assignments/transportation`")
        el-menu-item(:index="`/agrofact/assignments/transportation`") Добавить транспортировку
      router-link(:to="`/agrofact/assignments/seed`")
        el-menu-item(:index="`/agrofact/assignments/seed`") Расчет семян
      router-link(:to="`/agrofact/assignments/chemistry`")
        el-menu-item(:index="`/agrofact/assignments/chemistry`") Расчет СЗР
      router-link(:to="`/agrofact/assignments/fertilizer`")
        el-menu-item(:index="`/agrofact/assignments/fertilizer`") Расчет удобрений
      router-link(:to="`/agrofact/assignments/protravka-semyan`")
        el-menu-item(:index="`/agrofact/assignments/protravka-semyan`") Протравка семян
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
    }
  },
}
</script>
