<template lang="pug">
.fx-table
  .fx-row.fx-light-grey(v-if="fieldClickedName")
    .fx-cell {{fieldClickedName}}
  .fx-row.fx-light-grey
    button.fx-cell.fx-button( style="cursor: pointer;", @click="changeSpoiler('.fx-spoiler-1')" ) + Севоборот
    .fx-cell( v-for="year in years" )
      el-tag( v-for="item in year.crops", :key="item.id", :color="item.color") {{ item.culture }}
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
    'fieldClickedName',
    'croprotations',
    'tab'
  ],
  data() {
    return {
      colors: {
        0: {
          color: '#8391a5',
          name: 'grey'
        },
        1: {
          color: '#FF8000',
          name: 'orange'
        },
        2: {
          color: '#74DF00',
          name: 'green'
        },
        3: {
          color: '#2E2EFE',
          name: 'blue'
        },
        4: {
          color: '#FFD100',
          name: 'yellow'
        }
      },
    }
  },
  computed: {
    changedTab() {
      return this.tab
    },
    years() {
      let years = []
      let firstYear = this.$root.context.year - 1
      if (this.changedTab == 'plan'){
        firstYear = this.$root.context.year
      }
      let step = 5
      for ( var i = 0; i < step; i++ ){
        let crops = this.getSevoborotData(this.fieldClickedId, firstYear)
        let j = -1
        crops.map(c => {
          if (j < 4) { j++ } else { j = 0 }
          c.color = this.colors[j].color
          return c
        })
        years.push({  id: i, year: firstYear, crops: crops })
        firstYear--
      }
      return years
    },
  },
  methods: {
    getSevoborotData(fieldId, year){
      let croprotation = this.croprotations.find( x => x.fieldId == fieldId )
      if (croprotation){
        let cropYear = croprotation.columns[year]
        let cropArray = []
        let i = 0
        if (cropYear){
          cropYear.forEach(x => {
            cropArray.push(
              {
                culture: x.culture ? x.culture : 'пусто',
                yield: x.yield ? x.yield : 0,
                sowingArea: x.sowingArea ? x.sowingArea : 0,
                reproduction: x.reproduction ? x.reproduction : 'пусто',
                sort: x.sort ? x.sort : 'пусто'
              });
            i++;
          })
        } else { cropArray = [{ culture: 'нет данных', yield: 0, sowingArea: 0, reproduction: 'нет данных', sort: 'нет данных' }] }
        return cropArray;
      } else {
        return [{ culture: 'нет данных', yield: 0, sowingArea: 0, reproduction: 'нет данных', sort: 'нет данных' }];
      }
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(500);
    },
  }
}
</script>
