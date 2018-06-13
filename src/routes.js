import AssignmentsRoutes from "./pages/assignments/routes"
import AdminRoutes from "./pages/admin/routes"
import AgromapRoutes from "./pages/agromap/routes"
import MonitoringRoutes from "./pages/monitoring/routes"
import ReportsRoutes from "./pages/reports/routes"
import ReportsPlanRoutes from "./pages/reportsplan/routes"
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
const MapNew = () => import ("./pages/mapnew/index.vue")
const ModulesTree = () => import ("modules-tree")
const Login = () => import ("./pages/login")
const Logout = () => import ("./pages/logout")
const SowListOld = () => import ("modules/SowList")
const SowList = () => import ("./pages/sowings")
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
const MapSowingAgroPlan = () => import ("./pages/mapsowing")
const Admin = () => import ("./pages/admin")
const Agromap = () => import ("./pages/agromap")

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
    redirect: "/agrofact/catalog"
  },
  {
    path: "/agroplan",
    redirect: "/agroplan/catalog"
  },
  {
    path: "/balanszerna",
    redirect: "/balanszerna/catalog"
  },
  {
    path: "/agrofact/catalog",
    redirect: "/agrofact/catalog/fields",
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
    path: "/agroplan/catalog",
    redirect: "/agroplan/catalog/fields",
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
    path: "/balanszerna/catalog",
    redirect: "/balanszerna/catalog/fields",
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
    path: "/agrofact/news",
    component: News,
    meta: {
      title: "Новости",
    },
  },
  {
    path: "/agroplan/news",
    component: News,
    meta: {
      title: "Новости",
    },
  },
  {
    path: "/agroplan/reports",
    component: Reportsplan,
    meta: {
      title: "Отчеты",
    },
    children: [...ReportsPlanRoutes],
  },
  {
    path: "/agrofact/reports",
    redirect: "/agrofact/reports/operative-informations",
    component: Reports,
    meta: {
      title: "Отчеты",
    },
    children: [...ReportsRoutes],
  },
  {
    path: "/agrostream/dashboard",
    component: Dashboard,
    meta: {
      title: "Dashboard",
    },
  },
  {
    path: "/agrostream/dashtest",
    component: Dashtest,
    meta: {
      title: "Dashtest",
    },
  },
  {
    path: "/agrostream/dashboard/culture/:id",
    component: Culture,
    meta: {
      title: "Dashboard - Культура",
    },
  },
  {
    path: "/agrostream/dashboard/work/:id",
    component: Work,
    meta: {
      title: "Dashboard - Работа",
    },
  },
  {
    path: "/agrostream/cropbalanceusers",
    component: CropBalanceUsers,
    meta: {
      title: "CropBalanceUsers",
    },
  },
  {
    path: "/agrofact/assignments",
    redirect: "/agrofact/assignments/list",
    component: Assignments,
    children: [...AssignmentsRoutes],
  },
  {
    path: "/agrofact/map",
    component: Map,
    meta: {
      title: "Карта",
    },
  },
  {
    path: "/agrofact/map/:id",
    component: Map,
    meta: {
      title: "Карта",
    },
  },
  {
    path: "/agrofact/mapnew",
    component: MapNew,
    meta: {
      title: "Карта",
    },
  },
  {
    path: "/agrofact/monitoring",
    redirect: "/agrofact/monitoring/speedmonitoring",
    component: Monitoring,
    children: [...MonitoringRoutes],
  },
  {
    path: "/agroplan/sowingsold",
    component: SowListOld,
    meta: {
      title: "Посевы",
    },
  },
  {
    path: "/agroplan/sowings",
    component: SowList,
    meta: {
      title: "Посевы",
    },
  },
  {
    path: "/agroplan/sowings/new",
    component: Sowing,
    meta: {
      title: "Посевы",
    },
  },
  {
    path: "/agroplan/recipes",
    component: Recipes,
    meta: {
      title: "Работы",
    },
  },
  {
    path: "/agroplan/recipes/new",
    component: RecipesForm,
    meta: {
      title: "Новая группа работ",
    },
  },
  {
    path: "/agroplan/recipes/:id",
    component: RecipesForm,
    meta: {
      title: "Работы",
    },
  },
  {
    path: "/balanszerna/parttime",
    component: Parttime,
    meta: {
      title: "Подработка",
    },
  },
  {
    path: "/balanszerna/reports",
    component: Reportsbz,
    meta: {
      title: "Отчеты",
    },
  },
  {
    path: "/balanszerna/silageboard",
    component: Silageboard,
    meta: {
      title: "Силосная доска",
    },
  },
  {
    path: "/agroplan/mapsowing",
    component: MapSowingAgroPlan,
    meta: {
      title: "Карта посева",
    },
  },
  {
    path: "/admin",
    redirect: "/admin/organization",
    component: Admin,
    meta: {
      title: "Админ",
      role: "Admin",
    },
    children: [...AdminRoutes],
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
    path: "/:page",
    redirect: "/modules-tree",
  },
]
