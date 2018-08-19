import Vue from "vue";
import Vuex from "vuex";

import {deepClone} from "lib/utils";
import Map from "./modules/Map";

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
    customorganizations: [],
    diseases: [],
    direction: [],
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
    leafletfields: [],
    leaflettracks: [],
    legend: [],
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
    roles: [],
    roletemplates: [],
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
    works: [],
    worktypecars: [],
    worktypes: [],
    analysiscardtypes: [],
    cropbalanceusers: [],
    finalproducttypes: [],
    organizationsgroup: [],
    grainprocessings: [],
    grainprocessingtypes: [],
    orderforshipment: [],
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
    culturequalitytypes: [],
    qualitytypevaluecodes: [],
    culturequalityconditions: [],
    cargpsidentifier: [],
    carmodelfuelnorms: [],
    equipments: [],
    organizationequipments: [],
    fueltypes: [],
    grainindicator: [],
    smells: [],
    conditiontypes: [],
    volumetypes: [],
    grainwastes: [],
    organizationtype: [],
    // Other
    organizationId: null,
    sidebarToggleState: true,
    queue: [],
    queueId: 0,

    //checklists
    chemicalCheckList: [],
    fertilizerCheckList: [],
    harrowingCheckList: [],
    harvestCheckList: [],
    sowingCheckList: [],

    grainoutsideofwarehouse: [],
  },
  getters: {
    getEntities: (state) => (entity) => {
      entity = entity.toLowerCase();
      let result = deepClone(state[entity])
      return result
    },
    getEntityById: (state) => (id, entity, attr) => {
      let _attr = attr || "id"
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
    getOrganizationId: (state) => {
      return state.organizationId;
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
    setOrganizationId: (state, payload) => {
      state.organizationId = payload;
    },
    setOrganizationsGroupId: (state, payload) => {
      state.organizationsGroupId = payload;
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
      commit("addEntities", {
        state: payload.name,
        data: payload.data
      });
    },
    actionSetOrganizationId: ({
      commit
    }, payload) => {
      commit("setOrganizationId", payload);
    },
    actionSetOrganizationsGroupId: ({
      commit
    }, payload) => {
      commit("setOrganizationsGroupId", payload);
    },
    actionSetSidebarToggleState: ({
      commit
    }, payload) => {
      commit("setSidebarToggleState", payload);
    },
    actionSetQueue: ({
      commit
    }, payload) => {
      commit("setQueue", payload);
    },
    actionSetQueueId: ({
      commit
    }, payload) => {
      commit("setQueueId", payload);
    },
  },
  modules: {
    Map
  }
});
