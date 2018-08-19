<template lang="pug">
  .operative-informations
    .fx-form(style="margin-top: 20px")
      .fx-item
        .fx-label Дата
        el-date-picker(v-model="selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
      .fx-item
        el-button.excel(type="default", @click="exportTable()") .

    h2(class="tableHeading") Анализ производительности техники

    .loading-block(v-loading="loading", element-loading-text="Таблица загружается...")
      .fx-table(v-if="statistics && statistics.length > 0", style="position: relative;")
        .fx-row.fx-light-grey.fx-sticky
          .fx-cell(:style="firstColStyle") Модель машины + тип инструмента
          .fx-cell(v-for="org in filteredOrganizations") {{org.shortName}}
        .fx-container(v-for="statistic in statistics")
          .fx-row(v-if="statistic.type === 'header'", @click="changeSpoiler(`.fx-spoiler-${statistic.spoiler}`)")
            .fx-cell(:style="statistic.firstColStyle") {{statistic.name}}
              span(v-if="statistic.isPlus", style="margin-left: 5px; cursor: pointer;") +
            .fx-cell(v-for="org in orgIds") {{getValueById(org, statistic.values)}}
          .fx-spoiler(v-else, :class="`fx-spoiler-${statistic.spoiler}`")
            .fx-row
              .fx-cell(:style="statistic.firstColStyle") {{statistic.name}}
              .fx-cell(v-for="org in orgIds") {{getValueById(org, statistic.values)}}
      .fx-table(v-else)
        p(style="text-align: center;") Нет данных
</template>

<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import http from "services/http"
import $ from "jquery"
import moment from "moment"

export default {
  mixins: [
    
  ],
  data() {
    return {
      selectedDate: moment().year(this.$root.context.year).subtract(1, "days").format(),
      endpoint: "StatisticsByCarModel",
      xlsName: "Анализ производительности техники по группе",
      firstColStyle: "width: 50%;",
      organizationsshortname: [],
      statistics: [],
      loading: true,
    }
  },
  computed: {
    orgIds() {
      let array = []
      if (this.organizationsshortname.length > 0){
        let organizations = this.organizationsshortname.slice(0)
        organizations = organizations.filter(org => org.order).sort((a, b) => {
          if (a.order > b.order) {
            return 1;
          }
          if (a.order < b.order) {
            return -1;
          }
          return 0;
        })
        organizations.forEach(org => {
          array.push(org.id)
        })
      }
      array.unshift(0)
      return array
    },
    filteredOrganizations() {
      let firstOrg = {
        id: 0,
        shortName: "всего"
      }
      let array = []
      if (this.organizationsshortname.length > 0 && this.orgIds.length > 0){
        this.orgIds.forEach(orgId => {
          let found = this.organizationsshortname.find(org => org.id == orgId)
          if (found) {
            array.push(found)
          }
        })
      }
      array.unshift(firstOrg)
      return array
    },
  },
  watch: {
    "selectedDate"() {
      this.closeSpoilers()
      this.statistics = []
      this.loading = true
      this.getStatisticsByCarModel()
    }
  },
  created() {
    fetchEntities([
      "organizationsshortname",
    ], this.afterFetch );
    this.getStatisticsByCarModel()
  },
  methods: {
    getStatisticsByCarModel() {
      let endpoint = `${this.endpoint}/${this.$root.context.organizationsGroupId}?date=${moment(this.selectedDate).format("YYYY-MM-DD")}`
      http.getWithoutCache(endpoint)
        .then(data => {
          if (data) {
            this.statistics = data
            this.modifyStatistics()
          }
          this.loading = false
        })
        .catch((error) => {
          this.$message({
            message: `Ошибка ${error}`,
            type: "info",
            duration: 5000,
            showClose: false,
          })
        })
    },
    modifyStatistics() {
      let spoilerCount = 0
      this.statistics.forEach((s, index) => {
        if (s.type === "header") {
          spoilerCount++
          s.isPlus = this.statistics[index + 1].type === "row" ? true : false
        }
        s.spoiler = spoilerCount
        s.firstColStyle = this.firstColStyle
        s.firstColStyle += s.type === "header" ? "background: #0300a1; color: #fff;" : ""
      })
    },
    afterFetch() {
      this.organizationsshortname = fromVuex("organizationsshortname")
    },
    exportTable() {
      let endpoint        = this.endpoint;
      let filename        = this.xlsName;
      let body = {
        OrganizationGroupId: this.$root.context.organizationsGroupId,
        Date: moment(this.selectedDate).format("YYYY-MM-DD"),
      };
      http.downloadXLS(endpoint, body, filename);
    },
    getValueById(id, values) {
      let found = values.find(value => value.id === id)
      let output = found ? found.value : 0
      return output
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(500)
    },
    closeSpoilers() {
      $(".fx-spoiler").hide()
    }
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
