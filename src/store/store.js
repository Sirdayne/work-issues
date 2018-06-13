import Vue from 'vue';
import Vuex from 'vuex';

import {deepClone} from 'lib/utils';
import UpdateComponent from './modules/UpdateComponent';
import CreateComponent from './modules/CreateComponent';
import FuelNorms from './modules/FuelNorms';
import Map from './modules/Map';
import TrackTimes from './modules/TrackTimes';

import MapNew from './modules/MapNew';

Vue.use(Vuex);

export const store = new Vuex.Store({
  // strict: process.env.NODE_ENV !== 'production',
  state: {
    // Entities
    assignments: [],
    assignmentsdailyreportitems: [],
    areaassignments: [],
    brigades: [],
    budgets: [],
    carmodels: [],
    cars: [],
    carsall: [],
    carstatus: [],
    carstatusextended: [],
    carinformation: [],
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
    direction: [],
    dlinagona: [],
    downtime: [],
    employees: [],
    employeesall: [],
    eventlogs: [],
    fertilizerlimits: [],
    fields: [],
    fieldsAll: [],
    fieldsuboperationprogresstype: [],
    fieldlastassignments: [],
    fieldweediness: [],
    fieldcontours: [],
    fieldworks: [],
    fuelnorms: [],
    grainregistry: [],
    growthphases: [],
    growingphases: [],
    incomingtransfers: [],
    internaltransfers: [],
    insects: [],
    instruments: [],
    instrumentsall: [],
    instrumentsbyorganization: [],
    leafletfields: [],
    leaflettracks: [],
    notes: [],
    nozzleColor: [],
    operations: [],
    operativeinformationtype: [],
    organizations: [],
    organizationsshortname: [],
    overdrive: [],
    outgoingtransfers: [],
    processedstatuses: [],
    reproductions: [],
    reports: [],
    seedlimitfact: [],
    seedlimits: [],
    seedlimitcoordinates: [],
    seedmordant: [],
    sorts: [],
    soiltypes: [],
    sowings: [],
    speedmonitoring: [],
    technologyrecipe: [],
    technologyReciept: [],
    technologyRecieptTypes: [],
    technologyrecipetypes: [],
    terrains: [],
    transportation: [],
    threatLevel: [],
    usedPackagingAbsence: [],
    users: [],
    userorganizations: [],
    warehousecoordinates: [],
    warehouses: [],
    weedtypes: [],
    weedsGrowingPhases: [],
    workdates: [],
    workplan: [],
    works: [],
    worktypecars: [],
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
    fieldSurveys: [],
    fieldzones: [],
    instrumenttypes: [],
    organizationinstruments: [],
    warehousetypes: [],
    storages: [],
    stopjournals: [],
    stoptypes: [],
    fielddistances: [],
    fueltypes: [],
    carmarks: [],
    carmodelgroups: [],
    carmodels: [],
    compositions: [],
    gpsproviders: [],
    culturerotation: [],
    nutrientsaddition: [],
    paymentsadditionals: [],
    workconditions: [],
    weed: [],
    windDirection: [],
    inventory: [],

    // Other
    currentPage: null,
    organizationId: null,
    currentMode: null,
    sidebarToggleState: true,
    queue: [],
    queueId: 0,

    //checklists
    chemicalCheckList: [],
    fertilizerCheckList: [],
    harrowingCheckList: [],
    harvestCheckList: [],
    sowingCheckList: [],
  },
  getters: {
    getEntities: (state) => (entity) => {
      entity = entity.toLowerCase();
      let result = deepClone(state[entity])
      return result
    },
    getEntityById: (state) => (id, entity, attr) => {
      let _attr = attr || 'id'
      entity = entity.toLowerCase();
      let result = deepClone(state[entity].find(e => e[_attr] == id))
      return result
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
    setOrganizationsGroupId: (state, payload) => {
      state.organizationsGroupId = payload;
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
    actionSetOrganizationsGroupId: ({
      commit
    }, payload) => {
      commit('setOrganizationsGroupId', payload);
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
    MapNew
  }
});
