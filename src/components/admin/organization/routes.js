const OrganizationList = () => import ("components/admin/organization/list")
const OrganizationAdd = () => import ("components/admin/organization/add")
const OrganizationsGroupList = () => import ("components/admin/organization/group-list")
const OrganizationsGroupAdd = () => import ("components/admin/organization/group-add")

module.exports = [
  {
    path: "list",
    component: OrganizationList,
    meta: {
      title: "Список компаний",
      role: "Admin",
    },
  },
  {
    path: "add",
    component: OrganizationAdd,
    meta: {
      title: "Добавить компанию",
      role: "Admin",
    },
  },
  {
    path: "add/:id",
    component: OrganizationAdd,
    meta: {
      title: "Редактировать компанию",
      role: "Admin",
    },
  },
  {
    path: "group-list",
    component: OrganizationsGroupList,
    meta: {
      title: "Группы компаний",
      role: "Admin",
    },
  },
  {
    path: "group-add",
    component: OrganizationsGroupAdd,
    meta: {
      title: "Добавить группу компаний",
      role: "Admin",
    },
  },
  {
    path: "group-add/:id",
    component: OrganizationsGroupAdd,
    meta: {
      title: "Редактировать группу компаний",
      role: "Admin",
    },
  },
]
