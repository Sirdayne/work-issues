<template lang="pug">
.fx-table(v-loading="loading", element-loading-text="Загрузка...", :class="{'rerender': rerender}")
  .map-xls-cols
    json2xls(v-if="xls", :model="xls", :props="xlsProps", :name="xlsName")
    filter-cols(:cols="cols", :heightSmall="true", :posTop="true")

  .fx-row.fx-grey.fx-sticky
    .fx-cell(:style="firstColStyle") Работа
    .fx-cell(v-if="cols[getIdFromLabel('№')].active") №
    .fx-cell(v-if="cols[getIdFromLabel('Дата')].active") Дата
    .fx-cell(v-if="cols[getIdFromLabel('Факт начала')].active") Факт начала
    .fx-cell(v-if="cols[getIdFromLabel('Факт завершения')].active") Факт завершения
    .fx-cell(v-if="cols[getIdFromLabel('План начала')].active") План начала
    .fx-cell(v-if="cols[getIdFromLabel('План завершения')].active") План завершения
    .fx-cell(v-if="cols[getIdFromLabel('Поле(культура)')].active") Поле(культура)
    .fx-cell(v-if="cols[getIdFromLabel('Машина')].active") Машина
    .fx-cell(v-if="cols[getIdFromLabel('Орудие')].active") Орудие
    .fx-cell(v-if="cols[getIdFromLabel('Ширина захват')].active") Ширина захват
    .fx-cell(v-if="cols[getIdFromLabel('Водитель')].active") Водитель
    .fx-cell(v-if="cols[getIdFromLabel('Средн. скорость')].active") Средн. скорость
    .fx-cell(v-if="cols[getIdFromLabel('Выработка (га)')].active") Выработка (га)
    .fx-cell(v-if="cols[getIdFromLabel('Выработка учетчика (га)')].active") Выработка учетчика (га)
    .fx-cell(v-if="cols[getIdFromLabel('Разница')].active") Разница
    .fx-cell(v-if="cols[getIdFromLabel('% отклонения')].active") % отклонения
    .fx-cell(v-if="cols[getIdFromLabel('% поля')].active") % поля
    .fx-cell Трек
  .fx-row-container(v-if="suboperationsTable.length > 0")
    .fx-row-container(v-for="suboperation in suboperationsTable")
      .fx-row
        .fx-cell.cursorpointer(:style="firstColStyle", @click="changeSpoiler(`.fx-spoiler-${suboperation.id}`)")
          .fx-plus +
          span {{suboperation.name}}
        .fx-cell(v-if="cols[getIdFromLabel('№')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Дата')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Факт начала')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Факт завершения')].active")
        .fx-cell(v-if="cols[getIdFromLabel('План начала')].active")
        .fx-cell(v-if="cols[getIdFromLabel('План завершения')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Поле(культура)')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Машина')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Орудие')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Ширина захват')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Водитель')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Средн. скорость')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Выработка (га)')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Выработка учетчика (га)')].active")
        .fx-cell(v-if="cols[getIdFromLabel('Разница')].active")
        .fx-cell(v-if="cols[getIdFromLabel('% отклонения')].active")
        .fx-cell(v-if="cols[getIdFromLabel('% поля')].active")
        .fx-cell.fx-small-btns
          el-button(v-if="suboperation.assignments.map(a => a.show).includes(true)", type="danger", size="small", @click="hideTracks(suboperation.assignments)", :disabled="disabled") Скрыть все
          el-button(v-else, type="primary", size="small", @click="showTracks(suboperation.assignments)", :disabled="disabled") Все треки
      .fx-spoiler(v-for="item in suboperation.assignments", :class="`fx-spoiler-${item.subOperationId}`")
        .fx-row
          .fx-cell(:style="firstColStyle")
            .fx-legend(:style="{ background: item.legend}")
          .fx-cell(v-if="cols[getIdFromLabel('№')].active") {{item.id}}
          .fx-cell(v-if="cols[getIdFromLabel('Дата')].active") {{item.formattedDateTime}}
          .fx-cell(v-if="cols[getIdFromLabel('Факт начала')].active") {{item.formatWorkStart}}
          .fx-cell(v-if="cols[getIdFromLabel('Факт завершения')].active") {{item.formatWorkEnd}}
          .fx-cell(v-if="cols[getIdFromLabel('План начала')].active") {{item.formatStart}}
          .fx-cell(v-if="cols[getIdFromLabel('План завершения')].active") {{item.formatEnd}}
          .fx-cell(v-if="cols[getIdFromLabel('Поле(культура)')].active") {{item.fieldAndCulture}}
          .fx-cell(v-if="cols[getIdFromLabel('Машина')].active") {{item.carDisplayString}}
          .fx-cell(v-if="cols[getIdFromLabel('Орудие')].active") {{item.instrumentName}}
          .fx-cell(v-if="cols[getIdFromLabel('Ширина захват')].active") {{item.instrumentWidth}}
          .fx-cell(v-if="cols[getIdFromLabel('Водитель')].active") {{item.employeeFullName}}
          .fx-cell(v-if="cols[getIdFromLabel('Средн. скорость')].active") {{item.avgSpeedFix}}
          .fx-cell(v-if="cols[getIdFromLabel('Выработка (га)')].active") {{item.areaFix}}
          .fx-cell(v-if="cols[getIdFromLabel('Выработка учетчика (га)')].active") {{item.processedSquareFix}}
          .fx-cell(v-if="cols[getIdFromLabel('Разница')].active") {{item.diffAreas}}
          .fx-cell(v-if="cols[getIdFromLabel('% отклонения')].active") {{item.percentAreas}}
          .fx-cell(v-if="cols[getIdFromLabel('% поля')].active") {{item.percentOverall}}
          .fx-cell.fx-small-btns
            el-button(v-if="item.show", type="danger", size="small", @click="hideTrack(item.id, item)") Скрыть
            el-button(v-else, type="primary", size="small", @click="showTrack(item.id, item)", :loading="item.loading", :disabled="disabled") Показать
            el-button(type="primary", @click="showTrackImage(item.id)" style="margin: 0") #[i.el-icon-picture]
  .fx-row-container(v-else)
    p(style="text-align:center;") Нет результатов

  el-dialog(:visible.sync="trackImageDialog", title="Просев", size="full", :modal="false")
    track-image(:image="trackImage", :assignments="trackImageAssignments")
</template>

<script>
import http from "services/http"
import ListController from "mixins/ListController"
import AssignmentsMixin from "./AssignmentsMixin"
import moment from "moment"
import TrackImage from "./TrackImage"
import json2xls from "components/json2xls"
import filterCols from "components/filterCols"
import FilterColsMixin from "components/filterCols/FilterColsMixin"

export default {
  props: {
    "date": {
      type: [String, moment],
      default: moment(),
    },
  },
  mixins: [
    ListController,
    AssignmentsMixin,
    FilterColsMixin
  ],
  components: {
    json2xls,
    filterCols,
    TrackImage
  },
  data() {
    return {
      assignments: [],
      filteredAssignments: [],
      suboperationsTable: [],
      firstColStyle: "width: 26%;",
      loading: true,
      disabled: false,
      from: moment(this.date).startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      to: moment(this.date).endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
    }
  },
  watch: {
    "date" () {
      this.getAssignments()
    }
  },
  created() {
    this.getAssignments()
  },
  methods: {
    getAssignments(){
      this.loading = true
      this.from = moment(this.date).startOf("day").format("YYYY-MM-DDTHH:mm:ss")
      this.to = moment(this.date).startOf("day").add(1, "days").format("YYYY-MM-DDTHH:mm:ss")
      http.get(`areaassignments/${this.$root.context.organization}?from=${this.from}&to=${this.to}`)
        .then((data) => {
          this.assignments = data
          this._modifyAssignments()
          this.loading = false
        })
    },
    filterAssignments() {
      this.filteredAssignments = this.assignments
      this.groupSuboperationsTable()
    },
  }
}

</script>

<style lang="stylus" scoped>
.fx-plus
  color #20a0ff
</style>

