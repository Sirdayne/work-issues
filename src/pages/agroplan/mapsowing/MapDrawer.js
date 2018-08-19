import L from "leaflet"

export default {
  data() {
    return {
      mapPrintTitle: `Карта размещения посевов на ${this.$root.context.year} год`,
      mapPrintState: "",
      legendButton: null,
      bottomButton: null,
    };
  },
  methods: {
    _addLayers() {
      let attribution = "AgroStream";
      let osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: attribution});
      let satellite = L.tileLayer.provider("Esri.WorldImagery", {attribution: attribution});
      let baseLayers = {"Спутник": satellite, "OpenStreetMaps": osm};
      this.map = L.map("map", {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
      L.control.layers(baseLayers).addTo(this.map);
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
    _addPanelBtns() {
      this.bottomButton = L.easyButton({
        id: "el-icon-bottom", position: "topright", type: "replace", leafletClasses: true,
        states: [
          {stateName: "open", title: "Показать инфо", icon: "<span class=\"iota-icon\">&iukcy;</span>", onClick: (control) => {this.showPanelBottom = true; control.state("close");}},
          {stateName: "close", title: "Скрыть инфо", icon: "<span class=\"close-icon\">&cross;</span>", onClick: (control) => {this.showPanelBottom = false; control.state("open");}}
        ]
      }).addTo(this.map)
      this.legendButton = L.easyButton({
        id: "el-icon-legend", position: "topright", type: "replace", leafletClasses: true,
        states: [
          {stateName: "open", title: "Показать легенды", icon: "<span class=\"lambda-icon\">&lambda;</span>", onClick: (control) => {this.showPanelLegend = true; control.state("close");}},
          {stateName: "close", title: "Скрыть легенды", icon: "<span class=\"close-icon\">&cross;</span>", onClick: (control) => {this.showPanelLegend = false; control.state("open");}}
        ]
      }).addTo(this.map)
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
