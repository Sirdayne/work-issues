<template lang="pug">
el-dialog(:visible="visible", title="Фильтр", size="tiny", :before-close="handleClose")
  el-form(:model="filterModel", label-width="90px")
    el-form-item(label="Поля")
      el-select.form-item-iterable(v-model="filterModel.fieldIds", multiple, filterable)
        el-option(v-for="s in filterModelData.fields", :label="s.displayString", :value="s.id", :key="s.id")
    el-form-item(label="Культуры")
      el-select.form-item-iterable(v-model="filterModel.cultureIds", multiple, filterable)
        el-option(v-for="s in filterModelData.cultures", :label="s.name", :value="s.id", :key="s.id")
    el-form-item
      el-button-group
        el-button(@click="applyFilter()", type="primary") Применить
        el-button(@click="clearFilter()") Сбросить
</template>
<script>
import {fromVuex} from "services/RecordsLoader"
import {deepClone} from "lib/utils"

export default {
  name: "SeedLimitsFilter",
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
        fieldIds: [],
        cultureIds: [],
      },
      filterModelData: {
        fields: [],
        cultures: [],
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
      this.filterModelData.fields = fromVuex("fields")
      this.filterModelData.cultures = fromVuex("cultures")
    },
    applyFilter() {
      this.$emit("apply", deepClone(this.filterModel))
      this.close()
    },
    clearFilter() {
      this.filterModel.fieldIds = []
      this.filterModel.cultureIds = []
      this.applyFilter()
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
