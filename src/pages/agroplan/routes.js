const Sowing = () => import("modules/Sowing")
const SowList = () => import("./sowings")
const Recipes = () => import("./recipes")
const RecipesForm = () => import("./recipes/form")
const MapSowing = () => import("./mapsowing")
const Reports = () => import("./reports")
import ReportsRoutes from "./reports/routes"
const News = () => import("modules/News")

module.exports = [
  {
    path: "sowings",
    component: SowList,
    meta: {
      title: "Посевы",
    },
  },
  {
    path: "sowings/new",
    component: Sowing,
    meta: {
      title: "Посевы",
    },
  },
  {
    path: "recipes",
    component: Recipes,
    meta: {
      title: "Работы",
    },
  },
  {
    path: "recipes/new",
    component: RecipesForm,
    meta: {
      title: "Новая группа работ",
    },
  },
  {
    path: "recipes/:id",
    component: RecipesForm,
    meta: {
      title: "Работы",
    },
  },
  {
    path: "mapsowing",
    component: MapSowing,
    meta: {
      title: "Карта посева",
    },
  },
  {
    path: "reports",
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
