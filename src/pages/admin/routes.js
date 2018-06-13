import OrganizationRoutes from "components/admin/organization/routes"
import UserRoutes from "components/admin/user/routes"
import JobsRoutes from "components/admin/jobs/routes"
const Organization = () => import ("components/admin/organization")
const User = () => import ("components/admin/user")
const Jobs = () => import ("components/admin/jobs")
const Map = () => import ("components/admin/map")

module.exports = [
  {
    path: "organization",
    redirect: "organization/list",
    component: Organization,
    meta: {
      title: "Организация",
      role: "Admin",
    },
    children: [...OrganizationRoutes],
  },
  {
    path: "user",
    redirect: "user/list",
    component: User,
    meta: {
      title: "Пользователь",
      role: "Admin",
    },
    children: [...UserRoutes],
  },
  {
    path: "jobs",
    redirect: "jobs/assignments",
    component: Jobs,
    meta: {
      title: "Работа GPS",
      role: "Admin",
    },
    children: [...JobsRoutes],
  },
  {
    path: "map",
    component: Map,
    meta: {
      title: "Карта",
      role: "Admin",
    },
  },
]
