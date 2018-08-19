<template lang="pug">
div(v-if="!loading")
  assignments-form-create(:formVisible="formCreateVisible", @closed="$emit('closed')", @saved="saved")
  assignments-form-edit(:assignmentId="formAssignmentId", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import AssignmentsFormCreate from "./form-create"
import AssignmentsFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"

export default {
  name: "AssignmentsForm",
  props: {
    "formCreateVisible": {
      type: Boolean,
      default: false,
    },
    "assignmentId": {
      type: Number,
      default: null,
    },
  },
  components: {
    AssignmentsFormCreate,
    AssignmentsFormEdit,
  },
  watch: {
    ["assignmentId"](val, oldVal) {
      this.formAssignmentId = val
    },
  },
  data() {
    return {
      loading: true,
      formAssignmentId: null,
    }
  },
  created() {
    fetchEntities([
      "works",
      "fields",
      "seedlimits",
      "employeesAll",
      "carsAll",
      "instruments",
      "organizationInstruments",
      "culturedepths",
      "fuelnorms",
      "workTypes",
      "workdates",
      "organizations",
      "processedstatuses",
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
  }
}
</script>
<style lang="stylus" scoped>
</style>
