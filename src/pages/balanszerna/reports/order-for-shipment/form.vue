<template lang="pug">
div(v-if="!loading")
  order-for-shipment-form-create(:formVisible="formCreateVisible", @closed="$emit('closed')", @saved="saved", @updated="$emit('updated')")
  order-for-shipment-form-edit(:orderId="formOrderId", @closed="$emit('closed')", @saved="saved")
</template>

<script>
import OrderForShipmentFormCreate from "./form-create"
import OrderForShipmentFormEdit from "./form-edit"
import {fetchEntities} from "services/RecordsLoader"
import http from "services/http"

export default {
  name: "OrderForShipmentForm",
  props: {
    "formCreateVisible": {
      type: Boolean,
      default: false,
    },
    "orderId": {
      type: Number,
      default: null,
    },
  },
  components: {
    OrderForShipmentFormCreate,
    OrderForShipmentFormEdit,
  },
  mixins: [

  ],
  watch: {
    ["orderId"](val, oldVal) {
      this.formOrderId = val
    },
  },
  data() {
    return {
      loading: true,
      formOrderId: null,
    }
  },
  created() {
    fetchEntities([
      "storages",
      "warehouses",
      "cultures",
      "finalproducttypes",
      "sorts",
      "finalproducts",
      "grainwastes",
      "qualitytypevaluecodes",
      "customorganizations",
      "organizations",
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
