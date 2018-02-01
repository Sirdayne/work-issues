import localforage from 'localforage'
import contexts from 'mixins/contexts'
import http from 'lib/httpQueryV2'

export default {
  mixins: [
    contexts
  ],
  methods: {
    getFullEndpoint(model, forCache = false) {
      let suffix = model.contexts.map(name => this.context[name]).join('/')
      if (suffix) suffix = '/' + suffix
      if (forCache && model.suffix) suffix = '_' + model.suffix
      return model.path + suffix
    },
    // return {isFresh, data}
    getCached(model) {
      if (model.constructor === Array) {
        return Promise.all(model.map(model => this.getCached(model))).then(results => {
          return results
        })
      }
      return localforage.getItem(this.getFullEndpoint(model, true)).then(records => {
        if (!records) {
          return this.getRemote(model).then(records => {
            return new Promise((resolve, reject) => {
              resolve({
                isFresh: true,
                records: records
              })
            })
          })
        } else {
          return new Promise((resolve, reject) => {
            resolve({
              isFresh: false,
              records: records
            })
          })
        }
      })
    },
    getRemote(model) {
      if (model.constructor === Array) {
        return Promise.all(model.map(model => this.getRemote(model))).then(results => {
          return results
        })
      }
      const endpoint = this.getFullEndpoint(model)
      if (model.source) {
        return new Promise((resolve, reject) => {
          resolve(model.source)
        })
      }
      return http.get(endpoint).then(records => {
        let err
        if (Object.keys(records).length === 1 && Object.keys(records)[0] === 'message') {
          err = records.message
        } else {
          if (model.prefilter) {
            records = records.filter(model.prefilter)
          }
          localforage.setItem(this.getFullEndpoint(model, true), records)
        }
        return new Promise((resolve, reject) => {
          if (err) {
            alert(endpoint.toUpperCase() + ' - ' + err)
            reject(err)
            return
          }
          resolve(records)
        })
      })
    },
    getEntity(model, draw, withRelations = false, fromCache = false) {
      let mainModel = model, relations
      if (withRelations) {
        relations = model.relations
        model = [
          ...Object.values(relations).map(relation => relation.model),
          mainModel
        ]
      }
      this.getCached(model).then(data => {
        let isFinished, records, mainModelData, relRecords
        if (withRelations) {
          isFinished = !data.some(item => !item.isFresh)
          mainModelData = data.pop()
          relRecords = data.map(item => item.records)
          records = this.buildRelations(
            mainModel,
            mainModelData.records,
            relations,
            relRecords
          )
        } else {
          isFinished = data.isFresh
          records = data.records
        }
        draw.call(null, isFinished, records, mainModel)
        if (!isFinished && !fromCache) {
          if (withRelations) {
            let postUpdateSets = [...data, mainModelData].map((item, i) => {
              item.index = i
              return item
            }).filter(item => !item.isFresh)
            this.getRemote(postUpdateSets.map(item => model[item.index])).then(records => {
              postUpdateSets.forEach((item, i) => {
                if (relRecords[item.index]) {
                  relRecords[item.index] = records[i]
                } else {
                  mainModelData.records = records[i]
                }
              })
              records = this.buildRelations(
                mainModel,
                mainModelData.records,
                relations,
                relRecords
              )
              draw.call(null, true, records, mainModel)
            })
          } else {
            this.getRemote(model).then(records => {
              draw.call(null, true, records, mainModel)
            })
          }
        }
      })
    },
    buildRelations(model, records, relations, relRecordsSet) {
      Object.keys(relations).forEach((relationName, i) => {
        let relation = model.relations[relationName]
        let fKey     = relation.fKey?
          relation.fKey :
          relations[relationName].model.idKey
        let foreignMethod = 'find'
        if (relation.many || relation.fromMany) {
            foreignMethod = 'filter'
        }
        records = records.map(record => {
          record[relationName] = relRecordsSet[i][foreignMethod](relRecord => {
            return relation.fromMany?
              record[relation.key].includes(relRecord[fKey]) :
              record[relation.key] === relRecord[fKey]
          })
          return record
        })
      })
      return model.filter? records.filter(model.filter) : records
    },
    saveItem(model, data, draw) {
      return localforage.getItem(this.getFullEndpoint(model, true)).then(records => {
        records = records.map(item => {
          return item.id === data.id ? data : item
        })
        return localforage.setItem(this.getFullEndpoint(model, true), records).then(() => {
          draw.call(null, model)
          return http.put(this.getFullEndpoint(model), data).then( () => {
            return new Promise((resolve, reject) => {
              resolve(model)
            })
          })
        })
      })
    },
    getEntities(models, callback) {
      const aliases = Object.keys(models)
      let status = {}
      let records = {}
      aliases.forEach(alias => {
        status[alias] = false
        this.getEntity(models[alias], (isFinished, r) => {
          status[alias] = true
          records[alias] = r
          if (!Object.values(status).some(x => !x)) {
            callback.call(null, records)
          }
        })
      })
    },
    deleteItem(model, id, draw) {
      return http.delete(model.path, id).then( () => {
        if (draw) draw.call(null, model)
        return new Promise((resolve, reject) => {
          resolve(model)
        })
      })
    }
  }
}



// Типы контекста:
// Постоянные (бюджет, год)
// Динамические (виды работ)

// Связезависимые //TODO
// TODO Map more then 2 deeps


// Параметр фильтр в получение с сервера
// source
