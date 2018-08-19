<template lang="pug">
div(:style="{background: '#fff', zIndex: 1, position: 'relative'}")
  input(
    type="hidden",
    v-model="val",
    :data-to="f"
  ).s-form-field
  el-input(
    type="text",
    v-if="type === String",
    :data-to="f",
    v-model="val"
  )
  el-switch(
    on-text="",
    off-text="",
    v-if="type === Boolean",
    :data-to="f",
    v-model="val"
  )
  el-date-picker(
    type="date",
    v-if="type === Date",
    :data-to="f",
    v-model="val"
  )
  el-input-number(
    :min="1",
    v-if="type === Number",
    :data-to="f",
    v-model="val"
  )
  el-select(v-model="val", v-if="type === 'one' && rel && rel.length")
    el-option(
      v-for="item in rel",
      :label="item.name",
      :value="item.id",
      :key="item.id",
    )
</template>

<script>
import Multiselect from "vue-multiselect"
import datasets2 from "mixins/datasets2"
import datasets from "mixins/datasets"

export default {
  mixins: [
    datasets2,
    datasets
  ],
  components: {Multiselect},
  data() {
    return {
      type: null,
      rel: null,
      val: null,
      justCreated: 0,
    }
  },
  props: {
    "value": {
      type: Number,
      default: null,
    },
    "model": {
      type: Object,
      default: {},
    },
    "field": {
      type: String,
      default: "",
    },
  },
  watch: {
    val(v) {
      if (this.field == "culture.name") {
        //this.$root.context.culture = v;
      }
    },
  },
  created() {
    this.make()
  },
  methods: {
    onContextChange() {
      if (this.field == "sort.name") {
        this.make(this.field);
      }
    },
    make(field = false) {
      this.type = this.model.fields.find(field => {
        return field.name === this.field;
      }).type || String
      this.f = this.field.split(".")[0]
      let rel = this.model.relations[this.f] ||
        this.model.relations[this.f + "_"]
      if (rel) {
        this.type = rel.fromMany? "many" : "one"
        this.rel = rel.model
        this.getCached(rel.model).then(data => {
          if (field != "sort.name") this.rel = data.records
          else this.rel = data.records.filter(record => record.cultureId === this.$root.context.culture)
        })
        this.relData = rel.model.filter?
          this.datasetForModel(rel.model).records.filter(rel.model.filter) :
          this.datasetForModel(rel.model).records
        this.relData = this.relData.filter(r => r[rel.model.idKey] > 0)
        this.f = rel.key
      }
      if (field != "sort.name") {
        this.val = this.value[this.f]
      }
      else {
        this.val = this.justCreated < 2 ? this.value[this.f] : null;
        this.justCreated++;
      }
      if (this.type === "many" && !this.val) {
        this.val = []
      }
    }
  }
}
</script>
