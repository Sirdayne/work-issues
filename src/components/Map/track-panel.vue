<template lang="pug">
.track-panel(v-if="trackTimes && trackTimes.length")
  el-button-group.controls
    el-button.main-controls(size="small", @click="start()", v-show="!playState", title="Старт") &#x25b6;
    el-button.main-controls(size="small", @click="pause()", v-show="playState", title="Пауза") &#x23f8;
    el-button.main-controls(size="small", @click="stop()", title="Стоп") &#x23f9;
    el-button(size="small", @click="speedUp(10)", v-show="!speededUp", title="Ускорить") 10x
    el-button(size="small", @click="speedUp(1)", v-show="speededUp", title="Нормализовать") 1x
    el-button(size="small", @click="toggleTimeTravel()", title="Переместиться") &#8986;
  el-slider.seeker(v-model="mttIndex", :step="1", :min="0", :max="mergedTrackTimes.last",
    :format-tooltip="showTooltip", @change="commonSliderChange", :disabled="!timeTravel",
    v-show="timeTravel")
</template>

<script>
import {EventBus} from 'services/EventBus';

export default {
  name: "TrackPanel",
  props: [],
  components: {
  },
  data() {
    return {
      timeTravel: false,
      playing: false,
      speededUp: false,
      mttIndex: 0,
    };
  },
  watch: {
    mergedTrackTimes(mtt) {
      this.mttIndex = mtt.index
    }
  },
  computed: {
    mergedTrackTimes() {
      return this.$store.getters.getMergedTrackTimes;
    },
    playState() {
      return this.playing && this.mergedTrackTimes.index < this.mergedTrackTimes.last
    },
    trackTimes() {
      let trackTimes = this.$store.getters.getTrackTimes
      if (trackTimes.length > 0) {
        EventBus.$emit('RemoveTraktorTracks');
      }
      return this.$store.getters.getTrackTimes;
    },
  },
  methods: {
    commonSliderChange(val) {
      if (this.timeTravel) {
        EventBus.$emit('CarDrawer.TimeTravel', val);
      }
    },
    showTooltip() {
      return this.mergedTrackTimes.tooltip()
    },
    toggleTimeTravel() {
      this.playing = false
      EventBus.$emit('CarDrawer.Pause');
      this.timeTravel = !this.timeTravel
      this.$store.dispatch('actionSetTimeTravel', this.timeTravel);
    },
    turnOffTimeTravel() {
      this.timeTravel = false
      this.$store.dispatch('actionSetTimeTravel', this.timeTravel);
    },
    start() {
      this.turnOffTimeTravel()
      this.playing = true
      EventBus.$emit('CarDrawer.Start');
    },
    pause() {
      this.turnOffTimeTravel()
      this.playing = false
      EventBus.$emit('CarDrawer.Pause');
    },
    stop() {
      this.turnOffTimeTravel()
      this.playing = false
      EventBus.$emit('CarDrawer.Stop');
    },
    speedUp(num) {
      this.speededUp = !this.speededUp
      this.turnOffTimeTravel()
      this.playing = true
      EventBus.$emit('CarDrawer.SpeedUp', num);
    },
  }
};
</script>

<style lang="stylus" scoped>
.track-panel
  display flex
  height 100%
  width 280px
  .el-button
    padding 11px 9px
    border-color #d3dce6
.controls {
  flex: 0 1 auto;
  & > .el-button.main-controls {
    width: 30.34px
  }
}
.seeker {
  flex: 0 1 auto;
  width: 120px
  margin-left: 10px;
}
</style>
