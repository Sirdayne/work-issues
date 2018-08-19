<template lang="pug">
el-dialog(:visible="visible", title="Фильтр", size="tiny", :before-close="handleClose")
  el-form(label-position="top")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату", :clearable="dateClearable", :picker-options="pickerOptions")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату", :clearable="dateClearable", :picker-options="pickerOptions")
    el-form-item(label="Цель анализа")
      el-select.form-item-iterable(v-model="filterModel.analysisCardTypeIds", filterable, multiple)
        el-option(v-for="a in filterModelData.analysiscardtypes", :label="a.name", :value="a.id", :key="a.id")
    el-form-item(label="Культура")
      el-select.form-item-iterable(v-model="filterModel.cultureIds", filterable, multiple)
        el-option(v-for="c in filterModelData.cultures", :label="c.name", :value="c.name", :key="c.id")
    el-form-item(label="Тип продукции")
      el-select.form-item-iterable(v-model="filterModel.finalProductTypeIds", filterable, multiple)
        el-option(v-for="f in filterModelData.finalproducttypes", :label="f.name", :value="f.name", :key="f.id")
    el-form-item(label="Склад")
      el-select.form-item-iterable(v-model="filterModel.storageIds", filterable, multiple)
        el-option(v-for="s in filterModelData.storages", :label="s.name", :value="s.id", :key="s.id")
    el-form-item(label="ТОК")
      el-select.form-item-iterable(v-model="filterModel.warehouseIds", filterable, multiple)
        el-option(v-for="w in filterModelData.warehouses", :label="w.name", :value="w.id", :key="w.id")
    el-form-item
      el-button-group
        el-button(@click="applyFilter()", type="primary") Применить
        el-button(@click="clearFilter()") Сбросить
</template>

<script>
import {fromVuex} from "services/RecordsLoader"
import moment from "moment"
import {deepClone} from "lib/utils"

export default {
  name: "InventoryAnalysisCardsFilter",
  props: {
    "filterVisible": {
      type: Boolean,
      default: false,
    },
  },
  mixins: [

  ],
  data() {
    return {
      visible: false,
      filterModel: {
        from: new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(10, "days")),
        till: new Date(moment().set({"year": this.$root.context.year}).endOf("day")),
        analysisCardTypeIds: [],
        cultureIds: [],
        finalProductTypeIds: [],
        storageIds: [],
        warehouseIds: [],
      },
      filterModelData: {
        analysiscardtypes: [],
        cultures: [],
        finalproducttypes: [],
        storages: [],
        warehouses: [],
      },
      dateClearable: false,
      pickerOptions: {
        disabledDate: this.disabledDate,
      },
    }
  },
  watch: {
    ["filterVisible"](val, oldVal) {
      this.visible = val
    },
  },
  created() {
    this.initFilter()
    this.applyFilter()
  },
  methods: {
    initFilter() {
      this.filterModelData.analysiscardtypes = fromVuex("analysiscardtypes")
      this.filterModelData.cultures = fromVuex("cultures")
      this.filterModelData.finalproducttypes = fromVuex("finalproducttypes")
      this.filterModelData.storages = fromVuex("storages")
      this.filterModelData.warehouses = fromVuex("warehouses")
    },
    applyFilter() {
      this.checkDates()
      this.$emit("apply", deepClone(this.filterModel))
      this.close()
    },
    clearFilter() {
      this.filterModel.from = new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(10, "days"))
      this.filterModel.till = new Date(moment().set({"year": this.$root.context.year}).endOf("day"))
      this.filterModel.analysisCardTypeIds = []
      this.filterModel.cultureIds = []
      this.filterModel.finalProductTypeIds = []
      this.filterModel.storageIds = []
      this.filterModel.warehouseIds = []
      this.applyFilter()
    },
    disabledDate(date) {
      return moment(date).year() != this.$root.context.year
    },
    checkDates() {
      if (!this.filterModel.from) {
        this.filterModel.from = new Date(moment().set({"year": this.$root.context.year}).startOf("year"))
      }
      if (!this.filterModel.till) {
        this.filterModel.till = new Date(moment().set({"year": this.$root.context.year}).endOf("year"))
      }
    },
    close() {
      this.visible = false
      this.$emit("closed")
    },
    handleClose(done) {
      this.close()
      done()
    }
  }
}
</script>

<style lang="stylus" scoped>
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
</style>
