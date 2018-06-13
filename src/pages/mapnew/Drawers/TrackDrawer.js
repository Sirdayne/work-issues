import L from 'leaflet';
import { EventBus } from "services/EventBus";
import moment from 'moment';
import randomcolor from 'randomcolor'

export default {
  data() {
    return {

    };
  },
  created() {
    EventBus.$on('MapAddLeafletTrack', (data) => {
      this.tracksData.push(data)
      this.drawPolylines(this.tracksData)
    })
    EventBus.$on('MapRemoveLeafletTrack', (id) => {
      let index = this.tracksData.findIndex(x => x.assignmentId === id)
      if (index !== -1)
        this.tracksData.splice(index, 1)
      this.drawPolylines(this.tracksData)
    })
    EventBus.$on('MapAddCarTracks', (data) => {
      this.drawPolylines(data)
    })
  },
  methods: {
    removePolylines() {
      this.sliderStep = 0
      this.traktorTime = []
      this.traktorTimeLength = 0
      if (this.map) {
        this.traktorTracks.forEach(t => {
          this.map.removeLayer(t.track);
        })
      }
      if (this.traktorTracks.length > 0){
        this.traktorTracks.forEach(t => {
          this.map.removeLayer(t.icon)
        })
      }
    },
    drawPolylines(tracks) {
      this.removePolylines()
      this.traktorTracks = []
      tracks.forEach(traktor => {
        let track = JSON.parse(traktor.track)

        let latLngTime = {}
        let speedTime = {}
        track.forEach(l => {
          let finded = this.traktorTime.findIndex(t => t == l[4])
          if (finded == -1){
            this.traktorTime.push(l[3])
          }
          latLngTime[l[3]] = [l[0], l[1]]
          speedTime[l[3]] = l[2]
        });
        let latLng = track.map(l => [l[0], l[1]])
        let time = track.map(l => l[3])
        let speed = track.map(l => l[2])

        let car = this.vuexcars.find(vc => vc.id == traktor.carId)
        let carName = car ? car.displayString : 'нет данных'

        let polylines = new L.FeatureGroup()
        this.addPopupToPolyline([], latLng, time, speed)
          .forEach(p => polylines.addLayer(p))
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

      this.map.fitBounds(this.traktorTracks[0].track.getBounds())

      this.traktorTimeLength = this.traktorTime.length - 1
      this.addTraktor()
    },
    addPopupToPolyline(polylines, latLng, time, speed, ) {
      let color = this.getColor()
      for (let j = 1, n = latLng.length; j < n; j++) {
        let segment = [latLng[j - 1], latLng[j]]
        let polyline = L.polyline(segment, {color: color, weight: 2, fillOpacity: 0.5})
        let info = moment(time[j], "YYYY-MM-DDTHH:mm:ss").format("HH:mm:ss DD/MM/YYYY") + ", " + speed[j] + "км/ч"
        polyline.bindPopup(info)
        polylines.push(polyline);
      }
      return polylines
    },
    getColor() {
      return randomcolor()
    },
  }
}
