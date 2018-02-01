const state = {
  fuelnorms: [],
};

const getters = {
  getSubOperationsIdsFromFuelNorms: (state) => {
    let subOperationsIds = [];
    for (let i in state.fuelnorms) {
      let f = state.fuelnorms[i];
      for (let j in f.subOperationsIds) {
        subOperationsIds.push(f.subOperationsIds[j]);
      }
    }
    subOperationsIds = subOperationsIds.sort().filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) === index;
    });

    return subOperationsIds;
  },
  getCarModelsIdsFromFuelNorms: (state) => {
    let carModelsIds = [];
    for (let i in state.fuelnorms) {
      let f = state.fuelnorms[i];
      for (let j in f.carModelsIds) {
        carModelsIds.push(f.carModelsIds[j]);
      }
    }
    carModelsIds = carModelsIds.sort().filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) === index;
    });

    return carModelsIds;
  },
};

const mutations = {
  addFuelNorms: (state, payload) => {
    if (state.fuelnorms.length === 0) {
      state.fuelnorms = payload;
    }
  }
};

const actions = {
  actionAddFuelNorms: (context, payload) => {
    let fuelnorms = context.rootGetters.getEntities('fuelnorms');
    context.commit('addFuelNorms', fuelnorms);
  },
  actionGetFuelNormsForWorks: (context, payload) => {
    context.dispatch('actionAddFuelNorms');
    let subOperationsIds = context.getters.getSubOperationsIdsFromFuelNorms;
    let carModelsIds = context.getters.getCarModelsIdsFromFuelNorms;
  }
};

export default {
  state,
  getters,
  mutations,
  actions
}
