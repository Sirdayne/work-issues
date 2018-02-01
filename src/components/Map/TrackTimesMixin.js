export default {
  data() {
    return {
    }
  },
  methods: {
    mergeTrackTimes(times, id) {
      let mergedTrackTimes = this.$store.getters.getMergedTrackTimes
      mergedTrackTimes = mergedTrackTimes && (mergedTrackTimes.times || [])
      let matrix = this._generateMatrix(this._prepareTimes(mergedTrackTimes))
      let preparedTimes = this._prepareTimes(times)
      this._initTrackTimes(preparedTimes, id)
      let newMatrix = this._generateMatrix(preparedTimes)
      let newMergedTrackTimes = this._createMergedTrackTimes([], matrix, newMatrix)
      this._initMergedTrackTimes(newMergedTrackTimes)
    },
    _prepareTimes(times) {
      if (!times.length) return times
      let hour, minute, initialHour, initialMinute
      [initialHour, initialMinute] = times[0].split(":")
      let initialTime = initialHour * 60 + +initialMinute
      let multiplier = 0, prevDiff = 0, diff
      return times.slice().map((t, i) => {
        [hour, minute] = t.split(":")
        let time = (hour * 60 + +minute) + (24 * 60 * multiplier)
        diff = time - initialTime
        if (i && prevDiff > diff) {
          multiplier++
          time += 24 * 60
          initialTime = time
        }
        prevDiff = time - initialTime
        t = this._getHourAndMinutes(time)
        return t
      })
    },
    _getHourAndMinutes(time) {
      let hour = Math.floor(time / 60)
      let minute = time % 60
      let hh = hour < 10 ? "0" + hour : hour
      let mm = minute < 10 ? "0" + minute : minute
      let t = hh + ":" + mm
      return t
    },
    _generateMatrix(times) {
      let matrix = Array(72 * 60).fill(0)
      if (!times.length) return matrix
      let hour, minute, time
      times.forEach((t, i) => {
        [hour, minute] = t.split(":")
        time = hour * 60 + +minute
        matrix[time]++
      })
      return matrix
    },
    _createMergedTrackTimes(mergedTrackTimes, matrix, newMatrix) {
      for (var h = 0; h < 72; h++) {
        for (var m = 0; m <= 59; m++) {
          let time = h * 60 + m
          matrix[time] = Math.max(matrix[time], newMatrix[time])
          if (matrix[time]) {
            let hh = h < 10 ? "0" + h : h
            let mm = m < 10 ? "0" + m : m
            let t = hh + ":" + mm
            mergedTrackTimes.push(t)
          }
        }
      }
      return mergedTrackTimes
    },
    _prepareTrackTimesObject(preparedTimes) {
      let preparedTimesObject = {}
      preparedTimesObject.times = preparedTimes
      preparedTimesObject.index = 0
      preparedTimesObject.total = preparedTimesObject.times.length
      preparedTimesObject.last = preparedTimesObject.times.length -1
      preparedTimesObject.start = preparedTimesObject.times[0]
      preparedTimesObject.end = preparedTimesObject.times[preparedTimesObject.total - 1]
      preparedTimesObject.currentTime = () => preparedTimesObject.times[preparedTimesObject.index]
      preparedTimesObject.currentTimeInMinutes = () => {
        let hh, mm
        [hh, mm] = preparedTimesObject.times[preparedTimesObject.index].split(":")
        return hh * 60 + +mm
      }
      preparedTimesObject.percent = () => (preparedTimesObject.index / (preparedTimesObject.total - 1) * 100).toFixed(2)
      preparedTimesObject.tooltip = () => {
        let tooltip = preparedTimesObject.percent() + "%, " + preparedTimesObject.currentTime()
        if (preparedTimesObject.id) tooltip = "№" + preparedTimesObject.id + ", " + tooltip
        return tooltip
      }
      return preparedTimesObject
    },
    _initTrackTimes(preparedTimes, id) {
      let preparedTimesObject = this._prepareTrackTimesObject(preparedTimes)
      preparedTimesObject.id = id
      this.$store.dispatch("actionUpdateTrackTimes", preparedTimesObject)
    },
    _initMergedTrackTimes(mergedTrackTimes) {
      let preparedTimesObject = this._prepareTrackTimesObject(mergedTrackTimes)
      this.$store.dispatch("actionUpdateMergedTrackTimes", preparedTimesObject)
    },
    clearTrackTimes() {
      this.$store.dispatch("actionClearMergedTrackTimes")
      this.$store.dispatch("actionClearTrackTimes")
    },
  }
}
