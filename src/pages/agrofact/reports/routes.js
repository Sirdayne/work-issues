const SeedLimitFact = () => import("./seedlimitfact")
const ChemistryLimitFact = () => import("./chemistrylimitfact")
const Weediness = () => import("./weediness")
const Uchet = () => import("./uchet")
const Ripeness = () => import("./ripeness")
const VegetationSchedule = () => import("./vegetation-schedule")
const DailyReports = () => import("./assignmentsdailyreportitems")
const TracksReport = () => import("./tracks-report")
const OperativeInformations = () => import("./group/OperativeReports/operativeinformations")
const ChemicalOperativeInformations = () => import("./group/OperativeReports/chemicaloperativeinformations")
const HaymakingOperativeInformations = () => import("./group/OperativeReports/haymakingoperativeinformations")
const FallowOperativeInformations = () => import("./group/OperativeReports/fallowoperativeinformations")
const HarvestOperativeInformations = () => import("./group/OperativeReports/harvestoperativeinformations")
const StatisticsByCarModel = () => import("./group/statisticsbycarmodel")
const AssignmentSowingStructure = () => import("./assignment-sowing-structure")
const SeedMordant = () => import("./seed-mordant")
const AccumulativeWorkExpend = () => import("./accumulative-work-expend")
const Generic = () => import("./generic")

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
    path: "ripeness",
    component: Ripeness,
    meta: {
      title: "Размещение семян по группам спелости",
    },
  },
  {
    path: "vegetation-schedule",
    component: VegetationSchedule,
    meta: {
      title: "Отчет график уборки по вегетации",
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
    path: "tracks-report",
    component: TracksReport,
    meta: {
      title: "Отчет по отрисовке треков",
    },
  },
  {
    path: "operative-informations",
    component: OperativeInformations,
    meta: {
      title: "ВПР Сводка",
    },
  },
  {
    path: "chemical-operative-informations",
    component: ChemicalOperativeInformations,
    meta: {
      title: "Химия Сводка",
    },
  },
  {
    path: "haymaking-operative-informations",
    component: HaymakingOperativeInformations,
    meta: {
      title: "Сенокос Сводка",
    },
  },
  {
    path: "fallow-operative-informations",
    component: FallowOperativeInformations,
    meta: {
      title: "Пары Сводка",
    },
  },
  {
    path: "harvest-operative-informations",
    component: HarvestOperativeInformations,
    meta: {
      title: "Уборка Сводка",
    },
  },
  {
    path: "statistics-by-car-model",
    component: StatisticsByCarModel,
    meta: {
      title: "Анализ производительности техники по группе",
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
    path: "AccumulativeWorkExpendReport",
    component: AccumulativeWorkExpend,
    meta: {
      title: "Тех. карта факт.",
    },
  },
  {
    path: ":page",
    component: Generic,
  },
]
