import L from 'leaflet'
import 'lib/MovingMarker'
import {EventBus} from 'services/EventBus';
import TrackTimesMixin from "components/Map/TrackTimesMixin";
import moment from 'moment'
import {deepClone} from 'lib/utils';

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
    EventBus.$on('CarDrawer.TimeTravel', (val) => {
      this.currentMovementState = "paused"
      this._stopUpdate()
      this._timeTravel(val)
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
      this.cars[id].time = this.$store.getters.getTrackTimesById(id).times
      let last = this.cars[id].time.length - 1
      let i = index || 0
      let next = i < last ? i + 1 : last
      let duration = this._getDuration(latLng[i], latLng[next], speed[i], speed[next])
      let marker = L.Marker.movingMarker([latLng[i], latLng[next]], duration, {icon: carIcon, autostart: false}, 0)
      this.cars[id].car = marker
      this.cars[id].car.addTo(this.map)
      let msg = this._createPopupMsg(id, this.cars[id].time[0], this.cars[id].time[last], this.cars[id].time[i], speed[i])
      this.cars[id].car.bindPopup(msg)
      this.cars[id].info = msg.replace(/<\/br>/g, "")
    },
    _getDuration(latLng0, latLng1, speed0, speed1) {
      let ll0 = L.latLng(latLng0)
      let ll1 = L.latLng(latLng1)
      let dist = ll0.distanceTo(ll1)
      let speedUp = 10 * this.speedUp
      let avgSpeed = Math.abs(speed1 + speed0) / 2 || 0.1
      let duration = dist / (1000 * avgSpeed) * 3600 * 1000 / speedUp
      return Math.floor(duration)
    },
    _startMove() {
      try {
        this.timeLoop = setInterval(() => {
          let notLastIds = this._getNotLastIds()
          let minTime = this._getMinTime(notLastIds)
          if (!notLastIds.length) {
            this._stopUpdate()
            return false;
          }
          let modified = false
          notLastIds.forEach(id => {
            let trackTimesObject = this.$store.getters.getTrackTimesById(id)
            let timeCond = trackTimesObject.currentTime() <= minTime
            if (timeCond && !this.cars[id].car.isRunning()) {
              this._makeUpdate(id)
              modified = true
            }
          })
          if (modified) this._updateMergedTrackTimes()
        }, 500 / this.speedUp)
      } catch (e) {
        return false;
      }
    },
    _getMinTime(notLastIds) {
      let initialMinTime = Number.MAX_SAFE_INTEGER
      let minTime = notLastIds.reduce((min, id) => {
        let time = this.$store.getters.getTrackTimesById(id).currentTime()
        return Math.min(min, time)
      }, initialMinTime)
      return minTime
    },
    _getNotLastIds() {
      let notLastIds = this.selectedAssignmentsIds.filter(id => {
        let trackTimesObject = this.$store.getters.getTrackTimesById(id)
        let notLast = trackTimesObject ? trackTimesObject.index < trackTimesObject.last : false
        return notLast
      })
      return notLastIds
    },
    _makeUpdate(id) {
      let trackTimesObject = this.$store.getters.getTrackTimesById(id)
      let i = trackTimesObject.index + 1
      this.$store.dispatch("actionUpdateTrackTimes", {id: id, index: i})
      let speed = this.cars[id].speed
      let time = this.cars[id].time
      let latLng = this.cars[id].latLng
      let duration = this._getDuration(latLng[i - 1], latLng[i], speed[i - 1], speed[i])
      this.cars[id].car.moveTo(latLng[i], duration)
    },
    _updateMergedTrackTimes() {
      let mergedTrackTimes = this.$store.getters.getMergedTrackTimes
      let notLastIds = this._getNotLastIds()
      let minTime = this._getMinTime(notLastIds)
      let modified = false
      while (mergedTrackTimes.currentTime() < minTime && mergedTrackTimes.index < mergedTrackTimes.last) {
        modified = true
        mergedTrackTimes.index++
      }
      if (modified) {
        this.$store.dispatch("actionUpdateMergedTrackTimes", mergedTrackTimes.index)
      }
    },
    _createPopupMsg(id, start, end, current, speed) {
      let assignment = this.filteredAssignments.find(a => a.id == id)
      assignment.carModelDisplayString = assignment.carDisplayString.split(" - ")[0] || assignment.carDisplayString
      let msg =
      "№" + id +
      ", </br>" + (assignment.subOperationName).trim() +
      ", </br>" + assignment.carModelDisplayString +
      "+" + assignment.instrumentName + "(" + assignment.instrumentWidth + ")" +
      ", </br>с " + moment.unix(start).format("DD.MM.YYYY HH:mm") + " до " + moment.unix(end).format("DD.MM.YYYY HH:mm") +
      ", </br>" + (assignment.avgSpeed).toFixed(2) + "км/ч"
      return msg
    },
    _stopMove() {
      this._stopUpdate()
      this.$store.dispatch("actionUpdateMergedTrackTimes", 0)
      this.selectedAssignmentsIds.forEach(id => {
        this.$store.dispatch("actionUpdateTrackTimes", {id: id, index: 0})
        this.map.removeLayer(this.cars[id].car)
        this._initCarObject(id, this.cars[id].latLng, this.cars[id].speed)
      })
    },
    _stopUpdate() {
      clearInterval(this.timeLoop)
      this.timeLoop = 0
    },
    _timeTravel(index) {
      this.$store.dispatch("actionUpdateMergedTrackTimes", index)
      let mergedTrackTimes = this.$store.getters.getMergedTrackTimes
      this.selectedAssignmentsIds.forEach(id => {
        let trackTimesObject = this.$store.getters.getTrackTimesById(id)
        trackTimesObject.index = 0
        while(trackTimesObject.currentTime() < mergedTrackTimes.currentTime()
        && trackTimesObject.index < trackTimesObject.last) {
          trackTimesObject.index++
        }
        this.$store.dispatch("actionUpdateTrackTimes", {id: id, index: trackTimesObject.index})
        this.map.removeLayer(this.cars[id].car)
        trackTimesObject = this.$store.getters.getTrackTimesById(id)
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
      let diff = moment().set({"year": 2118}).valueOf() / 1000
      while (index < mergedTrackTimes.last) {
        let t = mergedTrackTimes.times[index]
        let cond = diff > Math.abs(t - time)
        if (cond) {
          diff = Math.abs(t - time)
        } else {
          index--
          break;
        }
        index++
      }
      this.$store.dispatch("actionUpdateMergedTrackTimes", index)
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

