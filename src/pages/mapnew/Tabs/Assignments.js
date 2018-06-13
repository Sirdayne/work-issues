import http from 'lib/httpQueryV2'
import { EventBus } from 'services/EventBus'
import moment from 'moment'
import randomcolor from 'randomcolor'
import $ from 'jquery';

export default {
  data() {
    return {

    };
  },
  created() {

  },
  methods: {
    _modifyAssignments() {
      this.assignments.forEach(a => {
        a.formattedDateTime = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY");
        a.year = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("YYYY");
        a.areaFix = a.area.toFixed(2)
        a.avgSpeedFix = a.avgSpeed.toFixed(2)
        a.fieldAndCulture = a.cultureName ? `${a.fieldNewName}(${a.cultureName})` : a.fieldNewName
        a.show = false
        a.loading = false
      })
      this.assignments = this.assignments.filter(x => x.year == this.$root.context.year)
      this.filterAssignments()
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
    hideTrack(assignment, id) {
      assignment.show = false
      this.removeLeafletTrack(id)
      this.filterAssignments()
    },
    showTrack(assignment, id) {
      this.disabled = true
      assignment.loading = true
      let endpoint = 'leafletTracks/' + this.$root.context.organization
      http.get(endpoint, id)
        .then((data) => {
          if (data) {
            this.addLeafletTrack(data)
          }
          assignment.loading = false
          assignment.show = true
          this.disabled = false
          this.filterAssignments()
        })
        .catch((error) => {
          assignment.loading = false
          assignment.show = false
          this.disabled = false
        })
    },
    addLeafletTrack(data) {
      EventBus.$emit('MapAddLeafletTrack', data)
    },
    removeLeafletTrack(id) {
      EventBus.$emit('MapRemoveLeafletTrack', id)
    },
    getColor() {
      return randomcolor()
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(0);
    },
    closeSpoilers(){
      $('.fx-spoiler').hide();
    },
  }
}
