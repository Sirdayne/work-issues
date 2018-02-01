<template lang="pug">
.cloud(:class="{ 'horizontal': orientation }")
  .cloud-row Номер поля:
    span {{ field.newName}}
  .cloud-row Кадастровый номер:
    span {{ field.kadastr }}
  .cloud-row Площадь поля:
    span {{ field.area }}
  .cloud-row Посевная площадь
    span(v-if="field.areaSeed") {{ field.areaSeed }}
    span(v-else-if="field.areaSow") {{ field.areaSow }}
  .cloud-row Площадь лиманов и неудобий:
    span(v-if="field.areaSeed") {{ field.area - field.areaSeed }}
    span(v-else-if="field.areaSow") {{ field.area - field.areaSow }}
  .cloud-row Культура:
    span(v-if="field.culturesSeed", v-for="item in field.culturesSeed", :key="item.cultureId") {{ item.cultureName }}({{ item.area }})
    span(v-else-if="field.culturesSow", v-for="item in field.culturesSow", :key="item.cultureId") {{ item.cultureName }}({{ item.area }})
  .cloud-row Сорт:
    span(v-if="field.sortsSeed", v-for="item in field.sortsSeed", :key="item.sortId") {{ item.sortName }}({{ item.area }})
    span(v-else-if="field.sortsSow", v-for="item in field.sortsSow", :key="item.sortId") {{ item.sortName }}({{ item.area }})
  .cloud-row Репродукция:
    span(v-if="field.reproductionsSeed", v-for="item in field.reproductionsSeed", :key="item.reproductionId") {{ item.reproductionName }}
    span(v-else-if="field.reproductionsSow", v-for="item in field.reproductionsSow", :key="item.reproductionId") {{ item.reproductionName }}
  .cloud-row Бал бонитет:
    span {{ field.bonitetScore }}
  .cloud-row Предшественник:
    span(v-for="item in field.previousCultures", :key="item.key") {{ item.culture }}
  .cloud-row Дата посева:
    span -
  .cloud-row Дата уборки:
    span -
  .cloud-row Зона:
    span {{ field.fieldzonename }}
  .cloud-row Рельеф местности:
    span {{ field.terrainname }}
  .cloud-row Гранолуметрический состав:
    span {{ field.compositionname }}
  .cloud-row Тип почвы:
    span {{ field.soiltypename }}
  .cloud-row Контур поля:
    span {{ field.fieldcontourname }}
  .cloud-row Бригада:
    span {{ field.brigadename }}
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
    'fieldId',
    'fields',
    'brigades',
    'fieldzones',
    'fieldcontours',
    'terrains',
    'soiltypes',
    'compositions',
    'croprotations',
    'seedlimits',
    'sorts',
    'sowings',
    'reproductions',
    'orientation',
  ],
  computed: {
    field() {
      let field = this.fields.find(x => x.id === this.fieldId)
      if (field){
        field.fieldzonename = this.getNameFromId(field.fieldZoneId, this.fieldzones)
        field.fieldcontourname = this.getNameFromId(field.fieldContour, this.fieldcontours)
        field.terrainname = this.getNameFromId(field.terrain, this.terrains)
        field.soiltypename = this.getNameFromId(field.soilType, this.soiltypes)
        field.compositionname = this.getNameFromId(field.composition, this.compositions)
        field.previousCultures = this.getPreviousCultures(this.$root.context.year, this.fieldId)
        let counter = 0
        if (Array.isArray(field.previousCultures)){
          field.previousCultures.forEach(p => {
            p.key = counter
            counter++
          })
        }

        field.areaSeed = 0
        field.culturesSeed = []
        field.sortsSeed = []
        field.reproductionsSeed = []
        this.seedlimits.forEach(s => {
          if (s.fieldId === this.fieldId){
            field.areaSeed+=s.area
            field.culturesSeed.push({ cultureId: s.cultureId, cultureName: s.cultureName, area: s.area })
            field.sortsSeed.push({ sortId: s.cultureSortId, sortName: s.cultureSortName, area: s.area })
            field.reproductionsSeed.push({ reproductionId: s.reproductionId, reproductionName: s.reproductionName })
          }
        })

        field.areaSow = 0
        field.culturesSow = []
        field.sortsSow = []
        field.reproductionsSow = []
        this.sowings.forEach(s => {
          if (s.fieldId === this.fieldId){
            field.areaSow+=s.area
            field.culturesSow.push({ cultureId: s.cultureId, cultureName: s.cultureName, area: s.area })
            field.sortsSow.push({ sortId: s.cultureSortId, sortName: this.getNameFromId(s.cultureSortId, this.sorts), area: s.area })
            field.reproductionsSow.push({ reproductionId: s.reproductionId, reproductionName: this.getNameFromId(s.reproductionId, this.reproductions) })
          }
        })
        return field
      } else {
        return {}
      }

    },
  },
  methods: {
    getNameFromId(id, array){
      if (Array.isArray(array)){
        if (array.length > 0){
          let out =  array.find(x => x.id === id)
          if (out){
            return out.name
          }
        }
      }
      return 'нет данных'
    },
    getPreviousCultures(year, field){
      let croprotation = this.croprotations.find(c => c.fieldId === field)
      if (croprotation) {
        return croprotation.columns[year]
      } else
        return 'нет данных'
    },
  },
}
</script>
