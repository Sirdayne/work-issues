import L from 'leaflet'
import tokml from 'tokml'
import 'leaflet-editable'
import 'leaflet-providers'
import 'leaflet-easybutton'
import 'leaflet-easyprint'
import 'leaflet.fullscreen'
import 'leaflet/dist/leaflet.css'
import 'lib/Leaflet.PolylineMeasure'
import 'lib/Leaflet.PolylineMeasure.css'
import geodesy from 'leaflet-geodesy'
import http from 'lib/httpQueryV2'
import moment from 'moment'

export default {
  data() {
    return {
      editorButtons: [],
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
    },
    drawMap() {
      if (this.map) this.map.remove();
      this._addLayers();
      this._addFullscreen()
      this._addFieldsTooltipToggleButton();
      this._addScale();
      this._addRuler();
      this._addPrinter();
      this._addFieldBoundariesEditor();
    },
    _addLayers() {
      let attribution = 'AgroStream';
      let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: attribution});
      let satellite = L.tileLayer.provider('Esri.WorldImagery', {attribution: attribution});
      let baseLayers = { "Спутник": satellite, "OpenStreetMaps": osm};
      this.map = L.map('map', {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
      L.control.layers(baseLayers).addTo(this.map);
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
      L.easyPrint({
        title: 'Печать',
        position: 'topright',
        sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
        defaultSizeTitles: {Current: 'Текущий', A4Landscape: 'Альбом', A4Portrait: 'Портрет'},
        filename: "карта",
        hideClasses: ["date-selector"],
      }).addTo(this.map);
    },
    _addFieldBoundariesEditor() {
      L.easyButton({
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
        id: 'el-icon-view', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'toggle', onClick: this.toggleFieldsTooltip, title: 'Показать/скрыть названия полей', icon: 'el-icon-view'}]
      }).addTo(this.map);
    },
    drawDetails() {
      this.removeCars();
      this.drawFields();
      this.drawWarehouses();
      this.drawTracks();
    },
    revealLastCoordinatesOfCars() {
      if (this.carCoordinates.length) {
        let carIcon = L.icon({
            iconUrl: require('assets/tractor_small.png'),
            iconSize:     [32, 32],
            iconAnchor:   [15, 25],
            popupAnchor:  [0, -16],
        });
        this.carCoordinates.forEach(c => {
          let ll = L.latLng(c.point.latitude, c.point.longitude)
          this.cars[c.carId] = {}
          this.cars[c.carId].car = L.marker(ll, {icon: carIcon})
            .addTo(this.map).bindPopup('#' + c.carId + ' ' + c.name).openPopup();
        });
        this.map.fitBounds(this.fields.getBounds());
      }
    },
    changeEditable() {
      let seedLimitIds = this.selectedAssignments.map(id => {
        return this.filteredAssignments.find(a => a.id == id).seedLimitId
      })
      let cond = seedLimitIds.every((val, i, arr) => val && val === arr[0])
      if (cond) {
        this.isEditable = !this.isEditable;
        if (this.isEditable) {
          this.editorButtons.forEach(b => b.enable())
          this.highlightedPolygons.forEach(polygon => {
            polygon.enableEdit();
            polygon.on('click', function (e) {
              if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) {
                this.editor.newHole(e.latlng);
              }
            })
          })
        } else {
          this.editorButtons.forEach(b => b.disable())
          this.highlightedPolygons.forEach(polygon => {
            polygon.disableEdit();
            polygon.off()
          })
        }
      } else {
        this.$message({
          message: "Редактирование запрещено",
          type: "info",
          duration: 5000,
          showClose: false,
        });
      }
    },
    cancelEdits() {
      this.initMap()
    },
    saveEdits() {
      let seedLimitIds = this.selectedAssignments.map(id => {
        return this.filteredAssignments.find(a => a.id == id).seedLimitId
      })
      this.highlightedPolygons.forEach(polygon => {
        let kmlData = {
          seedLimitId: seedLimitIds[0],
          kml: tokml(polygon.toGeoJSON())
        };
        http.post('SeedLimitCoordinates/' + this.$root.context.organization , kmlData)
      });
      this.isEditable = false;
    },
    toggleFieldsTooltip() {
      if (this.fields) {
        this.fields.eachLayer(polygon => {
          polygon.toggleTooltip()
        })
      }
      this.map.setZoom(13)
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
    },
  }
}
