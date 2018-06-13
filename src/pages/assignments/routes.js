const Assignments = () => import ("components/assignments/list")
const Transportation = () => import ("components/assignments/transportation")
const SeedLimit = () => import ("components/assignments/seedlimits/new")
const ChemistryLimit = () => import ("components/assignments/chemistrylimits")
const FertilizerLimit = () => import ("components/assignments/fertilizerlimits")
const ProtravkaSemyan = () => import ("components/assignments/protravka-semyan/index")

module.exports = [
  {
    path: "list",
    component: Assignments,
    meta: {
      title: "Добавить задание",
    },
  },
  {
    path: "transportation",
    component: Transportation,
    meta: {
      title: "Добавить транспортировку",
    },
  },
  {
    path: "seed",
    component: SeedLimit,
    meta: {
      title: "Расчет семян",
    },
  },
  {
    path: "chemistry",
    component: ChemistryLimit,
    meta: {
      title: "Расчет СЗР",
    },
  },
  {
    path: "fertilizer",
    component: FertilizerLimit,
    meta: {
      title: "Расчет удобрений",
    },
  },
  {
    path: "protravka-semyan",
    component: ProtravkaSemyan,
    meta: {
      title: "Протравка семян",
    },
  },
]
