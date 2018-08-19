import {shallowClone} from "helpers"
import contexts from "mixins/contexts"
import http from "services/http"
import localforage from "localforage"

export default {
  mixins: [
    contexts
  ],
  methods: {
    datasetForModel(model) {
      let i = 0
      let contexts = model.contexts
      let initData = {
        isReady: false,
        isLoading: false,
        records: []
      }
      if (!this.$root.datasets[model.path]) {
        if (contexts.length) this.$set(this.$root.datasets, model.path, {})
        else {
          this.$set(this.$root.datasets, model.path, initData)
          this.preload(model)
        }
      }
      return contexts.reduce((dataset, name) => {
        if (!this.context[name]) throw new Error("Undefined context " + name)
        if (!dataset[this.context[name]]) {
          this.$set(dataset, this.context[name], {})
        }
        if (++i === contexts.length) {
          if (Object.keys(dataset[this.context[name]]).length === 0) {
            dataset[this.context[name]] = initData
            this.preload(model)
          }
        }
        return dataset[this.context[name]]
      }, this.$root.datasets[model.path])
    },
    preload(model) {
      let suffix = model.contexts.map(name => this.context[name]).join("/")
      if (suffix) suffix = "/" + suffix
      let dataset = this.datasetForModel(model)
      dataset.isLoading = true
      localforage.getItem(model.path+suffix).then(records => {
        dataset.isLoading = false
        if (records) {
          dataset.records = records
          dataset.isReady = true
        } else {
          dataset.records = []
        }
        this.load(model)
      })
    },
    load(model) {
      let dataset = this.datasetForModel(model)
      if (model.source) {
        dataset.records = model.source
        dataset.isReady = true
        return
      }
      if (!dataset.isLoading) {
        dataset.isLoading = true
        let suffix = model.contexts.map(name => this.context[name]).join("/")
        if (suffix) suffix = "/" + suffix
        http.get(model.path + suffix)
          .then(records => {
            dataset.records = records
            try {
              localforage.setItem(model.path+suffix, records)
            } catch(e) {
              throw e
            }
            dataset.isLoading = false
            dataset.isReady = true
          })
      }
    },
    deleteItem(model, id) {
      let dataset = this.datasetForModel(model)
      dataset.records = dataset.records.filter(record => {
        return record[model.idKey] != id
      })
      let suffix = model.contexts.map(name => this.context[name]).join("/")
      if (suffix) suffix = "/" + suffix
      localforage.setItem(model.path+suffix, dataset.records)
    },
    saveItem(model, id, data) {
      let dataset = this.datasetForModel(model)
      if (id) {
        dataset.records = dataset.records.map(record => {
          if (record[this.model.idKey] === id) {
            if (model.path==="suboperations") {
              data.isFieldOperation = record.isFieldOperation
            }
            data[this.model.idKey] = id
            record = data
          }
          return record
        })
      }
      let suffix = model.contexts.map(name => this.context[name]).join("/")
      if (suffix) suffix = "/" + suffix
      localforage.setItem(model.path+suffix, dataset.records)
    },
    getPrefetchedModels(model, stored = []) {
      if (!stored.find(item => item.path === model.path)) {
        stored.push(model)
        Object.keys(model.relations).forEach(key => {
          stored = this.getPrefetchedModels(model.relations[key].model, stored)
        })
      }
      return stored
    },
    getRecordsFromModel(model) {
      if (this.getPrefetchedModels(model).some(model => !this.datasetForModel(model).isReady)) {
        return []
      }
      let relatedRecords = []
      Object.keys(model.relations).forEach(key => {
        relatedRecords[key] = this.getRecordsFromModel(model.relations[key].model)
      })
      let records = this.datasetForModel(model).records
      if (model.filter) {
        records = records.filter(model.filter)
      }
      records = records.map(data => {
        let item = {}
        let _data = Object.assign({}, data)
        Object.keys(model.relations).forEach(key => {
          Object.defineProperty(_data, key, {
            enumerable: true,
            get() {
              return (model.relations[key].many || model.relations[key].fromMany)?
                relatedRecords[key].filter(relData => {
                  return model.relations[key].fromMany?
                    (data[model.relations[key].key].indexOf(
                      model.relations[key].fKey ? relData.data[model.relations[key].fKey] : relData.id
                    ) !== -1) :
                    (data[model.relations[key].key] ===
                    (model.relations[key].fKey ? relData.data[model.relations[key].fKey] : relData.id))
                }).map(record => record.data) :
                ((relatedRecords[key].find(relData => {
                  return data[model.relations[key].key] ===
                    (model.relations[key].fKey ? relData.data[model.relations[key].fKey] : relData.id)
                })||{}).data||{})
            }
          })
        })
        item.data = shallowClone(_data)
        model.fields.filter(field => field.getter).forEach(field => {
          Object.defineProperty(item.data, field.name, {
            enumerable: true,
            get() {
              return field.getter.call(_data)
            }
          })
        })
        item.id = item.data[model.idKey]
        return item
      })
      if (model.postfilter) {
        records = records.filter(model.postfilter)
      }
      return records
    }
  }
}
