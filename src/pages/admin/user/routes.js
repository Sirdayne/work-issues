const UserList = () => import("./list")
const UserAdd = () => import("./add")

module.exports = [
  {
    path: "list",
    component: UserList,
    meta: {
      title: "Список пользователей",
    },
  },
  {
    path: "add",
    component: UserAdd,
    meta: {
      title: "Добавить пользователя",
    },
  },
  {
    path: ":page",
    redirect: "list",
  },
]
