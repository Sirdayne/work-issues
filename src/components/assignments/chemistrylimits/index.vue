<template lang="pug">
div
  template(v-if="mode == 'edit'")
    h3 Редактирование
  template(v-else)
    h3 Новая запись
  el-form(:inline="true", :label-position="'top'", :model="item", :rules="rules", ref="ruleForm")
    el-form-item(label="Дата")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Работа")
      el-select(v-model="item.workTypeParameterPlanWorkTypeId", filterable, clearable, @change="setFieldWorkIndicator")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    template(v-if="isFieldWork")
      el-form-item.form-item-iterable(label="Поле")
        el-select(v-model="item.fieldId", filterable, clearable, @change="setFieldArea")
          el-option(v-for="f in fields", :key="f.id", :label="f.newName", :value="f.id")
      el-form-item(label="Площадь поля", prop="area")
        el-input.form-input(type="number", v-model.number="item.area", min="0", :max="fieldMaxArea", :step="0.01", :disabled="!item.fieldId")
    template(v-else)
      el-form-item.form-item-iterable(label="Посев")
        el-select(v-model="item.seedLimitId", filterable, clearable, @change="extractExtraInfoFromSeedlimit")
          el-option(v-for="s in filteredSeedlimits", :key="s.id", :label="s.displayString", :value="s.id")
      el-form-item(label="Площадь посева", prop="area")
        el-input.form-input(type="number", v-model.number="item.area", min="0", :max="seedlimitMaxArea", :step="0.01", :disabled="!item.seedLimitId")
    div
    el-form-item.form-item-iterable(label="Препараты")
      el-select(v-model="item.chemistryChemicalTreatments[0].chemicalPreparationId", filterable, clearable, @change="setNormative()")
        el-option(v-for="cp in chemicalpreparations", :label="cp.name", :value="cp.id", :key="cp.id")
    el-form-item.invisible-color(label=".", prop="chemistryChemicalTreatments[0].normative")
      el-input.form-input(type="number", v-model.number="item.chemistryChemicalTreatments[0].normative", :min="minNorm", :max="maxNorm", :step="0.001", :disabled="!item.chemistryChemicalTreatments[0].chemicalPreparationId")
    el-form-item.invisible-color(label=".")
      el-button(@click="addToCCP()", :disabled="!item.chemistryChemicalTreatments[0].chemicalPreparationId") Добавить
    div.tags
      el-tag(v-for="(item, index) in item.chemistryChemicalTreatments.slice(1)",
      :key="index"
      type="primary",
      :closable="true",
      @close="removeCP(index + 1)")
        | {{ getCPName(item.chemicalPreparationId) }}
        b  ( {{ item.normative }} )
    template(v-if="isHerbicide")
      div
      el-form-item.form-item-iterable(label="Сорняки")
        el-select(v-model="item.chemistryLimitWeedTypes[0].weedId", filterable, clearable, @change="setWeedAmount")
          el-option(v-for="w in weeds", :label="w.name", :value="w.id", :key="w.id")
      el-form-item.invisible-color(label=".")
        el-input.form-input(type="number", v-model.number="item.chemistryLimitWeedTypes[0].weedAmount", min="0", max="100000000", :step="1", :disabled="!item.chemistryLimitWeedTypes[0].weedId")
      el-form-item.invisible-color(label=".")
        el-button(@click="addToCLWT()", :disabled="!item.chemistryLimitWeedTypes[0].weedId") Добавить
      div.tags
        el-tag(v-for="(item, index) in item.chemistryLimitWeedTypes.slice(1)",
        :key="index"
        type="primary",
        :closable="true",
        @close="removeWeed(index + 1)")
          | {{ getWeedName(item.weedId) }}
          b  ( {{ item.weedAmount }} )
    div
    el-button.form-btn(type="primary", @click="submit()", :loading="loadingItem.save") Сохранить
    template(v-if="mode == 'edit'")
      el-button.form-btn(@click="switchToCreate()") Отменить
  h2 Расчет СЗР
    span(:style="{marginRight: '30px'}")
    el-button.filter(@click="filterDialogVisible = true", title="Фильтр") .
    el-button.printer(type="default", @click="exportTable()") .
    el-dialog(:visible.sync="filterDialogVisible", title="Фильтр", size="tiny", :modal="false")
      el-form(:model="filterItem", label-width="90px")
        el-form-item(label="Дата")
          el-date-picker(v-model="filterItem.startDateFormated", format="dd.MM.yyyy", placeholder="Выберите дату")
        el-form-item(label="Посевы")
          el-select.form-item-iterable(v-model="filterItem.seedlimitsIds", multiple, filterable, clearable)
            el-option(v-for="s in seedlimits", :label="s.displayString", :value="s.id", :key="s.id")
    filter-cols(:cols="cols")
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
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop")
      el-table-column(label="Cорняки(кол-во)")
        template(slot-scope="scope")
          el-tag(v-for="(w, index) in scope.row.weeds", :color="w.color", :key="index") {{ w.value }}
      el-table-column(label="Тип препарата")
        template(slot-scope="scope")
          el-tag(v-for="(cpt, index) in scope.row.chemicalPreparationsTypes", :color="cpt.color", :key="index") {{ cpt.name }}
      el-table-column(label="Препарат")
        template(slot-scope="scope")
          el-tag(v-for="cp in scope.row.chemicalPreparations", :color="cp.color", :key="cp.id") {{ cp.name }}
      el-table-column(label="Норма расхода", width="100")
        template(slot-scope="scope")
          el-tag(v-for="n in scope.row.normative", :color="n.color", :key="n.id") {{ n.value }}
      el-table-column(label="Требуется")
        template(slot-scope="scope")
          el-tag(v-for="t in scope.row.total", :color="t.color", :key="t.id") {{ t.value }}
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
import paginate from 'mixins/paginate'
import {deepClone} from 'lib/utils';
import moment from 'moment';
import filterCols from "components/filterCols"

export default {
  mixins: [
    RecordsLoaderV2,
    paginate,
  ],
  components: {
    filterCols,
  },
  data() {
    var validateNormative = (rule, value, callback) => {
      if (value === undefined) {
        this.isValid.normative = false
        callback(new Error('Пожалуйста введите значение'));
      } else {
        if (isNaN(value) || !/^(\d+)(\.\d+)?(\d*)$/.test(value)) {
          this.isValid.normative = false
          callback(new Error('Пожалуйста введите положительное число'));
        } else {
          if (!(value >= this.minNorm && value <= this.maxNorm)) {
            this.isValid.normative = false
            callback(new Error(`мин:${this.minNorm}, макс:${this.maxNorm}`));
          } else {
            this.isValid.normative = true
            callback();
          }
        }
      }
    };
    var validateArea = (rule, value, callback) => {
      if (value === undefined) {
        this.isValid.area = false
        callback(new Error('Пожалуйста введите значение'));
      } else {
        if (isNaN(value) || !/^(\d+)(\.\d+)?(\d*)$/.test(value)) {
          this.isValid.area = false
          callback(new Error('Пожалуйста введите положительное число'));
        } else {
          let max = this.isFieldWork ? this.fieldMaxArea : this.seedlimitMaxArea
          if (!(value >= 0 && value <= max)) {
            this.isValid.area = false
            callback(new Error(`мин:0, макс:${max}`));
          } else {
            this.isValid.area = true
            callback();
          }
        }
      }
    };
    return {
      cols: [
        {label: "Дата", prop: "shortDate", active: true},
        {label: "Поле", prop: "fieldName", active: true},
        {label: "Площадь, га", prop: "area", active: true},
        {label: "Работа", prop: "workName", active: true},
        {label: "Культура", prop: "cultureName", active: true},
      ],
      chemicalpreparations: [],
      reproductions: [],
      chemistrylimits: [],
      seedlimits: [],
      works: [],
      fields: [],
      weeds: [],
      perPage: 5,
      loading: false,
      colors: ["#DF0101", "#FFD100", "#74DF00", "#2E2EFE", "#FF8000",],
      item: {
        chemistryChemicalTreatments: [{}],
        chemistryLimitWeedTypes: [{}],
      },
      lzk: {
        organizationid: this.$root.context.organization,
      },
      filterItem: {
        startDateFormated: new Date(this.$root.context.year, 0, 1, 0, 0, 0),
        seedlimitsIds: []
      },
      formDialogVisible: false,
      filterDialogVisible: false,
      loadingItem: {
        lzk: false,
        nakladnaya: false,
        save: false,
      },
      minNorm: null,
      maxNorm: null,
      seedlimitMaxArea: null,
      fieldMaxArea: null,
      isFieldWork: false,
      isHerbicide: false,
      rules: {
        "chemistryChemicalTreatments[0].normative": [
          {validator: validateNormative, trigger: 'blur'}
        ],
        "area": [
          {validator: validateArea, trigger: 'blur'}
        ],
      },
      isValid: {},
      mode: "create",
    }
  },
  computed: {
    tableData() {
      let tableData = this._chemistrylimits.filter(cl => {
        let date = !this.filterItem.startDateFormated || new Date(cl.date) >= new Date(this.filterItem.startDateFormated)
        let filterSeedlimits = !this.filterItem.seedlimitsIds.length || this.filterItem.seedlimitsIds.includes(cl.seedLimitId)
        if (date && filterSeedlimits) return cl;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
      return tableData || []
    },
    _chemistrylimits() {
      let _chemistrylimits = deepClone(this.chemistrylimits)
        .filter(cl => !cl.isMacrofertilizer)
        .map(cl => {
          cl.shortDate = moment(cl.date).format("DD.MM.YYYY")
          cl.workName =  this.works.filter(w => w.id === cl.workTypeParameterPlanWorkTypeId).length
                        ? this.works.filter(w => w.id === cl.workTypeParameterPlanWorkTypeId)[0].name
                        : '';
          cl.chemicalPreparations = []
          cl.chemicalPreparationsTypes = []
          cl.normative = []
          cl.total = []
          cl.chemistryChemicalTreatments.forEach((cct, i) => {
            let color = this.colors[i % 5]
            let obj = {id: cct.id, name: cct.chemicalPreparationName, color: color}
            cl.chemicalPreparations.push(obj)
            obj = {name: cct.preparationType, color: color}
            cl.chemicalPreparationsTypes.push(obj)
            obj = {id: cct.id, value: [cct.normative, cct.units].join(" "), color: color}
            cl.normative.push(obj)
            obj = {id: cct.id, value: [cct.total, cct.units].join(" "), color: color}
            cl.total.push(obj)
          })
          cl.weeds = []
          cl.chemistryLimitWeedTypes.forEach((clwt, i) => {
            let color = this.colors[i % 5]
            let weedName = clwt.weedName || "Нет данных"
            let obj = {value: [weedName, `(${clwt.weedAmount})`].join(""), color: color}
            cl.weeds.push(obj)
          })
          return cl;
        });
      return _chemistrylimits
    },
    filteredSeedlimits() {
      let excludeSeedlimitIds = this.chemistrylimits.filter(cl => cl.workTypeParameterPlanWorkTypeId == this.item.workTypeParameterPlanWorkTypeId).map(cl => cl.seedLimitId);
      return this.seedlimits.filter(sl => !excludeSeedlimitIds.includes(sl.id));
    },
  },
  created() {
    this.loading = true
    this.fetchEntities([
      "chemicalpreparations",
      "chemistrylimits",
      "works",
      "seedlimits",
      "fields",
      "weed",
    ], this.afterFetch)
  },
  methods: {
    afterFetch() {
      this.chemicalpreparations = this.fromVuex("chemicalpreparations").filter(cp => !cp.isMacrofertilizer);
      this.works = this.fromVuex('works').filter(w => w.planWorkTypeIsChemicalTreatment && !w.isMacrofertilizer)
      this.seedlimits = this.fromVuex('seedlimits')
      this.chemistrylimits = this.fromVuex("chemistrylimits")
      this.fields = this.fromVuex("fields");
      this.weeds = this.fromVuex("weed");
      this.loading = false
    },
    afterFetchUpdate() {
      this.chemistrylimits = this.fromVuex("chemistrylimits")
      this.loading = false
    },
    load() {
      this.fetchEntities([
        "chemistrylimits",
      ], this.afterFetchUpdate)
    },
    refresh() {
      this.loading = true
      this.load()
    },
    setFieldArea(fieldId) {
      if (!fieldId) {
        this.fieldMaxArea = 0
        return;
      }
      let field = deepClone(this.fields).find(f => f.id == fieldId)
      this.fieldMaxArea = field.area
    },
    extractExtraInfoFromSeedlimit(seedLimitId) {
      if (!seedLimitId) {
        this.seedlimitMaxArea = 0
        return;
      }
      let seedlimit = deepClone(this.seedlimits).find(s => s.id == seedLimitId);
      this.seedlimitMaxArea = seedlimit.area
      this.item.fieldArea = seedlimit.area;
      this.item.fieldName = seedlimit.fieldName;
      this.item.cultureName = seedlimit.cultureName;
    },
    addToCCP(initial) {
      if (!initial) {
        this.$refs.ruleForm.validateField("chemistryChemicalTreatments[0].normative");
      }
      if (this.isValid.normative || initial) {
        this.item.chemistryChemicalTreatments.splice(0, 0, {})
        this.updateCLWT()
      }
    },
    removeCP(index) {
      this.item.chemistryChemicalTreatments.splice(index, 1)
      this.updateCLWT()
    },
    getCPName(id) {
      let chemicalpreparation = this.chemicalpreparations.find(сp => сp.id === id)
      let name = chemicalpreparation && chemicalpreparation.name || "Не выбрано"
      return name
    },
    updateCLWT() {
      let isHerbicide = this.getHerbicideIndicator()
      if (this.isHerbicide != isHerbicide && !isHerbicide) {
        this.item.chemistryLimitWeedTypes = [{}]
      }
      this.isHerbicide = isHerbicide
    },
    getHerbicideIndicator() {
      let herbicideIds = this.chemicalpreparations.filter(cp => cp.chemicalPreparationTypeId == 2).map(cp => cp.id)
      return this.item.chemistryChemicalTreatments
        .map(cct => cct.chemicalPreparationId)
        .some(cctId => herbicideIds.includes(cctId))
    },
    addToCLWT() {
      this.item.chemistryLimitWeedTypes.splice(0, 0, {})
    },
    removeWeed(index) {
      this.item.chemistryLimitWeedTypes.splice(index, 1)
    },
    getWeedName(id) {
      let weed = this.weeds.find(w => w.id === id)
      let name = weed && weed.name || "Не выбрано"
      return name
    },
    setWeedAmount() {
      this.item.chemistryLimitWeedTypes[0].weedAmount = 0
    },
    setFieldWorkIndicator(workId) {
      if (workId) {
        this.isFieldWork = this.works.find(w => w.id == workId).isFieldWork
      } else {
        this.isFieldWork = false
      }
    },
    setNormative() {
      let cct = this.item.chemistryChemicalTreatments[0]
      let cpId = cct.chemicalPreparationId
      if (cpId) {
        let chemicalpreparation = this.chemicalpreparations.find(cp => cp.id == cpId)
        let cp = deepClone(chemicalpreparation)
        this.minNorm = cp.minNorm || 0
        this.maxNorm = cp.maxNorm || Number.MAX_SAFE_INTEGER
        cct.normative = cp && cp.minNorm || 0
      }
    },
    submit() {
      this.$refs.ruleForm.validateField("area");
      if (this.isValid.area) {
        this.save()
      }
    },
    save() {
      this.loadingItem.save = true
      let body = deepClone(this.item)
      body.chemistryChemicalTreatments.splice(0, 1)
      body.chemistryLimitWeedTypes.splice(0, 1)
      if (this.mode == "edit") {
        let item = {}
        Object.keys(this.item).forEach(key => {
          if (Object.keys(this.chemistrylimits[0]).includes(key)) item[key] = body[key]
        })
        body = item
      }
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      let httpMethod = (this.mode == "edit") ? "put" : "post"
      http[httpMethod](`chemistrylimits/${this.$root.context.organization}`, body)
        .then(() => {
          this.loadingItem.save = false
          this.reset()
          this.refresh()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    edit(id) {
      this.$el.scrollTop = 0
      this.mode = "edit"
      this.item = deepClone(this.chemistrylimits.find(cl => cl.id == id))
      this.addToCCP(true)
      this.addToCLWT()
    },
    switchToCreate() {
      this.reset()
    },
    reset() {
      this.mode = "create"
      this.isHerbicide = false
      this.item = {
        chemistryChemicalTreatments: [{}],
        chemistryLimitWeedTypes: [{}],
      }
    },
    remove(id) {
      this.$confirm('Действительно удалить?', 'Внимание', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        http.delete(`chemistrylimits/${id}`)
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
      let filename, api
      api = "ChemistryLimitCardForm"
      filename = "Лимитно-заборная карта за "
      let name = filename + moment(body.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
      http.downloadPDF(api, body, name)
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
      http.downloadPDF("ChemistryLimitInvoiceForm", body, name)
        .then(() => {
          this.loadingItem.nakladnaya = false
        })
    },
    exportTable() {
      let api = "ChemistryLimitAllForm";
      let filename = "Расчет химии";
      let body = {organizationId: this.$root.context.organization};
      http.downloadPDF(api, body, filename);
    },
  }
}
</script>
<style lang="stylus" scoped>
.form-btn
  width fit-content
.form-input
  width 193px
  max-width 193px
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
.tags
  margin 0 0 15px 0
  .el-tag
    margin 0 5px 5px 0
</style>
