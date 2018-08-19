<template lang="pug">
div
  el-form(
    :inline="true",
    :label-position="'top'"
  )
    el-form-item(label="Поле:")
      el-select(v-model="filterField", filterable, clearable, placeholder="Выбрать")
        el-option(
          v-for="f in fieldsFilter",
          :label="f.newName",
          :value="f.id",
          :key="f.id",
        )
    el-form-item(label="Вид нарушения:")
      el-select(v-model="violationTypeId" placeholder="Выбрать", @change="getRVI()")
        el-option(
        v-for="v in violationTypes",
        :label="v.name",
        :value="v.id",
        :key="v.id",
        )

  h2(class="tableHeading") Нарушение ротации
    span(:style="{marginRight: '30px'}")
    el-button.excel(type="default", @click="exportTable('form')") .

  el-table(
    :data="paginate(filteredCrops)",
    border,
    resizable,
    v-loading="loading",
    element-loading-text="Загружается...",
    height="1",
  ).content
    el-table-column(label="Поле", prop="field", header-align="center", align="center")

    el-table-column(v-if="getLabel(5) != 'empty'", :label="getLabel(5)", header-align="center", align="center")
      template(slot-scope="scope")
        template(v-for="item in scope.row.culture5")
          el-tag(:color="item.color") {{ item.culture }}

    el-table-column(v-if="getLabel(4) != 'empty'", :label="getLabel(4)", header-align="center", align="center")
      template(slot-scope="scope")
        template(v-for="item in scope.row.culture4")
          el-tag(:color="item.color") {{ item.culture }}

    el-table-column(v-if="getLabel(3) != 'empty'", :label="getLabel(3)", header-align="center", align="center")
      template(slot-scope="scope")
        template(v-for="item in scope.row.culture3")
          el-tag(:color="item.color") {{ item.culture }}

    el-table-column(v-if="getLabel(2) != 'empty'", :label="getLabel(2)", header-align="center", align="center")
      template(slot-scope="scope")
        template(v-for="item in scope.row.culture2")
          el-tag(:color="item.color") {{ item.culture }}

    el-table-column(v-if="getLabel(1) != 'empty'", :label="getLabel(1)", header-align="center", align="center")
      template(slot-scope="scope")
        template(v-for="item in scope.row.culture1")
          el-tag(:color="item.color") {{ item.culture }}

  el-pagination(
    v-if="filteredCrops",
    layout="total, prev, pager, next",
    :total="filteredCrops.length",
    :page-size="perPage",
    :current-page="currentPage",
    style="margin-top: 10px;",
    @current-change="onCurrentPageChange",
    @size-change="onPerPageChange"
  )
</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"

export default {
  mixins: [
    
    ListController,
  ],
  data() {
    return {
      rotationviolationitems: [],
      fields: [],
      yearCols: [],
      rotationColors: [
        {
          id: 0,
          color: "#00d921",
          type: "allowed"
        },
        {
          id: 1,
          color: "#ba0000",
          type: "forbidden"
        },
        {
          id: 2,
          color: "#d9ce00",
          type: "not recommended"
        }
      ],
      violationTypes: [
        {
          id: 1,
          name: "Запрещено"
        },
        {
          id: 2,
          name: "Не рекомендуется"
        }
      ],
      violationTypeId: 1,
      labels: [],
      fieldsFilter: [],
      filterField: null,
      perPage: 10,
      currentPage: 1,
      loading: true,
    }
  },
  computed: {
    filteredCrops() {
      let array = this.crops
      if (this.filterField) {
        array = this.crops.filter(c => this.filterField == c.fieldId)
      }
      let violatedArray = []
      this.fieldsFilter = []
      array.forEach(crop => {
        let found = false
        for(let key in crop){
          let checkCultureKey = key.slice(0, 7)
          if (checkCultureKey == "culture") {
            crop[key].forEach(culture => {
              if (culture.typeRotation == this.violationTypeId){
                found = true
              }
            })
          }
        }
        if (found) {
          this.fieldsFilter.push({
            newName: crop.field,
            id: crop.fieldId
          })
          violatedArray.push(crop)
        }
      })
      return violatedArray
    },
    crops(){
      let array = []
      let year = this.$root.context.year
      let numOfYears = 5
      let years = []
      this.yearCols = []
      for (let i = year; i > year - numOfYears; i--){
        years.push(i)
        this.yearCols.push({
          label: "" + i,
          prop: "" + i
        })
      }
      this.formatrotationviolationitems.forEach(crop => {
        let croprotation = {}
        croprotation["field"] = crop["field"]
        croprotation["fieldId"] = crop["fieldId"]
        let counter = 0
        for (let key in crop){
          let found = years.findIndex(y => y == key)
          if (found > -1){
            counter++
            this.labels.push({
              id: counter,
              year: key
            })
            croprotation["culture" + counter] = crop[key]
          }
        }
        array.push(croprotation)
      })
      return array;
    },
    formatrotationviolationitems(){
      let array = []
      this.rotationviolationitems.forEach(crop => {
        let croprotation = {}
        croprotation["field"] = crop.fieldName
        croprotation["fieldId"] = crop.fieldId
        for (let key in crop.yearsCulture) {
          let cultures = []
          let col = crop.yearsCulture[key]
          let rotation = this.rotationColors.find(r => r.id == col.rotationType)
          let rotationColor = rotation ? rotation.color : this.rotationColors[1].color
          if (col.culturesName){
            cultures.push({
              culture: col.culturesName,
              color: rotationColor,
              typeRotation: col.rotationType
            })
          } else {
            cultures.push({
              culture: "нет данных",
              color: this.rotationColors[1].color,
              typeRotation: 1
            })
          }
          croprotation[key] = cultures
        }
        array.push(croprotation)
      })
      return array;
    },
  },
  created() {
    this.loading = true
    fetchEntities([
      "fields",
    ], this.afterFetch );
  },
  methods: {
    afterFetch(){
      this.fields = fromVuex("fields")
      this.getRVI()
    },
    getRVI() {
      this.loading = true
      let body = {
        year: this.$root.context.year,
        organizationId: this.$root.context.organization,
        cultureRotationType: this.violationTypeId,
      }
      http.post("rotationviolationitems", body)
        .then(data => {
          this.setRVI(data)
        })
        .catch(() => {
          this.setRVI([])
        })
    },
    setRVI(data) {
      this.rotationviolationitems = data
      this.loading = false
    },
    getLabel(id) {
      let label = this.labels.find(l => l.id == id)
      let output = label ? label.year : "empty"
      return output
    },
    exportTable() {
      let endpoint = "RotationViolation";
      let filename = "Нарушение ротации";
      let body = {
        year: this.$root.context.year,
        organizationId: this.$root.context.organization,
        cultureRotationType: this.violationTypeId
      };
      http.downloadXLS(endpoint, body, filename);
    }
  }
}

</script>

<style lang="stylus" scoped>
.router-btn
  padding 5px 10px
</style>
