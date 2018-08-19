<template lang="pug">
.cols(
  v-loading="loading",
  element-loading-text="Загружается...",
)
  sidebar-toggle(v-if="!loading")
  transition(name="slide-fade")
    el-menu.sidebar(
      v-if="!loading && sidebarToggleState",
      :default-active="$route.path",
      :unique-opened="true",
      router,
    )
      el-submenu(:index="`/agrofact/reports/accounting-seed`")
        template(slot="title") Учет
        router-link(:to="`/agrofact/reports/accounting-seed`")
          el-menu-item(:index="`/agrofact/reports/accounting-seed`") Списание семян
        router-link(:to="`/agrofact/reports/accounting-chemistry`")
          el-menu-item(:index="`/agrofact/reports/accounting-chemistry`") Списание химии
        router-link(:to="`/agrofact/reports/uchet`")
          el-menu-item(:index="`/agrofact/reports/uchet`") Учетный лист
      el-submenu(v-for="type in reports", :index="type.name", :key="type.name")
        template(slot="title") {{type.display}}
        template(v-for="r in type.data")
          router-link(:to="`/agrofact/reports/${r.api}`")
            el-menu-item(:index="`/agrofact/reports/${r.api}`") {{r.name}}
  transition(name="fade")
    router-view.workspace(v-if="!loading")
</template>
<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader";
import sidebarToggle from "components/sidebarToggle"

export default {
  components: {
    sidebarToggle,
  },
  data() {
    return {
      $_reports: [],
      reports: [],
      loading: true,
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
  created() {
    this.reports.push({name: "simple", display: "Отчеты хозяйства", data: null})
    this.reports.push({name: "consolidate", display: "Отчеты группы", data: null})
    fetchEntities([
      "reports",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.$_reports = fromVuex("reports")
      this.reports[0].data = this.$_reports.filter(el => el.type === 0 && el.module == "Agrofact")
      this.reports[1].data = this.$_reports.filter(el => el.type === 1 && el.module == "Agrofact")
      this.reports[0].data.push({api: "accounting-weediness", name: "Засоренность"})
      this.reports[0].data.push({api: "daily-reports", name: "Ежедневный отчет по полевым работам"})
      this.reports[0].data.push({api: "tracks-report", name: "Отчет по отрисовке треков"})
      this.reports[0].data.push({api: "ripeness", name: "Размещение семян по группам спелости"})
      this.reports[0].data.push({api: "vegetation-schedule", name: "Отчет график уборки по вегетации"})
      this.reports[1].data.push({api: "operative-informations", name: "Сводка ВПР"})
      this.reports[1].data.push({api: "chemical-operative-informations", name: "Сводка химии"})
      this.reports[1].data.push({api: "haymaking-operative-informations", name: "Сводка по сенокосу"})
      this.reports[1].data.push({api: "fallow-operative-informations", name: "Сводка по парам"})
      this.reports[1].data.push({api: "harvest-operative-informations", name: "Сводка по уборке"})
      this.reports[1].data.push({api: "statistics-by-car-model", name: "Анализ производительности техники"})
      this.loading = false
    },
  }
}
</script>
<style lang="stylus" scoped>
</style>
