<template lang="pug">
div
  el-dialog(title="Детали", :visible.sync="dialogTableVisible")
    el-select(v-model="selectedCarType" placeholder="Выбрать")
      el-option(
        v-for="ct in selectedCarTypes"
        :key="ct.value"
        :label="ct.label"
        :value="ct.value"
        )
    el-table(:data="details")
      el-table-column(
        prop="0.car",
        label="Машина",
        header-align="center",
        align="left",
        width="300",
      )
      el-table-column(
        prop="0.field",
        label="Поле",
        header-align="center",
        align="left",
        width="170",
      )
      el-table-column(
        prop="0.work",
        label="Работа",
        header-align="center",
        align="left",
        width="170",
      )
  el-form(
    :model="item",
    :inline="true",
    ref="form",
    :label-position="'top'"
  )
    el-form-item(label="Дата:")
      el-date-picker(v-model="item.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="." :class="{invisibleColor: true}")
      el-button.excel(type='default', @click="exportTable('form')") .
  h2(class="tableHeading") Статус техники
  el-table(
    v-if="totalItems || loading",
    :data="tableData",
    border,
    resizable,
    v-loading="loading",
    element-loading-text="Загружается...",
    height="1",
  ).content
    el-table-column(
      prop="rowHeader",
      label="",
      header-align="center",
      align="left",
    )
    el-table-column(
      prop="tractor",
      label="Тракторы",
      header-align="center",
      align="right",
    )
    el-table-column(
      prop="combine",
      label="Комбайны",
      header-align="center",
      align="right",
    )
    el-table-column(
      prop="sprayer",
      label="Опрыскиватели",
      header-align="center",
      align="right",
    )
    el-table-column(
      prop="truck",
      label="Камазы",
      header-align="center",
      align="right",
    )
    el-table-column(
      fixed="right",
      label="Детали",
      width="110",
      align="center"
    ): template(slot-scope="scope")
      el-button(@click="showInfo(scope.row.id)", size="small", icon="view", v-if="scope.row.id !== undefined")
  .no-results(v-else) Нет результатов
</template>
<script>
  import http from 'lib/httpQueryV2'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import moment from 'moment'
  import { EventBus } from 'services/EventBus'

  export default {
    mixins: [
      RecordsLoaderV2,
    ],
    data() {
      return {
        item: {
          selectedDate: {
            from: new Date(new Date().setFullYear(this.$root.context.year)),
          }
        },
        dialogTableVisible: false,
        selectedCarStatusId: 0,
        selectedCarType: "tractor",
        selectedCarTypes: [
          {
            value: "tractor",
            label: "Тракторы"
          },
          {
            value: "combine",
            label: "Комбайны"
          },
          {
            value: "sprayer",
            label: "Опрыскиватели"
          },
          {
            value: "truck",
            label: "Камазы"
          },
        ],
        loading: true,
      }
    },
    computed: {
      carstatus() {
        return this.carstatusextended.nextRows && this.carstatusextended.nextRows
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      },
      carstatusextended() {
        return this.fromVuex('carstatusextended')
      },
      totalItems: function() {
        return this.tableData && this.tableData.length
      },
      tableData: function() {
        let data = [this.carstatusextended.firstRow]
        if (this.filteredByDate) this.loading = true
        let tableData = this.filteredByDate && data.concat(this.filteredByDate.reduce(function(acc, val) {
          val.data.forEach(function(row, i) {
            acc[i] = (acc[i]) ? acc[i] : {}
            acc[i].rowHeader = row.rowHeader
            acc[i].combine = row.combine.length
            acc[i].sprayer = row.sprayer.length
            acc[i].tractor = row.tractor.length
            acc[i].truck = row.truck.length
            acc[i].id = i
          })
          return acc
        }, []));
        if (this.filteredByDate) this.loading = false
        return tableData
      },
      filteredByDate: function() {
        let from = this.item.selectedDate.from
        return this.carstatus && this.carstatus.filter(function(record) {
          let date = new Date(record.date)
          let dateRange = (date >= from && date <= from)
          return dateRange
        })
      },
      details: function() {
        return this.filteredByDate && this.filteredByDate[0] &&
               this.filteredByDate[0].data[this.selectedCarStatusId][this.selectedCarType]
      },
    },
    created() {
      this.fetchEntities([
        'carstatusextended'
      ]);
      EventBus.$on('AppYearChanged', (year) => {
        this.item.selectedDate.from = new Date(new Date(this.item.selectedDate.from).setFullYear(year));
      });
    },
    methods: {
      showInfo(id) {
        this.dialogTableVisible = true
        this.selectedCarStatusId = id
      },
      exportTable(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let endpoint        = "CarStatusForm";
            let filename        = "Статус техники";

            let body = {
              OrganizationId: this.$root.context.organization,
              Date: moment(this.item.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss")
            };

            http.downloadXLS(endpoint, body, filename);
          } else {
            return false;
          }
        });
      },
    }
  }

</script>

<style>
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

</style>
