const Field = () => import("./field")
import FieldRoutes from "./field/routes"
const Notepad = () => import("./notepad")
import NotepadRoutes from "./notepad/routes"

module.exports = [
  {
    path: "field",
    redirect: "field/passport",
    component: Field,
    meta: {
      title: "Поле",
    },
    children: [...FieldRoutes],
  },
  {
    path: "notepad",
    redirect: "notepad/journal",
    component: Notepad,
    meta: {
      title: "Блокнот",
    },
    children: [...NotepadRoutes],
  },
  {
    path: ":page",
    redirect: "field",
  },
]
