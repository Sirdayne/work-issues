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
      el-submenu(v-for="report in reports", :index="report.id", :key="report.id")
        template(slot="title") {{report.title}}
        template(v-for="subMenu in report.subMenu")
          router-link(:to="`/balanszerna/reports/${subMenu.path}`")
            el-menu-item(:index="`/balanszerna/reports/${subMenu.path}`") {{subMenu.title}}
  transition(name="fade")
    router-view.workspace
</template>
<script>
import sidebarToggle from "components/sidebarToggle"

export default {
  data() {
    return {
      reports: [],
    }
  },
  components: {
    sidebarToggle
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
  created() {
    this.reports.push({id: "uchet", title: "Учет", subMenu: []})
    this.reports.push({id: "tok", title: "Отчеты ТОК", subMenu: []})
    let uchet = this.reports.find(r => r.id == "uchet")
    uchet.subMenu.push({path: "order-for-shipment", title: "Приказ на отгрузку"})
    let tok = this.reports.find(r => r.id == "tok")
    tok.subMenu.push({path: "accounting-incoming-transfers", title: "Журнал весовщика - прием"})
    tok.subMenu.push({path: "accounting-internal-transfers", title: "Журнал весовщика - перемещение"})
    tok.subMenu.push({path: "accounting-outgoing-transfers", title: "Журнал весовщика - отгрузка"})
    tok.subMenu.push({path: "accounting-grain-registry", title: "Реестр приема зерна"})
    tok.subMenu.push({path: "inventory-report", title: "Отчет движения партии"})
    tok.subMenu.push({path: "grainoutsideofwarehouse", title: "Продукция вне тока"})
  },
  methods: {
  }
}
</script>
<style lang="stylus" scoped>
</style>
