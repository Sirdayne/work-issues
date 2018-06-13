import {deepClone} from 'lib/utils';
import moment from "moment";

export default {
  methods: {
    mergeTrackTimes(times, id) {
      this._initTrackTimes(times, id)
      this._initMergedTrackTimes(this._createMergedTrackTimes(id))
    },
    _createMergedTrackTimes(id) {
      let mergedTrackTimes = this.$store.getters.getMergedTrackTimes.times || []
      let trackTimes = this.$store.getters.getTrackTimes.find(tt => tt.id == id).times || []
      let newMTT = [].concat(trackTimes, mergedTrackTimes).sort().filter((v, i, a) => a.indexOf(v) === i)
      return newMTT
    },
    _prepareTrackTimesObject(preparedTimes) {
      let preparedTimesObject = {}
      preparedTimesObject.times = deepClone(preparedTimes)
      preparedTimesObject.index = 0
      preparedTimesObject.total = preparedTimesObject.times.length
      preparedTimesObject.last = preparedTimesObject.total - 1
      preparedTimesObject.start = preparedTimesObject.times[0]
      preparedTimesObject.end = preparedTimesObject.times[preparedTimesObject.last]
      preparedTimesObject.currentTime = function() {
        return this.times[this.index]
      }
      preparedTimesObject.currentDateAndTime = function() {
        let unixTime = this.currentTime()
        return moment.unix(unixTime).format("DD.MM.YYYY HH:mm")
      }
      preparedTimesObject.percent = function() {
       return (this.index / this.last * 100).toFixed(2)
      }
      preparedTimesObject.tooltip = function() {
        let tooltip = this.percent() + "%, " + this.currentDateAndTime()
        if (this.id) tooltip = "№" + this.id + ", " + tooltip
        return tooltip
      }
      return preparedTimesObject
    },
    _initTrackTimes(preparedTimes, id) {
      let preparedTimesObject = this._prepareTrackTimesObject(preparedTimes)
      preparedTimesObject.id = id
      this.$store.dispatch("actionInitTrackTimes", preparedTimesObject)
    },
    _initMergedTrackTimes(mergedTrackTimes) {
      let preparedTimesObject = this._prepareTrackTimesObject(mergedTrackTimes)
      this.$store.dispatch("actionInitMergedTrackTimes", preparedTimesObject)
    },
    clearTrackTimes() {
      this.$store.dispatch("actionClearMergedTrackTimes")
      this.$store.dispatch("actionClearTrackTimes")
    },
  }
}
