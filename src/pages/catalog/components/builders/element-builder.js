import {fetchEntities, fromVuex} from "services/RecordsLoader";
import Elements from "pages/catalog/components/elements/_elements.json";

export function getElementData(element) {
  return new Promise((resolve, reject) => {
    build(element)
      .then((data) => {
        resolve(data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
function build(element) {
  let elementData = load(element)
  let apiToName = {}
  let store = {}
  apiToName[elementData.api] = elementData.name
  let dependenciesApi = getDependenciesApi(elementData.dependencies, store, apiToName)
  let list = [elementData.api, ...dependenciesApi]
  return new Promise((resolve, reject) => {
    let _afterFetch = () => afterFetch(list, apiToName, elementData, store, resolve)
    fetchEntities(list, _afterFetch)
  })
}
function getDependenciesApi(dependencies, store, apiToName) {
  return dependencies
    .map(d => {
      let data = load(Elements[d])
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
}
function load(element) {
  try {
    let data = require(`pages/catalog/components/elements/${element}.json`)
    return data
  } catch (e) {
    throw "FileNotFoundError";
  }
}
function afterFetch(list, apiToName, elementData, store, resolve) {
  list.forEach(entity => {
    store[apiToName[entity]] = fromVuex(entity)
  })
  let data = {
    store: store,
    elementData: elementData,
  }
  resolve(data)
}
