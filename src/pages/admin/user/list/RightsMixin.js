import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader";

export default {
  data() {
    return {
      permissionsDialogVisible: false,
      permissions: [],
      roletemplates: [],
      rights: [],
      activeRights: [],
      constRights: ["View", "Edit", "Create", "Delete", "Export"],
      loadingRights: false
    };
  },
  mixins: [
    
  ],
  created() {
    this.loadingRights = true
    fetchEntities([
      "roles",
      "roletemplates"
    ], this.afterFetch );
  },
  methods: {
    afterFetch() {
      this.permissions = fromVuex("roles")
      this.roletemplates = fromVuex("roletemplates")
      this.setRights()
      this.setRoleTemplates();
      this.loadingRights = false
    },
    setRights() {
      this.rights = []
      this.setRightsUniqueNames()
      this.resetRightsGroups()
    },
    setRightsUniqueNames() {
      this.permissions.forEach(permission => {
        let found = this.rights.find(right => right.name === permission.name)
        if (!found) {
          this.rights.push({
            name: permission.name
          })
        }
      })
    },
    resetRightsGroups() {
      this.rights.forEach(right => {
        this.permissions.forEach(permission => {
          if (right.name === permission.name) {
            right[`${permission.group}Exist`] = true
            right[`${permission.group}Check`] = false
            right[`${permission.group}Value`] = permission.value
          }
        })
      })
    },
    setRoleTemplates() {
      this.roletemplates.forEach(template => {
        template.rights = this.parseTemplate(template.roles)
        template.checked = false
      })
    },
    parseTemplate(string) {
      let array = []
      let symbols = ""
      for(let i = 0; i < string.length; i++) {
        symbols += string[i]
        if (string[i] === ";"){
          array.push(symbols)
          symbols = ""
        }
      }
      return array
    },
    checkRoles() {
      this.resetRoles()
      this.collectRights()
      this.roletemplates.forEach(template => {
        template.checked = this.hasRole(template.rights)
      })
      this.reRender()
    },
    resetRoles() {
      this.roletemplates.forEach(template => {
        template.checked = false
      })
    },
    collectRights() {
      this.activeRights = []
      this.rights.forEach(right => {
        this.constRights.forEach(constRight => {
          if (right[`${constRight}Check`])
            this.activeRights.push(right[`${constRight}Value`])
        })
      })
    },
    hasRole(roles) {
      let out = true
      roles.forEach(role => {
        if (!this.activeRights.includes(role)) {
          out = false
        }
      })
      return out
    },
    openPermissionsDialog(user) {
      this.user = user
      this.item = {}
      this.getUserRights()
      this.permissionsDialogVisible = true
    },
    getUserRights() {
      this.loadingRights = true
      http.getWithoutCache(`Roles?id=${this.$root.context.organization}&userId=${this.user.id}`)
        .then(data => {
          this.resetRightsGroups()
          if (data && data.length > 0){
            this.selectCheckboxes(data[0].roles)
          }
          this.loadingRights = false
        })
    },
    selectCheckboxes(rights, select = true) {
      rights.forEach(roleValue => {
        this.rights.forEach(right => {
          this.constRights.forEach(constRight => {
            if (roleValue === right[`${constRight}Value`])
              right[`${constRight}Check`] = select ? true : false
          })
        })
      })
      this.checkRoles()
      this.reRender()
    },
    saveRights() {
      let body = ""
      this.activeRights.forEach(right => {
        body += right
      })
      this.loadingRights = true
      http.put(`Roles?id=${this.$root.context.organization}&userId=${this.user.id}&roles=${body}`)
        .then(() => {
          this.loadingRights = false
        })
    },
    reRender() {
      this.rerender = !this.rerender
    },
  }
}
