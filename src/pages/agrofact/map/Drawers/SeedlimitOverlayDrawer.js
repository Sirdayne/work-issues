import L from "leaflet";
import http from "services/http"
import tokml from "tokml"

export default {
  data() {
    return {
      seedlimitSelectedCulture: null,
    }
  },
  watch: {
    "seedlimitSelectedCulture"(val) {
      this.seedlimitLayers.eachLayer(layer => {
        if (layer.cultureIds.includes(val) || val == ""){
          layer.setStyle({fillColor: layer.color})
          layer.on("mouseout", () => {layer.setStyle({fillColor: layer.color})})
        } else {
          layer.setStyle(this.normalStyle)
          layer.on("mouseout", () => {layer.setStyle(this.normalStyle)})
        }
      })
    },
  },
  methods: {
    selectSeedLayer(layer) {
      this.unselectSeedLayers()
      layer.setStyle({fillColor: "#20a0ff"})
      this.map.setView(layer.getBounds().getCenter(), 13);
    },
    unselectSeedLayers() {
      this.seedlimitLayers.eachLayer(layer => {
        layer.setStyle({fillColor: layer.color})
      })
    },
    _addSeedlimitOverlay() {
      this.seedlimitLayers = new L.FeatureGroup()
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          if (!this.paintSeedLimitCoordinatesByField(field)) {
            let latLng = JSON.parse(field.kml);
            let seedlimit = field.seedlimits[0] ? field.seedlimits[0] : null
            let color = seedlimit ? seedlimit.color : "rgb(150, 150, 150)"
            let seedlimitStyle = {color: "#000", fillColor: color, weight: 1, fillOpacity: 0.7, className: ""}
            let polygon = L.polygon(latLng, seedlimitStyle);
            polygon.label = this.getSeedlimitLabel(field)
            polygon.fieldId = field.fieldId
            polygon.color = color
            polygon.cultureIds = []
            field.seedlimits.forEach(seedlimit => {
              polygon.cultureIds.push(seedlimit.cultureId)
            })
            polygon.on("mouseover", () => {polygon.setStyle({fillColor: "rgba(255, 255, 255, 1)"})})
            polygon.on("mouseout", () => {polygon.setStyle(seedlimitStyle)})
            this.seedlimitLayers.addLayer(polygon)
          }
        })
        this.seedlimitLayers.eachLayer(polygon => {
          polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: "tooltip-transparent"})
        })
      }
      this.LayerControl.addOverlay(this.seedlimitLayers, "Карта посева", "Слои")
    },
    paintSeedLimitCoordinatesByField(field) {
      let seedLimitCoordinatePainted = false
      this.seedlimitcoordinates.forEach(seed => {
        if (field.fieldId === seed.fieldId) {
          let latLng = JSON.parse(seed.kml);
          let seedStyle = {color: "#000", fillColor: seed.color, weight: 2, fillOpacity: 0.7, className: ""}
          let polygon = L.polygon(latLng, seedStyle);
          polygon.label = seed.label
          polygon.fieldId = seed.fieldId
          polygon.color = seed.color
          polygon.cultureIds = [seed.cultureId]
          polygon.seedLimitId = seed.seedLimitId
          polygon.on("mouseover", () => {polygon.setStyle({fillColor: "rgba(255, 255, 255, 1)"})})
          polygon.on("mouseout", () => {polygon.setStyle(seedStyle)})
          polygon.on("click", () => {
            this.selectSeedLayer(polygon)
            this.selectedSeedLayer = polygon
          })

          seedLimitCoordinatePainted = true
          this.seedlimitLayers.addLayer(polygon)
        }
      })
      return seedLimitCoordinatePainted
    },
    getSeedlimitLabel(field){
      let str = `${field.fieldName} `
      field.seedlimits.forEach(seedlimit => {
        str += `</br> ${seedlimit.cultureName}(${seedlimit.area})`
      })
      return str
    },
    _addSeedBoundariesEditor() {
      this.editorSeedButton = L.easyButton({
        id: "el-icon-edit", position: "topleft", type: "replace", leafletClasses: true,
        states: [{stateName: "edit", onClick: this.editSelectedSeedLayer, title: "Редактировать", icon: "el-icon-edit"}]
      }).addTo(this.map).disable();
      let saveBtn = L.easyButton({
        id: "el-icon-check", position: "topleft", type: "replace", leafletClasses: true,
        states: [{stateName: "save", onClick: this.saveSeedEdits, title: "Сохранить", icon: "el-icon-check"}]
      }).addTo(this.map).disable();
      this.editorSeedButtons.push(saveBtn)
      let cancelBtn = L.easyButton({
        id: "el-icon-close", position: "topleft", type: "replace", leafletClasses: true,
        states: [{stateName: "cancel", onClick: this.cancelEdits, title: "Отменить", icon: "el-icon-close"}]
      }).addTo(this.map).disable();
      this.editorSeedButtons.push(cancelBtn)
    },
    enableSeedEditBtns() {
      this.editorSeedButtons.forEach(b => b.enable())
    },
    disableSeedEditBtns() {
      this.editorSeedButtons.forEach(b => b.disable())
    },
    disableSeedAllBtns() {
      this.editorSeedButton.disable()
      this.disableSeedEditBtns()
    },
    editSelectedSeedLayer() {
      this.enableSeedEditBtns()
      this.editPolygonPoints(this.selectedSeedLayer)
    },
    saveSeedEdits() {
      let kmlData = {
        seedLimitId: this.selectedSeedLayer.seedLimitId,
        kml: tokml(this.selectedSeedLayer.toGeoJSON())
      }
      this.loading = true
      http.post("seedlimitcoordinates/" + this.$root.context.organization, kmlData).then(() => {
        this.fetchSeedlimitCoordinates()
        this.$message({
          message: "Успешно сохранено в слое карты посева!",
          type: "success",
          duration: 3000,
          showClose: false,
        })
      }).catch(() => {
        this.loading = false
      });
    },
  }
}
