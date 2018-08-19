<template lang="pug">
div
  el-dialog(:visible.sync="permissionsDialogVisible", title="Изменение прав:", :class="{'rerender': rerender}")
    .fx-table.fx-big(v-loading="loadingRights", element-loading-text="Загрузка...", style="margin-bottom: 20px;")
      .fx-row.fx-grey.fx-sticky.fx-bold
        .fx-cell(:style="firstColStyle") Наименование
        .fx-cell Просмотр
        .fx-cell Правка
        .fx-cell Создание
        .fx-cell Удаление
        .fx-cell Экспорт
      .fx-row(v-for="right in rights")
        .fx-cell(:style="firstColStyle")  {{ right.name }}
        .fx-cell
          label.fx-checkbox(v-if="right.ViewExist")
            input(type="checkbox", v-model="right.ViewCheck", @change="checkRoles()")
            span.checkmark
        .fx-cell
          label.fx-checkbox(v-if="right.EditExist")
            input(type="checkbox", v-model="right.EditCheck", @change="checkRoles()")
            span.checkmark
        .fx-cell
          label.fx-checkbox(v-if="right.CreateExist")
            input(type="checkbox", v-model="right.CreateCheck", @change="checkRoles()")
            span.checkmark
        .fx-cell
          label.fx-checkbox(v-if="right.DeleteExist")
            input(type="checkbox", v-model="right.DeleteCheck", @change="checkRoles()")
            span.checkmark
        .fx-cell
          label.fx-checkbox(v-if="right.ExportExist")
            input(type="checkbox", v-model="right.ExportCheck", @change="checkRoles()")
            span.checkmark
    .fx-block.active-roles(v-loading="loadingRights", style="margin-bottom: 20px")
      .active-role(v-for="template in roletemplates")
        span {{template.name}}
        label.fx-checkbox
          input(type="checkbox", v-model="template.checked", @change="selectCheckboxes(template.rights, template.checked)")
          span.checkmark
    el-button(type="primary", @click="saveRights()", :loading="loadingRights") Сохранить

  el-dialog(:visible.sync="formDialogVisible", :title="user.fullName", size="tiny", :modal="false")
    div.header Добавить роль
    el-select(v-model="item.roleToAdd", filterable, clearable)
      el-option(v-for="r in rolesToAdd", :label="r.Name", :value="r.Name", :key="r.Id")
    el-button.form-button(@click="addRole()", :disabled="!item.roleToAdd") Добавить
    div.header Удалить роль
    el-select(v-model="item.roleToRemove", filterable, clearable)
      el-option(v-for="r in rolesToRemove", :label="r.Name", :value="r.Name", :key="r.Id")
    el-button.form-button(icon="delete", @click="removeRole()", :disabled="!item.roleToRemove") Удалить
  h2 Список пользователей
  .el-table-cont
    el-table(
      v-if="tableData",
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
    ).content
      el-table-column(prop="fullName", label="ФИО", min-width="200")
      el-table-column(prop="position", label="позиция", min-width="200")
      el-table-column(prop="phoneNumber", label="телефон", width="130")
      el-table-column(prop="email", label="email", min-width="200")
      el-table-column(prop="rolesDisplayAsString", label="роли", min-width="150")
      el-table-column(align="center", width="150")
        el-button-group(slot-scope="scope")
          el-button(size="small", icon="edit", @click="openUserRolesEditDialog(scope.row)")
          el-button(size="small", icon="menu", @click="openPermissionsDialog(scope.row)")
          el-button(icon="delete", size="small", @click="remove(scope.row.email)")
    el-pagination(
      layout="total, prev, pager, next",
      :total="tableData.length",
      :page-size="perPage",
      :current-page.sync="currentPage",
      @current-change="handleCurrentChange",
      style="margin-top: 10px;",
    )
</template>
<script>
import http from "services/http";
import RightsMixin from "./RightsMixin"

export default {
  data() {
    return {
      users: [],
      loading: false,
      perPage: 10,
      currentPage: 1,
      dataUpdated: 1,
      formDialogVisible: false,
      user: {},
      item: {},
      roles: [],
      firstColStyle: "width: 37%;",
      rerender: false
    }
  },
  mixins: [
    RightsMixin
  ],
  computed: {
    tableData() {
      return this.dataUpdated && this.users
    },
    rolesToAdd() {
      let userRoles = []
      if (this.user.roles) userRoles = this.user.roles.map(r => r.Name)
      return this.roles.filter(r => !userRoles.includes(r.Name))
    },
    rolesToRemove() {
      let userRoles = []
      if (this.user.roles) userRoles = this.user.roles.map(r => r.Name)
      return this.roles.filter(r => userRoles.includes(r.Name))
    },
  },
  created() {
    this.getRoles()
    this.getUserList()
  },
  methods: {
    getUserList() {
      this.loading = true
      let orgId = this.$root.context.organization
      http.getWithoutCache(`account/users/${orgId}`)
        .then(data => {
          this.users = data || []
          this.handleCurrentChange()
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    remove(email) {
      if (confirm("Удалить пользователя?")) {
        let body = {"email": email}
        http.post(`account/removeuser`, body)
          .then(() => {
            location.reload()
          })
      } else {
        return false;
      }
    },
    getUserRoles(userId) {
      this.loading = true
      http.getWithoutCache(`admin/roles?userId=${userId}`)
        .then(data => {
          let user = this.users.find(u => u.id == userId)
          user.rolesDisplayAsString = data.map(d=> d.Name).join(", ") || "Без роли"
          user.roles = data
          this.user = user
          this.dataUpdated++
          this.loading = false
        })
    },
    openUserRolesEditDialog(user) {
      this.user = user
      this.item = {}
      this.formDialogVisible = true
    },
    getRoles() {
      http.getWithoutCache(`admin/roles`)
        .then(data => {
          this.roles = data
        })
    },
    addRole() {
      this.formDialogVisible = false
      let body = {email: this.user.email, role: this.item.roleToAdd}
      http.post("account/addtorole", body)
        .then(() => {
          this.getUserRoles(this.user.id)
        })
    },
    removeRole() {
      this.formDialogVisible = false
      let body = {email: this.user.email, role: this.item.roleToRemove}
      http.post("account/removefromrole", body)
        .then(() => {
          this.getUserRoles(this.user.id)
        })
    },
    paginate(arr) {
      if (!arr || !arr.length) return [];
      let from = (this.currentPage - 1) * this.perPage
      let users = arr.slice(from, from + this.perPage)
      return users
    },
    handleCurrentChange(num) {
      let from = (this.currentPage - 1) * this.perPage
      let users = this.tableData.slice(from, from + this.perPage)
      this.getUsersRoles(users)
    },
    getUsersRoles(users) {
      this.loading = true
      let requests = []
      users.forEach(u => {
        let request = new Promise((resolve, reject) => {
          http.getWithoutCache(`admin/roles?userId=${u.id}`)
            .then((data) => {
              let userId = u.id
              let user = this.users.find(u => u.id == userId)
              user.rolesDisplayAsString = data.map(d=> d.Name).join(", ") || "Без роли"
              user.roles = data
              resolve()
            })
            .catch(() => reject())
        });
        requests.push(request)
      })
      http.all(requests)
        .then(() => {
          this.dataUpdated++
          this.loading = false
        })
    },
  }
}
</script>
<style scoped lang="stylus">
.header
  padding 10px 0 10px
.form-button
  margin-left 10px
.active-roles
  display flex
  justify-content space-between
  font-size 12px
.active-role
  position relative
  margin-right 25px
.active-role .fx-checkbox
  position absolute
  right -27px
  top -5px
</style>
