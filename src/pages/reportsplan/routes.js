const TechKarta = () => import ("components/reports-agroplan/tech-karta")
const Generic = () => import ("components/reports-agroplan/generic")

module.exports = [
  {
    path: "TechCards",
    component: TechKarta,
    meta: {
      title: "Техкарта",
    },
  },
  {
    path: ":page",
    component: Generic,
  },
]
