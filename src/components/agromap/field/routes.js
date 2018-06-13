const FieldPassport = () => import ("components/agromap/field/fieldpassport")
const FieldGallery = () => import ("components/agromap/field/gallery")
const FieldSevoborot  = () => import ("components/agromap/field/sevoborot")
const FieldPlanWorks  = () => import ("components/agromap/field/planworks")
const FieldHistoryWorks  = () => import ("components/agromap/field/planworks")

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
]
