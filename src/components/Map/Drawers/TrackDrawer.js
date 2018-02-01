import L from 'leaflet';
import moment from 'moment'

export default {
  methods: {
    removeTracks() {
      if (this.map) this.map.removeLayer(this.tracks);
    },
    drawTracks() {
      this.removeTracks()
      this.tracks = new L.FeatureGroup();
      let isPolylines = this.polylines && this.polylines.length
      if (isPolylines) {
        this.polylines.forEach((data, i) => {
          let track = JSON.parse(data.track);
          let assignment = this.assignments.find(a => a.id === data.assignmentId);
          let latLng = track.map(l => [l[0], l[1]]);
          let speed = track.map(l => l[2]);
          let time = track.map(l => l[3]);
          let violation = track.map(l => l[4]);
          let inside = track.map(l => l[5]);
          this._addPolylines([], assignment, latLng, speed, time, violation, inside, this.colors[i])
            .forEach(p => this.tracks.addLayer(p))
          this.drawCars(assignment, latLng, speed, time)
        });
        this.map.fitBounds(this.tracks.getBounds());
        this.map.addLayer(this.tracks);
      }
    },
    _addPolylines(polylines, assignment, latLng, speed, time, violation, inside, randomColor) {
      for (let j = 1, n = latLng.length; j < n; j++) {
        let segment = [latLng[j - 1], latLng[j]]
        let outside = !inside[j - 1] || !inside[j]
        let notViolated = !violation[j - 1] || !violation[j]
        let color = (outside || notViolated) ? randomColor : "red"
        let polyline = L.polyline(segment, {color: color, weight: 2, fillOpacity: 0.5})
        assignment.carModelDisplayString = assignment.carDisplayString.split(" - ")[0] || assignment.carDisplayString
        let info =
          "№" + assignment.id +
          ", </br>" + (assignment.subOperationName).trim() +
          ", </br>" + assignment.carModelDisplayString +
          "+" + assignment.instrumentName + "(" + assignment.instrumentWidth + ")" +
          ", </br>Время: " + time[j] +
          ", </br>" + speed[j] + "км/ч"
        polyline.bindPopup(info)
        polylines.push(polyline);
      }
      return polylines
    },
  }
}
