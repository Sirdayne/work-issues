import {fromVuex} from "services/RecordsLoader"

export default {
  mixins: [

  ],
  data() {
    return {
      cultures: [],
      finalproducttypes: [],
      finalproducts: [],
      grainwastes: [],
      sorts: [],
      warehouses: [],
      storages: [],
      smells: [],
      customorganizations: [],
      organizations: [],
      organizationtypes: [{id: 1, name: "Контрагент"}, {id: 2, name: "Организация"}],
      shipperType: null,
      consigneeType: null,
      finalProductTypeId: null,
      warehouseId: null,
      loadingItem: {
        save: false,
      },
      saved: {
        items: [],
      },
    }
  },
  computed: {
    inventoryanalysiscards() {
      let inventoryanalysiscards = fromVuex("inventoryanalysiscards")
        .filter(i => {
          return i.analysisCardType == 5 && i.cultureId == this.item.cultureId && i.storageId == this.item.storageId
        })
      return inventoryanalysiscards
    },
  },
  created() {
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.cultures = fromVuex("cultures")
      this.finalproducttypes = fromVuex("finalproducttypes")
      this.finalproducts = fromVuex("finalproducts")
      this.grainwastes = fromVuex("grainwastes")
      this.warehouses = fromVuex("warehouses")
      this.smells = fromVuex("qualitytypevaluecodes").filter(q => q.qualityTypeId == 7)
      this.customorganizations = fromVuex("customorganizations")
      this.organizations = fromVuex("organizations")
    },
    resetProductCategory() {
      delete this.item.categoryId
      delete this.item.sortId
      delete this.item.grainWaste
    },
    resetShipper() {
      delete this.item.shipperId
      delete this.item.shipperOrgId
    },
    resetConsignee() {
      delete this.item.consigneeId
      delete this.item.consigneeOrgId
    },
    setSorts(cultureId) {
      if (cultureId) {
        this.sorts = fromVuex("sorts").filter(s => s.cultureId == cultureId)
      } else {
        this.sorts = []
      }
    },
    setStorages(warehouseId) {
      if (warehouseId) {
        this.storages = fromVuex("storages").filter(s => s.warehouseId == warehouseId)
      } else {
        this.storages = []
      }
    },
    submit(formName) {
      this.save()
    },
  }
}
