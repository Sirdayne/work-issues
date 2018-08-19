import {EventBus} from "services/EventBus"
import L from "leaflet"
import "leaflet.heat"

export default {
  data() {
    return {
      normalStyle: {color: "#000", fillColor: "rgba(140, 140, 140, 1)", weight: 1, fillOpacity: 0.7, className: ""},
      selectedStyle: {color: "#20a0ff", fillColor: "rgba(200, 200, 200, 1)", weight: 4, fillOpacity: 0.7, className: ""},
      layerNDVI: new L.FeatureGroup()
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
      if (!this.modeEditPoints && !this.modeAddingPoints && !this.modeEditNewPolygon) {
        this.unselectLayers()
        this.fieldClickedId = fieldId
        this.fieldClickedName = ""
        this.fieldClickedPolygon = null
      }
    },
    selectLayer(layer, withZoom = false) {
      if (!this.modeEditPoints && !this.modeAddingPoints && !this.modeEditNewPolygon) {
        this.unselectLayers()
        layer.setStyle(this.selectedStyle)
        this.fieldClickedId = layer.fieldId
        this.fieldClickedName = layer.label
        this.fieldClickedPolygon = layer
        this.filterAssignments()
        this.closeSpoilers()
        this.enableEditMainBtn()
        if (withZoom)
          this.map.setView(layer.getBounds().getCenter(), 13);
      }
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
    drawHeatMap() {
      let minLat = 53.54336761079706
      let maxLat =  53.57691350131316
      let minLng = 69.4805431365967
      let maxLng = 69.5317840576172

      const heatMap = []
      for (let i = minLat; i <= maxLat; i += 0.001) {
        for (let j = minLng; j <= maxLng; j += 0.001) {
          heatMap.push([i, j, this.getRandom()])
        }
      }
      let options = {
        minOpacity: 0,
        maxZoom: 1,
        max: 1,
        radius: 25,
        blur: 10,
        gradient: {0: "rgb(1,255,0)", 0.5: "yellow", 1: "rgb(255,1,1"},
      }
      L.heatLayer(heatMap, options).addTo(this.map)
    },
    getColorNDVI(num) {
      let color = num <= 0.4 ? "red" : num <= 0.7 ? "yellow" : "green"
      return color
    },
    getRandom() {
      return parseFloat(Math.random().toFixed(1))
    },
    drawNDVI() {
      let myRenderer = L.canvas({padding: 0.5});
      this.layerNDVI = new L.FeatureGroup()
      let radLat = 0.0004
      let radLng = 0.00073

      let minLat = 53.54336761079706
      let maxLat =  53.57691350131316
      let minLng = 69.4805431365967
      let maxLng = 69.5317840576172

      // 50 metres to 500 metres
      // radLat = 0.004
      // radLng = 0.0073
      // minLat = 53.04121304075649
      // minLng = 67.41210937500001
      // maxLat = 54.57842969715518
      // maxLng = 71.01562500000001

      for (let i = minLat; i <= maxLat; i += radLat) {
        for (let j = minLng; j <= maxLng; j += radLng) {
          let color = this.getColorNDVI(this.getRandom())
          let circle = L.rectangle([[i, j], [i + radLat, j + radLng]], {
            color: color,
            fillColor: color,
            opacity: 0.7,
            renderer: myRenderer,
          })
          this.layerNDVI.addLayer(circle)
        }
      }
      this.map.addLayer(this.layerNDVI);
    },
    drawFields() {
      this.removeFields()
      this.fields = new L.FeatureGroup();
      //this.drawHeatMap()
      //this.drawNDVI()
      let polygons = [];
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let polygon = L.polygon(latLng, this.normalStyle);
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.on("mouseover", () => {polygon.setStyle({fillColor: "rgba(255, 255, 255, 1)"})})
          polygon.on("mouseout", () => {polygon.setStyle({fillColor: "rgba(140, 140, 140, 1)"})})
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
