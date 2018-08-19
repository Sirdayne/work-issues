import {EventBus} from "services/EventBus";
import moment from "moment";

const state = {
  modeEditPoints: false,
  mapDate: moment(),
  gpsStart: null,
  gpsEnd: null,
  filterBy: "def",
  filterField: null,
  filterEmployee: null,
  filterCars: [],
  legendAssignments: []
};

const getters = {
  getMapDate: (state) => {
    return state.mapDate
  },
  getModeEditPoints: (state) => {
    return state.modeEditPoints
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
  getLegendAssignments: (state) => {
    return state.legendAssignments
  }
};

const mutations = {
  setMapDate: (state, payload) => {
    state.mapDate = payload
  },
  setModeEditPoints: (state, payload) => {
    state.modeEditPoints = payload
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
  setLegendAssignments: (state, payload) => {
    state.legendAssignments = payload
  }
};

const actions = {
  actionSetMapDate: (context, payload) => {
    context.commit("setMapDate", payload);
  },
  actionSetModeEditPoints: (context, payload) => {
    context.commit("setModeEditPoints", payload);
  },
  actionSetGpsStart: (context, payload) => {
    context.commit("setGpsStart", payload);
  },
  actionSetGpsEnd: (context, payload) => {
    context.commit("setGpsEnd", payload);
  },
  actionSetFilterBy: (context, payload) => {
    context.commit("setFilterBy", payload);
    EventBus.$emit("MapChangeTabs")
  },
  actionSetFilterField: (context, payload) => {
    context.dispatch("actionSetFilterCars", [])
    context.dispatch("actionSetFilterBy", "field")
    context.commit("setFilterField", payload);
  },
  actionSetFilterEmployee: (context, payload) => {
    context.dispatch("actionSetFilterCars", [])
    context.dispatch("actionSetFilterBy", "employee")
    context.commit("setFilterEmployee", payload);
  },
  actionSetFilterCars: (context, payload) => {
    if (payload.length > 1) {
      context.dispatch("actionSetFilterBy", "cars")
    } else if ((payload.length === 1)) {
      context.dispatch("actionSetFilterBy", "car")
    } else {
      context.dispatch("actionSetFilterBy", "def")
    }
    context.commit("setFilterCars", payload);
  },
  actionSetLegendAssignments: (context, payload) => {
    context.commit("setLegendAssignments", payload)
  }
};

export default {
  state,
  getters,
  mutations,
  actions
}
