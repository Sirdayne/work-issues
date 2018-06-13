<template lang="pug">
  .cols(
  v-loading="!ready",
  element-loading-text="Загружается...",
  )
    el-menu.sidebar(
    v-if="ready && sidebarToggleState",
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
            el-menu-item(:index='`/agrofact/reports/${r.api}`') {{r.name}}
    router-view.workspace(v-if="loadingFinished")
</template>
<script>
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  data() {
    return {
      _reports: [],
      reports: [],
      loadingFinished: false,
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
  created() {
    this.reports.push({name: 'simple', display: "Отчеты хозяйства", data: null})
    this.reports.push({name: 'consolidate', display: "Отчеты группы", data: null})
    this.fetchEntities([
      'reports',
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this._reports = this.fromVuex('reports')
      this.reports[0].data = this._reports.filter(el => el.type === 0 && el.module == 'Agrofact')
      this.reports[1].data = this._reports.filter(el => el.type === 1 && el.module == 'Agrofact')
      this.reports[0].data.push({api: 'accounting-weediness', name: 'Засоренность'})
      this.reports[0].data.push({api: 'daily-reports', name: 'Ежедневный отчет по полевым работам'})
      this.reports[1].data.push({api: 'operative-informations', name: 'Сводка ВПР'})
      this.reports[1].data.push({api: 'chemical-operative-informations', name: 'Сводка химии'})
      this.loadingFinished = true
    },
  }
}
</script>
<style lang="stylus" scoped>
</style>
