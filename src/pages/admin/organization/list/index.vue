<template lang="pug">
div
  h2 Список компаний
  .el-table-cont
    el-table(
      v-if="tableData",
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
    ).content
      el-table-column(prop="name", label="Наименование")
      el-table-column(prop="shortName", label="Сокращенное наименование")
      el-table-column(prop="organizationTypeName", label="Тип организации")
      el-table-column(align="center", width="120")
        el-button-group(slot-scope="scope")
          el-button(icon="edit", size="small", @click="edit(scope.row.id)")
          el-button(icon="delete", size="small", @click="remove(scope.row.id)")
    el-pagination(
      layout="total, prev, pager, next",
      :total="tableData.length",
      :page-size="perPage",
      :current-page="currentPage",
      style="margin-top: 10px;",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )
</template>
<script>
import http from "services/http";
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import paginate from "mixins/paginate"

export default {
  mixins: [
    
    paginate,
  ],
  data() {
    return {
      organizationtype: [],
      tableData: [],
      loading: false,
      perPage: 10,
      currentPage: 1,
    }
  },
  created() {
    fetchEntities([
      "organizationtype",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.organizationtype = fromVuex("organizationtype")
      this.getOrgList()
    },
    getOrgList() {
      this.loading = true
      http.getWithoutCache("organizations")
        .then(data => {
          this.setData(data)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    setData(data) {
      let formatted = this.formatData(data)
      this.tableData = formatted
    },
    formatData(data) {
      return data.map(d => {
        let organizationType = this.organizationtype.find(o => o.id == d.organizationType)
        d.organizationTypeName = organizationType && organizationType.name
        return d
      })
    },
    edit(orgId) {
      this.$router.push(this.$route.path.replace("/list", `/add/${orgId}`));
    },
    remove(orgId) {
      if (confirm("Удалить компанию?")) {
        http.delete(`organizations/${orgId}`)
          .then(() => {
            location.reload()
          })
      } else {
        return false;
      }
    },
  }
}
</script>
<style scoped lang="stylus">
</style>
