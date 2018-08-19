<template lang="pug">
.cloud
  .cloud-row Хим элементы
    span {{ soils.formatDate }}
  .cloud-row Кислотность
    span {{ soils.sourness }}
  .cloud-row Азот
    span {{ soils.nitrogen }}
  .cloud-row Фосфор
    span {{ soils.phosphorus }}
  .cloud-row Калий
    span {{ soils.potassium }}
  .cloud-row Гумус
    span {{ soils.organic }}
  .cloud-row Сера
    span {{ soils.sulfur }}

  .weather-cont(v-if="currentWeather && currentWeatherLoading")
    .weather-div
      h3 Погода
      h4(style="font-weight: 100") {{ currentWeather.current.condition.text }}
      img(:src="currentWeather.current.condition.icon")
      h5 {{ currentWeather.current.temp_c }}&#8451
      .weather-extra
        h4 Влажность: {{ currentWeather.current.humidity }}%
        h4 Ветер: {{ currentWeather.current.wind_kph }}км/ч
  .weather-cont(v-else)
    .w-loading Загрузка...
</template>

<script>

import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"
import nprogress from "lib/NProgress"

export default {
  mixins: [
    
    ListController
  ],
  props: {
    "fieldId": {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      soilResearches: null,
      currentWeather: null,
      currentWeatherLoading: false,
      leafletFields: [],
    }
  },
  watch: {
    "fieldId" (val, oldVal) {
      this.soilResearches = {}
      this.getCurrentWeather(val)
      this.init(val)
    },
  },
  created() {
    this.getCurrentWeather(this.fieldId)
    this.init(this.fieldId)
    fetchEntities([
      "leafletFields",
    ], this.afterFetch );
  },
  computed: {
    soils() {
      let format = {
        formatDate: "нет данных",
        sourness: "нет данных",
        nitrogen: "нет данных",
        phosphorus: "нет данных",
        potassium: "нет данных",
        organic: "нет данных",
        sulfur: "нет данных",
      }
      if (this.soilResearches){
        format = Object.assign({}, this.soilResearches)
        format.formatDate = moment(format.date, "YYYY-MM-DDTHH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
      }
      return format
    },
  },
  methods: {
    afterFetch(){
      this.leafletFields = fromVuex("leafletFields")
      this.loading = false
    },
    init(fieldId){
      this.soilResearches = null
      let endpoint = `SoilResearches/${this.$root.context.organization}/${fieldId}`;
      nprogress.start()
      http.get(endpoint)
        .then(data => {
          if (data) {
            this.soilResearches = data
          }
          nprogress.done()
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
    getCurrentWeather(fieldId) {
      if (this.$root.fields) {
        let leafletField = this.leafletFields.find(lf => fieldId === lf.fieldId)
        if (leafletField){
          let coordinates = this.skipArray(JSON.parse(leafletField.kml))
          this.currentWeatherLoading = false
          http.getWeather("current.json", coordinates).then(response => {
            this.currentWeather = response
            this.currentWeatherLoading = true
          })
        }
      }
    },
    skipArray(arg, prev) {
      if(Array.isArray(arg)){
        return this.skipArray(arg[0], arg)
      } else {
        return prev[0] + "," + prev[1]
      }
    },
  },
}
</script>

<style lang="stylus" scoped>

.weather-cont
  float left
  width 100%
  .w-loading
    float left
    width 100%
    text-align center
    margin 40px 0

.weather-div
  h3
    width 100%
    margin 8px 0 8px 5px
    font-size 15px
  h4
    width 100%
    margin 5px 0 5px 5px
    font-size 14px
  img
    float left
    height 64px
    width auto
  h5
    float left
    margin 0 15px 0 0px
    height 64px
    width auto
    line-height 64px
    font-size 24px
  .weather-extra
    width 100px
    float left
    margin-top 10px
    h4
      float left
      width 100%
      font-size 12px
      margin 5px 0

</style>

