<template lang="pug">
div
  el-dialog(:visible.sync="formVisible", title="Редактирование", size="tiny")
    el-form(:model="item", label-position="top")
      template(v-for="cct in item.chemistryChemicalTreatments")
        el-form-item(:label="cct.chemicalPreparationName")
          el-input-number(v-model.number="cct.factNormative", :step="0.001")
      el-form-item(align="center")
        el-button(@click="save()", type="primary", :loading="loadingItem.save") Сохранить
  el-form(:inline="true", :label-position="'top'")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy", placeholder="Выберите дату", @change="applyFilter")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy", placeholder="Выберите дату", @change="applyFilter")
    el-form-item(label="Бригада")
      el-select(v-model="filterModel.brigadeId", clearable, placeholder="Выбрать", @change="applyFilter")
        el-option(v-for="b in brigades", :key="b.id", :label="b.name", :value="b.id")
    el-form-item(label="Культура")
      el-select(v-model="filterModel.culture", clearable, placeholder="Выбрать", filterable, @change="applyFilter")
        el-option(v-for="c in cultures", :key="c.id", :label="c.name", :value="c.name")
    el-form-item(label="Препараты")
      el-select(v-model="filterModel.chemical", clearable, placeholder="Выбрать", filterable, @change="applyFilter")
        el-option(v-for="c in chemicals", :key="c.id", :label="c.name", :value="c.id")
  el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
    el-form(:model="filterModel", label-width="70px", label-position="left")
      el-form-item(label="Поле")
        el-select(v-model="filterModel.field", clearable, filterable)
          el-option(v-for="item in fields", :label="item.newName", :value="item.id", :key="item.id")
      el-form-item(label="Вид работы")
        el-select(v-model="filterModel.work", clearable, filterable)
          el-option(v-for="item in works", :label="item.name", :value="item.id", :key="item.id")
      el-form-item
        el-button(type="primary", @click="applyFilter") Применить
        el-button(@click="nullFilter") Сбросить
  h2 Акт списания химии
    span(:style="{marginRight: '30px'}")
    el-button.filter(@click="filterUnfolded = true", type="default", title="Фильтр") .
    el-button.excel(type="default", @click="exportTable()") .
    filter-cols(:cols="cols")
  .el-table-cont
    el-table(
      :data="paginate(tableData)",
      resizable,
      border,
      v-loading="loading",
    ).content
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :width="col.width", :key="col.prop", header-align="center")
      el-table-column(label="Препараты", header-align="center")
        template(v-for="cct in chemistryChemicalTreatmentsUnique")
          el-table-column(:label="cct.chemicalPreparationName", header-align="center")
            el-table-column(label="расход на га", header-align="center")
              el-table-column(label="норма", header-align="center")
                template(slot-scope="scope")
                  span {{getValue(cct.chemicalPreparationId, scope.row, 'normative')}}
              el-table-column(label="факт", header-align="center")
                template(slot-scope="scope")
                  span {{getValue(cct.chemicalPreparationId, scope.row, 'factNormative')}}
            el-table-column(label="ед. изм", header-align="center")
              template(slot-scope="scope")
                span {{getValue(cct.chemicalPreparationId, scope.row, 'units')}}
            el-table-column(label="отклонение, кг", header-align="center")
              template(slot-scope="scope")
                span {{getValue(cct.chemicalPreparationId, scope.row, 'deviation')}}
            el-table-column(label="итого расход", header-align="center", width="120")
              template(slot-scope="scope")
                span {{getValue(cct.chemicalPreparationId, scope.row, 'factTotal')}}
      el-table-column(header-align="center", align="center", width="90")
        template(slot-scope="scope")
          el-button(@click="edit(scope.row.id)", size="small", icon="edit", title="Редактировать")
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
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import paginate from "mixins/paginate"
import moment from "moment"
import filterCols from "components/filterCols"
import {deepClone} from "lib/utils"

export default {
  components: {
    filterCols
  },
  mixins: [
    
    paginate
  ],
  data() {
    return {
      cols: [
        {prop: "dateFormated", label: "Дата обработки", width: 110, active: true},
        {prop: "fieldName", label: "Поле", width: 180, active: true},
        {prop: "workName", label: "Вид работы", width: 180, active: true},
        {prop: "cultureName", label: "Культура", width: 180, active: true},
        {prop: "area", label: "Площадь обработки, га", width: 120, active: true}
      ],
      filterModel: {
        from: moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days"),
        till: moment().set({"year": this.$root.context.year}).endOf("day"),
        brigadeId: null,
        culture: "",
        chemical: "",
      },
      filterUnfolded: false,
      brigades: [],
      cultures: [],
      chemicals: [],
      fields: [],
      works: [],
      chemistrylimitfact: [],
      chemistryChemicalTreatmentsUnique: [],
      tableData: [],
      perPage: 5,
      currentPage: 1,
      loading: true,
      loadingItem: {
        save: false,
      },
      formVisible: false,
      item: {},
    }
  },
  created() {
    this.loading = true
    fetchEntities([
      "brigades",
      "cultures",
      "chemicals",
      "fields",
      "works",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.cultures = fromVuex("cultures")
      this.brigades = fromVuex("brigades")
      if (this.brigades && this.brigades.length) this.filterModel.brigadeId = this.brigades[0].id
      this.fields = fromVuex("fields")
      this.chemicals = fromVuex("chemicals")
      this.works = fromVuex("works")
      this.getCLF()
    },
    getCLF() {
      http.getWithoutCache(`chemistrylimitfact/${this.$root.context.organization}/${this.$root.context.year}`)
        .then(data => {
          this.setCLF(data)
        })
        .catch(() => {
          this.setCLF([])
        })
    },
    setCLF(data) {
      this.chemistrylimitfact = data.map(clf => {
        clf.dateFormated = moment(clf.date).format("DD.MM.YYYY")
        return clf
      })
      this.setTableData()
      this.loading = false
    },
    setTableData() {
      let tableData = this.chemistrylimitfact.filter(clf => {
        let from = !this.filterModel.from || moment(clf.date, "YYYY-MM-DDTHH:mm:ss").isSameOrAfter(moment(this.filterModel.from))
        let till = !this.filterModel.till || moment(clf.date, "YYYY-MM-DDTHH:mm:ss").isSameOrBefore(moment(this.filterModel.till))
        let date = from && till
        let brigade = clf.brigadeId == this.filterModel.brigadeId || !this.filterModel.brigadeId
        let chemical = clf.chemistryChemicalTreatments.some(c => c.chemicalPreparationId == this.filterModel.chemical) || !this.filterModel.chemical
        let culture = clf.cultureName == this.filterModel.culture || !this.filterModel.culture
        let field = clf.fieldId == this.filterModel.field || !this.filterModel.field
        let work = clf.subOperationId == this.filterModel.work || !this.filterModel.work
        return date && brigade && chemical && culture && field && work
      })
      this.getCCT(tableData)
      this.tableData = tableData
    },
    getCCT(data) {
      let chemistryChemicalTreatments = []
      data.forEach(clf => {
        clf.chemistryChemicalTreatments.forEach(clfcct => {
          let cctIds = chemistryChemicalTreatments.map(cct => cct.chemicalPreparationId)
          if (!cctIds.includes(clfcct.chemicalPreparationId)) {
            chemistryChemicalTreatments.push({
              chemicalPreparationId: clfcct.chemicalPreparationId,
              chemicalPreparationName: clfcct.chemicalPreparationName,
            })
          }
        })
      })
      this.chemistryChemicalTreatmentsUnique = chemistryChemicalTreatments
    },
    getValue(id, row, key) {
      let foundCct = row.chemistryChemicalTreatments.find(cct => cct.chemicalPreparationId == id)
      let result = foundCct && foundCct[key] !== undefined ? foundCct[key] : ""
      return result
    },
    applyFilter(){
      this.setTableData()
      this.filterUnfolded = false
    },
    nullFilter(){
      this.filterModel.field = null
      this.filterModel.work = null
      this.applyFilter()
    },
    edit(id) {
      this.item = deepClone(this.chemistrylimitfact.find(clf => clf.id == id))
      this.formVisible = true
    },
    save() {
      this.formVisible = false
      this.loadingItem.save = true
      http.put(`chemistrylimitfact/${this.$root.context.organization}/${this.$root.context.year}`, this.item)
        .then(() => {
          this.reset()
          this.refresh()
        })
        .catch(() => {
          this.reset()
        })
    },
    reset() {
      this.loadingItem.save = false
      this.item = {}
    },
    refresh() {
      this.loading = true
      this.getCLF();
    },
    exportTable() {
      let endpoint        = "ChemistryLimitFactForm";
      let filename        = "Акт списания химии";

      let body = {
        OrganizationId: this.$root.context.organization,
        Date: {
          start: moment(this.filterModel.from).format("YYYY-MM-DDTHH:mm:ss"),
          end: moment(this.filterModel.till).format("YYYY-MM-DDTHH:mm:ss"),
        },
        BrigadeId: this.filterModel.brigadeId
      };

      http.downloadXLS(endpoint, body, filename);
    },
  }
}
</script>
