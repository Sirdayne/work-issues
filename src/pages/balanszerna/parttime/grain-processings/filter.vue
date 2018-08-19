<template lang="pug">
el-dialog(:visible="visible", title="Фильтр", size="tiny", :before-close="handleClose")
  el-form(label-position="top")
    el-form-item(label="Дата от")
      el-date-picker(v-model="filterModel.from", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату", :clearable="dateClearable", :picker-options="pickerOptions")
    el-form-item(label="Дата до")
      el-date-picker(v-model="filterModel.till", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату", :clearable="dateClearable", :picker-options="pickerOptions")
    el-form-item(label="Тип подработки")
      el-select.form-item-iterable(v-model="filterModel.grainProcessingTypeIds", filterable, multiple)
        el-option(v-for="a in filterModelData.grainprocessingtypes", :label="a.name", :value="a.id", :key="a.id")
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
  name: "GrainProcessingsFilter",
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
        from: new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days")),
        till: new Date(moment().set({"year": this.$root.context.year}).endOf("day")),
        grainProcessingTypeIds: [],
      },
      filterModelData: {
        grainprocessingtypes: [],
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
      this.filterModelData.grainprocessingtypes = fromVuex("grainprocessingtypes")
    },
    applyFilter() {
      this.checkDates()
      this.$emit("apply", deepClone(this.filterModel))
      this.close()
    },
    clearFilter() {
      this.filterModel.from = new Date(moment().set({"year": this.$root.context.year}).startOf("day").subtract(5, "days"))
      this.filterModel.till = new Date(moment().set({"year": this.$root.context.year}).endOf("day"))
      this.filterModel.grainProcessingTypeIds = []
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
