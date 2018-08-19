<template lang="pug">
.cols(v-loading="loading", element-loading-text="Загрузка...")
  sidebar-toggle
  transition(name="slide-fade")
    el-menu.sidebar(
      :class="{'closed-sidebar': !sidebarToggleState}",
      style="position: relative",
    )
      .budgets
        .budget(v-for="b in budgets")
          el-radio(v-model="$root.context.budget", :label="b.id") {{b.name}}

      field-filter(:fields="vuexFields")

      .chart-container.active
        canvas.chart#chart-cultures(height="200", width="200")
      .chart-container(:class="{'active': showCharts}")
        canvas.chart#chart-sorts(height="200", width="200")
      .chart-container(:class="{'active': showCharts}")
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
      legends(v-if="showPanelLegend", :legends="filteredCultures")
    .panel-bottom(v-if="!loading && showPanelBottom")
      .passport(v-if="tab === 'passport'")
        passport( :fieldId="fieldClickedId",
                  :orientation="true")

      div(v-else)
        sevoborot(:fieldClickedId="fieldClickedId", :fieldClickedName="fieldClickedName", :year="true")
        fieldsworks(:fieldClickedId="fieldClickedId", :fieldworks="fieldworks")

    .fx-tabs(v-if="!loading && showPanelBottom")
      .fx-tab(v-for="item in tabs", @click="changeTab(item.key, item.id)", :class="{ 'fx-tab-active': item.active }") {{ item.name }}

</template>

<script>
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import MapDrawer from "./MapDrawer"
import FieldDrawer from "./FieldDrawer"
import PieDrawer from "./PieDrawer"
import FieldFilter from "components/map/FieldFilter"
import sevoborot from "components/panelbottom/sevoborot"
import fieldsworks from "components/panelbottom/fieldsworks"
import passport from "components/fieldpassport/passport"
import legends from "components/map/legends"
import sidebarToggle from "components/sidebarToggle"
import L from "leaflet"
import "leaflet-editable"
import "leaflet-providers"
import "leaflet-easybutton"
import "leaflet.browser.print/dist/leaflet.browser.print.min.js"
import "leaflet/dist/leaflet.css"
import "lib/Leaflet.PolylineMeasure"
import "lib/Leaflet.PolylineMeasure.css"

import "leaflet-hotline"

import fontawesome from "@fortawesome/fontawesome"
import faSearchPlus from "@fortawesome/fontawesome-free-solid/faSearchPlus"
import faUndo from "@fortawesome/fontawesome-free-solid/faUndo"

fontawesome.library.add(faSearchPlus)
fontawesome.library.add(faUndo)

export default {
  mixins: [
    ListController,
    MapDrawer,
    FieldDrawer,
    PieDrawer
  ],
  components: {
    sevoborot,
    fieldsworks,
    passport,
    legends,
    FieldFilter,
    sidebarToggle,
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
      fields: new L.FeatureGroup(),
      highlightedFilteredFields: new L.FeatureGroup(),
      loading: true,
      tabs: [
        {id: 0, name: "Паспорт", key: "passport", active: false},
        {id: 1, name: "История", key: "history", active: true}
      ],
      selectedCulture: null,
      tab: "history",
      vuexFields: [],
      showPanelBottom: false,
      showPanelLegend: false,
      showCharts: false,
    }
  },
  created() {
    fetchEntities([
      "leafletFields",
      "sowings",
      "legend",
      "fieldworks",
      "budgets",
      "cultures",
      "sorts",
      "ripenessgroups",
      "fields",
    ], this.afterFetch );
  },
  watch: {
    "selectedCulture"(val) {
      let foundCulture = this.cultures.find(c => c.id === val)
      this._drawPies(foundCulture)
      this.fields.eachLayer(polygon => {
        if (polygon.cultureIds.indexOf(val) > -1 || val == ""){
          polygon.setStyle({fillColor: "url(#"+polygon.fieldId+")"})
          polygon.on("mouseout", () => {polygon.setStyle({fillColor: "url(#"+polygon.fieldId+")"})})
        } else {
          polygon.setStyle({fillColor: this.noneColor})
          polygon.on("mouseout", () => {polygon.setStyle({fillColor: this.noneColor})})
        }
      })
    },
    "sidebarToggleState" () {
      if (this.map){
        this.map._onResize()
        this.map.invalidateSize()
      }
    },
  },
  computed: {
    sidebarToggleState() {
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
      this.budgets = fromVuex("budgets")
      this.legend = fromVuex("legend")
      this.fieldworks = fromVuex("fieldworks")
      this.cultures = fromVuex("cultures")
      this.vuexFields = fromVuex("fields")
      this.sorts = fromVuex("sorts")
      this.ripenessgroups = fromVuex("ripenessgroups")
      this.sowings = fromVuex("sowings")
      this.sowings.forEach(sowing => {
        let sort = this.sorts.find(s => s.id == sowing.cultureSortId)
        sowing.ripenessGroupId = sort ? sort.ripenessGroupId : "нет данных"
      })

      this.leafletFields = fromVuex("leafletFields").map(f => {
        f.areas = []
        f.cultureIds = []
        let sumArea = 0
        let numvfor = 0
        let foundField = false
        this.sowings.forEach(sowing => {
          if (sowing.fieldId === f.fieldId) {
            foundField = true
            f.cultureIds.push(sowing.cultureId)
            this.lfCultureIds.push(sowing.cultureId)
          }
        })
        this.sowings.forEach(sowing => {
          if(sowing.fieldId === f.fieldId) {
            let color = this.getColorFromLegend(sowing.cultureId)
            if (f.cultureIds.length <= 1) sumArea += sowing.areaPercent
            f.areas.push({numvfor: numvfor++, area: sumArea + "%", color: color})
            if (f.cultureIds.length > 1) sumArea += sowing.areaPercent
            if (f.cultureIds.length <= 1) color = this.noneColor
            f.areas.push({numvfor: numvfor++, area: sumArea + "%", color: color})
          }
        })
        if (!foundField){
          f.areas.push({numvfor: numvfor++, area: "100%", color: this.noneColor})
        }
        return f
      })
      this.loading = false
      if (this.leafletFields && this.leafletFields.length) {
        this.initMap()
      }
      if (this.sowings.length > 0){
        this._dividePie(this.cultures, "cultureId", "Площади культур на полях (га)", "chart-cultures")
      }
    },
    updateLeafletFields() {
      fetchEntities([
        "leafletFields"
      ], this.afterFetch );
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
      this._addFieldsTooltipToggleButton();
      this._addScale();
      this._addRuler();
      this._addPrinterTitle();
      this._addPrinter();
      this._addPanelBtns();
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
  margin 8px 0 0

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

.panel-bottom
  height 250px
  position static

.chart-container
  float left
  width 250px
  height 0
  position static
  margin 0
  overflow hidden
  &.active
    height 250px
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

