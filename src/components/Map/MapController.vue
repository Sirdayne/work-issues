<template lang="pug">
#module
  el-dialog(:visible.sync="exportMapVisible", title="Экспорт карты посева", size="tiny")
    el-button-group
      a(:href="kmlUrl", download="map.kml")
        el-button Скачать KML
      a(:href="mpUrl", download="map.mp")
        el-button Скачать MP
  #svgs(v-if="seedlimits")
    svg(v-for="field in leafletFields", width="0", height="0")
      defs
        linearGradient(:id="field.fieldId", x1="0%", y1="0%", x2="100%", y2="0%")
          stop(v-for="area in field.areas", :offset="area.area", :stop-color="area.color", stop-opacity="1", :key="area.numvfor")
  #work-svgs(v-if="workSvgVisible")
    svg(v-for="field in leafletFields", width="0", height="0")
      defs
        linearGradient(:id="field.svgFieldWorkId", x1="0%", y1="0%", x2="100%", y2="0%")
          stop(v-for="area in field.workAreas", :offset="area.area", :stop-color="area.color", stop-opacity="1", :key="area.key")
  h1.map-print-title(v-show="mapPrintState == 'started'", leaflet-browser-print-content) {{mapPrintTitle}}
  #map
    .content(v-if="!ready", v-loading="!ready")
    .content(v-if="refresh")
      el-button.refresh(type="info", size="small", @click="getLeafletFields()") Повторить
    .map-culture-filter
      el-select(v-if="mapsowingCheckboxed", v-model="selectedCulture", clearable, filterable)
        el-option(v-for="item in filteredCultures", :label="item.nameAndTotalArea", :value="item.id", :key="item.id", :style="{color: item.color}")
      el-select(v-if="fieldWorkOverlaySelected", v-model="selectedWork", clearable, filterable, @change="addFieldWorkProgressAreas", :loading="loadingItem.filteredWorks")
        el-option(v-for="item in filteredWorks", :label="item.name", :value="item.id", :key="item.id")
    .date-selector
      template(v-if="isAssignmentSelected")
        el-date-picker(v-model="trackDate", format="dd.MM.yyyy HH:mm", type="datetime", :disabled="datePickerDisabled", @change="trackDateChanged")
      template(v-else)
        el-date-picker(v-model="selectedDate", format="dd.MM.yyyy HH:mm", type="datetime")
  table(leaflet-browser-print-pages)
    tr(v-for="(item, index) in polylines", v-if="cars[item.assignmentId]")
      td(:style="{backgroundColor: colors[index], width: '15px'}")
      td() {{ cars[item.assignmentId].info }}
  #track-player(v-show="ready")
    track-panel()
  .traktor-panel(v-if="isTraktorPanelShown")
    el-button(@click="startTraktor()", v-if="isTraktorPaused") &#9658;
    el-button(@click="pauseTraktor()", v-else) ⏸
    el-button(@click="stopTraktor()") ⏹
    el-button(@click="speedDownTraktor()", v-if="isTraktorSpeed") 1x
    el-button(@click="speedUpTraktor()", v-else) 10x
    el-slider(v-model="sliderStep", :format-tooltip="formatTooltip", :max="traktorTimeLength")

  .area-panel(v-if="isEditable")
    span(v-for="polygon in highlightedPolygons") {{polygon.label}}({{getArea(polygon)}}га)
    span {{ selectedPolygonForEdit.label }}

  el-dialog(:visible.sync="dialogSelectSeedLimitIdForKml", title="Выберите", size="tiny")
    el-form(label-width="0px", label-position="left", v-if="ready")
      el-form-item
        el-select(v-model="selectedSeedLimitIdForKml", clearable, filterable)
          el-option(v-for="s in seedLimitsFromEditField", :key="s.id", :label="s.displayString", :value="s.id")
      el-form-item
        el-button(@click="editPolygonBySelectedSeedLimit()", type="primary", style="padding: 10px 20px;") Редактировать
</template>
<script>
import L from 'leaflet'
import moment from 'moment';
import http from 'lib/httpQueryV2';
import randomcolor from 'randomcolor'
import {EventBus} from 'services/EventBus';
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import MapControllerMixin from './MapControllerMixin';
import CarDrawer from './Drawers/CarDrawer';
import TrackDrawer from './Drawers/TrackDrawer';
import FieldDrawer from './Drawers/FieldDrawer';
import WarehouseDrawer from './Drawers/WarehouseDrawer';
import TrackPanel from "components/Map/track-panel.vue";

import TrackDrawerNew from './Drawers/TimeDrawer/TrackDrawer';
import CarDrawerNew from './Drawers/TimeDrawer/CarDrawer';

export default {
  name: 'Map',
  mixins: [
    RecordsLoaderV2,
    MapControllerMixin,
    CarDrawer,
    TrackDrawer,
    FieldDrawer,
    WarehouseDrawer,
    TrackDrawerNew,
    CarDrawerNew,
  ],
  components: {
    TrackPanel,
  },
  props: [
    'polylines',
    'filteredAssignments',
    'filteredFieldIds',
    'byDate',
    'carData'
  ],
  data() {
    return {
      map: null,
      cars: {},
      vuexcars: [],
      fields: new L.FeatureGroup(),
      tracks: new L.FeatureGroup(),
      traktorTracks: [],
      traktorTime: [],
      traktorTimeLength: 0,
      isTraktorPanelShown: false,
      isTraktorSpeed: false,
      isTraktorPaused: true,
      sliderStep: 0,
      SowingPolygons: new L.FeatureGroup(),
      isEditable: false,
      highlightedPolygons: [],
      carCurrentPositions: [],
      refresh: null,
      assignments: null,
      leafletFields: null,
      seedlimitcoordinates: null,
      seedlimits: null,
      legend: null,
      warehouseCoordinates: null,
      cultures: [],
      lfCultureIds: [],
      selectedCulture: null,
      selectedDate: this.$store.getters.getSelectedDate,
      trackDate: null,
      mapsowingCheckboxed: false,
      mapPrintTitle: "Карта",
      mapPrintState: "",
      worktypeparameterplanworktypes: [],
      fieldWorkOverlaySelected: false,
      selectedWork: null,
      fieldsuboperationprogress: [],
      filteredWorks: [],
      workSvgVisible: false,
      dateForFSP: null,
      seedLimitsFromEditField: [],
      dialogSelectSeedLimitIdForKml: false,
      selectedSeedLimitIdForKml: null,
      selectedPolygonForEdit: null,
      loadingItem: {
        filteredWorks: false,
      },
      exportMapVisible: false,
      kmlUrl: `${SERVER_URL}api/Kml/GetAllSeedLimitKML?id=${this.$root.context.organization}`,
      mpUrl: `${SERVER_URL}api/Kml/GetAllSeedLimitMP?id=${this.$root.context.organization}`,
      modeEditPoints: false,
    }
  },
  created() {
    EventBus.$on('MapController.FilterChanged', () => {
      this.destroyMapData()
    });
    EventBus.$on('TrackTimes.MergedTrackTimesUpdated', () => {
      let mtt = this.$store.getters.getMergedTrackTimes
      let currentTime = mtt.times && mtt.currentTime()
      if (currentTime) {
        this.trackDate = moment.unix(currentTime)
      } else {
        this.trackDate = null
      }
    });
    EventBus.$once('MapController.SelectedDateChangeTriggered', (date) => {
      this.selectedDate = date
    });
  },
  mounted: function () {
    this.$nextTick(function () {
      this.getData()
    })
  },
  destroyed() {
    this.destroyMapData()
    if (this.map) this.map.remove()
    this.$root.yearControl = false;
  },
  computed: {
    seedcoordinates() {
      let array = []
      if (this.seedlimitcoordinates && this.seedlimitcoordinates.length > 0 && this.seedlimits && this.seedlimits.length > 0){
        this.seedlimitcoordinates.forEach(polygon => {
          let seedlimit = this.seedlimits.find(seedlimit => seedlimit.id == polygon.seedLimitId)
          if (seedlimit) {
            array.push({
              kml: polygon.kml,
              seedLimitId: polygon.seedLimitId,
              fieldId: seedlimit.fieldId,
              fieldName: seedlimit.fieldNewName,
              cultureId: seedlimit.cultureId,
              label: `${seedlimit.fieldNewName}\n${seedlimit.cultureName}`
            })
          }
        })
      }
      return array
    },
    filteredCultures() {
      let cultures = this.cultures.filter(x => this.lfCultureIds.indexOf(x.id) > -1)
      cultures.map(c => {
        let totalArea = 0
        this.SowingPolygons.eachLayer(polygon => {
          if (polygon.cultureIds.indexOf(c.id) > -1) {
            let s = this.seedlimits.find(s => s.fieldId == polygon.fieldId && s.cultureId == c.id)
            let a = s && s.area || 0
            totalArea += a
          }
        })
        c.color = this.getColorFromLegend(c.id)
        c.nameAndTotalArea = [c.shortName, "-", totalArea, "га"].join(" ")
        return c
      })
      return cultures
    },
    filteredAssignmentsLength() {
      return this.filteredAssignments.length
    },
    colors() {
      let n = this.filteredAssignmentsLength
      let colors = []
      let hue = ["orange", "yellow", "green", "blue", "purple", "pink"]
      let hueLength = hue.length
      while (n) {
        let color = randomcolor({hue: hue[n % hueLength]})
        colors.push(color)
        n--
      }
      return colors
    },
    datePickerDisabled() {
      return !!this.$store.getters.getSelectedAssignments.length && !this.$store.getters.getTimeTravel;
    },
    isAssignmentSelected() {
      return !!this.$store.getters.getSelectedAssignments.length
    },
  },
  watch: {
    'filteredFieldIds' (val, oldVal) {
      this.highlightFilteredFields(val)
    },
    'polylines' (val, oldVal) {
      this.isEditable = false
      this.drawDetails();
    },
    'carData' (val, oldVal) {
      this.isEditable = false
      this.drawDetails();
    },
    selectedDate(value) {
      this.getFieldWorkProgress()
      this.$store.dispatch('actionSetSelectedDate', value);
      EventBus.$emit('MapController.SelectedDateChanged', value);
    },
  },
  methods: {
    trackDateChanged(val) {
      let value = moment(val, "DD.MM.YYYY HH:mm").valueOf()
      EventBus.$emit('MapController.TrackDateChanged', value);
      if (!this.datePickerDisabled) {
        let time = value / 1000
        this.findIndexClosestToTime(time)
      }
    },
    formatTooltip(val) {
      if (this.traktorTime[val]){
        return moment(this.traktorTime[val], "YYYY-MM-DDTHH:mm:ss").format("YYYY/MM/DD HH:mm:ss")
      }
      return 'нет даты';
    },
    getData() {
      this.refresh = false
      this.fetchEntities([
        'assignments',
        'warehousecoordinates',
        'seedlimits',
        'legend',
        'cultures',
        'worktypeparameterplanworktypes',
        'cars',
        'fields',
        'seedlimitcoordinates',
      ], this.afterFetch);
    },
    updateSeedLimitCoordinates() {
      this.fetchEntities([
        'seedlimitcoordinates',
      ], this.afterFetchSeedLimitCoordinates);
    },
    getLeafletFields() {
      this.refresh = false
      this.fetchEntities([
        'leafletFields',
      ], this.afterFetchLeafletFields);
    },
    afterFetch() {
      this.worktypeparameterplanworktypes = this.fromVuex('worktypeparameterplanworktypes')
      this.getFieldWorkProgress()
      this.cultures = this.fromVuex('cultures')
      this.assignments = this.fromVuex('assignments')
      this.vuexcars = this.fromVuex('cars')
      this.seedLimitsYear = this.fromVuex('seedlimits')
      this.seedlimits = this.fromVuex('seedlimits').map(s => {
        let culture = this.cultures.find(c => c.id == s.cultureId)
        if (culture && culture.seasonsCount > 0) {
          s.cultureSeasonsCount = culture.seasonsCount
        } else {
          s.cultureSeasonsCount = 1
        }
        return s
      })
      this.legend = this.fromVuex('legend')
      this.warehouseCoordinates = this.fromVuex('warehousecoordinates')
      this.seedlimitcoordinates = this.fromVuex('seedlimitcoordinates')
      this.afterFetchLeafletFields()
    },
    afterFetchSeedLimitCoordinates() {
      this.seedlimitcoordinates = this.fromVuex('seedlimitcoordinates')
      this.initMap()
    },
    afterFetchLeafletFields() {
      this.leafletFields = this.fromVuex('leafletfields').map(f => {
        f.svgFieldWorkId = "svg-field-work-id" + f.fieldId
        f.areas = []
        f.cultureIds = []
        f.cultures = []
        let sumArea = 0
        let numvfor = 0
        this.seedlimits.forEach(s => {
          if((s.fieldId === f.fieldId) && (this.$root.context.year >= s.year) && (s.cultureSeasonsCount > this.$root.context.year - s.year)){
            f.cultureIds.push(s.cultureId)
            this.lfCultureIds.push(s.cultureId)
          }
        })
        this.seedlimits.forEach(s => {
          if((s.fieldId === f.fieldId) && (this.$root.context.year >= s.year) && (s.cultureSeasonsCount > this.$root.context.year - s.year)){
            //areas used for SVG and GRADIENTS
            let color = this.getColorFromLegend(s.cultureId)
            if (f.cultureIds.length <= 1) sumArea+=s.areaPercent
            f.areas.push({numvfor: numvfor++, area: sumArea + '%', color: color})
            if (f.cultureIds.length > 1) sumArea+=s.areaPercent
            if (f.cultureIds.length <= 1) color = "rgba(0,0,0,0.0)"
            f.areas.push({numvfor: numvfor++, area: sumArea + '%', color: color})
            //SVG areas -- END
          }
        })
        return f
      })
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
        EventBus.$emit("MapController.LoadingFinished");
      } else {
        this.refresh = true
      }
    },
    getFieldWorkProgress() {
      this.loadingItem.filteredWorks = true
      this.selectedWork = null
      let selectedDate = moment(this.selectedDate, "YYYY-MM-DDTHH:mm:ss").format("YYYY/MM/DD");
      if (this.dateForFSP === selectedDate) return false
      this.dateForFSP = selectedDate
      http.getWithoutCache(`fieldsuboperationprogress/getinfo?orgId=${this.$root.context.organization}&date=${this.dateForFSP}`)
        .then(data => {
          this.setFSP(data)
          this.loadingItem.filteredWorks = false
        })
        .catch(() => {
          this.setFSP({})
          this.loadingItem.filteredWorks = false
        })
    },
    setFSP(data) {
      this.fieldsuboperationprogress = data && data.data ? data.data : []
      let filteredWorks = []
      if (data && data.types) {
        filteredWorks = data.types.map(w => {return {id: w.key, name: w.value}}).sort((a, b) => a.id - b.id)
      }
      this.filteredWorks = filteredWorks
    },
    addFieldWorkProgressAreas(selectedWorkId) {
      this.workSvgVisible = false
      let key = 0
      let fspBySelectedWork = this.fieldsuboperationprogress.filter(fsp => fsp.grKey == selectedWorkId)
      this.leafletFields.forEach(f => {
        f.workAreas = []
        let fspBySelectedWorkAndField = fspBySelectedWork.find(fsp => fsp.fieldId == f.fieldId)
        let progressPercent = fspBySelectedWorkAndField && Math.ceil(fspBySelectedWorkAndField.procent) || 0
        let fieldColor = progressPercent <= 100 ? "#0f0" : "#f00"
        f.workAreas.push({area: progressPercent + '%', color: fieldColor, key: key++})
        f.workAreas.push({area: progressPercent + '%', color: "rgba(0,0,0,0.0)", key: key++})
      })
      this.workSvgVisible = true
    },
    destroyMapData() {
      this.$store.dispatch('actionDestroy')
      this.removeCars()
      this.removeTracks()
    },
  }
}
</script>
<style lang="stylus" scoped>
#module
  width 100%
  height 100%
  position relative
#map
  position relative
  z-index 0
  height inherit
  width inherit
.date-selector
  position absolute
  top 10px
  left calc(50% - 150px)
  z-index 401
.area-panel
  position relative
  float left
  box-sizing border-box
  width 100%
  padding 5px
  font-size 13px
  text-align center
  border 1px groove #cfcfcf
  background #d3dce6
  z-index 2
#track-player
  position absolute
  top 10px
  left calc(50% + 35px)
  height 36px
  width 280px
  box-sizing border-box
.el-date-editor.el-input
  width 180px
.content
  height inherit
  width inherit
  position relative
.refresh
  position absolute
  left calc(50% - 39.29px)
  top calc(50% - 14px)
  z-index 1000
.info
  padding 6px 8px
  font 14px/16px Arial, Helvetica, sans-serif
  background white
  background rgba(255,255,255,0.8)
  box-shadow 0 0 15px rgba(0,0,0,0.2)
  border-radius 5px
#svgs, #work-svgs
  position fixed
  top 0px
  left 0px
  z-index 0
.grid-print-container > .title {
  color: white;
}
.map-print-title {
  grid-row: 1;
  justify-self: center;
  text-align: center;
  color: grey;
}
</style>
