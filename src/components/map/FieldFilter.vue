<template lang="pug">
.map-main-filter
  .search-block
    el-input.search-input(v-model="searchText" icon="search", placeholder="Поиск")
    el-button.search-reset(type="text", @click="nullSearch()", title="Сбросить фильтр") Сбросить
  .filter-contents(:class="{'rerender': rerender}")
    .fc-container
      .fc-row(v-for="item in filteredFields", @click="clickField(item)", :class="{'active': item.active}") {{ item.newName }}
</template>

<script>
import {EventBus} from "services/EventBus"
import ListController from "mixins/ListController"
import {deepClone} from "lib/utils"

export default {
  props: {
    "fields": {
      type: Array,
      default: [],
    }
  },
  mixins: [
    ListController,
  ],
  data() {
    return {
      titleField: "Поля ()",
      searchText: "",
      rerender: false,
      filteredFields: [],
      selectedField: null,
    }
  },
  watch: {
    "fields" (val) {
      if (val.length > 0) {
        this.initData()
      }
    },
    "searchText"() {
      this.searchFilter()
    }
  },
  created() {
    EventBus.$on("MapApplyFieldFilter", fieldId => {
      this.applyFilter(fieldId)
    })
  },
  methods: {
    initData() {
      this.deepCloneData()
      this.addTitle()
      this.nullActive()
    },
    searchFilter() {
      this.filteredFields = deepClone(this.fields).filter(x => x.newName.toLowerCase().includes(this.searchText.toLowerCase()))
    },
    deepCloneData() {
      this.filteredFields = deepClone(this.fields)
    },
    clickField(item, withEventBus = true) {
      this.nullActive()
      item.active = !item.active
      this.selectedField = item.id
      if (withEventBus) {
        EventBus.$emit("MapFieldFilterChanged", this.selectedField)
      }
    },
    nullActive() {
      this.nullActiveArray(this.filteredFields)
      this.reRender()
    },
    nullActiveArray(array) {
      array.forEach(a => {
        a.active = false
        return a
      })
    },
    nullSearch() {
      this.searchText = ""
      this.nullActive()
    },
    applyFilter(fieldId) {
      let found = this.filteredFields.find(field => field.id === fieldId)
      if (found)
        this.clickField(found, false)
      else
        this.nullActive()
      this.nullActive()
    },
    addTitle() {
      this.titleField = `Поля (${this.fields.length})`
    },
    reRender() {
      this.rerender = !this.rerender
    }
  }
}

</script>

<style lang="stylus" scoped>
.map-main-filter
  float left
  width calc(100% - 30px)
  box-sizing border-box
  margin 0 15px 25px
.search-block
  float left
  width 100%
  padding 15px 0 5px
  position sticky
  top 0
  left 0
  background #eef1f6
  z-index 10
.search-input
  float left
  width 230px
  box-sizing border-box
.search-reset
  float left
  width calc(100% - 230px)
  font-size 12px
  cursor pointer
  color #20a0ff
  box-sizing border-box
.filter-contents
  float left
  width 100%
  margin-top 10px
  .fc-container
    float left
    width 100%
    .fc-row
      float left
      width 100%
      height auto
      line-height 26px
      font-size 12px
      cursor pointer
      padding 0px 52px 0 5px
      box-sizing border-box
      position relative
      &:after
        display none
        content '\2713'
        color #08ff00
        color #20a0ff
        position absolute
        top 0px
        right 5px
      &:hover
        background #858585
      &.active
        background #525252
        &:after
          display block
</style>

