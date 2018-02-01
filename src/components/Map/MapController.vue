<template lang="pug">
#module
  #map(:style="{opacity: 0.65}")
    .content(v-if="!ready", v-loading="!ready")
    .content(v-if="refresh")
      el-button.refresh(type="info", size="small", @click="getLeafletFields()") Повторить
    .date-selector
      el-date-picker(
        v-model="selectedDate",
        format="dd.MM.yyyy HH:mm",
        type="datetime",
        :disabled="datePickerDisabled",
      )
  #track-player(v-show="ready")
    track-panel()
  .area-panel(v-show="isEditable")
    span(v-for="polygon in highlightedPolygons") {{polygon.label}}({{getArea(polygon)}}га)
</template>
<script>
import L from 'leaflet'
import moment from 'moment';
import randomcolor from 'randomcolor'
import {EventBus} from 'services/EventBus';
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import MapControllerMixin from './MapControllerMixin';
import CarDrawer from './Drawers/CarDrawer';
import FieldDrawer from './Drawers/FieldDrawer';
import TrackDrawer from './Drawers/TrackDrawer';
import WarehouseDrawer from './Drawers/WarehouseDrawer';
import TrackPanel from "components/Map/track-panel.vue";

export default {
  name: 'Map',
  mixins: [
    RecordsLoaderV2,
    MapControllerMixin,
    CarDrawer,
    FieldDrawer,
    TrackDrawer,
    WarehouseDrawer
  ],
  components: {
    TrackPanel,
  },
  props: [
    'polylines',
    'filteredAssignments',
    'filteredFieldIds',
    'byDate',
  ],
  data() {
    return {
      map: null,
      cars: {},
      fields: new L.FeatureGroup(),
      tracks: new L.FeatureGroup(),
      isEditable: false,
      highlightedPolygons: [],
      carCurrentPositions: [],
      refresh: null,
      assignments: null,
      carCoordinates: null,
      leafletFields: null,
      warehouseCoordinates: null,
      selectedDate: moment().hour(8).minute(0).second(0).subtract(1, 'days').format(),
    }
  },
  created() {
    EventBus.$on('MapController.FilterChanged', () => {
      this.destroyMapData()
    });
    EventBus.$once('MapController.SelectedDateChangeTriggered', (date) => {
      this.selectedDate = date
    });
  },
  mounted: function () {
    this.$nextTick(function () {
      this.getLeafletFields()
    })
  },
  destroyed() {
    this.destroyMapData()
    if (this.map) this.map.remove()
    this.$root.yearControl = false;
  },
  computed: {
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
      return !!this.$store.getters.getSelectedAssignments.length && !this.$store.getters.getTeleport;
    },
    commonTrackTimesCurrentTime() {
      let t = this.$store.getters.getMergedTrackTimes
      return t && t.times && t.times.length && t.currentTime()
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
    selectedDate(value) {
      let assignmentId = this.$store.getters.getSelectedAssignments[0]
      if (assignmentId) {
        let assignment = this.filteredAssignments.find(a => a.id == assignmentId)
        let formattedDateTime = moment(value, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY");
        if (assignment.formattedDateTime == formattedDateTime || !this.byDate) {
          let time = moment(value, "YYYY-MM-DDTHH:mm:ss").format("HH:mm")
          this.findIndexClosestToTime(time)
        } else {
          EventBus.$emit('MapController.SelectedDateChanged', value);
        }
      } else {
        EventBus.$emit('MapController.SelectedDateChanged', value);
      }
    },
    commonTrackTimesCurrentTime(val) {
      if (val) {
        let time = val
        let hh = time.split(":")[0]
        let mm = time.split(":")[1]
        let selectedDate = moment(this.selectedDate).set({
          hour: hh,
          minute: mm,
          second: 0,
          millisecond: 0
        })
        if (hh < 24) this.selectedDate = selectedDate
      }
    }
  },
  methods: {
    getLeafletFields() {
      this.refresh = false
      this.fetchEntities([
        'assignments',
        'leafletFields',
        'warehousecoordinates',
      ], this.afterFetch);
    },
    afterFetch() {
      this.assignments = this.fromVuex('assignments')
      this.leafletFields = this.fromVuex('leafletfields')
      this.warehouseCoordinates = this.fromVuex('warehousecoordinates')
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
        // this.getCarCoordinates()
        EventBus.$emit("MapController.LoadingFinished");
      } else {
        this.refresh = true
      }
    },
    getCarCoordinates() {
      this.fetchEntities([
        'carcoordinates',
      ], this.afterFetchCarCoordinates);
    },
    afterFetchCarCoordinates() {
      this.carCoordinates = this.fromVuex('carCoordinates').filter(c => c.carId !== 0);
      if (this.$route.params.id === undefined) this.revealLastCoordinatesOfCars()
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
  height inherit
  width inherit
.date-selector
  position absolute
  top 10px
  left calc(50% - 150px)
  z-index 401
.area-panel
  position relative
  background-color #fff
  float right
  margin 13px 10px 0 0
  font-size 14px
  z-index 2
  width auto
  box-sizing border-box
#track-player
  position absolute
  top 10px
  left calc(50% + 35px)
  height 36px
  width 280px
  z-index 2
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
</style>
