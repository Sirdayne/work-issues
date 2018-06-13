import L from 'leaflet';
import { EventBus } from "services/EventBus";
import moment from 'moment';

export default {
  data() {
    return {
      rgbs: ['#20a0ff', '#00ff04', '#d6d600', '#8b00d6', '#00d696', '#4ba100', '#d600b6', '#00999e', '#707000']
    };
  },
  methods: {
    removePolyline() {
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
    drawPolyline() {
      this.removePolyline()
      if (this.carData) {
        this.traktorTracks = []
        let colorCycle = 0
        this.carData.forEach(traktor => {
          if (colorCycle == this.rgbs.length-1){
            colorCycle = 0
          }
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
          this._addPopupToPolyline([], latLng, time, speed, colorCycle)
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
          colorCycle++

          //open tab for OutOfAssignmentTracks
          if (traktor.date) {
            let carId = traktor.carId
            EventBus.$emit('traktorTracksTriggered', carId)
          }
        })

        this.traktorTracks.forEach(t => {
          this.map.addLayer(t.track)
        })

        this.map.fitBounds(this.traktorTracks[0].track.getBounds())

        this.traktorTimeLength = this.traktorTime.length - 1
        this.addTraktor()
      }
    },
    _addPopupToPolyline(polylines, latLng, time, speed, colorCycle) {
      for (let j = 1, n = latLng.length; j < n; j++) {
        let segment = [latLng[j - 1], latLng[j]]
        let polyline = L.polyline(segment, {color: this.rgbs[colorCycle], weight: 2, fillOpacity: 0.5})
        let info = moment(time[j], "YYYY-MM-DDTHH:mm:ss").format("HH:mm:ss DD/MM/YYYY") + ", " + speed[j] + "км/ч"
        polyline.bindPopup(info)
        polylines.push(polyline);
      }
      return polylines
    },
  }
}
