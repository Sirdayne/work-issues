import L from 'leaflet'
import {EventBus} from 'services/EventBus';
import moment from 'moment';

export default {
  data() {
    return {
      latLng: null,
      speed: 800,
      timerTraktor: null,
    };
  },
  created() {
    this.sliderStep = 0
    EventBus.$on('RemoveTraktorTracks', () => {
      clearInterval(this.timerTraktor)
      this.hideTraktorPanel()
      this.removePolylines()
    });
  },
  destroyed() {
    clearInterval(this.timerTraktor)
  },
  watch: {
    'sliderStep'(val, oldVal) {
      this.traktorTracks.forEach(t => {
        if (t.latLngTime[this.traktorTime[val]]){
          t.icon.setLatLng(t.latLngTime[this.traktorTime[val]])
          let popup = `Машина: ${t.carName}</br> Скорость: ${t.speedTime[this.traktorTime[val]]} км/ч</br> Время: ${moment(this.traktorTime[val], "YYYY-MM-DDTHH:mm:ss").format("YYYY/MM/DD HH:mm:ss")}</br>`
          t.icon.bindPopup(popup)
        }
      })
    },
  },
  methods: {
    showTraktorPanel() {
      this.isTraktorPanelShown = true
    },
    hideTraktorPanel() {
      this.isTraktorPanelShown = false
    },
    addTraktor() {
      let traktorIcon = L.icon({iconUrl: require('assets/tractor_small.png'), iconSize: [32, 32], iconAnchor: [15, 25], popupAnchor: [0, -16]});
      this.traktorTracks.forEach(t => {
        t.icon = L.marker(t.latLng[0], {icon: traktorIcon}).addTo(this.map);
        let popup = `Машина: ${t.carName}</br> Скорость: 0 км/ч`
        t.icon.bindPopup(popup)
      })
      this.showTraktorPanel()
    },
    startTraktor() {
      clearInterval(this.timerTraktor)
      this.timerTraktor = setInterval(() => {
        if (this.sliderStep < this.traktorTimeLength){
          this.sliderStep++

          this.isTraktorPaused = false
        } else {
          clearInterval(this.timerTraktor)
          this.isTraktorPaused = true
        }
      }, this.speed);
    },
    pauseTraktor() {
      clearInterval(this.timerTraktor)
      this.isTraktorPaused = true
    },
    stopTraktor() {
      clearInterval(this.timerTraktor)
      this.sliderStep = 0
      this.traktorTracks.forEach(t => {
        t.icon.setLatLng(t.latLng[0])
      })
      this.isTraktorPaused = true
    },
    speedUpTraktor() {
      this.speed = 300
      this.startTraktor()
      this.isTraktorSpeed = true
    },
    speedDownTraktor() {
      this.speed = 800
      this.startTraktor()
      this.isTraktorSpeed = false
    }
  },
}

