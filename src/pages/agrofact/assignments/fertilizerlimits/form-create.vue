<template lang="pug">
div
  h3 Новая запись
  el-form(:inline="true", :label-position="'top'", :model="item", :rules="rules", ref="ruleForm")
    el-form-item(label="Дата", prop="date")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Работа")
      el-select(v-model="item.workTypeParameterPlanWorkTypeId", filterable, clearable, @change="filterSeedlimitsByWork")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    el-form-item.form-item-iterable(label="Посев")
      el-select(v-model="item.seedLimitId", filterable, clearable, @change="extractExtraInfoFromSeedlimit")
        el-option(v-for="s in filteredSeedlimits", :key="s.id", :label="s.displayString", :value="s.id")
    div
    el-form-item.form-item-iterable(label="Препараты")
      el-select(v-model="item.chemistryChemicalTreatments[0].chemicalPreparationId", filterable, clearable, @change="setNormative()")
        el-option(v-for="cp in chemicalpreparations", :label="cp.name", :value="cp.id", :key="cp.id")
    el-form-item.invisible-color(label=".", prop="chemistryChemicalTreatments[0].normative")
      el-input.form-input(type="number", v-model.number="item.chemistryChemicalTreatments[0].normative", :min="minNorm", :max="maxNorm", :step="0.001", :disabled="!item.chemistryChemicalTreatments[0].chemicalPreparationId")
    el-form-item.invisible-color(label=".")
      el-button(@click="addToCCP()", :disabled="!item.chemistryChemicalTreatments[0].chemicalPreparationId") Добавить
    div.tags
      el-tag(v-for="(item, index) in item.chemistryChemicalTreatments.slice(1)",
      :key="index"
      type="primary",
      :closable="true",
      @close="removeCP(index + 1)")
        | {{ getCPName(item.chemicalPreparationId) }}
        b  ( {{ item.normative }} )
    div
    el-button.form-btn(type="primary", @click="save()", :loading="loadingItem.save") Сохранить
</template>
<script>
import FertilizerLimitsFormMixin from "./form-mixin"
import http from "services/http"
import moment from "moment"
import {deepClone} from "lib/utils"

export default {
  name: "FertilizerLimitsFormCreate",
  mixins: [
    FertilizerLimitsFormMixin,
  ],
  data() {
    return {
    }
  },
  created() {
  },
  methods: {
    save() {
      this.loadingItem.save = true
      let body = deepClone(this.item)
      body.chemistryChemicalTreatments.splice(0, 1)
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      this.saved.items = []
      http.post(`chemistrylimits/${this.$root.context.organization}`, body)
        .then((data) => {
          this.saved.items.push(data.id)
          this.loadingItem.save = false
          this.reset()
          this.close()
        })
        .catch(() => {
          this.loadingItem.save = false
        })
    },
    reset() {
      delete this.item.date
      delete this.item.workTypeParameterPlanWorkTypeId
      delete this.item.seedLimitId
    },
    close() {
      if (this.saved.items.length) {
        this.$emit("saved", deepClone(this.saved))
        this.saved.items = []
      }
    },
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
