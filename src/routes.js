const ModulesTree = () => import("modules-tree")
const Login = () => import("pages/login")
const Logout = () => import("pages/logout")
const Admin = () => import("pages/admin")
import AdminRoutes from "pages/admin/routes"
const Agromap = () => import("pages/agromap")
import AgromapRoutes from "pages/agromap/routes"
const Agrofact = () => import("pages/agrofact")
import AgrofactRoutes from "pages/agrofact/routes"
const Agroplan = () => import("pages/agroplan")
import AgroplanRoutes from "pages/agroplan/routes"
const Balanszerna = () => import("pages/balanszerna")
import BalanszernaRoutes from "pages/balanszerna/routes"
import CatalogRoutes from "pages/catalog/routes"

const CropBalanceUsers = () => import("pages/CropBalanceUsers.vue")

module.exports = [
  {
    path: "/",
    redirect: "modules-tree"
  },
  {
    path: "/modules-tree",
    component: ModulesTree,
  },
  {
    path: "/login",
    component: Login,
    meta: {
      auth: false,
      login: true,
      title: "Вход"
    },
  },
  {
    path: "/logout",
    component: Logout,
    meta: {
      title: "Выход"
    },
  },
  {
    path: "/admin",
    redirect: "/admin/organization",
    component: Admin,
    meta: {
      title: "Админ",
      roles: ["Admin"],
    },
    children: [...AdminRoutes],
  },
  {
    path: "/agrofact",
    redirect: "/agrofact/catalog",
    component: Agrofact,
    meta: {
      title: "Агрофакт",
    },
    children: [...AgrofactRoutes, ...CatalogRoutes],
  },
  {
    path: "/agromap",
    redirect: "/agromap/field",
    component: Agromap,
    meta: {
      title: "Agromap",
    },
    children: [...AgromapRoutes],
  },
  {
    path: "/agroplan",
    redirect: "/agroplan/catalog",
    component: Agroplan,
    meta: {
      title: "Агроплан",
    },
    children: [...AgroplanRoutes, ...CatalogRoutes],
  },
  {
    path: "/balanszerna",
    redirect: "/balanszerna/catalog",
    component: Balanszerna,
    meta: {
      title: "Баланс зерна",
    },
    children: [...BalanszernaRoutes, ...CatalogRoutes],
  },
  {
    path: "/agrostream/cropbalanceusers",
    component: CropBalanceUsers,
    meta: {
      title: "CropBalanceUsers",
    },
  },
  {
    path: "/:page",
    redirect: "/modules-tree",
  },
]
