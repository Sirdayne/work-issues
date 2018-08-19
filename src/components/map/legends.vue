<template lang="pug">
.panel-legend
  .panel-legend-row(v-for="item in legends")
    p {{item.name}}
    .color-legend(:style=`{background: item.color}`)
</template>

<script>

export default {
  name: "Legends",
  props: {
    "legends": {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      loading: true,
    }
  },
}
</script>
