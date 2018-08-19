<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Редактирование", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item")
    el-form-item(label="Дата обработки")
      el-date-picker(v-model="item.dateTime", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Культура")
      el-select(v-model="item.cultureId", filterable, clearable, @change="filterSortsByCulture")
        el-option(v-for="c in cultures", :label="c.name", :value="c.id", :key="c.id")
    el-form-item.form-item-iterable(label="Сорт")
      el-select(v-model="item.cultureSortId", filterable, clearable)
        el-option(v-for="s in sortsByCulture", :label="s.name", :value="s.id", :key="s.id")
    el-form-item.form-item-iterable(label="Репродукция")
      el-select(v-model="item.reproductionId", filterable, clearable)
        el-option(v-for="r in reproductions", :label="r.name", :value="r.id", :key="r.id")
    el-form-item(label="Объем, тонна")
      el-input.form-input(type="number", v-model="item.volume")
    el-form-item.form-item-iterable(label="Протравочная машина")
      el-select(v-model="item.carId", filterable, clearable, @change="filterInstrumentsByCar")
        el-option(v-for="c in cars", :label="c.displayString", :value="c.id", :key="c.id")
    el-form-item.form-item-iterable(label="Орудия")
      el-select(v-model="item.instrumentId", filterable, clearable)
        el-option(v-for="i in filteredInstruments", :label="i.name", :value="i.id", :key="i.id")
    el-form-item.form-item-iterable(label="Баковая смесь")
      el-select(v-model="item.seedMordantChemicalTreatments[0].chemicalPreparationId", filterable, clearable, @change="setNormative()")
        el-option(v-for="cp in chemicalpreparations", :label="cp.name", :value="cp.id", :key="cp.id")
    el-form-item(label="Норма препарата")
      el-input.form-input(type="number", v-model="item.seedMordantChemicalTreatments[0].normative", :min="minNorm", :max="maxNorm", :step="0.001", :disabled="!item.seedMordantChemicalTreatments[0].chemicalPreparationId")
      el-button(@click="addToSMCP()", :disabled="!item.seedMordantChemicalTreatments[0].chemicalPreparationId") Добавить
    div.tags
      el-tag(v-for="(item, index) in item.seedMordantChemicalTreatments.slice(1)",
      :key="index"
      type="primary",
      :closable="true",
      @close="removeCP(index + 1)")
        | {{ getCPName(item.chemicalPreparationId) }}
        b  ( {{ item.normative }} )
    el-form-item(align="center")
      el-button-group
        el-button.form-btn(type="primary", @click="save()", :loading="loadingItem.save") Сохранить
        el-button.form-btn(@click="switchToCreate()") Отменить
</template>
<script>
import SeedMordantFormMixin from "./form-mixin"
import {fromVuex} from "services/RecordsLoader"
import http from "services/http"
import moment from "moment"
import {deepClone} from "lib/utils"

export default {
  name: "SeedMordantFormEdit",
  props: {
    "formVisible": {
      type: Boolean,
      default: false,
    },
    "assignmentId": {
      type: Number,
      default: null,
    },
  },
  mixins: [
    SeedMordantFormMixin,
  ],
  data() {
    return {
      seedmordant: [],
    }
  },
  watch: {
    ["assignmentId"](val, oldVal) {
      if (val) {
        this.edit(val)
      } else {
        this.reset()
      }
    },
  },
  created() {
  },
  methods: {
    edit(id) {
      this.seedmordant = fromVuex("seedmordant")
      this.item = deepClone(this.seedmordant.find(sm => sm.id == id))
      this.filterSortsByCulture()
      this.filterInstrumentsByCar()
      this.addToSMCP()
    },
    switchToCreate() {
      this.reset()
      this.close()
    },
    save() {
      this.loadingItem.save = true
      let body = deepClone(this.item)
      body.seedMordantChemicalTreatments.splice(0, 1)
      let item = {}
      Object.keys(this.item).forEach(key => {
        if (Object.keys(this.seedmordant[0]).includes(key)) item[key] = body[key]
      })
      body = item
      body.dateTime = moment(body.dateTime).format("YYYY-MM-DDTHH:mm:ss")
      this.saved.items = []
      http.put(`seedmordant/${this.$root.context.organization}`, body)
        .then(() => {
          this.saved.items.push(body.id)
          this.loadingItem.save = false
          this.reset()
          this.close()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    reset() {
      this.item = {
        seedMordantChemicalTreatments: [{}],
      }
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
.form-item-iterable {
  flex: 1 0 auto;
  max-width: 193px;
}
.form-btn
  width fit-content
.el-slider
  width 350px
.form-input
  width 193px
  max-width 193px
.tags
  margin -10px -5px 15px -3px
  .el-tag
    margin 3px
</style>
