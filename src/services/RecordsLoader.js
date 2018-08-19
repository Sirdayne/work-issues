import entities from "entities.yaml";
import localforage from "localforage";
import http from "services/http";
import pluralize from "pluralize";
import complexEntities from "complexEntities.json";
import {deepClone} from "lib/utils";
import {store} from "store/store";

export function fetchEntities(list, callback = false) {
  if (list.length) {
    let params = {
      organizationId: store.getters.getOrganizationId,
      list: list.map(l => l.toLowerCase()),
      callback: () => {callback ? callback() : false},
    }
    getEntityModified(params)
  }
}
function getEntityModified(params) {
  let entityNames = deepClone(params.list).map(e => {
    let foundEntity = findEntity(e)
    let path = getEntityPath(foundEntity, {name: e})
    e = ["organizationinstruments", "yearconstants"].includes(path) ? path : pluralize.singular(path)
    return e
  })
  let body = {organizationId: params.organizationId, entityNames: entityNames}
  http.post("entitymodified", body)
    .then(data => {
      let emt = data.map(d => {
        d.className = d.className.toLowerCase()
        return d
      })
      emt = addComplexEntities(emt)
      manageQueue(params)
      getEntities(params, emt)
    })
}
function addComplexEntities(emt) {
  Object.keys(complexEntities).forEach(key => {
    let obj = {
      className: key,
      dateModified: "",
      organizationId: +store.getters.getOrganizationId,
    }
    let dates = emt.filter(e =>
      e.organizationId == obj.organizationId && complexEntities[key].includes(e.className)
    ).map(e => e.dateModified)
    obj.dateModified = new Date(Math.max.apply(null, dates));
    emt.push(obj)
  })
  return emt
}
function manageQueue(params) {
  let queue = store.getters.getQueue.slice()
  queue[store.getters.getQueueId] = params.list.length
  store.dispatch("actionSetQueue", queue);
  store.dispatch("actionSetQueueId", store.getters.getQueueId + 1);
}
function getEntities(params, emt) {
  params.list.forEach(entity => {
    getLocalRecords({...params, ...{name: entity, queueId: store.getters.getQueueId - 1}}, emt)
  })
}
function getLocalRecords(params, emt) {
  let foundEntity = findEntity(params.name);
  let context = joinContexts(foundEntity);
  let path = getEntityPath(foundEntity, params);
  let key = context ? path + "" + context : path;
  let hasOrganization = foundEntity && foundEntity.contexts && foundEntity.contexts.includes("organization")
  let organizationId = hasOrganization ? params.organizationId : null
  let paramsName = context ? params.name : key
  let mostRecentTime = getMostRecentTime(emt, paramsName, organizationId)
  localforage.getItem("data/" + key)
    .then(res => {
      if (res) {
        let response = res
        let data = response.data
        let dateModified = response.dateModified
        let isMostRecent = mostRecentTime == new Date(dateModified).getTime()
        if (isMostRecent) {
          store.dispatch("actionAddEntities", {
            name: params.name,
            data: data
          });
          updateFetchState(params);
        } else {
          getRemoteRecords(params, mostRecentTime, true)
        }
      } else {
        let notCache = mostRecentTime ? true : false
        getRemoteRecords(params, mostRecentTime, notCache)
      }
    })
    .catch((error) => {
      getRemoteRecords(params, mostRecentTime)
    });
}
function getMostRecentTime(emt, name, organizationId) {
  let entity = emt
    .filter(e => e.organizationId == organizationId)
    .find(e => {
      let plural = pluralize(e.className)
      return plural == name || e.className == name
    })
  if (entity) {
    return new Date(entity.dateModified).getTime()
  }
  return false
}
function getRemoteRecords(params, mostRecentTime, notCache) {
  let foundEntity = findEntity(params.name);
  let context = joinContexts(foundEntity);
  let path = getEntityPath(foundEntity, params);
  path = context ? path + "" + context : path;
  let httpGetQuery = notCache ? http.getWithoutCache(path): http.get(path);
  httpGetQuery.then(data => {
    store.dispatch("actionAddEntities", {name: params.name, data: data});
    if (mostRecentTime) {
      let value = {data: data, dateModified: mostRecentTime}
      localforage.setItem("data/" + path, value)
        .then((value) => {
          updateFetchState(params);
        })
        .catch((error) => {
          updateFetchState(params);
        });
    } else {
      updateFetchState(params);
    }
  }).catch((error) => {
    updateFetchState(params);
  });
}
function findEntity(entityName) {
  entityName = entityName.toString().toLowerCase();
  let key = Object.keys(entities).find(e => e.toLowerCase() === entityName)
  let entity = key ? entities[key] : null
  return entity
}
function joinContexts(entity) {
  let str = "";
  if (entity && entity.hasOwnProperty("contexts")) {
    entity.contexts.forEach(context => {
      str += "/" + +localStorage.getItem(context);
    });
  }
  return str;
}
function getEntityPath(foundEntity, params) {
  let cond = foundEntity && foundEntity.hasOwnProperty("path") && foundEntity.path.length
  let path = cond ? (foundEntity.path).toLowerCase() : params.name;
  return path
}
function updateFetchState(params) {
  let queue = store.getters.getQueue.slice()
  queue[params.queueId]--
  store.dispatch("actionSetQueue", queue);
  resetQueue()
  if (!store.getters.getQueue[params.queueId]) {
    if (params.callback) params.callback();
  }
}
function resetQueue() {
  let empty = !store.getters.getQueue.reduce((sum, val) => sum += val, 0)
  if (empty) {
    store.dispatch("actionSetQueue", []);
    store.dispatch("actionSetQueueId", 0);
  }
}
export function fromVuex(name, id = null, keyName = null) {
  if (keyName) return store.getters.getEntityByParameter({name: keyName, value: id, entity: name});
  if (id) return store.getters.getEntityById(id, name);
  return store.getters.getEntities(name);
}
