<template lang="pug">
.fx-table(:class="{ 'fx-wide': wide }")
  .fx-cont-xls
    json2xls(v-if="xls", :model="xls", :props="xlsProps", :name="xlsName")
  .fx-row.fx-light-grey(v-if="fieldClickedName")
    .fx-cell {{fieldClickedName}}
  .fx-row.fx-light-grey
    button.fx-cell.fx-button( style="cursor: pointer;", @click="changeSpoiler('.fx-spoiler-1')" ) + Севоборот
    .fx-cell( v-for="year in years" )
      el-tag( v-for="item in year.crops", :key="item.id", :color="item.colorRotation") {{ item.culture }}
  .fx-spoiler.fx-spoiler-1
    .fx-row
      .fx-cell.fx-head Год
      .fx-cell( v-for="year in years", style="text-align:center;" ) {{ year.year }}
    .fx-row
      .fx-cell.fx-head  Урожайность
      .fx-cell( v-for="year in years" )
        el-tag( v-for="item in year.crops", :key="item.id", :color="item.color") {{item.yield}}
    .fx-row
      .fx-cell.fx-head  Площадь посева
      .fx-cell( v-for="year in years" )
        el-tag( v-for="item in year.crops", :key="item.id", :color="item.color") {{item.sowingArea}}
    .fx-row
      .fx-cell.fx-head  Репродукция
      .fx-cell( v-for="year in years" )
        el-tag( v-for="item in year.crops", :key="item.id", :color="item.color") {{item.reproduction}}
    .fx-row
      .fx-cell.fx-head  Сорт
      .fx-cell( v-for="year in years" )
        el-tag( v-for="item in year.crops", :key="item.id", :color="item.color") {{item.sort}}
</template>

<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import $ from "jquery"

import json2xls from "components/json2xls"

export default {
  mixins: [
    
    ListController
  ],
  props: {
    "fieldClickedId": {
      type: Number,
      default: null,
    },
    "fieldClickedName": {
      type: String,
      default: "",
    },
    "year": {
      type: Boolean,
      default: false,
    },
    "wide": {
      type: Boolean,
      default: false,
    },
  },
  components: {
    json2xls,
  },
  data() {
    return {
      colors: {
        0: {
          color: "#8391a5",
          name: "grey"
        },
        1: {
          color: "#FF8000",
          name: "orange"
        },
        2: {
          color: "#74DF00",
          name: "green"
        },
        3: {
          color: "#2E2EFE",
          name: "blue"
        },
        4: {
          color: "#FFD100",
          name: "yellow"
        }
      },
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
      croprotations: [],
      xlsProps: {},
      xlsName: "Севоборот",
      xls: false,
    }
  },
  created() {
    fetchEntities([
      "croprotations"
    ], this.afterFetch );
  },
  mounted() {
    if (this.wide){
      $(".fx-spoiler-1").show();
    }
  },
  computed: {
    fromThisYear() {
      return this.year
    },
    changedCroprotations(){
      let array = this.croprotations
      if (array && array.length){
        array.forEach(a => {
          for (let col in a.columns) {
            a.columns[col].forEach(x => {
              let rotationColor = this.rotationColors.find(r => r.id == x.typeRotation)
              x.rotationColor = rotationColor ? rotationColor.color : this.rotationColors[1].color
            })
          }
        })
      }
      return array
    },
    years() {
      let years = []
      let firstYear = this.$root.context.year - 1
      if (this.fromThisYear){
        firstYear = this.$root.context.year
      }
      let showNumOfYears = 5
      for ( var i = 0; i < showNumOfYears; i++ ){
        let crops = this.getSevoborotData(this.fieldClickedId, firstYear)
        let culture = ""
        let reproduction = ""
        let sort = ""
        let sowingArea = ""
        let yearYield = ""
        let j = -1
        crops.map(c => {
          if (j < 4) {j++} else {j = 0}
          c.color = this.colors[j].color
          culture+=c.culture + " "
          reproduction+=c.reproduction + " "
          sort+=c.sort + " "
          sowingArea+=c.sowingArea + " "
          yearYield+=c.yield + " "
          return c
        })
        years.push({
          id: i, crops: crops, year: firstYear,

          culture: culture,
          yield: yearYield,
          sowingArea: sowingArea,
          reproduction: reproduction,
          sort: sort,
        })
        firstYear--
      }
      this.prepareXls(years)
      return years
    },
  },
  methods: {
    afterFetch(){
      this.croprotations = fromVuex("croprotations")
    },
    getSevoborotData(fieldId, year){
      let croprotation = this.changedCroprotations.find( x => x.fieldId == fieldId )
      let empty = [{culture: "нет данных", yield: 0, sowingArea: 0, reproduction: "нет данных", sort: "нет данных", colorRotation: this.rotationColors[1].color}]
      if (croprotation){
        let cropYear = croprotation.columns[year]
        let cropArray = []
        if (cropYear){
          cropYear.forEach(x => {
            cropArray.push(
              {
                culture: x.culture ? x.culture : "пусто",
                yield: x.yield ? x.yield : 0,
                sowingArea: x.sowingArea ? x.sowingArea : 0,
                reproduction: x.reproduction ? x.reproduction : "пусто",
                sort: x.sort ? x.sort : "пусто",
                colorRotation: x.rotationColor && x.culture ? x.rotationColor: this.rotationColors[1].color
              });
          })
        } else {cropArray = empty}
        return cropArray;
      } else {
        return empty;
      }
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(500);
    },
    prepareXls(years){
      //тот же порядок что и в year.push
      let firstCol = ["Севоборот", "Урожайность", "Площадь посева", "Репродукция", "Сорт"]
      let xlsArray = []
      for (let key in years[0]){
        if ((key != "id") && (key != "crops") && (key != "year")){
          xlsArray.push({yearTitle: "пусто", name: key})
        }
      }
      let i = 0
      xlsArray.forEach(x => {
        x.yearTitle = firstCol[i]
        i++
      })
      years.forEach(y => {
        for (let key in y) {
          if ((key != "id") && (key != "crops") && (key != "year")){
            xlsArray.forEach(x => {
              if (key == x.name){
                x["year" + y.year] = y[key]
              }
            })
          }
        }
      })
      this.xlsProps = {
        yearTitle: "год",
      }
      for (let key in xlsArray[0]){
        if ((key != "yearTitle") && (key != "name")){
          this.xlsProps[key] = key.replace("year", "") + " "
        }
      }
      this.xls = xlsArray
    },
  }
}
</script>
