<template lang="pug">
div
  template(v-if="mode == 'edit'")
    h3 Редактирование
  template(v-else)
    h3 Новая запись
  el-form(:inline="true", :label-position="'top'", :model="item")
    el-form-item(label="Дата")
      el-date-picker(v-model="item.dateTime", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Культура")
      el-select(v-model="item.cultureId", filterable, clearable)
        el-option(v-for="c in cultures", :label="c.name", :value="c.id", :key="c.id")
    el-form-item(label="Сорт")
      el-select(v-model="item.cultureSortId", filterable, clearable)
        el-option(v-for="s in sortsByCulture", :label="s.name", :value="s.id", :key="s.id")
    el-form-item(label="Репродукция")
      el-select(v-model="item.reproductionId", filterable, clearable)
        el-option(v-for="r in reproductions", :label="r.name", :value="r.id", :key="r.id")
    div
    el-form-item(label="Объем, тонна")
      el-input(v-model="item.volume")
    el-form-item(label="Протравочная машина")
      el-select(v-model="item.carId", filterable, clearable)
        el-option(v-for="c in cars", :label="c.displayString", :value="c.id", :key="c.id")
    el-form-item(label="Орудия")
      el-select(v-model="item.instrumentId", filterable, clearable)
        el-option(v-for="i in filteredInstruments", :label="i.name", :value="i.id", :key="i.id")
    div
    el-form-item(label="Баковая смесь")
      el-select(v-model="item.seedMordantChemicalTreatments[0].chemicalPreparationId", filterable, clearable, @change="setNormative()")
        el-option(v-for="cp in chemicalpreparations", :label="cp.name", :value="cp.id", :key="cp.id")
      el-input.form-input(type="number", v-model="item.seedMordantChemicalTreatments[0].normative", :min="minNorm", :max="maxNorm", :step="0.001", :disabled="!item.seedMordantChemicalTreatments[0].chemicalPreparationId")
      el-button(@click="addToSMCP()", :disabled="!item.seedMordantChemicalTreatments[0].chemicalPreparationId") Добавить
      div.tags
        el-tag(v-for="(item, index) in item.seedMordantChemicalTreatments.slice(1)",
        :key="index"
        type="primary",
        :closable="true",
        @close="removeCP(index + 1)")
          | {{ getCPName(item.chemicalPreparationId) }}
          b  ( {{ item.normative }} )
    div
    el-button.form-btn(type="primary", @click="save()", :loading="loadingItem.save") Сохранить
    template(v-if="mode == 'edit'")
      el-button.form-btn(@click="switchToCreate()") Отменить
  h2 Протравка семян
    span(:style="{marginRight: '30px'}")
    el-button.excel(type='default', @click="openDialogExcel()") .
    span(:style="{marginRight: '10px'}")
    el-dialog(:visible.sync="excelDialogVisible", title="Отчет", size="tiny", :modal="false")
      el-form(inline)
        el-form-item(label="Дата")
          el-date-picker(v-model="excel.date", format="dd.MM.yyyy", placeholder="Выберите дату")
        el-form-item
          el-button.excel(type='default', @click="exportTable()") .
    el-button(@click="openDialogLZK()") ЛЗК
    el-button(@click="getNakladnaya()", :loading="loadingItem.nakladnaya", :disabled="!lzk.date") Накладная
    el-dialog(:visible.sync="formDialogVisible", title="ЛЗК", size="tiny", :modal="false")
      el-form(:model="lzk")
        el-form-item(label="Дата")
          el-date-picker(v-model="lzk.date", format="dd.MM.yyyy", placeholder="Выберите дату")
        el-form-item
          el-button(type="primary", @click="getLZK()", :loading="loadingItem.lzk", :disabled="!lzk.date") Скачать
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
      max-height="400",
    ).content
      el-table-column(prop="date", label="Дата обработки")
      el-table-column(prop="culture", label="Культура")
      el-table-column(prop="sort", label="Сорт")
      el-table-column(prop="reproduction", label="Репродукция")
      el-table-column(prop="volume", label="Объем, тонна")
      el-table-column(prop="car", label="Протравочная машина")
      el-table-column(label="Тип препарата")
        template(slot-scope="scope")
          el-tag(v-for="cpt in scope.row.chemicalPreparationTypes", :color="cpt.color", :key="cpt.id") {{ cpt.name }}
      el-table-column(label="Препарат")
        template(slot-scope="scope")
          el-tag(v-for="cp in scope.row.chemicalPreparations", :color="cp.color", :key="cp.id") {{ cp.name }}
      el-table-column(label="Норма внесения")
        template(slot-scope="scope")
          el-tag(v-for="n in scope.row.normative", :color="n.color", :key="n.id") {{ n.value }}
      el-table-column(
        fixed="right",
        align="center",
        width="120",
      )
        el-button-group(slot-scope="scope")
          el-button(icon="edit", size="small", @click="edit(scope.row.id)")
          el-button(icon="delete", size="small", @click="remove(scope.row.id)")
    el-pagination(
      layout="total, prev, pager, next",
      :total="tableData.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange",
    )
</template>
<script>
import http from 'lib/httpQueryV2';
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import ListController from 'mixins/ListController';
import GlobalMethods from 'lib/GlobalMethods';
import {deepClone} from 'lib/utils';
import moment from 'moment';

export default {
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  data() {
    return {
      cars: [],
      instruments: [],
      chemicalpreparations: [],
      chemicalpreparationtypes: [],
      cultures: [],
      reproductions: [],
      seedmordant: [],
      sorts: [],
      works: [],
      perPage: 5,
      loading: false,
      colors: ["#DF0101", "#FFD100", "#74DF00", "#2E2EFE", "#FF8000",],
      item: {
        seedMordantChemicalTreatments: [{}],
      },
      lzk: {
        organizationid: this.$root.context.organization,
      },
      formDialogVisible: false,
      loadingItem: {
        lzk: false,
        nakladnaya: false,
        save: false,
      },
      minNorm: null,
      maxNorm: null,
      excelDialogVisible: false,
      excel: {
        date: moment().set({'year': this.$root.context.year, 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0})
      },
      mode: "create",
    }
  },
  computed: {
    tableData() {
      let tableData = this._seedmordant
      return tableData || []
    },
    _seedmordant() {
      let _seedmordant = deepClone(this.seedmordant).map(sm => {
        sm.date = moment(sm.dateTime, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm")
        sm.culture = this.cultures.find(c => c.id == sm.cultureId).name
        sm.sort = this.sorts.find(s => s.id == sm.cultureSortId).name
        sm.reproduction = this.reproductions.find(r => r.id == sm.reproductionId).name
        let car = this.cars.find(s => s.id == sm.carId)
        car = car && car.displayString || ""
        let instrument = this.fromVuex("instruments").find(i => i.id == sm.instrumentId)
        instrument = instrument && instrument.name || ""
        sm.car = [car, instrument].join(" ")
        sm.chemicalPreparationTypes = []
        sm.chemicalPreparations = []
        sm.normative = []
        sm.seedMordantChemicalTreatments.forEach((smct, i) => {
          let color = this.colors[i % 5]
          let chemicalpreparation = this.chemicalpreparations.find(cp => cp.id == smct.chemicalPreparationId)
          if (chemicalpreparation) {
            let chemicalpreparationtype = this.chemicalpreparationtypes.find(cpt => cpt.id == chemicalpreparation.chemicalPreparationTypeId)
            let obj = {id: chemicalpreparationtype.id, name: chemicalpreparationtype.name, color: color}
            if (!sm.chemicalPreparationTypes.find(cpt => cpt.id == obj.id)) sm.chemicalPreparationTypes.push(obj)
            obj = {id: chemicalpreparation.id, name: chemicalpreparation.name, color: color}
            sm.chemicalPreparations.push(obj)
            obj = {id: chemicalpreparation.id, value: [smct.normative, smct.units].join(" "), color: color}
            sm.normative.push(obj)
          }
        })
        return sm
      })
      return _seedmordant
    },
    sortsByCulture() {
      return this.sorts.filter(s => s.cultureId == this.item.cultureId) || []
    },
    filteredInstruments() {
      let instruments = []
      this.works.forEach(workId => {
        let cars = GlobalMethods.getCarsFilteredByWorks(workId).map(car => car.id)
        cars.forEach(carId => {
          if (this.item.carId == carId) {
            let instrumentsFound = GlobalMethods.getInstrumentsFilteredByWorksAndCars(workId, carId)
            instruments = instruments.concat(instrumentsFound)
          }
        })
      })
      let instrumentsUniq = instruments
        .filter((instrument, index, instruments) => instruments.map(i => i.id).indexOf(instrument.id) == index)
      return instrumentsUniq
    }
  },
  created() {
    this.loading = true
    this.fetchEntities([
      "cars",
      "chemicalpreparations",
      "chemicalpreparationtypes",
      "cultures",
      "reproductions",
      "seedmordant",
      "sorts",
      "fuelnorms",
      "instruments",
      "carsAll",
      "works",
    ], this.afterFetch)
  },
  methods: {
    afterFetch() {
      this.cars = GlobalMethods.getCarsFilteredByWorks(35).concat(GlobalMethods.getCarsFilteredByWorks(36))
        .filter((car, index, cars) => cars.map(c => c.id).indexOf(car.id) == index)
      this.chemicalpreparations = this.fromVuex("chemicalpreparations")
        .filter(cp => [1, 5].includes(cp.chemicalPreparationTypeId))
      this.chemicalpreparationtypes = this.fromVuex("chemicalpreparationtypes")
      this.cultures = this.fromVuex("cultures")
      this.reproductions = this.fromVuex("reproductions")
      this.sorts = this.fromVuex("sorts")
      this.seedmordant = this.fromVuex("seedmordant")
      this.works = [35, 36]
      this.loading = false
    },
    afterFetchUpdate() {
      this.seedmordant = this.fromVuex("seedmordant")
      this.loading = false
    },
    load() {
      this.fetchEntities([
        "seedmordant",
      ], this.afterFetchUpdate)
    },
    refresh() {
      this.loading = true
      this.load()
    },
    addToSMCP() {
      this.item.seedMordantChemicalTreatments.splice(0, 0, {})
    },
    removeCP(index) {
      this.item.seedMordantChemicalTreatments.splice(index, 1)
    },
    getCPName(id) {
      let chemicalpreparation = this.chemicalpreparations.find(сp => сp.id === id)
      let name = chemicalpreparation && chemicalpreparation.name || "Не выбрано"
      return name
    },
    setNormative() {
      let smct = this.item.seedMordantChemicalTreatments[0]
      let cpId = smct.chemicalPreparationId
      if (cpId) {
        let chemicalpreparation = this.chemicalpreparations.find(cp => cp.id == cpId)
        let cp = deepClone(chemicalpreparation)
        this.minNorm = cp.minNorm || 0
        this.maxNorm = cp.maxNorm || Number.MAX_SAFE_INTEGER
        smct.normative = cp && cp.minNorm || 0
      }
    },
    save() {
      this.loadingItem.save = true
      let body = deepClone(this.item)
      body.seedMordantChemicalTreatments.splice(0, 1)
      if (this.mode == "edit") {
        let item = {}
        Object.keys(this.item).forEach(key => {
          if (Object.keys(this.seedmordant[0]).includes(key)) item[key] = body[key]
        })
        body = item
      }
      body.dateTime = moment(body.dateTime).format("YYYY-MM-DDTHH:mm:ss")
      let httpMethod = (this.mode == "edit") ? "put" : "post"
      this.mode = "create"
      http[httpMethod](`seedmordant/${this.$root.context.organization}`, body)
        .then(() => {
          this.loadingItem.save = false
          this.item = {seedMordantChemicalTreatments: [{}]}
          this.refresh()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    edit(id) {
      this.$el.scrollTop = 0
      this.item = deepClone(this.seedmordant.find(sm => sm.id == id))
      this.addToSMCP()
      this.mode = "edit"
    },
    switchToCreate() {
      this.item = {seedMordantChemicalTreatments: [{}]}
      this.mode = "create"
    },
    remove(id) {
      this.$confirm('Действительно удалить?', 'Внимание', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        http.delete(`seedmordant/${id}`)
          .then(() => {
            this.refresh()
          })
      })
    },
    openDialogLZK() {
      this.formDialogVisible = true
    },
    getLZK() {
      this.loadingItem.lzk = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let name = "Лимитно-заборная карта за " + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF("SeedMordantCardForm", body, name)
        .then(() => {
          this.loadingItem.lzk = false
          this.formDialogVisible = false
        })
    },
    getNakladnaya() {
      this.loadingItem.nakladnaya = true
      let body = deepClone(this.lzk)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let name = "Накладная за " + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF("SeedMordantInvoiceForm", body, name)
        .then(() => {
          this.loadingItem.nakladnaya = false
        })
    },
    openDialogExcel() {
      this.excelDialogVisible = true
    },
    exportTable() {
      let endpoint = "SeedMordantReport";
      let filename = "Отчет по обработке семян";
      let body = {
        organizationId: this.$root.context.organization,
        date: moment(this.excel.date).format("YYYY-MM-DDTHH:mm:ss"),
      };
      http.downloadXLS(endpoint, body, filename)
    },
  }
}
</script>
<style lang="stylus" scoped>
.form-btn
  width fit-content
.form-input
  width fit-content
</style>
