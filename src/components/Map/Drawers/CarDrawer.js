import L from 'leaflet'
import 'lib/MovingMarker'
import moment, { duration } from 'moment'
import {EventBus} from 'services/EventBus';
import TrackTimesMixin from "components/Map/TrackTimesMixin";

export default {
  mixins: [TrackTimesMixin],
  data() {
    return {
      speedUp: 1,
      timeLoop: null,
      currentMovementState: "stopped"
    };
  },
  created() {
    EventBus.$on('CarDrawer.Teleport', (val) => {
      this.currentMovementState = "paused"
      this._stopUpdate()
      this._teleport(val)
    });
    EventBus.$on('CarDrawer.Start', () => {
      if (this.currentMovementState !== "started") {
        this.currentMovementState = "started"
        this._startMove()
      }
    });
    EventBus.$on('CarDrawer.Pause', () => {
      if (this.currentMovementState !== "paused") {
        this.currentMovementState = "paused"
        this._stopUpdate()
      }
    });
    EventBus.$on('CarDrawer.Stop', () => {
      if (this.currentMovementState !== "stopped") {
        this.currentMovementState = "stopped"
        this._stopMove()
      }
    });
    EventBus.$on('CarDrawer.SpeedUp', (speedUp) => {
      EventBus.$emit('CarDrawer.Pause')
      this.speedUp = speedUp
      EventBus.$emit('CarDrawer.Start')
    });
  },
  computed: {
    selectedAssignmentsIds() {
      return this.$store.getters.getSelectedAssignments;
    },
  },
  methods: {
    drawCars(assignment, latLng, speed, time) {
      let id = assignment.id
      this.mergeTrackTimes(time, id)
      this._initCarObject(id, latLng, speed)
    },
    _initCarObject(id, latLng, speed, index) {
      let carIcon = L.icon({iconUrl: require('assets/tractor_small.png'), iconSize: [32, 32], iconAnchor: [15, 25], popupAnchor: [0, -16]});
      this.cars[id] = {}
      this.cars[id].latLng = latLng
      this.cars[id].speed = speed
      this.cars[id].time = this.$store.getters.getTrackTimes.find(tt => tt.id == id).times
      let last = this.cars[id].time.length - 1
      let i = index || 0
      let next = i < last ? i + 1 : last
      let duration = this._getDuration(latLng[i], latLng[next], speed[i], speed[next])
      let marker = L.Marker.movingMarker([latLng[i], latLng[next]], duration, {icon: carIcon, autostart: false}, 0)
      this.cars[id].car = marker
      this.cars[id].car.addTo(this.map)
      let msg = this._createPopupMsg(id, this.cars[id].time[0], this.cars[id].time[last], this.cars[id].time[i], speed[i])
      this.cars[id].car.bindPopup(msg)
    },
    _getDuration(latLng0, latLng1, speed0, speed1) {
      let ll0 = L.latLng(latLng0)
      let ll1 = L.latLng(latLng1)
      let dist = ll0.distanceTo(ll1)
      let speedUp = 10 * this.speedUp
      let avgSpeed = Math.abs(speed1 + speed0) / 2 || 0.1
      let duration = dist / (1000 * avgSpeed) * 3600 * 1000 / speedUp
      return duration
    },
    _startMove() {
      try {
        this.timeLoop = setInterval(() => {
          let mergedTrackTimes = this.$store.getters.getMergedTrackTimes
          let mergedTime = mergedTrackTimes.currentTimeInMinutes()
          let trackTimes = this.$store.getters.getTrackTimes
          let notLastIds = this._getNotLastIds(trackTimes)
          let minTime = this._getMinTime(notLastIds, trackTimes, mergedTime)
          if (!notLastIds.length) {
            this._stopUpdate()
            return false;
          }
          notLastIds.forEach(id => {
            let trackTimesObject = trackTimes.find(tt => tt.id == id)
            let timeCond = trackTimesObject.currentTimeInMinutes() <= minTime
            if (timeCond && !this.cars[id].car.isRunning()) {
              this._makeUpdate(id)
            }
          })
          this._updateMergedTrackTimes(mergedTrackTimes)
        }, 500 / this.speedUp)
      } catch (e) {
        return false;
      }
    },
    _getMinTime(notLastIds, trackTimes, initialMinTime) {
      let minTime = notLastIds.reduce((min, id) => {
        let trackTimesObject = trackTimes.find(tt => tt.id == id)
        let time = trackTimesObject.currentTimeInMinutes()
        return Math.min(min, time)
      }, initialMinTime)
      return minTime
    },
    _getNotLastIds(trackTimes) {
      let notLastIds = this.selectedAssignmentsIds.filter(id => {
        let trackTimesObject = trackTimes.find(tt => tt.id == id)
        let notLast = trackTimesObject ? trackTimesObject.index < trackTimesObject.last : false
        return notLast
      })
      return notLastIds
    },
    _updateMergedTrackTimes(mergedTrackTimes) {
      let trackTimes = this.$store.getters.getTrackTimes
      let maxTime = 72 * 60
      let notLastIds = this._getNotLastIds(trackTimes)
      let minTime = this._getMinTime(notLastIds, trackTimes, maxTime)
      while (mergedTrackTimes.currentTimeInMinutes() < minTime && mergedTrackTimes.index < mergedTrackTimes.last) {
        mergedTrackTimes.index++
      }
      this.$store.dispatch("actionUpdateMergedTrackTimes", mergedTrackTimes)
    },
    _makeUpdate(id) {
      let trackTimes = this.$store.getters.getTrackTimes
      let trackTimesObject = trackTimes.find(tt => tt.id == id)
      let last = trackTimesObject.last
      trackTimesObject.index++
      this.$store.dispatch("actionUpdateTrackTimes", trackTimesObject)
      let i = trackTimesObject.index
      let speed = this.cars[id].speed
      let time = this.cars[id].time
      let latLng = this.cars[id].latLng
      let duration = this._getDuration(latLng[i - 1], latLng[i], speed[i - 1], speed[i])
      this.cars[id].car.moveTo(latLng[i], duration)
    },
    _createPopupMsg(id, start, end, current, speed) {
      let assignment = this.filteredAssignments.find(a => a.id == id)
      assignment.carModelDisplayString = assignment.carDisplayString.split(" - ")[0] || assignment.carDisplayString
      let msg =
      "№" + id +
      ", </br>" + (assignment.subOperationName).trim() +
      ", </br>" + assignment.carModelDisplayString +
      "+" + assignment.instrumentName + "(" + assignment.instrumentWidth + ")" +
      ", </br>с " + start + " до " + end +
      ", </br>" + (assignment.avgSpeed).toFixed(2) + "км/ч"
      return msg
    },
    _stopMove() {
      this._stopUpdate()
      let mergedTrackTimes = this.$store.getters.getMergedTrackTimes
      mergedTrackTimes.index = 0
      this.$store.dispatch("actionUpdateMergedTrackTimes", mergedTrackTimes)
      let trackTimes = this.$store.getters.getTrackTimes
      this.selectedAssignmentsIds.forEach(id => {
        let trackTimesObject = trackTimes.find(tt => tt.id == id)
        trackTimesObject.index = 0
        this.$store.dispatch("actionUpdateTrackTimes", trackTimesObject)
        this.map.removeLayer(this.cars[id].car)
        this._initCarObject(id, this.cars[id].latLng, this.cars[id].speed)
      })
    },
    _stopUpdate() {
      clearInterval(this.timeLoop)
      this.timeLoop = 0
    },
    _teleport(index) {
      let mergedTrackTimes = this.$store.getters.getMergedTrackTimes
      mergedTrackTimes.index = index
      this.$store.dispatch("actionUpdateMergedTrackTimes", mergedTrackTimes)
      let trackTimes = this.$store.getters.getTrackTimes
      this.selectedAssignmentsIds.forEach(id => {
        let trackTimesObject = trackTimes.find(tt => tt.id == id)
        trackTimesObject.index = 0
        while(trackTimesObject.currentTimeInMinutes() < mergedTrackTimes.currentTimeInMinutes()
        && trackTimesObject.index < trackTimesObject.last) {
          trackTimesObject.index++
        }
        this.$store.dispatch("actionUpdateTrackTimes", trackTimesObject)
        this.map.removeLayer(this.cars[id].car)
        this._initCarObject(id, this.cars[id].latLng, this.cars[id].speed, trackTimesObject.index)
      })
    },
    removeCars() {
      this._stopUpdate()
      this.clearTrackTimes()
      let ids = Object.keys(this.cars)
      ids.forEach(id => {
        this.map.removeLayer(this.cars[id].car)
        this._destroyCars(id)
      })
      if (!ids.length || !this.selectedAssignmentsIds.length) this.cars = {}
    },
    findIndexClosestToTime(time) {
      let mergedTrackTimes = this.$store.getters.getMergedTrackTimes
      let index = 0
      let minutes = time.split(":")[0] * 60 + +time.split(":")[1]
      let diff = 3 * 24 * 60
      while (index < mergedTrackTimes.last) {
        let t = mergedTrackTimes.times[index]
        let mm = t.split(":")[0] * 60 + +t.split(":")[1]
        if (diff > Math.abs(mm - minutes)) {
          diff = Math.abs(mm - minutes)
        } else {
          index--
          break;
        }
        index++
      }
      mergedTrackTimes.index = index
      this.$store.dispatch("actionUpdateMergedTrackTimes", mergedTrackTimes)
    },
    _destroyCars(id) {
      this.cars[id] = {}
      delete this.cars[id]
    },
  },
  destroyed() {
    this.removeCars()
  },
}

