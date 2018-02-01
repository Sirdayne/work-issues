import {modules} from "modules.js"
const NewAssignment = () => import ("components/assignments/new/index")
const ListAssignment = () => import ("components/assignments/list")
const Transportation = () => import ("components/assignments/transportation")
const SeedLimit = () => import ("components/seedlimits/new")
const ChemistryLimit = () => import ("components/chemistrylimits/new")
const FertilizerLimit = () => import ("components/fertilizerlimits/new")

module.exports = [
  {
    path: "list",
    component: ListAssignment,
    meta: {
      module: modules.agrofact,
      title: "Список заданий",
    },
  },
  {
    path: "new",
    component: NewAssignment,
    meta: {
      module: modules.agrofact,
      title: "Добавить задание",
    },
  },
  {
    path: "transportation",
    component: Transportation,
    meta: {
      module: modules.agrofact,
      title: "Добавить транспортировку",
    },
  },
  {
    path: "seed",
    component: SeedLimit,
    meta: {
      module: modules.agrofact,
      title: "Расчет семян",
    },
  },
  {
    path: "chemistry",
    component: ChemistryLimit,
    meta: {
      module: modules.agrofact,
      title: "Расчет химии",
    },
  },
  {
    path: "fertilizer",
    component: FertilizerLimit,
    meta: {
      module: modules.agrofact,
      title: "Расчет удобрений",
    },
  },
]
