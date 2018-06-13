import {
  EventBus
} from "services/EventBus";
import http from 'lib/httpQueryV2';
import moment from 'moment';
import {deepClone} from 'lib/utils';

const state = {
  selectedAssignments: [],
  selectedFields: [],
  assignmentsTracks: {
    ids: [],
    tracks: [],
  },
  assignmentsWithoutTracks: [],
  timeTravel: false,
  selectedDate: moment().hour(8).minute(0).second(0).subtract(1, 'days').format(),
  gpsDateStart: null,
  gpsDateEnd: null,
};

const getters = {
  getSelectedAssignments: (state) => {
    return deepClone(state.selectedAssignments)
  },
  getSelectedFields: (state) => {
    return deepClone(state.selectedFields);
  },
  getTimeTravel: (state) => {
    return state.timeTravel;
  },
  getSelectedDate: (state) => {
    return state.selectedDate
  },
  getGpsDateStart: (state) => {
    return state.gpsDateStart
  },
  getGpsDateEnd: (state) => {
    return state.gpsDateEnd
  },
};

const mutations = {
  destroy: (state) => {
    state.selectedAssignments = []
    state.selectedFields = []
    state.assignmentsTracks = {
      ids: [],
      tracks: [],
    }
    state.assignmentsWithoutTracks = []
  },
  selectAssignment: (state, payload) => {
    if (!state.selectedAssignments.includes(payload)) {
      state.selectedAssignments.push(payload);
    }
  },
  selectField: (state, payload) => {
    if (!state.selectedFields.includes(payload)) {
      state.selectedFields.push(payload);
    }
  },
  unselectAssignment: (state, payload) => {
    let indexOf = state.selectedAssignments.indexOf(payload);
    state.selectedAssignments.splice(indexOf, 1);
  },
  unselectField: (state, payload) => {
    let indexOf = state.selectedFields.indexOf(payload);
    state.selectedFields.splice(indexOf, 1);
  },
  addAssignmentsTracks: (state, payload) => {
    if (!state.assignmentsTracks.ids.includes(payload.assignmentId)) {
      state.assignmentsTracks.ids.push(payload.assignmentId);
      state.assignmentsTracks.tracks.push({
        assignmentId: payload.assignmentId,
        track: payload.track
      });
    }
  },
  removeAssignmentsTracks: (state, payload) => {
    let indexOfId = state.assignmentsTracks.ids.indexOf(payload);
    let indexOfTrack = -1;
    state.assignmentsTracks.tracks.forEach((t, i) => {
      if (t.assignmentId === payload) {
        indexOfTrack = i;
      }
    })
    state.assignmentsTracks.ids.splice(indexOfId, 1);
    state.assignmentsTracks.tracks.splice(indexOfTrack, 1);
  },
  addAssignmentWithoutTrack: (state, payload) => {
    state.assignmentsWithoutTracks.push(payload);
  },
  removeAssignmentWithoutTrack: (state, payload) => {
    let indexOf = state.assignmentsWithoutTracks.indexOf(payload);
    state.assignmentsWithoutTracks.splice(indexOf, 1);
  },
  setTimeTravel: (state, payload) => {
    state.timeTravel = payload
  },
  setSelectedDate: (state, payload) => {
    state.selectedDate = payload
  },
  setGpsDateStart: (state, payload) => {
    state.gpsDateStart = payload
  },
  setGpsDateEnd: (state, payload) => {
    state.gpsDateEnd = payload
  },
};

const actions = {
  actionSelectAssignment: (context, payload) => {
    context.commit('selectAssignment', payload);
  },
  actionSelectField: (context, payload) => {
    context.commit('selectField', payload);
  },
  actionUnselectAssignment: (context, payload) => {
    context.commit('unselectAssignment', payload);
    context.commit('removeAssignmentsTracks', payload);
    EventBus.$emit('MapController.SelectedAssignmentLoadingFinished', context.state.assignmentsTracks.tracks);
  },
  actionUnselectField: (context, payload) => {
    context.commit('unselectField', payload);
  },
  actionSetTimeTravel: (context, payload) => {
    context.commit('setTimeTravel', payload);
  },
  actionSetSelectedDate: (context, payload) => {
    context.commit('setSelectedDate', payload);
  },
  actionSetGpsDateStart: (context, payload) => {
    context.commit('setGpsDateStart', payload);
  },
  actionSetGpsDateEnd: (context, payload) => {
    context.commit('setGpsDateEnd', payload);
  },
  actionAddAssignmentWithoutTrack: (context, payload) => {
    context.commit('addAssignmentWithoutTrack', payload);
  },
  actionGetTrackForAssignment: (context, payload) => {
    return new Promise((resolve, reject) => {
      http.get('leafletTracks/' + payload.orgId, payload.id)
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        })
    })
  },
  actionHandleSuccessfulFetch: (context, payload) => {
    let data = payload.data;
    let assignmentId = payload.assignment.id;
    let fieldId = payload.assignment.fieldId;
    if (Object.keys(data).length) {
      context.commit('addAssignmentsTracks', {
        assignmentId: data.assignmentId,
        track: data.track
      });
      EventBus.$emit('MapController.SelectedAssignmentLoadingFinished', context.state.assignmentsTracks.tracks);
      context.dispatch('actionSelectAssignment', assignmentId);
      context.dispatch('actionSelectField', fieldId);
    } else {
      context.dispatch('actionAddAssignmentWithoutTrack', assignmentId);
      EventBus.$emit('MapController.SelectedAssignmentLoadingEmptyResultReturned', assignmentId);
    }
  },
  actionDestroy: (context) => {
    context.commit('destroy')
  }
};

export default {
  state,
  getters,
  mutations,
  actions
}
