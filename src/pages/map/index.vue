<template lang="pug">
.rows.fx-styles(
    v-loading="!ready",
    element-loading-text="Загружается...",
  )
  .sidebar
    map-filter(@apply="applyFilter")
  #contents
    .map-controller
      map-controller(:polylines="filteredTracks", :filteredAssignments="filteredAssignments",
      :filteredFieldIds="filteredFieldIds", :byDate="byDate")
    .tabs(v-if="tabData")
      tab-builder(:data="tabData", :type="tabType")
</template>

<script>
import { EventBus } from "services/EventBus";
import RecordsLoaderV2 from "mixins/RecordsLoaderV2";
import MapFilter from "components/Map/MapFilter.vue";
import MapController from "components/Map/MapController";
import TabBuilder from "components/Map/tab-builder.vue";
import moment from "moment";

import '../../misc/fx-styles.styl'

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
      fields: [],
      brigades: [],
      fieldzones: [],
      fieldcontours: [],
      terrains: [],
      soiltypes: [],
      compositions: [],
      croprotations: [],
      seedlimits: [],
      sorts: [],
      sowings: [],
      reproductions: [],
      byDate: true,
    };
  },
  created() {
    EventBus.$on("MapController.SelectedAssignmentLoadingFinished", tracks => {
      this.filteredTracks = tracks;
    });
    EventBus.$once("MapController.LoadingFinished", tracks => {
      if (this.$route.params.id !== undefined) {
        let id = this.$route.params.id;
        let assignment = this.$store.getters.getEntityById(id, "assignments");
        let date = moment(assignment.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format();
        EventBus.$emit('MapController.SelectedDateChangeTriggered', date)
      }
    });
    this.fetchEntities([
      "assignments",
      "instruments",
      "processedstatuses",
      'fields',
      "brigades",
      "fieldzones",
      "fieldcontours",
      "terrains",
      "soiltypes",
      "compositions",
      'croprotations',
      'seedlimits',
      'sorts',
      'sowings',
      'reproductions',
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      let instruments = this.fromVuex("instruments")
      this.processedstatuses = this.fromVuex("processedstatuses")
      this.assignments = this.fromVuex("assignments").map(a => {
        a.instrumentWidth = instruments.find(i => i.id == a.instrumentId).width
        let processedstatus = this.processedstatuses.find(s => s.id == a.status)
        a.processedstatus = processedstatus && processedstatus.name || ""
        return a
      })

      this.fields = this.fromVuex('fields')
      this.brigades = this.fromVuex('brigades')
      this.sowings = this.fromVuex('sowings').filter(x => x.year === this.$root.context.year)
      this.croprotations = this.fromVuex('croprotations')
      this.fieldworks = this.fromVuex('fieldworks')
      this.fieldzones = this.fromVuex('fieldzones')
      this.fieldcontours = this.fromVuex('fieldcontours')
      this.terrains = this.fromVuex('terrains')
      this.soiltypes = this.fromVuex('soiltypes')
      this.compositions = this.fromVuex('compositions')
      this.seedlimits = this.fromVuex('seedlimits').filter(x => x.year === this.$root.context.year)
      this.sorts = this.fromVuex('sorts')
      this.reproductions = this.fromVuex('reproductions')
    },
    applyFilter(f) {
      EventBus.$emit('MapController.FilterChanged');
      this.filteredFieldIds = f.fieldIds
      let cond1 = f.employeeIds.length === 1 && !f.fieldIds.length && !f.carIds.length
      let cond2 = f.fieldIds.length === 1 && !f.employeeIds.length && !f.carIds.length
      let cond3 = !!f.carIds.length && !f.employeeIds.length && !f.fieldIds.length
      this.byDate = !(cond1 || cond2 || cond3)
      this.filterAssignments(f, cond1, cond2, cond3)
      this.prepareTabData(f, !(cond1 || cond2 || cond3), cond2)
    },
    prepareTabData(f, byDate, byField) {
      this.tabData = null
      let tabType = byField ? "field" : "default"
      this.tabType = tabType
      let tabData = {
        SelectedAssignments: {
          filteredAssignments: this.filteredAssignments,
        },
        CarStatus: !!byDate,
        FieldInfo: {
          id: f.fieldIds && f.fieldIds[0],
          croprotations: this.croprotations,
          fields: this.fields,
          brigades: this.brigades,
          fieldzones: this.fieldzones,
          fieldcontours: this.fieldcontours,
          terrains: this.terrains,
          soiltypes: this.soiltypes,
          compositions: this.compositions,
          croprotations: this.croprotations,
          seedlimits: this.seedlimits,
          sorts: this.sorts,
          sowings: this.sowings,
          reproductions: this.reproductions,
          orientation: true,
        },
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

.map-controller
  height calc(100% - 250px)
  width 100%
  box-sizing border-box

.tabs
  height 250px
  width 100%
  box-sizing border-box

#contents
  height 100%
  width calc(100% - 330px)

</style>
