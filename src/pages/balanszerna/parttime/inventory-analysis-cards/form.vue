<template lang="pug">
div(v-if="!loading")
  inventory-analysis-cards-form-create(:formVisible="formCreateVisible", @closed="$emit('closed')", @saved="saved", @updated="$emit('updated')")
  inventory-analysis-cards-form-edit(:cardId="formCardId", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import InventoryAnalysisCardsFormCreate from "./form-create"
import InventoryAnalysisCardsFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"

export default {
  name: "InventoryAnalysisCardsForm",
  props: {
    "formCreateVisible": {
      type: Boolean,
      default: false,
    },
    "cardId": {
      type: Number,
      default: null,
    },
  },
  components: {
    InventoryAnalysisCardsFormCreate,
    InventoryAnalysisCardsFormEdit,
  },
  mixins: [

  ],
  watch: {
    ["cardId"](val, oldVal) {
      this.formCardId = val
    },
  },
  data() {
    return {
      loading: true,
      formCardId: null,
    }
  },
  created() {
    fetchEntities([
      "analysiscardtypes",
      "inventory",
      "cropbalanceusers",
      "storages",
      "warehouses",
      "cultures",
      "finalproducttypes",
      "culturequalitytypes",
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
