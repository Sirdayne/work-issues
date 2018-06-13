<template lang="pug">
div
  .fx-cont-xls
    json2xls(v-if='xls', :model="xls", :props="xlsProps", :name="xlsName")
    filter-cols(:cols="cols", :heightSmall="true", :posTop="true")
  el-dialog(:visible.sync="dialogVisible", title="Просев", size="large", :modal="false")
    template(v-if="img")
      .image-content
        .image-viewer
          div(class="images", v-viewer="options")
            img(v-for="src in [img]", :src="src", :key="src")
        .image-data
          el-table(:data="trackImageAssignments", show-summary, sum-text="Итого")
            el-table-column(prop="assignmentId", label="#", width="90")
            el-table-column(label="Цвет", width="50")
              template(slot-scope="scope")
                div(:style="{backgroundColor: scope.row.color, height: '5px'}")
            el-table-column(prop="startDate", label="Старт", width="90")
            el-table-column(prop="endDate", label="Завершение", width="90")
            el-table-column(prop="processedSquare", label="Площадь", width="90")
            el-table-column(prop="percentage", label="%", width="90")
            el-table-column(prop="employeeName", label="Водитель")
            el-table-column(prop="carName", label="Машина")
            el-table-column(prop="instrumentName", label="Орудие")
    template(v-else-if="img === ''") Нет данных
    template(v-else="img")
      .content(v-if="refresh")
        el-button.center(type="info", size="small", @click="recallShowImg()") Повторить
      .content(v-else, v-loading="true")
  el-table(
    :data="filteredAssignmentsGroupedByWorkTable",
    border,
    resizable,
    :max-height="maxHeight",
    :row-class-name="tableRowClassName",
  ).table-content
    el-table-column(label="Работа")
      template(slot-scope="scope")
        template(v-if="scope.row.group")
          el-button.plus-minus-btn(v-show="scope.row.expanded", type="text", @click="rebuildTable(scope.row)") -
          el-button.plus-minus-btn(v-show="!scope.row.expanded", type="text", @click="rebuildTable(scope.row)") +
          span {{scope.row.subOperationName}}
        template(v-else)
          .color-legend(:style="{ background: scope.row.colorTrack}")

    el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :width="col.width", :key="col.prop", header-align="center")

    el-table-column(label="Трек", header-align="center", align="center", width="100")
      template(slot-scope="scope")
        template(v-if="!scope.row.group")
          template(v-if="scope.row.status !== 1 && $root.ENV.IS_PROD")
            el-button(type="warning", size="small") {{scope.row.processedstatus}}
          template(v-else-if="scope.row.distance === 0 || hasNoCoordinates.includes(scope.row.id)")
            el-button(type="warning", size="small") Нет данных
          template(v-else-if="selectedAssignments.includes(scope.row.id)")
            el-button-group
              el-button(type="danger", size="small", @click="updateSelectedAssignments(scope.row)") Скрыть
              el-button(type="primary", size="small", @click="showImg(scope.row.id)") #[i.el-icon-picture]
          template(v-else-if="!selectedAssignments.includes(scope.row.id)")
            el-button(type="primary", size="small", @click="selectAssignment(scope.row)") Показать
        template(v-else)
          el-button(type="primary", size="small", @click="showAllTracks(scope.row.ids, scope.row)", :loading="scope.row.loading", :disabled="!scope.row.loading && disabled") Все треки
</template>

<script>
import Vue from 'vue'
import {EventBus} from 'services/EventBus';
import http from 'lib/httpQueryV2';
import nprogress from 'lib/NProgress';
import Viewer from 'v-viewer'
import json2xls from 'components/json2xls'
import moment from 'moment';
import filterCols from "components/filterCols"

Vue.use(Viewer)

export default {
  props: ['filteredAssignments', 'type'],
  components: {
    json2xls,
    filterCols
  },
  data() {
    return {
      cols: [
        {
          prop: "id",
          label: "№",
          width: 50,
          active: true
        },
        {
          prop: "formattedDateTime",
          label: "Дата",
          width: 70,
          active: true
        },
        {
          prop: "formatWorkStart",
          label: "Факт начала",
          active: false
        },
        {
          prop: "formatWorkEnd",
          label: "Факт завершения",
          active: false
        },
        {
          prop: "formatStart",
          label: "План начала",
          active: false
        },
        {
          prop: "formatEnd",
          label: "План завершения",
          active: false
        },
        {
          prop: "fieldAndCulture",
          label: "Поле (культура)",
          active: true
        },
        {
          prop: "carDisplayString",
          label: "Машина",
          active: true
        },
        {
          prop: "instrumentName",
          label: "Орудие",
          active: true
        },
        {
          prop: "instrumentWidth",
          label: "Ширина захват",
          width: "60",
          active: true
        },
        {
          prop: "employeeFullName",
          label: "Водитель",
          active: true
        },
        {
          prop: "avgSpeedFix",
          label: "Средн. скорость",
          width: "60",
          active: true
        },
        {
          prop: "area",
          label: "Выработка (га)",
          width: "70",
          active: true
        },
        {
          prop: "percentOverall",
          label: "% поля",
          width: "50",
          active: true
        },
      ],
      hasNoCoordinates: [],
      dialogVisible: false,
      img: null,
      options: {
        "inline": true,
        "button": true,
        "navbar": false,
        "title": true,
        "toolbar": true,
        "tooltip": false,
        "movable": true,
        "zoomable": true,
        "rotatable": true,
        "scalable": true,
        "transition": true,
        "fullscreen": true,
        "keyboard": true,
        "url": "data-source"
      },
      window: window,
      refresh: false,
      loading: {},
      filteredAssignmentsGroupedByWork: [],
      filteredAssignmentsGroupedByWorkTable: [],
      maxHeight: 248,
      xlsProps: {},
      xlsName: "Задания",
      xls: false,
      selectedDate: this.$store.getters.getSelectedDate,
      trackImageAssignments: [],
      legends: [],
      disabled: false,
    }
  },
  computed: {
    selectedAssignments() {
      return this.$store.getters.getSelectedAssignments;
    },
    assignments() {
      let assignments = this.filteredAssignments
      assignments = this.filteredAssignments.filter(fa => moment(fa.dateTimeRangeStart).year() == moment(this.selectedDate).year())
      if (this.type == 'car'){
        assignments = this.filteredAssignments.filter(fa => moment(fa.dateTimeRangeStart).format('L') == moment(this.selectedDate).format('L'))
      }
      return assignments
    },
    works() {
      return this.assignments.map(a => a.subOperationName)
        .filter((w, i, arr) => {
          return arr.indexOf(w) === i
        })
    },
  },
  watch: {
    'assignments' (val, oldVal) {
      this.init(val)
    },
  },
  created() {
    EventBus.$on('MapController.SelectedAssignmentLoadingEmptyResultReturned', (id) => {
      this.hasNoCoordinates.push(id);
    });
    EventBus.$on('MapController.SelectedDateChanged', (selectedDate) => {
      this.selectedDate = selectedDate;
    });
    EventBus.$on('MapController.addLegendToSelectedAssignments', (legends) => {
      this.legends = legends
      this.addLegendToTable(legends)
    });
    this.maxHeight = window.innerHeight > 700 ? 314 : 248
    this.init(this.assignments)
  },
  methods: {
    tableRowClassName(row, index) {
      if (row.id && row.id == this.$route.params.id) {
        return 'selected-row';
      }
      return '';
    },
    addLegendToTable(){
      this.filteredAssignmentsGroupedByWork.forEach(f => f.colorTrack = "rgba(0,0,0,0)")
      this.legends.forEach(legend => {
        let finded = this.filteredAssignmentsGroupedByWork.find(f => f.id == legend.id)
        if (finded){
          finded.colorTrack = legend.color
        }
      })
    },
    showAllTracks(ids, row){
      let endpoint = `leafletTracks/`
      nprogress.start()
      this.disabled = true
      row.loading = true
      this.rebuildTable(row)
      http.post(endpoint, ids)
        .then(data => {
          if (data) {
            nprogress.done()
            row.loading = false
            this.disabled = false
            this.selectAllTracks(data)
          }
        })
        .catch((error) => {
          nprogress.done()
          row.loading = false
          this.disabled = false
          this.$message({
            message: `Ошибка ${error}`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        })
    },
    init(val) {
      this.buildTableGroupedByWork()
      if (val && val.length && this.$route.params.id !== undefined) {
        let id = this.$route.params.id;
        let assignment = val.find(a => a.id == id);
        let row = {
          subOperationName: assignment.subOperationName,
          expanded: true,
        };
        this.rebuildTable(row)
        this.selectAssignment(assignment)
      }
    },
    buildTableGroupedByWork() {
      let filteredAssignmentsGroupedByWork = []
      this.works.forEach(w => {
        let groupedByWork = []
        let totalArea = 0
        let ids = []
        let totalPercentOverall = 0
        this.assignments.forEach(a => {
          if (a.subOperationName == w) {
            let assignment = Object.assign({}, a)
            totalArea += assignment.area
            ids.push(assignment.id)
            totalPercentOverall += assignment.percentOverall
            assignment.fieldAndCulture = assignment.fieldNewName
            if (assignment.cultureName) {
              assignment.fieldAndCulture += " (" + assignment.cultureName + ")"
            }
            assignment.colorTrack = "rgba(0,0,0,0)"
            groupedByWork.push(assignment)
          }
        })
        let assignment = this.assignments.find(a => a.subOperationName == w)
        if (this.type == 'field'){
          filteredAssignmentsGroupedByWork.push({
            group: true,
            expanded: false,
            subOperationName: w,
            area: totalArea,
            percentOverall: totalPercentOverall.toFixed(2),
            ids: ids
          })
        } else {
          filteredAssignmentsGroupedByWork.push({
            group: true,
            expanded: false,
            subOperationName: w,
            area: totalArea,
            ids: ids
          })
        }
        filteredAssignmentsGroupedByWork.push(...groupedByWork)
      })
      this.filteredAssignmentsGroupedByWork = filteredAssignmentsGroupedByWork
      this.filteredAssignmentsGroupedByWorkTable = this.filteredAssignmentsGroupedByWork.filter(a => {
        return a.group
      })
      this.filteredAssignmentsGroupedByWork.forEach(x => {
        if (x.avgSpeed){
          x.avgSpeedFix = x.avgSpeed.toFixed(2)
        } else if(x.avgSpeed === 0) {
          x.avgSpeedFix = 0
        } else {
          x.avgSpeedFix = null
        }
        if (x.group) {
          x.loading = false
        }
      })
      this.prepareXls(this.filteredAssignmentsGroupedByWork)
    },
    rebuildTable(row) {
      this.filteredAssignmentsGroupedByWork.filter(a => a.group).forEach(group => {
        if (group.subOperationName == row.subOperationName) {
          group.expanded = !group.expanded
        } else {
          group.expanded = false
        }
      })
      this.filteredAssignmentsGroupedByWorkTable = this.filteredAssignmentsGroupedByWork.filter(a => {
        let cond = a.subOperationName == row.subOperationName && row.expanded
        return a.group || cond
      })
      this.addLegendToTable()
    },
    selectAllTracks(data){
      if (data.length > 0){
        data.forEach(d => {
          let assignment = this.filteredAssignments.find(fa => fa.id == d.assignmentId)
          this.selectTrack(assignment, d)
        })
      } else {
        this.$message({
          message: `Нет данных`,
          type: "info",
          duration: 5000,
          showClose: false,
        });
      }
    },
    selectTrack(assignment, data) {
      this.$store.dispatch('actionHandleSuccessfulFetch', {
        data: data,
        assignment: assignment
      });
    },
    selectAssignment(assignment) {
      //this.checkDate(assignment)
      let id = assignment.id
      if (this.loading[id]) return false
      this.loading[id] = true
      nprogress.start()
      this.$store.dispatch('actionGetTrackForAssignment', {orgId: this.$root.context.organization, id: id})
        .then((data) => {
          nprogress.done()
          this.loading[id] = false
          this.$store.dispatch('actionHandleSuccessfulFetch', {
            data: data,
            assignment: assignment
          });
        })
        .catch((error) => {
          nprogress.done()
          this.loading[id] = false
          this.$message({
            message: "Повторите запрос",
            type: "info",
            duration: 5000,
            showClose: false,
          });
        })
    },
    checkDate(assignment) {
      let formattedDateTime = assignment.formattedDateTime
      let uncheck = this.selectedAssignments.some(id => {
        let a = this.assignments.find(f => f.id == id)
        return a.formattedDateTime !== formattedDateTime
      })
      if (uncheck) {
        this.selectedAssignments.slice().forEach(id => {
          let a = this.assignments.find(f => f.id == id)
          let fieldId = a.fieldId
          this.$store.dispatch('actionUnselectAssignment', id);
          this.$store.dispatch('actionUnselectField', fieldId);
        })
      }
    },
    updateSelectedAssignments(assignment) {
      let id = assignment.id
      let fieldId = assignment.fieldId
      for (let i in this.selectedAssignments) {
        let a = this.selectedAssignments[i];
        if (a === id) {
          this.$store.dispatch('actionUnselectAssignment', id);
          this.$store.dispatch('actionUnselectField', fieldId);
        }
      }
      if (this.selectedAssignments.length == 0){
        this.disabledBtns = false
      }
    },
    showImg(id) {
      nprogress.start()
      this.dialogVisible = true
      this.img = null
      this.refresh = false
      this.recallShowImg = () => this.showImg(id)
      http.get(`trackImage/${this.$root.context.organization}/${id}`)
        .then(data => {
          nprogress.done()
          if (data) {
            this.img = 'data:image/jpg;base64,' + data.image
            this.trackImageAssignments = data.assignments.reverse().map(a => {
              a.startDate = moment(a.start, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm");
              a.endDate = moment(a.end, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm");
              return a
            })
          } else {
            this.img = ""
            this.trackImageAssignments = []
          }
        })
        .catch((error) => {
          nprogress.done()
          this.refresh = true
          this.$message({
            message: "Повторите запрос",
            type: "info",
            duration: 5000,
            showClose: false,
          });
        })
    },
    prepareXls(body) {
      body = body.filter(x => x.fieldAndCulture)
      this.xlsProps = {
        subOperationName: 'Работа',
        id: "№",
        formattedDateTime: "Дата",
        fieldAndCulture: "Поле(культура)",
        carDisplayString: "Машина",
        instrumentName: "Орудие",
        instrumentWidth: "Ширина захвата",
        employeeFullName: "Водитель",
        avgSpeed: "Средняя скорость",
        area: "Выработка, га",
        percentOverall: "% Поля",
      }
      this.xls = body
    },
  }
}
</script>

<style lang="stylus" scoped>
.image-content
  display grid
  grid-template 1fr / auto 1fr
.image-viewer
  height 400px
  width 300px
  position relative
.image-data
  height 400px
  width inherit
  margin-left 10px
  overflow-y auto
  overflow-x auto
.images img
  height 400px
  width 300px
.content
  height 150px
  width inherit
  position relative
.center
  position absolute
  left calc(50% - 39.29px)
  top calc(50% - 14px)
  z-index 1000
.plus-minus-btn
  width 22px
  font-size 18px
  padding 0
  margin 0
.table-content
  height inherit
  width inherit
  position relative
</style>
