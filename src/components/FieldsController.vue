<template lang="pug">
div(v-loading="fieldsLoading")
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
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import {EventBus} from 'services/EventBus'
import moment from 'moment'
import ListController from 'mixins/ListController'

export default {
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  props: [
    'quickFilter',
    'brigadeId',
  ],
  data() {
    return {
      activeFieldId: null,
      checkedFields: {},
      fields: [],
      sowings: [],
      fieldsLoading: true,
    }
  },
  created() {
    EventBus.$on('SowingAdded', () => {
      this.load()
    });
    this.load()
  },
  methods: {
    load(){
      this.fieldsLoading = true
      this.fetchEntities([
        'fields',
        'sowings',
      ], this.afterFetch );
    },
    makeBlank() {
      this.fields.forEach(field => {
        this.checkedFields[field.id] = false
      })
    },
    fieldClick(field) {
      this.activeFieldId = field.id
      this.$emit('fieldClick', field)
      EventBus.$emit('fieldClicked', field.id );
    },
    sync() {
      this.$emit('input', Object.keys(this.checkedFields).filter(id => this.checkedFields[id]))
    },
    afterFetch(){
      this.fields = this.fromVuex('fields');
      this.sowings = this.fromVuex('sowings').filter(sowing => sowing.year == this.$root.context.year);
      this.fieldsLoading = false
      this.makeBlank()
    },
  },
  computed: {
    filteredFields() {
      let array = []
      if (this.formatFields.length > 0){
        array = this.formatFields.filter(field => {
          return (!this.quickFilter || field.name.toLowerCase().includes(this.quickFilter.toLowerCase())) && (!this.brigadeId || field.brigadeId === this.brigadeId)
        })
      }
      return array
    },
    formatFields() {
      let array = []
      if (this.fields.length > 0) {
        this.fields.forEach(field => {
          let sowedArea = 0
          this.sowings.forEach(sowing => {
            if (field.id == sowing.fieldId){
              sowedArea += sowing.area
            }
          })
          if (sowedArea < field.area){
            array.push(field)
          }
        })
      }
      return array
    },
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
