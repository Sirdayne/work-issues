<template lang="pug">
.fx-table(v-loading="loading", element-loading-text="Загрузка...")
  .fx-row.fx-grey
    .fx-cell Кислотность
    .fx-cell Азот
    .fx-cell Фосфор
    .fx-cell Калий
    .fx-cell Гумус
    .fx-cell Сера
  .fx-row
    .fx-cell(v-if="soilResearches.sourness") {{ soilResearches.sourness }}
    .fx-cell(v-else) нет данных
    .fx-cell(v-if="soilResearches.nitrogen") {{ soilResearches.nitrogen }}
    .fx-cell(v-else) нет данных
    .fx-cell(v-if="soilResearches.phosphorus") {{ soilResearches.phosphorus }}
    .fx-cell(v-else) нет данных
    .fx-cell(v-if="soilResearches.potassium") {{ soilResearches.potassium }}
    .fx-cell(v-else) нет данных
    .fx-cell(v-if="soilResearches.organic") {{ soilResearches.organic }}
    .fx-cell(v-else) нет данных
    .fx-cell(v-if="soilResearches.sulfur") {{ soilResearches.sulfur }}
    .fx-cell(v-else) нет данных
</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import ListController from 'mixins/ListController'
import {EventBus} from 'services/EventBus';
import nprogress from 'lib/NProgress';

export default {
  name: "soilresearches",
  props: [
    "id",
  ],
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      soilResearches: {},
      loading: true,
    }
  },
  watch: {
    'id' (val, oldVal) {
      this.soilResearches = {}
      this.init(val)
    },
  },
  created() {
    this.init(this.id)
  },
  methods: {
    init(fieldId){
      http.getWithoutCache(`SoilResearches/${this.$root.context.organization}/${fieldId}`)
        .then(data => {
          this.loading = false
          if (data) {
            this.soilResearches = data
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
  },
}
</script>
