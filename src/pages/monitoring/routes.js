import {modules} from "modules.js"
const SpeedMonitoring = () => import ("components/monitoring/speedmonitoring")
const Downtime = () => import ("components/monitoring/downtime")
const CarStatus = () => import ("components/monitoring/carstatus")
const WorkPlan = () => import ("components/monitoring/workplan")
const Overdrive = () => import ("components/monitoring/overdrive")

module.exports = [
  {
    path: "speedmonitoring",
    component: SpeedMonitoring,
    meta: {
      module: modules.agrofact,
      title: "Скоростной режим",
    },
  },
  {
    path: "downtime",
    component: Downtime,
    meta: {
      module: modules.agrofact,
      title: "Простои",
    },
  },
  {
    path: "carstatus",
    component: CarStatus,
    meta: {
      module: modules.agrofact,
      title: "Статус техники",
    },
  },
  {
    path: "workplan",
    component: WorkPlan,
    meta: {
      module: modules.agrofact,
      title: "Календарь работ",
    },
  },
  {
    path: "overdrive",
    component: Overdrive,
    meta: {
      module: modules.agrofact,
      title: "Перегоны",
    },
  },
]
