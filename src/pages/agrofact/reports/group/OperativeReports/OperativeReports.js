import http from "services/http"
import {EventBus} from "services/EventBus"
import ListController from "mixins/ListController"
import moment from "moment"
import $ from "jquery"

export default {
  mixins: [
    ListController
  ],
  data() {
    return {
      selectedDate: moment().year(this.$root.context.year).subtract(1, "days").format(),
      firstColStyle: "width: 50%;",
      organizationsshortname: [],
      operativeinformations: [],
      opinfojob: [],
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
  created() {
    EventBus.$on("AppYearChanged", (year) => {
      this.selectedDate = new Date(new Date(this.selectedDate).setFullYear(year));
    })
  },
  methods: {
    _getOperativeInformations() {
      let endpoint = this.endpoint;
      let body = {
        organizationId: this.$root.context.organization,
        Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
      };
      http.post(endpoint, body)
        .then(data => {
          if (data) {
            this.operativeinformations = data
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
    getOpinfojobByOrg(id) {
      let found = this.opinfojob.find(o => o.organizationId === id)
      let date = "нет данных"
      if (found && found.processed) {
        date = moment.utc(found.processed).local().format("HH:mm:ss DD/MM/YYYY")
      }
      if (id === 0){
        date = this.getMinDate()
      }
      return date
    },
    getMinDate() {
      let min = this.opinfojob[0].processed
      this.opinfojob.forEach(item => {
        let firstDate = moment(min, "YYYY-MM-DDTHH:mm:ss")
        let secondDate = moment(item.processed, "YYYY-MM-DDTHH:mm:ss")
        if (firstDate > secondDate){
          min = item.processed
        }
      })
      if (min) {
        min = moment.utc(min).local().format("HH:mm:ss DD/MM/YYYY")
      } else {
        min = "нет данных"
      }
      return min
    },
    _getOperativeInfoJob() {
      let endpoint = `JobStats`
      http.getWithoutCache(endpoint)
        .then(data => {
          this.opinfojob = data
        })
    },
    exportTable() {
      let endpoint        = this.xlsEndpoint;
      let filename        = this.xlsName;
      let body = {
        organizationId: this.$root.context.organization,
        Date: moment(this.selectedDate).format("YYYY-MM-DDTHH:mm:ss"),
      };
      http.downloadXLS(endpoint, body, filename);
    },
    findNameByArray(id, array) {
      let found = array.find(c => c.id == id)
      let name = found ? found.name : "не найдено"
      return name
    },
    changeSpoiler(spoiler){
      $(spoiler).slideToggle(500)
    },
    closeSpoilers() {
      $(".fx-spoiler").hide()
    }
  }
}
