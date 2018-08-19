import {EventBus} from "services/EventBus"

export default {
  data() {
    return {
      $_windowInnerHeight: 0,
    }
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.$_getWindowInnerHeight);
      this.$_getWindowInnerHeight()
    })
  },
  methods: {
    $_getWindowInnerHeight() {
      this.$_windowInnerHeight = window.innerHeight;
      EventBus.$emit("WindowResize.windowInnerHeight", this.$_windowInnerHeight)
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.$_getWindowInnerHeight);
  }
}
