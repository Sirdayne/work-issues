<template lang="pug">
.rows.fx-styles(
    v-loading="!ready",
    element-loading-text="Загружается...",
  )
  .sidebar(v-if="mapFilterData", :class="{'closed-sidebar': !sidebarToggleState}")
    map-filter(:data="mapFilterData", @apply="applyFilter")
  #contents
    .map-controller(:class="{'map-active': showPanelBottom}")
      map-controller(:polylines="filteredTracks", :filteredAssignments="filteredAssignments",
      :filteredFieldIds="filteredFieldIds", :byDate="byDate", :carData="carData")
    .tabs(v-if="tabData" :class="{'map-active': showPanelBottom}")
      tab-builder(:data="tabData", :type="tabType")
</template>

<script>
import { EventBus } from "services/EventBus";
import RecordsLoaderV2 from "mixins/RecordsLoaderV2";
import MapFilter from "components/Map/MapFilter.vue";
import MapController from "components/Map/MapController";
import TabBuilder from "components/Map/tab-builder.vue";
import moment from "moment";
import http from 'lib/httpQueryV2'
import nprogress from 'lib/NProgress';
import { Message } from 'element-ui'
import '../../misc/fx-small.styl';

export default {
  mixins: [RecordsLoaderV2],
  components: {
    MapFilter,
    MapController,
    TabBuilder
  },
  data() {
    return {
      filteredTracks: [],
      date: null,
      assignment: null,
      assignments: null,
      filteredAssignments: null,
      filteredFieldIds: null,
      tabData: null,
      tabType: null,
      mapFilterData: null,
      byDate: true,
      carData: null,
      showPanelBottom: true,
    };
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState
    },
  },
  created() {
    EventBus.$on("MapTogglePanelBottom", (state) => {
      this.showPanelBottom = state;
    });
    EventBus.$on("CarDataTracks", tracks => {
      this.carData = tracks;
    });
    EventBus.$on("MapController.SelectedAssignmentLoadingFinished", tracks => {
      this.filteredTracks = tracks;
    });
    EventBus.$once("MapController.LoadingFinished", tracks => {
      if (this.$route.params.id !== undefined) {
        let id = this.$route.params.id;
        let assignment = this.$store.getters.getEntityById(id, "assignments");
        if (assignment) {
          let date = moment(assignment.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format();
          EventBus.$emit('MapController.SelectedDateChangeTriggered', date)
          EventBus.$emit("traktorTracksTriggered", assignment.carId)
        } else {
          this.$message({
            message: `Такого задания не существует`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        }
      }
    });
    if(this.$route.query.carId){
      this.initOutOfAssignmentTracks()
    }
    if(this.$route.query.date){
      this.$store.dispatch('actionSetSelectedDate', this.$route.query.date)
    }
    this._fetchMainEntities()
  },
  methods: {
    _fetchMainEntities() {
      this.fetchEntities([
        "assignments",
        "instruments",
        "leafletFields",
        "processedstatuses",
        "cars",
        "cartypes",
        "employees",
      ], this.afterFetchMain);
    },
    afterFetchMain() {
      let instruments = this.fromVuex("instruments")
      this.processedstatuses = this.fromVuex("processedstatuses")
      this.assignments = this.fromVuex("assignments").map(a => {
        a.instrumentWidth = instruments.find(i => i.id == a.instrumentId).width
        let processedstatus = this.processedstatuses.find(s => s.id == a.status)
        a.processedstatus = processedstatus && processedstatus.name || ""
        return a
      })
      this.mapFilterData = true
    },
    applyFilter(f) {
      EventBus.$emit('MapController.FilterChanged');
      this.filteredFieldIds = f.fieldIds
      let cond1 = f.employeeIds.length === 1 && !f.fieldIds.length && !f.carIds.length
      let cond2 = f.fieldIds.length === 1 && !f.employeeIds.length && !f.carIds.length
      let cond3 = !!f.carIds.length && !f.employeeIds.length && !f.fieldIds.length
      this.byDate = !(cond1 || cond2 || cond3)
      this.filterAssignments(f, cond1, cond2, cond3)
      this.prepareTabData(f, !(cond1 || cond2 || cond3), cond2, cond3)
    },
    prepareTabData(f, byDate, byField, byCar) {
      this.tabData = null
      let tabType = byField ? "field" : byCar ? "car" : "default"
      this.tabType = tabType
      let tabData = {
        SelectedAssignments: {
          type: this.tabType,
          filteredAssignments: this.filteredAssignments,
        },
        CarStatus: !!byDate,
        FieldInfo: {
          id: f.fieldIds && f.fieldIds[0],
          orientation: true
        },
        CarActions: {
          ids: f.carIds,
        }
      }
      this.tabData = tabData
    },
    filterAssignments(f, cond1, cond2, cond3) {
      let assignments = this.assignments ? this.assignments : [];
      if (assignments.length) {
        let attrIds = ["employeeIds", "fieldIds", "carIds", "instrumentIds"]
        let attrId = ["employeeId", "fieldId", "carId", "instrumentId"]
        assignments = assignments.map(a => {
          a.formattedDateTime = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY");
          a.formatWorkStart = moment(a.workStart, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm");
          a.formatWorkEnd = moment(a.workEnd, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm");
          a.formatStart = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          a.formatEnd = moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
          a.area = Math.round(+a.area);
          return a;
        }).filter(a => {
          let cond4_1 = attrIds.every((id, i) => !f[id].length || f[id].includes(a[attrId[i]]))
          let filterDate = moment(f.startDate, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY");
          let assignmentDate = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY");
          let cond4_2 = !f.startDate || filterDate === assignmentDate
          let cond4 = cond4_1 && cond4_2
          if (cond1) {
            return f.employeeIds.includes(a.employeeId);
          } else if (cond2) {
            return f.fieldIds.includes(a.fieldId);
          } else if (cond3) {
            return f.carIds.includes(a.carId);
          } else if (cond4) {
            return true;
          }

        });
      }
      this.filteredAssignments = assignments
    },
    initOutOfAssignmentTracks() {
      let endpoint = `OutOfAssignmentTracks/`;
      let data = {
        CarId: this.$route.query.carId,
        Date: this.$route.query.date,
        OrganizationId: this.$root.context.organization
      };
      nprogress.start()
      http.post(endpoint, data)
        .then(data => {
          if (data) {
            this.carData = [data]
          }
          nprogress.done()
        })
        .catch((error) => {
          nprogress.done()
          this.$message({
            message: `Ошибка ${error}`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        })
    },
  }
};
</script>

<style lang="stylus" scoped>
.rows
  display flex
  height 100%

.sidebar
  height 100%
  flex-direction column
  overflow hidden
  border-right 1px solid #e4e8f1
  @media print
    visibility: hidden;
    display: none;

.map-controller
  height 100%
  width 100%
  box-sizing border-box
  &.map-active
    height calc(100% - 250px)

.tabs
  display none
  height 250px
  width 100%
  box-sizing border-box
  &.map-active
    display block

#contents
  flex 1 0 auto
  flex-flow column nowrap
  display flex
  height 100%
  width calc(100% - 330px)
  @media print
    width 100%

.closed-sidebar
  display none
</style>
