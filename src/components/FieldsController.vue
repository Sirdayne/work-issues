<template lang="pug">
div
  ul.list: li.field(
    v-for="field in filteredFields",
  )
    input.control(@change="sync", type="checkbox", v-model="checkedFields[field.id]", :id="`field_${field.id}`")
    label.label(
      :for="`field_${field.id}`",
      @click="fieldClick(field)",
      :class="{active: field.id === activeFieldId}"
    ) {{ field.newName }}

</template>

<script>
import sowingsModel from '_models/Sowings'
import culturesModel from '_models/Cultures'
import datasets from 'mixins/datasets2'

import { createIndexes } from 'helpers'

import {EventBus} from 'services/EventBus';

export default {
  mixins: [
    datasets
  ],
  data() {
    return {
      activeFieldId: null,
      checkedFields: {},
      crutch: 1
    }
  },
  props: [
    'fields',
    'culture'
  ],
  created() {
    this.makeBlank()
  },
  methods: {
    makeBlank() {
      this.fields.forEach(field => {
        this.checkedFields[field.id] = false
      })
    },
    onContextChange(ctx) {
      this.crutch = 2
      this.makeBlank()
      this.$nextTick(() => {
        this.crutch = 3
      })
    },
    fieldClick(field) {
      this.activeFieldId = field.id
      this.$emit('fieldClick', field)
      EventBus.$emit('fieldClicked', field.id );
    },
    sync() {
      this.$emit('input', Object.keys(this.checkedFields).filter(id => this.checkedFields[id]))
    }
  },
  computed: {
    filteredFields() {
      let sowings = this.datasetForModel(sowingsModel)
      let cultures = this.datasetForModel(culturesModel).records
      let p = []
      if (!sowings.isReady) return []
      let fields = createIndexes(this.fields, 'id')
      let sowingsSet = createIndexes(sowings.records.filter(sowing => sowing.year === this.context.year), 'fieldId', true)
      return this.crutch? this.fields.filter(field => {
        let sowings = sowingsSet[field.id]
        if (!sowings) return true
        if (fields[sowings[0].fieldId].area - sowings.reduce((a,b) => a + b.area, 0) > 0) return true
        /*if (
          this.culture && cultures.find(c => c.id === this.culture).isWinter &&
          sowings.find(sowing => [6,7].indexOf(cultures.find(c => c.id === sowing.culture).cultureTypeId))
        ) return true
        if (
          this.culture && [6,7].indexOf(cultures.find(c => c.id === this.culture).cultureTypeId) !== -1 &&
          cultures.find(c => c.id === sowing.culture).isWinter
        ) return true*/
        return false
      }) : []
      /*
      if (this.culture && cultures.find(c => c.id === this.culture).isWinter) {
        // for winter
      } else if (this.culture && [6,7].indexOf(cultures.find(c => c.id === this.culture).cultureTypeId) !== -1) {
        // for winter
      } else {

      }*/
      /*throw new Error('fields')
      if (this.culture && cultures.find(c => c.id === this.culture).isWinter) {
        p = cultures.filter(c => c.cultureTypeId === 7).map(c => c.id)
      }
      return this.crutch? this.fields.filter(field => {
        return (!sowings.records.find(sowing => sowing.year === this.context.year && (p.indexOf(sowing.cultureId) === -1 && sowing.fieldId === field.id)))
      }) : []*/
    }
  }
}
</script>

<style lang="stylus" scoped>
.list
  margin 0
  padding 0
  list-style-type none
  overflow hidden
.field
  position relative
  float left
  padding 10px
  width 100px
  height 20px
  margin 5px
  >>> .control
    opacity 0
  >>> .label
    position absolute
    left 0
    right 0
    top 0
    bottom 0
    padding 5px
    background #9e9e9e
    font-size 13px
    text-transform uppercase
    text-align left
    border solid 2px #fff
    cursor pointer
    &.active
      border solid 2px green
  .control:checked + .label
    color #fff
    background #63a263
</style>
