<template lang="pug">
  .fx-table
    el-table(
    :data="[soilResearches]",
    border,
    resizable,
    )
      el-table-column(label="Кислотность", prop="sourness", header-align="center")
      el-table-column(label="Азот", prop="nitrogen", header-align="center")
      el-table-column(label="Фосфор", prop="phosphorus", header-align="center")
      el-table-column(label="Калий", prop="potassium", header-align="center")
      el-table-column(label="Гумус", prop="organic", header-align="center")
      el-table-column(label="Сера", prop="sulfur", header-align="center")

</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import moment from 'moment';
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
      let endpoint = `SoilResearches/${this.$root.context.organization}/${fieldId}`;
      nprogress.start()
      http.get(endpoint)
        .then(data => {
          if (data) {
            this.soilResearches = data
          }
          nprogress.done()
        })
        .catch((error) => {
          nprogress.done()
          this.$message({
            message: `Ошибка ${error}`,
            type: "info",
            duration: 5000,
            showClose: false,
          });
        })
    },
  },
}
</script>
