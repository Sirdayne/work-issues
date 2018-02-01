<template lang="pug">
div.cols
  el-menu.sidebar(v-if="sidebarToggleState", unique-opened=true)
    el-menu-item(index="1", v-scroll-to="'#scroll-structures'") Структуры
    el-menu-item(index="2", v-scroll-to="'#scroll-works'") Работы
  .workspace
    h1 DASHTEST
    div(id="chartdiv-dash")
    div(id="chartdiv-2")
    div(id="chartdiv")

</template>

<script>
import httpQueryV2 from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods'
import VueChartist from 'v-chartist'
import $ from 'jquery'
import moment from 'moment'
import './dashboard.styl'

import localForageLib from 'lib/localForageLib'
import {EventBus} from 'services/EventBus';

import 'amcharts3';
import 'amcharts3/amcharts';
import 'amcharts3/amcharts/serial';
import 'amcharts3/amcharts/gantt';

window.AmCharts_path = 'node_modules/amcharts3/amcharts';

export default {
  mixins: [
    RecordsLoaderV2
  ],
  components: {
    VueChartist
  },
  created() {
    this.fetchEntities([
      'cultures',
//      'works',
//      'fields',
//      'AreaAssignments',
//      'workTypes',
//      'seedLimits',
//      'cttops',
//      'operations',
//      'technologyRecipe',
//      'workdates',
//      'growthphases'
    ], this.afterFetch );
  },
  mounted() {
    // для vue-scroll, scrolling - надо поменять высоту на %
    var elApp = document.querySelector('#app');
    elApp.style.height = "100%";
    //scroll в начале
    this.$scrollTo('#dashboard-container');

    let chartDash = AmCharts.makeChart("chartdiv-dash", {

      "type": "gantt",
      "period": "DD",

      "valueAxis": {
        "type": "date"
      },
      "brightnessStep": 10,
      "graph": {
        "fillAlphas": 1,
        "balloonText": "[[open]] - [[value]]"
      },
      "rotate": true,
      "categoryField": "category",
      "segmentsField": "segments",
      "dataDateFormat": "YYYY-MM-DD",
      "startDateField": "start",
      "endDateField": "end",

      "dataProvider": this.dataChart,

      "chartCursor": {
        "valueBalloonsEnabled": false,
        "cursorAlpha": 0,
        "valueLineBalloonEnabled": true,
        "valueLineEnabled": true,
        "valueZoomable":true,
        "zoomable":false
      },

      "valueScrollbar": {
        "position":"top",
        "autoGridCount":true,
        "color":"#000000"
      }
    });

    let chartDash2 = AmCharts.makeChart("chartdiv-2", {

      "type": "gantt",
      "period": "DD",

      "valueAxis": {
        "type": "date"
      },
      "brightnessStep": 10,
      "graph": {
        "fillAlphas": 1,
        "balloonText": "[[open]] - [[value]]"
      },
      "rotate": true,
      "categoryField": "category",
      "segmentsField": "segments",
      "dataDateFormat": "YYYY-MM-DD",
      "startDateField": "start",
      "endDateField": "end",

      "dataProvider": this.dataChart,

      "chartCursor": {
        "valueBalloonsEnabled": false,
        "cursorAlpha": 0,
        "valueLineBalloonEnabled": true,
        "valueLineEnabled": true,
        "valueZoomable":true,
        "zoomable":false
      },

      "valueScrollbar": {
        "position":"top",
        "autoGridCount":true,
        "color":"#000000"
      }
    });

    /* LINE CHART */

    var chart;
    var chartData = [];

    // generate some random data first
    generateChartData();

    // SERIAL CHART
    chart = new AmCharts.AmSerialChart();

    chart.dataProvider = chartData;
    chart.categoryField = "date";

    // listen for "dataUpdated" event (fired when chart is inited) and call zoomChart method when it happens
    chart.addListener("dataUpdated", zoomChart);

    chart.synchronizeGrid = true; // this makes all axes grid to be at the same intervals

    // AXES
    // category
    var categoryAxis = chart.categoryAxis;
    categoryAxis.parseDates = true; // as our data is date-based, we set parseDates to true
    categoryAxis.minPeriod = "DD"; // our data is daily, so we set minPeriod to DD
    categoryAxis.minorGridEnabled = true;
    categoryAxis.axisColor = "#DADADA";
    categoryAxis.twoLineMode = true;
    categoryAxis.dateFormats = [{
      period: 'fff',
      format: 'JJ:NN:SS'
    }, {
      period: 'ss',
      format: 'JJ:NN:SS'
    }, {
      period: 'mm',
      format: 'JJ:NN'
    }, {
      period: 'hh',
      format: 'JJ:NN'
    }, {
      period: 'DD',
      format: 'DD'
    }, {
      period: 'WW',
      format: 'DD'
    }, {
      period: 'MM',
      format: 'MMM'
    }, {
      period: 'YYYY',
      format: 'YYYY'
    }];

    // first value axis (on the left)
    var valueAxis1 = new AmCharts.ValueAxis();
    valueAxis1.axisColor = "#FF6600";
    valueAxis1.axisThickness = 2;
    chart.addValueAxis(valueAxis1);

    // second value axis (on the right)
    var valueAxis2 = new AmCharts.ValueAxis();
    valueAxis2.position = "right"; // this line makes the axis to appear on the right
    valueAxis2.axisColor = "#FCD202";
    valueAxis2.gridAlpha = 0;
    valueAxis2.axisThickness = 2;
    chart.addValueAxis(valueAxis2);

    // third value axis (on the left, detached)
    var valueAxis3 = new AmCharts.ValueAxis();
    valueAxis3.offset = 50; // this line makes the axis to appear detached from plot area
    valueAxis3.gridAlpha = 0;
    valueAxis3.axisColor = "#B0DE09";
    valueAxis3.axisThickness = 2;
    chart.addValueAxis(valueAxis3);

    // GRAPHS
    // first graph
    var graph1 = new AmCharts.AmGraph();
    graph1.valueAxis = valueAxis1; // we have to indicate which value axis should be used
    graph1.title = "red line";
    graph1.valueField = "visits";
    graph1.bullet = "round";
    graph1.hideBulletsCount = 30;
    graph1.bulletBorderThickness = 1;
    chart.addGraph(graph1);

    // second graph
    var graph2 = new AmCharts.AmGraph();
    graph2.valueAxis = valueAxis2; // we have to indicate which value axis should be used
    graph2.title = "yellow line";
    graph2.valueField = "hits";
    graph2.bullet = "square";
    graph2.hideBulletsCount = 30;
    graph2.bulletBorderThickness = 1;
    chart.addGraph(graph2);

    // third graph
    var graph3 = new AmCharts.AmGraph();
    graph3.valueAxis = valueAxis3; // we have to indicate which value axis should be used
    graph3.valueField = "views";
    graph3.title = "green line";
    graph3.bullet = "triangleUp";
    graph3.hideBulletsCount = 30;
    graph3.bulletBorderThickness = 1;
    chart.addGraph(graph3);

    // CURSOR
    var chartCursor = new AmCharts.ChartCursor();
    chartCursor.cursorAlpha = 0.1;
    chartCursor.fullWidth = true;
    chartCursor.valueLineBalloonEnabled = true;
    chart.addChartCursor(chartCursor);

    // SCROLLBAR
    var chartScrollbar = new AmCharts.ChartScrollbar();
    chart.addChartScrollbar(chartScrollbar);

    // LEGEND
    var legend = new AmCharts.AmLegend();
    legend.marginLeft = 110;
    legend.useGraphSettings = true;
    chart.addLegend(legend);

    // WRITE
    chart.write("chartdiv");

    // generate some random data, quite different range
    function generateChartData() {
      var firstDate = new Date();
      firstDate.setDate(firstDate.getDate() - 50);

      for (var i = 0; i < 50; i++) {
        // we create date objects here. In your data, you can have date strings
        // and then set format of your dates using chart.dataDateFormat property,
        // however when possible, use date objects, as this will speed up chart rendering.
        var newDate = new Date(firstDate);
        newDate.setDate(newDate.getDate() + i);

        var visits = Math.round(Math.random() * 40) + 100;
        var hits = Math.round(Math.random() * 80) + 500;
        var views = Math.round(Math.random() * 6000);

        chartData.push({
          date: newDate,
          visits: visits,
          hits: hits,
          views: views
        });
      }
    }

    // this method is called when chart is first inited as we listen for "dataUpdated" event
    function zoomChart() {
      // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
      chart.zoomToIndexes(10, 20);
    }

    let domA = $('.amcharts-chart-div a')
    domA.hide()

  },
  data() {
    return {
      areaAssignmentsSubOperationId: [],
      unique: [],
      dates: [
        { name: '1 апр. 2017 г.', area: 466000, underCrops: 240000 ,averageBalbonitet: 120 ,numberAreas: 20 },
        { name: '2 апр. 2017 г.', area: 466001, underCrops: 240001 ,averageBalbonitet: 121 ,numberAreas: 21  },
        { name: '3 апр. 2017 г.', area: 466002, underCrops: 240002 ,averageBalbonitet: 122 ,numberAreas: 22 },
        { name: '4 апр. 2017 г.', area: 466003, underCrops: 240003 ,averageBalbonitet: 123 ,numberAreas: 23 }
      ],
      pies:[
        { pieOne: 10, pieTwo: 15, pieThree: 20, pieFour: 25, pieFive: 30 },
        { pieOne: 11, pieTwo: 14, pieThree: 19, pieFour: 26, pieFive: 30 },
        { pieOne: 12, pieTwo: 13, pieThree: 18, pieFour: 27, pieFive: 30 },
        { pieOne: 13, pieTwo: 12, pieThree: 17, pieFour: 28, pieFive: 30 },
      ],
      min: 0,
      value1: 9,
      value2: 1,
      value3: 1,
      rendered1: true,
      rendered2: true,
      rendered3: true,
      elSliderDate1: '',
      elSliderDate2: '',
      otherCulturesDisplay: false,
      otherWorksDisplay: false,
      culturesUpdated: 1,
      vuexGrowthPhases: null,
      vuexCultures: null,
      vuexSeedLimits: null,
      vuexWorks: null,
      workDates: null,
      cttops: null,
      operations: null,
      recipes: null,
      fields: null,
      areaAssignments: null,
      workTypes: null,
      localForageArrays: {
        culturesDB: [],
        cttopsUniqueDB: [],
        worksDatesDB: [],
      },
      dataChart: [
        {
          "category": "Culture 1",
          "segments": [{
            "start": "2017-01-02",
            "end": "2017-02-03"
          }, {
            "start": "2017-03-04",
            "end": "2017-04-05"
          }, {
            "start": "2017-04-07",
            "end": "2017-06-10"
          }]
        },

        {
          "category": "Culture 2",
          "segments": [{
            "start": "2017-01-01",
            "end": "2017-06-02"
          }, {
            "start": "2017-07-10",
            "end": "2017-12-15"
          }]
        },

        {
          "category": "Culture 3",
          "segments": [{
            "start": "2017-01-06",
            "end": "2017-04-09"
          }, {
            "start": "2017-05-11",
            "end": "2017-08-18"
          }, {
            "start": "2017-09-22",
            "end": "2017-10-21"
          }]
        }

      ],

    }
  },
  methods: {
    afterFetch(){
//      this.vuexGrowthPhases = this.fromVuex('growthphases');
      this.vuexCultures = this.fromVuex('cultures');
//      this.vuexSeedLimits = this.fromVuex('seedLimits');
//      this.vuexWorks = this.fromVuex('works');
//      this.vuexWorkDates =this.fromVuex('workDates');
//      this.vuexCttops = this.fromVuex('cttops');
//      this.vuexOperations = this.fromVuex('operations');
//      this.vuexRecipes = this.fromVuex('technologyRecipe');
//      this.vuexFields = this.fromVuex('fields');
//      this.vuexAreaAssignments = this.fromVuex('AreaAssignments');
//      this.vuexWorkTypes = this.fromVuex('workTypes');
      //from IndexedDB
//      localForageLib.getLocalForage('cttopsUniqueDB', this.computedCttopsUnique );
//      localForageLib.getLocalForage('worksDatesDB', this.computedWorksDates );
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  }
}
</script>

<style lang="stylus" scoped>

#chartdiv-dash
  height 400px
  width 100%

#chartdiv-2
  height 400px
  width 100%

#chartdiv
  height 400px
  width 100%

.amcharts-chart-div a
  display none

</style>
