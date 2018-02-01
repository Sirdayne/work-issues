<template lang="pug">
.field-container(v-loading="loading", element-loading-text="Загружается...")
  .clouds
    passport( :fieldId="fieldId",
              :fields="fields",
              :brigades="brigades",
              :fieldzones="fieldzones",
              :fieldcontours="fieldcontours",
              :terrains="terrains",
              :soiltypes="soiltypes",
              :compositions="compositions",
              :croprotations="croprotations",
              :seedlimits="seedlimits",
              :sorts="sorts",
              :sowings="sowings",
              :reproductions="reproductions",
            )

    .cloud
      .cloud-row Хим элементы, обновлено дата
      .cloud-row N,кг/га
      .cloud-row P205,кг/га
      .cloud-row K20 мг/га
      .cloud-row Гумус
      .cloud-row PH
      .cloud-row S, мг/га
      .cloud-row NDVI, обновлено дата
      .cloud-row Показатель
      .cloud-row От среднего
      .cloud-row Сумма эффективных температур
      .cloud-row От даты сева
      .cloud-row С начала года
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

    .cloud
      .cloud-row Спутниковый снимок

  .cloud-graph
    canvas#chart(height="100", width="200")

  div(v-if="currentWeather")
    p(v-for="(index, item) in currentWeather.location") {{ item }}: {{ index }}
    p(v-for="(index, item) in currentWeather.current") {{ item }}: {{ index }}

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import moment from 'moment'
  import ListController from 'mixins/ListController'
  import passport from "components/agromap/field/fieldpassport/passport"

  import Chart from 'chart.js'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    components: {
      passport,
    },
    data() {
      return {
        form: {
          field: null,
        },
        fields: [],
        fieldzones: [],
        fieldcontours: [],
        terrains: [],
        soiltypes: [],
        compositions: [],
        brigades: [],
        croprotations: [],
        loading: [],
        leafletFields: [],
        seedlimits: [],
        sowings: [],
        sorts: [],
        reproductions: [],
        chart: {},
        chart2: {},
        currentWeather: null,
        currentWeatherLoading: false,
      }
    },
    computed: {
      fieldId() {
        let fieldId = this.$root.context.field
        if (fieldId){
          this.getCurrentWeather(fieldId)
          return fieldId
        }
        return null
      },
    },
    created() {
      this.fields = this.$root.fields

      this.fetchEntities([
        'fieldzones',
        'fieldcontours',
        'terrains',
        'soiltypes',
        'compositions',
        'brigades',
        'croprotations',
        'leafletFields',
        'seedlimits',
        'sowings',
        'sorts',
        'reproductions',
      ], this.afterFetch );
    },
    methods: {
      afterFetch(){
        this.leafletFields = this.fromVuex('leafletFields')
        this.fieldzones = this.fromVuex('fieldzones')
        this.fieldcontours = this.fromVuex('fieldcontours')
        this.terrains = this.fromVuex('terrains')
        this.soiltypes = this.fromVuex('soiltypes')
        this.compositions = this.fromVuex('compositions')
        this.brigades = this.fromVuex('brigades')
        this.croprotations = this.fromVuex('croprotations')
        this.seedlimits = this.fromVuex('seedlimits').filter(x => x.year === this.$root.context.year)
        this.sowings = this.fromVuex('sowings').filter(x => x.year === this.$root.context.year)
        this.sorts = this.fromVuex('sorts')
        this.reproductions = this.fromVuex('reproductions')

        this.createChart()

        this.loading = false
      },
      getCurrentWeather(fieldId) {
        if (this.$root.fields) {
          let leafletField = this.leafletFields.find(lf => fieldId === lf.fieldId)
          if (leafletField){
            let coordinates = this.skipArray(JSON.parse(leafletField.kml))
            this.currentWeatherLoading = false
            http.getWeather('current.json', coordinates).then(response => {
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
          return prev[0] + ',' + prev[1]
        }
      },
      getRand(min, max) {
        return Math.random() * (max - min) + min;
      },
      getDataChart(chart){
        chart.date = []
        chart.temp = []
        for(let i = 0; i < 62; i++){
          if( i < 31)
            chart.date.push(i%31 +" сен")
          else
            chart.date.push(i%31 +" окт")
          chart.temp.push( Math.round(this.getRand(-10, 10)) )
        }
      },
      createChart(){
        this.getDataChart(this.chart)
        //this.getDataChart(this.chart2)
        new Chart(document.getElementById("chart"), {
          type: 'line',
          data: {
            labels: this.chart.date,
            datasets: [{
              data: this.chart.temp,
              label: "°C",
              borderColor: "#3e95cd",
              fill: false
            },

            ]
          },
          options: {
            responsive: true,
            title:{
              display: true,
              text:'Температура'
            },
            tooltips: {
              mode: 'index',
              intersect: false,
            },
            hover: {
              mode: 'nearest',
              intersect: true
            },
            scales: {
              xAxes: [{
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: 'Date'
                }
              }],
              yAxes: [{
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: 'Value'
                }
              }]
            }
          }
        });
      },
    }
  }

</script>

<style scoped>
  .tableHeading {
    display: inline-block;
    margin-right: 20px;
  }

  .downloadLzkStyle {
    display: block;
    margin-top: 20px;
  }

  .downloadFieldSelect {
    width: 250px;
  }

</style>

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

.field-container span
  font-weight 100

.el-tag
  padding 0 2px
  height 20px
  line-height 18px
  font-size 11px
  margin-left 2px

#chart
  display block

</style>
