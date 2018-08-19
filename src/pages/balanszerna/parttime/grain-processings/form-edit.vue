<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="visible", title="Редактирование акта подработки ", size="tiny", top="50px", :before-close="handleClose")
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
      el-button.form-btn(type="primary", @click="submit('ruleEditForm')", :loading="loadingItem.save") Сохранить
</template>

<script>
import GrainProcessingsFormMixin from "./form-mixin"
import {fromVuex} from "services/RecordsLoader"
import http from "services/http"
import {deepClone} from "lib/utils"
import moment from "moment"

export default {
  name: "GrainProcessingsFormEdit",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
    "cardId": {
      type: Number,
      default: null,
    },
  },
  mixins: [
    GrainProcessingsFormMixin,
  ],
  data() {
    return {
      visible: false,
      item: {},
    }
  },
  watch: {
    ["cardId"](val, oldVal) {
      if (val) {
        this.edit(val)
      }
      this.visible = !!val
    },
  },
  created() {
  },
  methods: {
    edit(id) {
      this.item = deepClone(fromVuex("grainprocessings").find(g => g.id == id))
    },
    save() {
      this.loadingItem.save = true
      this.update()
    },
    update() {
      let body = deepClone(this.item)
      body.startDate = moment(body.startDate).format("YYYY-MM-DDTHH:mm:ss")
      if (body.endDate) {
        body.endDate = moment(body.endDate).format("YYYY-MM-DDTHH:mm:ss")
      } else {
        delete body.endDate
      }
      this.saved.items = []
      http.put(`grainprocessings/${this.$root.context.organization}`, body)
        .then(() => {
          this.saved.items.push(body.id)
          this.loadingItem.save = false
          this.close()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    close() {
      if (this.saved.items.length) {
        this.$emit("saved", deepClone(this.saved))
        this.saved.items = []
      }
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
