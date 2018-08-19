import http from "services/http"
import {EventBus} from "services/EventBus"
import moment from "moment"

export default {
  data() {
    return {
      traffics: [],
      loadingTraffic: true,
    };
  },
  created() {
    EventBus.$on("MapDateChanged", (date) => {
      //this.getTrafficData(date)
    })
  },
  methods: {
    getTrafficData(date) {
      let startDate = moment(date).format("YYYY-MM-DDTHH:mm:ss")
      let endDate = moment(date).add(1, "seconds").format("YYYY-MM-DDTHH:mm:ss")
      let body = {
        daterange: {
          start: startDate,
          end: endDate
        },
        organizationId: this.$root.context.organization,
        interval: 1
      }
      this.nullTrafficCars()
      this.loadingTraffic= true
      http.post("carStatus/", body).then((data) => {
        this.traffics = data
        this.paintTrafficCars()
        this.loadingTraffic = false
      }).catch(() => {
        this.loadingTraffic = false
      });
    },
    nullTrafficCars() {
      this.filteredCars.forEach(car => {
        car.color = "white"
      })
    },
    paintTrafficCars() {
      this.traffics.forEach(time => {
        time.data.forEach(traffic => {
          traffic.carIds.forEach(carId => {
            this.filteredCars.forEach(car => {
              if (car.id === carId) {
                car.color = traffic.status === 0 ? "green" : traffic.status === 1 ? "yellow" : traffic.status === 2 ? "grey" : traffic.status === 3 ? "red" : "white"
              }
            })
          })
        })
      })
      this.reRender()
    },
  }
}
