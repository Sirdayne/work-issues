import L from "leaflet";
import {EventBus} from "services/EventBus";

export default {
  created() {
    EventBus.$on("MapChangeSelectedField", (fieldId) =>{
      this.fields.eachLayer(layer => {
        if (layer.id === fieldId) {
          this.selectLayer(layer, true)
        }
      })
    })
  },
  methods: {
    removeFields() {
      if (this.map) {
        this.map.removeLayer(this.fields);
      }
    },
    selectLayer(layer, withZoom = false) {
      if (!this.$store.getters.getModeEditPoints) {
        this.unselectLayers()
        this.selectedLayer = layer
        layer.setStyle(this.selectedStyle)
        if (withZoom)
          this.map.setView(layer.getBounds().getCenter(), 13);
      }
    },
    unselectLayers() {
      this.fields.eachLayer(layer => {
        layer.setStyle(this.normalStyle)
      })
    },
    emitSetFilterField(polygon) {
      if (!this.$store.getters.getModeEditPoints) {
        this.$store.dispatch("actionSetFilterField", polygon.id);
        let eventObj = {id: polygon.id, type: "field"}
        EventBus.$emit("MapApplyFilter", eventObj)
      }
    },
    _drawFields() {
      this.removeFields()
      this.fields = new L.FeatureGroup();
      let polygons = [];
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let polygon = L.polygon(latLng, this.normalStyle);
          polygon.label = field.fieldName;
          polygon.id = field.fieldId;
          polygon.on("mouseover", () => {polygon.setStyle({fillColor: "rgba(255, 255, 255, 1)"})})
          polygon.on("mouseout", () => {polygon.setStyle({fillColor: "rgba(140, 140, 140, 1)"})})
          polygon.on("click", () => {
            this.selectLayer(polygon)
            this.emitSetFilterField(polygon)
          })
          this.fields.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.fields);
        if (polygons.length) {
          this.map.setView(this.fields.getBounds().getCenter(), 12);
          this.fields.eachLayer(polygon => {
            polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: "tooltip-transparent"})
          })
        }
      }
    },
  }
}
