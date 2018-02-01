import AssignmentsRoutes from "./pages/assignments/routes"
import MonitoringRoutes from "./pages/monitoring/routes"
import {modules} from "modules.js"
const Catalog = () => import ("./pages/catalog")
const CatalogByType = () => import ("./components/catalog")
const CatalogFormByType = () => import ("./components/catalog/form")
const Assignments = () => import ("./pages/assignments")
const Dashboard = () => import ("./pages/dashboard/index.vue")
const Dashtest = () => import ("./pages/dashboard/test.vue")
const Culture = () => import ("./pages/dashboard/culture.vue")
const Work = () => import ("./pages/dashboard/work.vue")
const CropBalanceUsers = () => import ("./pages/CropBalanceUsers.vue")
const Map = () => import ("./pages/map/index.vue")
const ModulesTree = () => import ("modules-tree")
const Login = () => import ("./pages/login")
const Logout = () => import ("./pages/logout")
const SowList = () => import ("modules/SowList")
const Sowing = () => import ("modules/Sowing")
const Reports = () => import ("./pages/reports")
const Recipes = () => import ("./pages/recipes")
const RecipesForm = () => import ("./pages/recipes/form")
const Monitoring = () => import ("./pages/monitoring")
const News = () => import ("modules/News")
const Parttime = () => import ("./pages/parttime")
const Silageboard = () => import ("./pages/silageboard")
const Reportsbz = () => import ("./pages/reportsbz")
const Reportsplan = () => import ("./pages/reportsplan")
const FieldAgroMap = () => import ("./pages/field")
const NotepadAgroMap = () => import ("./pages/notepad")
const MapSowingAgroPlan = () => import ("./pages/mapsowing")

module.exports = [
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
    path: "/",
    redirect: "modules-tree",
  },
  {
    path: "/modules-tree",
    component: ModulesTree,
  },
  {
    path: "/agrofact",
    redirect: "/catalog"
  },
  {
    path: "/agroplan",
    redirect: "/catalog"
  },
  {
    path: "/balanszerna",
    redirect: "/catalog"
  },
  {
    path: "/agromap",
    redirect: "/notepad"
  },
  {
    path: "/catalog",
    redirect: "/catalog/fields",
    component: Catalog,
    children: [
      {
        path: ":type",
        component: CatalogByType,
      },
      {
        path: ":type/form",
        component: CatalogFormByType,
      },
      {
        path: ":type/form/:id",
        component: CatalogFormByType,
      },
    ]
  },
  {
    path: "/news",
    component: News,
    meta: {
      title: "Новости",
    },
  },
  {
    path: "/reportsplan",
    component: Reportsplan,
    meta: {
      module: modules.agroplan,
      title: "Отчеты",
    },
  },
  {
    path: "/reports",
    component: Reports,
    meta: {
      module: modules.agrofact,
      title: "Отчеты",
    },
  },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: {
      title: "Dashboard",
    },
  },
  {
    path: "/dashtest",
    component: Dashtest,
    meta: {
      title: "Dashtest",
    },
  },
  {
    path: "/dashboard/culture/:id",
    component: Culture,
    meta: {
      title: "Dashboard - Культура",
    },
  },
  {
    path: "/dashboard/work/:id",
    component: Work,
    meta: {
      title: "Dashboard - Работа",
    },
  },
  {
    path: "/cropbalanceusers",
    component: CropBalanceUsers,
    meta: {
      title: "CropBalanceUsers",
    },
  },
  {
    path: "/assignments",
    redirect: "/assignments/list",
    component: Assignments,
    meta: {
      module: modules.agrofact,
    },
    children: [...AssignmentsRoutes],
  },
  {
    path: "/map",
    component: Map,
    meta: {
      module: modules.agrofact,
      title: "Карта",
    },
  },
  {
    path: "/map/:id",
    component: Map,
    meta: {
      module: modules.agrofact,
      title: "Карта",
    },
  },
  {
    path: "/monitoring",
    redirect: "/monitoring/speedmonitoring",
    component: Monitoring,
    meta: {
      module: modules.agrofact,
    },
    children: [...MonitoringRoutes],
  },
  {
    path: "/sowings",
    component: SowList,
    meta: {
      module: modules.agroplan,
      title: "Посевы",
    },
  },
  {
    path: "/sowings/new",
    component: Sowing,
    meta: {
      module: modules.agroplan,
      title: "Посевы",
    },
  },
  {
    path: "/recipes",
    component: Recipes,
    meta: {
      module: modules.agroplan,
      title: "Работы",
    },
  },
  {
    path: "/recipes/new",
    component: RecipesForm,
    meta: {
      module: modules.agroplan,
      title: "Новая группа работ",
    },
  },
  {
    path: "/recipes/:id",
    component: RecipesForm,
    meta: {
      module: modules.agroplan,
      title: "Работы",
    },
  },
  {
    path: "/parttime",
    component: Parttime,
    meta: {
      module: modules.balanszerna,
      title: "Подработка",
    },
  },
  {
    path: "/reportsbz",
    component: Reportsbz,
    meta: {
      module: modules.balanszerna,
      title: "Отчеты",
    },
  },
  {
    path: "/silageboard",
    component: Silageboard,
    meta: {
      module: modules.balanszerna,
      title: "Силосная доска",
    },
  },
  {
    path: "/field",
    component: FieldAgroMap,
    meta: {
      module: modules.agromap,
      title: "Поле",
    },
  },
  {
    path: "/notepad",
    component: NotepadAgroMap,
    meta: {
      module: modules.agromap,
      title: "Агроблокнот",
    },
  },
  {
    path: "/mapsowing",
    component: MapSowingAgroPlan,
    meta: {
      module: modules.agroplan,
      title: "Карта посева",
    },
  },
  {
    path: "/:page",
    redirect: "/news",
  },
]
