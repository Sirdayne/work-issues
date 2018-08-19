const OrganizationList = () => import("./list")
const OrganizationAdd = () => import("./add")
const OrganizationsGroupList = () => import("./group-list")
const OrganizationsGroupAdd = () => import("./group-add")

module.exports = [
  {
    path: "list",
    component: OrganizationList,
    meta: {
      title: "Список компаний",
    },
  },
  {
    path: "add",
    component: OrganizationAdd,
    meta: {
      title: "Добавить компанию",
    },
  },
  {
    path: "add/:id",
    component: OrganizationAdd,
    meta: {
      title: "Редактировать компанию",
    },
  },
  {
    path: "group-list",
    component: OrganizationsGroupList,
    meta: {
      title: "Группы компаний",
    },
  },
  {
    path: "group-add",
    component: OrganizationsGroupAdd,
    meta: {
      title: "Добавить группу компаний",
    },
  },
  {
    path: "group-add/:id",
    component: OrganizationsGroupAdd,
    meta: {
      title: "Редактировать группу компаний",
    },
  },
  {
    path: ":page",
    redirect: "list",
  },
]
