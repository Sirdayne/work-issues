<template lang="pug">
.fx-table.fx-small(v-loading="loading", element-loading-text="Загрузка...")
  el-table(
    :data="[carInformation]",
    border,
    resizable,
  )
    el-table-column(label="Гос номер", prop="number", header-align="center")
    el-table-column(label="Хоз номер", prop="businessNumber", header-align="center")
    el-table-column(label="Год выпуска", prop="year", header-align="center")
    el-table-column(label="Номер двигателя", prop="engineNumber", header-align="center")
    el-table-column(label="Орудие", prop="instrumentName", header-align="center")
    el-table-column(label="Средняя производительность", prop="productivityAverage", header-align="center")
    el-table-column(label="Кол-во простоя за посев", prop="idleTotalNumber", header-align="center")
    el-table-column(label="Кол-во простоя за уборку", prop="threshingVolume", header-align="center")
    el-table-column(label="Км за год", prop="kmForYear", header-align="center")
    el-table-column(label="ГСМ за год", prop="fuelForYear", header-align="center")
    el-table-column(label="ГСМ за 100км", prop="fuelFor100km", header-align="center")
    el-table-column(label="Работники", header-align="center")
      template(slot-scope="scope")
        template(v-for="worker in scope.row.employee")
          el-tag {{ worker.fullName }}

</template>

<script>
import http from "services/http"
import ListController from "mixins/ListController"
import nprogress from "lib/NProgress";

export default {
  name: "CarInformation",
  props: {
    "ids": {
      type: Array,
      default: [],
    },
  },
  mixins: [
    ListController,
  ],
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      carInformation: {},
      loading: true,
    }
  },
  created() {
    let endpoint = `CarInformation/${this.$root.context.organization}/${this.ids[0]}` ;
    nprogress.start()
    http.get(endpoint)
      .then(data => {
        if (data) {
          this.carInformation = data
        }
        this.loading = false
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
        this.loading = false
      })
  },
  computed: {

  },
}
</script>
