const state = {
  creatable: {},
};

const getters = {
  getCreatable: (state) => {
    return state.creatable;
  },
};

const mutations = {
  updateCreatable: (state, payload) => {
    state.creatable[payload.key] = payload.value;
  },
};

const actions = {
  actionUpdateCreatable: ({commit}, payload) => {
    commit('updateCreatable', payload);
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
}
