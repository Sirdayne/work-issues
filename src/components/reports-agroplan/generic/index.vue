<template lang="pug">
div
  h2(class="heading-margin") {{report.name}}
  div.a-form(v-if="report.parameters",)
    span(v-if="report.parameters.find(p=>p=='culture')", label="Культура")
      el-select(v-model="item.culture", placeholder="Культура", size="small")
        el-option(v-for="culture in cultures", :label="culture.name", :value="culture.id", :key="culture.id")
    span(v-if="report.parameters.find(p=>p=='date')", label="Дата")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy", placeholder="Выберите дату")
    span(v-if="report.parameters")
      el-button.excel(type='default', @click="download(report)") .
</template>
<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import moment from 'moment'

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  data() {
    return {
      item: {
        culture:8,
        date: moment().hour(0).minute(0).second(0).subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss")
      },
      cultures: [],
    }
  },
  computed: {
    reports() {
      return this.fromVuex('reports')
    },
    report() {
      let api = this.$route.fullPath.split("/").pop()
      return this.reports.find(r => r.api == api) || {}
    },
  },
  created() {
    this.fetchEntities([
      'cultures',
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.cultures = this.fromVuex('cultures')
    },
    download(item) {
      let body = {}
      let contexts = ["organization", "budget", "year", "culture", "date"]
      let keys = ["organizationId", "budgetId", "year", "cultureId", "date"]
      let obj = [this.$root.context, this.$root.context, this.$root.context, this.item, this.item]
      item.parameters.forEach(p => {
        let i = contexts.findIndex(c => c == p)
        let c = contexts[i]
        body[keys[i]] = obj[i][c]
        if (c == "date") {
          body[keys[i]] = moment(obj[i][c], "YYYY-MM-DDTHH:mm:ss.SSSZ").format("YYYY-MM-DDTHH:mm:ss")
        }
      })
      http.downloadXLS(item.api, body, item.name)
    },
  }
}
</script>
<style lang="stylus" scoped>
.heading-margin
  margin 0 0 10px 0
.a-form
  & span
    display inline-block
    &:not(:first-child)
      margin-left 10px
</style>
