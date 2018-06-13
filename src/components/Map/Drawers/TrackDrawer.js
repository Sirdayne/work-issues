import L from 'leaflet'
import {EventBus} from 'services/EventBus'
import moment from "moment";

export default {
  methods: {
    removeTracks() {
      if (this.map) this.map.removeLayer(this.tracks);
    },
    drawTracks() {
      this.removeTracks()
      this.tracks = new L.FeatureGroup();
      let isPolylines = this.polylines && this.polylines.length
      let legends = []
      if (isPolylines) {
        this.polylines.forEach((data, i) => {
          let track = JSON.parse(data.track).filter((v, j) => j % 5 == 0);
          let latLng = track.map(l => [l[0], l[1]]);
          let speed = track.map(l => l[2]);

          let assignment = this.assignments.find(a => a.id === data.assignmentId);
          let assignmentDateStart = moment(assignment.dateTimeRangeStart, "YYYY-MM-DDTHH:mm:ss")
            .set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0})
            .valueOf() / 1000
          let times = this._prepareTimes(track.map(l => l[3]), assignmentDateStart)

          let violation = track.map(l => l[4]);
          let inside = track.map(l => l[5]);

          this._addPolylines([], assignment, latLng, speed, times, violation, inside, this.colors[i])
            .forEach(p => this.tracks.addLayer(p))
          this.drawCars(assignment, latLng, speed, times)
          legends.push({color: this.colors[i], id: assignment.id})
        });
        EventBus.$emit('MapController.addLegendToSelectedAssignments', legends);
        this.map.fitBounds(this.tracks.getBounds());
        this.map.addLayer(this.tracks);
      }
    },
    _prepareTimes(times, date) {
      if (!times.length) return times
      let hour, minute, initialHour, initialMinute
      [initialHour, initialMinute] = times[0].split(":")
      let initialTime = initialHour * 60 + +initialMinute
      let multiplier = 0, prevDiff = 0, diff
      return times.slice().map((t, i) => {
        if (moment(t, "HH:mm", true).isValid()) {
          [hour, minute] = t.split(":")
          let time = (hour * 60 + +minute) + (24 * 60 * multiplier)
          diff = time - initialTime
          if (i && prevDiff > diff) {
            multiplier++
            time += 24 * 60
            initialTime = time
          }
          prevDiff = time - initialTime
          return date + time * 60
        } else if (moment(t, "YYYY-MM-DDTHH:mm:ss", true).isValid()) {
          return moment(t, "YYYY-MM-DDTHH:mm:ss").valueOf() / 1000
        }
      })
    },
    _addPolylines(polylines, assignment, latLng, speed, times, violation, inside, randomColor) {
      assignment.carModelDisplayString = assignment.carDisplayString.split(" - ")[0] || assignment.carDisplayString
      let baseInfo =
        "№" + assignment.id +
        ", </br>" + (assignment.subOperationName).trim() +
        ", </br>" + assignment.carModelDisplayString +
        "+" + assignment.instrumentName + "(" + assignment.instrumentWidth + ")"
      let speedLimits = []
      if (assignment.information) {
        let information
        try {
          information = JSON.parse(assignment.information)
        } catch (e) {
          information = {}
        }
        let minSpeed = information.MinSpeedTech && Math.floor(information.MinSpeedTech)
        let maxSpeed = information.MaxSpeedTech && Math.floor(information.MaxSpeedTech)
        if (minSpeed && Number.isInteger(minSpeed)) speedLimits.push(`мин:${minSpeed}км/ч`)
        if (maxSpeed && Number.isInteger(maxSpeed)) speedLimits.push(`макс:${maxSpeed}км/ч`)
      }
      for (let j = 1, n = latLng.length; j < n; j++) {
        let segment = [latLng[j - 1], latLng[j]]
        let outside = !inside[j - 1] || !inside[j]
        let notViolated = !violation[j - 1] || !violation[j]
        let color = (outside || notViolated) ? randomColor : "red"
        color = outside ? color + "50" : color
        let weight = outside ? 3 : 4
        let polyline = L.polyline(segment, {color: color, weight: weight, fillOpacity: 0.5})
        let info = baseInfo +
        ", </br>Время: " + moment.unix(times[j]).format("DD.MM.YYYY HH:mm") +
        ", </br>" + speed[j] + "км/ч"
        if (speedLimits.length) info += `(${speedLimits.join(", ")})`
        polyline.bindPopup(info)
        polylines.push(polyline);
      }
      return polylines
    },
  }
}
