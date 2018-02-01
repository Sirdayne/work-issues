<template lang="pug">
.daily-page(v-loading="loading", element-loading-text="Загружается...")
  update
  el-form(
    :inline="true",
    ref="form",
    :label-position="'top'"
  )
    el-form-item(label="Дата")
      el-date-picker(v-model="selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="." :class="{invisibleColor: true}")
      el-button.excel(type='default', @click="exportTable()") .

    el-form-item(label=".")
      el-button.filter(
        @click="filterUnfolded = true",
        type="default"
      ) .
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
        el-button(@click="resetFilter") Сбросить

  h2(class="tableHeading") Ежедневный отчет по полевым работам

  el-table(
    v-if="tableData.length",
    :data="paginate(tableData)",
    border,
    resizable,
    )
    el-table-column(
      prop="fieldNewName",
      label="Поле",
      header-align="center",
      width="110"
    )
    el-table-column(
      prop="cultureName",
      label="Культура",
      header-align="center",
      width="180"
    )
    el-table-column(
      prop="subOperationName",
      label="Вид работ",
      header-align="center",
      width="110"
    )
    el-table-column(
      prop="employeeFullName",
      label="ФИО",
      header-align="center",
      width="170"
    )
    el-table-column(
      prop="carDisplayString",
      label="Марка техники",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="instrumentName",
      label="Марка агрегата",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="instrumentWidth",
      label="Ширина захвата",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="formatDateTimeRangeStart",
      label="Начало",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="formatDateTimeRangeEnd",
      label="Конец",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="area",
      label="Выработка, га",
      header-align="center",
      width="120"
    )
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
      prop="distanceInField",
      label="Пробег по полю, км",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="avgSpeed",
      label="Средняя скорость по полю, км/ч",
      header-align="center",
      width="120"
    )
    el-table-column(
      label="Операции",
      fixed="right",
      header-align="center",
      align="center",
      width="120"
    )
      template(slot-scope="scope")
        el-button(@click="update(scope.row.id)" size="small" icon="edit")

  .no-results(v-else) Нет результатов
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
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus';
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
  import ListController from 'mixins/ListController'

  import update from './update.vue';

  import moment from 'moment'

  export default {
    components: {
      update
    },
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        selectedDate: new Date(new Date().setFullYear(this.$root.context.year)),
        perPage: 5,
        currentPage: 1,
        assignmentsdailyreportitems: [],
        loading: true,
        fields: [],
        employees: [],
        cultures: [],
        suboperations: [],
      }
    },
    computed: {
      totalItems() {
        return this.tableData.length;
      },
      tableData() {
        let selectDate = this.selectedDate || Date.now()
        selectDate = moment(selectDate).format('L');
        //if (this.assignmentsdailyreportitems.length) this.loading = false
        let tableData = this.assignmentsdailyreportitems.filter(record => {
          let ourDate = new Date(record.dateTimeRangeStart)
          ourDate = moment(ourDate).format('L');
          let isDate = (ourDate == selectDate)
          let isField = this.filterModel.field ? this.filterModel.field === record.fieldNewName : true
          let isEmployee = this.filterModel.employee ? this.filterModel.employee === record.employeeFullName : true
          let isSuboperation = this.filterModel.suboperation ? this.filterModel.suboperation === record.subOperationName : true
          let isCulture = this.filterModel.culture ? this.filterModel.culture === record.cultureName : true


          return isDate && isField && isEmployee && isSuboperation && isCulture
        })
        //if (this.assignmentsdailyreportitems.length) this.loading = false
        return tableData
      },
    },
    created() {
      EventBus.$on('AssignmentsDailyReportItems.UpdateComponent.PutObjectCompleted', () => {
        this.refresh()
      });
      EventBus.$on('AppYearChanged', (year) => {
        this.selectedDate = new Date(new Date(this.selectedDate).setFullYear(year));
      });
      this.fetchEntities([
        'assignmentsdailyreportitems',
        'fields',
        'cultures',
        'employees',
        'suboperations'
      ], this.afterFetch );
    },
    methods: {
      afterFetch() {
        this.assignmentsdailyreportitems = this.fromVuex('assignmentsdailyreportitems').map(x => {
          x.formatDateTimeRangeStart = x.dateTimeRangeStart ? moment(x.dateTimeRangeStart).format('DD.MM.YYYY, HH:mm:ss') : null
          x.formatDateTimeRangeEnd = x.dateTimeRangeEnd ? moment(x.dateTimeRangeEnd).format('DD.MM.YYYY, HH:mm:ss') : null
          return x
        })
        this.fields = this.fromVuex('fields')
        this.cultures = this.fromVuex('cultures')
        this.employees = this.fromVuex('employees')
        this.suboperations = this.fromVuex('suboperations')
        this.loading = false
      },
      violationClass(cond) {
        if (cond)
          return 'violated';
        else
          return '';
      },
      update(id) {
        EventBus.$emit('AssignmentsDailyReportItems.InitUpdate', id);
      },
      load() {
        this.fetchEntities([
          'assignmentsdailyreportitems',
        ]);
        this.loading = false
      },
      refresh() {
        this.loading = true
        this.load();
      },
      exportTable() {
        let endpoint        = "AssignmentsDailyReport";
        let filename        = "Ежедневный отчет по полевым работам";

        let body = {
          Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
          OrganizationId: this.$root.context.organization,
        };

        http.downloadXLS(endpoint, body, filename);
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
