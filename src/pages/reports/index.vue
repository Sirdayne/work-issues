<template lang="pug">
  .cols(
  v-loading="!ready",
  element-loading-text="Загружается...",
  )

    el-menu.sidebar(
    :unique-opened="true",
    :default-active="defaultActive",
    v-if="ready && sidebarToggleState",
    )
      el-form( class="el-form-edit" )
        el-form-item(v-if="$root.module === 'agroplan'", label="Бюджет:   ")
          .radio-control(v-for="b in budgets"): el-radio(v-model="$root.context.budget", :label="b.id") {{b.name}}

      el-submenu(:index="`0`", v-if="$root.module === 'agrofact'")
        template(slot="title") Учет
        router-link(:to="`/reports?path=accounting-seed`")
          el-menu-item(:index="`1`") Списание семян
        router-link(:to="`/reports?path=accounting-chemistry`")
          el-menu-item(:index="`2`") Списание химии
        router-link(:to="`/reports?path=accounting-weediness`")
          el-menu-item(:index="`3`") Засоренность
      el-submenu(v-for="type in reports", :index="type.name", :key="type.name")
        template(slot="title") {{type.display}}
        template(v-for="r in type.data")
          router-link(v-if="r.path", :to="`/reports?path=${r.api}`", :key="r.api")
            el-menu-item(:index='`${r.api}`') {{r.name}}
          router-link(v-else, :to="`/reports?reportType=${r.api}`", :key="r.api")
            el-menu-item(:index='`${r.api}`') {{r.name}}

    .workspace(v-if="ready")
      template(v-if="this.path === `accounting-seed`")
        seed-limit-fact(ref="SeedLimitFact")
      template(v-if="this.path === `accounting-chemistry`")
        chemistry-limit-fact(ref="ChemistryLimitFact")
      template(v-if="this.path === `accounting-weediness`")
        weediness(ref="Weediness")
      template(v-if="this.path === `daily-reports`")
        daily-reports(ref="DailyReports")
      template(v-else)
        h2(class="heading-margin") {{this.report.name}}
        el-form(
        v-if="report.parameters",
        label-width="70px",
        :model="item",
        :inline="true"
        )
          el-form-item(v-if="report.parameters.find(p=>p=='culture')", label="Культура")
            el-select(
            v-model="item.culture",
            placeholder="Культура",
            size="small"
            )
              el-option(
              v-for="culture in cultures",
              :label="culture.name",
              :value="culture.id",
              :key="culture.id",
              )
          el-form-item(v-if="report.parameters.find(p=>p=='date')", label="Дата")
            el-date-picker(
            v-model="item.date",
            format="dd.MM.yyyy",
            placeholder="Выберите дату")
          el-form-item(v-if="report.parameters")
            el-button.excel(type='default', @click="download(report, report.type === 0 ? '0' + report.api : '1' + report.api)") .
</template>
<script>
  import http from 'lib/httpQueryV2'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
  import SeedLimitFact from 'components/seedlimitfact'
  import ChemistryLimitFact from 'components/chemistrylimitfact'
  import Weediness from 'components/weediness'
  import DailyReports from 'components/assignmentsdailyreportitems'

  export default {
    mixins: [
      RecordsLoaderV2,
    ],
    components: {
      SeedLimitFact,
      ChemistryLimitFact,
      DailyReports,
      Weediness
    },
    data() {
      return {
        path: this.$route.path,
        report: {},
        item: {culture:8, date: null},
        reports: [
          {
            name: 'simple',
            display: "Отчеты хозяйства",
            data: null
          },
          {
            name: 'consolidate',
            display: "Отчеты группы",
            data: null
          }
        ],
      }
    },
    watch: {
      ['$route.fullPath'] (val) {
        this.path =  (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'reports'
        this.report = (this.$route.query && this.$route.query.reportType)
          ? this._reports.find(r => r.api == this.$route.query.reportType)
          : {}
      },
      ['$route.params.id'] (val) {
        // TODO !! Fast fix
        location.reload()
      },
    },
    computed: {
      cultures() {
        return this.fromVuex('cultures')
      },
      _reports() {
        return this.fromVuex('reports')
      },
      sidebarToggleState() {
        return this.$store.getters.getSidebarToggleState;
      },
      budgets() {
        return this.fromVuex('budgets');
      }
    },
    created() {
      this.path = (this.$route.query && this.$route.query.path)
        ? this.$route.query.path : (this.$root.module === 'agrofact')
          ? 'accounting-seed' : null
      this.defaultActive = this.path
      this.defineActiveLink()
      this.fetchEntities([
        'reports',
        'cultures',
      ], this.onLoad);
    },
    methods: {
      reportsName(type) {
        if (type == 'simple')
          return true
        else
          return false;
      },
      onLoad() {
        if(this.$root.module == 'agroplan') {
          this.reports[0].data = this._reports.filter(el => el.type === 0 && el.module != 'Agrofact')
          this.reports[1].data = this._reports.filter(el => el.type === 1 && el.module != 'Agrofact')
        }
        else if(this.$root.module == 'agrofact') {
          this.reports[0].data = this._reports.filter(el => el.type === 0 && el.module == 'Agrofact')
          this.reports[1].data = this._reports.filter(el => el.type === 1 && el.module == 'Agrofact')
          this.reports[0].data.push({
            api: 'daily-reports',
            name: 'Ежедневный отчет по полевым работам',
            path: true
          });
        }
      },
      getBody(item) {
        let body = {}
        if(item.parameters.includes('organization')){
          body.organizationId = this.$root.context.organization
        }
        if(item.parameters.includes('budget')){
          body.budgetId = this.$root.context.budget
        }
        if(item.parameters.includes('year')){
          body.year = this.$root.context.year
        }
        if(item.parameters.includes('culture')){
          body.cultureId = this.item.culture
        }
        if(item.parameters.includes('date')){
          body.date = this.item.date
        }
        return  body;
      },
      download(item, key) {
        http.downloadXLS(item.api, this.getBody(item), item.name)
      },
      defineActiveLink() {
        switch(this.defaultActive) {
          case 'accounting-seed' :
            this.defaultActive = "1"
            break
          case 'accounting-chemistry' :
            this.defaultActive = "2"
            break
          case 'accounting-weediness' :
            this.defaultActive = "3"
            break
          default :
            this.defaultActive = "1"
        }
      }
    }
  }
</script>
<style lang="stylus" scoped>
  .lead-form
    padding-top: 50px
  .spendOut
    text-decoration line-through
    color red
  tr.spend-out-row
    opacity 0.5
  tr.spend-out-row>td,
  tr.spend-out-row:hover>td
    background #ffe0e0
  tr.filled-row>td,
  tr.filled-row:hover>td
    background #b4eab4

  .el-form-edit
    padding-left 15px

    .el-radio
      width 100%
  .heading-margin
    margin 0
</style>