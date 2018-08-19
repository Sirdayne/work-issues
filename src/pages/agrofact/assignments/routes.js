const Assignments = () => import("./list")
const Transportation = () => import("./transportation")
const SeedLimit = () => import("./seedlimits")
const ChemistryLimit = () => import("./chemistrylimits")
const FertilizerLimit = () => import("./fertilizerlimits")
const ProtravkaSemyan = () => import("./protravka-semyan")

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
  {
    path: ":page",
    redirect: "list",
  },
]
