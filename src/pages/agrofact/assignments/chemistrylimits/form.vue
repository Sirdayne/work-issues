<template lang="pug">
div(v-if="!loading")
  chemistry-limits-form-create(@saved="saved")
  chemistry-limits-form-edit(:assignmentId="chemistrylimitId", :formVisible="formDialogVisible", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import ChemistryLimitsFormCreate from "./form-create"
import ChemistryLimitsFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"

export default {
  name: "ChemistryLimitsForm",
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
    ChemistryLimitsFormCreate,
    ChemistryLimitsFormEdit,
  },
  data() {
    return {
      chemistrylimitId: null,
      formDialogVisible: false,
      loading: true,
    }
  },
  watch: {
    ["assignmentId"](val, oldVal) {
      this.chemistrylimitId = val
      this.formDialogVisible = !!val
    },
    ["dataUpdated"](val, oldVal) {
      this.update()
    },
  },
  created() {
    fetchEntities([
      "chemicalpreparations",
      "chemistrylimits",
      "works",
      "seedlimits",
      "fields",
      "weed",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.loading = false
      this.$emit("ready")
    },
    saved(data) {
      this.$emit("saved", data)
    },
    update() {
      fetchEntities([
        "chemistrylimits",
      ], this.afterFetch);
    },
  }
}
</script>
<style lang="stylus" scoped>
</style>
