import {
  EventBus
} from "services/EventBus";
import http from 'lib/httpQueryV2';

const state = {
  selectedAssignments: [],
  selectedFields: [],
  assignmentsTracks: {
    ids: [],
    tracks: [],
  },
  assignmentsWithoutTracks: [],
  teleport: false,
};

const getters = {
  getSelectedAssignments: (state) => {
    return state.selectedAssignments;
  },
  getSelectedFields: (state) => {
    return state.selectedFields;
  },
  getTeleport: (state) => {
    return state.teleport;
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
  setTeleport: (state, payload) => {
    state.teleport = payload
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
  actionSetTeleport: (context, payload) => {
    context.commit('setTeleport', payload);
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
