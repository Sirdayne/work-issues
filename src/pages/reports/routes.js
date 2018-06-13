const SeedLimitFact = () => import ("components/reports-agrofact/seedlimitfact")
const ChemistryLimitFact = () => import ("components/reports-agrofact/chemistrylimitfact")
const Weediness = () => import ("components/reports-agrofact/weediness")
const Uchet = () => import ("components/reports-agrofact/uchet")
const DailyReports = () => import ("components/reports-agrofact/assignmentsdailyreportitems")
const OperativeInformations = () => import ("components/reports-agrofact/operativeinformations")
const ChemicalOperativeInformations = () => import ("components/reports-agrofact/chemicaloperativeinformations")
const AssignmentSowingStructure = () => import ("components/reports-agrofact/assignment-sowing-structure")
const SeedMordant = () => import ("components/reports-agrofact/seed-mordant")
const Generic = () => import ("components/reports-agrofact/generic")

module.exports = [
  {
    path: "accounting-seed",
    component: SeedLimitFact,
    meta: {
      title: "Списание семян",
    },
  },
  {
    path: "accounting-chemistry",
    component: ChemistryLimitFact,
    meta: {
      title: "Списание химии",
    },
  },
  {
    path: "accounting-weediness",
    component: Weediness,
    meta: {
      title: "Засоренность",
    },
  },
  {
    path: "uchet",
    component: Uchet,
    meta: {
      title: "Учетный лист",
    },
  },
  {
    path: "daily-reports",
    component: DailyReports,
    meta: {
      title: "Ежедневный отчет по полевым работам",
    },
  },
  {
    path: "operative-informations",
    component: OperativeInformations,
    meta: {
      title: "Сводка ВПР",
    },
  },
  {
    path: "chemical-operative-informations",
    component: ChemicalOperativeInformations,
    meta: {
      title: "Информация о ходе проведения агрохимических работ",
    },
  },
  {
    path: "AssignmentSowingStructureReport",
    component: AssignmentSowingStructure,
    meta: {
      title: "Выполнение работ по полям",
    },
  },
  {
    path: "SeedMordantReport",
    component: SeedMordant,
    meta: {
      title: "Отчет по обработке семян",
    },
  },
  {
    path: ":page",
    component: Generic,
  },
]
