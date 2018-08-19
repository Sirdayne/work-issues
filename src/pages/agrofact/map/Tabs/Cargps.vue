<template lang="pug">
.pad-container
  el-form(
  :label-position="'top'"
  )
    el-form-item(label="Дата от:")
      el-date-picker(v-model="date.start", type="datetime", format="dd.MM.yyyy HH:mm:ss", placeholder="Выберите дату")
    el-form-item(label="Дата до:")
      el-date-picker(v-model="date.end", type="datetime", format="dd.MM.yyyy HH:mm:ss", placeholder="Выберите дату")
  el-button(type="info", @click="getTrack()", :loading="loadingBtn") Показать треки
  el-button(type="danger", @click="hideTraktorTracks()") Убрать GPS треки

</template>

<script>
import http from "services/http"
import moment from "moment";
import ListController from "mixins/ListController"
import {EventBus} from "services/EventBus";
import nprogress from "lib/NProgress";

export default {
  name: "Cargps",
  props: {
    "ids": {
      type: Array,
      default: [],
    },
  },
  mixins: [
    ListController,
  ],
  data() {
    return {
      loadingBtn: false,
      date: {
        start: this.$store.getters.getGpsStart,
        end: this.$store.getters.getGpsEnd
      }
    }
  },
  created(){
    if (this.$route.query.date) {
      this.getTrackByDate(this.$route.query.date)
    }
  },
  watch: {
    "date.start" (val) {
      this.$store.dispatch("actionSetGpsStart", val);
    },
    "date.end" (val) {
      this.$store.dispatch("actionSetGpsEnd", val);
    },
  },
  methods: {
    getTrackByDate(date){
      this.date.start = moment(date, "DD/MM/YYYY").startOf("day").format("YYYY-MM-DDTHH:mm:ss")
      this.date.end = moment(date, "DD/MM/YYYY").endOf("day").format("YYYY-MM-DDTHH:mm:ss")
      this.getTrack()
    },
    getTrack() {
      if(this.date.start && this.date.end){
        let startTime = moment(this.date.start, "YYYY-MM-DDTHH:mm:ss");
        let endTime = moment(this.date.end, "YYYY-MM-DDTHH:mm:ss");
        let hours = endTime.diff(startTime, "hours");
        if (hours < 73){
          let endpoint = `carTracks/`;
          let data = {
            CarIds: this.ids,
            date: this.date
          };
          nprogress.start()
          this.loadingBtn = true
          http.post(endpoint, data)
            .then(data => {
              this.loadingBtn = false
              nprogress.done()
              if (data && data.length > 0) {
                EventBus.$emit("MapAddCarTracks", data)
              } else {
                this.$message({
                  message: `Нет данных`,
                  type: "info",
                  duration: 5000,
                  showClose: false,
                });
              }
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
        } else {
          this.$message({
            message: `Период не должен превышать 3 дней`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        }
      } else {
        this.$message({
          message: `Выберите даты`,
          type: "info",
          duration: 5000,
          showClose: false,
        });
      }
    },
    hideTraktorTracks() {
      EventBus.$emit("RemoveTraktorTracks");
    },
  },
}
</script>

<style lang="stylus" scoped>
.pad-container
  padding 15px
  .el-form-item
    margin-bottom 12px
  .el-button
    margin-top 4px
    padding 7px 14px
</style>
