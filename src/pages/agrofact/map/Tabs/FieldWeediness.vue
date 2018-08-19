<template lang="pug">
.fx-table.fx-small(v-loading="loading", element-loading-text="Загрузка...")
  el-table(
    v-if="weediness",
    :data="weediness",
    border,
    resizable,
    style="margin-bottom: 10px"
  )
    el-table-column(
      prop="formatDate",
      label="Дата",
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
import {fetchEntities, fromVuex} from "services/RecordsLoader";
import moment from "moment";
import ListController from "mixins/ListController"

export default {
  name: "FieldWeediness",
  props: {
    "id": {
      type: Number,
      default: null,
    },
  },
  mixins: [
    
    ListController,
  ],
  data() {
    return {
      fieldweediness: [],
      perPage: 10,
      currentPage: 1,
      loading: true,
    }
  },
  created() {
    fetchEntities([
      "fieldweediness"
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.loading = false
      this.fieldweediness = fromVuex("fieldweediness").map(x => {
        x.year = moment(x.date, "YYYY-MM-DDTHH:mm:ss").format("YYYY")
        x.date = moment(x.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
        return x
      })
    },
  },
  computed: {
    weediness(){
      let array = this.fieldweediness ? this.fieldweediness.filter(x => x.fieldId == this.id && x.year == this.$root.context.year ) : []
      this.fieldweediness.forEach(w => {
        w.formatDate = moment(w.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm:ss")
        w.inspectionDateFormated = w.inspectionDate ? moment(w.inspectionDate, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm:ss") : "нет даты"
      })
      return array
    },
    formatweediness() {
      let array = this.weediness ? this.weediness.slice(0) : []
      let weedformat = []
      array.forEach(a => {
        let found = weedformat.findIndex(w => w.workName == a.workName)
        if (found == -1){
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
            if (w.date > a.date) w.date = a.date
            if (w.date < a.date) w.date = a.date
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
        w.formatDate = moment(w.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm:ss")
        w.inspectionDateFormated = moment(w.inspectionDate, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY HH:mm:ss")
        if (w.inspectionDateFormated == "Invalid date") {
          w.inspectionDateFormated = "нет даты"
        }
      })
      return weedformat
    },
  },
}
</script>
