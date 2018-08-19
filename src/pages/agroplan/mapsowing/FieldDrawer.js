import {EventBus} from "services/EventBus"
import L from "leaflet"

export default {
  data() {
    return {
      fieldClickedId: null,
      fieldClickedName: null,
      noneColor: "rgba(170, 170, 170, 1)",
      normalStyle: {color: "#000",  weight: 1, fillOpacity: 0.7, className: ""},
      selectedStyle: {color: "#20a0ff",  weight: 4, fillOpacity: 0.7, className: ""}
    }
  },
  created() {
    EventBus.$on("MapFieldFilterChanged", fieldId => {
      this.selectFieldWithoutLayer(fieldId)
      this.fields.eachLayer(layer => {
        if (layer.fieldId === fieldId) {
          this.selectLayer(layer, true)
        }
      })
    })
  },
  methods: {
    selectFieldWithoutLayer(fieldId) {
      this.unselectLayers()
      this.fieldClickedId = fieldId
      this.fieldClickedName = ""
    },
    selectLayer(layer, withZoom = false) {
      this.unselectLayers()
      layer.setStyle(this.selectedStyle)
      this.showPanelBottom = true
      this.fieldClickedId = layer.fieldId
      this.fieldClickedName = layer.label
      if (withZoom)
        this.map.setView(layer.getBounds().getCenter(), 13);
    },
    unselectLayers() {
      this.fields.eachLayer(layer => {
        layer.setStyle(this.normalStyle)
      })
    },
    removeFields() {
      if (this.map) {
        this.map.removeLayer(this.fields);
      }
    },
    drawFields() {
      this.removeFields()
      this.fields = new L.FeatureGroup();
      let polygons = [];
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let polygon = L.polygon(latLng, {color: "#000", fillColor: "url(#"+field.fieldId+")", weight: 1, fillOpacity: 0.7, className: ""});
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.cultureIds = field.cultureIds;
          polygon.on("mouseover", () => {polygon.setStyle({fillColor: "rgba(255, 255, 255, 1)"})})
          polygon.on("mouseout", () => {polygon.setStyle({fillColor: "url(#"+field.fieldId+")"})})
          polygon.on("click", () => {
            this.selectLayer(polygon)
            EventBus.$emit("MapApplyFieldFilter", polygon.fieldId)
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
