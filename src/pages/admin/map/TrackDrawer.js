import http from "services/http"
import L from "leaflet"

export default {
  data() {
    return {
      polylines: [],
      leafletPolylines: new L.FeatureGroup(),
    }
  },
  created() {

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
        let found = this.suboperationsTable.findIndex(s => s.id == a.subOperationId)
        if (found == -1) {
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
      this.reRender()
    },
    showTrack(assignment, id) {
      this.disabled = true
      assignment.loading = true
      let endpoint = "leafletTracks/" + this.$root.context.organization
      http.get(endpoint, id)
        .then((data) => {
          this.addLeafletTrack(id, data)
          assignment.loading = false
          assignment.show = true
          this.disabled = false
          this.filterAssignments()
          this.reRender()
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
          this.reRender()
        })
    },
    addLeafletTrack(id, data) {
      let track = JSON.parse(data.track).filter((v, j) => j % 10 == 0)
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
  }
}
