<template lang="pug">
div
  viewer(
    :options="options",
    :images="[img]",
    @inited="inited",
    class="viewer",
    ref="viewer",
    v-show="false",
  )
    template(slot-scope="scope")
      img(v-for="src in scope.images", :src="src", :key="src")
  el-dialog(
    :visible.sync="dialogVisible",
    :before-close="handleClose",
    title="Просев",
    size="tiny",
  )
    template(v-if="img")
      .content
        el-button.center(type="info", size="small", @click="show()") #[i.el-icon-picture] Показать
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
  ).table-content
    el-table-column(label="Работа", width="250")
      template(slot-scope="scope")
        template(v-if="scope.row.group")
          el-button.plus-minus-btn(v-show="scope.row.expanded", type="text", @click="rebuildTable(scope.row)") -
          el-button.plus-minus-btn(v-show="!scope.row.expanded", type="text", @click="rebuildTable(scope.row)") +
          span {{scope.row.subOperationName}}
    el-table-column(prop="id", label="№", width="90")
    el-table-column(prop="formattedDateTime", label="Дата", width="110")
    el-table-column(prop="fieldAndCulture", label="Поле(культура)")
    el-table-column(prop="carDisplayString", label="Машина")
    el-table-column(prop="employeeFullName", label="Водитель")
    el-table-column(prop="area", label="Выработка, га")
    el-table-column(prop="percentOverall", label="% Поля", width="90")
    el-table-column(fixed="right", label="Трек", header-align="center", align="center", width="160")
      template(slot-scope="scope")
        template(v-if="!scope.row.group")
          template(v-if="scope.row.status !== 1 && $root.nodeEnv.prod")
            el-button(type="warning", size="small") {{scope.row.processedstatus}}
          template(v-else-if="scope.row.distance === 0 || hasNoCoordinates.includes(scope.row.id)")
            el-button(type="warning", size="small") Нет данных
          template(v-else-if="selectedAssignments.includes(scope.row.id)")
            el-button-group
              el-button(type="danger", size="small", @click="updateSelectedAssignments(scope.row)") Скрыть
              el-button(type="primary", size="small", @click="showImg(scope.row.id)") #[i.el-icon-picture]
          template(v-else-if="!selectedAssignments.includes(scope.row.id)")
            el-button(type="primary", size="small", @click="selectAssignment(scope.row)") Показать
</template>

<script>
import {EventBus} from 'services/EventBus';
import http from 'lib/httpQueryV2';
import nprogress from 'lib/NProgress';
import Viewer from "v-viewer/src/component.vue"

export default {
  props: ['filteredAssignments'],
  components: {
    Viewer,
  },
  data() {
    return {
      hasNoCoordinates: [],
      dialogVisible: false,
      img: null,
      options: {
        "inline": false,
        "button": true,
        "navbar": false,
        "title": true,
        "toobar": false,
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
    }
  },
  computed: {
    selectedAssignments() {
      return this.$store.getters.getSelectedAssignments;
    },
    works() {
      return this.filteredAssignments.map(a => a.subOperationName)
        .filter((w, i, arr) => {
          return arr.indexOf(w) === i
        })
    },
  },
  watch: {
    'filteredAssignments' (val, oldVal) {
      this.init(val)
    },
  },
  created() {
    EventBus.$on('MapController.SelectedAssignmentLoadingEmptyResultReturned', (id) => {
      this.hasNoCoordinates.push(id);
    });
    this.maxHeight = window.innerHeight > 700 ? 314 : 248
    this.init(this.filteredAssignments)
  },
  methods: {
    init(val) {
      this.buildTableGroupedByWork()
      if (val && val.length && this.$route.params.id !== undefined) {
        let id = this.$route.params.id;
        let assignment = val.find(a => a.id == id);
        let row = {subOperationName: assignment.subOperationName, expanded: true};
        this.rebuildTable(row)
        this.selectAssignment(assignment)
      }
    },
    buildTableGroupedByWork() {
      let filteredAssignmentsGroupedByWork = []
      this.works.forEach(w => {
        let groupedByWork = []
        this.filteredAssignments.forEach(a => {
          if (a.subOperationName == w) {
            let assignment = Object.assign({}, a)
            assignment.fieldAndCulture = assignment.fieldNewName
            if (assignment.cultureName) {
              assignment.fieldAndCulture += "(" + assignment.cultureName + ")"
            }
            groupedByWork.push(assignment)
          }
        })
        filteredAssignmentsGroupedByWork.push({group: true, expanded: false, subOperationName: w})
        filteredAssignmentsGroupedByWork.push(...groupedByWork)
      })
      this.filteredAssignmentsGroupedByWork = filteredAssignmentsGroupedByWork
      this.filteredAssignmentsGroupedByWorkTable = this.filteredAssignmentsGroupedByWork.filter(a => {
        return a.group
      })
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
    },
    selectAssignment(assignment) {
      this.checkDate(assignment)
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
        let a = this.filteredAssignments.find(f => f.id == id)
        return a.formattedDateTime !== formattedDateTime
      })
      if (uncheck) {
        this.selectedAssignments.forEach(id => {
          let a = this.filteredAssignments.find(f => f.id == id)
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
    },
    showImg(id) {
      nprogress.start()
      this.dialogVisible = true
      this.img = null
      this.refresh = false
      this.recallShowImg = () => this.showImg(id)
      http.get('trackImage/' + id)
        .then(data => {
          nprogress.done()
          if (data) {
            this.img = 'data:image/jpg;base64,' + data
          } else {
            this.img = ""
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
    handleClose(done) {
      done();
    },
    inited(viewer) {
      this.$viewer = viewer
    },
    show() {
      this.$viewer.show()
    }
  }
}
</script>

<style lang="stylus" scoped>
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
