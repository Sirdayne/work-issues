<template lang="pug">
div
  ul.list(v-if="items.length")
    li.item(v-for="item in items", class="step2-2")
      template(v-if="item.blocked")
        .label-for-checkbox.blocked
          slot(name="item", :item="item") {{item.displayString}}
      template(v-else)
        input.checkbox(
          :id="`fields_select_plate_${_uid}_${item.id}`",
          type="checkbox",
          :value="item.id",
          v-model="selected",
          @click="select(item)"
        )
        label.label-for-checkbox(
          :class="{active: activeCondition(item) || highlightActive && activeId === item.id}",
          :for="`fields_select_plate_${_uid}_${item.id}`"
        )
          slot(name="item", :item="item") {{item.displayString}}

  p.no-results(v-else) Нет результатов
</template>

<script>
import {EventBus} from 'services/EventBus';

export default {
  props: {
    items: {
      default: []
    },
    value: {
      default: []
    },
    highlightActive: {
      default: true
    },
    activeCondition: {
      default: () => false
    }
  },
  data: () => ({
    activeId: null,
    selected: []
  }),
  created() {
    this.$on('blur', () => {
      this.activeId = null
    })
    this.selected = this.value
  },
  watch: {
    value(val) {
      this.selected = val
    },
    selected(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    select(item) {
      this.activeId = item.id
      EventBus.$emit('fieldClicked', item.fieldId );
      this.$emit('select', item)
    }
  }
}
</script>

<style lang="stylus" scoped>

.checkbox
  position absolute
  left -99999px
  right -99999px
  opacity 0
  width 0
  height 0

.label-for-checkbox
  display block
  flex 1
  min-width 100px
  height 100%
  line-height 1.3
  padding 10px
  margin 1px
  box-sizing border-box
  font-size 13px
  cursor pointer
  background #9e9e9e
  border 1px solid #fff
  &.active
    border 1px solid #48576a
  >>> .checkbox:checked + &
    background #63a263
    color #fff
    &.active
      border 1px solid #fff
      background #336f33
  &.blocked
    cursor default
    background rgba(0,0,0,0)
    border 1px solid #323232

.list
  padding 0
  margin 0
  list-style none
  display flex
  flex-wrap wrap
  &:after
    content ''
    flex 4
.item
  flex 1
</style>
