import L from "leaflet"

export default {
  data() {
    return {
    }
  },
  created() {
  },
  methods: {
    _addNDVIOverlay() {
      let bounds = [[50, 65], [55, 75]];
      L.imageOverlay("http://i.imgur.com/KL994ik.png", bounds).addTo(this.map);
    },
    _addNDVI() {
      L.TileLayer.ndvi = L.TileLayer.extend({
        getTileUrl: (coords) => {
          return `src/assets/map/${coords.z}-${coords.x}-${coords.y}.png`
        },
        getAttribution: () => {
          return "AgroStream | NDVI"
        }
      });
      L.tileLayer.ndvi = () => {
        return new L.TileLayer.ndvi();
      }
      this.ndvi = L.tileLayer.ndvi();
    },
    _addLayers() {
      let attribution = "AgroStream";
      let osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: attribution});
      let satellite = L.tileLayer.provider("Esri.WorldImagery", {attribution: attribution});
      this._addNDVI()
      //"NDVI": this.ndvi
      let baseLayers = {"Спутник": satellite, "OpenStreetMaps": osm, "NDVI": this.ndvi};
      this.map = L.map("map", {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
      L.control.layers(baseLayers).addTo(this.map);
      //this._addNDVIOverlay()
    },
    _addScale() {
      L.control.scale({maxWidth: 240, metric: true, imperial: false, position: "bottomleft"}).addTo(this.map);
    },
    _addRuler() {
      L.control.polylineMeasure({position: "topright", unit: "metres", clearMeasurementsOnStop: true}).addTo(this.map);
    },
    _addExport() {
      L.easyButton({
        position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "exportMap", onClick: this.exportMap, title: "Экспорт карты", icon: "fas fa-download"}]
      }).addTo(this.map);
    },
    exportMap() {
      this.openExportDialog()
    },
    _addFieldBoundariesAdder() {
      let saveBtn = L.easyButton({
        id: "el-icon-check", position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "save", onClick: this.saveAddings, title: "Сохранить", icon: "el-icon-check"}]
      }).addTo(this.map).disable();
      this.adderButtons.push(saveBtn)
      let cancelBtn = L.easyButton({
        id: "el-icon-close", position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "cancel", onClick: this.cancelEdits, title: "Отменить", icon: "el-icon-close"}]
      }).addTo(this.map).disable();
      this.adderButtons.push(cancelBtn)
    },
    _addFieldBoundariesEditor() {
      let editBtn = L.easyButton({
        id: "el-icon-edit", position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "edit", onClick: this.editFieldClickedPolygon, title: "Редактировать", icon: "el-icon-edit"}]
      }).addTo(this.map).disable();
      this.editorMainButton.push(editBtn)
      let saveBtn = L.easyButton({
        id: "el-icon-check", position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "save", onClick: this.saveEdits, title: "Сохранить", icon: "el-icon-check"}]
      }).addTo(this.map).disable();
      this.editorButtons.push(saveBtn)
      let cancelBtn = L.easyButton({
        id: "el-icon-close", position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "cancel", onClick: this.cancelEdits, title: "Отменить", icon: "el-icon-close"}]
      }).addTo(this.map).disable();
      this.editorButtons.push(cancelBtn)
    },
    _addFieldsTooltipToggleButton() {
      L.easyButton({
        position: "topright", type: "replace", leafletClasses: true,
        states: [
          {
            stateName: "show-fields-tooltips",
            onClick: this.showFieldsTooltips,
            title: "Показать названия полей",
            icon: "fas fa-search-plus"
          },
          {
            stateName: "hide-fields-tooltips",
            onClick: this.hideFieldsTooltips,
            title: "Вернуть",
            icon: "fas fa-undo"
          },
        ]
      }).addTo(this.map);
    },
    showFieldsTooltips(control) {
      let activeFields = this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: true, direction: "center", opacity: 1, className: "tooltip-transparent"})
        })
        this.map.setZoom(13)
        control.state("hide-fields-tooltips");
      }
    },
    hideFieldsTooltips(control) {
      let activeFields = this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: "tooltip-transparent"})
        })
        this.map.fitBounds(activeFields.getBounds());
        control.state("show-fields-tooltips");
      }
    },
  }
}
