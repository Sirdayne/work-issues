import {fromVuex} from "services/RecordsLoader"
import GlobalMethods from "lib/GlobalMethods";
import {deepClone} from "lib/utils"

export default {
  data() {
    return {
      cars: [],
      instruments: [],
      chemicalpreparations: [],
      chemicalpreparationtypes: [],
      cultures: [],
      reproductions: [],
      sorts: [],
      works: [],
      item: {
        seedMordantChemicalTreatments: [{}],
      },
      saved: {
        items: [],
      },
      minNorm: null,
      maxNorm: null,
      loadingItem: {
        save: false,
      },
      sortsByCulture: [],
      filteredInstruments: [],
    }
  },
  created() {
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.cars = GlobalMethods.getCarsFilteredByWorks(35).concat(GlobalMethods.getCarsFilteredByWorks(36))
        .filter((car, index, cars) => cars.map(c => c.id).indexOf(car.id) == index)
      this.chemicalpreparations = fromVuex("chemicalpreparations")
        .filter(cp => [1, 5].includes(cp.chemicalPreparationTypeId))
      this.chemicalpreparationtypes = fromVuex("chemicalpreparationtypes")
      this.cultures = fromVuex("cultures")
      this.reproductions = fromVuex("reproductions")
      this.sorts = fromVuex("sorts")
      this.works = [35, 36]
      this.filterSortsByCulture()
      this.filterInstrumentsByCar()
    },
    addToSMCP() {
      this.item.seedMordantChemicalTreatments.splice(0, 0, {})
    },
    removeCP(index) {
      this.item.seedMordantChemicalTreatments.splice(index, 1)
    },
    getCPName(id) {
      let chemicalpreparation = this.chemicalpreparations.find(сp => сp.id === id)
      let name = chemicalpreparation && chemicalpreparation.name || "Не выбрано"
      return name
    },
    setNormative() {
      let smct = this.item.seedMordantChemicalTreatments[0]
      let cpId = smct.chemicalPreparationId
      if (cpId) {
        let chemicalpreparation = this.chemicalpreparations.find(cp => cp.id == cpId)
        let cp = deepClone(chemicalpreparation)
        this.minNorm = cp.minNorm || 0
        this.maxNorm = cp.maxNorm || Number.MAX_SAFE_INTEGER
        smct.normative = cp && cp.minNorm || 0
      }
    },
    filterSortsByCulture() {
      let sortsByCulture = this.sorts.filter(s => s.cultureId == this.item.cultureId)
      this.sortsByCulture = deepClone(sortsByCulture)
    },
    filterInstrumentsByCar() {
      let instruments = []
      this.works.forEach(workId => {
        let cars = GlobalMethods.getCarsFilteredByWorks(workId).map(car => car.id)
        cars.forEach(carId => {
          if (this.item.carId == carId) {
            let instrumentsFound = GlobalMethods.getInstrumentsFilteredByWorksAndCars(workId, carId)
            instruments = instruments.concat(instrumentsFound)
          }
        })
      })
      let instrumentsUniq = instruments
        .filter((instrument, index, instruments) => instruments.map(i => i.id).indexOf(instrument.id) == index)
      this.filteredInstruments = instrumentsUniq
    }
  }
}
