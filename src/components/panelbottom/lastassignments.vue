<template lang="pug">
.fx-table(v-if="tableData")
  .fx-table(v-if="tableChemistry.length || tableFertilizer.length || tableLast")
    .fx-row.fx-grey
      .fx-cell Работа
      .fx-cell Дата
      .fx-cell Препарат
      .fx-cell Примечание
      .fx-cell Площадь обработки
      .fx-cell % поля
  .fx-table(v-if="tableChemistryLast")
    .fx-row
      button.fx-cell.fx-button.fx-light-grey( style="cursor: pointer;", @click="changeSpoiler('.fx-spoiler-2')" )
        span(v-if="tableChemistry.length > 0") +
        span {{ tableChemistryLast.workName }}
      .fx-cell {{ tableChemistryLast.date.startFormated }}
      .fx-cell
        el-tag( v-for="item in tableChemistryLast.chemistryChemicalTreatments", :key="item.id") {{ item.chemicalPreparationName }} ({{ item.factNormative }} )
      .fx-cell
        el-tag( v-for="item in tableChemistryLast.chemistryLimitWeedTypes", :key="item.id") {{ item.weedTypeName }} ({{ item.weedAmount }})
      .fx-cell {{ tableChemistryLast.area }}
      .fx-cell {{ getAreaPercentage(fieldClickedId, tableChemistryLast.area) }}
  .fx-spoiler.fx-spoiler-2
    .fx-table(v-if="tableChemistry.length > 0", v-for="table in tableChemistry")
      .fx-row
        .fx-cell {{ table.workName }}
        .fx-cell {{ table.date.startFormated }}
        .fx-cell
          el-tag( v-for="item in table.chemistryChemicalTreatments", :key="item.id") {{ item.chemicalPreparationName }} ({{ item.factNormative }} )
        .fx-cell
          el-tag( v-for="item in table.chemistryLimitWeedTypes", :key="item.id") {{ item.weedTypeName }} ({{ item.weedAmount }})
        .fx-cell {{ table.area }}
        .fx-cell {{ getAreaPercentage(fieldClickedId, table.area) }}

  .fx-table(v-if="tableFertilizer.length", v-for="table in tableFertilizer")
    .fx-row
      .fx-cell {{ table.workName }}
      .fx-cell {{ table.date.startFormated }}
      .fx-cell
        el-tag( v-for="item in table.chemistryChemicalTreatments", :key="item.id") {{ item.chemicalPreparationName }} ({{ item.factNormative }} )
      .fx-cell(style="line-height: normal;") {{ table.car }} + {{ table.instrument }}
      .fx-cell {{ table.area }}
      .fx-cell {{ getAreaPercentage(fieldClickedId, table.area) }}

  .fx-table(v-if="tableLast")
    .fx-row
      .fx-cell {{ tableLast.workName }}
      .fx-cell {{ tableLast.date.startFormated }}
      .fx-cell -
      .fx-cell(style="line-height: normal;") {{ tableLast.car }} + {{ tableLast.instrument }}
      .fx-cell {{ tableLast.area }}
      .fx-cell {{ getAreaPercentage(fieldClickedId, tableLast.area) }}
</template>

<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"
import $ from "jquery";

export default {
  mixins: [
    
    ListController
  ],
  props: {
    "fieldClickedId": {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      tableChemistryLast: null,
      tableChemistry: [],
      tableFertilizer: [],
      tableLast: null,
      fields: [],
      fieldlastassignments: [],
    }
  },
  computed: {
    tableData() {
      let tableData = []
      if (this.lastarray.length > 0){
        tableData = this.lastarray.find(x => x.fieldId === this.fieldClickedId)
        this.tableChemistry = tableData.chemistry
        this.tableChemistryLast = this.tableChemistry.pop()
        this.tableFertilizer =  tableData.fertilizer
        this.tableLast = tableData.lastWork
      }
      return tableData
    },
    lastarray() {
      let array = []
      if (this.fieldlastassignments.length > 0){
        array = this.fieldlastassignments.map(x => {
          if(x.chemistry.length > 0){
            this.dateFormat(x.chemistry);
          }
          if(x.fertilizer.length > 0){
            this.dateFormat(x.fertilizer);
          }
          if(x.lastWork){
            x.lastWork.date.startFormated = moment(x.lastWork.date.start).format("DD.MM.YYYY")
          }
          return x
        });
      }
      return array
    },
  },
  created() {
    fetchEntities([
      "fields",
      "fieldlastassignments",
    ], this.afterFetch );
  },
  methods: {
    afterFetch(){
      this.fields = fromVuex("fields")
      this.fieldlastassignments = fromVuex("fieldlastassignments")
    },
    dateFormat(array){
      array.map(y => {
        y.date.startFormated = moment(y.date.start).format("DD.MM.YYYY")
      });
    },
    getAreaPercentage(fieldId, area){
      return ((area*100)/this.fields.find(f => f.id == this.fieldClickedId).area).toFixed(2)
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(500);
    },
  }
}
</script>
