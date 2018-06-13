const AssignmentsJobs = () => import ("components/admin/jobs/assignments")

module.exports = [
  {
    path: "assignments/:assignmentType([12])",
    component: AssignmentsJobs,
    meta: {
      title: "Задания",
      role: "Admin",
    },
  },
  {
    path: "assignments(.*)",
    redirect: "assignments/2",
  },
]
