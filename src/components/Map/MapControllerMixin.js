import L from 'leaflet'
import tokml from 'tokml'
import 'leaflet-editable'
import 'leaflet-providers'
import 'leaflet-easybutton'
import 'leaflet.browser.print/dist/leaflet.browser.print.min.js'
import 'leaflet.fullscreen'
import 'leaflet-groupedlayercontrol'
import 'leaflet/dist/leaflet.css'
import 'lib/Leaflet.PolylineMeasure'
import 'lib/Leaflet.PolylineMeasure.css'
import geodesy from 'leaflet-geodesy'
import http from 'lib/httpQueryV2'
import { EventBus } from "services/EventBus";

import fontawesome from '@fortawesome/fontawesome'
import faDownload from '@fortawesome/fontawesome-free-solid/faDownload'
import faSearchPlus from '@fortawesome/fontawesome-free-solid/faSearchPlus'
import faUndo from '@fortawesome/fontawesome-free-solid/faUndo'

fontawesome.library.add(faDownload)
fontawesome.library.add(faSearchPlus)
fontawesome.library.add(faUndo)

export default {
  data() {
    return {
      editorButtons: [],
      editorButton: null,
    }
  },
  computed: {
    selectedAssignments() {
      return this.$store.getters.getSelectedAssignments;
    },
  },
  methods: {
    initMap() {
      this.isEditable = false
      this.drawMap();
      this.drawDetails();
      this.addFieldOverlay();
      this.addFieldWorkOverlay();
    },
    drawMap() {
      if (this.map) this.map.remove();
      this._addLayers();
      this._addFullscreen()
      this._addFieldsTooltipToggleButton();
      this._addScale();
      this._addRuler();
      this._addPrinterTitle();
      this._addPrinter();
      this._ifMapEditor();
      this._addCheckboxEvents();
      this._addExport();
      this._addPanelBtn();
    },
    _ifMapEditor(){
      let endpoint = `account/userinfo/`;
      http.get(endpoint)
        .then(data => {
          if (data) {
            if (data.roles.includes('MapEditor')) {
              this._addFieldBoundariesEditor();
            }
          }
        })
    },
    _addLayers() {
      let attribution = 'AgroStream';
      let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: attribution});
      let satellite = L.tileLayer.provider('Esri.WorldImagery', {attribution: attribution});
      let baseLayers = { "Спутник": satellite, "OpenStreetMaps": osm};
      this.map = L.map('map', {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
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
        position: 'topleft',
        title: 'Развернуть',
        titleCancel: 'Вернуться',
        content: '<img style="vertical-align:middle;" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDI5OC42NjcgMjk4LjY2NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk4LjY2NyAyOTguNjY3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPGc+CgkJCTxwb2x5Z29uIHBvaW50cz0iNDIuNjY3LDE5MiAwLDE5MiAwLDI5OC42NjcgMTA2LjY2NywyOTguNjY3IDEwNi42NjcsMjU2IDQyLjY2NywyNTYgICAgIiBmaWxsPSIjMDAwMDAwIi8+CgkJCTxwb2x5Z29uIHBvaW50cz0iMCwxMDYuNjY3IDQyLjY2NywxMDYuNjY3IDQyLjY2Nyw0Mi42NjcgMTA2LjY2Nyw0Mi42NjcgMTA2LjY2NywwIDAsMCAgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQkJPHBvbHlnb24gcG9pbnRzPSIxOTIsMCAxOTIsNDIuNjY3IDI1Niw0Mi42NjcgMjU2LDEwNi42NjcgMjk4LjY2NywxMDYuNjY3IDI5OC42NjcsMCAgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQkJPHBvbHlnb24gcG9pbnRzPSIyNTYsMjU2IDE5MiwyNTYgMTkyLDI5OC42NjcgMjk4LjY2NywyOTguNjY3IDI5OC42NjcsMTkyIDI1NiwxOTIgICAgIiBmaWxsPSIjMDAwMDAwIi8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />',
      });
      this.map.addControl(fsControl);
    },
    _addScale() {
      L.control.scale({maxWidth:240, metric:true, imperial:false, position: 'bottomleft'}).addTo(this.map);
    },
    _addRuler() {
      L.control.polylineMeasure({position:'topright', unit:'metres', clearMeasurementsOnStop: true}).addTo(this.map);
    },
    _addPrinter() {
      this.map.on("browser-pre-print", e => {});
      this.map.on("browser-print-start", e => {this.mapPrintState = "started"});
      this.map.on("browser-print", e => {});
      this.map.on("browser-print-end", e => {this.mapPrintState = "ended"});
      L.control.browserPrint({
        title: 'Печать',
        position: "topright",
        closePopupsOnPrint: true,
        printModes: ["Auto", "Custom", "Landscape"],
        printModesNames: {Auto:"Авто", Custom:"Область", Landscape: "Альбом"},
      }).addTo(this.map);
    },
    _addPrinterTitle() {
      L.easyButton({
        id: 'print-title', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'title', onClick: this.setPrintTitle, title: 'Заголовок карты', icon: 'el-icon-setting'}]
      }).addTo(this.map);
    },
    _addFieldBoundariesEditor() {
      this.editorButton = L.easyButton({
        id: 'el-icon-edit', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'edit', onClick: this.changeEditable, title: 'Редактировать', icon: 'el-icon-edit'}]
      }).addTo(this.map);
      let saveBtn = L.easyButton({
        id: 'el-icon-check', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'save', onClick: this.saveEdits, title: 'Сохранить', icon: 'el-icon-check'}]
      }).addTo(this.map).disable();
      this.editorButtons.push(saveBtn)
      let cancelBtn = L.easyButton({
        id: 'el-icon-close', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'cancel', onClick: this.cancelEdits, title: 'Отменить', icon: 'el-icon-close'}]
      }).addTo(this.map).disable();
      this.editorButtons.push(cancelBtn)
    },
    _addFieldsTooltipToggleButton() {
      L.easyButton({
        position: 'topright', type: 'replace', leafletClasses: true,
        states:[
          {
            stateName: 'show-fields-tooltips',
            onClick: this.showFieldsTooltips,
            title: 'Показать названия полей',
            icon: 'fas fa-search-plus'
          },
          {
            stateName: 'hide-fields-tooltips',
            onClick: this.hideFieldsTooltips,
            title: 'Вернуть',
            icon: 'fas fa-undo'
          },
        ]
      }).addTo(this.map);
    },
    _addCheckboxEvents(){
      this.map.on('overlayadd', (e) => {
        this.tracks.bringToFront()
        if (e.name == "Карта посева") {
          this.mapsowingCheckboxed = true
          this.fieldWorkOverlaySelected = false
        } else if (e.name == "Карта работ") {
          this.fieldWorkOverlaySelected = true
          this.mapsowingCheckboxed = false
        }
      });
      this.map.on('overlayremove', (e) => {
        this.tracks.bringToFront()
        if (e.name == "Карта посева") {
          this.mapsowingCheckboxed = false
        } else if (e.name == "Карта работ") {
          this.fieldWorkOverlaySelected = false
        }
      });
    },
    _addExport() {
      L.easyButton({
        position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'exportMap', onClick: this.exportMap, title: 'Экспорт карты', icon: 'fas fa-download'}]
      }).addTo(this.map);
    },
    _addPanelBtn() {
      L.easyButton({
        id: 'el-icon-bottom', position: 'topright', type: 'replace', leafletClasses: true,
        states: [
          {stateName: 'close', title: 'Скрыть инфо', icon: '<span class="close-icon">&cross;</span>', onClick: (control) => { this.togglePanelBottom(false); control.state('open');}},
          {stateName: 'open', title: 'Показать инфо', icon: '<span class="iota-icon">&iukcy;</span>', onClick: (control) => { this.togglePanelBottom(true); control.state('close');}}
        ]
      }).addTo(this.map)
    },
    togglePanelBottom(state) {
      EventBus.$emit('MapTogglePanelBottom', state);
    },
    drawDetails() {
      this.removeCars();
      this.drawFields();
      this.drawWarehouses();
      this.drawTracks();
      this.drawPolyline();
    },
    setPrintTitle() {
      this.mapPrintTitle = prompt('Введите название заголовка?', this.mapPrintTitle) || this.mapPrintTitle
    },
    changeEditable() {
      let seedLimitIds = this.selectedAssignments.map(id => {
        return this.filteredAssignments.find(a => a.id == id).seedLimitId
      })
      let cond = seedLimitIds.every((val, i, arr) => val && val === arr[0])
      this.selectedSeedLimitIdForKml = null
      if (seedLimitIds.length === 1 && seedLimitIds[0] === 0){
        this.dialogSelectSeedLimitIdForKml = true
        this.seedLimitsFromEditField = this.seedLimitsYear.filter(s => s.fieldId == this.highlightedPolygons[0].fieldId)
      } else {
        if (cond) {
          this.editPolygon()
        } else {
          this.$message({
            message: "Редактирование запрещено",
            type: "info",
            duration: 5000,
            showClose: false,
          });
        }
      }
    },
    editPolygonBySelectedSeedLimit() {
      if (this.selectedSeedLimitIdForKml) {
        this.dialogSelectSeedLimitIdForKml = false
        this.editPolygon()
      }
    },
    editPolygon() {
      this.checkEditPolygons()
      if (this.isEditable) {
        this.enterModeEdit()
        this.enableBtns()
        if (this.selectedPolygonForEdit) {
          this.editPolygonPoints(this.selectedPolygonForEdit)
        } else {
          this.highlightedPolygons.forEach(polygon => {
            this.editPolygonPoints(polygon)
          })
        }
      } else {
        this.editorButtons.forEach(b => b.disable())
        this.highlightedPolygons.forEach(polygon => {
          polygon.disableEdit();
          polygon.off()
        })
      }
    },
    enableBtns() {
      this.editorButtons.forEach(b => b.enable())
    },
    checkEditPolygons() {
      if (this.selectedPolygonForEdit || this.highlightedPolygons.length > 0){
        this.isEditable = !this.isEditable;
      } else {
        this.$message({
          message: "Нет выбранных треков на поле!",
          type: "info",
          duration: 5000,
          showClose: false,
        });
      }
    },
    editPolygonPoints(polygon) {
      polygon.enableEdit();
      polygon.on('click', function (e) {
        if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) {
          this.editor.newHole(e.latlng);
        }
      })
    },
    cancelEdits() {
      this.exitModeEdit()
      this.initMap()
    },
    saveEdits() {
      let seedLimitIds = this.selectedAssignments.map(id => {
        return this.filteredAssignments.find(a => a.id == id).seedLimitId
      })
      let seedLimitId = seedLimitIds[0]
      if (seedLimitIds[0] === 0) {
        seedLimitId = this.selectedSeedLimitIdForKml
      }
      if (this.selectedPolygonForEdit) {
        this.postKmlData(this.selectedPolygonForEdit.seedLimitId, tokml(this.selectedPolygonForEdit.toGeoJSON()), this.getArea(this.selectedPolygonForEdit))
      } else {
        this.highlightedPolygons.forEach(polygon => {
          this.postKmlData(seedLimitId, tokml(polygon.toGeoJSON()), this.getArea(polygon))
        })
      }
      this.isEditable = false;
      this.exitModeEdit()
    },
    enterModeEdit() {
      this.modeEditPoints = true
    },
    exitModeEdit() {
      this.highlightedPolygons = []
      this.highlightedPolygons.forEach(polygon => {
        polygon.disableEdit();
        polygon.off()
      })
      this.modeEditPoints = false
    },
    postKmlData(seedLimitId, kml, area) {
      let kmlData = {
        seedLimitId: seedLimitId,
        kml: kml,
        area: area
      }
      http.post('SeedLimitCoordinates/' + this.$root.context.organization , kmlData).then(() => {
        this.updateSeedLimitCoordinates()
        this.$message({
          message: "Успешно изменено в карте посева!",
          type: "success",
          duration: 5000,
          showClose: false,
        });
      })
    },
    exportMap() {
      this.exportMapVisible = true
    },
    showFieldsTooltips(control) {
      let activeFields = (this.mapsowingCheckboxed) ? this.SowingPolygons : (this.fieldWorkOverlaySelected) ? this.fieldWorkPolygons : this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: true, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        })
        this.map.setZoom(13)
        control.state('hide-fields-tooltips');
      }
    },
    hideFieldsTooltips(control) {
      let activeFields = (this.mapsowingCheckboxed) ? this.SowingPolygons : (this.fieldWorkOverlaySelected) ? this.fieldWorkPolygons : this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        })
        this.map.fitBounds(activeFields.getBounds());
        control.state('show-fields-tooltips');
      }
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
    },
  }
}
