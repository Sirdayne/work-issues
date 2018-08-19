const Assignments = () => import("./assignments")
import AssignmentsRoutes from "./assignments/routes"
const Map = () => import("./map")
const Monitoring = () => import("./monitoring")
import MonitoringRoutes from "./monitoring/routes"
const Reports = () => import("./reports")
import ReportsRoutes from "./reports/routes"
const News = () => import("modules/News")

module.exports = [
  {
    path: "assignments",
    redirect: "assignments/list",
    component: Assignments,
    children: [...AssignmentsRoutes],
  },
  {
    path: "map",
    component: Map,
    meta: {
      title: "Карта",
    },
  },
  {
    path: "monitoring",
    redirect: "monitoring/speedmonitoring",
    component: Monitoring,
    children: [...MonitoringRoutes],
  },
  {
    path: "reports",
    redirect: "reports/operative-informations",
    component: Reports,
    meta: {
      title: "Отчеты",
    },
    children: [...ReportsRoutes],
  },
  {
    path: "news",
    component: News,
    meta: {
      title: "Новости",
    },
  },
]
