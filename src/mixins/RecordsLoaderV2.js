import entities from 'entities.yaml';
import localforage from 'localforage';
import http from 'lib/httpQueryV2';
import pluralize from 'pluralize';
import complexEntities from 'complexEntities.json';

export default {
  data() {
    return {
      ready: false,
      prefix: 'data/',
      updated: 1,
    }
  },
  watch: {
    ['queueLength'](val) {
      if (val) {
      } else {
        this.$store.dispatch('actionSetQueue', []);
        this.$store.dispatch('actionSetQueueId', 0);
      }
    },
  },
  computed: {
    queue() {
      return this.$store.getters.getQueue
    },
    queueId() {
      return this.$store.getters.getQueueId
    },
    queueLength() {
      return this.queue.reduce((sum, val) => sum += val, 0)
    },
  },
  methods: {
    fetchEntities(list, callback = false) {
      if (list.length) {
        let params = {
          organizationId: this.$store.getters.getOrganizationId,
          list: list.map(l => l.toLowerCase()),
          callback: () => { callback ? callback() : false },
        }
        this.getEntityModified(params)
      }
    },
    getEntityModified(params) {
      http.getEntityModified()
        .then(data => {
          let emt = data.map(d => {
            d.className = d.className.toLowerCase()
            return d
          })
          emt = this.addComplexEntities(emt)
          this.manageQueue(params)
          this.getEntities(params, emt)
        })
    },
    addComplexEntities(emt) {
      Object.keys(complexEntities).forEach(key => {
        let obj = {
          className: key,
          dateModified: "",
          organizationId: +this.$store.getters.getOrganizationId,
        }
        let dates = emt.filter(e =>
          e.organizationId == obj.organizationId && complexEntities[key].includes(e.className)
        ).map(e => e.dateModified)
        obj.dateModified = new Date(Math.max.apply(null, dates));
        emt.push(obj)
      })
      return emt
    },
    manageQueue(params) {
      let queue = this.queue.slice()
      queue[this.queueId] = params.list.length
      this.$store.dispatch('actionSetQueue', queue);
      this.$store.dispatch('actionSetQueueId', this.queueId + 1);
    },
    getEntities(params, emt) {
      params.list.forEach(entity => {
        this.getLocalRecords({ ...params, ...{ name: entity, queueId: this.queueId - 1 } }, emt)
      })
    },
    getLocalRecords(params, emt) {
      let foundEntity = this.searchEntitiesForParam(params.name);
      let context = this.resolveContexts(foundEntity);
      let path = this.buildPath(foundEntity, params);
      let key = context ? path + '' + context : path;
      let hasOrganization = foundEntity && foundEntity.contexts && foundEntity.contexts.includes("organization")
      let organizationId = hasOrganization ? params.organizationId : null
      let paramsName = context ? params.name : key
      let mostRecentTime = this.mostRecentTime(emt, paramsName, organizationId)
      localforage.getItem(this.prefix + key)
        .then(res => {
          if (res) {
            let response = res
            let data = response.data
            let dateModified = response.dateModified
            let isMostRecent = mostRecentTime == new Date(dateModified).getTime()
            if (isMostRecent) {
              this.$store.dispatch('actionAddEntities', {
                name: params.name,
                data: data
              });
              this.updateFetchState(params);
            } else {
              this.getRemoteRecords(params, mostRecentTime, true)
            }
          } else {
            let notCache = mostRecentTime ? true : false
            this.getRemoteRecords(params, mostRecentTime, notCache)
          }
        })
        .catch((error) => {
          this.getRemoteRecords(params, mostRecentTime)
        });
    },
    mostRecentTime(emt, name, organizationId) {
      if (name == "workTypeParameterPlanWorkTypes") name = "works"
      let entity = emt
      .filter(e => {
        return e.organizationId == organizationId
      })
      .find(e => {
        let plural = pluralize(e.className)
        return plural == name || e.className == name
      })
      if (entity) {
        return new Date(entity.dateModified).getTime()
      }
      return false
    },
    getRemoteRecords(params, mostRecentTime, notCache) {
      let foundEntity = this.searchEntitiesForParam(params.name);
      let context = this.resolveContexts(foundEntity);
      let path = this.buildPath(foundEntity, params);
      path = context ? path + '' + context : path;
      let httpGetQuery = notCache ? http.getWithoutCache(path): http.get(path);
      httpGetQuery.then(data => {
        this.$store.dispatch('actionAddEntities', { name: params.name, data: data });
        if (mostRecentTime) {
          let value = {data: data, dateModified: mostRecentTime}
          localforage.setItem(this.prefix + path, value)
          .then((value) => {
            this.updateFetchState(params);
          })
          .catch((error) => {
            this.updateFetchState(params);
          });
        } else {
          this.updateFetchState(params);
        }
      }).catch((error) => {
        this.updateFetchState(params);
      });
    },
    searchEntitiesForParam(param) {
      param = param.toString().toLowerCase();
      let key = Object.keys(entities).find(e => e.toLowerCase() === param)
      let entity = key ? entities[key] : null
      return entity
    },
    resolveContexts(entity) {
      let resolved = "";
      if (entity && entity.hasOwnProperty('contexts')) {
        entity.contexts.forEach(context => {
          resolved += '/' + this.$root.context[context];
        });
      }
      return resolved;
    },
    buildPath(foundEntity, params) {
      return foundEntity && foundEntity.hasOwnProperty('path') && foundEntity.path.length ?
        foundEntity.path :
        params.name;
    },
    updateFetchState(params) {
      let queue = this.queue.slice()
      queue[params.queueId]--
        this.$store.dispatch('actionSetQueue', queue);
      if (!this.queue[params.queueId]) {
        this.ready = true
        this.updated++
          if (params.callback) params.callback();
      }
    },
    fromVuex(name, id = null, keyName = null) {
      if (keyName) return this.$store.getters.getEntityByParameter({ name: keyName, value: id, entity: name });
      if (id) return this.$store.getters.getEntityById(id, name);
      return this.$store.getters.getEntities(name);
    },
  }
}
