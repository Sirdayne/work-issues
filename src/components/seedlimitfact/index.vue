<template lang="pug">
div
  update
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
    el-form-item(label="Бригада", prop="brigadeId")
      el-select(v-model="item.brigadeId" clearable placeholder="Выбрать")
        el-option(
          v-for="b in brigades",
          :key="b.id",
          :label="b.name",
          :value="b.id"
          )
    el-form-item(label="Культура", prop="culture")
      el-select(v-model="item.culture" clearable placeholder="Выбрать" filterable)
        el-option(
          v-for="c in cultures",
          :key="c.id",
          :label="c.name",
          :value="c.name"
          )
    el-form-item(label="." :class="{invisibleColor: true}")
      el-button.excel(type='default', @click="exportTable('form')") .

  h2(class="tableHeading") Акт списания семян
  el-table(
    v-if="tableData.length || loading",
    :data="paginate(tableData)",
    border,
    resizable,
    v-loading="loading",
    element-loading-text="Загружается...",
    )
    el-table-column(
      prop="date.startFormated",
      label="Дата посева",
      header-align="center",
      width="110"
    )
    el-table-column(
      prop="fieldName",
      label="Поле",
      header-align="center",
      width="180"
    )
    el-table-column(
      prop="sowingArea",
      label="Выработка, Га",
      header-align="center",
      width="130"
    )
    el-table-column(
      prop="previousCulture",
      label="Предшественник",
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
      prop="sort",
      label="Сорт",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="reproduction",
      label="Репродукция",
      header-align="center",
      width="150"
    )
    el-table-column(
      label="Норма высева",
      header-align="center",
    )
      el-table-column(
        prop="seedMillionNumber",
        label="млн.шт зерен/га",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="sowingNormative",
        label="кг/га",
        header-align="center",
        width="120"
      )
    el-table-column(
      prop="seedTotal",
      label="Итого согласно ЛЗК",
      header-align="center",
      width="120"
    )
    el-table-column(
      prop="deviation",
      label="Отклонение, кг",
      header-align="center",
      width="130"
      )
    el-table-column(
      label="Расход семян факт",
      header-align="center",
    )
      el-table-column(
        prop="factNormative",
        label="кг/га",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="factSeedTotal",
        label="итого, кг",
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
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import moment from 'moment'
  import ListController from 'mixins/ListController'
  import update from './update.vue'

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
        item: {
          brigadeId: null,
          culture: "",
          selectedDate: {
            from: new Date(new Date("05/01/" + (new Date()).getFullYear()).setFullYear(this.$root.context.year)),
            till: new Date(new Date().setFullYear(this.$root.context.year))
          }
        },
        rules: {
          brigadeId: [
              { required: true, type: 'integer', message: 'Поле обязательно', trigger: 'change' }
          ]
        },
        perPage: 5,
        currentPage: 1,
        loading: true,
      }
    },
    computed: {
      brigades() {
        let brigades = this.fromVuex('brigades')
        if (brigades && brigades.length) this.item.brigadeId = brigades[0].id
        return brigades;
      },
      cultures() {
        return this.fromVuex('cultures')
      },
      seedlimitfact() {
        return this.fromVuex('seedlimitfact')
          .sort((a, b) => new Date(b.date.start) - new Date(a.date.start))
          .map(seedlimit => {
            seedlimit.date.startFormated = moment(seedlimit.date.start).format("DD.MM.YYYY")
            return seedlimit
          });
      },
      totalItems: function() {
        return this.tableData.length;
      },
      tableData: function() {
        let from = this.item.selectedDate.from || new Date("05/01/" + (new Date()).getFullYear())
        let till = this.item.selectedDate.till || Date.now()
        let brigadeId = this.item.brigadeId
        let cultureId = this.item.culture
        if (this.seedlimitfact.length) this.loading = true
        let tableData = this.seedlimitfact.filter(function(record) {
          let start = new Date(record.date.start)
          let end = new Date(record.date.end)
          let dateRange = (start >= from) && (end <= till)
          let brigade = record.brigadeId === brigadeId || !brigadeId
          let culture = record.culture === cultureId || !cultureId
          return dateRange && brigade && culture
        })
        if (this.seedlimitfact.length) this.loading = false
        return tableData
      },
    },
    created() {
      EventBus.$on('SeedLimitFact.UpdateComponent.PutObjectCompleted', () => {
        this.refresh()
      });
      EventBus.$on('AppYearChanged', (year) => {
        this.item.selectedDate.from = new Date(new Date(this.item.selectedDate.from).setFullYear(year));
        this.item.selectedDate.till = new Date(new Date(this.item.selectedDate.till).setFullYear(year));
      });
      this.fetchEntities([
        'seedlimitfact',
        'brigades',
        'cultures',
      ]);
    },
    methods: {
      update(id) {
        EventBus.$emit('SeedLimitFact.InitUpdate', id);
      },
      load() {
        this.fetchEntities([
          'seedlimitfact',
        ]);
      },
      refresh() {
        this.loading = true
        this.load();
      },
      exportTable(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let endpoint        = "SeedLimitFactForm";
            let filename        = "Акт списания семян";

            let body = {
              OrganizationId: this.$root.context.organization,
              Date: {
                start: moment(this.item.selectedDate.from).format("YYYY-MM-DDTHH:mm:ss"),
                end: moment(this.item.selectedDate.till).format("YYYY-MM-DDTHH:mm:ss"),
              },
              BrigadeId: this.item.brigadeId
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
