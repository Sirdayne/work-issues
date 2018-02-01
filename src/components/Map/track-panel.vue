<template lang="pug">
.track-panel(v-if="trackTimes && trackTimes.length")
  el-button-group.controls
    el-button.main-controls(size="small", @click="start()", v-show="!playState", title="Старт") &#x25b6;
    el-button.main-controls(size="small", @click="pause()", v-show="playState", title="Пауза") &#x23f8;
    el-button.main-controls(size="small", @click="stop()", title="Стоп") &#x23f9;
    el-button(size="small", @click="speedUp(10)", v-show="!speededUp", title="Ускорить") 10x
    el-button(size="small", @click="speedUp(1)", v-show="speededUp", title="Нормализовать") 1x
    el-button(size="small", @click="toggleTeleport()", title="Переместиться") &#8986;
  el-slider.seeker(v-model="commonTrackTimes.index", :step="1", :min="0", :max="commonTrackTimes.total - 1",
    :format-tooltip="commonTrackTimes.tooltip", @change="commonSliderChange", :disabled="!teleport",
    v-show="teleport")
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
      teleport: false,
      playing: false,
      speededUp: false,
    };
  },
  created() {
  },
  computed: {
    commonTrackTimes() {
      return this.$store.getters.getMergedTrackTimes;
    },
    playState() {
      return this.playing && this.commonTrackTimes.index < this.commonTrackTimes.last
    },
    trackTimes() {
      return this.$store.getters.getTrackTimes;
    },
  },
  methods: {
    commonSliderChange(val) {
      if (this.teleport) {
        EventBus.$emit('CarDrawer.Teleport', val);
      }
    },
    toggleTeleport() {
      this.teleport = !this.teleport
      this.$store.dispatch('actionSetTeleport', this.teleport);
      this.playing = false
    },
    turnOffTeleport() {
      this.teleport = false
      this.$store.dispatch('actionSetTeleport', this.teleport);
    },
    start() {
      this.turnOffTeleport()
      this.playing = true
      EventBus.$emit('CarDrawer.Start');
    },
    pause() {
      this.turnOffTeleport()
      this.playing = false
      EventBus.$emit('CarDrawer.Pause');
    },
    stop() {
      this.turnOffTeleport()
      this.playing = false
      EventBus.$emit('CarDrawer.Stop');
    },
    speedUp(num) {
      this.speededUp = !this.speededUp
      this.turnOffTeleport()
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
