<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Новый приказ", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item")
    el-form-item(label="Дата", prop="date")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Культура")
      el-select(v-model.number="item.cultureId", filterable, clearable, @change="setSorts")
        el-option(v-for="c in cultures", :label="c.name", :value="c.id", :key="c.id")
    el-form-item(label="Тип продукции")
      el-select.form-item-iterable(v-model.number="finalProductTypeId", filterable, clearable, change="resetProductCategory")
        el-option(v-for="f in finalproducttypes", :label="f.name", :value="f.id", :key="f.id")
    template(v-if="finalProductTypeId")
      template(v-if="finalProductTypeId == 1")
        el-form-item.form-item-iterable(label="Готовая продукция")
          el-select(v-model.number="item.categoryId", filterable, clearable)
            el-option(v-for="f in finalproducts", :label="f.name", :value="f.id", :key="f.id")
      template(v-else-if="finalProductTypeId == 2")
        el-form-item.form-item-iterable(label="Сорт")
          el-select(v-model.number="item.sortId", filterable, clearable)
            el-option(v-for="s in sorts", :label="s.name", :value="s.id", :key="s.id")
      template(v-else-if="finalProductTypeId == 3")
        el-form-item.form-item-iterable(label="Зерноотходы")
          el-select(v-model.number="item.grainWaste", filterable, clearable)
            el-option(v-for="g in grainwastes", :label="g.name", :value="g.id", :key="g.id")
    el-form-item.form-item-iterable(label="ТОК")
      el-select(v-model.number="warehouseId", filterable, clearable, @change="setStorages")
        el-option(v-for="w in warehouses", :label="w.name", :value="w.id", :key="w.id")
    el-form-item.form-item-iterable(label="Склад")
      el-select(v-model.number="item.storageId", filterable, clearable)
        el-option(v-for="s in storages", :label="s.name", :value="s.id", :key="s.id")
    el-form-item(label="Влажность")
      el-input.form-input(type="number", v-model.number="item.humidity", min="0")
    el-form-item.form-item-iterable(label="Запах")
      el-select(v-model.number="item.qualityTypeValueCodeId", filterable, clearable)
        el-option(v-for="s in smells", :label="s.name", :value="s.id", :key="s.id")
    el-form-item.form-item-iterable(label="Номер карточки")
      el-select(v-model.number="item.inventoryAnalysisCardId", filterable, clearable)
        el-option(v-for="i in inventoryanalysiscards", :label="i.number", :value="i.id", :key="i.id")
    el-form-item(label="Тип отправителя")
      el-select.form-item-iterable(v-model.number="shipperType", filterable, clearable, change="resetShipper")
        el-option(v-for="o in organizationtypes", :label="o.name", :value="o.id", :key="o.id")
    template(v-if="shipperType")
      el-form-item.form-item-iterable(label="Грузоотправитель")
        template(v-if="shipperType == 1")
          el-select(v-model.number="item.shipperId", filterable, clearable)
            el-option(v-for="c in customorganizations", :label="c.name", :value="c.id", :key="c.id")
        template(v-else-if="shipperType == 2")
          el-select(v-model.number="item.shipperOrgId", filterable, clearable)
            el-option(v-for="o in organizations", :label="o.name", :value="o.id", :key="o.id")
    el-form-item(label="Тип получателя")
      el-select.form-item-iterable(v-model.number="consigneeType", filterable, clearable, change="resetConsignee")
        el-option(v-for="o in organizationtypes", :label="o.name", :value="o.id", :key="o.id")
    template(v-if="consigneeType")
      el-form-item.form-item-iterable(label="Грузополучатель")
        template(v-if="consigneeType == 1")
          el-select(v-model.number="item.consigneeId", filterable, clearable)
            el-option(v-for="c in customorganizations", :label="c.name", :value="c.id", :key="c.id")
        template(v-else-if="consigneeType == 2")
          el-select(v-model.number="item.consigneeOrgId", filterable, clearable)
            el-option(v-for="o in organizations", :label="o.name", :value="o.id", :key="o.id")
    el-form-item(label="Объем зерна")
      el-input.form-input(type="number", v-model.number="item.volumeOfGrain", min="0")
    el-form-item(align="center")
      el-button.form-btn(type="primary", @click="submit()", :loading="loadingItem.save") Сохранить
</template>

<script>
import OrderForShipmentFormMixin from "./form-mixin"
import http from "services/http"
import {deepClone} from "lib/utils"
import moment from "moment"

export default {
  name: "OrderForShipmentFormCreate",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
  },
  mixins: [
    OrderForShipmentFormMixin
  ],
  data() {
    return {
      item: {
        date: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
        cropYear: this.$root.context.year,
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
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      this.saved.items = []
      http.post(`orderforshipment/${this.$root.context.organization}`, body)
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
      this.finalProductTypeId = null
      this.shipperType = null
      this.consigneeType = null
      this.resetProductCategory()
      this.resetShipper()
      this.resetConsignee()
      this.item = {
        date: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
        cropYear: this.$root.context.year,
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
