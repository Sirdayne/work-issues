import L from 'leaflet';

export default {
  data() {
    return {
      warehouses: new L.FeatureGroup(),
    }
  },
  methods: {
    removeWarehouses() {
      if (this.map) {
        this.map.removeLayer(this.warehouses);
      }
    },
    drawWarehouses() {
      this.removeWarehouses()
      this.warehouses = new L.FeatureGroup();
      let polygons = [];
      if (this.warehouseCoordinates && this.warehouseCoordinates.length) {
        this.warehouseCoordinates.forEach(warehouse => {
          let latLng = warehouse.points.map(p => [p[1], p[0]]);
          let polygon = L.polygon(latLng, {color: 'green', weight: 1, fillOpacity: 0.1});
          polygon.label = warehouse.warehouseName;
          polygon.fieldId = warehouse.warehouseId;
          this.warehouses.addLayer(polygon);
          polygons.push(polygon);
        });
        this.map.addLayer(this.warehouses);

        if (polygons.length) {
          this.warehouses.eachLayer(polygon => {
            polygon.bindTooltip(polygon.label, {
              permanent: true,
              direction: "center",
              opacity: 1
            })
          })
        }
      }
    },
  }
}
