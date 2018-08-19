import {fromVuex} from "services/RecordsLoader"
import http from "services/http"
import {deepClone} from "lib/utils"
import {uniq} from "lib/utils"
import moment from "moment"

export default {
  mixins: [

  ],
  data() {
    return {
      analysiscardtypes: [],
      cropbalanceusers: [],
      warehouses: [],
      culturequalitytypes: [],
      storages: [],
      inventories: [],
      warehouseId: null,
      storageId: null,
      inventoryQualityTypeValues: [],
      qualityTypeValueCodes: [],
      qualityTypeValuesIndex: -1,
      qualityTypeId: null,
      loadingItem: {
        save: false,
      },
      saved: {
        items: [],
      },
    }
  },
  created() {
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.analysiscardtypes = fromVuex("analysiscardtypes")
      this.cropbalanceusers = fromVuex("cropbalanceusers")
      this.warehouses = fromVuex("warehouses")
      this.culturequalitytypes = fromVuex("culturequalitytypes")
    },
    getFullName(c) {
      if (!c) return ""
      return `${c.surname} ${c.name}`
    },
    resetWarehouse(date) {
      if (!date) {
        this.warehouseId = null
      }
    },
    resetInventory() {
      delete this.item.inventoryId
      this.inventories = []
    },
    resetQualityType() {
      this.inventoryQualityTypeValues = []
      this.qualityTypeValueCodes = []
      this.qualityTypeValuesIndex = -1
      this.qualityTypeId = null
    },
    setStorages(warehouseId) {
      this.storageId = null
      this.resetInventory()
      if (warehouseId) {
        this.storages = fromVuex("storages").filter(s => s.warehouseId == warehouseId)
      } else {
        this.storages = []
      }
    },
    getInventory(storageId) {
      this.resetInventory()
      if (storageId) {
        let item = deepClone(this.item)
        let body = {
          storageId: storageId,
          date: moment(item.dateTime).format("YYYY-MM-DDTHH:mm:ss")
        }
        http.post("inventoryinformations", body)
          .then((data) => {
            this.inventories = uniq(data, "inventoryId")
          })
          .catch(() => {
            this.inventories = []
          })
      }
    },
    getInventoryQualityTypeValues(inventoryId) {
      this.resetQualityType()
      if (inventoryId) {
        http.get(`InventoryQualityTypeValues/${inventoryId}`)
          .then((data) => {
            this.inventoryQualityTypeValues = data
            this.setItemQualityTypeValues(data)
          })
          .catch(() => {
          })
      }
    },
    setItemQualityTypeValues(data) {
      let qualityTypeValues = deepClone(this.item.qualityTypeValues)
      let inventoryQualityTypeValues = deepClone(data).map(d => {
        let qualityTypeValue = qualityTypeValues.find(q => q.qualityTypeId == d.qualityTypeId)
        if (qualityTypeValue) {
          d.value = qualityTypeValue.value
          d.qualityTypeValueCodeId = qualityTypeValue.qualityTypeValueCodeId
        }
        return d
      })
      this.item.qualityTypeValues = inventoryQualityTypeValues
    },
    getQualityTypeName(qualityTypeId) {
      let culturequalitytype = this.culturequalitytypes.find(c => c.qualityTypeId == qualityTypeId)
      return culturequalitytype && culturequalitytype.qualityName
    },
    getQualityTypeValueCodes(qualityTypeId) {
      let inventoryQualityTypeValue = this.inventoryQualityTypeValues.find(i => i.qualityTypeId == qualityTypeId)
      let qualityTypeValueCodes =  inventoryQualityTypeValue && inventoryQualityTypeValue.qualityTypeValueCodes
      this.qualityTypeValueCodes = qualityTypeValueCodes || []
      let qualityTypeValuesIndex = this.item.qualityTypeValues.findIndex(q => q.qualityTypeId == qualityTypeId)
      this.qualityTypeValuesIndex = qualityTypeValuesIndex
    },
    removeNullValues(body) {
      body.qualityTypeValues = body.qualityTypeValues.filter(q => {
        return q.qualityTypeValueCodeId || q.value
      })
    },
    submit(formName) {
      this.save()
    },
  }
}
