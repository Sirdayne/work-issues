const Catalog = () => import("pages/catalog")
const CatalogByType = () => import("./components")
const CatalogFormByType = () => import("./components/form")

module.exports = [
  {
    path: "catalog",
    redirect: "catalog/fields",
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
    path: ":page",
    redirect: "catalog",
  },
]
