const SpeedMonitoring = () => import ("components/monitoring/speedmonitoring")
const Downtime = () => import ("components/monitoring/downtime")
const CarStatus = () => import ("components/monitoring/carstatus")
const WorkPlan = () => import ("components/monitoring/workplan")
const Overdrive = () => import ("components/monitoring/overdrive")
const NoAssignments = () => import ("components/monitoring/noassignments")
const ViolationRotation = () => import ("components/monitoring/violationrotation")

module.exports = [
  {
    path: "speedmonitoring",
    component: SpeedMonitoring,
    meta: {
      title: "Скоростной режим",
    },
  },
  {
    path: "downtime",
    component: Downtime,
    meta: {
      title: "Простои",
    },
  },
  {
    path: "carstatus",
    component: CarStatus,
    meta: {
      title: "Статус техники",
    },
  },
  {
    path: "workplan",
    component: WorkPlan,
    meta: {
      title: "Календарь работ",
    },
  },
  {
    path: "overdrive",
    component: Overdrive,
    meta: {
      title: "Перегоны",
    },
  },
  {
    path: "noassignments",
    component: NoAssignments,
    meta: {
      title: "Нет заданий",
    },
  },
  {
    path: "violationrotation",
    component: ViolationRotation,
    meta: {
      title: "Нарушение ротации",
    },
  },
]
