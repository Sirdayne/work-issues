<template lang="pug">
div(v-if="!loading")
  grain-processings-form-create(:formVisible="formCreateVisible", @closed="$emit('closed')", @saved="saved", @updated="$emit('updated')")
  grain-processings-form-edit(:cardId="formCardId", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import GrainProcessingsFormCreate from "./form-create"
import GrainProcessingsFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"
import http from "services/http"

export default {
  name: "GrainProcessingsForm",
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
    GrainProcessingsFormCreate,
    GrainProcessingsFormEdit,
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
      "grainprocessingtypes",
      "equipments",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.loadCards()
    },
    loadCards() {
      http.getWithoutCache(`inventoryanalysiscards/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.$store.dispatch("actionAddEntities", {name: "inventoryanalysiscards", data: data})
          this.loading = false
          this.$emit("ready")
        })
        .catch(() => {
          this.$store.dispatch("actionAddEntities", {name: "inventoryanalysiscards", data: []})
          this.loading = false
          this.$emit("ready")
        })
    },
    saved(data) {
      this.$emit("saved", data)
    },
  }
}
</script>
<style lang="stylus" scoped>
</style>
