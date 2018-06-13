import {deepClone} from 'lib/utils';
import {EventBus} from 'services/EventBus';

const state = {
  mergedTrackTimes: {},
  trackTimes: [],
};

const getters = {
  getMergedTrackTimes: (state) => {
    return deepClone(state.mergedTrackTimes);
  },
  getTrackTimes: (state) => {
    return deepClone(state.trackTimes);
  },
  getTrackTimesById: (state) => (id) => {
    return deepClone(state.trackTimes.find(tt => tt.id === id))
  },
};

const mutations = {
  clearMergedTrackTimes: (state) => {
    state.mergedTrackTimes = {}
  },
  clearTrackTimes: (state) => {
    state.trackTimes = []
  },
  initMergedTrackTimes: (state, payload) => {
    state.mergedTrackTimes = payload;
  },
  updateMergedTrackTimes: (state, payload) => {
    state.mergedTrackTimes.index = payload;
  },
  initTrackTimes: (state, payload) => {
    let index = state.trackTimes.findIndex(tt => tt.id == payload.id)
    if (index > -1) {
      state.trackTimes[index] = payload
    } else {
      state.trackTimes.push(payload)
    }
  },
  updateTrackTimes: (state, payload) => {
    let index = state.trackTimes.findIndex(tt => tt.id == payload.id)
    state.trackTimes[index].index = payload.index
  },
};

const actions = {
  actionInitMergedTrackTimes: (context, payload) => {
    context.commit('initMergedTrackTimes', payload);
    EventBus.$emit('TrackTimes.MergedTrackTimesUpdated');
  },
  actionUpdateMergedTrackTimes: (context, payload) => {
    context.commit('updateMergedTrackTimes', payload);
    EventBus.$emit('TrackTimes.MergedTrackTimesUpdated');
  },
  actionInitTrackTimes: (context, payload) => {
    context.commit('initTrackTimes', payload);
  },
  actionUpdateTrackTimes: (context, payload) => {
    context.commit('updateTrackTimes', payload);
  },
  actionClearMergedTrackTimes: (context) => {
    context.commit('clearMergedTrackTimes')
  },
  actionClearTrackTimes: (context) => {
    context.commit('clearTrackTimes')
  },
};

export default {
  state,
  getters,
  mutations,
  actions
}
