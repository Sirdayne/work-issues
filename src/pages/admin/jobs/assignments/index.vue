<template lang="pug">
div
  el-form(@submit.native.prevent="", :model="item", inline, label-position="top")
    el-form-item(label="Дата от")
      el-date-picker(v-model="item.from", format="dd.MM.yyyy HH:mm:ss", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="item.to", format="dd.MM.yyyy HH:mm:ss", placeholder="Выберите дату")
    el-form-item.invisible-color(label=".")
      el-button(type="primary", @click="getJobsLog()", :loading="loading") Показать
  template(v-if="!loading")
    present-jobs(:statusesData="statuses")
</template>
<script>
import http from "services/http";
import moment from "moment"
import PresentJobs from "./present-jobs"

export default {
  components: {
    PresentJobs,
  },
  data() {
    return {
      loading: false,
      assignmentType: this.$route.params.assignmentType,
      item: {
        from: moment(),
        to: moment(),
        organization: this.$root.context.organization,
      },
      statuses: [],
    }
  },
  watch: {
    "$route.params.assignmentType"(val) {
      this.assignmentType = val
      this.getJobsLog()
    },
  },
  created() {
    this.getJobsLog()
  },
  methods: {
    getJobsLog() {
      this.statuses = []
      this.loading = true
      let params = this.getParams()
      http.getJobs(`getjobslog2${params}`)
        .then(data => {
          this.statuses = data || []
          this.loading = false
        })
        .catch(() => {
          this.statuses = []
          this.loading = false
        })
    },
    getParams() {
      let params = []
      let query = []
      if (this.item.organization) {
        let id = `id=${this.item.organization}`
        query.push(id)
      }
      if (this.assignmentType) {
        let jobType = `jobType=${this.assignmentType}`
        query.push(jobType)
      }
      if (this.item.from) {
        let date = moment.utc(this.item.from, "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DDTHH:mm:ss")
        let from = `from=${date}`
        query.push(from)
      }
      if (this.item.to) {
        let date = moment.utc(this.item.to, "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DDTHH:mm:ss")
        let to = `to=${date}`
        query.push(to)
      }
      if (query.length) {
        query = "?" + query.join("&")
        params.push(query)
      }
      return params.join("")
    },
  }
}
</script>
<style scoped lang="stylus">
</style>
