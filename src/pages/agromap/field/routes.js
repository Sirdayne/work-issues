const FieldPassport = () => import("./fieldpassport")
const FieldGallery = () => import("./gallery")
const FieldSevoborot  = () => import("./sevoborot")
const FieldPlanWorks  = () => import("./planworks")
const FieldHistoryWorks  = () => import("./planworks")

module.exports = [
  {
    path: "passport",
    component: FieldPassport,
    meta: {
      title: "Паспорт поля",
    },
  },
  {
    path: "gallery",
    component: FieldGallery,
    meta: {
      title: "Галерея",
    },
  },
  {
    path: "sevoborot",
    component: FieldSevoborot,
    meta: {
      title: "Севоборот",
    },
  },
  {
    path: "plan-works",
    component: FieldPlanWorks,
    meta: {
      title: "План работ",
    },
  },
  {
    path: "history-works",
    component: FieldHistoryWorks,
    meta: {
      title: "История работ",
    },
  },
  {
    path: ":page",
    redirect: "passport",
  },
]
