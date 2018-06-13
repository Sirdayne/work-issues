import {EventBus} from "services/EventBus";
import moment from 'moment';
import {deepClone} from 'lib/utils';

const state = {
  mapDate: moment().hour(8).minute(0).second(0).subtract(1, 'days').format(),
  gpsStart: null,
  gpsEnd: null,
  filterBy: 'def',
  filterField: null,
  filterEmployee: null,
  filterCars: [],
};

const getters = {
  getMapDate: (state) => {
    return state.mapDate
  },
  getGpsStart: (state) => {
    return state.gpsStart
  },
  getGpsEnd: (state) => {
    return state.gpsEnd
  },
  getFilterBy: (state) => {
    return state.filterBy
  },
  getFilterField: (state) => {
    return state.filterField
  },
  getFilterEmployee: (state) => {
    return state.filterEmployee
  },
  getFilterCars: (state) => {
    return state.filterCars
  },
};

const mutations = {
  setMapDate: (state, payload) => {
    state.mapDate = payload
  },
  setGpsStart: (state, payload) => {
    state.gpsStart = payload
  },
  setGpsEnd: (state, payload) => {
    state.gpsEnd = payload
  },
  setFilterBy: (state, payload) => {
    state.filterBy = payload
  },
  setFilterField: (state, payload) => {
    state.filterField = payload
  },
  setFilterEmployee: (state, payload) => {
    state.filterEmployee = payload
  },
  setFilterCars: (state, payload) => {
    state.filterCars = payload
  },
};

const actions = {
  actionSetMapDate: (context, payload) => {
    context.commit('setMapDate', payload);
  },
  actionSetGpsStart: (context, payload) => {
    context.commit('setGpsStart', payload);
  },
  actionSetGpsEnd: (context, payload) => {
    context.commit('setGpsEnd', payload);
  },
  actionSetFilterBy: (context, payload) => {
    context.commit('setFilterBy', payload);
    EventBus.$emit('MapChangeTabs')
  },
  actionSetFilterField: (context, payload) => {
    context.dispatch('actionSetFilterCars', [])
    context.dispatch('actionSetFilterBy', 'field')
    context.commit('setFilterField', payload);
  },
  actionSetFilterEmployee: (context, payload) => {
    context.dispatch('actionSetFilterCars', [])
    context.dispatch('actionSetFilterBy', 'employee')
    context.commit('setFilterEmployee', payload);
  },
  actionSetFilterCars: (context, payload) => {
    if (payload.length > 1) {
      context.dispatch('actionSetFilterBy', 'cars')
    } else {
      context.dispatch('actionSetFilterBy', 'car')
    }
    context.commit('setFilterCars', payload);
  },
};

export default {
  state,
  getters,
  mutations,
  actions
}
