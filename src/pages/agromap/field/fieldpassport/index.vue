<template lang="pug">
.field-container(v-loading="loading", element-loading-text="Загружается...")
  .clouds
    passport( :fieldId="fieldId" )
    soilresearches( :fieldId="fieldId" )

  .cloud-graph(v-if="false")
    canvas#chart(height="100", width="200")

</template>

<script>
import ListController from "mixins/ListController"
import passport from "components/fieldpassport/passport"
import soilresearches from "components/fieldpassport/soilresearches";

import Chart from "chart.js"

export default {
  mixins: [
    ListController
  ],
  components: {
    soilresearches,
    passport,
  },
  data() {
    return {
      form: {
        field: null,
      },
      fields: [],
      loading: true,
      chart: {},
      chart2: {},
    }
  },
  computed: {
    fieldId() {
      let fieldId = this.$root.context.field
      if (fieldId){
        return fieldId
      }
      return null
    },
  },
  created() {
    this.fields = this.$root.fields
    this.loading = false
  },
  methods: {
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
        type: "line",
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
          title: {
            display: true,
            text: "Температура"
          },
          tooltips: {
            mode: "index",
            intersect: false,
          },
          hover: {
            mode: "nearest",
            intersect: true
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Date"
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: "Value"
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

.field-container span
  font-weight 100

#chart
  display block

</style>
