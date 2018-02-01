const state = {
  editable: null,
};

const getters = {
  getEditable: (state) => {
    return state.editable;
  },
};

const mutations = {
  addEditable: (state, payload) => {
    state.editable = payload;
  },
  updateEditable: (state, payload) => {
    state.editable[payload.key] = payload.value;
  },
};

const actions = {
  actionAddEditable: ({commit}, payload) => {
    commit('addEditable', payload);
  },
  actionUpdateEditable: ({commit}, payload) => {
    commit('updateEditable', payload);
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
}
