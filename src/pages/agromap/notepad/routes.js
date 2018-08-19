const NotepadJournal = () => import("./notes")
const NotepadCreate = () => import("./notes/create")
const NotepadCalendar = () => import("./notes/calendar")

const AnketaVpr = () => import("./anketa/add/vpr")
const AnketaSev = () => import("./anketa/add/sev")
const AnketaUhod = () => import("./anketa/add/uhod")
const AnketaUborka = () => import("./anketa/add/uborka")
const AnketaPar = () => import("./anketa/add/par")
const AnketaData = () => import("./anketa/anketa-data")

const CheckListChemical = () => import("./checklist/add/chemical")
const CheckListSowing = () => import("./checklist/add/sowing")
const CheckListFertilizer = () => import("./checklist/add/fertilizer")
const CheckListHarvest = () => import("./checklist/add/harvest")
const CheckListHarrowing = () => import("./checklist/add/harrowing")

const CheckListChemicalData = () => import("./checklist/chemical")
const CheckListFertilizerData = () => import("./checklist/fertilizer")
const CheckListHarrowingData = () => import("./checklist/harrowing")
const CheckListHarvestData = () => import("./checklist/harvest")
const CheckListSowingData = () => import("./checklist/sowing")

const JournalEvents = () => import("./journal-events")

module.exports = [
  {
    path: "journal",
    component: NotepadJournal,
    meta: {
      title: "Журнал заметок",
    },
  },
  {
    path: "create",
    component: NotepadCreate,
    meta: {
      title: "Создать заметку",
    },
  },
  {
    path: "calendar",
    component: NotepadCalendar,
    meta: {
      title: "Календарь задач",
    },
  },
  {
    path: "journal-events",
    component: JournalEvents,
    meta: {
      title: "Журнал событий",
    },
  },
  {
    path: "anketa-vpr",
    component: AnketaVpr,
    meta: {
      title: "Анкета ВПР",
    },
  },
  {
    path: "anketa-sev",
    component: AnketaSev,
    meta: {
      title: "Анкета Сев",
    },
  },
  {
    path: "anketa-uhod",
    component: AnketaUhod,
    meta: {
      title: "Анкета Уход",
    },
  },
  {
    path: "anketa-uborka",
    component: AnketaUborka,
    meta: {
      title: "Анкета Уборка",
    },
  },
  {
    path: "anketa-par",
    component: AnketaPar,
    meta: {
      title: "Анкета Пар",
    },
  },
  {
    path: "anketa-data",
    component: AnketaData,
    meta: {
      title: "Анкетные данные",
    },
  },
  {
    path: "checklist-chemical",
    component: CheckListChemical,
    meta: {
      title: "Чек-лист Химия",
    },
  },
  {
    path: "checklist-sowing",
    component: CheckListSowing,
    meta: {
      title: "Чек-лист Посев",
    },
  },
  {
    path: "checklist-fertilizer",
    component: CheckListFertilizer,
    meta: {
      title: "Чек-лист Удобрения",
    },
  },
  {
    path: "checklist-harvest",
    component: CheckListHarvest,
    meta: {
      title: "Чек-лист Уборка",
    },
  },
  {
    path: "checklist-harrowing",
    component: CheckListHarrowing,
    meta: {
      title: "Чек-лист Боронование",
    },
  },
  {
    path: "checklist-chemical-data",
    component: CheckListChemicalData,
    meta: {
      title: "Данные чек-листов Химия",
    },
  },
  {
    path: "checklist-fertilizer-data",
    component: CheckListFertilizerData,
    meta: {
      title: "Данные чек-листов Удобрения",
    },
  },
  {
    path: "checklist-harrowing-data",
    component: CheckListHarrowingData,
    meta: {
      title: "Данные чек-листов Боронование",
    },
  },
  {
    path: "checklist-harvest-data",
    component: CheckListHarvestData,
    meta: {
      title: "Данные чек-листов Уборка",
    },
  },
  {
    path: "checklist-sowing-data",
    component: CheckListSowingData,
    meta: {
      title: "Данные чек-листов Посев",
    },
  },
  {
    path: ":page",
    redirect: "journal",
  },
]
