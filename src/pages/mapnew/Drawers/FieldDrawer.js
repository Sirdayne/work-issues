import L from 'leaflet';
import { EventBus } from "services/EventBus";

export default {
  data() {
    return {

    }
  },
  computed: {

  },
  watch: {

  },
  methods: {
    removeFields() {
      if (this.map) {
        this.map.removeLayer(this.fields);
      }
    },
    _drawFields() {
      this.removeFields()
      this.fields = new L.FeatureGroup();
      let polygons = [];
      if (this.leafletFields && this.leafletFields.length) {
        this.leafletFields.forEach(field => {
          let latLng = JSON.parse(field.kml);
          let normalStyle = {color: '#000', fillColor: 'rgba(140, 140, 140, 1)', weight: 1, fillOpacity: 0.7, className: ''}
          let polygon = L.polygon(latLng, normalStyle);
          polygon.newName = field.fieldName;
          polygon.id = field.fieldId;
          polygon.on('mouseover', () => {polygon.setStyle({fillColor: 'rgba(255, 255, 255, 1)'})})
          polygon.on('mouseout', () => {polygon.setStyle({fillColor: 'rgba(140, 140, 140, 1)' })})
          polygon.on('click', () => {
            polygons.forEach(p => {
              p.setStyle(normalStyle)
            })
            polygon.setStyle({color: '#20a0ff', weight: 4, fillColor: 'rgba(200, 200, 200, 1)'})
            this.selectedField = polygon
            this.$store.dispatch('actionSetFilterField', polygon.id);
          })
          this.fields.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.fields);
        if (polygons.length) {
          this.map.setView(this.fields.getBounds().getCenter(), 12);
          this.fields.eachLayer(polygon => {
            polygon.bindTooltip(polygon.newName, { permanent: false, direction: "center", opacity: 1, className: 'tooltip-transparent'})
          })
        }
      }
    },
  }
}
