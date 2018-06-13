<template lang="pug">
div
  div(v-if="FieldDistancesShow")
    field-distances
  div(v-else-if="CarInformationShow")
    car-information
  div(v-else-if="DoplatyShow")
    doplaty
  div(v-else-if="GrowthPhasesShow")
    growth-phases
  div(v-else-if="SornyakiShow")
    sornyaki
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
import ElementBuilder from './builders/element-builder'
import TableBuilder from './builders/table-builder'
import FilterBuilder from './builders/filter-builder'
import json2xls from 'components/json2xls'
import http from 'lib/httpQueryV2'
import FieldDistances from 'components/catalog-static/field-distances'
import CarInformation from 'components/catalog-static/car-information'
import Doplaty from 'components/catalog-static/doplaty'
import GrowthPhases from 'components/catalog-static/growth-phases'
import Sornyaki from 'components/catalog-static/sornyaki'

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
  },
  mixins: [
    ElementBuilder
  ],
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
      changeable: true,
      hasFilter: null,
      FieldDistancesShow: false,
      CarInformationShow: false,
      DoplatyShow: false,
      GrowthPhasesShow: false,
      SornyakiShow: false,
    }
  },
  watch: {
    ['$route.params.type'](val, oldVal) {
      this.reset()
      if (!this.checkForSpecialElement(val)) this.init(val)
    },
  },
  computed: {
    viewable() {
      return this.viewVisible
    },
    xlsName() {
      return "" + this.$route.params.type
    },
    toForm() {
      return this.$route.path + "/form"
    }
  },
  created() {
    let element = this.$route.params.type
    if (!this.checkForSpecialElement(element)) this.init(element)
  },
  methods: {
    init(element) {
      this.refresh = () => {
        this.reset()
        this.init(element)
      }
      this.get(element)
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
    checkForSpecialElement(val) {
      this.FieldDistancesShow = false
      this.CarInformationShow = false
      this.DoplatyShow = false
      this.GrowthPhasesShow = false
      this.SornyakiShow = false
      if (val == 'field-distances-new') {
        this.FieldDistancesShow = true
      } else if (val == 'car-information') {
        this.CarInformationShow = true
      } else if (val == 'doplaty') {
        this.DoplatyShow = true
      } else if (val == 'growth-phases') {
        this.GrowthPhasesShow = true
      } else if (val == 'sornyaki') {
        this.SornyakiShow = true
      } else {
        return false;
      }
      return true
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
