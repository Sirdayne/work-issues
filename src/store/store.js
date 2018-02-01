import Vue from 'vue';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import localforage from 'localforage';
import Crypt from 'services/Crypt';

import UpdateComponent from './modules/UpdateComponent';
import CreateComponent from './modules/CreateComponent';
import FuelNorms from './modules/FuelNorms';
import Map from './modules/Map';
import TrackTimes from './modules/TrackTimes';

Vue.use(Vuex);
Vue.use(VueResource);

export const store = new Vuex.Store({
  state: {
    // Entities
    assignments: [],
    assignmentsdailyreportitems: [],
    areaassignments: [],
    brigades: [],
    budgets: [],
    carcoordinates: [],
    carmodels: [],
    cars: [],
    carsall: [],
    carstatus: [],
    carstatusextended: [],
    cartypes: [],
    chemicalpreparations: [],
    chemicalpreparationtypes: [],
    chemistrylimits: [],
    chemistrylimitfact: [],
    croprotations: [],
    cttops: [],
    culturedepths: [],
    culturefieldzones: [],
    cultures: [],
    diseases: [],
    downtime: [],
    employees: [],
    employeesall: [],
    fertilizerlimits: [],
    fields: [],
    fieldsAll: [],
    fieldlastassignments: [],
    fieldweediness: [],
    fieldcontours: [],
    fieldworks: [],
    fuelnorms: [],
    grainregistry: [],
    growthphases: [],
    incomingtransfers: [],
    internaltransfers: [],
    insects: [],
    instruments: [],
    instrumentsall: [],
    instrumentsbyorganization: [],
    leafletfields: [],
    leaflettracks: [],
    notes: [],
    operations: [],
    organizations: [],
    overdrive: [],
    outgoingtransfers: [],
    processedstatuses: [],
    reproductions: [],
    reports: [],
    seedlimitfact: [],
    seedlimits: [],
    sorts: [],
    soiltypes: [],
    sowings: [],
    speedmonitoring: [],
    technologyrecipe: [],
    technologyrecipetypes: [],
    terrains: [],
    transportation: [],
    users: [],
    userorganizations: [],
    warehousecoordinates: [],
    warehouses: [],
    weedtypes: [],
    workdates: [],
    workplan: [],
    works: [],
    worktypes: [],
    // catalog
    assignmenttypes: [],
    suboperations: [],
    technologyreciepttypes: [],
    worktypeparameters: [],
    worktypeparameterplanworktypes: [],
    technologies: [],
    yearconstants: [],
    culturetypes: [],
    seedprices: [],
    unittypes: [],
    chemicalpreparationprices: [],
    ripenessgroups: [],
    cultureparameters: [],
    finalproducts: [],
    fieldzones: [],
    instrumenttypes: [],
    organizationinstruments: [],
    warehousetypes: [],
    storages: [],
    fielddistances: [],
    fueltypes: [],
    carmarks: [],
    carmodelgroups: [],
    carmodels: [],
    compositions: [],
    gpsproviders: [],

    // Other
    currentPage: null,
    organizationId: null,
    module: null,
    currentMode: null,
    sidebarToggleState: true,
    queue: [],
    queueId: 0,
  },
  getters: {
    getEntities: (state) => (entity) => {
      entity = entity.toLowerCase();
      return state[entity];
    },
    getEntityById: (state) => (id, entity, attr) => {
      let _attr = attr || 'id'
      entity = entity.toLowerCase();
      return state[entity].find(e => e[_attr] == id);
    },
    getEntityByParameter: (state) => (param = {
      name: null,
      value: null,
      entity: null
    }) => {
      param.entity = param.entity.toLowerCase();
      return state[param.entity].find(e => {
        if (e[param.name] && e[param.name] == param.value) {
          return e;
        }
      });
    },
    getCurrentPage: (state) => {
      return state.currentPage;
    },
    getOrganizationId: (state) => {
      return state.organizationId;
    },
    getModule: (state) => {
      return state.module;
    },
    getCurrentMode: (state) => {
      return state.currentMode;
    },
    getSidebarToggleState: (state) => {
      return state.sidebarToggleState;
    },
    getQueue: (state) => {
      return state.queue;
    },
    getQueueId: (state) => {
      return state.queueId;
    },
  },
  mutations: {
    addEntities: (state, payload) => {
      payload.state = payload.state.toLowerCase();
      state[payload.state] = payload.data;
    },
    setCurrentPage: (state, payload) => {
      state.currentPage = payload;
    },
    setOrganizationId: (state, payload) => {
      state.organizationId = payload;
    },
    setModule: (state, payload) => {
      state.module = payload;
    },
    setCurrentMode: (state, payload) => {
      state.currentMode = payload;
    },
    setSidebarToggleState: (state, payload) => {
      state.sidebarToggleState = payload;
    },
    setQueue: (state, payload) => {
      state.queue = payload;
    },
    setQueueId: (state, payload) => {
      state.queueId = payload;
    },
  },
  actions: {
    actionAddEntities: ({
      commit
    }, payload) => {
      commit('addEntities', {
        state: payload.name,
        data: payload.data
      });
    },
    actionSetCurrentPage: ({
      commit
    }, payload) => {
      commit('setCurrentPage', payload);
    },
    actionSetOrganizationId: ({
      commit
    }, payload) => {
      commit('setOrganizationId', payload);
    },
    actionSetModule: ({
      commit
    }, payload) => {
      commit('setModule', payload);
    },
    actionSetCurrentMode: ({
      commit
    }, payload) => {
      commit('setCurrentMode', payload);
    },
    actionSetSidebarToggleState: ({
      commit
    }, payload) => {
      commit('setSidebarToggleState', payload);
    },
    actionSetQueue: ({
      commit
    }, payload) => {
      commit('setQueue', payload);
    },
    actionSetQueueId: ({
      commit
    }, payload) => {
      commit('setQueueId', payload);
    },
  },
  modules: {
    UpdateComponent,
    CreateComponent,
    FuelNorms,
    Map,
    TrackTimes,
  }
});
