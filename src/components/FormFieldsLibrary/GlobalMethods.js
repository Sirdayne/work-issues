import { EventBus } from 'services/EventBus';
import localforage from 'localforage';
import moment from 'moment';

export default {
  methods: {
    /**
     * General
     */
    clone(a) {
      return JSON.parse(JSON.stringify(a));
    },
    getCurrentMode() {
      let mode  = this.$store.getters.getCurrentMode ? this.$store.getters.getCurrentMode.toString().toLowerCase() : null;
      mode      = mode ? mode.charAt(0).toUpperCase() + mode.substr(1) : null;
      return mode;
    },
    toUnixTimestamp(date, minusSix = false) {
      let newDate = new Date(date).getTime();
      if (minusSix) {
        const timezoneEqualizer = 1000 * 60 * 360;
        newDate = newDate - timezoneEqualizer;
      }
      return newDate;
    },
    setHourMinuteSecond(hour, minute, second) {
      return moment().hour(hour).minute(minute).second(second).format().toString().replace('+06:00', '');
    },
    formatToISODate(date) {
      return moment(date).format();
    },
    getEntities(name) {
      return this.$store.getters.getEntities(name);
    },
    getEntityById(id, name) {
      return this.$store.getters.getEntityById(id, name);
    },

    /**
     * Update Methods
     */
    initializeUpdate(params = {id: null, currentPage: null, fields: []}) {
      const item = this.$store.getters.getEntityById(params.id, params.currentPage);

      /**
       * It is detected that recordsLoader not loading up the data to Vuex sometimes,
       * thus it results in not having any editable item in an array.
       * For a quick fix, it is possible to just
       * reload the page, to obtain
       * all the necessary data.
       */
      if (item === undefined || item === null) {
        let response = confirm('В кэше отсутствуют данные. Перезагрузить страницу?');

        if (response) {
          window.location.reload();
        }

      } else {
        this.$store.dispatch('actionSetCurrentPage', params.currentPage);
        this.$store.dispatch('actionAddEditable', item);
        this.$store.dispatch('actionAddFormFields', params.fields);
        this.$store.dispatch('actionSetDialogWindowMode', 'UPDATE');
        this.$store.dispatch('actionOpenDialogWindow');
      }
    },

    /**
     * Assignments
     */
    getCurrentAssignment(assignmentId) {
      return this.$store.getters.getEntityById(assignmentId, 'assignments');
    },

    /**
     * Works
     */
    getCurrentWork(workId) {
      return this.$store.getters.getEntityById(workId, 'works');
    },
    getPlanWorkTypeIdByWorkId(workId) {
      return this.getCurrentWork(workId).planWorkTypeId;
    },
    getWorkTypesIdsByConditionType(conditionType) {
      let workTypes = this.$store.getters.getEntities('worktypes')
      return workTypes.filter(wt => wt.conditionType === conditionType).map(wt => wt.id);
    },
    getAssignmentTypeId(workId) {
      const currentWork = this.getCurrentWork(workId);
      return currentWork ? currentWork.assignmentType : null;
    },
    getAssignmentTypeByAssignmentTypeId(assignmentId) {
      const assignmentTypes = {
        0: {"name": "Простые", "value": "SimpleAssignment"},
        1: {"name": "Посевные", "value": "SowingAssignment"},
        2: {"name": "Полевые", "value": "FieldAssignment"},
        3: {"name": "Транспортировка до поля", "value": "ToFieldAssignment"},
        4: {"name": "Транспортировка от поля", "value": "FromFieldAssignment"},
      }
      return assignmentTypes[assignmentId] ? assignmentTypes[assignmentId] : ""
    },
    getPlanWorkTypeIsSowing(workId) {
      const currentWork = this.getCurrentWork(workId);
      return currentWork ? currentWork.planWorkTypeIsSowing : null;
    },
    getStartDateFromWorkDatesByWorkId(workId) {
      let workDates = this.$store.getters.getEntities('workdates')
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
      let works = this.$store.getters.getEntities('works');
      return works.filter(w => !this._isFieldAssignment(w))
    },
    getTransportationWorks() {
      let works = this.$store.getters.getEntities('works');
      return works.filter(w => this._isFieldAssignment(w))
    },
    _isFieldAssignment(w) {
      return w.assignmentType == 4 || w.assignmentType == 3
    },


    /**
     * Fuel Norms
     */
    getIdsFromFuelNorms(params = {}) {
      params = {
        subOperationId: params.subOperationId ? params.subOperationId : 0,
        carModelId: params.carModelId ? params.carModelId : 0,
        instrumentId: params.instrumentId ? params.instrumentId : 0
      };
      let ids = [];
      const fuelNorms = this.$store.getters.getEntities('fuelnorms');

      for (let i in fuelNorms) {
        if (fuelNorms.hasOwnProperty(i)) {
          let fuelNorm = fuelNorms[i];
          if (params.subOperationId && params.carModelId !== 0) {
            if (fuelNorm.subOperationsIds.includes(params.subOperationId) &&
                fuelNorm.carModelsIds.includes(params.carModelId)) {
              for (let j in fuelNorm.instrumentsIds) {
                if (fuelNorm.instrumentsIds.hasOwnProperty(j)) {
                  ids.push(fuelNorm.instrumentsIds[j]);
                }
              }
            }
          } else if (params.subOperationId && params.carModelId === 0) {
            if (fuelNorm.subOperationsIds.includes(params.subOperationId)) {
              for (let j in fuelNorm.carModelsIds) {
                if (fuelNorm.carModelsIds.hasOwnProperty(j)) {
                  ids.push(fuelNorm.carModelsIds[j]);
                }
              }
            }
          }
        }
      }

      ids = ids.sort().filter(function (item, index, inputArray) {
        return inputArray.indexOf(item) === index;
      });

      return ids;
    },
    /**
     * Cars
     */
    getCurrentCar(carId) {
      return this.$store.getters.getEntityById(carId, 'carsAll');
    },
    getCarsFromCarModelsIds(workId, cars) {
      const currentWork     = this.getCurrentWork(workId);
      const planWorkTypeId  = currentWork.planWorkTypeId;
      const carModelsIds    = this.getIdsFromFuelNorms({subOperationId: planWorkTypeId});

      return cars.filter(c => carModelsIds.includes(c.carModelId));
    },
    getCarsFilteredByWorks(workId) {
      const cars = this.$store.getters.getEntities('cars');
      return this.getCarsFromCarModelsIds(workId, cars);
    },
    getCarsFilteredByWorksAndOrganization(workId, organizationId) {
      let cars  = this.$store.getters.getEntities('carsAll');
      cars      = cars.filter(c => c.organizationId === organizationId);
      return this.getCarsFromCarModelsIds(workId, cars);
    },
    getCarsByCarTypeName(carTypeName) {
      const carType   = this.getCarTypeByName(carTypeName);
      const carModels = this.getCarModelsByCarTypeId(carType.id);
      const cars      = this.$store.getters.getEntities('cars');

      return cars.filter(c => {
        let foundCar = false;
        carModels.map(carModel => {
          if (carModel.id === c.carModelId) {
            foundCar = true;
          }
        });
        if (foundCar) {
          return c;
        }
      });
    },

    /**
     * Car Models
     */
    getCarModelsByCarTypeId(carTypeId) {
      const carModels = this.$store.getters.getEntities('carModels');
      return carModels.filter(c => c.carTypeId === carTypeId);
    },

    /**
     * Car Types
     */
    getCarTypeByName(name) {
      const carTypes = this.$store.getters.getEntities('carTypes');
      let foundCarType;

      switch (name) {
        case 'Tractor'    : foundCarType = carTypes.find(c => c.name === 'Трактор'); break;
        case 'Combine'    : foundCarType = carTypes.find(c => c.name === 'Комбайн'); break;
        case 'LightCar'   : foundCarType = carTypes.find(c => c.name === 'Легковой автомобиль'); break;
        case 'FreightCar' : foundCarType = carTypes.find(c => c.name === 'Грузовой автомобиль'); break;
        case 'Harvester'  : foundCarType = carTypes.find(c => c.name === 'Жатка самоходная'); break;
        case 'Sprayer'    : foundCarType = carTypes.find(c => c.name === 'Опрыскиватель'); break;
      }

      return foundCarType;
    },

    /**
     * Instruments
     */
    getInstrumentsFromInstrumentsIds(workId, carId, instruments) {
      const planWorkTypeId  = this.getCurrentWork(workId).planWorkTypeId;
      const carModelId      = this.getCurrentCar(carId).carModelId;
      const instrumentsIds  = this.getIdsFromFuelNorms({subOperationId: planWorkTypeId, carModelId: carModelId});

      return instruments.filter(i => instrumentsIds.includes(i.id));
    },
    getInstrumentsFilteredByWorksAndCars(workId, carId) {
      const instruments = this.$store.getters.getEntities('instruments');
      return this.getInstrumentsFromInstrumentsIds(workId, carId, instruments);
    },
    getInstrumentsFilteredByWorksAndCarsAndOrganization(workId, carId, organizationId) {
      const organizationInstruments = this.$store.getters.getEntities('organizationInstruments')
                                        .filter(i => i.id === organizationId)
                                        .map(i => i.instrumentId);

      const instrumentsAll    = this.$store.getters.getEntities('instrumentsAll');
      let filteredInstruments = instrumentsAll.filter(i => organizationInstruments.includes(i.id));

      return this.getInstrumentsFromInstrumentsIds(workId, carId, filteredInstruments);
    },

    /**
     * Employees
     */
    getEmployeesFilteredByOrganization(organizationId) {
      const employees = this.$store.getters.getEntities('employeesAll');
      return employees.filter(e => e.organizationId === organizationId);
    },

    /**
     * SeedLimits
     */
    getSeedLimitById(seedLimitId) {
      return this.$store.getters.getEntityById(seedLimitId, 'seedlimits');
    },
    getCultureDepthById(cultureId) {
      return this.$store.getters.getEntityByParameter({name: 'cultureId', value: cultureId, entity: 'culturedepths'});
    },
    getMinMaxOfSowingDepths(seedLimitId) {
      const seedLimit = this.getSeedLimitById(seedLimitId);
      const cultureDepth = this.getCultureDepthById(seedLimit.cultureId);
      return cultureDepth;
    },

    /**
     * Fields
     */
    getAreaOfSeedLimitField(fieldId) {
      const seedLimits = this.$store.getters.getEntities('seedLimits');
      return seedLimits.find(f => f.fieldId === fieldId).area;
    },
    getFilteredFields(fieldId) {
      return this.$store.getters.getEntities('fields').filter(f => f.id === fieldId);
    },
    getFilteredCultureFieldZones(cultureId) {
      return this.$store.getters.getEntities('cultureFieldZones').filter(c => c.cultureId === cultureId);
    },
    getCrossFilterFieldsAndCultureFieldZones(fields, cultureFieldZones) {
      return cultureFieldZones.filter((culture) =>
        true === fields.map(field => field.fieldZoneId === culture.fieldZoneId)[0]
      );
    },

    /**
     * ChemistryLimits
     */
    getChemistryLimitsChemicalPreparations() {
      return this.$store.getters.getEntities('chemicalPreparations').filter(c => c.isMacrofertilizer === false);
    },
    getWeedTypes() {
      return this.$store.getters.getEntities('weedTypes');
    },
    getMinMaxChemicalPreparationNorm(chemicalPreparationId, type) {
      let cp = this.$store.getters.getEntityById(chemicalPreparationId, 'chemicalPreparations');
      return cp ? cp[type] : null;
    },

    /**
     * FertilizerLimits
     */
    getFertilizerLimitsChemicalPreparations() {
      return this.$store.getters.getEntities('chemicalPreparations').filter(c => c.isMacrofertilizer === true);
    },
  }
}
