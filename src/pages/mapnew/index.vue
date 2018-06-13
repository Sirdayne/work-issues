<template lang="pug">
.cols(v-loading="loading", element-loading-text="Загрузка...")
  el-dialog(:visible.sync="exportMapVisible", title="Экспорт карты посева", size="tiny")
    el-button-group
      a(:href="kmlUrl", download="map.kml")
        el-button Скачать KML
      a(:href="mpUrl", download="map.mp")
        el-button Скачать MP

  el-menu.sidebar(
    v-if="sidebarToggleState"
    style="background: #fff"
  )
    main-filter
  .workspace
    #map-container(:class="{'map-active': showPanelBottom}")
      #map
      .map-date
        el-date-picker(v-model="mapDate", format="dd.MM.yyyy HH:mm", type="datetime")
      .traktor-panel(v-if="isTraktorPanelShown")
        el-button(@click="startTraktor()", v-if="isTraktorPaused") &#9658;
        el-button(@click="pauseTraktor()", v-else) ⏸
        el-button(@click="stopTraktor()") ⏹
        el-button(@click="speedDownTraktor()", v-if="isTraktorSpeed") 1x
        el-button(@click="speedUpTraktor()", v-else) 10x
        el-slider(v-model="sliderStep", :format-tooltip="formatTooltip", :max="traktorTimeLength")

    .panel-bottom(:class="{'map-active': showPanelBottom}")
      p {{ filterBy }} {{ filterCars }} {{ filterField }} {{ filterEmployee }}
      .tab-block-full(v-if="tabActive === 'passport'")
        passport(:fieldId="filterField", :orientation="true" )
      .tab-block-full(v-else-if="tabActive === 'history'")
        sevoborot(:fieldClickedId="filterField")
      .tab-block-full(v-else-if="tabActive === 'weediness'")
        field-weediness(:id="filterField")
      .tab-block-full(v-else-if="tabActive === 'soilresearches'")
        soil-researches(:id="filterField")
      .tab-block-full(v-else-if="tabActive === 'field-assignments'")
        field-assignments(:id="filterField")

      .tab-block-full(v-else-if="tabActive === 'car-status'")
        car-status

      .tab-block-full(v-else-if="tabActive === 'car-actions'")
        car-actions(:ids="filterCars")
      .tab-block-full(v-else-if="tabActive === 'car-info'")
        car-information(:ids="filterCars")

      .tab-block-full(v-else-if="tabActive === 'car-gps'")
        cargps(:ids="filterCars")

    .fx-tabs
      .fx-tab(v-for="item in tabs", @click="changeTab(item.key, item.id)", :class="{ 'fx-tab-active': item.active }") {{ item.name }}

</template>

<script>
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment';
import FieldDrawer from './Drawers/FieldDrawer'
import CarDrawer from './Drawers/CarDrawer'
import TrackDrawer from './Drawers/TrackDrawer'
import {deepClone} from 'lib/utils'

import MainFilter from "./MainFilter";
import passport from "components/agromap/field/fieldpassport/passport"
import sevoborot from "components/panelbottom/sevoborot"
import FieldWeediness from "./Tabs/FieldWeediness"
import SoilResearches from "./Tabs/SoilResearches"
import FieldAssignments from "./Tabs/FieldAssignments"

import CarInformation from "./Tabs/CarInformation"
import Cargps from "./Tabs/Cargps"
import CarActions from "./Tabs/CarActions"
import CarStatus from "./Tabs/CarStatus"

import L from 'leaflet'
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
    ListController,
    FieldDrawer,
    CarDrawer,
    TrackDrawer
  ],
  components: {
    MainFilter,
    passport,
    sevoborot,
    FieldWeediness,
    SoilResearches,
    FieldAssignments,
    CarInformation,
    CarActions,
    Cargps,
    CarStatus
  },
  data() {
    return {
      map: null,
      mapDate: this.$store.getters.getMapDate,
      leafletFields: [],
      vuexcars: [],
      tabActive: 'assignments',
      tabs: [],
      constTabs: {
        def: [
          { id: 0, name: 'Задания', key: 'car-assignments', active: true },
          { id: 1, name: 'Статус', key: 'car-status', active: false },
        ],
        car: [
          { id: 0, name: 'Задания', key: 'car-assignments', active: true },
          { id: 1, name: 'Информация', key: 'car-info', active: false },
          { id: 2, name: 'Действия', key: 'car-actions', active: false },
          { id: 3, name: 'GPS', key: 'car-gps', active: false }
        ],
        cars: [
          { id: 0, name: 'Задания', key: 'car-assignments', active: true },
          { id: 1, name: 'GPS', key: 'car-gps', active: false }
        ],
        field: [
          { id: 0, name: 'Паспорт поля', key: 'passport', active: true },
          { id: 1, name: 'История', key: 'history', active: false },
          { id: 2, name: 'Засоренность', key: 'weediness', active: false },
          { id: 3, name: 'Питательные вещества', key: 'soilresearches', active: false },
          { id: 4, name: 'Задания', key: 'field-assignments', active: false },
        ],
        employee: [
          { id: 0, name: 'Задания', key: 'employee-assignments', active: true },
        ],
      },
      fields: new L.FeatureGroup(),
      mapPrintTitle: `Карта на ${this.$root.context.year} год`,
      mapPrintState: "",
      showPanelBottom: true,
      exportMapVisible: false,
      kmlUrl: `${SERVER_URL}api/Kml/GetAllSeedLimitKML?id=${this.$root.context.organization}`,
      mpUrl: `${SERVER_URL}api/Kml/GetAllSeedLimitMP?id=${this.$root.context.organization}`,

      tracksData: [],
      traktorTracks: [],
      traktorTime: [],
      traktorTimeLength: 0,
      isTraktorPanelShown: false,
      isTraktorSpeed: false,
      isTraktorPaused: true,
      sliderStep: 0,

      selectedField: null,

      loading: true,
    }
  },
  created() {
    this.tabs = deepClone(this.constTabs[this.filterBy])
    this.fetchEntities([
      'leafletFields',
      'cars'
    ], this.afterFetch );
    EventBus.$on('MapChangeTabs', () => {
      this.tabs = deepClone(this.constTabs[this.filterBy])
      this.tabActive = this.tabs[0].key
    })
  },
  computed: {
    sidebarToggleState() {
      if (this.map){
        this.map._onResize()
        this.map.invalidateSize()
      }
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
  methods: {
    afterFetch(){
      this.vuexcars = this.fromVuex('cars')
      this.leafletFields = this.fromVuex('leafletFields')
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
      }
      this.loading = false
    },
    initMap() {
      this.drawMap();
      this._drawFields();
    },
    drawMap() {
      if (this.map) this.map.remove();
      this.addLayers();
      this.addFullscreen();
      this.addFieldsTooltipToggleButton();
      this.addScale();
      this.addRuler();
      this.addPrinterTitle();
      this.addPrinter();
      this.addExport();
      this.addPanelBtn();
    },
    addLayers() {
      let attribution = 'AgroStream';
      let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: attribution});
      let satellite = L.tileLayer.provider('Esri.WorldImagery', {attribution: attribution});
      let baseLayers = { "Спутник": satellite, "OpenStreetMaps": osm};
      this.map = L.map('map', {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
      L.control.layers(baseLayers).addTo(this.map);
    },
    addFullscreen() {
      let fsControl = new L.Control.FullScreen({
        position: 'topleft',
        title: 'Развернуть',
        titleCancel: 'Вернуться',
        content: '<img style="vertical-align:middle;" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDI5OC42NjcgMjk4LjY2NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk4LjY2NyAyOTguNjY3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGc+CgkJPGc+CgkJCTxwb2x5Z29uIHBvaW50cz0iNDIuNjY3LDE5MiAwLDE5MiAwLDI5OC42NjcgMTA2LjY2NywyOTguNjY3IDEwNi42NjcsMjU2IDQyLjY2NywyNTYgICAgIiBmaWxsPSIjMDAwMDAwIi8+CgkJCTxwb2x5Z29uIHBvaW50cz0iMCwxMDYuNjY3IDQyLjY2NywxMDYuNjY3IDQyLjY2Nyw0Mi42NjcgMTA2LjY2Nyw0Mi42NjcgMTA2LjY2NywwIDAsMCAgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQkJPHBvbHlnb24gcG9pbnRzPSIxOTIsMCAxOTIsNDIuNjY3IDI1Niw0Mi42NjcgMjU2LDEwNi42NjcgMjk4LjY2NywxMDYuNjY3IDI5OC42NjcsMCAgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQkJPHBvbHlnb24gcG9pbnRzPSIyNTYsMjU2IDE5MiwyNTYgMTkyLDI5OC42NjcgMjk4LjY2NywyOTguNjY3IDI5OC42NjcsMTkyIDI1NiwxOTIgICAgIiBmaWxsPSIjMDAwMDAwIi8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />',
      });
      this.map.addControl(fsControl);
    },
    addScale() {
      L.control.scale({maxWidth:240, metric:true, imperial:false, position: 'bottomleft'}).addTo(this.map);
    },
    addRuler() {
      L.control.polylineMeasure({position:'topright', unit:'metres', clearMeasurementsOnStop: true}).addTo(this.map);
    },
    addPrinter() {
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
    addPrinterTitle() {
      L.easyButton({
        id: 'print-title', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'title', onClick: this.setPrintTitle, title: 'Заголовок карты', icon: 'el-icon-setting'}]
      }).addTo(this.map);
    },
    setPrintTitle() {
      this.mapPrintTitle = prompt('Введите название заголовка?', this.mapPrintTitle) || this.mapPrintTitle
    },
    addExport() {
      L.easyButton({
        position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'exportMap', onClick: this.exportMap, title: 'Экспорт карты', icon: 'fas fa-download'}]
      }).addTo(this.map);
    },
    exportMap() {
      this.exportMapVisible = true
    },
    addPanelBtn() {
      L.easyButton({
        id: 'el-icon-bottom', position: 'topright', type: 'replace', leafletClasses: true,
        states: [
          {stateName: 'close', title: 'Скрыть инфо', icon: '<span class="close-icon">&cross;</span>', onClick: (control) => { this.togglePanelBottom(false); control.state('open');}},
          {stateName: 'open', title: 'Показать инфо', icon: '<span class="iota-icon">&iukcy;</span>', onClick: (control) => { this.togglePanelBottom(true); control.state('close');}}
        ]
      }).addTo(this.map)
    },
    togglePanelBottom(state) {
      this.showPanelBottom = state
    },
    addFieldsTooltipToggleButton() {
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
          polygon.bindTooltip(polygon.newName, {permanent: true, direction: "center", opacity: 1, className: 'tooltip-transparent'})
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
          polygon.bindTooltip(polygon.newName, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        })
        this.map.fitBounds(activeFields.getBounds());
        control.state('show-fields-tooltips');
      }
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
      return 'нет даты';
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
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
</style>

