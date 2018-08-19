<template lang="pug">
.cols.map-custom(v-loading="loading")
  el-dialog(:visible.sync="exportMapVisible", title="Экспорт карты посева", size="tiny")
    export-map(title="Скачать KML", :url="`Kml/GetAllSeedLimitKML?id=${this.$root.context.organization}`", filename="seedlimitmaps.kml")
    export-map(title="Скачать MP", :url="`Kml/GetAllSeedLimitMP?id=${this.$root.context.organization}`", filename="seedlimitmaps.mp")
  sidebar-toggle
  transition(name="slide-fade")
    el-menu.sidebar(
      v-if="sidebarToggleState"
      style="background: #fff"
    )
      main-filter
  .workspace
    #map-container(:class="{'map-active': showPanelBottom}")
      h1.map-print-title(v-show="mapPrintState == 'started'", leaflet-browser-print-content) {{mapPrintTitle}}
      #map
      .map-filter-culture(v-if="seedlimitOverlaySelected")
        el-select(v-model="seedlimitSelectedCulture", clearable, placeholder="Культуры...")
          el-option(v-for="culture in legendCultures", :key="culture.id", :label="`${culture.name}(${culture.area}га)`", :value="culture.id", :style="{color: culture.color}")
      .map-filter-work(v-if="workOverlaySelected")
        el-select(v-model="workOverlaySelectedWork", clearable, placeholder="Выберите тип работ", v-loading="loadingWorkOverlay")
          el-option(v-for="work in workOverlayWorks", :key="work.key", :label="work.value", :value="work.key")
      .map-date
        el-date-picker(v-model="mapDate", format="dd.MM.yyyy HH:mm", type="datetime", v-loading="loadingWorkOverlay")
      .traktor-panel(v-if="isTraktorPanelShown")
        el-button(@click="startTraktor()", v-if="isTraktorPaused") &#9658;
        el-button(@click="pauseTraktor()", v-else) ⏸
        el-button(@click="stopTraktor()") ⏹
        el-button(@click="speedDownTraktor()", v-if="isTraktorSpeed") 1x
        el-button(@click="speedUpTraktor()", v-else) 10x
        el-slider(v-model="sliderStep", :format-tooltip="formatTooltip", :max="traktorTimeLength")

      legends(v-if="showPanelLegend", :legends="legendCultures")

    .panel-bottom(:class="{'map-active': showPanelBottom}")
      .tab-block-full(v-if="tabActive === 'passport'")
        passport(:fieldId="filterField", :orientation="true" )
      .tab-block-full(v-else-if="tabActive === 'history'")
        sevoborot(:fieldClickedId="filterField")
      .tab-block-full(v-else-if="tabActive === 'weediness'")
        field-weediness(:id="filterField")
      .tab-block-full(v-else-if="tabActive === 'soilresearches'")
        soil-researches(:id="filterField")
      .tab-block-full(v-else-if="tabActive === 'field-assignments'")
        field-assignments(:id="filterField", :seedlimits="seedlimits", :fields="vuexfields")

      .tab-block-full(v-else-if="tabActive === 'car-actions'")
        car-actions(:ids="filterCars")
      .tab-block-full(v-else-if="tabActive === 'car-info'")
        car-information(:ids="filterCars")
      .tab-block-full(v-else-if="tabActive === 'car-gps'")
        cargps(:ids="filterCars")
      .tab-block-full(v-else-if="tabActive === 'car-assignments'")
        car-assignments(:ids="filterCars")

      .tab-block-full(v-else-if="tabActive === 'employee-assignments'")
        employee-assignments(:id="filterEmployee")

      .tab-block-full(v-if="tabActive === 'date-assignments'")
        date-assignments(:date="mapDate")
      .tab-block-full(v-else-if="tabActive === 'car-status'")
        car-status(:carstatus="carstatus")

    .fx-tabs
      .fx-tab(v-for="item in tabs", @click="changeTab(item.key, item.id)", :class="{ 'fx-tab-active': item.active }") {{ item.name }}

</template>

<script>
import MainFilter from "./MainFilter";
import FieldWeediness from "./Tabs/FieldWeediness";
import SoilResearches from "./Tabs/SoilResearches";
import DateAssignments from "./Tabs/DateAssignments";
import FieldAssignments from "./Tabs/FieldAssignments";
import EmployeeAssignments from "./Tabs/EmployeeAssignments";
import CarAssignments from "./Tabs/CarAssignments";
import CarInformation from "./Tabs/CarInformation";
import Cargps from "./Tabs/Cargps";
import CarActions from "./Tabs/CarActions";
import CarStatus from "./Tabs/CarStatus";
import MapDrawer from "./Drawers/MapDrawer";
import FieldDrawer from "./Drawers/FieldDrawer";
import SeedlimitOverlayDrawer from "./Drawers/SeedlimitOverlayDrawer";
import WorkOverlayDrawer from "./Drawers/WorkOverlayDrawer";
import CarDrawer from "./Drawers/CarDrawer";
import TrackDrawer from "./Drawers/TrackDrawer";
import passport from "components/fieldpassport/passport";
import sevoborot from "components/panelbottom/sevoborot";
import legends from "components/map/legends";
import ExportMap from "components/map/ExportMap";
import sidebarToggle from "components/sidebarToggle"
import http from "services/http"
import {EventBus} from "services/EventBus";
import {fetchEntities, fromVuex} from "services/RecordsLoader";
import ListController from "mixins/ListController";
import moment from "moment";
import {deepClone} from "lib/utils";

import L from "leaflet";
import tokml from "tokml"
import "leaflet-editable";
import "leaflet-providers";
import "leaflet-easybutton";
import "leaflet.browser.print/dist/leaflet.browser.print.min.js";
import "leaflet.fullscreen";
import "leaflet-groupedlayercontrol";
import "leaflet/dist/leaflet.css";
import "lib/Leaflet.PolylineMeasure";
import "lib/Leaflet.PolylineMeasure.css";
import geodesy from "leaflet-geodesy";
import "leaflet-hotline";

import fontawesome from "@fortawesome/fontawesome";
import faDownload from "@fortawesome/fontawesome-free-solid/faDownload";
import faSearchPlus from "@fortawesome/fontawesome-free-solid/faSearchPlus";
import faUndo from "@fortawesome/fontawesome-free-solid/faUndo";

fontawesome.library.add(faDownload)
fontawesome.library.add(faSearchPlus)
fontawesome.library.add(faUndo)

export default {
  mixins: [
    ListController,
    MapDrawer,
    FieldDrawer,
    SeedlimitOverlayDrawer,
    WorkOverlayDrawer,
    CarDrawer,
    TrackDrawer
  ],
  components: {
    MainFilter,
    passport,
    sevoborot,
    FieldWeediness,
    SoilResearches,
    DateAssignments,
    FieldAssignments,
    EmployeeAssignments,
    CarAssignments,
    CarInformation,
    CarActions,
    Cargps,
    CarStatus,
    legends,
    ExportMap,
    sidebarToggle,
  },
  data() {
    return {
      map: null,
      mapDate: null,
      areaassignments: [],
      carstatus: [],
      leafletFields: [],
      legend: [],
      seedlimits: [],
      vuexcars: [],
      vuexfields: [],
      seedlimitcoordinates: [],
      legendCultures: [],
      tabActive: "date-assignments",
      tabs: [],
      constTabs: {
        def: [
          {id: 0, name: "Задания", key: "date-assignments", active: true},
          {id: 1, name: "Статус", key: "car-status", active: false},
        ],
        car: [
          {id: 0, name: "Задания", key: "car-assignments", active: true},
          {id: 1, name: "Информация", key: "car-info", active: false},
          {id: 2, name: "Действия", key: "car-actions", active: false},
          {id: 3, name: "GPS", key: "car-gps", active: false}
        ],
        cars: [
          {id: 0, name: "Задания", key: "car-assignments", active: true},
          {id: 1, name: "GPS", key: "car-gps", active: false}
        ],
        field: [
          {id: 0, name: "Паспорт поля", key: "passport", active: true},
          {id: 1, name: "История", key: "history", active: false},
          {id: 2, name: "Засоренность", key: "weediness", active: false},
          {id: 3, name: "Питательные вещества", key: "soilresearches", active: false},
          {id: 4, name: "Задания", key: "field-assignments", active: false},
        ],
        employee: [
          {id: 0, name: "Задания", key: "employee-assignments", active: true},
        ],
      },
      mapPrintTitle: `Карта на ${this.$root.context.year} год`,
      mapPrintState: "",
      showPanelBottom: true,
      showPanelLegend: false,
      exportMapVisible: false,
      seedlimitOverlaySelected: false,
      workOverlaySelected: false,
      editorMainButton: null,
      editorButtons: [],
      editorSeedButton: null,
      editorSeedButtons: [],
      legendButton: null,
      loadingWorkOverlay: true,
      loading: true,

      leafletTracks: [],
      traktorTracks: [],
      traktorTime: [],
      traktorTimeLength: 0,
      isTraktorPanelShown: false,
      isTraktorSpeed: false,
      isTraktorPaused: true,
      sliderStep: 0,

      fields: new L.FeatureGroup(),
      seedlimitLayers: new L.featureGroup(),
      workLayers: new L.featureGroup(),
      selectedSeedLayer: null,
      selectedLayer: null,
      selectedLayerAssignment: null,
      normalStyle: {color: "#000", fillColor: "rgba(140, 140, 140, 1)", weight: 1, fillOpacity: 0.7, className: ""},
      selectedStyle: {color: "#20a0ff", fillColor: "rgba(200, 200, 200, 1)", weight: 4, fillOpacity: 0.7, className: ""}
    }
  },
  created() {
    this.setDatesToContextYear()
    this.mapDate = this.$store.getters.getMapDate
    this.tabs = deepClone(this.constTabs[this.filterBy])
    fetchEntities([
      "leafletFields",
      "cars",
      "legend",
      "seedlimits",
      "fields",
      "seedlimitcoordinates"
    ], this.afterFetch );
    this.fetchAsyncAreaAssignments()
    this.fetchAsyncCarStatus()
    EventBus.$on("MapChangeTabs", () => {
      this.tabs = deepClone(this.constTabs[this.filterBy])
      this.tabActive = this.tabs[0].key
    })
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
    filterBy() {
      return this.$store.getters.getFilterBy
    },
    filterField() {
      return this.$store.getters.getFilterField
    },
    filterCars() {
      return this.$store.getters.getFilterCars
    },
    filterEmployee() {
      return this.$store.getters.getFilterEmployee
    },
  },
  watch: {
    "selectedLayer" (val) {
      if (val) {
        this.editorMainButton.enable()
      } else {
        this.editorMainButton.disable()
      }
    },
    "selectedSeedLayer" (val) {
      if (val) {
        this.editorSeedButton.enable()
      } else {
        this.editorSeedButton.disable()
      }
    },
    "mapDate" (val) {
      this.resetWorkOverlay()
      EventBus.$emit("MapDateChanged", val)
    },
    "sidebarToggleState" () {
      if (this.map){
        this.map._onResize()
        this.map.invalidateSize()
      }
    },
  },
  methods: {
    afterFetch(){
      this.legend = fromVuex("legend")
      this.seedlimits = fromVuex("seedlimits")
      this.vuexcars = fromVuex("cars")
      this.vuexfields = fromVuex("fields")
      this.leafletFields = fromVuex("leafletFields")
      this.seedlimitcoordinates = fromVuex("seedlimitcoordinates")
      this.modifyLeafletFields()
      this.modifySeedLimitCoordinates()
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
      }
      this.loading = false
    },
    fetchAsyncAreaAssignments() {
      fetchEntities([
        "areaassignments",
      ], this.afterFetchAssignments);
    },
    afterFetchAssignments() {
      this.areaassignments = fromVuex("areaassignments")
      this.checkRoute()
    },
    fetchAsyncCarStatus() {
      fetchEntities([
        "carstatus",
      ], this.afterFetchCarStatus);
    },
    afterFetchCarStatus() {
      this.carstatus = fromVuex("carstatus")
    },
    fetchSeedlimitCoordinates() {
      fetchEntities([
        "seedlimitcoordinates"
      ], this.afterSeedLimitCoordinatesFetch );
    },
    afterSeedLimitCoordinatesFetch(){
      this.seedlimitcoordinates = fromVuex("seedlimitcoordinates")
      this.modifySeedLimitCoordinates()
      this.initMap()
      this.loading = false
    },
    modifyLeafletFields() {
      this.leafletFields.forEach(leaflet => {
        leaflet.seedlimits = []
        this.seedlimits.forEach(seedlimit => {
          if (seedlimit.fieldId === leaflet.fieldId){
            this.addLegendCultures(seedlimit)
            let seedlimitObj = {
              cultureId: seedlimit.cultureId,
              cultureName: seedlimit.cultureName,
              color: this.getColorFromLegend(seedlimit.cultureId),
              area: seedlimit.area,
            }
            leaflet.seedlimits.push(seedlimitObj)
          }
        })
      })
    },
    modifySeedLimitCoordinates() {
      this.seedlimitcoordinates.forEach(seed => {
        let found = this.seedlimits.find(s => s.id === seed.seedLimitId)
        if (found) {
          seed.fieldName = found.fieldNewName
          seed.fieldId = found.fieldId
          seed.cultureName = found.cultureName
          seed.cultureId = found.cultureId
          seed.label = `${seed.fieldName}</br> ${seed.cultureName}(${seed.area.toFixed(2)})`
          seed.color = this.getColorFromLegend(seed.cultureId)
        }
      })
    },
    setDatesToContextYear() {
      this.$store.dispatch("actionSetMapDate", moment().year(this.$root.context.year).format())
      this.$store.dispatch("actionSetGpsStart", moment().year(this.$root.context.year).hour(8).minute(0).second(0).subtract(1, "days").format())
      this.$store.dispatch("actionSetGpsEnd", moment().year(this.$root.context.year).endOf("day").format())
    },
    checkRoute() {
      if (this.$route.query.carId){
        let carId = +this.$route.query.carId
        let eventObj = {id: carId, type: "car"}
        EventBus.$emit("MapApplyFilter", eventObj)
      }
      if (this.$route.query.tab && this.$route.query.tabNum) {
        this.changeTab(this.$route.query.tab, +this.$route.query.tabNum)
      }
      if (this.$route.query.assignmentId) {
        let assignmentId = Number(this.$route.query.assignmentId)
        let found = this.areaassignments.find(a => a.id === assignmentId)
        if (found) {
          let carId = found.carId
          let eventObj = {id: carId, type: "car"}
          EventBus.$emit("MapApplyFilter", eventObj)
          EventBus.$emit("MapShowLeafletTrack", assignmentId)
        } else {
          this.$message({
            message: `Задание с id = ${assignmentId} - не найдено`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        }
      }
    },
    addLegendCultures(seedlimit) {
      let found = this.legendCultures.find(culture => culture.id === seedlimit.cultureId)
      if (found) {
        found.area += seedlimit.area
      } else {
        this.legendCultures.push({
          id: seedlimit.cultureId,
          name: seedlimit.cultureName,
          area: seedlimit.area,
          color: this.getColorFromLegend(seedlimit.cultureId)
        })
      }
    },
    initMap() {
      this.drawMap();
      this._drawFields();
      this._addSeedlimitOverlay();
      this._addWorkOverlay();
      this.resetSettings()
    },
    resetSettings() {
      this.$store.dispatch("actionSetModeEditPoints", false)
      this.removeTracks()
    },
    drawMap() {
      if (this.map) this.map.remove();
      this._addLayers();
      this._addFullscreen();
      this._addFieldsTooltipToggleButton();
      this._addScale();
      this._addRuler();
      this._addPrinterTitle();
      this._addPrinter();
      this._addExport();
      this._addPanelBtns();
      this._addCheckboxEvents();
      this.ifMapEditor();
    },
    ifMapEditor(){
      let endpoint = `account/userinfo/`;
      http.get(endpoint)
        .then(data => {
          if (data) {
            if (data.roles.includes("MapEditor")) {
              this._addFieldBoundariesEditor();
              this._addSeedBoundariesEditor();
            }
          }
        })
    },
    editSelectedLayer() {
      let checkAssignments = this.$store.getters.getLegendAssignments
      this.selectedLayerAssignment = checkAssignments.length > 0 ? this.areaassignments.find(a => a.id === checkAssignments[0].id) : null
      if (checkAssignments.length === 1 && this.selectedLayerAssignment.fieldId === this.selectedLayer.id && this.selectedLayerAssignment.seedLimitId != 0) {
        this.enableEditBtns()
        this.editPolygonPoints(this.selectedLayer)
      } else {
        this.$message({
          message: `Выберите один трек посевной работы этого поля!`,
          type: "info",
          duration: 5000,
          showClose: false,
        });
      }
    },
    editPolygonPoints(polygon) {
      this.$store.dispatch("actionSetModeEditPoints", true)
      polygon.enableEdit()
      polygon.on("click", function (e) {
        if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) {
          this.editor.newHole(e.latlng)
        }
      })
    },
    saveEdits() {
      let kmlData = {
        seedLimitId: this.selectedLayerAssignment.seedLimitId,
        kml: tokml(this.selectedLayer.toGeoJSON())
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
    cancelEdits() {
      this.initMap()
    },
    enableEditBtns() {
      this.editorButtons.forEach(b => b.enable())
    },
    disableEditBtns() {
      this.editorButtons.forEach(b => b.disable())
    },
    changeTab(tab, id){
      this.tabs.forEach(t => t.active = false)
      this.tabs[id].active = true
      this.tabActive = tab
    },
    formatTooltip(val) {
      if (this.traktorTime[val]){
        return moment(this.traktorTime[val], "YYYY-MM-DDTHH:mm:ss").format("YYYY/MM/DD HH:mm:ss")
      }
      return "нет даты";
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
    },
    getColorFromLegend(id) {
      let legend = this.legend.find(x => x.itemId === id)
      return legend.rgbColor
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
  height 100%
  width 100%
  position relative
  box-sizing border-box
  border 1px solid #323232
  &.map-active
    height calc(100% - 250px)

.panel-bottom
  display none
  height 250px
  position static
  &.map-active
    display block

#map
  height 100%
  width 100%
  box-sizing border-box
  z-index 2

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

.map-print-title
  text-align center
</style>

