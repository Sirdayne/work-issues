<template lang="pug">
.fx-table
  .fx-table(v-if="fieldwork && firstwork")
    .fx-row.fx-grey
      .fx-cell Работа
      .fx-cell Площадь
      .fx-cell Препарат
      .fx-cell Машина
      .fx-cell Инструмент
      .fx-cell Редактировать
    .fx-row
      button.fx-cell.fx-button.fx-light-grey( style="cursor: pointer;", @click="changeSpoiler('.fx-spoiler-3')" )
        span(v-if="fieldwork.length > 0") +
        span {{ firstwork.workName }}
      .fx-cell {{ firstwork.area }}
      .fx-cell
        el-tag( v-for="item in firstwork.chemicalTreatments", :key="item.id") {{ item.chemicalPreparationName }} ({{ item.normative }} )
      .fx-cell {{ firstwork.car }}
      .fx-cell {{ firstwork.instrument }}
      button.fx-a
        router-link(:to="`/recipes/${firstwork.technologyRecieptId}`")
          i(class="el-icon-edit")
  .fx-spoiler.fx-spoiler-3
    .fx-table(v-if="fieldwork.length > 0", v-for="elem in fieldwork")
      .fx-row
        .fx-cell
          span {{ elem.workName }}
        .fx-cell {{ elem.area }}
        .fx-cell
          el-tag( v-for="item in elem.chemicalTreatments", :key="item.id") {{ item.chemicalPreparationName }} ({{ item.normative }} )
        .fx-cell {{ elem.car }}
        .fx-cell {{ elem.instrument }}
        button.fx-a
          router-link(:to="`/recipes/${elem.technologyRecieptId}`")
            i(class="el-icon-edit")
</template>

<script>

import http from 'lib/httpQueryV2'
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'
import $ from 'jquery';

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  props: [
    'fieldClickedId',
    'fieldworks',
  ],
  data() {
    return {
      firstwork: null
    }
  },
  computed: {
    fieldwork() {
      let fieldwork = this.fieldworks.find(x => x.fieldId === this.fieldClickedId)
      if (fieldwork){
        fieldwork = fieldwork.works
        this.firstwork = fieldwork.shift()
      }
      return fieldwork
    }
  },
  created() {
  },
  methods: {
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(500);
    },
  }
}
</script>

<style scoped>
  .fx-cell{
    position: relative;
  }
  .fx-cell a{
    color: #323232;
    margin-left: 5px;
  }
  .fx-cell-edit{
    position: absolute;
    bottom: 1px;
    right: 1px;
    height: 22px;
    width: 28px;
    padding: 2px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #dfe6ec;
    box-sizing: border-box;
  }
</style>
