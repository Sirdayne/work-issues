const AssignmentsJobs = () => import("./assignments")

module.exports = [
  {
    path: "assignments/:assignmentType([12])",
    component: AssignmentsJobs,
    meta: {
      title: "Задания",
    },
  },
  {
    path: "assignments(.*)",
    redirect: "assignments/2",
  },
  {
    path: ":page",
    redirect: "assignments/2",
  },
]
