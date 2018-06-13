const NotepadJournal = () => import ("components/agromap/notepad/notes")
const NotepadCreate = () => import ("components/agromap/notepad/notes/create")
const NotepadCalendar = () => import ("components/agromap/notepad/notes/calendar")

const AnketaVpr = () => import ("components/agromap/notepad/anketa/add/vpr")
const AnketaSev = () => import ("components/agromap/notepad/anketa/add/sev")
const AnketaUhod = () => import ("components/agromap/notepad/anketa/add/uhod")
const AnketaUborka = () => import ("components/agromap/notepad/anketa/add/uborka")
const AnketaPar = () => import ("components/agromap/notepad/anketa/add/par")
const AnketaData = () => import ("components/agromap/notepad/anketa/anketa-data")

const CheckListChemical = () => import ("components/agromap/notepad/checklist/add/chemical")
const CheckListSowing = () => import ("components/agromap/notepad/checklist/add/sowing")
const CheckListFertilizer = () => import ("components/agromap/notepad/checklist/add/fertilizer")
const CheckListHarvest = () => import ("components/agromap/notepad/checklist/add/harvest")
const CheckListHarrowing = () => import ("components/agromap/notepad/checklist/add/harrowing")

const CheckListChemicalData = () => import ("components/agromap/notepad/checklist/chemical")
const CheckListFertilizerData = () => import ("components/agromap/notepad/checklist/fertilizer")
const CheckListHarrowingData = () => import ("components/agromap/notepad/checklist/harrowing")
const CheckListHarvestData = () => import ("components/agromap/notepad/checklist/harvest")
const CheckListSowingData = () => import ("components/agromap/notepad/checklist/sowing")

const JournalEvents = () => import ("components/agromap/notepad/journal-events")

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
]
