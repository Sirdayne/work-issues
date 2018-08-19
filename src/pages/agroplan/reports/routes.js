const TechKarta = () => import("./tech-karta")
const Generic = () => import("./generic")

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
