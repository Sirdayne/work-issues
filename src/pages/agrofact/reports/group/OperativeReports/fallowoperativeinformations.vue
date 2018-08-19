<template lang="pug">
.operative-informations
  .fx-form(style="margin-top: 20px")
    .fx-item
      .fx-label Дата
      el-date-picker(v-model="selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
    .fx-item
      el-button.excel(type="default", @click="exportTable()") .

  h2(class="tableHeading") Сводка по парам

  .loading-block(v-loading="loading", element-loading-text="Таблица загружается...")
    .fx-table(v-if="opinfos && opinfos.length > 0", style="position: relative;")
      .fx-row.fx-light-grey.fx-sticky
        .fx-cell(:style="firstColStyle") Технологические операции
        .fx-cell(v-for="org in filteredOrganizations") {{org.shortName}}
      .fx-row
        .fx-cell(:style="firstColStyle") Данные актуальны на
        .fx-cell(v-for="org in orgIds") {{ getOpinfojobByOrg(org) }}
      .fx-container(v-for="opinfo in opinfos")
        .fx-row.fx-grey(v-if="opinfo.title")
          .fx-cell {{ opinfo.title }}
        .fx-container(v-for="(item, index) in opinfo")
          .fx-row(v-if="index === 0", @click="changeSpoiler(`.fx-spoiler-${item.spoiler}`)")
            .fx-cell(:style="item.firstColStyle") {{ item.technologicalOperation }}
              span(v-if="opinfo.length > 1", style="margin-left: 5px; cursor: pointer;") +
            .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
          .fx-spoiler(v-else, :class="`fx-spoiler-${item.spoiler}`")
            .fx-row
              .fx-cell(:style="item.firstColStyle") {{item.technologicalOperation}}
              .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}

</template>

<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import OperativeReports from "./OperativeReports"

export default {
  mixins: [
    
    ListController,
    OperativeReports
  ],
  data() {
    return {
      endpoint: "FallowOperativeInformationsReport",
      xlsEndpoint: "FallowOperativeInformations",
      xlsName: "Сводка по парам"
    }
  },
  computed: {
    opinfos() {
      let array = []
      let spoilerCount = 0
      if (this.operativeinformations.length > 0){
        this.operativeinformations.forEach(opinfo => {
          opinfo.forEach(item => {
            item.spoiler = spoilerCount
            item.firstColStyle = this.firstColStyle
            item.firstColStyle += item.operativeInformationType === 1 ? "background: #0300a1; color: #fff;" :
              item.operativeInformationType === 2 ? "background: #e3dc59;" :
                item.operativeInformationType === 13 ? "background: #8f8f91;" : ""
          })
          spoilerCount++
          array.push(opinfo)
        })
      }
      return array
    }
  },
  watch: {
    "selectedDate"() {
      this.closeSpoilers()
      this.operativeinformations = []
      this.loading = true
      this._getOperativeInformations()
    }
  },
  created() {
    fetchEntities([
      "organizationsshortname",
    ], this.afterFetch );
    this._getOperativeInformations()
    this._getOperativeInfoJob()
  },
  methods: {
    afterFetch() {
      this.organizationsshortname = fromVuex("organizationsshortname")
    },
  }
}

</script>

<style scoped>
.tableHeading {
  display: inline-block;
  margin-right: 20px;
}
.fx-cell{
  font-size: 12px;
  padding: 10px 0;
  position: relative;
  overflow: hidden;
}
.fx-cell p{
  font-size: 12px;
  margin: 0px;
  padding: 0px;
}
.operative-informations {
  padding-top: 0;
}
</style>
