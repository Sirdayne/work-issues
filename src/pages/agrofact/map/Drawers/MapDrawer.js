import L from "leaflet";
import "leaflet-providers";
import "leaflet-easybutton";

export default {
  created() {

  },
  methods: {
    _addLayers() {
      let attribution = "AgroStream";
      let osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: attribution});
      let satellite = L.tileLayer.provider("Esri.WorldImagery", {attribution: attribution});
      let baseLayers = {"Спутник": satellite, "OpenStreetMaps": osm};
      this.map = L.map("map", {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
      //L.control.layers(baseLayers).addTo(this.map);
      let groupedOverlays = {
        "Слои": {
          "Скрыть": new L.FeatureGroup()
        },
      };
      let options = {
        exclusiveGroups: ["Слои"],
        groupCheckboxes: false
      };
      this.LayerControl = L.control.groupedLayers(baseLayers, groupedOverlays, options).addTo(this.map);
    },
    _addFullscreen() {
      let fsControl = new L.Control.FullScreen({
        position: "topleft",
        title: "Развернуть",
        titleCancel: "Вернуться",
        content: "<img style=\"vertical-align:middle;\" src=\"data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDI5OC42NjcgMjk4LjY2NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk4LjY2NyAyOTguNjY3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPGc+CgkJCTxwb2x5Z29uIHBvaW50cz0iNDIuNjY3LDE5MiAwLDE5MiAwLDI5OC42NjcgMTA2LjY2NywyOTguNjY3IDEwNi42NjcsMjU2IDQyLjY2NywyNTYgICAgIiBmaWxsPSIjMDAwMDAwIi8+CgkJCTxwb2x5Z29uIHBvaW50cz0iMCwxMDYuNjY3IDQyLjY2NywxMDYuNjY3IDQyLjY2Nyw0Mi42NjcgMTA2LjY2Nyw0Mi42NjcgMTA2LjY2NywwIDAsMCAgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQkJPHBvbHlnb24gcG9pbnRzPSIxOTIsMCAxOTIsNDIuNjY3IDI1Niw0Mi42NjcgMjU2LDEwNi42NjcgMjk4LjY2NywxMDYuNjY3IDI5OC42NjcsMCAgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQkJPHBvbHlnb24gcG9pbnRzPSIyNTYsMjU2IDE5MiwyNTYgMTkyLDI5OC42NjcgMjk4LjY2NywyOTguNjY3IDI5OC42NjcsMTkyIDI1NiwxOTIgICAgIiBmaWxsPSIjMDAwMDAwIi8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=\" />",
      });
      this.map.addControl(fsControl);
    },
    _addScale() {
      L.control.scale({maxWidth: 240, metric: true, imperial: false, position: "bottomleft"}).addTo(this.map);
    },
    _addRuler() {
      L.control.polylineMeasure({position: "topright", unit: "metres", clearMeasurementsOnStop: true}).addTo(this.map);
    },
    _addPrinter() {
      this.map.on("browser-pre-print", () => {});
      this.map.on("browser-print-start", () => {this.mapPrintState = "started"});
      this.map.on("browser-print", () => {});
      this.map.on("browser-print-end", () => {this.mapPrintState = "ended"});
      L.control.browserPrint({
        title: "Печать",
        position: "topright",
        closePopupsOnPrint: true,
        printModes: ["Auto", "Custom", "Landscape"],
        printModesNames: {Auto: "Авто", Custom: "Область", Landscape: "Альбом"},
      }).addTo(this.map);
    },
    _addPrinterTitle() {
      L.easyButton({
        id: "print-title", position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "title", onClick: this.setPrintTitle, title: "Заголовок карты", icon: "el-icon-setting"}]
      }).addTo(this.map);
    },
    setPrintTitle() {
      this.mapPrintTitle = prompt("Введите название заголовка?", this.mapPrintTitle) || this.mapPrintTitle
    },
    _addExport() {
      L.easyButton({
        position: "topright", type: "replace", leafletClasses: true,
        states: [{stateName: "exportMap", onClick: this.exportMap, title: "Экспорт карты", icon: "fas fa-download"}]
      }).addTo(this.map);
    },
    exportMap() {
      this.exportMapVisible = true
    },
    _addPanelBtns() {
      L.easyButton({
        id: "el-icon-bottom", position: "topright", type: "replace", leafletClasses: true,
        states: [
          {stateName: "close", title: "Скрыть инфо", icon: "<span class=\"close-icon\">&cross;</span>", onClick: (control) => {this.togglePanelBottom(false); control.state("open");}},
          {stateName: "open", title: "Показать инфо", icon: "<span class=\"iota-icon\">&iukcy;</span>", onClick: (control) => {this.togglePanelBottom(true); control.state("close");}}
        ]
      }).addTo(this.map)
      this.legendButton = L.easyButton({
        id: "el-icon-legend", position: "topright", type: "replace", leafletClasses: true,
        states: [
          {stateName: "open", title: "Показать легенды", icon: "<span class=\"lambda-icon\">&lambda;</span>", onClick: (control) => {this.showPanelLegend = true; control.state("close");}},
          {stateName: "close", title: "Скрыть легенды", icon: "<span class=\"close-icon\">&cross;</span>", onClick: (control) => {this.showPanelLegend = false; control.state("open");}}
        ]
      }).addTo(this.map).disable()
    },
    togglePanelBottom(state) {
      this.showPanelBottom = state
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
      let activeFields = (this.seedlimitOverlaySelected) ? this.seedlimitLayers : (this.workOverlaySelected) ? this.workLayers : this.fields
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
      let activeFields = (this.seedlimitOverlaySelected) ? this.seedlimitLayers : (this.workOverlaySelected) ? this.workLayers : this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: "tooltip-transparent"})
        })
        this.map.fitBounds(activeFields.getBounds());
        control.state("show-fields-tooltips");
      }
    },
    _addFieldBoundariesEditor() {
      this.editorMainButton = L.easyButton({
        id: "el-icon-edit", position: "topleft", type: "replace", leafletClasses: true,
        states: [{stateName: "edit", onClick: this.editSelectedLayer, title: "Редактировать", icon: "el-icon-edit"}]
      }).addTo(this.map).disable();
      let saveBtn = L.easyButton({
        id: "el-icon-check", position: "topleft", type: "replace", leafletClasses: true,
        states: [{stateName: "save", onClick: this.saveEdits, title: "Сохранить", icon: "el-icon-check"}]
      }).addTo(this.map).disable();
      this.editorButtons.push(saveBtn)
      let cancelBtn = L.easyButton({
        id: "el-icon-close", position: "topleft", type: "replace", leafletClasses: true,
        states: [{stateName: "cancel", onClick: this.cancelEdits, title: "Отменить", icon: "el-icon-close"}]
      }).addTo(this.map).disable();
      this.editorButtons.push(cancelBtn)
    },
    _addCheckboxEvents(){
      this.map.on("overlayadd", (e) => {
        if (e.name == "Карта посева") {
          this.seedlimitOverlaySelected = true
          this.workOverlaySelected = false
          this.legendButton.enable()
        } else if (e.name == "Карта работ") {
          this.workOverlaySelected = true
          this.seedlimitOverlaySelected = false
          this.legendButton.disable()
          this.editorSeedButton.disable()
        } else {
          this.workOverlaySelected = false
          this.seedlimitOverlaySelected = false
          this.legendButton.disable()
          this.editorSeedButton.disable()
        }
      });
    },
  }
}
