const InventoryAnalysisCards = () => import("./inventory-analysis-cards")
const GrainProcessings = () => import("./grain-processings")

module.exports = [
  {
    path: "inventory-analysis-cards",
    component: InventoryAnalysisCards,
    meta: {
      title: "Журнал регистрации лабораторных анализов",
    },
  },
  {
    path: "grain-processings",
    component: GrainProcessings,
    meta: {
      title: "Журнал подработки зерна",
    },
  },
  {
    path: ":page",
    redirect: "inventory-analysis-cards",
  },
]
