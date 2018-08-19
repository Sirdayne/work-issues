<template lang="pug">
el-dialog(:visible="visible", title="Сортировка", size="tiny", :before-close="handleClose")
  el-form()
    template(v-for="key in sortKeys")
      el-form-item(:label="sortKeysText[key]")
        el-button(@click="switchSort(key)") {{sortText[sortOptions[key]]}}
    el-form-item(align="center")
      el-button-group
        el-button(@click="applySort()", type="primary") Применить
        el-button(@click="clearSort()") Сбросить
</template>

<script>
import {deepClone} from "lib/utils";

export default {
  name: "AssignmentsSort",
  props: {
    "sortVisible": {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
      sortOptions: {
        date: -1,
        dateModified: 0,
      },
      sortModes: [-1, 0, 1],
      sortText: {
        "-1": "по убыванию",
        "0": "не сортировать",
        "1": "по возрастанию",
      },
      sortKeys: [],
      sortKeysText: {
        date: "По дате начала",
        dateModified: "По дате изменения",
      },
    }
  },
  watch: {
    ["sortVisible"](val, oldVal) {
      this.visible = val
    },
  },
  created() {
    this.sortKeys = Object.keys(this.sortOptions)
    this.applySort()
  },
  methods: {
    switchSort(key) {
      let index = this.sortModes.findIndex(sm => sm == this.sortOptions[key])
      let newIndex = (index + 1) % 3
      this.sortOptions[key] = this.sortModes[newIndex]
    },
    applySort() {
      this.$emit("apply", deepClone(this.sortOptions))
      this.close()
    },
    clearSort() {
      this.sortOptions.date = -1
      this.sortOptions.dateModified = 0
      this.applySort()
    },
    close() {
      this.visible = false
      this.$emit("closed")
    },
    handleClose(done) {
      this.close()
      done()
    }
  },
}
</script>
<style lang="stylus" scoped>
</style>
