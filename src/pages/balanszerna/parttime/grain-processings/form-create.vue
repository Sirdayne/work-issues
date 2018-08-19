<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Новый акт подработки", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item")
    el-form-item(label="Дата начала", prop="startDate")
      el-date-picker(v-model="item.startDate", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Дата завершения", prop="endDate")
      el-date-picker(v-model="item.endDate", format="dd.MM.yyyy HH:mm", placeholder="Выберите дату")
    el-form-item(label="Тип подработки")
      el-select.form-item-iterable(v-model.number="item.grainProcessingType", filterable, clearable)
        el-option(v-for="g in grainprocessingtypes", :label="g.name", :value="g.id", :key="g.id")
    el-form-item(label="Оборудование")
      el-select.form-item-iterable(v-model.number="item.equipmentId", filterable, clearable)
        el-option(v-for="e in equipments", :label="e.name", :value="e.id", :key="e.id")
    el-form-item(label="Номер(до подработки)")
      el-select.form-item-iterable(v-model.number="item.firstInventoryAnalysisCardId", filterable, clearable)
        el-option(v-for="i in inventoryanalysiscardsbefore", :label="i.number", :value="i.id", :key="i.id")
    el-form-item(label="Номер(после подработки)")
      el-select.form-item-iterable(v-model.number="item.secondInventoryAnalysisCardId", filterable, clearable)
        el-option(v-for="i in inventoryanalysiscardsafter", :label="i.number", :value="i.id", :key="i.id")
    el-form-item(align="center")
      el-button.form-btn(type="primary", @click="submit()", :loading="loadingItem.save") Сохранить
</template>

<script>
import GrainProcessingsFormMixin from "./form-mixin"
import http from "services/http"
import {deepClone} from "lib/utils"
import moment from "moment"

export default {
  name: "GrainProcessingsFormCreate",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
  },
  mixins: [
    GrainProcessingsFormMixin
  ],
  data() {
    return {
      item: {
        startDate: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
        endDate: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
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
      body.startDate = moment(body.startDate).format("YYYY-MM-DDTHH:mm:ss")
      if (body.endDate) {
        body.endDate = moment(body.endDate).format("YYYY-MM-DDTHH:mm:ss")
      } else {
        delete body.endDate
      }
      this.saved.items = []
      http.post(`grainprocessings/${this.$root.context.organization}`, body)
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
      this.item = {
        startDate: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
        endDate: new Date(moment().set({"year": this.$root.context.year, "hour": 9}).startOf("hour")),
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
