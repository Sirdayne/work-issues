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
      el-form( class="el-form-edit")
        el-form-item(id="step2")
          el-button(@click="startHelpReportsAgroplan") ?
          p Бюджет:
          .radio-control(v-for="b in budgets")
            el-radio(v-model="$root.context.budget", :label="b.id") {{b.name}}
      div(id="step3")
        el-submenu(v-for="type in reports", :index="type.name", :key="type.name")
          template(slot="title") {{type.display}}
          template(v-for="r in type.data")
            router-link(:to="`/agroplan/reports/${r.api}`")
              el-menu-item(:index="`/agroplan/reports/${r.api}`") {{r.name}}
  transition(name="fade")
    router-view.workspace(v-if="!loading")
</template>
<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader";
import sidebarToggle from "components/sidebarToggle"
import introLib from "lib/introLib";
import Steps from "components/help/steps";

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
    budgets() {
      return fromVuex("budgets");
    }
  },
  created() {
    this.reports.push({name: "simple", display: "Отчеты хозяйства", data: null})
    this.reports.push({name: "consolidate", display: "Отчеты группы", data: null})
    fetchEntities([
      "reports",
    ], this.afterFetch);
  },
  methods: {
    startHelpReportsAgroplan() {
      if(Steps.reportsagroplan)
        introLib.begin(Steps.reportsagroplan);
    },
    afterFetch() {
      this.$_reports = fromVuex("reports")
      this.reports[0].data = this.$_reports.filter(el => el.type === 0 && el.module != "Agrofact")
      this.reports[1].data = this.$_reports.filter(el => el.type === 1 && el.module != "Agrofact")
      this.loading = false
    },
  }
}
</script>
<style lang="stylus" scoped>
.el-form-edit
  margin-top 10px
  padding-left 15px
  .el-radio
    width 100%
  .el-button
    margin-right 10px
    padding 5px
  p
    display inline-block
    margin 0
    font-size 13px
    width auto
    line-height 20px
</style>
