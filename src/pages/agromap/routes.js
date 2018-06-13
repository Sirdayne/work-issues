import FieldRoutes from "components/agromap/field/routes"
import NotepadRoutes from "components/agromap/notepad/routes"
const Field = () => import ("components/agromap/field")
const Notepad = () => import ("components/agromap/notepad")

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
]
