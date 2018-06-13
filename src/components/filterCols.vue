<template lang="pug">
button.filter-head(:class="{small: heightSmall === true}") колонки
  .filter-cols(:class="{postop: posTop === true}")
    .filter-col(v-for="col in cols")
      el-checkbox(v-model="col.active") {{ col.label }}
</template>

<script>

import {EventBus} from 'services/EventBus';

export default {
  data() {
    return {

    }
  },
  props: [
    'cols',
    'heightSmall',
    'posTop'
  ],
  methods: {

  }
}
</script>

<style lang="stylus">
.filter-head
  display inline-block
  position relative
  min-height 36px
  padding 2px 10px
  max-width 100px
  text-align center
  font-size 14px
  border 1px solid #c4c4c4
  border-radius 4px
  color #323232
  cursor pointer
  font-weight 100
  margin 0 5px
  background #fff
  outline none
  &:hover
    border-color #20a0ff
    color #20a0ff
    .filter-cols
      display block
  &.small
    min-height 25px

.filter-cols
  position absolute
  display none
  top 35px
  left 0px
  width auto
  padding 5px 10px
  text-align left
  background #fff
  border 1px dotted #20a0ff
  cursor auto
  z-index 10001
  &.postop
    top auto
    left auto
    right 0
    bottom 25px

.filter-col
  width 100%

</style>
