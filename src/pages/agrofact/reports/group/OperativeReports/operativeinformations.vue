<template lang="pug">
.operative-informations
  .fx-form(style="margin-top: 20px")
    .fx-item
      .fx-label Дата
      el-date-picker(v-model="selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
    .fx-item
      el-button.excel(type="default", @click="exportTable()") .

  h2(class="tableHeading") Сводка ВПР

  .loading-block(v-loading="loading", element-loading-text="Таблица загружается...")
    .fx-table(v-if="opinfos && opinfos.length > 0", style="position: relative;")
      .fx-row.fx-light-grey.fx-sticky
        .fx-cell(:style="firstColStyle") Технологические операции
        .fx-cell(v-for="org in filteredOrganizations") {{org.shortName}}
      .fx-row
        .fx-cell(:style="firstColStyle") Данные актуальны на
        .fx-cell(v-for="org in orgIds") {{ getOpinfojobByOrg(org) }}

      .fx-row-container(v-for="opinfo in opinfos")
        .fx-row-container(v-for="item in opinfo.operativeInformations")
          .fx-row-container(v-if="item.operativeInformationType === 1", @click="changeSpoiler('.' + item.spoilerClass)")
            .fx-row
              .fx-cell(:style="item.firstColStyle") {{opinfo.name}} {{item.technologicalOperation}}
                .fx-plus(v-if="item.spoiler") +
              .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
          .fx-row-container.fx-spoiler(v-else, :class="item.spoilerClass")
            .fx-row
              .fx-cell(:style="item.firstColStyle") {{item.technologicalOperation}}
              .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
        .fx-button-spoiler
          el-button(@click="changeSpoiler('.fx-spoiler-main')") +

      .fx-spoiler.fx-spoiler-main(v-if="spoilerOpinfos && spoilerOpinfos.length > 0", style="border-top: 1px solid #323232")
        .fx-row-container(v-for="opinfo in spoilerOpinfos")
          .fx-row-container(v-for="item in opinfo.operativeInformations")
            .fx-row-container(v-if="item.operativeInformationType === 1 || item.operativeInformationType === 8", @click="changeSpoiler('.' + item.spoilerClass)")
              .fx-row
                .fx-cell(:style="item.firstColStyle") {{opinfo.name}} {{item.technologicalOperation}}
                  .fx-plus(v-if="item.spoiler") +
                .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
            .fx-row-container.fx-spoiler(v-else, :class="item.spoilerClass")
              .fx-row
                .fx-cell(:style="item.firstColStyle")
                  span(v-if="item.operativeInformationType === 1") {{opinfo.name}}
                  span {{item.technologicalOperation}}
                .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}

</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"
import nprogress from "lib/NProgress"
import OperativeReports from "./OperativeReports"

export default {
  mixins: [
    
    ListController,
    OperativeReports
  ],
  data() {
    return {
      operativeInformations: [],
      works: [],
      cultures: [],
      spoilerOpinfos: [],
      posev: null,
      spoilersCount: 0,
      endpoint: "OperativeInformationsReport",
      xlsEndpoint: "OperativeInformations",
      xlsName: "Сводка ВПР",
    }
  },
  computed: {
    opinfos() {
      let array = []
      this.spoilerOpinfos = []
      let putToSpoiler = false
      if (this.operativeInformations.length > 0){
        this.operativeInformations.forEach(info => {
          if (info.cultureId) {
            info.name = this.findNameByArray(info.cultureId, this.cultures)
            this.addPercentage(info.operativeInformations[0].organizations)
            putToSpoiler = true
          }
          if (info.workTypeParameterPlanWorkTypeId) {
            info.name = this.findNameByArray(info.workTypeParameterPlanWorkTypeId, this.works)
          }
          if (putToSpoiler){
            this.spoilerOpinfos.push(info)
            this.modifyOperativeInfo(info, true)
          } else {
            array.push(info)
            this.modifyOperativeInfo(info)
          }
        })
      }
      return array
    },
  },
  watch: {
    "selectedDate"() {
      this.closeSpoilers()
      this.operativeInformations = []
      this.loading = true
      this.getOperativeInformations()
    }
  },
  created() {
    fetchEntities([
      "organizationsshortname",
      "cultures",
      "works",
    ], this.afterFetch )
    this.getOperativeInformations()
    this._getOperativeInfoJob()
  },
  methods: {
    modifyOperativeInfo(info, culture = false) {
      this.spoilersCount++
      info.operativeInformations.forEach(item => {
        this.modifyFirstColStyle(item, culture)
        if (info.operativeInformations.length > 1){
          item.spoilerClass = `fx-spoiler-${this.spoilersCount}`
          item.spoiler = true
        }
      })
    },
    modifyFirstColStyle(item, culture = false) {
      item.firstColStyle = this.firstColStyle
      if (culture) {
        item.firstColStyle += item.operativeInformationType === 1 ? "background: #a47dbd;" :
          item.operativeInformationType === 8 ? "background: #0300a1; color: #fff;" :
            item.operativeInformationType === 9 ? "background: #990; color: #fff;" : ""
      } else {
        item.firstColStyle += item.operativeInformationType === 1 ? "background: #5fe359;" :
          item.operativeInformationType === 2 ? "background: #e3dc59;" : ""
      }
    },
    afterFetch() {
      this.organizationsshortname = fromVuex("organizationsshortname")
      this.cultures = fromVuex("cultures")
      this.works = fromVuex("works")
    },
    getOperativeInformations() {
      let endpoint = "OperativeInformationsReport";
      let body = {
        organizationId: this.$root.context.organization,
        Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
      };
      nprogress.start()
      http.post(endpoint, body)
        .then(data => {
          if (data) {
            this.operativeInformations = data
            this.getPosev()
          }
          nprogress.done()
          this.loading = false
        })
        .catch((error) => {
          nprogress.done()
          this.$message({
            message: `Ошибка ${error}`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        })
    },
    getPosev(){
      let found = this.operativeInformations.find(o => o.workTypeParameterPlanWorkTypeId === 51)
      this.posev = found ? found : null
    },
    addPercentage(array) {
      for (let key in array) {
        if (this.posev.operativeInformations[0].organizations[key] != 0 && array[key] != 0){
          let percentage = parseFloat(array[key]) / this.posev.operativeInformations[0].organizations[key] * 100
          percentage = percentage.toFixed(1)
          array[key] += ` (${percentage}%)`
        }
      }
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
