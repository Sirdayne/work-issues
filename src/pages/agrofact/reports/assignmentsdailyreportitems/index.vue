<template lang="pug">
.daily-page(v-loading="loading", element-loading-text="Загружается...")
  div
    el-dialog(:visible.sync="dialogVisibleUpdate", title="Редактирование", size="tiny")
      update(:form="form")
    .fx-form
      .fx-item
        .fx-label(style="width: 250px") Дата:
        el-date-picker(v-model="selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
      .fx-item
        el-button.excel(v-loading="loadingExcel", :loading="loadingExcel", type="default", @click="exportTable()") .
      .fx-item
        el-button.filter(
          @click="filterUnfolded = true",
          type="default"
        ) .
      .fx-item
        filter-cols(:cols="cols")

    el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
      el-form(:model="filterModel", label-width="70px", label-position="left")
        el-form-item(label="Поле")
          el-select(v-model="filterModel.field", clearable, filterable)
            el-option(
            v-for="item in fields",
            :label="item.newName",
            :value="item.newName",
            :key="item.id",
            )
        el-form-item(label="Культура")
          el-select(v-model="filterModel.culture", clearable, filterable)
            el-option(
            v-for="item in cultures",
            :label="item.name",
            :value="item.name",
            :key="item.id",
            )
        el-form-item(label="Вид работ")
          el-select(v-model="filterModel.suboperation", clearable, filterable)
            el-option(
            v-for="item in suboperations",
            :label="item.name",
            :value="item.name",
            :key="item.id",
            )
        el-form-item(label="Водитель")
          el-select(v-model="filterModel.employee", clearable, filterable)
            el-option(
            v-for="item in employees",
            :label="item.fullName",
            :value="item.fullName",
            :key="item.id",
            )
        el-form-item
          el-button(type="primary", @click="applyFilter") Применить
          el-button(@click="nullFilter") Сбросить

    h2(class="tableHeading") Ежедневный отчет по полевым работам

    el-table(
      v-loading="loadingDaily",
      element-loading-text="Загружается...",
      :data="paginate(filtereddailyreport)",
      border,
      resizable,
      )

      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")

      el-table-column(
        label="Выработка по данным учетчика, га",
        header-align="center",
        width="120",
      )
        template(slot-scope="scope")
          div(v-if="scope.row.isViolated" class="violated")
            .violated-num {{ scope.row.areaByCounter }}
          div(v-else) {{ scope.row.areaByCounter }}

      el-table-column(
        label="Операции",
        header-align="center",
        align="center",
        width="120"
      )
        template(slot-scope="scope")
          el-button(@click="update(scope.row.id)" size="small" icon="edit")

    el-row(type="flex")
      el-col(:span="0")
        el-pagination(
          layout="total, prev, pager, next",
          :total="totalItems",
          :page-size="perPage",
          :current-page="currentPage",
          @current-change="onCurrentPageChange",
          @size-change="onPerPageChange",
        )
</template>

<script>
import http from "services/http"
import {EventBus} from "services/EventBus"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import {Message} from "element-ui"
import update from "./update.vue"
import moment from "moment"
import filterCols from "components/filterCols"
import {deepClone} from "lib/utils";

export default {
  components: {
    update,
    filterCols
  },
  mixins: [
    
    ListController
  ],
  data() {
    return {
      selectedDate: new Date(new Date().setFullYear(this.$root.context.year)),
      perPage: 5,
      currentPage: 1,
      assignmentsdailyreportitems: [],
      filtereddailyreport: [],
      loadingDaily: false,
      loading: false,
      loadingExcel: false,
      fields: [],
      employees: [],
      cultures: [],
      suboperations: [],
      dialogVisibleUpdate: false,
      form: {},
      cols: [
        {
          prop: "id",
          label: "№",
          active: true,
        },
        {
          prop: "fieldNewName",
          label: "Поле",
          active: true
        },
        {
          prop: "cultureName",
          label: "Культура",
          active: true
        },
        {
          prop: "lastYearCultureName",
          label: "Предшественник",
          active: false
        },
        {
          prop: "subOperationName",
          label: "Вид работ",
          active: true
        },
        {
          prop: "employeeFullName",
          label: "ФИО",
          active: false
        },
        {
          prop: "chemicalPreparations",
          label: "Хим. препарат",
          active: false
        },
        {
          prop: "carDisplayString",
          label: "Марка техники",
          active: true
        },
        {
          prop: "instrumentName",
          label: "Марка агрегата",
          active: true
        },
        {
          prop: "instrumentWidth",
          label: "Ширина захвата",
          active: true
        },
        {
          prop: "dateTimeRangeStart",
          label: "Фактическое начало",
          active: true
        },
        {

          prop: "dateTimeRangeEnd",
          label: "Фактическое завершение",
          active: true
        },
        {
          prop: "area",
          label: "Выработка, га",
          active: true
        },
        {
          prop: "processedSquare",
          label: "Выработка по данным GPS, га",
          active: true
        },
        {
          prop: "distanceInField",
          label: "Пробег по полю, км",
          active: false
        },
        {
          prop: "avgSpeed",
          label: "Средняя скорость по полю, км/ч",
          active: false
        },
        {
          prop: "status",
          label: "Статус",
          active: true
        }
      ],
    }
  },
  watch: {
    "selectedDate"(val, oldVal) {
      this.getAssignmentsDailyReportItems();
    },
  },
  computed: {
    totalItems() {
      return this.filtereddailyreport.length;
    },
  },
  created() {
    EventBus.$on("AssignmentsDailyReportItemsChanged", () => {
      this.refresh()
    });
    EventBus.$on("AppYearChanged", (year) => {
      this.selectedDate = new Date(new Date(this.selectedDate).setFullYear(year));
    });
    fetchEntities([
      "fields",
      "cultures",
      "employees",
      "suboperations"
    ], this.afterFetch );
    this.getAssignmentsDailyReportItems()
  },
  methods: {
    applyFilter(){
      this.filtereddailyreport = this.assignmentsdailyreportitems.filter(record => {
        let isField = this.filterModel.field ? this.filterModel.field === record.fieldNewName : true
        let isEmployee = this.filterModel.employee ? this.filterModel.employee === record.employeeFullName : true
        let isSuboperation = this.filterModel.suboperation ? this.filterModel.suboperation === record.subOperationName : true
        let isCulture = this.filterModel.culture ? this.filterModel.culture === record.cultureName : true
        return isField && isEmployee && isSuboperation && isCulture
      })
      this.filterUnfolded = false
    },
    nullFilter(){
      for (let key in this.filterModel){
        this.filterModel[key] = null
      }
      this.filtereddailyreport = deepClone(this.assignmentsdailyreportitems)
      this.filterUnfolded = false
    },
    getAssignmentsDailyReportItems(){
      this.assignmentsdailyreportitems = []
      let endpoint = `AssignmentsDailyReportItemsDate/`
      let date = moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss")
      let organization = this.$root.context.organization
      let data = {
        organizationId: organization,
        date: date
      }
      this.loadingDaily = true
      http.post(endpoint, data)
        .then(data => {
          this.assignmentsdailyreportitems = data
          this.filtereddailyreport = deepClone(this.assignmentsdailyreportitems)
          this.loadingDaily = false
        })
        .catch(error => {
          Message({
            message: `Ошибка: ${error}`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
          this.loadingDaily = false
        })
    },
    afterFetch() {
      this.fields = fromVuex("fields")
      this.cultures = fromVuex("cultures")
      this.employees = fromVuex("employees")
      this.suboperations = fromVuex("suboperations")
      this.loading = false
    },
    violationClass(cond) {
      if (cond)
        return "violated";
      else
        return "";
    },
    update(id) {
      this.form = this.assignmentsdailyreportitems.find(a => a.id == id)
      this.dialogVisibleUpdate = true
    },
    refresh() {
      this.dialogVisibleUpdate = false
      this.loadingDaily = true
      this.getAssignmentsDailyReportItems()
    },
    exportTable() {
      let endpoint = "AssignmentsDailyReport";
      let filename = "Ежедневный отчет по полевым работам";

      let body = {
        Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
        OrganizationId: this.$root.context.organization,
      };

      this.loadingExcel = true
      http.downloadXLS(endpoint, body, filename).then(() => {
        this.loadingExcel = false
      });
    },
  }
}

</script>

<style scoped>
  .tableHeading {
    display: inline-block;
    margin-right: 20px;
  }

  .downloadLzkStyle {
    display: block;
    margin-top: 20px;
  }

  .downloadFieldSelect {
    width: 250px;
  }

  .daily-page td{
    position: relative;
  }

  .violated{
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: rgba(255,0,0,0.8);

    display: flex;
    align-items: center;
  }
  .violated-num{
    padding: 0 18px;
    color: #fff;
  }

</style>
