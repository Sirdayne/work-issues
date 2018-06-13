const UserList = () => import ("components/admin/user/list")
const UserAdd = () => import ("components/admin/user/add")

module.exports = [
  {
    path: "list",
    component: UserList,
    meta: {
      title: "Список пользователей",
      role: "Admin",
    },
  },
  {
    path: "add",
    component: UserAdd,
    meta: {
      title: "Добавить пользователя",
      role: "Admin",
    },
  },
]
