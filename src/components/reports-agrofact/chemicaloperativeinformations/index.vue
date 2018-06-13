<template lang="pug">
.operative-informations
  .fx-form(style="margin-top: 20px")
    .fx-item
      .fx-label Дата
      el-date-picker(v-model="selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
    .fx-item
      el-button.excel(type='default', @click="exportTable()") .

  h2(class="tableHeading") Сводка по химии

  .loading-block(v-loading="loading", element-loading-text="Таблица загружается...")
    .fx-table(v-if="opinfos && opinfos.length > 0", style="position: relative;")
      .fx-row.fx-light-grey.fx-sticky
        .fx-cell(:style="firstColStyle") Технологические операции
        .fx-cell(v-for="org in filteredOrganizations") {{org.shortName}}
      .fx-row
        .fx-cell(:style="firstColStyle") Данные актуальны на
        .fx-cell(v-for="org in orgIds") {{ getOpinfojobByOrg(org) }}
      .fx-container(v-if="chemicaloperativeinformations.length > 0" v-for="opinfo in opinfos")
        .fx-row.fx-grey
          .fx-cell {{opinfo.title}}
        .fx-container(v-for="reportLine in opinfo.reportLines")
          .fx-container(v-for="(item, index) in reportLine")
            .fx-row(v-if="index === 0", @click="changeSpoiler(`.fx-spoiler-${item.spoiler}`)")
              .fx-cell(:style="item.firstColStyle") + {{item.technologicalOperation}}
              .fx-cell(v-for="org in orgIds") {{item.organizations[org]}}
            .fx-spoiler(v-else, :class="`fx-spoiler-${item.spoiler}`")
              .fx-row
                .fx-cell(:style="item.firstColStyle") {{item.technologicalOperation}}
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
        firstColStyle: 'width: 50%; cursor: pointer;',
        chemicaloperativeinformations: [],
        organizationsshortname: [],
        works: [],
        cultures: [],
        loading: true,
        opinfojob: [],
        spoilerCount: 0,
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
        if (this.chemicaloperativeinformations.length > 0){
          this.chemicaloperativeinformations.forEach(c => {
            c.reportLines.forEach(reportLine => {
              reportLine.forEach(r => {
                r.spoiler = this.spoilerCount
                r.firstColStyle = this.firstColStyle
                r.firstColStyle += r.operativeInformationType == 3 ? 'background: #5fe359;' : r.operativeInformationType == 1 ? 'background: #0300a1; color: #fff;' : r.operativeInformationType == 2 || r.operativeInformationType == 5 || r.operativeInformationType == 6 ? 'background: #e3dc59;' : 'background: #fff;'
              })
              this.spoilerCount++
            })
            array.push(c)
          })
        }
        return array
      }
    },
    watch: {
      'selectedDate'(value) {
        this.operativeInformations = []
        this.loading = true
        this.getChemicalOperativeInformations()
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
      this.getChemicalOperativeInformations()
      this.getOperativeInfoJob()
    },
    methods: {
      afterFetch() {
        this.organizationsshortname = this.fromVuex('organizationsshortname')
        this.cultures = this.fromVuex('cultures')
        this.works = this.fromVuex('works')
      },
      getChemicalOperativeInformations() {
        let endpoint = "ChemicalOperativeInformationsReport";
        let body = {
          Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
        };
        nprogress.start()
        http.post(endpoint, body)
          .then(data => {
            if (data) {
              this.chemicaloperativeinformations = data
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
      findNameByArray(id, array) {
        let finded = array.find(c => c.id == id)
        let name = finded ? finded.name : 'не найдено'
        return name
      },
      exportTable() {
        let endpoint        = "ChemicalOperativeInformations";
        let filename        = "Сводка по химии";
        let body = {
          Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
        };
        http.downloadXLS(endpoint, body, filename);
      },
      getOpinfojobByOrg(id) {
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
