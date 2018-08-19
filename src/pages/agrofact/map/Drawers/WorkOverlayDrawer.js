import L from "leaflet";
import moment from "moment";
import http from "services/http";

export default {
  data() {
    return {
      workOverlaySelectedWork: null,
      workOverlayWorks: [],
      workOverlayPercents: [],
    }
  },
  watch: {
    "workOverlaySelectedWork" (val) {
      this.removeStylesFromWorkLayers()
      this.workOverlayPercents.forEach(w => {
        if (w.grKey === val) {
          this.workLayers.eachLayer(layer => {
            if (w.fieldId === layer.fieldId){
              let color = w.procent > 100 ? "rgb(255,0,0)" : "rgb(0,255,0)"
              layer.label = `${layer.fieldName}<br />(${w.procent.toFixed(2)}%)`
              layer.setStyle({fillColor: color})
              layer.on("mouseout", () => {layer.setStyle({fillColor: color})})
              this.bindTooltipsWorkOverlay()
            }
          })
        }
      })
    }
  },
  methods: {
    removeStylesFromWorkLayers() {
      this.workLayers.eachLayer(layer => {
        layer.label = layer.fieldName
        layer.setStyle(this.normalStyle)
        layer.on("mouseout", () => {layer.setStyle(this.normalStyle)})
      })
    },
    _addWorkOverlay() {
      this.getFieldWorkProgress()
      this.workLayers = new L.FeatureGroup()
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let polygon = L.polygon(latLng, this.normalStyle);
          polygon.fieldName = field.fieldName
          polygon.label = field.fieldName
          polygon.fieldId = field.fieldId
          polygon.on("mouseover", () => {polygon.setStyle({fillColor: "rgba(255, 255, 255, 1)"})})
          polygon.on("mouseout", () => {polygon.setStyle(this.normalStyle)})
          this.workLayers.addLayer(polygon)
        })
        this.bindTooltipsWorkOverlay()
      }
      this.LayerControl.addOverlay(this.workLayers, "Карта работ", "Слои")
    },
    bindTooltipsWorkOverlay() {
      this.workLayers.eachLayer(polygon => {
        polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: "tooltip-transparent"})
      })
    },
    getFieldWorkProgress() {
      let date = moment(this.mapDate, "YYYY-MM-DDTHH:mm:ss").format("YYYY/MM/DD");
      this.loadingWorkOverlay = true
      http.getWithoutCache(`fieldsuboperationprogress/getinfo?orgId=${this.$root.context.organization}&date=${date}`)
        .then(data => {
          this.workOverlayWorks = data.types
          this.workOverlayPercents = data.data
          this.loadingWorkOverlay = false
        })
        .catch(() => {
          this.loadingWorkOverlay = false
        })
    },
    resetWorkOverlay() {
      this.workOverlaySelectedWork = null
      this.workOverlayWorks = []
      this.workOverlayPercents = []
      this.removeStylesFromWorkLayers()
      this.getFieldWorkProgress()
    }
  }
}
