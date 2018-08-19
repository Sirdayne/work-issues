<template lang="pug">
.cloud(:class="{ 'horizontal': orientation }", v-loading="loading")
  .cloud-column
    .cloud-row Номер поля:
      span {{ passport.name }}
    .cloud-row Кадастровый номер:
      span {{ passport.kadastr }}
    .cloud-row Площадь поля (kml):
      span {{ passport.area }} ({{ passport.polygonArea }})
    .cloud-row Посевная площадь
      span {{ passport.seedlimitArea }}
    .cloud-row Площадь лиманов и неудобий:
      span {{ passport.limansArea }}
    .cloud-row Культура:
      span {{ passport.culture }}
  .cloud-column
    .cloud-row Сорт:
      span {{ passport.sorts }}
    .cloud-row Репродукция:
      span {{ passport.reproductions }}
    .cloud-row Балл бонитет:
      span {{ passport.bonitetScore }}
    .cloud-row Предшественник:
      span {{ passport.prevCulture }}
    .cloud-row Дата посева:
      span {{ passport.sowingRange }}
    .cloud-row Дата уборки:
      span {{ passport.harvestingRange }}
  .cloud-column
    .cloud-row Зона:
      span {{ passport.zone }}
    .cloud-row Рельеф местности:
      span {{ passport.terrain }}
    .cloud-row Гранулометрический состав:
      span {{ passport.composition }}
    .cloud-row Тип почвы:
      span {{ passport.soilType }}
    .cloud-row Контур поля:
      span {{ passport.fieldContour }}
    .cloud-row Бригада:
      span {{ passport.brigade }}
</template>

<script>
import http from "services/http"

export default {
  props: {
    "fieldId": {
      type: Number,
      default: null,
    },
    "orientation": {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      passport: {},
      loading: false,
    }
  },
  created() {
    this.getPassport(this.fieldId)
  },
  watch: {
    "fieldId" (val) {
      this.getPassport(val)
    }
  },
  methods: {
    getPassport(fieldId) {
      this.loading = true
      this.passport = {}
      http.getWithoutCache(`Fields/GetCard?id=${fieldId}&year=${this.$root.context.year}`)
        .then(data => {
          this.passport = data
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
    }
  },
}
</script>
