<template lang="pug">
.fx-table
  el-table(
    v-if="formatweediness",
    :data="formatweediness",
    border,
    resizable,
    style="margin-bottom: 10px"
  )
    el-table-column(
      prop="period",
      label="Период",
      header-align="center",
      width="250"
    )
    el-table-column(
      prop="workName",
      label="Работа",
      header-align="center",
    )
    el-table-column(
      label="Препараты",
      header-align="center",
    )
      template(slot-scope="scope")
        template(v-for="item in scope.row.chemistryChemicalTreatments")
          el-tag {{ item.chemicalPreparationName }}

    el-table-column(
      prop="inspectionDateFormated",
      label="Дата обследования после обработки",
      header-align="center",
    )
    el-table-column(
      label="Вид сорняка",
      header-align="center",
    )
      template(slot-scope="scope")
        template(v-for="item in scope.row.chemistryLimitWeedTypes")
          el-tag(:color="item.color") {{ item.weedTypeName }}

    el-table-column(
      label="Количество до обработки",
      header-align="center",
    )
      template(slot-scope="scope")
        template(v-for="item in scope.row.chemistryLimitWeedTypes")
          el-tag(:color="item.color") {{ item.weedAmount }}

    el-table-column(
      label="Количество после обработки",
      header-align="center",
    )
      template(slot-scope="scope")
        template(v-for="item in scope.row.chemistryLimitWeedTypes")
          el-tag(:color="item.color") {{ item.weedAmountEdited }}

</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import moment from 'moment';
import ListController from 'mixins/ListController'
import {EventBus} from 'services/EventBus';

export default {
  name: "fieldweediness",
  props: [
    "id",
  ],
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  data() {
    return {
      fieldweediness: [],
      perPage: 10,
      currentPage: 1,
    }
  },
  created() {
    this.fetchEntities([
      "fieldweediness"
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.fieldweediness = this.fromVuex('fieldweediness').map(x => {
        x.date.startFormated = moment(x.date).format("DD.MM.YYYY")
        x.date.year = moment(x.date).year()
        return x
      })
    },
  },
  computed: {
    weediness(){
      let array = this.fieldweediness ? this.fieldweediness.filter(x => x.fieldId == this.id && x.date.year == this.$root.context.year ) : []
      return array
    },
    formatweediness() {
      let array = this.weediness ? this.weediness.slice(0) : []
      let weedformat = []
      array.forEach(a => {
        let finded = weedformat.findIndex(w => w.workName == a.workName)
        if (finded == -1){
          weedformat.push(a)
        }
      })
      weedformat.forEach(w => {
        array.forEach(a => {
          if (w.workName == a.workName){
            if (w.chemistryLimitWeedTypes.length < a.chemistryLimitWeedTypes) {
              w.chemistryLimitWeedTypes = a.chemistryLimitWeedTypes
              w.chemistryChemicalTreatments = a.chemistryChemicalTreatments
            }
          }
        })
      })
      weedformat.forEach(w => {
        array.forEach(a => {
          if (w.workName == a.workName){
            if (w.date.start > a.date.start) w.date.start = a.date.start
            if (w.date.end < a.date.end) w.date.end = a.date.end
            if (w.inspectionDate == null && a.inspectionDate) w.inspectionDate = a.inspectionDate
            if (w.inspectionDate < a.inspectionDate && a.inspectionDate) w.inspectionDate = a.inspectionDate

            w.chemistryLimitWeedTypes.forEach(wc => {
              a.chemistryLimitWeedTypes.forEach(ac => {
                if (wc.weedTypeName == ac.weedTypeName){
                  if (wc.weedAmount < ac.weedAmount) wc.weedAmount = ac.weedAmount
                  if (wc.weedAmountEdited < ac.weedAmountEdited) wc.weedAmountEdited = ac.weedAmountEdited
                }
              })
            })

          }
        })
        w.period = moment(w.date.start).format("DD.MM.YYYY HH:mm") + ' - ' + moment(w.date.end).format("DD.MM.YYYY HH:mm")
        w.inspectionDateFormated = moment(w.inspectionDate).format("DD.MM.YYYY HH:mm:ss")
        if (w.inspectionDateFormated == "Invalid date") {
          w.inspectionDateFormated = "нет даты"
        }
      })
      return weedformat
    },
  },
}
</script>
