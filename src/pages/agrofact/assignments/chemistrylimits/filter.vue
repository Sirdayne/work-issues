<template lang="pug">
el-dialog(:visible="visible", title="Фильтр", size="tiny", :before-close="handleClose")
  el-form(:model="filterModel", label-width="90px")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy", placeholder="Выберите дату", :clearable="dateClearable", :picker-options="pickerOptions")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy", placeholder="Выберите дату", :clearable="dateClearable", :picker-options="pickerOptions")
    el-form-item(label="Посевы")
      el-select.form-item-iterable(v-model="filterModel.seedlimitsIds", multiple, filterable, clearable)
        el-option(v-for="s in filterModelData.seedlimits", :label="s.displayString", :value="s.id", :key="s.id")
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
  name: "ChemistryLimitsFilter",
  props: {
    "filterVisible": {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
      filterModel: {
        from: new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(10, "days")),
        till: new Date(moment().set({"year": this.$root.context.year}).endOf("day")),
        seedlimitsIds: [],
      },
      filterModelData: {
        seedlimits: [],
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
      this.filterModelData.seedlimits = fromVuex("seedlimits")
    },
    applyFilter() {
      this.checkDates()
      this.$emit("apply", deepClone(this.filterModel))
      this.close()
    },
    clearFilter() {
      this.filterModel.from = new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(10, "days"))
      this.filterModel.till = new Date(moment().set({"year": this.$root.context.year}).endOf("day"))
      this.filterModel.seedlimitsIds = []
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
