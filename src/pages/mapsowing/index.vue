<template lang="pug">
.cols(v-loading="loading", element-loading-text="Загрузка...")
  el-menu.sidebar(
    :class="{'closed-sidebar': !sidebarToggleState}",
    style="position: relative",
  )
    .budgets: .budget(v-for="b in budgets"): el-radio(v-model="$root.context.budget", :label="b.id") {{b.name}}
    .chart-container
      canvas.chart#chart-cultures(height="200", width="200")
    .chart-container
      canvas.chart#chart-sorts(height="200", width="200")
    .chart-container
      canvas.chart#chart-ripeness(height="200", width="200")

  .workspace
    #map-container(:class="{'map-active': showPanelBottom}")
      #svgs(v-if="sowings")
        svg(v-for="field in leafletFields", width="0", height="0")
          defs
            linearGradient(:id="field.fieldId", x1="0%", y1="0%", x2="100%", y2="0%")
              stop(v-for="area in field.areas", :offset="area.area", :stop-color="area.color", stop-opacity="1", :key="area.numvfor")
      h1.map-print-title(v-show="mapPrintState == 'started'", leaflet-browser-print-content) {{mapPrintTitle}}
      #map
        .map-culture-filter
          el-select(v-model="selectedCulture", clearable, filterable)
            el-option(
              v-for="item in filteredCultures",
              :label="item.nameAndTotalArea",
              :value="item.id",
              :key="item.id",
              :style="{color: item.color}",
            )
      table(leaflet-browser-print-pages)
        tr(v-for="(item, index) in filteredCultures")
          td(:style="{backgroundColor: item.color, width: '15px'}")
          td() {{ item.nameAndTotalArea }}
      .panel-legend(v-if="showPanelLegend")
        .panel-legend-row(v-for="item in filteredCultures")
          p {{item.name}}
          .color-legend(:style=`{background: item.color}`)
    .panel-bottom(v-if="ready && showPanelBottom")
      .passport(v-if="tab === 'passport'")
        passport( :fieldId="fieldClickedId",
                  :orientation="true")

      div(v-else)
        sevoborot(:fieldClickedId="fieldClickedId", :fieldClickedName="fieldClickedName", :year="true")
        fieldsworks(:fieldClickedId="fieldClickedId", :fieldworks="fieldworks")


    .fx-tabs(v-if="ready && showPanelBottom")
      .fx-tab(v-for="item in tabs", @click="changeTab(item.key, item.id)", :class="{ 'fx-tab-active': item.active }") {{ item.name }}

</template>

<script>
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import randomcolor from 'randomcolor'
import Chart from 'chart.js'
import sevoborot from "components/panelbottom/sevoborot"
import fieldsworks from "components/panelbottom/fieldsworks"
import passport from "components/agromap/field/fieldpassport/passport"

import L from 'leaflet'
import 'leaflet-editable'
import 'leaflet-providers'
import 'leaflet-easybutton'
import 'leaflet.browser.print/dist/leaflet.browser.print.min.js'
import 'leaflet/dist/leaflet.css'
import 'lib/Leaflet.PolylineMeasure'
import 'lib/Leaflet.PolylineMeasure.css'
import geodesy from 'leaflet-geodesy'

import 'leaflet-hotline'

import fontawesome from '@fortawesome/fontawesome'
import faSearchPlus from '@fortawesome/fontawesome-free-solid/faSearchPlus'
import faUndo from '@fortawesome/fontawesome-free-solid/faUndo'

fontawesome.library.add(faSearchPlus)
fontawesome.library.add(faUndo)

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  components: {
    sevoborot,
    fieldsworks,
    passport
  },
  data() {
    return {
      budgets: [],
      leafletFields: [],
      lfCultureIds: [],
      sowings: [],
      legend: [],
      fieldworks: [],
      cultures: [],
      sorts: [],
      ripenessgroups: [],
      selectedCulture: null,
      fields: new L.FeatureGroup(),
      highlightedFilteredFields: new L.FeatureGroup(),
      loading: true,
      fieldClickedId: null,
      fieldClickedName: null,
      fieldClickedPolygon: null,
      tabs: [
        { id: 0, name: 'Паспорт', key: 'passport', active: false},
        { id: 1, name: 'История', key: 'history', active: true}
      ],
      tab: 'history',
      mapPrintTitle: `Карта размещения посевов на ${this.$root.context.year} год`,
      mapPrintState: "",
      vuexFields: [],
      noneColor: 'rgba(170, 170, 170, 1)',
      showPanelBottom: false,
      showPanelLegend: false,
      legendButton: null,
      bottomButton: null,
      charts: {
        'chart-cultures': null,
        'chart-sorts': null,
        'chart-ripeness': null
      },
    }
  },
  created() {
    this.fetchEntities([
      'leafletFields',
      'sowings',
      'legend',
      'fieldworks',
      'budgets',
      'cultures',
      'sorts',
      'ripenessgroups',
      'fields',
    ], this.afterFetch );
  },
  watch: {
    'selectedCulture'(val, oldVal) {
      let findedCulture = this.cultures.find(c => c.id === val)
      this.drawPies(findedCulture)
      this.fields.eachLayer(polygon => {
        if (polygon.cultureIds.indexOf(val) > -1 || val == ''){
          polygon.setStyle({fillColor: 'url(#'+polygon.fieldId+')'})
          polygon.on('mouseout', () => { polygon.setStyle({fillColor: 'url(#'+polygon.fieldId+')'}) })
        } else {
          polygon.setStyle({fillColor: this.noneColor})
          polygon.on('mouseout', () => { polygon.setStyle({fillColor: this.noneColor}) })
        }
      })
    },
  },
  computed: {
    sidebarToggleState() {
      if (this.map){
        this.map._onResize()
        this.map.invalidateSize()
      }
      return this.$store.getters.getSidebarToggleState
    },
    filteredCultures() {
      let cultures = this.cultures.filter(x => this.lfCultureIds.indexOf(x.id) > -1)
      cultures.map(c => {
        let totalArea = 0
        this.fields.eachLayer(polygon => {
          if (polygon.cultureIds.indexOf(c.id) > -1) {
            let s = this.sowings.find(s => s.fieldId == polygon.fieldId && s.cultureId == c.id)
            let a = s && s.area || 0
            totalArea += a
          }
        })
        c.color = this.getColorFromLegend(c.id)
        c.nameAndTotalArea = [c.shortName, "-", totalArea, "га"].join(" ")
        return c
      })
      return cultures
    },
  },
  methods: {
    afterFetch(){
      this.budgets = this.fromVuex('budgets')
      this.legend = this.fromVuex('legend')
      this.fieldworks = this.fromVuex('fieldworks')
      this.cultures = this.fromVuex('cultures')
      this.vuexFields = this.fromVuex('fields')
      this.sorts = this.fromVuex('sorts')
      this.ripenessgroups = this.fromVuex('ripenessgroups')
      this.sowings = this.fromVuex('sowings').filter(x => x.year === this.$root.context.year)
      this.sowings.forEach(sowing => {
        let sort = this.sorts.find(s => s.id == sowing.cultureSortId)
        sowing.ripenessGroupId = sort ? sort.ripenessGroupId : 'нет данных'
      })

      this.leafletFields = this.fromVuex('leafletFields').map(f => {
        f.areas = []
        f.cultureIds = []
        let sumArea = 0
        let numvfor = 0
        let findedField = false
        this.sowings.forEach(x => {
          if (x.fieldId === f.fieldId) {
            findedField = true
            f.cultureIds.push(x.cultureId)
            this.lfCultureIds.push(x.cultureId)
          }
        })
        this.sowings.forEach(x => {
          if(x.fieldId === f.fieldId) {
            let color = this.getColorFromLegend(x.cultureId)
            if (f.cultureIds.length <= 1) sumArea += x.areaPercent
            f.areas.push({numvfor: numvfor++, area: sumArea + '%', color: color})
            if (f.cultureIds.length > 1) sumArea += x.areaPercent
            if (f.cultureIds.length <= 1) color = this.noneColor
            f.areas.push({numvfor: numvfor++, area: sumArea + '%', color: color})
          }
        })
        if (!findedField){
          f.areas.push({numvfor: numvfor++, area: '100%', color: this.noneColor})
        }
        return f
      })
      this.loading = false
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
      }
      if (this.sowings.length > 0){
        this.dividePie(this.cultures, 'cultureId', 'Площади культур на полях (га)', 'chart-cultures')
      }
    },
    drawPies(findedCulture) {
      if (findedCulture){
        this.dividePie(this.sorts, 'cultureSortId', `${findedCulture.name} - Сорта (га)`, 'chart-sorts', findedCulture)
        this.dividePie(this.ripenessgroups, 'ripenessGroupId', `Группы спелости (га)`, 'chart-ripeness', findedCulture)
      }
    },
    updateLeafletFields() {
      this.fetchEntities([
        'leafletFields'
      ], this.afterFetch );
    },
    getColorFromLegend(id) {
      let legend = this.legend.find(x => x.itemId === id)
      return legend.rgbColor
    },
    getRandomColor(color) {
      return randomcolor({hue: color})
    },
    initMap() {
      this.drawMap();
      this.drawFields();
    },
    drawMap() {
      if (this.map) this.map.remove();
      this._addLayers();
      this._addFieldsTooltipToggleButton();
      this._addScale();
      this._addRuler();
      this._addPrinterTitle();
      this._addPrinter();
      this._addPanelBtns();
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
      this.map.on("browser-pre-print", e => {});
      this.map.on("browser-print-start", e => {this.mapPrintState = "started"});
      this.map.on("browser-print", e => {});
      this.map.on("browser-print-end", e => {this.mapPrintState = "ended"});
      L.control.browserPrint({
        title: 'Печать',
        position: "topright",
        closePopupsOnPrint: true,
        printModes: ["Auto", "Custom", "Landscape"],
        printModesNames: {Auto:"Авто", Custom:"Область", Landscape: "Альбом"},
      }).addTo(this.map);
    },
    _addPrinterTitle() {
      L.easyButton({
        id: 'print-title', position: 'topright', type: 'replace', leafletClasses: true,
        states:[{stateName: 'title', onClick: this.setPrintTitle, title: 'Заголовок карты', icon: 'el-icon-setting'}]
      }).addTo(this.map);
    },
    setPrintTitle() {
      this.mapPrintTitle = prompt('Введите название заголовка?', this.mapPrintTitle) || this.mapPrintTitle
    },
    _addPanelBtns() {
      this.legendButton = L.easyButton({
        id: 'el-icon-legend', position: 'topright', type: 'replace', leafletClasses: true,
        states: [
          {stateName: 'open', title: 'Показать легенды', icon: '<span class="lambda-icon">&lambda;</span>', onClick: (control) => { this.showPanelLegend = true; control.state('close');}},
          {stateName: 'close', title: 'Скрыть легенды', icon: '<span class="close-icon">&cross;</span>', onClick: (control) => { this.showPanelLegend = false; control.state('open');}}
        ]
      }).addTo(this.map)
      this.bottomButton = L.easyButton({
        id: 'el-icon-bottom', position: 'topright', type: 'replace', leafletClasses: true,
        states: [
          {stateName: 'open', title: 'Показать инфо', icon: '<span class="iota-icon">&iukcy;</span>', onClick: (control) => { this.showPanelBottom = true; control.state('close');}},
          {stateName: 'close', title: 'Скрыть инфо', icon: '<span class="close-icon">&cross;</span>', onClick: (control) => { this.showPanelBottom = false; control.state('open');}}
        ]
      }).addTo(this.map)
    },
    _addFieldsTooltipToggleButton() {
      L.easyButton({
        position: 'topright', type: 'replace', leafletClasses: true,
        states:[
          {
            stateName: 'show-fields-tooltips',
            onClick: this.showFieldsTooltips,
            title: 'Показать названия полей',
            icon: 'fas fa-search-plus'
          },
          {
            stateName: 'hide-fields-tooltips',
            onClick: this.hideFieldsTooltips,
            title: 'Вернуть',
            icon: 'fas fa-undo'
          },
        ]
      }).addTo(this.map);
    },
    showFieldsTooltips(control) {
      let activeFields = this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: true, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        })
        this.map.setZoom(13)
        control.state('hide-fields-tooltips');
      }
    },
    hideFieldsTooltips(control) {
      let activeFields = this.fields
      if (activeFields) {
        activeFields.eachLayer(polygon => {
          polygon.unbindTooltip()
          polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        })
        this.map.fitBounds(activeFields.getBounds());
        control.state('show-fields-tooltips');
      }
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
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let polygon = L.polygon(latLng, {color: '#000', fillColor: 'url(#'+field.fieldId+')', weight: 1, fillOpacity: 0.7, className: ''});
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.cultureIds = field.cultureIds;
          polygon.on('mouseover', () => {polygon.setStyle({fillColor: 'rgba(255, 255, 255, 1)'})})
          polygon.on('mouseout', () => {polygon.setStyle({fillColor: 'url(#'+field.fieldId+')'})})
          polygon.on('click', () => {
              this.showPanelBottom = true
              this.fieldClickedId = field.fieldId
              this.fieldClickedName = field.fieldName
              this.fieldClickedPolygon = polygon
          })
          this.fields.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.fields);

        if (polygons.length) {
          this.map.setView(this.fields.getBounds().getCenter(), 12);

          this.fields.eachLayer(polygon => {
            polygon.bindTooltip(polygon.label, { permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
          })
        }
      }
    },
    dividePie(items, sortKey, title, htmlId, selectedCulture) {
      let sowings = selectedCulture ? this.sowings.filter(s => s.cultureId === selectedCulture.id) : this.sowings
      let pieIds = sowings.map(x => x[sortKey]).filter((elem, index, array) => array.indexOf(elem) === index)
      let pieParts = []
      pieIds.forEach(x => {
        let finded = items.find(s => s.id === x)
        finded = finded ? finded : 'нет данных'
        let sum = 0
        sowings.forEach(s => {
          if (s[sortKey] === x) {
            sum += s.area
          }
        })
        let mixColor = this.getMixColor(sowings, sortKey, x)
        let color = htmlId === 'chart-cultures' ? this.getColorFromLegend(x) : this.getRandomColor(mixColor)
        pieParts.push({id: x, name: finded.name, area: sum, color: color })
      })
      pieParts.sort(this.sortUp)
      pieParts = htmlId === 'chart-cultures' ? this.calculatePieOthers(pieParts) : pieParts
      pieParts.sort(this.sortDown)
      let pieLabels = pieParts.map(x => x.name)
      let pieAreas = pieParts.map(x => x.area)
      let pieColors = pieParts.map(x => x.color)
      this.createChart(title, pieLabels, pieAreas, pieColors, htmlId)
    },
    getMixColor(sowings, sortKey, x) {
      let sowing = sowings.find(s => s[sortKey] == x)
      return this.getColorFromLegend(sowing.cultureId)
    },
    calculatePieOthers(pieParts) {
      const OTHERS_PERCENT = 10
      let pieWholeArea = 0
      pieParts.forEach(x => pieWholeArea += x.area)
      let pieOthersArea = pieWholeArea * OTHERS_PERCENT / 100
      let sumPies = 0
      let j = 0
      while(sumPies + pieParts[j+1].area < pieOthersArea) {
        sumPies+=pieParts[j].area
        j++
      }
      pieParts.splice(0, j)
      pieParts.push({ name: 'Прочее', area: sumPies, color: '#fff'})
      return pieParts
    },
    createChart(title, labels, areas, colors, htmlId){
      if (this.charts[htmlId]) {
        this.charts[htmlId].destroy()
      }
      this.charts[htmlId] =  new Chart(htmlId, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: "Площадь (га)",
            backgroundColor: colors,
            data: areas
          }]
        },
        options: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: title
          }
        }
      });
    },
    sortUp(a, b) {
      if (a.area > b.area)
        return 1
      if (a.area < b.area)
        return -1
      return 0
    },
    sortDown(a, b) {
      if (a.area < b.area)
        return 1
      if (a.area > b.area)
        return -1
      return 0
    },
    changeTab(tab, id){
      this.tabs.forEach(t => t.active = false)
      this.tabs[id].active = true
      this.tab = tab
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
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
  height 100%
  width 100%
  position relative
  box-sizing border-box
  border 1px solid #323232
  &.map-active
    height calc(100% - 280px)

.panel-legend
  position absolute
  padding 10px 15px
  bottom 30px
  left 12px
  height 250px
  width 250px
  box-sizing border-box
  border-radius 5px 0 0 5px
  border 1px solid #323232
  background #fff
  overflow auto
  z-index 401
  &-row
    width 100%
    margin 5px 0
    p
      font-size 13px
      margin 0
      width 100%
    .color-legend
      display inline-block
      height 7px
      width 100px


.panel-bottom
  height 250px
  position static

.chart-container
  width 250px
  height 250px
  position static
  margin-left 33px
  margin-bottom 20px

  .chart
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

.map-culture-filter
  left calc(50% - 108px)

.grid-print-container > .title
  color white

.map-print-title
  grid-row 1
  justify-self center
  text-align center
  color grey

.closed-sidebar
  display none
</style>

