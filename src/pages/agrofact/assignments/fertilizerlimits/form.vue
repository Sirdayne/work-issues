<template lang="pug">
div(v-if="!loading")
  fertilizer-limits-form-create(@saved="saved")
  fertilizer-limits-form-edit(:assignmentId="chemistrylimitId", :formVisible="formDialogVisible", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import FertilizerLimitsFormCreate from "./form-create"
import FertilizerLimitsFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"

export default {
  name: "FertilizerLimitsForm",
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
    FertilizerLimitsFormCreate,
    FertilizerLimitsFormEdit,
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
