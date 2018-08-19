import {EventBus} from "services/EventBus"
import localforage from "localforage"
import {fetchEntities} from "services/RecordsLoader"

export default {
  data() {
    return {
      dialogCutShow: false,
      mapCutResponse: null,
    };
  },
  created() {
    EventBus.$on("MapCutPolygonToggleDialog", (value) => {
      this.dialogCutShow = value
    })
    EventBus.$on("MapClearLocalForageForLeafletFields", () => {
      this.clearLocalForageForLeafletFields()
    })
  },
  methods: {
    openDialogMapCutPolygon(response) {
      this.dialogCutShow = true
      this.mapCutResponse = response
    },
    clearLocalForageForLeafletFields() {
      const organization = this.$root.context.organization
      const path = `data/leafletfields/${organization}`
      localforage.removeItem(path)
        .then(() => {
          this.updateLeafletFields()
        })
        .catch((err) => {
        });
    },
    updateLeafletFields() {
      fetchEntities([
        "leafletFields"
      ], this.afterFetch );
    },
  }
}
