import L from "leaflet"
import {EventBus} from "services/EventBus"
import moment from "moment"
import randomcolor from "randomcolor"

export default {
  data() {
    return {
    };
  },
  created() {
    EventBus.$on("MapAddLeafletTrack", (data) => {
      this.removePolylines()
      this.leafletTracks.push(data)
      this.drawPolylines(this.leafletTracks, true)
      this.$store.dispatch("actionSetLegendAssignments", this.getIdLegendFromArray(this.leafletTracks))
    })
    EventBus.$on("MapRemoveLeafletTrack", (id) => {
      this.removePolylines()
      let index = this.leafletTracks.findIndex(x => x.assignmentId === id)
      if (index !== -1)
        this.leafletTracks.splice(index, 1)
      if (this.leafletTracks.length > 0) {
        this.drawPolylines(this.leafletTracks, true)
      } else {
        this.removeTracks()
      }
      this.$store.dispatch("actionSetLegendAssignments", this.getIdLegendFromArray(this.leafletTracks));
    })
    EventBus.$on("MapAddCarTracks", (data) => {
      this.removePolylines()
      this.drawPolylines(data)
    })
  },
  methods: {
    removePolylines() {
      this.sliderStep = 0
      this.traktorTime = []
      this.traktorTimeLength = 0
      if (this.map && this.traktorTracks.length > 0) {
        this.traktorTracks.forEach(t => {
          this.map.removeLayer(t.track)
          this.map.removeLayer(t.icon)
        })
      }
    },
    drawPolylines(tracks, cut = false) {
      this.traktorTracks = []
      tracks.forEach(traktor => {
        let track = cut ? JSON.parse(traktor.track).filter((v, j) => j % 10 == 0) : JSON.parse(traktor.track)

        let latLngTime = {}
        let speedTime = {}
        track.forEach(l => {
          let found = this.traktorTime.findIndex(t => t == l[4])
          if (found == -1){
            this.traktorTime.push(l[3])
          }
          latLngTime[l[3]] = [l[0], l[1]]
          speedTime[l[3]] = l[2]
        })
        let latLng = track.map(l => [l[0], l[1]])
        let time = track.map(l => l[3])
        let speed = track.map(l => l[2])
        let violation = track.map(l => l[4])
        let inside = track.map(l => l[5])
        let color = traktor.legend ? traktor.legend : this.getColor()

        let carName = "нет данных"
        let info = null
        if (traktor.carId) {
          let car = this.vuexcars.find(vc => vc.id == traktor.carId)
          carName = car ? car.displayString : "нет данных"
        } else {
          let assignment = this.areaassignments.find(a => a.id === traktor.assignmentId)
          carName = assignment.carDisplayString
          let infoAssignmentId = assignment.id
          let infoEmployee = assignment.employeeFullName
          let infoInstrumentName = assignment.instrumentName
          let infoInstrumentWidth = assignment.instrumentWidth
          let parsedInformation, infoMaxSpeed, infoMinSpeed
          try {
            parsedInformation = JSON.parse(assignment.information)
            infoMaxSpeed = parsedInformation.MaxSpeedTech ? parsedInformation.MaxSpeedTech : "нет данных"
            infoMinSpeed = parsedInformation.MinSpeedTech ? parsedInformation.MinSpeedTech : "нет данных"
          } catch (e) {
            infoMaxSpeed = "нет данных"
            infoMinSpeed = "нет данных"
          }
          info = `№ задания: ${infoAssignmentId}<br/>
                  Машина: ${carName}<br/>
                  Водитель: ${infoEmployee}<br/>
                  Инструмент: ${infoInstrumentName}<br/>
                  Ширина захвата: ${infoInstrumentWidth}<br/>
                  Макс. скорость: ${infoMaxSpeed}<br/>
                  Мин. скорость: ${infoMinSpeed}`
        }

        let polylines = new L.FeatureGroup()
        this.drawPolyline([], latLng, time, speed, violation, inside, info, color).forEach(p => polylines.addLayer(p))
        this.traktorTracks.push({
          id: traktor.carId,
          carName: carName,
          time: time,
          speed: speed,
          latLng: latLng,
          track: polylines,
          latLngTime: latLngTime,
          speedTime: speedTime,
        })
      })

      this.traktorTracks.forEach(t => {
        this.map.addLayer(t.track)
      })
      //this.map.fitBounds(this.traktorTracks[this.traktorTracks.length - 1].track.getBounds())
      this.traktorTimeLength = this.traktorTime.length - 1
      this.addTraktor()
    },
    drawPolyline(polylines, latLng, time, speed, violation, inside, info, color) {
      for (let j = 1, n = latLng.length; j < n; j++) {
        let segment = [latLng[j - 1], latLng[j]]
        let lineColor = violation[j] && inside[j] ? "rgb(255, 0, 0)" : color
        //dashArray: "30 10"
        let polyline = L.polyline(segment, {color: lineColor, weight: 2, fillOpacity: 0.5})
        let popupInfo = info ? `${info}<br/>
        Время: ${moment(time[j], "YYYY-MM-DDTHH:mm:ss").format("HH:mm:ss DD/MM/YYYY")}<br/>
        Скорость: ${speed[j]}км/ч` : `Время: ${moment(time[j], "YYYY-MM-DDTHH:mm:ss").format("HH:mm:ss DD/MM/YYYY")}<br/>Скорость: ${speed[j]}км/ч`
        polyline.bindPopup(popupInfo)
        polylines.push(polyline);
      }
      return polylines
    },
    getColor() {
      return randomcolor()
    },
    getIdLegendFromArray(array) {
      let newArray = []
      array.forEach(a => {
        newArray.push({
          id: a.assignmentId,
          legend: a.legend
        })
      })
      return newArray
    }
  }
}
