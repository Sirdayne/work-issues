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
      el-table-column(
        fixed="right",
        align="center",
        width="140",
      )
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
import http from 'lib/httpQueryV2';
import ListController from 'mixins/ListController'

export default {
  mixins: [
    ListController,
  ],
  data() {
    return {
      tableData: [],
      loading: false,
      perPage: 10,
      currentPage: 1,
    }
  },
  created() {
    this.getOrgList()
  },
  methods: {
    getOrgList() {
      this.loading = true
      http.getWithoutCache("organizations")
        .then(data => {
          this.tableData = data || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
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
