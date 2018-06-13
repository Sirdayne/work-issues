<template lang="pug">
.operative-informations
  .fx-form(style="margin-top: 20px")
    .fx-item
      .fx-label Дата
      el-date-picker(v-model="selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
    .fx-item
      el-button.excel(type='default', @click="exportTable()") .

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
          .fx-row-container(v-if="item.operativeInformationType == 1", @click="changeSpoiler('.' + item.spoilerClass)")
            .fx-row
              .fx-cell.green(:style="firstColStyle") {{opinfo.name}} {{item.technologicalOperation}}
                .fx-plus(v-if="item.spoiler") +
              .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
          .fx-row-container.fx-spoiler(v-else-if="item.operativeInformationType == 2", :class="item.spoilerClass")
            .fx-row
              .fx-cell.yellow(:style="firstColStyle") {{item.technologicalOperation}}
              .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
          .fx-row-container.fx-spoiler(v-else, :class="item.spoilerClass")
            .fx-row
              .fx-cell(:style="firstColStyle") {{item.technologicalOperation}}
              .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
        .fx-button-spoiler
          el-button(@click="changeSpoiler('.fx-spoiler-main')") +

      .fx-spoiler.fx-spoiler-main(v-if="spoilerOpinfos && spoilerOpinfos.length > 0", style="border-top: 1px solid #323232")
        .fx-row-container(v-for="opinfo in spoilerOpinfos")
          .fx-row-container(v-for="item in opinfo.operativeInformations")
            .fx-row-container(v-if="item.operativeInformationType == 1", @click="changeSpoiler('.' + item.spoilerClass)")
              .fx-row
                .fx-cell.pink(:style="firstColStyle") {{opinfo.name}} {{item.technologicalOperation}}
                  .fx-plus(v-if="item.spoiler") +
                .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
            .fx-row-container.fx-spoiler(v-else-if="item.operativeInformationType == 2", :class="item.spoilerClass")
              .fx-row
                .fx-cell(:style="firstColStyle") {{item.technologicalOperation}}
                .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
            .fx-row-container(v-else-if="item.operativeInformationType == 8", @click="changeSpoiler('.' + item.spoilerClass)")
              .fx-row
                .fx-cell.blue(:style="firstColStyle") {{opinfo.name}} {{item.technologicalOperation}}
                  .fx-plus(v-if="item.spoiler") +
                .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
            .fx-row-container.fx-spoiler(v-else-if="item.operativeInformationType == 9", :class="item.spoilerClass")
              .fx-row
                .fx-cell.gold(:style="firstColStyle") {{opinfo.name}} {{item.technologicalOperation}}
                .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
            .fx-row-container.fx-spoiler(v-else, :class="item.spoilerClass")
              .fx-row
                .fx-cell(:style="firstColStyle") {{item.technologicalOperation}}
                .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'
  import nprogress from 'lib/NProgress'
  import $ from 'jquery'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        selectedDate: new Date(new Date().setFullYear(this.$root.context.year)),
        perPage: 15,
        currentPage: 1,
        firstColStyle: 'width: 50%;',
        operativeInformations: [],
        organizationsshortname: [],
        works: [],
        cultures: [],
        spoilerOpinfos: [],
        posev: null,
        loading: true,
        spoilersCount: 0,
        opinfojob: [],
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
          shortName: 'всего'
        }
        let array = []
        if (this.organizationsshortname.length > 0 && this.orgIds.length > 0){
          this.orgIds.forEach(orgId => {
            let finded = this.organizationsshortname.find(org => org.id == orgId)
            if (finded) {
              array.push(finded)
            }
          })
        }
        array.unshift(firstOrg)
        return array
      },
      opinfos() {
        let array = []
        this.spoilerOpinfos = []
        let putToSpoiler = false
        if (this.operativeInformations.length > 0){
          this.operativeInformations.forEach(info => {
            this.addSpoilers(info)
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
            } else {
              array.push(info)
            }
          })
        }
        return array
      },
    },
    watch: {
      'selectedDate'(value) {
        this.operativeInformations = []
        this.loading = true
        this.getOperativeInformations();
      }
    },
    created() {
      EventBus.$on('AppYearChanged', (year) => {
        this.selectedDate = new Date(new Date(this.selectedDate).setFullYear(year));
      });
      this.fetchEntities([
        'organizationsshortname',
        'cultures',
        'works',
      ], this.afterFetch );
      this.getOperativeInformations()
      this.getOperativeInfoJob()
    },
    methods: {
      addSpoilers(info) {
        this.spoilersCount++
        if (info.operativeInformations.length > 1){
          let counter = 0
          info.operativeInformations.forEach(item => {
            counter++
            item.spoilerClass = `fx-spoiler-${this.spoilersCount}`
            item.spoiler = true
          })
        }
      },
      afterFetch() {
        this.organizationsshortname = this.fromVuex('organizationsshortname')
        this.cultures = this.fromVuex('cultures')
        this.works = this.fromVuex('works')
      },
      getOperativeInformations() {
        let endpoint = "OperativeInformationsReport";
        let body = {
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
        let finded = this.operativeInformations.find(o => o.workTypeParameterPlanWorkTypeId === 51)
        this.posev = finded ? finded : null
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
      findNameByArray(id, array) {
        let finded = array.find(c => c.id == id)
        let name = finded ? finded.name : 'не найдено'
        return name
      },
      exportTable() {
        let endpoint        = "OperativeInformations";
        let filename        = "Сводка ВПР";
        let body = {
          Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
        };
        http.downloadXLS(endpoint, body, filename);
      },
      getMinDate() {
        let min = this.opinfojob[0].processed
        this.opinfojob.forEach(item => {
          let firstDate = moment(min, 'YYYY-MM-DDTHH:mm:ss')
          let secondDate = moment(item.processed, 'YYYY-MM-DDTHH:mm:ss')
          if (firstDate > secondDate){
            min = item.processed
          }
        })
        if (min) {
          min = moment.utc(min).local().format('HH:mm:ss DD/MM/YYYY')
        } else {
          min = 'нет данных'
        }
        return min
      },
      getOpinfojobByOrg(id) {
        console.log(id)
        let finded = this.opinfojob.find(o => o.organizationId === id)
        let date = 'нет данных'
        if (finded && finded.processed) {
          date = moment.utc(finded.processed).local().format('HH:mm:ss DD/MM/YYYY')
        }
        if (id == 0){
          date = this.getMinDate()
        }
        return date
      },
      getOperativeInfoJob() {
        let endpoint = `JobStats`
        http.getWithoutCache(endpoint)
          .then(data => {
            this.opinfojob = data
          })
      },
      changeSpoiler(spoiler){
        $(spoiler).slideToggle(500);
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
