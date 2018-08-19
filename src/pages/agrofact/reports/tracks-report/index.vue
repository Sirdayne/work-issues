<template lang="pug">
div
  h2(class="heading-margin") Отчет по отрисовке треков
  el-form(inline, label-position="top")
    el-form-item(label="Бригада")
      el-select(v-model="item.brigadeId", placeholder="Выбрать", filterable, @change="filterFields")
        el-option(v-for="b in brigades", :label="b.name", :value="b.id", :key="b.id")
    el-form-item(label="Поля")
      el-select(v-model="item.fields", placeholder="Выбрать", filterable, multiple, :multiple-limit="maxFields")
        el-option(v-for="f in filteredFields", :label="f.newName", :value="f.id", :key="f.id")
    el-form-item.invisible-color(label=".")
      el-button.printer(type="default", @click="download(item)", :loading="loadingItem.pdf", :disabled="!item.fields.length") .
</template>
<script>
import http from "services/http";
import {fetchEntities, fromVuex} from "services/RecordsLoader"

export default {
  mixins: [
    
  ],
  data() {
    return {
      brigades: [],
      fields: [],
      filteredFields: [],
      item: {
        brigadeId: null,
        fields: [],
      },
      loadingItem: {
        pdf: false,
      },
      maxFields: 10,
    }
  },
  created() {
    fetchEntities([
      "brigades",
      "fields",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.fields = fromVuex("fields")
      this.brigades = fromVuex("brigades")
      if (this.brigades.length) {
        this.item.brigadeId = this.brigades[0].id
      }
    },
    filterFields(brigadeId) {
      this.filteredFields = this.fields.filter(f => f.brigadeId == brigadeId)
    },
    download() {
      this.loadingItem.pdf = true
      let href = `tracksReport/${this.$root.context.organization}`
      let fields = []
      this.item.fields.forEach(fieldId => {
        fields.push(`fields=${fieldId}`)
      })
      if (fields.length) href += "?" + fields.join("&")
      let name = `Отчет по отрисовке треков.pdf`
      http.downloadFILE(href, name)
        .then(() => {
          this.loadingItem.pdf = false
        })
        .catch(() => {
          this.loadingItem.pdf = false
        })
    },
  }
}
</script>
<style lang="stylus" scoped>
.heading-margin
  margin 0 0 10px 0
</style>
