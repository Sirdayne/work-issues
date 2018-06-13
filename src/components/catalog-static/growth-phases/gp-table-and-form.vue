<template lang="pug">
.grid-content
  .grid-table
    .fx-table(v-if="formTableData.length")
      .fx-row.fx-light-grey.header
        .fx-cell.code(style="font-weight: bold;") Код
        .fx-cell(style="font-weight: bold;") Стадия развития
      template(v-for="ph in formTableData")
        .fx-row.fx-light-grey.header
          .fx-cell(style="font-weight: bold;") {{ph.name}}
        .fx-row(v-for="st in ph.stages")
          .fx-cell.code {{st.code}}
          .fx-cell {{st.name}}
    .no-results(v-else) Нет результатов
  .grid-form
    el-form(:model="newFormItem", label-position="top")
      .h2 Культуры
      div
        el-form-item.form-item
          el-select(v-model="item.cultures", clearable, placeholder="Выбрать", filterable, multiple)
            el-option(
              v-for="c in cultures",
              :key="c.id",
              :label="c.name",
              :value="c.id"
              )
      template(v-if="newFormData.length")
        .h2 Фазы
        el-form-item.form-item
          el-select(v-model="newFormItem.phase", value-key="id", @change="phaseChange()", placeholder="Выбрать", clearable, filterable)
            el-option(
              v-for="ph in newFormData",
              :key="ph.id",
              :label="ph.label()",
              :value="ph"
              )
      el-button-group.form-item-btns
        el-button(type="default", @click="addPhase()", :class="{'neg-left-margin': !newFormData.length}", icon="plus", title="Добавить фазу") {{(newFormData.length) ? '' : 'Добавить фазу'}}
        el-button(v-if="newFormItem.phase", type="default", @click="removePhase()", icon="delete", title="Удалить фазу")
      template(v-if="newFormItem.phase")
        el-form-item.form-item(label="Наименование")
          el-input(v-model="newFormItem.phase.name", @change="phaseNameChange()")
      .h2(v-if="newFormItem.phase") Стадии
      template(v-if="newFormItem.phase && newFormItem.phase.stages.length")
        el-form-item.form-item
          el-select(v-model="newFormItem.stage", value-key="id", placeholder="Выбрать", clearable, filterable)
            el-option(
              v-for="st in newFormItem.phase.stages",
              :key="st.id",
              :label="st.label()",
              :value="st"
              )
      template(v-if="newFormItem.phase")
        el-button-group.form-item-btns
          el-button(type="default", @click="addStage()", :class="{'neg-left-margin': !newFormItem.phase.stages.length}", icon="plus", title="Добавить стадию") {{(newFormItem.phase.stages.length) ? '' : 'Добавить стадию'}}
          el-button(v-if="newFormItem.stage", type="default", @click="removeStage()", icon="delete", title="Удалить стадию")
        template(v-if="newFormItem.stage")
          el-form-item.form-item(label="Код")
            el-input(v-model="newFormItem.stage.code", @change="stageCodeChange()")
          el-form-item.form-item(label="Наименование")
            el-input(v-model="newFormItem.stage.name", @change="stageNameChange()")
      el-form-item
        el-button(type="primary", @click="submit()") Сохранить
</template>
<script>
import {deepClone} from 'lib/utils';

export default {
  name: 'GpTableAndForm',
  props: [
    'data',
    'cultures',
  ],
  data() {
    return {
      item: {},
      newFormItem: {},
      newFormData: [],
      itemUpdated: 1,
      phaseId: 0,
      stageId: 0,
      latestChange: "",
    }
  },
  computed: {
    formTableData() {
      return this.itemUpdated && this.item.phases
    },
  },
  watch: {
    item: {
      handler: function (val, oldVal) {
        this.updateFormData(val)
        this.itemUpdated++
      },
      deep: true,
    },
  },
  created() {
    this.item = deepClone(this.data)
    this.item.phases = []
    this.data.phases.forEach(p => {
      this.addPhase(p.name)
      this.newFormItem.phase = {id: this.phaseId, stages: []}
      p.stages.forEach(s => {
        this.addStage(s.name, s.code)
      })
    })
    this.newFormItem = {}
    this.itemUpdated++
  },
  methods: {
    addPhase(phaseName) {
      this.latestChange = "addPhase"
      this.phaseId++
      let name = phaseName || "Фаза"
      this.item.phases.push({id: this.phaseId, name: name, stages: [], label: function() {
        return this.name
      }})
      this.itemUpdated++
    },
    removePhase() {
      this.latestChange = "removePhase"
      let phase = this.newFormItem.phase
      let index = this.item.phases.findIndex(p => p.id == phase.id)
      this.item.phases.splice(index, 1)
      this.itemUpdated++
    },
    phaseChange() {
      this.newFormItem.stage = undefined
      delete this.newFormItem.stage
    },
    phaseNameChange() {
      this.latestChange = "phaseNameChange"
      let phase = this.item.phases.find(p => p.id == this.newFormItem.phase.id)
      phase.name = this.newFormItem.phase.name
    },
    addStage(stageName, code) {
      this.latestChange = "addStage"
      this.stageId++
      let lastCode = this.item.phases.reduce((sum, p) => sum + p.stages.length, 0)
      let name = stageName || "Стадия"
      let phase = this.item.phases.find(p => p.id == this.newFormItem.phase.id)
      phase.stages.push({id: this.stageId, code: code || lastCode, name: name, label: function() {
        return this.code + " "
      }})
      this.newFormItem.phase.stages = deepClone(phase.stages)
      this.newFormItem.stage = undefined
      delete this.newFormItem.stage
      this.itemUpdated++
    },
    removeStage() {
      this.latestChange = "removeStage"
      let phase = this.item.phases.find(p => p.id == this.newFormItem.phase.id)
      let stage = this.newFormItem.stage
      let index = phase.stages.findIndex(s => s.id == stage.id)
      phase.stages.splice(index, 1)
      this.newFormItem.stage = undefined
      delete this.newFormItem.stage
      this.itemUpdated++
    },
    stageCodeChange() {
      this.latestChange = "stageCodeChange"
      let phase = this.item.phases.find(p => p.id == this.newFormItem.phase.id)
      let stage = phase.stages.find(s => s.id == this.newFormItem.stage.id)
      stage.code = this.newFormItem.stage.code
    },
    stageNameChange() {
      this.latestChange = "stageNameChange"
      let phase = this.item.phases.find(p => p.id == this.newFormItem.phase.id)
      let stage = phase.stages.find(s => s.id == this.newFormItem.stage.id)
      stage.name = this.newFormItem.stage.name
    },
    updateFormData(item) {
      this.newFormData = deepClone(item.phases)
      if (["addPhase", "removePhase"].includes(this.latestChange)) {
        this.newFormItem = {}
      }
    },
    submit() {
      let converted = this.convert(this.item)
      this.$emit('onSubmit', converted)
    },
    convert(converting) {
      let item = deepClone(converting)
      item.phases = {}
      converting.phases.forEach((p, i, arr) => {
        item.phases[i] = {}
        item.phases[i].phaseName = p.name
        item.phases[i].stages = {}
        p.stages.forEach(s => {
          item.phases[i].stages[s.code] = s.name
        })
      })
      return item
    }
  },
}
</script>
<style lang="stylus" scoped>
.fx-table
  width 570px
.fx-cell.code
  max-width 75px
.fx-row:not(.header) .fx-cell
  text-align left
  &.code
    text-align right
.grid-content
  display grid
  grid-template 1fr / auto 1fr
.grid-table
  height 400px
  width 570px
  position relative
  overflow-y auto
  overflow-x auto
.grid-form
  height 400px
  width inherit
  margin-left 30px
  overflow-y auto
  overflow-x auto
.form-item
  display inline-block
  width 317px
  .el-select
    width 317px !important
.h2
  font-size 24px
  font-style bold
  margin-bottom 10px
.form-item-btns
  display inline-block
  margin-bottom 3px
  margin-left 10px
.neg-left-margin
  margin-left -10px
</style>

