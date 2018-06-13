<template lang="pug">
.fx-table(v-loading="loading", element-loading-text="Загрузка...")
  .fx-row.fx-grey
    .fx-cell(:style="firstColStyle") Работа
    .fx-cell №
    .fx-cell Дата
    .fx-cell Поле(культура)
    .fx-cell Машина
    .fx-cell Орудие
    .fx-cell Ширина захват
    .fx-cell Водитель
    .fx-cell Средн. скорость
    .fx-cell Выработка (га)
    .fx-cell Трек
  .fx-row-container(v-if="suboperationsTable.length > 0")
    .fx-row-container(v-for="suboperation in suboperationsTable")
      .fx-row
        .fx-cell.cursorpointer(:style="firstColStyle", @click="changeSpoiler(`.fx-spoiler-${suboperation.id}`)")
          .fx-plus +
          span {{suboperation.name}}
        .fx-cell
        .fx-cell
        .fx-cell
        .fx-cell
        .fx-cell
        .fx-cell
        .fx-cell
        .fx-cell
        .fx-cell
        .fx-cell.fx-small-btns
          el-button(type="primary", size="small", @click="showTracks(suboperation.assignments)", :disabled="disabled") Все треки
      .fx-spoiler(v-for="item in suboperation.assignments", :class="`fx-spoiler-${item.subOperationId}`")
        .fx-row
          .fx-cell(:style="firstColStyle")
          .fx-cell {{item.id}}
          .fx-cell {{item.formattedDateTime}}
          .fx-cell {{item.fieldAndCulture}}
          .fx-cell {{item.carDisplayString}}
          .fx-cell {{item.instrumentName}}
          .fx-cell {{item.instrumentWidth}}
          .fx-cell {{item.employeeFullName}}
          .fx-cell {{item.avgSpeedFix}}
          .fx-cell {{item.areaFix}}
          .fx-cell.fx-small-btns
            el-button(v-if="item.show", type="danger", size="small", @click="hideTrack(item, item.id)") Скрыть
            el-button(v-else, type="primary", size="small", @click="showTrack(item, item.id)", :loading="item.loading", :disabled="disabled") Показать
  .fx-row-container(v-else)
    p(style="text-align:center;") Нет результатов
</template>

<script>
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'

import Assignments from './Assignments'

export default {
  props: [
    "id",
  ],
  mixins: [
    RecordsLoaderV2,
    ListController,
    Assignments
  ],
  data() {
    return {
      assignments: [],
      filteredAssignments: [],
      suboperationsTable: [],
      polylines: [],
      leafletPolylines: new L.FeatureGroup(),
      firstColStyle: 'width: 26%;',
      loading: true,
      disabled: false,
    }
  },
  created() {
    this.fetchEntities([
      'assignments'
    ], this.afterFetch );
  },
  computed: {

  },
  methods: {
    afterFetch(){
      this.assignments = this.fromVuex('assignments')
      this._modifyAssignments()
      this.loading = false
    },
    filterAssignments() {
      this.filteredAssignments = this.assignments.filter(a => {
        if( a.fieldId == this.id) {
          return a
        }
      })
      this.groupSuboperationsTable()
    },
  }
}

</script>

<style lang="stylus" scoped>
.workspace
  padding 0

#svgs
  position fixed
  top 0px
  left 0px
  z-index 0

#map-container
  height calc(100% - 280px)
  width 100%
  position relative
  box-sizing border-box
  border 1px solid #323232

.panel-bottom
  height 250px
  position static

#map
  height 100%
  width 100%
  box-sizing border-box

.fx-cell-edit
  position absolute
  bottom 1px
  right 1px
  height 22px
  width 28px
  padding 2px
  cursor pointer
  border-radius 4px
  border 1px solid #dfe6ec
  box-sizing border-box

.new-polygon-title
  border-top 1px solid #323232
  padding-top 20px
  font-size 14px
  line-height 14px
  font-weight bold
  margin 0

.tab-block
  box-sizing border-box
  padding 0 20px
  width 100%
  h3
    margin 20px 0 -5px
    font-size 16px
  &-full
    padding 0
    h4
      margin 5px 0 5px
      font-size 14px
      text-align center
    h3
      margin 20px 0px -5px 20px
      font-size 16px

.fx-plus
  color #20a0ff
</style>

