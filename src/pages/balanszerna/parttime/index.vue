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
      el-submenu(v-for="pt in parttime", :index="pt.id", :key="pt.id")
        template(slot="title") {{pt.title}}
        template(v-for="subMenu in pt.subMenu")
          router-link(:to="`/balanszerna/parttime/${subMenu.path}`")
            el-menu-item(:index="`/balanszerna/parttime/${subMenu.path}`") {{subMenu.title}}
  transition(name="fade")
    router-view.workspace
</template>
<script>
import sidebarToggle from "components/sidebarToggle"

export default {
  components: {
    sidebarToggle,
  },
  data() {
    return {
      parttime: [],
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
  created() {
    this.parttime.push({id: "analiz-zerna", title: "Анализ зерна", subMenu: []})
    this.parttime.push({id: "akt-podrabotki", title: "Акт подработки", subMenu: []})
    let analizZerna = this.parttime.find(r => r.id == "analiz-zerna")
    analizZerna.subMenu.push({path: "inventory-analysis-cards", title: "Журнал регистрации лабораторных анализов"})
    let aktPodrabotki = this.parttime.find(r => r.id == "akt-podrabotki")
    aktPodrabotki.subMenu.push({path: "grain-processings", title: "Журнал подработки зерна"})
  },
  methods: {
  }
}
</script>
<style lang="stylus" scoped>
</style>
