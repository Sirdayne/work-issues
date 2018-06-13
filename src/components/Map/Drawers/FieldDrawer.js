import L from 'leaflet';
import { EventBus } from "services/EventBus";

export default {
  data() {
    return {
      highlightedFilteredFields: new L.FeatureGroup(),
      fieldWorkPolygons: new L.FeatureGroup(),
    }
  },
  computed: {
    selectedFields() {
      return this.$store.getters.getSelectedFields;
    },
  },
  watch: {
    'selectedCulture'(val, oldVal) {
      this.SowingPolygons.eachLayer(polygon => {
        if (polygon.cultureIds.indexOf(val) > -1 || val == ''){
          polygon.setStyle({fillColor: 'url(#'+polygon.fieldId+')'})
          polygon.on('mouseout', function () { this.setStyle({fillColor: 'url(#'+polygon.fieldId+')'}) })
        } else {
          polygon.setStyle({fillColor: 'rgba(0,0,0,0.4)'})
          polygon.on('mouseout', function () { this.setStyle({fillColor: 'rgba(0,0,0,0.4)'}) })
        }
      })
    },
  },
  methods: {
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
          let polygon = L.polygon(latLng, {color: 'black', weight: 1, fillOpacity: 0.2});
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.on('mouseover', function () {this.setStyle({color: 'orange'})})
          polygon.on('mouseout', function () {this.setStyle({color: 'black'})})
          polygon.on('dblclick', () => {
            if (!this.modeEditPoints) {
              EventBus.$emit('Map.FieldDblclicked', polygon.fieldId);
            }
          })
          if (this.selectedFields && this.selectedFields.length && this.selectedFields.includes(field.fieldId)) {
            polygon.setStyle({color: 'black', weight: 1, fillOpacity: 0.4});
            this.highlightedPolygons.push(polygon);
          }
          this.fields.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.fields);

        if (polygons.length) {
          this.map.fitBounds(this.fields.getBounds());
          this.fields.eachLayer(polygon => {
            polygon.unbindTooltip()
            polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
          })
        }
      }
    },
    highlightFilteredFields(fieldIds) {
      if (!this.map) return;
      this.map.removeLayer(this.highlightedFilteredFields)
      if (!fieldIds.length) return;
      this.highlightedFilteredFields = new L.FeatureGroup();
      fieldIds.forEach(id => {
        let field = this.leafletFields.find(f => f.fieldId == id)
        let latLng = JSON.parse(field.kml);
        let polygon = L.polygon(latLng, {color: 'orange', weight: 2, fillOpacity: 0});
        polygon.label = field.fieldName;
        polygon.fieldId = field.fieldId
        polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        this.highlightedFilteredFields.addLayer(polygon);
      })
      this.map.addLayer(this.highlightedFilteredFields);
      this.map.fitBounds(this.highlightedFilteredFields.getBounds());
    },
    addFieldOverlay() {
      this.SowingPolygons = new L.FeatureGroup()
      let polygons = []
      this.selectedPolygonForEdit = null
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let polygon = L.polygon(latLng, {color: '#fff', fillColor: 'url(#'+field.fieldId+')', weight: 1, fillOpacity: 0.8, className: ''});
          let cultures = this.getSowingLabel(field)
          let addSowingPolygon = this.addSeedPolygon(field)
          polygon.label = [field.fieldName, cultures.join("</br>")].join("</br>")
          polygon.fieldId = field.fieldId;
          polygon.cultureIds = field.cultureIds;
          polygon.on('mouseout', () => { polygon.setStyle({fillColor: 'url(#'+field.fieldId+')'}) })
          if (addSowingPolygon)
            this.SowingPolygons.addLayer(polygon)
          polygons.push(polygon)
        });
        if (polygons.length) {
          this.SowingPolygons.eachLayer(polygon => {
            polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
          })
        }
      }
      this.LayerControl.addOverlay(this.SowingPolygons, "Карта посева", "Слои")
    },
    addSeedPolygon(field) {
      let addSowingPolygon = true
      if (this.seedcoordinates.length > 0){
        this.seedcoordinates.forEach(seedcoordinate => {
          if (seedcoordinate.fieldId == field.fieldId){
            let seedKml = this.getPolygonFromString(seedcoordinate.kml)
            let latLng = JSON.parse(seedKml)
            let seedColor = this.getColorFromLegend(seedcoordinate.cultureId)
            let seedpolygon = L.polygon(latLng, {color: '#000', fillColor: seedColor, weight: 1, fillOpacity: 1, className: ''});
            seedpolygon.label = seedcoordinate.label;
            seedpolygon.fieldId = seedcoordinate.fieldId;
            seedpolygon.cultureIds = [seedcoordinate.cultureId];
            seedpolygon.seedLimitId = seedcoordinate.seedLimitId
            seedpolygon.on('mouseout', () => { seedpolygon.setStyle({fillColor: seedColor}) })
            seedpolygon.on('click', () => {
              if (!this.isEditable){
                this.paintSowingPolygons()
                this.selectedPolygonForEdit = seedpolygon
                let selectedPolygonStyle = {color: 'rgba(232, 167, 2)', weight: 3, fillOpacity: 1, fillColor:'rgb(220,220,220)'}
                seedpolygon.setStyle(selectedPolygonStyle)
                seedpolygon.on('mouseout', () => {seedpolygon.setStyle(selectedPolygonStyle)})
              }
            })
            this.SowingPolygons.addLayer(seedpolygon);
            addSowingPolygon = false
          }
        })
      }
      return addSowingPolygon
    },
    paintSowingPolygons() {
      this.SowingPolygons.eachLayer(polygon => {
        polygon.setStyle({color: '#fff', fillColor: 'url(#'+polygon.fieldId+')', weight: 1, fillOpacity: 1, className: ''})
        polygon.on('mouseout', () => { polygon.setStyle({fillColor: 'url(#'+polygon.fieldId+')'}) })
      })
    },
    addFieldWorkOverlay() {
      this.fieldWorkPolygons = new L.FeatureGroup();
      let polygons = [];
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let fieldColor = 'url(#'+field.svgFieldWorkId+')'
          let polygon = L.polygon(latLng, {color: '#fff', fillColor: 'url(#'+field.svgFieldWorkId+')', weight: 1, fillOpacity: 1, className: ''});
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.svgFieldWorkId = field.svgFieldWorkId;
          polygon.on('mouseout', function () { this.setStyle({fillColor: fieldColor}) })
          this.fieldWorkPolygons.addLayer(polygon);
          polygons.push(polygon);
        });
        if (polygons.length) {
          this.fieldWorkPolygons.eachLayer(polygon => {
            polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
          })
        }
      }
      this.LayerControl.addOverlay(this.fieldWorkPolygons, "Карта работ", "Слои")
    },
    getSowingLabel(field) {
      return field.cultureIds.map(id => {
        let c = this.cultures.find(c => c.id == id).shortName
        let s = this.seedlimits.find(s => s.cultureId == id && s.fieldId == field.fieldId)
        let a = s && s.area || 0
        return `${c}(${a})`
      })
    },
    getColorFromLegend(id) {
      let legend = this.legend.find(x => x.itemId === id)
      return legend.rgbColor
    },
    getPolygonFromString(str) {
      return str.replace(/lat:/g,'').replace(/lng:/g,'').replace(/{/g,'[').replace(/}/g,']')
    },
  }
}
