const Organization = () => import("./organization")
import OrganizationRoutes from "./organization/routes"
const User = () => import("./user")
import UserRoutes from "./user/routes"
const Jobs = () => import("./jobs")
import JobsRoutes from "./jobs/routes"
const Map = () => import("./map")

module.exports = [
  {
    path: "organization",
    redirect: "organization/list",
    component: Organization,
    meta: {
      title: "Организация",
    },
    children: [...OrganizationRoutes],
  },
  {
    path: "user",
    redirect: "user/list",
    component: User,
    meta: {
      title: "Пользователь",
    },
    children: [...UserRoutes],
  },
  {
    path: "jobs",
    redirect: "jobs/assignments",
    component: Jobs,
    meta: {
      title: "Работа GPS",
    },
    children: [...JobsRoutes],
  },
  {
    path: "map",
    component: Map,
    meta: {
      title: "Карта",
    },
  },
  {
    path: ":page",
    redirect: "organization",
  },
]
