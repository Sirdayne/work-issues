import {store} from "store/store";

export default {
  getCurrentWork(workId) {
    return store.getters.getEntityById(workId, "works");
  },
  getPlanWorkTypeIdByWorkId(workId) {
    return this.getCurrentWork(workId).planWorkTypeId;
  },
  getWorkTypesIdsByConditionType(conditionType) {
    let workTypes = store.getters.getEntities("worktypes")
    return workTypes.filter(wt => wt.conditionType === conditionType).map(wt => wt.id);
  },
  getAssignmentTypeId(workId) {
    const currentWork = this.getCurrentWork(workId);
    return currentWork ? currentWork.assignmentType : null;
  },
  getAssignmentTypeByAssignmentTypeId(assignmentId) {
    const assignmentTypes = {
      0: {"name": "Простые", "value": "FieldAssignment"},
      1: {"name": "Посевные", "value": "SowingAssignment"},
      2: {"name": "Полевые", "value": "FieldAssignment"},
      3: {"name": "Транспортировка до поля", "value": "ToFieldAssignment"},
      4: {"name": "Транспортировка от поля", "value": "FromFieldAssignment"},
    }
    return assignmentTypes[assignmentId] ? assignmentTypes[assignmentId] : ""
  },
  getStartDateFromWorkDatesByWorkId(workId) {
    let workDates = store.getters.getEntities("workdates")
    let startDate = new Date("1/1/1970")
    for (var i = 0, n = workDates.length; i < n; i++) {
      if (workDates[i].workTypeParameterPlanWorkTypesIds.indexOf(workId) > -1) {
        startDate = new Date(workDates[i].startDate)
        break;
      }
    }
    return startDate
  },
  getAssignmentsWorks() {
    let works = store.getters.getEntities("works");
    return works.filter(w => !this._isFieldAssignment(w))
  },
  getTransportationWorks() {
    let works = store.getters.getEntities("works");
    return works.filter(w => this._isFieldAssignment(w))
  },
  _isFieldAssignment(w) {
    return w.assignmentType == 4 || w.assignmentType == 3
  },
  /**
   * Fuel Norms
   */
  getInstrumentsIdsFromFuelNorms(subOperationId, carModelId) {
    let ids = [];
    const fuelNorms = store.getters.getEntities("fuelnorms");
    fuelNorms.forEach(fn => {
      let subOperationsIds = fn.subOperationsIds.includes(subOperationId)
      let carModelsIds = fn.carModelsIds.includes(carModelId)
      let cond = subOperationsIds && carModelsIds
      if (cond) ids = ids.concat(fn.instrumentsIds)
    })
    return ids.sort((a, b) => a - b).filter((val, i, arr) => arr.indexOf(val) === i);
  },
  getInstrumentsIdsFromFuelNormsByCarModelId(carModelId, ids) {
    const fuelNorms = store.getters.getEntities("fuelnorms");
    fuelNorms.forEach(fn => {
      let carModelsIds = fn.carModelsIds.includes(carModelId)
      let cond = carModelsIds
      if (cond) fn.instrumentsIds.forEach(id => ids[id] = true)
    })
    return ids;
  },
  getCarModelsIdsFromFuelNorms(subOperationId) {
    let ids = [];
    const fuelNorms = store.getters.getEntities("fuelnorms");
    fuelNorms.forEach(fn => {
      let subOperationsIds = fn.subOperationsIds.includes(subOperationId)
      let cond = subOperationsIds
      if (cond) ids = ids.concat(fn.carModelsIds)
    })
    return ids.sort((a, b) => a - b).filter((val, i, arr) => arr.indexOf(val) === i);
  },
  /**
   * Cars
   */
  getCurrentCar(carId) {
    return store.getters.getEntityById(carId, "carsAll");
  },
  getCarsFromCarModelsIds(workId, cars) {
    const currentWork     = this.getCurrentWork(workId);
    const planWorkTypeId  = currentWork.planWorkTypeId;
    const carModelsIds    = this.getCarModelsIdsFromFuelNorms(planWorkTypeId);

    return cars.filter(c => carModelsIds.includes(c.carModelId));
  },
  getCarsFilteredByWorks(workId) {
    const cars = store.getters.getEntities("cars");
    return this.getCarsFromCarModelsIds(workId, cars);
  },
  getCarsFilteredByWorksAndOrganization(workId, organizationId) {
    let cars  = store.getters.getEntities("carsAll");
    cars      = cars.filter(c => c.organizationId === organizationId);
    return this.getCarsFromCarModelsIds(workId, cars);
  },
  /**
   * Instruments
   */
  getInstrumentsFilteredByWorksAndCars(workId, carId) {
    const instruments = store.getters.getEntities("instruments");
    return this.getInstrumentsFromInstrumentsIds(workId, carId, instruments);
  },
  getInstrumentsFromInstrumentsIds(workId, carId, instruments) {
    const planWorkTypeId = this.getCurrentWork(workId).planWorkTypeId;
    const carModelId = this.getCurrentCar(carId).carModelId;
    const instrumentsIds = this.getInstrumentsIdsFromFuelNorms(planWorkTypeId, carModelId);
    return instruments.filter(i => instrumentsIds.includes(i.id));
  },
  getInstrumentsByOrganization(organizationId) {
    const cars = store.getters.getEntities("carsAll").filter(c => c.organizationId == organizationId)
    let instrumentsIds = {}
    cars.forEach(c =>
      instrumentsIds = this.getInstrumentsIdsFromFuelNormsByCarModelId(c.carModelId, instrumentsIds)
    )
    instrumentsIds = Object.keys(instrumentsIds).map(id => +id);
    const instruments = store.getters.getEntities("instruments");
    return instruments.filter(i => instrumentsIds.includes(i.id));
  },
  /**
   * Employees
   */
  getEmployeesFilteredByOrganization(organizationId) {
    const employees = store.getters.getEntities("employeesAll");
    return employees.filter(e => e.organizationId === organizationId);
  },
  /**
   * SeedLimits
   */
  getSeedLimitById(seedLimitId) {
    return store.getters.getEntityById(seedLimitId, "seedlimits");
  },
  getCultureDepthById(cultureId) {
    return store.getters.getEntityByParameter({name: "cultureId", value: cultureId, entity: "culturedepths"});
  },
  getMinMaxOfSowingDepths(seedLimitId) {
    const seedLimit = this.getSeedLimitById(seedLimitId);
    if (!seedLimit) return 0;
    const cultureDepth = this.getCultureDepthById(seedLimit.cultureId);
    if (!cultureDepth) {
      this.$message({
        message: `Не заполнена глубина посева культуры id: ${seedLimit.cultureId}`,
        type: "error",
        duration: 5000,
        showClose: false,
      })
    }
    return cultureDepth;
  },
}
