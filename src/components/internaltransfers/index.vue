<template lang="pug">
div
  el-form(
    :model="item",
    :inline="true",
    :rules="rules",
    ref="form",
    :label-position="'top'"
  )
    el-form-item(label="Дата от")
      el-date-picker(v-model="item.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="item.selectedDate.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="ТОК", prop="warehouseId")
      el-select(v-model="item.warehouseId" clearable placeholder="Выбрать", @change="warehouseChange(item.warehouseId)")
        el-option(
          v-for="w in warehouses",
          :key="w.id",
          :label="w.name",
          :value="w.id"
          )
    el-form-item(label="Культура", prop="cultureId")
      el-select(v-model="item.cultureId" clearable placeholder="Выбрать" filterable)
        el-option(
          v-for="c in cultures",
          :key="c.id",
          :label="c.name",
          :value="c.id"
          )
    el-form-item(label="." :class="{invisibleColor: true}")
      el-button.excel(type='default', @click="exportTable('form')") .

  h2(class="tableHeading") Журнал весовщика - перемещение

  el-table(
    v-if="tableData.length || loading",
    :data="paginate(tableData)",
    border,
    resizable,
    )
    el-table-column(
      prop="rowNumber",
      label="Номер записи",
      header-align="center",
      width="110"
    )
    el-table-column(
      prop="date",
      label="Дата",
      header-align="center",
      width="180"
    )
    el-table-column(
      prop="loadingPlace",
      label="Место погрузки",
      header-align="center",
      width="110"
    )
    el-table-column(
      prop="unloadingPlace",
      label="Место разгрузки",
      header-align="center",
      width="170"
    )
    el-table-column(
      prop="culture",
      label="Культура",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="driver",
      label="Водитель",
      header-align="center",
      width="120"
    )
    el-table-column(
      label="Автомашина",
      header-align="center",
    )
      el-table-column(
        prop="carModel",
        label="марка",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="stateNumber",
        label="гос номер",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="organizationNumber",
        label="хоз номер",
        header-align="center",
        width="120"
      )
    el-table-column(
      label="вес, кг",
      header-align="center",
    )
      el-table-column(
        prop="weightBrutto",
        label="брутто",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="weightOfTare",
        label="тара",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="weightNetto",
        label="нетто",
        header-align="center",
        width="120"
      )
    el-table-column(
      label="определяется при взвешивании",
      header-align="center",
    )
      el-table-column(
        prop="arrivalTime",
        label="Время прибытия",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="departureTime",
        label="Время убытия",
        header-align="center",
        width="120"
      )
    el-table-column(
      prop="loadingTime",
      label="время погрузки/разгрузки",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="isFingerSignature",
      label="подпись водителя",
      header-align="center",
      width="120"
    )
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
  import moment from 'moment'
  import ListController from 'mixins/ListController'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        item: {
          warehouseId: null,
          cultureId: null,
          culture: "",
          selectedDate: {
            from: new Date(new Date("05/01/" + (new Date()).getFullYear()).setFullYear(this.$root.context.year)),
            till: new Date(new Date().setFullYear(this.$root.context.year))
          }
        },
        rules: {
          warehouseId: [
              { required: true, type: 'integer', message: 'Поле обязательно', trigger: 'change' }
          ]
        },
        perPage: 5,
        currentPage: 1,
        loading: true,
      }
    },
    computed: {
      warehouses() {
        let warehouses = this.fromVuex('warehouses')
        //id баланса зерна равно 2, фильтруем по нему
        warehouses = warehouses.filter( x => x.warehouseType == 2)

        if (warehouses && warehouses.length) {
          this.item.warehouseId = warehouses[0].id

          let localWarehouseId = localStorage.getItem('warehouseId');

          if (localWarehouseId){
            this.item.warehouseId = parseInt(localWarehouseId);
          } else {
            localStorage.setItem('warehouseId', this.item.warehouseId);
          }

        }
        return warehouses;
      },
      cultures() {
        return this.fromVuex('cultures')
      },
      internaltransfers() {
        return this.fromVuex('internaltransfers')
      },
      totalItems: function() {
        return this.tableData.length;
      },
      tableData: function() {
        let from = this.item.selectedDate.from || new Date("05/01/" + (new Date()).getFullYear())
        let till = this.item.selectedDate.till || Date.now()
        let warehouseId = this.item.warehouseId
        let cultureId = this.item.cultureId
        if (this.internaltransfers.length) this.loading = true
        let tableData = this.internaltransfers.filter(function(record) {
          let ourDate = new Date(record.date)
          let dateRange = (ourDate >= from) && (ourDate <= till)
          let warehouse = record.warehouseId === warehouseId || !warehouseId
          let culture = record.cultureId === cultureId || !cultureId
          return dateRange && warehouse && culture
        })
        if (this.internaltransfers.length) this.loading = false
        return tableData
      },
    },
    created() {
//      EventBus.$on('SeedLimitFact.UpdateComponent.PutObjectCompleted', () => {
//        this.refresh()
//      });
      EventBus.$on('AppYearChanged', (year) => {
        this.item.selectedDate.from = new Date(new Date(this.item.selectedDate.from).setFullYear(year));
        this.item.selectedDate.till = new Date(new Date(this.item.selectedDate.till).setFullYear(year));
      });
      EventBus.$on('App.Context.OrganizationChanged', (orgId) => {
        localStorage.removeItem('warehouseId');
      });
      this.fetchEntities([
        'internaltransfers',
        'warehouses',
        'cultures',
      ]);
    },
    methods: {
//      update(id) {
//        EventBus.$emit('SeedLimitFact.InitUpdate', id);
//      },
      warehouseChange(value) {
        localStorage.setItem('warehouseId', value);
      },
      load() {
        this.fetchEntities([
          'internaltransfers',
        ]);
      },
      refresh() {
        this.loading = true
        this.load();
      },
      exportTable(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let endpoint        = "InternalTransferReport";
            let filename        = "Журнал весовщика(перемещение)";

            let body = {
              CultureId: this.item.cultureId,
              WarehouseId: this.item.warehouseId,
              Date: {
                start: moment(this.item.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss"),
                end: moment(this.item.selectedDate.till).format("YYYY-MM-DDTHH:mm:ss"),
              },
              OrganizationId: this.$root.context.organization,
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
