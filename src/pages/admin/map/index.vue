<template lang="pug">
.cols(v-loading="loading", element-loading-text="Загрузка...")

  el-dialog(:visible.sync="dialogCutShow", title="Имеется пересечение с другим полем.", size="tiny")
    map-cut-polygon(:response="mapCutResponse")

  el-dialog(:visible.sync="exportMapVisible", title="Экспорт карты", size="tiny")
    export-map(title="Скачать KML", :url="`Kml/GetAllFieldsKML?id=${this.$root.context.organization}`", filename="maps.kml")
    export-map(title="Скачать MP", :url="`Kml/GetAllFieldsMP?id=${this.$root.context.organization}`", filename="maps.mp")
  sidebar-toggle
  transition(name="slide-fade")
    el-menu.sidebar(
      v-if="sidebarToggleState"
      style="position: relative;"
    )
      field-filter(:fields="vuexFields")

  .workspace
    #map-container
      #map

    .panel-bottom(v-if="ready", :class="{'rerender': rerender}")

      .tab-block-full(v-if="tab === 'new-polygon'")
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

        h3(v-else, style="text-align: center;") Выберите поле

      .tab-block-full(v-else-if="tab === 'upload-kml'")
        upload-kml(v-if="ready", :fieldId="fieldClickedId")

      .tab-block-full(v-else-if="tab === 'upload-axo'")
        upload-axo(v-if="ready", :fieldId="fieldClickedId", :kml="getClickedFieldKml")

    .fx-tabs(v-if="ready")
      .fx-tab(v-for="item in tabs", @click="changeTab(item.key, item.id)", :class="{ 'fx-tab-active': item.active }") {{ item.name }}

      .fx-tab-controls(v-if="tab === 'new-polygon'")
        span.area(v-if="newPolygon", style="margin-left: 5px;") {{ getArea(newPolygon) }} га
        el-button(@click="onModeAddingPoints", type="primary", :disabled="addNewPolygonBtnStatus", size="small") Добавить точки
        el-button(@click="addNewPolygon", type="primary", :disabled="editNewPolygonBtnStatus", size="small") Редактировать

</template>

<script>
import {EventBus} from "services/EventBus"
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import MapCutPolygon from "components/map/MapCutPolygon"
import MapCutPolygonMixin from "components/map/MapCutPolygonMixin"
import moment from "moment"
import randomcolor from "randomcolor"
import UploadKml from "components/map/UploadKml"
import UploadAxo from "components/map/UploadAxo"
import ExportMap from "components/map/ExportMap"
import FieldFilter from "components/map/FieldFilter"
import MapDrawer from "./MapDrawer"
import FieldDrawer from "./FieldDrawer"
import TrackDrawer from "./TrackDrawer"
import $ from "jquery";
import sidebarToggle from "components/sidebarToggle"
import L from "leaflet"
import tokml from "tokml"
import "leaflet-editable"
import "leaflet-providers"
import "leaflet-easybutton"
import "leaflet.browser.print/dist/leaflet.browser.print.min.js"
import "leaflet/dist/leaflet.css"
import "lib/Leaflet.PolylineMeasure"
import "lib/Leaflet.PolylineMeasure.css"
import geodesy from "leaflet-geodesy"

import "leaflet-hotline"

import fontawesome from "@fortawesome/fontawesome"
import faDownload from "@fortawesome/fontawesome-free-solid/faDownload"
import faSearchPlus from "@fortawesome/fontawesome-free-solid/faSearchPlus"
import faUndo from "@fortawesome/fontawesome-free-solid/faUndo"

fontawesome.library.add(faDownload)
fontawesome.library.add(faSearchPlus)
fontawesome.library.add(faUndo)

export default {
  mixins: [
    ListController,
    MapCutPolygonMixin,
    MapDrawer,
    FieldDrawer,
    TrackDrawer
  ],
  components: {
    UploadKml,
    UploadAxo,
    MapCutPolygon,
    ExportMap,
    FieldFilter,
    sidebarToggle,
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
      ready: false,
      loading: true,
      fieldClickedId: null,
      fieldClickedName: null,
      fieldClickedPolygon: null,
      tabs: [
        {id: 0, name: "Отрисовка полигона", key: "new-polygon", active: true},
        {id: 1, name: "Загрузка полигона", key: "upload-kml", active: false},
        {id: 2, name: "Загрузка АХО", key: "upload-axo", active: false}
      ],
      tab: "new-polygon",
      vuexFields: [],
      newPolygon: null,
      newPolygons: new L.FeatureGroup(),
      latLngs: [],
      markersNewPolygon: new L.FeatureGroup(),
      modeAddingPoints: false,
      modeEditNewPolygon: false,
      modeEditPoints: false,
      addNewPolygonBtnStatus: false,
      editNewPolygonBtnStatus: true,
      noneColor: "rgba(170, 170, 170, 1)",
      disabled: false,
      firstColStyle: "width: 30%;",
      exportMapVisible: false,
      rerender: false,
      ndvi: null,
    }
  },
  created() {
    EventBus.$on("MapCutPolygonOpenDialog", (res) => {
      this.openDialogMapCutPolygon(res)
    })
    fetchEntities([
      "leafletFields",
      "fields",
      "assignments"
    ], this.afterFetch );
  },
  watch: {
    sidebarToggleState() {
      if (this.map){
        this.map._onResize()
        this.map.invalidateSize()
      }
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
    getClickedFieldKml() {
      let kml = []
      if (this.fieldClickedId) {
        let found = this.leafletFields.find(leaflet => leaflet.fieldId === this.fieldClickedId)
        if (found) {
          kml = JSON.parse(found.kml)
          kml = kml[0]
        }
      }
      return kml
    }
  },
  methods: {
    afterFetch(){
      this.vuexFields = fromVuex("fields")
      this.leafletFields = fromVuex("leafletFields")
      this.assignments = fromVuex("assignments")
      this.modifyAssignments()
      this.loading = false
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
      }
      this.ready = true
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
            if (data.roles.includes("MapEditor")) {
              this._addFieldBoundariesEditor();
              this._addFieldBoundariesAdder();
              this._clickMapAddIcon();
            }
          }
        })
    },
    _clickMapAddIcon() {
      let latLngIcon = L.icon({iconUrl: require("assets/field_point.jpg"), iconSize: [22, 22], iconAnchor: [15, 25], popupAnchor: [0, -16]})
      this.map.on("click", (e) => {
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
      this.newPolygon = L.polygon(this.latLngs, {color: "#fff", fillColor: "rgba(155,155,155,1)", weight: 1, fillOpacity: 0.7, className: ""})
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
      polygon.on("click", function (e) {
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
        fieldId: this.fieldClickedId,
        kml: tokml(this.newPolygon.toGeoJSON())
      }
      if (this.fieldClickedId) {
        this.loading = true
        http.post("kml/" + this.$root.context.organization, kmlData).then(() => {
          this.clearLocalForageForLeafletFields()
          this.$message({
            message: "Успешно добавлено в карту!",
            type: "success",
            duration: 3000,
            showClose: false,
          });
        }).catch((error) => {
          this.loading = false
          if (error.response.status === 409){
            this.openDialogMapCutPolygon(error.response)
          }
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
      http.post("kml/" + this.$root.context.organization, kmlData).then(() => {
        this.clearLocalForageForLeafletFields()
        this.$message({
          message: "Успешно изменено!",
          type: "success",
          duration: 3000,
          showClose: false,
        })
      }).catch((error) => {
        this.loading = false
        if (error.response.status === 409){
          this.openDialogMapCutPolygon(error.response)
        }
      })
    },
    resetSettings() {
      this.addNewPolygonBtnStatus = false
      this.editNewPolygonBtnStatus = true
      this.latLngs = []
      this.markersNewPolygon = new L.FeatureGroup()
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
      $(".fx-spoiler").hide();
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
    },
    openExportDialog() {
      this.exportMapVisible = true
    },
    reRender() {
      this.rerender = !this.rerender
    },
    getColor() {
      return randomcolor()
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

