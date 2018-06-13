<template lang="pug">
div
  h2(class="heading-margin") {{report.name}}
  div.a-form(v-if="report.parameters",)
    el-button.excel(type='default', @click="download(report)", :disabled="calculating") .
    el-button(type='default', @click="reCalc()", :loading="calculating") Пересчитать тех.карту
</template>
<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  data() {
    return {
      item: {},
      calculating: false,
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
  methods: {
    reCalc() {
      this.calculating = true
      let body = this.getParameters(this.report)
      http.post("RecalculateTechCardItems", body)
        .then(() => {
          this.calculating = false
        })
    },
    download(item) {
      let body = this.getParameters(item)
      http.downloadXLS(item.api, body, item.name)
    },
    getParameters(item) {
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
      return body
    },
  }
}
</script>
<style lang="stylus" scoped>
.heading-margin
  margin 0 0 10px 0
.a-form
  display inline-block
  & span
    display inline-block
    &:not(:first-child)
      margin-left 10px
</style>
