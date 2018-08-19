const IncomingTransfers = () => import("./incomingtransfers")
const InternalTransfers = () => import("./internaltransfers")
const OutgoingTransfers = () => import("./outgoingtransfers")
const GrainRegistry = () => import("./grainregistry")
const InventoryReport = () => import("./inventory-report")
const GrainOutsideOfWarehouse = () => import("./grainoutsideofwarehouse")
const OrderForShipment = () => import("./order-for-shipment")

module.exports = [
  {
    path: "accounting-incoming-transfers",
    component: IncomingTransfers,
    meta: {
      title: "Журнал весовщика - прием",
    },
  },
  {
    path: "accounting-internal-transfers",
    component: InternalTransfers,
    meta: {
      title: "Журнал весовщика - перемещение",
    },
  },
  {
    path: "accounting-outgoing-transfers",
    component: OutgoingTransfers,
    meta: {
      title: "Журнал весовщика - отгрузка",
    },
  },
  {
    path: "accounting-grain-registry",
    component: GrainRegistry,
    meta: {
      title: "Реестр приема зерна",
    },
  },
  {
    path: "inventory-report",
    component: InventoryReport,
    meta: {
      title: "Отчет движения партии",
    },
  },
  {
    path: "grainoutsideofwarehouse",
    component: GrainOutsideOfWarehouse,
    meta: {
      title: "Продукция вне тока",
    },
  },
  {
    path: "order-for-shipment",
    component: OrderForShipment,
    meta: {
      title: "Приказ на отгрузку",
    },
  },
  {
    path: ":page",
    redirect: "accounting-incoming-transfers",
  },
]
