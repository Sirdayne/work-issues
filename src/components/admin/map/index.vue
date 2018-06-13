<template lang="pug">
.cols(v-loading="loading", element-loading-text="Загрузка...")
  el-menu.sidebar(
    v-if="sidebarToggleState"
    style="position: relative; padding-top: 15px;"
  )
    upload(v-if="ready", :leafletFields = "leafletFields")
    el-dialog(:visible.sync="exportMapVisible", title="Экспорт карты", size="tiny")
      el-button-group
        a(:href="kmlUrl", download="map.kml")
         el-button Скачать KML
        a(:href="mpUrl", download="map.mp")
         el-button Скачать MP

    el-form(style="padding: 5px 15px")
      el-form-item
        .new-polygon-title Отрисовка нового полигона
          span(v-if="newPolygon", style="margin-left: 5px;") {{ getArea(newPolygon) }} га
      el-form-item
        el-select(v-model="selectedFieldId", clearable, filterable)
          el-option(
          v-for="item in vuexFields",
          :label="item.name",
          :value="item.id",
          :key="item.id"
          )
      el-form-item
        el-button(@click="onModeAddingPoints", type="primary", :disabled="addNewPolygonBtnStatus") Добавить точки
        el-button(@click="addNewPolygon", type="primary", :disabled="editNewPolygonBtnStatus") Редактировать

  .workspace
    #map-container
      #map

    .panel-bottom(v-if="ready")
      .tab-block-full(v-if="tab === 'tracks'")
        div(v-if="fieldClickedId")
          h4 {{ fieldClickedName }}
            span(v-if="fieldClickedPolygon", style="margin-left: 5px;") {{ getArea(fieldClickedPolygon) }} га
          .fx-table
            .fx-row.fx-grey
              .fx-cell(:style="firstColStyle") Работа
              .fx-cell №
              .fx-cell Дата
              .fx-cell Выработка (га)
              .fx-cell Трек
            .fx-row-container(v-if="suboperationsTable.length > 0")
              .fx-row-container(v-for="suboperation in suboperationsTable")
                .fx-row
                  .fx-cell.cursorpointer(:style="firstColStyle", @click="changeSpoiler(`.fx-spoiler-${suboperation.id}`)")
                    .fx-plus +
                    span {{suboperation.name}}
                  .fx-cell
                  .fx-cell
                  .fx-cell
                  .fx-cell.fx-small-btns
                    el-button(type="primary", size="small", @click="showTracks(suboperation.assignments)", :disabled="disabled") Все треки
                .fx-spoiler(v-for="item in suboperation.assignments", :class="`fx-spoiler-${item.subOperationId}`")
                  .fx-row
                    .fx-cell(:style="firstColStyle")
                    .fx-cell {{item.id}}
                    .fx-cell {{item.formattedDateTime}}
                    .fx-cell {{item.areaFix}}
                    .fx-cell.fx-small-btns
                      el-button(v-if="item.show", type="danger", size="small", @click="hideTrack(item, item.id)") Скрыть
                      el-button(v-else, type="primary", size="small", @click="showTrack(item, item.id)", :loading="item.loading", :disabled="disabled") Показать
            .fx-row-container(v-else)
              p(style="text-align:center;") Нет результатов

        h3(v-else) Выберите поле

    .fx-tabs(v-if="ready")
      .fx-tab(v-for="item in tabs", @click="changeTab(item.key, item.id)", :class="{ 'fx-tab-active': item.active }") {{ item.name }}

</template>

<script>
import http from 'lib/httpQueryV2'
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'
import randomcolor from 'randomcolor'
import upload from "components/admin/map/upload"
import localforage from 'localforage';
import $ from 'jquery';

import L from 'leaflet'
import tokml from 'tokml'
import 'leaflet-editable'
import 'leaflet-providers'
import 'leaflet-easybutton'
import 'leaflet.browser.print/dist/leaflet.browser.print.min.js'
import 'leaflet/dist/leaflet.css'
import 'lib/Leaflet.PolylineMeasure'
import 'lib/Leaflet.PolylineMeasure.css'
import geodesy from 'leaflet-geodesy'

import 'leaflet-hotline'

import fontawesome from '@fortawesome/fontawesome'
import faDownload from '@fortawesome/fontawesome-free-solid/faDownload'
import faSearchPlus from '@fortawesome/fontawesome-free-solid/faSearchPlus'
import faUndo from '@fortawesome/fontawesome-free-solid/faUndo'

fontawesome.library.add(faDownload)
fontawesome.library.add(faSearchPlus)
fontawesome.library.add(faUndo)


export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  components: {
    upload,
  },
  data() {
    return {
      map: null,
      leafletFields: [],
      assignments: [],
      filteredAssignments: [],
      suboperationsTable: [],
      adderButtons: [],
      editorButtons: [],
      editorMainButton: [],
      fields: new L.FeatureGroup(),
      loading: true,
      fieldClickedId: null,
      fieldClickedName: null,
      fieldClickedPolygon: null,
      tabs: [
        { id: 0, name: 'Треки', key: 'tracks', active: false},
      ],
      tab: 'tracks',
      vuexFields: [],
      newPolygon: null,
      newPolygons: new L.FeatureGroup(),
      selectedFieldId: null,
      latLngs: [],
      markersNewPolygon: new L.FeatureGroup(),
      modeAddingPoints: false,
      modeEditNewPolygon: false,
      modeEditPoints: false,
      addNewPolygonBtnStatus: false,
      editNewPolygonBtnStatus: true,
      noneColor: 'rgba(170, 170, 170, 1)',
      polylines: [],
      leafletPolylines: new L.FeatureGroup(),
      disabled: false,
      firstColStyle: 'width: 30%;',
      exportMapVisible: false,
      kmlUrl: `${SERVER_URL}api/Kml/GetAllFieldsKML?id=${this.$root.context.organization}`,
      mpUrl: `${SERVER_URL}api/Kml/GetAllFieldsMP?id=${this.$root.context.organization}`,
      ndvi: null,
    }
  },
  created() {
    this.fetchEntities([
      'leafletFields',
      'fields',
      'assignments'
    ], this.afterFetch );
  },
  computed: {
    sidebarToggleState() {
      if (this.map){
        this.map._onResize()
        this.map.invalidateSize()
      }
      return this.$store.getters.getSidebarToggleState;
    },
  },
  methods: {
    filterAssignments() {
      this.filteredAssignments = this.assignments.filter(a => {
        if( a.fieldId == this.fieldClickedId) {
          return a
        }
      })
      this.groupSuboperationsTable()
    },
    groupSuboperationsTable() {
      this.suboperationsTable = []
      this.filteredAssignments.forEach(a => {
        let finded = this.suboperationsTable.findIndex(s => s.id == a.subOperationId)
        if (finded == -1) {
          this.suboperationsTable.push({
            id: a.subOperationId,
            name: a.subOperationName,
            assignments: [],
          })
        }
      })
      this.suboperationsTable.forEach(s => {
        this.filteredAssignments.forEach(a => {
          if (s.id == a.subOperationId){
            s.assignments.push(a)
          }
        })
      })
    },
    showTracks(assignments) {
      assignments.forEach(assignment => {
        this.showTrack(assignment, assignment.id)
      })
    },
    hideTracks(assignments) {
      assignments.forEach(assignment => {
        this.hideTrack(assignment, assignment.id)
      })
    },
    hideAllTracks(){
      this.filteredAssignments.forEach(assignment => {
        this.hideTrack(assignment, assignment.id)
      })
    },
    hideTrack(assignment, id) {
      this.polylines = this.polylines.filter(p => p.id != id)
      this.paintPolylines()
      assignment.show = false
      this.filterAssignments()
    },
    showTrack(assignment, id) {
      this.disabled = true
      assignment.loading = true
      let endpoint = 'leafletTracks/' + this.$root.context.organization
      http.get(endpoint, id)
        .then((data) => {
          this.addLeafletTrack(id, data)
          assignment.loading = false
          assignment.show = true
          this.disabled = false
          this.filterAssignments()
        })
        .catch((error) => {
          this.$message({
            message: `Нет данных`,
            type: "warning",
            duration: 500,
            showClose: false,
          });
          assignment.loading = false
          assignment.show = false
          this.disabled = false
        })
    },
    getColor() {
      return randomcolor()
    },
    addLeafletTrack(id, data) {
      let track = JSON.parse(data.track)
      let latLng = track.map(l => [l[0], l[1]])
      let polyline = L.polyline(latLng, {color: this.getColor(), weight: 2, fillOpacity: 0.5})
      polyline.id = id
      this.map.fitBounds(polyline.getBounds());
      this.polylines.push(polyline)
      this.paintPolylines()
    },
    removePolylines() {
      this.map.removeLayer(this.leafletPolylines)
    },
    paintPolylines() {
      this.removePolylines()
      this.leafletPolylines = new L.FeatureGroup()
      this.polylines.forEach(polyline => {
        this.leafletPolylines.addLayer(polyline)
      })
      this.map.addLayer(this.leafletPolylines)
    },
    afterFetch(){
      this.vuexFields = this.fromVuex('fields')
      this.leafletFields = this.fromVuex('leafletFields')
      this.assignments = this.fromVuex('assignments')
      this.modifyAssignments()
      this.loading = false
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
      }
    },
    modifyAssignments() {
      this.assignments.forEach(a => {
        a.formattedDateTime = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY");
        a.year = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("YYYY");
        a.areaFix = a.area.toFixed(2)
        a.show = false
        a.loading = false
      })
      this.assignments = this.assignments.filter(x => x.year == this.$root.context.year)
    },
    updateLeafletFields() {
      this.fetchEntities([
        'leafletFields'
      ], this.afterFetch );
    },
    initMap() {
      this.resetSettings();
      this.drawMap();
      this.drawFields();
      this.removePolylines();
    },
    drawMap() {
      if (this.map) this.map.remove();
      this._addLayers();
      this._addFieldsTooltipToggleButton();
      this._addScale();
      this._addRuler();
      this._addExport();
      this.resetAllModes();
      this._ifMapEditor();
    },
    resetAllModes() {
      this.offModeAddingPoints();
      this.offModeEditPoints();
      this.offModeEditNewPolygon();
      this.resetEditPolygons();
    },
    _ifMapEditor(){
      let endpoint = `account/userinfo/`;
      http.get(endpoint)
        .then(data => {
          if (data) {
            if (data.roles.includes('MapEditor')) {
              this._addFieldBoundariesEditor();
              this._addFieldBoundariesAdder();
              this._clickMapAddIcon();
            }
          }
        })
    },
    _addNDVIOverlay() {
      let bounds = [[50,65], [55,75]];
      let image = L.imageOverlay('http://i.imgur.com/KL994ik.png', bounds).addTo(this.map);
    },
    _addNDVI() {
      L.TileLayer.ndvi = L.TileLayer.extend({
        getTileUrl: (coords) => {
          return "https://gisgeography.com/wp-content/uploads/2014/12/pivot-irrigation-ndvi.png";
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
      let attribution = 'AgroStream';
      let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: attribution});
      let satellite = L.tileLayer.provider('Esri.WorldImagery', {attribution: attribution});
      //this._addNDVI()
      //"NDVI": this.ndvi
      let baseLayers = { "Спутник": satellite, "OpenStreetMaps": osm};
      this.map = L.map('map', {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
      L.control.layers(baseLayers).addTo(this.map);
      //this._addNDVIOverlay()
    },
    _addScale() {
      L.control.scale({maxWidth:240, metric:true, imperial:false, position: 'bottomleft'}).addTo(this.map);
    },
    _addRuler() {
      L.control.polylineMeasure({position:'topright', unit:'metres', clearMeasurementsOnStop: true}).addTo(this.map);
    },
    _addExport() {
      L.easyButton({
        position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'exportMap', onClick: this.exportMap, title: 'Экспорт карты', icon: 'fas fa-download'}]
      }).addTo(this.map);
    },
    exportMap() {
      this.openExportDialog()
    },
    _addFieldBoundariesAdder() {
      let saveBtn = L.easyButton({
        id: 'el-icon-check', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'save', onClick: this.saveAddings, title: 'Сохранить', icon: 'el-icon-check'}]
      }).addTo(this.map).disable();
      this.adderButtons.push(saveBtn)
      let cancelBtn = L.easyButton({
        id: 'el-icon-close', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'cancel', onClick: this.cancelEdits, title: 'Отменить', icon: 'el-icon-close'}]
      }).addTo(this.map).disable();
      this.adderButtons.push(cancelBtn)
    },
    _addFieldBoundariesEditor() {
      let editBtn = L.easyButton({
        id: 'el-icon-edit', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'edit', onClick: this.editFieldClickedPolygon, title: 'Редактировать', icon: 'el-icon-edit'}]
      }).addTo(this.map).disable();
      this.editorMainButton.push(editBtn)
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
    _clickMapAddIcon() {
      let latLngIcon = L.icon({iconUrl: require('assets/field_point.jpg'), iconSize: [22, 22], iconAnchor: [15, 25], popupAnchor: [0, -16]})
      this.map.on('click', (e) => {
        if (this.modeAddingPoints) {
          this.latLngs.push([e.latlng.lat, e.latlng.lng])
          let marker = L.marker([e.latlng.lat, e.latlng.lng], {icon: latLngIcon}).addTo(this.map);
          this.markersNewPolygon.addLayer(marker)
          this.map.removeLayer(this.markersNewPolygon)
          this.map.addLayer(this.markersNewPolygon)
          this.editNewPolygonBtnStatus = false
        }
      })
    },
    resetEditPolygons() {
      this.disableEditMainBtn()
      this.fieldClickedId = null
      this.fieldClickedName = null
      this.fieldClickedPolygon = null
      this.newPolygon = null
    },
    onModeAddingPoints() {
      this.resetEditPolygons()
      this.addNewPolygonBtnStatus = true
      this.modeAddingPoints = true
    },
    offModeAddingPoints() {
      this.modeAddingPoints = false
    },
    onModeEditPoints() {
      this.addNewPolygonBtnStatus = true
      this.modeEditPoints = true
    },
    offModeEditPoints() {
      this.modeEditPoints = false
    },
    onModeEditNewPolygon() {
      this.modeEditNewPolygon = true
    },
    offModeEditNewPolygon() {
      this.modeEditNewPolygon = false
    },
    addNewPolygon() {
      this.editNewPolygonBtnStatus = true
      this.offModeAddingPoints()
      this.onModeEditNewPolygon()
      this.map.removeLayer(this.markersNewPolygon)
      this.newPolygon = L.polygon(this.latLngs, {color: '#fff', fillColor: 'rgba(155,155,155,1)', weight: 1, fillOpacity: 0.7, className: ''})
      this.map.removeLayer(this.newPolygons)
      this.newPolygons = new L.FeatureGroup()
      this.newPolygons.addLayer(this.newPolygon)
      this.map.addLayer(this.newPolygons)
      this.map.setView(this.newPolygons.getBounds().getCenter(), 12)
      this.enableAddBtns()
      this.editPolygonPoints(this.newPolygon)
    },
    editFieldClickedPolygon() {
      this.onModeEditPoints()
      this.disableEditMainBtn()
      this.enableEditBtns()
      this.editPolygonPoints(this.fieldClickedPolygon)
    },
    enableAddBtns() {
      this.adderButtons.forEach(b => b.enable())
    },
    disableAddBtns() {
      this.adderButtons.forEach(b => b.disable())
    },
    enableEditBtns() {
      this.editorButtons.forEach(b => b.enable())
    },
    disableEditBtns() {
      this.editorButtons.forEach(b => b.disable())
    },
    enableEditMainBtn() {
      this.editorMainButton.forEach(b => b.enable())
    },
    disableEditMainBtn() {
      this.editorMainButton.forEach(b => b.disable())
    },
    editPolygonPoints(polygon) {
      polygon.enableEdit();
      polygon.on('click', function (e) {
        if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) {
          this.editor.newHole(e.latlng)
        }
      })
    },
    cancelEdits() {
      this.initMap()
    },
    saveAddings() {
      let kmlData = {
        fieldId: this.selectedFieldId,
        kml: tokml(this.newPolygon.toGeoJSON())
      }
      if (this.selectedFieldId) {
        this.loading = true
        http.post('kml/' + this.$root.context.organization , kmlData).then(() => {
          this.clearLocalForageForLeafletFields()
          this.$message({
            message: "Успешно добавлено в карту!",
            type: "success",
            duration: 3000,
            showClose: false,
          });
        }).catch((error) => {
          this.loading = false
        })
      } else {
        this.$message({
          message: "Выберите поле!",
          type: "warning",
          duration: 3000,
          showClose: false,
        });
      }
    },
    saveEdits() {
      let kmlData = {
        fieldId: this.fieldClickedId,
        kml: tokml(this.fieldClickedPolygon.toGeoJSON()),
        area: this.getArea(this.fieldClickedPolygon)
      }
      this.loading = true
      http.post('kml/' + this.$root.context.organization , kmlData).then(() => {
        this.clearLocalForageForLeafletFields()
        this.$message({
          message: "Успешно изменено!",
          type: "success",
          duration: 3000,
          showClose: false,
        })
      }).catch((error) => {
        this.loading = false
      });
    },
    resetSettings() {
      this.addNewPolygonBtnStatus = false
      this.editNewPolygonBtnStatus = true
      this.selectedFieldId = null
      this.latLngs = []
      this.markersNewPolygon = new L.FeatureGroup()
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
    showFieldsTooltips(control) {
      let activeFields = this.fields
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
      let activeFields = this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        })
        this.map.fitBounds(activeFields.getBounds());
        control.state('show-fields-tooltips');
      }
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
          let normalStyle = {color: '#000', fillColor: 'rgba(140, 140, 140, 1)', weight: 1, fillOpacity: 0.7, className: ''}
          let polygon = L.polygon(latLng, normalStyle);
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.on('mouseover', () => {polygon.setStyle({fillColor: 'rgba(255, 255, 255, 1)'})})
          polygon.on('mouseout', () => {polygon.setStyle({fillColor: 'rgba(140, 140, 140, 1)' })})
          polygon.on('click', () => {
            if (!this.modeEditPoints && !this.modeAddingPoints && !this.modeEditNewPolygon) {
              polygons.forEach(p => {
                p.setStyle(normalStyle)
              })
              polygon.setStyle({color: '#fc8b00', fillColor: 'rgba(200, 200, 200, 1)'})
              this.fieldClickedId = field.fieldId
              this.fieldClickedName = field.fieldName
              this.fieldClickedPolygon = polygon
              this.filterAssignments()
              this.closeSpoilers()
              this.enableEditMainBtn()
            }
          })
          this.fields.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.fields);

        if (polygons.length) {
          this.map.setView(this.fields.getBounds().getCenter(), 12);

          this.fields.eachLayer(polygon => {
            polygon.bindTooltip(polygon.label, { permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
          })
        }
      }
    },
    changeTab(tab, id){
      this.tabs.forEach(t => t.active = false)
      this.tabs[id].active = true
      this.tab = tab
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(0);
    },
    closeSpoilers(){
      $('.fx-spoiler').hide();
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
    },
    clearLocalForageForLeafletFields() {
      const organization = this.$root.context.organization
      const path = `data/leafletfields/${organization}`
      localforage.removeItem(path)
        .then(() => {
          this.updateLeafletFields()
        })
        .catch((err) => {
        });
    },
    openExportDialog() {
      this.exportMapVisible = true
    },
  }
}

</script>

<style lang="stylus" scoped>
.workspace
  padding 0

#svgs
  position fixed
  top 0px
  left 0px
  z-index 0

#map-container
  height calc(100% - 280px)
  width 100%
  position relative
  box-sizing border-box
  border 1px solid #323232

.panel-bottom
  height 250px
  position static

#map
  height 100%
  width 100%
  box-sizing border-box

.fx-cell-edit
  position absolute
  bottom 1px
  right 1px
  height 22px
  width 28px
  padding 2px
  cursor pointer
  border-radius 4px
  border 1px solid #dfe6ec
  box-sizing border-box

.new-polygon-title
  border-top 1px solid #323232
  padding-top 20px
  font-size 14px
  line-height 14px
  font-weight bold
  margin 0

.tab-block
  box-sizing border-box
  padding 0 20px
  width 100%
  h3
    margin 20px 0 -5px
    font-size 16px
  &-full
    padding 0
    h4
      margin 5px 0 5px
      font-size 14px
      text-align center
    h3
      margin 20px 0px -5px 20px
      font-size 16px

.fx-plus
  color #20a0ff
</style>

