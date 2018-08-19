import Chart from "chart.js"
import randomcolor from "randomcolor"

export default {
  data() {
    return {
      charts: {
        "chart-cultures": null,
        "chart-sorts": null,
        "chart-ripeness": null
      },
    };
  },
  created() {
  },
  methods: {
    _drawPies(foundCulture) {
      if (foundCulture){
        this.showCharts = true
        this._dividePie(this.sorts, "cultureSortId", `${foundCulture.name} - Сорта (га)`, "chart-sorts", foundCulture)
        this._dividePie(this.ripenessgroups, "ripenessGroupId", `Группы спелости (га)`, "chart-ripeness", foundCulture)
      }
    },
    _dividePie(items, sortKey, title, htmlId, selectedCulture) {
      let sowings = selectedCulture ? this.sowings.filter(s => s.cultureId === selectedCulture.id) : this.sowings
      let pieIds = sowings.map(x => x[sortKey]).filter((elem, index, array) => array.indexOf(elem) === index)
      let pieParts = []
      pieIds.forEach(x => {
        let found = items.find(s => s.id === x)
        found = found ? found : "нет данных"
        let sum = 0
        sowings.forEach(s => {
          if (s[sortKey] === x) {
            sum += s.area
          }
        })
        let mixColor = this.getMixColor(sowings, sortKey, x)
        let color = htmlId === "chart-cultures" ? this.getColorFromLegend(x) : this.getRandomColor(mixColor)
        pieParts.push({id: x, name: found.name, area: sum, color: color})
      })
      pieParts.sort(this.sortUp)
      pieParts = htmlId === "chart-cultures" ? this.calculatePieOthers(pieParts) : pieParts
      pieParts.sort(this.sortDown)
      let pieLabels = pieParts.map(x => x.name)
      let pieAreas = pieParts.map(x => x.area)
      let pieColors = pieParts.map(x => x.color)
      this.createChart(title, pieLabels, pieAreas, pieColors, htmlId)
    },
    getMixColor(sowings, sortKey, x) {
      let sowing = sowings.find(s => s[sortKey] == x)
      return this.getColorFromLegend(sowing.cultureId)
    },
    calculatePieOthers(pieParts) {
      const OTHERS_PERCENT = 10
      let pieWholeArea = 0
      pieParts.forEach(x => pieWholeArea += x.area)
      let pieOthersArea = pieWholeArea * OTHERS_PERCENT / 100
      let sumPies = 0
      let j = 0
      while(sumPies + pieParts[j+1].area < pieOthersArea) {
        sumPies+=pieParts[j].area
        j++
      }
      pieParts.splice(0, j)
      pieParts.push({name: "Прочее", area: sumPies, color: "#fff"})
      return pieParts
    },
    createChart(title, labels, areas, colors, htmlId){
      if (this.charts[htmlId]) {
        this.charts[htmlId].destroy()
      }
      this.charts[htmlId] =  new Chart(htmlId, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [{
            label: "Площадь (га)",
            backgroundColor: colors,
            data: areas
          }]
        },
        options: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: title
          }
        }
      });
    },
    sortUp(a, b) {
      if (a.area > b.area)
        return 1
      if (a.area < b.area)
        return -1
      return 0
    },
    sortDown(a, b) {
      if (a.area < b.area)
        return 1
      if (a.area > b.area)
        return -1
      return 0
    },
    getRandomColor(color) {
      return randomcolor({hue: color})
    },
  }
}
