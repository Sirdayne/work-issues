const Parttime = () => import("./parttime")
import ParttimeRoutes from "./parttime/routes"
const Silageboard = () => import("./silageboard")
const Reports = () => import("./reports")
import ReportsRoutes from "./reports/routes"

module.exports = [
  {
    path: "parttime",
    redirect: "parttime/inventory-analysis-cards",
    component: Parttime,
    meta: {
      title: "Подработка",
    },
    children: [...ParttimeRoutes],
  },
  {
    path: "silageboard",
    component: Silageboard,
    meta: {
      title: "Силосная доска",
    },
  },
  {
    path: "reports",
    redirect: "reports/accounting-incoming-transfers",
    component: Reports,
    meta: {
      title: "Отчеты",
    },
    children: [...ReportsRoutes],
  },
]
