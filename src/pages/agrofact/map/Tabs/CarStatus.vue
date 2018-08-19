<template lang="pug">
.status-content
  el-dialog(:title="carInfoTitle", :visible.sync="dialogVisible", size="tiny", :before-close="handleClose", :modal="false")
    template(v-if="carInfo.length")
      ol(class="car-info")
        li(v-for="c in carInfo") {{ c.displayString }}
  template(v-for="status in statuses")
    div(class="status") {{ status.name + ': ' + status.value}}
      div(class="color-status", :style="{width: countPercentage(status.value) * 2.5 + 'px', background: status.color}", @click="showCarInfo(status.data)")
  template(v-if="!statuses.length")
    .no-data Нет данных
</template>

<script>
import {EventBus} from "services/EventBus"
import moment from "moment";

export default {
  props: {
    "carstatus": {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      carInfo: [],
      carInfoTitle: null,
      dialogVisible: false,
      mapDate: this.$store.getters.getMapDate
    }
  },
  created() {
    EventBus.$on("MapDateChanged", (date) => {
      this.mapDate = date
    })
  },
  computed: {
    filteredCarStatus() {
      return this.carstatus && this.carstatus.nextRows && this.carstatus.nextRows.length
        ? this.carstatus.nextRows.filter(c => {
          let mapDate = moment(this.mapDate).format("DD.MM.YYYY")
          let date = moment(c.date).format("DD.MM.YYYY")
          if (mapDate === date) {
            return c;
          }
        })
        : [];
    },
    statuses() {
      let statuses = [];
      let name, color;

      this.filteredCarStatus.map(c => {
        c.data.map(d => {
          switch (d.rowHeaderType) {
          case 1 : name = "Работало"; color = "green"; break;
          case 2 : name = "Простои"; color = "orange"; break;
          case 3 : name = "Стоянка"; color = "orange"; break;
          case 4 : name = "Нет данных GPS"; color = "red"; break;
          case 5 : name = "Не установлен GPS трекер"; color = "red"; break;
          }
          statuses.push({
            name: name,
            legend: d.rowHeader,
            value: d.tractor.length + d.combine.length + d.sprayer.length + d.truck.length,
            color: color,
            data: {
              title: name,
              cars: {
                tractor: d.tractor,
                combine: d.combine,
                sprayer: d.sprayer,
                truck: d.truck,
              }
            }
          })
        });
      });
      return statuses;
    },
    totalAmountOfCars() {
      return this.$store.getters.getEntities("cars").length;
    }
  },
  methods: {
    handleClose(done) {
      this.carInfo = [];
      this.carInfoTitle = null;
      done();
    },
    showCarInfo(data) {
      let cars = data.cars;
      let title = data.title;

      for (let i in cars) {
        if (cars[i].length) {
          for (let j in cars[i]) {
            let carId = cars[i][j];
            let car = this.$store.getters.getEntities("cars").find(c => c.id === carId);
            this.carInfo.push(car);
          }
        }
      }

      this.carInfoTitle = title;
      this.dialogVisible = true;
    },
    countPercentage(amount) {
      return (amount * 100) / this.totalAmountOfCars;
    },
  },
}
</script>

<style lang="stylus" scoped>
.status-content
  padding 10px 0 0 10px
.status
  font-size 0.6rem
  width 250px
  margin-bottom 10px
.car-info >>> li
  margin-bottom 15px
.color-status
  background green
  padding 3px 10px
  color white
  width 0px
  height 10px
.color-status:hover
  cursor pointer
.no-data
  width 100%
  line-height 14px
  font-size 12px
  margin-top 10px
  text-align center
</style>
