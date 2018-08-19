<template lang="pug">
div
  el-dialog(
    :visible.sync="formDialogVisible",
    title="Добавить контракт",
    size="tiny",
    :modal="false",
  )
    el-form(:model="item")
      el-form-item()
        el-upload(action="", accept="application/pdf", :auto-upload="false", :show-file-list="true", :on-change="setContract")
          el-button(slot="trigger", size="small", icon="document") Выбрать
      el-form-item
        el-button(type="primary", @click="addContract(item)", :loading="contractUploading", :disabled="converting") Сохранить
  h2 Группы компаний
  .el-table-cont
    el-table(
      v-if="tableData",
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
    ).content
      el-table-column(prop="name", label="Наименование")
      el-table-column(prop="description", label="Описание")
      el-table-column(prop="address", label="Адрес")
      el-table-column(prop="contacts", label="Контакты")
      el-table-column(prop="contractNumber", label="Номер контракта")
      el-table-column(label="Контракт")
        template(slot-scope="scope")
          template(v-if="scope.row.contractUrl")
            a(:href="scope.row.contractUrl", download) Скачать
            el-button(@click="openContractDialog(scope.row)", size="small", icon="edit") Изменить
          template(v-else)
            el-button(@click="openContractDialog(scope.row)", size="small", icon="upload2") Загрузить
      el-table-column(prop="jurInfo", label="Юр. информация")
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
import http from "services/http";
import ListController from "mixins/ListController"

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
      formDialogVisible: false,
      item: {},
      contractUploading: false,
      converting: false,
    }
  },
  created() {
    this.getOrgGroupList()
  },
  methods: {
    getOrgGroupList() {
      this.loading = true
      http.getWithoutCache("organizationsgroup")
        .then(data => {
          this.tableData = data || []
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    edit(orgGroupId) {
      this.$router.push(this.$route.path.replace("/group-list", `/group-add/${orgGroupId}`));
    },
    remove(orgGroupId) {
      if (confirm("Удалить группу компаний?")) {
        http.delete(`organizationsgroup/${orgGroupId}`)
          .then(() => {
            location.reload()
          })
      } else {
        return false;
      }
    },
    setContract(file) {
      let isPdf = file.raw.type == "application/pdf"
      if (!isPdf) return false;
      this.converting = true
      this.getBase64(file)
    },
    getBase64(file) {
      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.onload = () => {
        this.item.data = reader.result
        this.converting = false
      };
      reader.onerror = (error) => {
        this.converting = false
      };
    },
    openContractDialog(orgGroup) {
      this.item = {}
      this.item.organizationsGroupId = orgGroup.id
      this.item.contractNumber = orgGroup.contractNumber
      this.formDialogVisible = true
    },
    addContract() {
      this.contractUploading = true
      http.post("OrganizationsGroup/SetDocument", this.item)
        .then(data => {
          this.contractUploading = false
          this.getOrgGroupList()
        })
    },
  }
}
</script>
<style scoped lang="stylus">
</style>
