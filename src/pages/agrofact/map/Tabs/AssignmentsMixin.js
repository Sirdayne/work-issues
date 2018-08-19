import http from "services/http"
import {EventBus} from "services/EventBus"
import moment from "moment"
import randomcolor from "randomcolor"
import $ from "jquery";

export default {
  data() {
    return {
      assignmentsToHide: [],
      trackImage: "",
      trackImageAssignments: [],
      trackImageDialog: false,
      rerender: false,

      cols: [
        {id: 0, label: "№", active: true},
        {id: 1, label: "Дата", active: true},
        {id: 2, label: "Факт начала", active: false},
        {id: 3, label: "Факт завершения", active: false},
        {id: 4, label: "План начала", active: false},
        {id: 5, label: "План завершения", active: false},
        {id: 6, label: "Поле(культура)", active: true},
        {id: 7, label: "Машина", active: true},
        {id: 8, label: "Орудие", active: true},
        {id: 9, label: "Ширина захват", active: true},
        {id: 10, label: "Водитель", active: true},
        {id: 11, label: "Средн. скорость", active: true},
        {id: 12, label: "Выработка (га)", active: true},
        {id: 13, label: "Выработка учетчика (га)", active: false},
        {id: 14, label: "Разница", active: false},
        {id: 15, label: "% отклонения", active: false},
        {id: 16, label: "% поля", active: true},
      ],
      xlsProps: {},
      xlsName: "Задания",
      xls: false,
    };
  },
  computed: {
    legendAssignments() {
      return this.$store.getters.getLegendAssignments
    }
  },
  created() {
    EventBus.$on("MapShowLeafletTrack", (id) => {
      let found = this.filteredAssignments.find(a => {a.id === id})
      this.showTrack(id, found)
    })
  },
  methods: {
    _modifyAssignments() {
      this.assignments.forEach(a => {
        let found = this.legendAssignments.find(assignment => {
          if (a.id === assignment.id)
            return assignment
        })
        a.formattedDateTime = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
        a.year = moment(a.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss").format("YYYY")
        a.formatWorkStart = moment(a.workStart, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
        a.formatWorkEnd = moment(a.workEnd, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
        a.formatStart = moment(a.dateTimeRange.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
        a.formatEnd = moment(a.dateTimeRange.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY - HH:mm")
        a.areaFix = +a.area.toFixed(2)
        a.processedSquareFix = +a.processedSquare.toFixed(2)
        a.diffAreas = (parseFloat(a.area) - parseFloat(a.processedSquare)).toFixed(2)
        a.percentAreas = a.area || a.processedSquare ? (100 - parseFloat(a.area) / parseFloat(a.processedSquare) * 100).toFixed(2) : 0
        a.avgSpeedFix = a.avgSpeed.toFixed(2)
        a.fieldAndCulture = a.cultureName ? `${a.fieldNewName}(${a.cultureName})` : a.fieldNewName
        a.show = found ? true : false
        a.legend = found ? found.legend : "rgba(0,0,0,0)"
        a.loading = false
      })
      this.assignments = this.assignments.filter(x => x.year == this.$root.context.year)
      this.filterAssignments()
    },
    groupSuboperationsTable() {
      this.closeSpoilers()
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
      this.hideTracksNotShownAssignments()
      this.prepareXLS(this.filteredAssignments)
    },
    hideTracksNotShownAssignments() {
      let assignmentsToShow = []
      this.filteredAssignments.forEach(assignment => {
        if (assignment.show)
          assignmentsToShow.push(assignment.id)
      })
      let shownAssignmentIds = this.$store.getters.getLegendAssignments.map(a => a.id)
      let assignmentsToHide = []
      shownAssignmentIds.forEach(assignmentId => {
        if (!assignmentsToShow.includes(assignmentId)){
          assignmentsToHide.push(assignmentId)
        }
      })
      assignmentsToHide.forEach(assignmentId => {
        this.hideTrack(assignmentId)
      })
    },
    prepareXLS(body) {
      this.xlsProps = {
        subOperationName: "Работа",
        id: "№",
        formattedDateTime: "Дата",
        formatWorkStart: "Факт начала",
        formatWorkEnd: "Факт завершения",
        formatStart: "План начала",
        formatEnd: "План завершения",
        fieldAndCulture: "Поле(культура)",
        carDisplayString: "Машина",
        instrumentName: "Орудие",
        instrumentWidth: "Ширина захвата",
        employeeFullName: "Водитель",
        avgSpeed: "Средняя скорость",
        area: "Выработка (га)",
        processedSquare: "Выработка учетчика (га)",
        diffAreas: "Разница",
        percentAreas: "% отклонения",
        percentOverall: "% Поля",
      }
      this.xls = body
    },
    showTracks(assignmentsMixin) {
      assignmentsMixin.map(assignment => {
        this.showTrack(assignment.id, assignment)
      })
    },
    showTrack(id, assignment = {}) {
      this.disabled = true
      assignment.loading = true
      let endpoint = "leafletTracks/" + this.$root.context.organization
      if (this.checkLegendAssignment(id)) {
        http.get(endpoint, id)
          .then((data) => {
            let track = data ? JSON.parse(data.track) : []
            if (data && track.length > 0) {
              assignment.loading = false
              assignment.show = true
              assignment.legend = this.getColor()
              data.legend = assignment.legend
              this.disabled = false
              this.addLeafletTrack(data)
              this.reRender()
            } else {
              throw "нет данных"
            }
          })
          .catch((error) => {
            this.$message({
              message: `${error}`,
              type: "info",
              duration: 5000,
              showClose: false,
            })
            assignment.loading = false
            assignment.show = false
            this.disabled = false
            this.reRender()
          })
      } else {
        assignment.loading = false
        this.disabled = false
        this.reRender()
      }
    },
    checkLegendAssignment(assignmentId) {
      let shownAssignmentIds = this.$store.getters.getLegendAssignments.map(a => a.id)
      let output = shownAssignmentIds.includes(assignmentId) ? false : true
      return output
    },
    hideTracks(assignments) {
      assignments.map(assignment => {
        this.hideTrack(assignment.id, assignment)
      })
    },
    hideTrack(id, assignment = {show: false}) {
      assignment.show = false
      assignment.legend = "rgba(0,0,0,0)"
      this.removeLeafletTrack(id)
      this.reRender()
    },
    showTrackImage(id) {
      http.get(`trackImage/${this.$root.context.organization}/${id}`)
        .then(data => {
          if (data && data.area !== 0 && data.remainedArea !== 0) {
            this.trackImage = "data:image/jpg;base64," + data.image
            this.trackImageAssignments = data.assignments.reverse().map(a => {
              a.startDate = moment(a.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm");
              a.endDate = moment(a.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm");
              return a
            })
            this.trackImageDialog = true
          } else {
            this.trackImage = ""
            this.trackImageAssignments = []
            this.$message({
              message: `Нет данных`,
              type: "info",
              duration: 5000,
              showClose: false,
            });
          }
        })
    },
    addLeafletTrack(data) {
      EventBus.$emit("MapAddLeafletTrack", data)
    },
    removeLeafletTrack(id) {
      EventBus.$emit("MapRemoveLeafletTrack", id)
    },
    getColor() {
      return randomcolor()
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(0);
    },
    closeSpoilers(){
      $(".fx-spoiler").hide();
    },
    reRender() {
      this.rerender = !this.rerender
    }
  }
}
