const SpeedMonitoring = () => import("./speedmonitoring")
const Downtime = () => import("./downtime")
const CarStatus = () => import("./carstatus")
const WorkPlan = () => import("./workplan")
const Overdrive = () => import("./overdrive")
const NoAssignments = () => import("./noassignments")
const ViolationRotation = () => import("./violationrotation")
const RashozhdeniyaPoVyrabotke = () => import("./rashozhdeniya-po-vyrabotke")

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
  {
    path: "rashozhdeniya-po-vyrabotke",
    component: RashozhdeniyaPoVyrabotke,
    meta: {
      title: "Расхождения по выработке",
    },
  },
  {
    path: ":page",
    redirect: "speedmonitoring",
  },
]
