<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="formVisible", title="Редактирование", size="tiny", top="50px", :before-close="handleClose")
  el-form(:label-position="'top'", :model="item", :rules="rules", ref="ruleForm")
    el-form-item(label="Дата", prop="date")
      el-date-picker(v-model="item.date", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item.form-item-iterable(label="Работа")
      el-select(v-model="item.workTypeParameterPlanWorkTypeId", filterable, clearable, @change="onWorkChange")
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    el-form-item.form-item-iterable(label="Посев")
      el-select(v-model="item.seedLimitId", filterable, clearable, @change="extractExtraInfoFromSeedlimit")
        el-option(v-for="s in filteredEditSeedlimits", :key="s.id", :label="s.displayString", :value="s.id")
    el-form-item.form-item-iterable(label="Препараты")
      el-select(v-model="item.chemistryChemicalTreatments[0].chemicalPreparationId", filterable, clearable, @change="setNormative()")
        el-option(v-for="cp in chemicalpreparations", :label="cp.name", :value="cp.id", :key="cp.id")
    el-form-item(label="Норма препарата", prop="chemistryChemicalTreatments[0].normative")
      el-input.form-input(type="number", v-model.number="item.chemistryChemicalTreatments[0].normative", :min="minNorm", :max="maxNorm", :step="0.001", :disabled="!item.chemistryChemicalTreatments[0].chemicalPreparationId")
      el-button(@click="addToCCP()", :disabled="!item.chemistryChemicalTreatments[0].chemicalPreparationId") Добавить
    div.tags
      el-tag(v-for="(item, index) in item.chemistryChemicalTreatments.slice(1)",
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
import FertilizerLimitsFormMixin from "./form-mixin"
import {fromVuex} from "services/RecordsLoader"
import http from "services/http"
import moment from "moment"
import {deepClone} from "lib/utils"
import {uniq} from "lib/utils"

export default {
  name: "FertilizerLimitsFormEdit",
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
    FertilizerLimitsFormMixin,
  ],
  data() {
    return {
      chemistrylimits: [],
      filteredEditSeedlimits: [],
      itemClone: {},
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
      this.chemistrylimits = fromVuex("chemistrylimits")
      this.item = deepClone(this.chemistrylimits.find(cl => cl.id == id))
      this.itemClone = deepClone(this.item)
      this.onWorkChange(this.item.workTypeParameterPlanWorkTypeId)
      this.addToCCP(true)
    },
    onWorkChange(workId) {
      this.filterSeedlimitsByWork(workId)
      let cond = workId == this.itemClone.workTypeParameterPlanWorkTypeId
      this.setFilteredEditSeedlimits(this.itemClone.seedLimitId, cond)
    },
    setFilteredEditSeedlimits(seedLimitId, cond) {
      let filteredSeedlimits = deepClone(this.filteredSeedlimits)
      if (cond) {
        let seedlimit = this.seedlimits.find(s => s.id == seedLimitId)
        if (seedlimit) filteredSeedlimits.push(seedlimit)
      }
      this.filteredEditSeedlimits = uniq(filteredSeedlimits).sort((a, b) => a.id - b.id)
    },
    switchToCreate() {
      this.reset()
      this.close()
    },
    save() {
      this.loadingItem.save = true
      let body = deepClone(this.item)
      body.chemistryChemicalTreatments.splice(0, 1)
      let item = deepClone(this.chemistrylimits.find(cl => cl.id == this.assignmentId))
      Object.keys(this.item).forEach(key => item[key] = body[key])
      body = item
      body.date = moment(body.date).format("YYYY-MM-DDTHH:mm:ss")
      this.saved.items = []
      http.put(`chemistrylimits/${this.$root.context.organization}`, body)
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
        chemistryChemicalTreatments: [{}],
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
