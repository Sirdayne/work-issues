const state = {
  mergedTrackTimes: {},
  trackTimes: [],
};

const getters = {
  getMergedTrackTimes: (state) => {
    return state.mergedTrackTimes;
  },
  getTrackTimes: (state) => {
    return state.trackTimes;
  },
};

const mutations = {
  clearMergedTrackTimes: (state) => {
    state.mergedTrackTimes = {}
  },
  clearTrackTimes: (state) => {
    state.trackTimes = []
  },
  updateMergedTrackTimes: (state, payload) => {
    state.mergedTrackTimes = payload;
  },
  updateTrackTimes: (state, payload) => {
    let trackTimesObject = state.trackTimes.find(tt => tt.id == payload.id)
    if (trackTimesObject) {
      trackTimesObject = payload
    } else {
      state.trackTimes.push(payload)
    }
  },
};

const actions = {
  actionUpdateMergedTrackTimes: (context, payload) => {
    context.commit('updateMergedTrackTimes', payload);
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
