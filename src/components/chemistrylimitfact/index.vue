<template lang="pug">
div
  update
  el-form(
    :model="item",
    :inline="true",
    :rules="rules",
    ref="form",
    :label-position="'top'",
  )
    el-form-item(label="Дата от")
      el-date-picker(v-model="item.selectedDate.from", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Дата до")
      el-date-picker(v-model="item.selectedDate.till", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Бригада", prop="brigadeId")
      el-select(v-model="item.brigadeId" clearable placeholder="Выбрать")
        el-option(
          v-for="b in brigades",
          :label="b.name",
          :value="b.id",
          :key="b.id",
          )
    el-form-item(label="Культура", prop="culture")
      el-select(v-model="item.culture" clearable placeholder="Выбрать" filterable)
        el-option(
          v-for="c in cultures",
          :key="c.id",
          :label="c.name",
          :value="c.name"
          )
    el-form-item(label="Препараты", prop="chemicals")
      el-select(v-model="item.chemical" clearable placeholder="Выбрать" filterable)
        el-option(
          v-for="c in chemicals",
          :key="c.id",
          :label="c.name",
          :value="c.id"
          )
    el-form-item(label="." :class="{invisibleColor: true}")
      el-button.excel(type='default', @click="exportTable('form')") .

  h2(class="tableHeading") Акт списания химии
  el-table(
    v-if="tableData.length",
    :data="tableData",
    border,
    resizable,
  )
    el-table-column(
      prop="date.startFormated",
      label="Дата обработки",
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
      prop="workName",
      label="Вид работы",
      header-align="center",
      width="180"
    )
    el-table-column(
      prop="cultureName",
      label="Культура",
      header-align="center",
      width="180"
    )
    el-table-column(
      prop="area",
      label="Площадь обработки, га",
      header-align="center",
      width="120"
    )
    el-table-column(
      :label="prep.name",
      header-align="center"
    )
      el-table-column(
        label="расход на га",
        header-align="center"
      )
        el-table-column(
          prop="cct.normative",
          label="норма",
          header-align="center",
          width="120"
        )
        el-table-column(
          prop="cct.factNormative",
          label="факт",
          header-align="center",
          width="120"
        )
      el-table-column(
        prop="cct.units",
        label="ед. изм",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="cct.deviation",
        label="отклонение, кг",
        header-align="center",
        width="130"
        )
      el-table-column(
        prop="cct.factTotal",
        label="итого расход",
        header-align="center",
        width="120"
      )
    el-table-column(
      label="Операции",
      fixed="right",
      header-align="center",
      align="center",
      width="150"
    )
      template(slot-scope="scope")
        el-button(@click="handleClickPrev" type="text" size="big" icon="arrow-left")
        el-button(@click="handleClickNext" type="text" size="big" icon="arrow-right")
        el-button(@click="update(scope.row.id)" type="text" size="big" icon="edit")
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
  import {getCookie} from 'lib/utils'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import { EventBus } from 'services/EventBus'
  import ListController from 'mixins/ListController'
  import moment from 'moment'
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
          chemical: "",
          selectedDate: {
            from: new Date(new Date(new Date().getTime() - (5*24*60*60*1000)).setFullYear(this.$root.context.year)),
            till: new Date(new Date().setFullYear(this.$root.context.year)),
          }
        },
        rules: {
          brigadeId: [
              { required: true, type: 'integer', message: 'Поле обязательно', trigger: 'change' }
          ]
        },
        perPage: 5,
        currentPage: 1,
        currentCct: 0,
      }
    },
    computed: {
      brigades() {
        let brigades = this.fromVuex('brigades')
        if (brigades && brigades.length) this.item.brigadeId = brigades[0].id
        return brigades
      },
      chemicals() {
        return this.fromVuex('chemicals')
      },
      chemistrylimitfact() {
        return this.fromVuex('chemistrylimitfact')
          .map(function(record) {
            record.date.startFormated = moment(record.date.start).format("DD.MM.YYYY")
            return record
          })
      },
      cultures() {
        return this.fromVuex('cultures')
      },
      totalItems: function() {
        return this.filteredData.length;
      },
      paginatedData: function() {
        this.currentCct = 0
        return this.paginate(this.filteredData)
      },
      columns: function() {
        let ids = []
        let columns = this.paginatedData.reduce(function(a, b) {
          return a.concat(b.chemistryChemicalTreatments.map(function(treatment) {
            return {
              "id": treatment.chemicalPreparationId,
              "name": treatment.chemicalPreparationName
            }
          }))
        }, []).sort(function(a, b) {
          return a.id - b.id
        }).filter(function(item) {
          if (ids.indexOf(item.id) === -1) {
            ids.push(item.id)
            return true;
          }
          return false
        })
        return columns
      },
      ccct: function() {
        return this.currentCct ? Math.min(this.currentCct, this.columns.length - 1) : 0;
      },
      prep: function() {
        return this.columns[this.ccct]
      },
      filteredData: function() {
        let from = this.item.selectedDate.from || new Date(new Date().getTime() - (5*24*60*60*1000))
        let till = this.item.selectedDate.till || Date.now()
        let brigadeId = this.item.brigadeId
        let cultureId = this.item.culture
        let chemicalId = this.item.chemical
        return this.chemistrylimitfact.filter(function(record) {
          let start = new Date(record.date.start)
          let end = new Date(record.date.end)
          let dateRange = (start >= from) && (end <= till)
          let brigade = record.brigadeId === brigadeId || !brigadeId
          let culture = record.cultureName === cultureId || !cultureId
          let chemical = !chemicalId || record.chemistryChemicalTreatments.some(c => c.chemicalPreparationId === chemicalId)
          return dateRange && brigade && culture && chemical
        })
      },
      tableData: function() {
        let id = (this.paginatedData.length) ? this.prep.id : 0
        return this.paginatedData.map(function(row) {
          let cct = row.chemistryChemicalTreatments.filter(function(treatment) {
            return (treatment.chemicalPreparationId == id)
          })
          row.cct = cct[0] || []
          return row
        })
      },
    },
    created() {
      EventBus.$on('ChemistryLimitFact.UpdateComponent.PutObjectCompleted', () => {
        this.refresh()
      });
      EventBus.$on('AppYearChanged', (year) => {
        this.item.selectedDate.from = new Date(new Date(this.item.selectedDate.from).setFullYear(year));
        this.item.selectedDate.till = new Date(new Date(this.item.selectedDate.till).setFullYear(year));
      });
      this.fetchEntities([
        'chemistrylimitfact',
        'brigades',
        'cultures',
        'chemicals',
      ]);
    },
    methods: {
      update(id) {
        EventBus.$emit('ChemistryLimitFact.InitUpdate', id);
      },
      load() {
        this.fetchEntities([
          'chemistrylimitfact',
        ]);
      },
      refresh() {
        this.load();
      },
      handleClickNext() {
        this.currentCct = Math.min(this.currentCct + 1, this.columns.length - 1);
      },
      handleClickPrev() {
        this.currentCct = Math.max(this.currentCct - 1, 0);
      },
      exportTable(name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            let endpoint        = "ChemistryLimitFactForm";
            let filename        = "Акт списания химии";

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
  .invisibleColor > label {
    color: transparent;
  }
</style>
