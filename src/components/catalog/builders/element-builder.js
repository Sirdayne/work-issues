import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import Elements from 'components/catalog/elements/_elements.json';

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  methods: {
    get(element) {
      return new Promise((resolve, reject) => {
        this._build(element)
          .then((data) => {
            resolve(data)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    _build(element) {
      let elementData = this._load(element)
      let apiToName = {}
      let store = {}
      apiToName[elementData.api] = elementData.name
      let dependenciesApi = this._getDependenciesApi(elementData.dependencies, store, apiToName)
      let list = [elementData.api, ...dependenciesApi]
      return new Promise((resolve, reject) => {
        this.afterFetch = () => this._afterFetch(list, apiToName, elementData, store, resolve)
        this.fetchEntities(list, this.afterFetch)
      })
    },
    _getDependenciesApi(dependencies, store, apiToName) {
      return dependencies
        .map(d => {
          let data = this._load(Elements[d])
          return data
        })
        .filter(data => {
          if (!data.api && data.response) store[data.name] = data.response
          return data.api
        })
        .map(data => {
          apiToName[data.api] = data.name
          return data.api
        })
    },
    _load(element) {
      try {
        let data = require(`components/catalog/elements/${element}.json`)
        return data
      } catch (e) {
        throw "FileNotFoundError";
      }
    },
    _afterFetch(list, apiToName, elementData, store, resolve) {
      list.forEach(entity => {
        store[apiToName[entity]] = this.fromVuex(entity)
      })
      let data = {
        store: store,
        elementData: elementData,
      }
      resolve(data)
    },
  },
}
