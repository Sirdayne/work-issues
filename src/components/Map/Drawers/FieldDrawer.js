import L from 'leaflet';

export default {
  data() {
    return {
      highlightedFilteredFields: new L.FeatureGroup(),
    }
  },
  computed: {
    selectedFields() {
      return this.$store.getters.getSelectedFields;
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
          let polygon = L.polygon(latLng, {color: 'black', weight: 1, fillOpacity: 0.3});
          polygon.label = field.fieldName;
          polygon.fieldId = field.fieldId;
          polygon.on('mouseover', function () {this.setStyle({color: 'orange'})})
          polygon.on('mouseout', function () {this.setStyle({color: 'black'})})
          if (this.selectedFields && this.selectedFields.length && this.selectedFields.includes(field.fieldId)) {
            polygon.setStyle({color: 'black', weight: 1, fillOpacity: 0.6});
            this.highlightedPolygons.push(polygon);
          }
          this.fields.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.fields);

        if (polygons.length) {
          this.map.fitBounds(this.fields.getBounds());
          this.fields.eachLayer(polygon => {
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
        let polygon = L.polygon(latLng, {color: 'black', weight: 1, fillOpacity: 0.6});
        polygon.label = field.fieldName;
        polygon.fieldId = field.fieldId
        polygon.bindTooltip(polygon.label, {permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
        this.highlightedFilteredFields.addLayer(polygon);
      })
      this.map.addLayer(this.highlightedFilteredFields);
      this.map.fitBounds(this.highlightedFilteredFields.getBounds());
    },
  }
}
