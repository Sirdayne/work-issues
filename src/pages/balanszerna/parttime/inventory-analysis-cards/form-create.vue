<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Новая карточка", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item")
    el-form-item(label="Дата начала", prop="dateTime")
      el-date-picker(v-model="item.dateTime", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату", @change="resetWarehouse")
    el-form-item.form-item-iterable(label="Цель анализа", prop="analysisCardType")
      el-select(v-model.number="item.analysisCardType", filterable, clearable)
        el-option(v-for="a in analysiscardtypes", :label="a.name", :value="a.id", :key="a.id")
    el-form-item.form-item-iterable(label="ТОК")
      el-select(v-model.number="warehouseId", filterable, clearable, :disabled="!item.dateTime", @change="setStorages")
        el-option(v-for="w in warehouses", :label="w.name", :value="w.id", :key="w.id")
    template(v-if="storages.length")
      el-form-item.form-item-iterable(label="Склад")
        el-select(v-model.number="storageId", filterable, clearable, @change="getInventory")
          el-option(v-for="s in storages", :label="s.name", :value="s.id", :key="s.id")
    template(v-if="inventories.length")
      el-form-item.form-item-iterable(label="Партия", prop="inventoryId")
        el-select(v-model.number="item.inventoryId", filterable, clearable, @change="getInventoryQualityTypeValues")
          el-option(v-for="i in inventories", :label="i.name", :value="i.inventoryId", :key="i.inventoryId")
    template(v-if="inventoryQualityTypeValues.length")
      el-form-item.form-item-iterable(label="Вид качества")
        el-select(v-model.number="qualityTypeId", filterable, clearable, @change="getQualityTypeValueCodes")
          el-option(v-for="i in inventoryQualityTypeValues", :label="getQualityTypeName(i.qualityTypeId)", :value="i.qualityTypeId", :key="i.qualityTypeId")
    template(v-if="qualityTypeId && item.qualityTypeValues[qualityTypeValuesIndex]")
      template(v-if="qualityTypeValueCodes.length")
        el-form-item.form-item-iterable(label="Степень качества")
          el-select(v-model.number="item.qualityTypeValues[qualityTypeValuesIndex].qualityTypeValueCodeId", filterable, clearable)
            el-option(v-for="q in qualityTypeValueCodes", :label="q.name", :value="q.id", :key="q.id")
      template(v-else)
        el-form-item(label="Значение")
          el-input.form-input(type="number", v-model.number="item.qualityTypeValues[qualityTypeValuesIndex].value", min="0")
    el-form-item.form-item-iterable(label="Лаборант", prop="cropBalanceUserId")
      el-select(v-model.number="item.cropBalanceUserId", filterable, clearable)
        el-option(v-for="c in cropbalanceusers", :label="getFullName(c)", :value="c.id", :key="c.id")
    el-form-item(label="Вес")
      el-input.form-input(type="number", v-model.number="item.weight", min="0")
    el-form-item(label="Масса пробы")
      el-input.form-input(type="number", v-model.number="item.sampleWeight", min="0")
    el-form-item(align="center")
      el-button.form-btn(type="primary", @click="submit()", :loading="loadingItem.save") Сохранить
</template>

<script>
import InventoryAnalysisCardsFormMixin from "./form-mixin"
import http from "services/http"
import {deepClone} from "lib/utils"
import moment from "moment"

export default {
  name: "InventoryAnalysisCardsFormCreate",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
  },
  mixins: [
    InventoryAnalysisCardsFormMixin
  ],
  data() {
    return {
      item: {
        dateTime: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
        qualityTypeValues: [],
      },
    }
  },
  created() {
  },
  methods: {
    save() {
      this.loadingItem.save = true
      this.create()
    },
    create() {
      let body = deepClone(this.item)
      this.removeNullValues(body)
      body.dateTime = moment(body.dateTime).format("YYYY-MM-DDTHH:mm:ss")
      this.saved.items = []
      http.post(`inventoryanalysiscards/${this.$root.context.organization}`, body)
        .then(() => {
          this.loadingItem.save = false
          this.$emit("saved", deepClone(this.saved))
          this.close()
          this.$nextTick(() => this.$emit("updated"))
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    reset() {
      this.resetWarehouse()
      this.resetQualityType()
      this.item = {
        dateTime: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
        qualityTypeValues: [],
      }
    },
    close() {
      this.reset()
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
.organizationToggler
  float right
  margin-right 40px
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
.form-btn
  width fit-content
.form-input
  width 193px
  max-width 193px
</style>
