<template lang="pug">
div(v-if="!loading")
  seed-limits-form-create(@saved="saved", :dataUpdated="dataUpdated")
  seed-limits-form-edit(:assignmentId="seedlimitId", :dataUpdated="dataUpdated", :formVisible="formDialogVisible", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import SeedLimitsFormCreate from "./form-create"
import SeedLimitsFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"
import http from "services/http"

export default {
  name: "SeedLimitsForm",
  props: {
    "assignmentId": {
      type: Number,
      default: null,
    },
    "dataUpdated": {
      type: Number,
      default: null,
    },
  },
  components: {
    SeedLimitsFormCreate,
    SeedLimitsFormEdit,
  },
  data() {
    return {
      seedlimitId: null,
      formDialogVisible: false,
      loading: true,
    }
  },
  watch: {
    ["assignmentId"](val, oldVal) {
      this.seedlimitId = val
      this.formDialogVisible = !!val
    },
    ["dataUpdated"](val, oldVal) {
      this.update()
    },
  },
  created() {
    fetchEntities([
      "seedlimits",
      "fields",
      "cultures",
      "sorts",
      "reproductions",
      "culturefieldzones",
      "culturerotation",
      "cultureparameters",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.getPrevYearSeedlimits()
    },
    getPrevYearSeedlimits() {
      http.get(`seedlimits/${this.$root.context.organization}/${this.$root.context.year - 1}`)
        .then(data => {
          this.setPrevYearSeedlimits(data)
        })
        .catch(() => {
          this.setPrevYearSeedlimits([])
        })
    },
    setPrevYearSeedlimits(data) {
      this.$store.dispatch("actionAddEntities", {name: "prevseedlimits", data: data})
      this.loading = false
      this.$emit("ready")
    },
    saved(data) {
      this.$emit("saved", data)
    },
    update() {
      fetchEntities([
        "seedlimits",
      ], this.afterFetch);
    },
  }
}
</script>
<style lang="stylus" scoped>
</style>
