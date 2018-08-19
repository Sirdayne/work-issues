<template lang="pug">
div(v-if="data")
  el-dialog(:visible="visible", title="Фильтр", size="tiny", :before-close="handleClose")
    el-form(ref="form", :model="filter", label-position="top")
      template(v-for="fi in filterItems")
        el-form-item(:label="fi.label")
          el-select(v-model="filter[fi.model]", filterable, clearable, :multiple="fi.multiple")
            el-option(
              v-for="item in fi.iterable",
              :label="item[fi.prop]",
              :value="item.id",
              :key="item.id"
            )
      el-form-item
        el-button-group
          el-button(type="primary", @click="apply()") Применить
          el-button(@click="reset()") Сбросить
</template>
<script>
export default {
  name: "FilterBuilder",
  props: {
    "data": {
      type: Object,
      default: {},
    },
    "filterVisible": {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      filter: {},
      filterCopy: {},
      filterItems: [],
      visible: false,
      default: false,
    }
  },
  watch: {
    ["filterVisible"](val, oldVal) {
      this.visible = val
    },
  },
  created() {
    if (this.data) this._build(this.data)
  },
  methods: {
    _build(data) {
      let elementData = data.elementData
      let store = data.store
      this.filterItems = []
      elementData.attributes.filter(a => a.filter).forEach(a => {
        if (a.default !== undefined) {
          let obj = {}
          if (a.fkey) {
            let element = a.prop.split(".")[0]
            let prop = a.prop.split(".")[1]
            obj.model = element + prop[0].toUpperCase() + prop.slice(1) + a.fkey
            obj.default = a.default
          } else {
            obj.model = a.prop
            obj.default = a.default
            if (elementData.year === true && a.default === "year")
              obj.default = this.$root.context.year
          }
          this.$set(this.filter, obj.model, obj.default)
          this.default = true
        } else {
          let element = a.prop.split(".")[0]
          let prop = a.prop.split(".")[1]
          let obj = {
            iterable: store[element],
            fkey: a.fkey,
            prop: prop,
            label: a.label,
            model: a.fkey,
            element: element,
            multiple: a.multiple || true,
          }
          if (a.initiallyFilteredBy) {
            obj.iterable = obj.iterable.filter(s => Object.keys(a.initiallyFilteredBy).every(key => s[key] == a.initiallyFilteredBy[key]))
          }
          if (obj.multiple) this.$set(this.filter, obj.model, [])
          this.filterItems.push(obj)
        }
      })
      this.filterCopy = Object.assign({}, this.filter);
      if (this.default) this.apply()
    },
    apply() {
      this.$emit("apply", Object.assign({}, this.filter))
      this.$emit("closed")
    },
    reset() {
      this.filter = Object.assign({}, this.filterCopy);
      this.apply()
    },
    handleClose(done) {
      this.$emit("closed")
      done()
    }
  },
}
</script>
