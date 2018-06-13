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
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import moment from 'moment';
import ListController from 'mixins/ListController'
import {EventBus} from 'services/EventBus';
import { Message } from 'element-ui';
import nprogress from 'lib/NProgress';

export default {
  name: "Cargps",
  props: [
    "ids",
  ],
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  data() {
    return {
      loadingBtn: false,
      date: {
        start: this.$store.getters.getGpsDateStart,
        end: this.$store.getters.getGpsDateEnd
      }
    }
  },
  created(){
    if (this.$route.query.carGpsDate) {
      this.getTrackByDate(this.$route.query.carGpsDate)
    }
  },
  watch: {
    'date.start' (val, oldVal) {
      this.$store.dispatch('actionSetGpsDateStart', val);
    },
    'date.end' (val, oldVal) {
      this.$store.dispatch('actionSetGpsDateEnd', val);
    },
  },
  methods: {
    getTrackByDate(date){
      this.date.start = moment(date, 'DD/MM/YYYY').hour(0).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss')
      this.date.end = moment(date, 'DD/MM/YYYY').hour(23).minute(59).second(59).format('YYYY-MM-DDTHH:mm:ss')
      this.getTrack()
    },
    getTrack() {
      if(this.date.start && this.date.end){
        let startTime = moment(this.date.start, 'YYYY-MM-DDTHH:mm:ss');
        let endTime = moment(this.date.end, 'YYYY-MM-DDTHH:mm:ss');
        let hours = endTime.diff(startTime, 'hours');
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
                EventBus.$emit('CarDataTracks', data)
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
      EventBus.$emit('RemoveTraktorTracks');
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
