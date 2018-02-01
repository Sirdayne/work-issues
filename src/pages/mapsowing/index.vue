<template lang="pug">
.cols
  el-menu.sidebar(
  style="position: relative"
  )
    .budgets: .budget(v-for="b in budgets"): el-radio(v-model="$root.context.budget", :label="b.id") {{b.name}}
    upload
    #chart-container
      canvas#chart(height="200", width="200")

  .workspace
    #map-container
      #svgs(v-if="sowings")
        svg(v-for="field in leafletFields", width="0", height="0")
          defs
            linearGradient(:id="field.fieldId", x1="0%", y1="0%", x2="100%", y2="0%")
              stop(v-for="area in field.areas", :offset="area.area", :stop-color="area.color", stop-opacity="1", :key="area.id")
      #map
    .panel-bottom(v-if="ready")
      .passport(v-if="tab === 'passport'")
        passport( :fieldId="fieldClickedId",
                  :fields="fieldsVuex",
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
                  :orientation="true",
                )

      div(v-else)
        sevoborot(:fieldClickedId="fieldClickedId", :fieldClickedName="fieldClickedName", :croprotations="croprotations", :tab="tab")
        fieldsworks(:fieldClickedId="fieldClickedId", :fieldworks="fieldworks")


    .fx-tabs(v-if="ready")
      .fx-tab(v-for="item in tabs", @click="changeTab(item.key, item.id)", :class="{ 'fx-tab-active': item.active }") {{ item.name }}

</template>

<script>
import http from 'lib/httpQueryV2'
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'

import L from 'leaflet'
import tokml from 'tokml'
import 'leaflet-editable'
import 'leaflet-providers'
import 'leaflet-easybutton'
import 'leaflet-easyprint'
import 'leaflet/dist/leaflet.css'
import 'lib/Leaflet.PolylineMeasure'
import 'lib/Leaflet.PolylineMeasure.css'
import geodesy from 'leaflet-geodesy'

import 'leaflet-hotline'

import Chart from 'chart.js'

import sevoborot from "components/panelbottom/sevoborot"
import fieldsworks from "components/panelbottom/fieldsworks"
import upload from "components/mapsowing/upload"
import passport from "components/agromap/field/fieldpassport/passport"

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  components: {
    sevoborot,
    fieldsworks,
    upload,
    passport
  },
  data() {
    return {
      reproductions: [],
      brigades: [],
      fieldzones: [],
      fieldcontours: [],
      terrains: [],
      soiltypes: [],
      compositions: [],
      seedlimits: [],
      sorts: [],
      fieldsVuex: [],
      budgets: [],
      leafletFields: [],
      sowings: [],
      legend: [],
      croprotations: [],
      editorButtons: [],
      pieSlicesNumber: 8,
      pieOthersPercent: 10,
      pieParts: [],
      fieldworks: [],
      pieIds: [],
      pieCultures: [],
      pieAreas: [],
      pieColors: [],
      fields: new L.FeatureGroup(),
      highlightedFilteredFields: new L.FeatureGroup(),
      loading: true,
      fieldClickedId: null,
      fieldClickedName: null,
      showPanelBottom: false,
      tabs: [
        {
          id: 0,
          name: 'Паспорт',
          key: 'passport',
          active: false
        },
        {
          id: 1,
          name: 'История',
          key: 'history',
          active: true
        },
        {
          id: 2,
          name: 'План',
          key: 'plan',
          active: false
        },
      ],
      tab: 'history'
    }
  },
  created() {
    this.fetchEntities([
      'leafletFields',
      'sowings',
      'legend',
      'croprotations',
      'fieldworks',
      'budgets',
      'fieldzones',
      'fieldcontours',
      'terrains',
      'soiltypes',
      'compositions',
      'seedlimits',
      'sorts',
      'fields',
      'reproductions',
      'brigades',
    ], this.afterFetch );
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
  methods: {
    afterFetch(){
      this.budgets = this.fromVuex('budgets')
      this.leafletFields = this.fromVuex('leafletFields')
      this.sowings = this.fromVuex('sowings').filter(x => x.year === this.$root.context.year)
      this.legend = this.fromVuex('legend')
      this.croprotations = this.fromVuex('croprotations')
      this.fieldworks = this.fromVuex('fieldworks')
      this.fieldzones = this.fromVuex('fieldzones')
      this.fieldcontours = this.fromVuex('fieldcontours')
      this.terrains = this.fromVuex('terrains')
      this.soiltypes = this.fromVuex('soiltypes')
      this.compositions = this.fromVuex('compositions')
      this.seedlimits = this.fromVuex('seedlimits').filter(x => x.year === this.$root.context.year)
      this.sorts = this.fromVuex('sorts')
      this.reproductions = this.fromVuex('reproductions')
      this.fieldsVuex = this.fromVuex('fields')
      this.brigades = this.fromVuex('brigades')

      this.leafletFields = this.leafletFields.map(f => {
        f.sowings = []
        f.areas = []
        let sumArea = 0
        let i = 0
        this.sowings.forEach(x => {
          if(x.fieldId === f.fieldId){
            //sowings used for PIE
            f.sowings.push({cultureId: x.cultureId, cultureName: x.cultureName, area: x.area, color: this.getColorFromLegend(x.cultureId)})
            //areas used for SVG and GRADIENTS
            f.areas.push({id: i, area: sumArea + '%', color: this.getColorFromLegend(x.cultureId)})
            sumArea+=x.areaPercent
            i++
            f.areas.push({id: i, area: sumArea + '%', color: this.getColorFromLegend(x.cultureId)})
          }
        })
        return f
      })
      this.loading = false
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
      }
      if (this.sowings.length > 0){
        this.dividePies()
        this.createChart()
      }
    },
    getColorFromLegend(id) {
      let legend = this.legend.find(x => x.itemId === id)
      return legend.rgbColor
    },
    initMap() {
      this.drawMap();
      this.drawFields();
    },
    drawMap() {
      if (this.map) this.map.remove();
      this._addLayers();
      this._addScale();
      this._addRuler();
      this._addPrinter();
    },
    _addLayers() {
      let attribution = 'AgroStream';
      let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: attribution});
      let satellite = L.tileLayer.provider('Esri.WorldImagery', {attribution: attribution});
      let baseLayers = { "Спутник": satellite, "OpenStreetMaps": osm};
      this.map = L.map('map', {editable: true, layers: [osm]}).setView([53.2858, 69.4466], 12);
      L.control.layers(baseLayers).addTo(this.map);
    },
    _addScale() {
      L.control.scale({maxWidth:240, metric:true, imperial:false, position: 'bottomleft'}).addTo(this.map);
    },
    _addRuler() {
      L.control.polylineMeasure({position:'topright', unit:'metres', clearMeasurementsOnStop: true}).addTo(this.map);
    },
    _addPrinter() {
      L.easyPrint({
        title: 'Печать',
        position: 'topright',
        sizeModes: ['A4Landscape', 'A4Portrait'],
        defaultSizeTitles: {Current: 'Текущий', A4Landscape: 'Альбом', A4Portrait: 'Портрет'},
        filename: "карта",
        exportOnly: true,
      }).addTo(this.map);
    },
    removeFields() {
      if (this.map) {
        this.map.removeLayer(this.fields);
      }
    },
    drawFields() {
      this.removeFields()
      this.fields = new L.FeatureGroup();
      let polygons = [];
      this.highlightedPolygons = [];
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let polygon = L.polygon(latLng, {color: '#fff', fillColor: 'rgba(0,0,0,0.1)', weight: 1, fillOpacity: 0.5})
          let here = this
          let thisColor = 'rgba(0,0,0,0.1)'
          if (field.sowings.length > 0){
            field.sowings.forEach(sowing => {
              polygon = L.polygon(latLng, {color: '#fff', fillColor: 'url(#'+field.fieldId+')', weight: 1, fillOpacity: 1, className: ''});
              thisColor = 'url(#'+field.fieldId+')'
            })
          }
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.on('mouseover', function () {this.setStyle({fillColor: '#fff'})})
          polygon.on('mouseout', function () {this.setStyle({fillColor: thisColor})})
          polygon.on('click', function () {
            here.fieldClickedId = field.fieldId
            here.fieldClickedName = field.fieldName
            here.showPanelBottom = true
          })
//            if (this.selectedFields && this.selectedFields.length && this.selectedFields.includes(field.fieldId)) {
//              polygon.setStyle({color: 'black', weight: 1, fillOpacity: 0.6});
//              this.highlightedPolygons.push(polygon);
//            }
          this.fields.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.fields);

        if (polygons.length) {
          this.map.setView(this.fields.getBounds().getCenter(), 12);

          this.fields.eachLayer(polygon => {
            polygon.bindTooltip(polygon.label, {
              permanent: true,
              direction: "center",
              opacity: 1,
              className: 'tooltip-transparent'
            })
          })
        }
      }
    },
    dividePies(){
      this.pieParts = []
      this.pieIds = this.sowings.map(x => x.cultureId).filter((v, i, a) => a.indexOf(v) === i)
      this.pieIds.forEach(x => {
        let sowing = this.sowings.find(s => s.cultureId === x)
        let sum = 0
        this.sowings.forEach(s => {
          if (s.cultureId === x) {
            sum += s.area
          }
        })
        let color = this.getColorFromLegend(x)
        this.pieParts.push({cultureId: x, cultureName: sowing.cultureName, area: sum, color: color })
      })
      this.pieParts.sort(this.sortUp);
//      if (this.pieParts.length > this.pieSlicesNumber){
//        let sumPies = 0
//        for(let i = this.pieSlicesNumber; i < this.pieParts.length; i++){
//          sumPies+=this.pieParts[i].area
//        }
//        this.pieParts.splice(this.pieSlicesNumber, this.pieParts.length - this.pieSlicesNumber)
//        this.pieParts.push({ cultureName: 'Прочее', area: sumPies, color: '#fff'})
//      }
      /* Percentage for other Pies */
      let pieWholeArea = 0
      this.pieParts.forEach(x => pieWholeArea += x.area)
      let pieOthersArea = pieWholeArea * this.pieOthersPercent / 100
      let sumPies = 0
      let j = 0
      while(sumPies + this.pieParts[j+1].area < pieOthersArea) {
        sumPies+=this.pieParts[j].area
        j++
      }
      this.pieParts.splice(0, j)
      this.pieParts.push({ cultureName: 'Прочее', area: sumPies, color: '#fff'})
      /* Percentage for other Pies*/
      this.pieParts.sort(this.sortDown)
      this.pieCultures = this.pieParts.map(x => x.cultureName)
      this.pieAreas = this.pieParts.map(x => x.area)
      this.pieColors = this.pieParts.map(x => x.color)
    },
    createChart(){
      var ctx = "chart";
      var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.pieCultures,
          datasets: [{
            label: "Площадь (га)",
            backgroundColor: this.pieColors,
            data: this.pieAreas
          }]
        },
        options: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Площади культур на полях (га)'
          }
        }
      });
    },
    sortUp(a, b) {
      if (a.area > b.area) {
        return 1;
      }
      if (a.area < b.area) {
        return -1;
      }
      return 0;
    },
    sortDown(a, b) {
      if (a.area < b.area) {
        return 1;
      }
      if (a.area > b.area) {
        return -1;
      }
      return 0;
    },
    changeTab(tab, id){
      this.tabs.forEach(t => t.active = false)
      this.tabs[id].active = true
      this.tab = tab
    },
  }
}

</script>

<style lang="stylus" scoped>
.workspace
  padding 0

.budgets
  margin 8px 0

.budget
  padding 6px 18px
  font-size 13px

#svgs
  position fixed
  top 0px
  left 0px
  z-index 0

#map-container
  height calc(100% - 280px)
  width 100%
  position relative
  box-sizing border-box
  border 1px solid #323232

.panel-bottom
  height 250px
  position static

#chart-container
  width 250px
  height 250px
  position absolute
  bottom 10px
  left 35px

  #chart
    display block

#map
  height 100%
  width 100%
  box-sizing border-box

.fx-cell-edit
  position absolute
  bottom 1px
  right 1px
  height 22px
  width 28px
  padding 2px
  cursor pointer
  border-radius 4px
  border 1px solid #dfe6ec
  box-sizing border-box

@media only screen and (max-height : 660px)
  #chart-container
    position static
    margin-left 35px

</style>

