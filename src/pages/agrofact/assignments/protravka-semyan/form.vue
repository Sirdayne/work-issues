<template lang="pug">
div(v-if="!loading")
  seed-mordant-form-create(@saved="saved")
  seed-mordant-form-edit(:assignmentId="seedmordantId", :formVisible="formDialogVisible", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import SeedMordantFormCreate from "./form-create"
import SeedMordantFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"

export default {
  name: "SeedMordantForm",
  props: {
    "assignmentId": {
      type: Number,
      default: null,
    },
  },
  components: {
    SeedMordantFormCreate,
    SeedMordantFormEdit,
  },
  data() {
    return {
      seedmordantId: null,
      formDialogVisible: false,
      loading: true,
    }
  },
  watch: {
    ["assignmentId"](val, oldVal) {
      this.seedmordantId = val
      this.formDialogVisible = !!val
    },
  },
  created() {
    fetchEntities([
      "cars",
      "chemicalpreparations",
      "chemicalpreparationtypes",
      "cultures",
      "reproductions",
      "seedmordant",
      "sorts",
      "fuelnorms",
      "instruments",
      "carsAll",
      "works",
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
