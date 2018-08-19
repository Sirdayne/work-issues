<template lang="pug">
div
  template(v-if="isElementExcluded")
    component(:is="excludedComponent")
  div(v-else, v-loading="!data")
    el-dialog(v-if="viewable", :visible.sync="viewVisible", title="Информация", size="tiny")
      template(v-for="th in viewHeaders")
        div {{th.label}}: {{viewRow[th.prop]}}
    template(v-if="data")
      filter-builder(:data="data", :filterVisible="filterVisible", @closed="filterVisible = false", @apply="applyFilter")
    .func-bar
      router-link(tag="el-button", :to="toForm" v-if="changeable") Новая запись
      el-card
        el-input(
          placeholder="С помощью поиска можно фильтровать данные.",
          icon="search",
          v-model="search",
          :minlength="searchMin",
          :maxlength="searchMax",
        )
      el-button.filter(
        @click="filterVisible = true",
        type="default",
        v-if="hasFilter"
      ) .
      json2xls(v-if="xls", :model="xls", :props="xlsProps", :name="xlsName")
    template(v-if="data")
      table-builder(:data="data", :filter="filter", :search="search.trim()", @edit="edit", @remove="remove", @view="view", @prepareXls="prepareXls")
</template>

<script>
import {getElementData} from "./builders/element-builder"
import TableBuilder from "./builders/table-builder"
import FilterBuilder from "./builders/filter-builder"
import json2xls from "components/json2xls"
import http from "services/http"
import navigation from "pages/catalog/navigation"
import FieldDistances from "pages/catalog/components/exclusions/field-distances"
import CarInformation from "pages/catalog/components/exclusions/car-information"
import Doplaty from "pages/catalog/components/exclusions/doplaty"
import GrowthPhases from "pages/catalog/components/exclusions/growth-phases"
import Sornyaki from "pages/catalog/components/exclusions/sornyaki"
import CultureQualityTypes from "pages/catalog/components/exclusions/culture-quality-types"
import CultureQualityConditions from "pages/catalog/components/exclusions/culture-quality-conditions"

export default {
  components: {
    TableBuilder,
    FilterBuilder,
    json2xls,
    FieldDistances,
    CarInformation,
    Doplaty,
    GrowthPhases,
    Sornyaki,
    CultureQualityTypes,
    CultureQualityConditions,
  },
  data() {
    return {
      data: null,
      filter: null,
      filterVisible: null,
      processing: false,
      search: "",
      searchMin: 1,
      searchMax: 200,
      viewRow: null,
      viewHeaders: null,
      viewVisible: null,
      xls: null,
      xlsProps: null,
      xlsName: "",
      changeable: true,
      hasFilter: null,
      isElementExcluded: null,
      excludedComponent: null,
      linkLabelMap: [],
    }
  },
  watch: {
    ["$route.params.type"](val, oldVal) {
      this.reset()
      this.setDocumentTitle(this.getTitle())
      if (!this.isExclusion(val)) this.init(val)
    },
  },
  computed: {
    viewable() {
      return this.viewVisible
    },
    toForm() {
      return this.$route.path + "/form"
    }
  },
  created() {
    this.linkLabelMap = navigation.reduce((arr, val) => arr.concat(val.items), [])
    let element = this.$route.params.type
    this.setDocumentTitle(this.getTitle())
    if (!this.isExclusion(element)) this.init(element)
  },
  methods: {
    init(element) {
      this.refresh = () => {
        this.reset()
        this.init(element)
      }
      getElementData(element)
        .then((data) => {
          if (element == this.$route.params.type) {
            this.data = data
            this.hasFilter = !this.data.elementData.notFilterable
            if (this.data.elementData.changeable == false) {
              this.changeable = this.data.elementData.changeable
            }
          }
        })
        .catch((error) => {
          if (error == "FileNotFoundError") {
            this.$router.push("/")
          }
        })
    },
    isExclusion(path) {
      let paths = ["field-distances", "car-information", "doplaty", "growth-phases", "sornyaki", "culture-quality-types", "culture-quality-conditions"]
      let components = ["field-distances", "car-information", "doplaty", "growth-phases", "sornyaki", "culture-quality-types", "culture-quality-conditions"]
      let index = paths.findIndex(p => p == path)
      if (index !== -1) {
        this.excludedComponent = components[index]
        this.isElementExcluded = true
        return true
      }
      this.isElementExcluded = false
      this.excludedComponent = null
      return false;
    },
    getTitle() {
      let link = `catalog/${this.$route.params.type}`
      let linkLabel = this.linkLabelMap.find(llm => !llm.link.indexOf(link))
      let title = linkLabel && linkLabel.label
      return title
    },
    setDocumentTitle(title) {
      document.title = title ? title + " - AgroStream" : "AgroStream"
    },
    reset() {
      this.data = null
      this.hasFilter = null
      this.filter = null
      this.filterVisible = null
      this.processing = false
      this.search = ""
      this.viewRow = null
      this.viewHeaders = null
      this.viewVisible = null
      this.xls = null
      this.xlsProps = null
      this.changeable = true
    },
    prepareXls(body, headers) {
      if (this.data.elementData.downloadable !== false) {
        this.xls = body
        this.xlsName = this.getTitle() || this.$route.params.type + ""
        this.xlsProps = {}
        headers.forEach(h => {
          if (h.table || h.xls) {
            this.xlsProps[h.prop] = h.label
          }
        })
      }
    },
    applyFilter(filter) {
      this.filter = filter
    },
    edit(id) {
      this.$router.push(this.$route.path + "/form/" + id)
    },
    remove(api, id) {
      if (!this.processing) {
        this.processing = true
        http.delete(`${api}?id=${id}`)
          .then(() => {
            this.processing = false
            this.refresh()
          })
          .catch(e => {
            this.processing = false
            throw e
          });
      }
    },
    view(row, headers) {
      this.viewRow = row
      this.viewHeaders = headers
      this.viewVisible = true
    },
  },
}
</script>
<style lang="stylus">
.func-bar
  flex auto 0 0
  margin 10px 0
  display flex
  .el-card
    flex auto 1 0
    margin 0 10px
    &__body
      padding 0
</style>
