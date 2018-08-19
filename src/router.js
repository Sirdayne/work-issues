import Vue from "vue"
import VueRouter from "vue-router"
import routes from "./routes"
import Auth from "services/Auth"

Vue.use(VueRouter)

const router = new VueRouter({
  mode: "hash",
  linkActiveClass: "active",
  routes
})

function isAuthRequired(to) {
  // auth required by default, except for login page
  return to.matched.some(page => page.meta.auth !== false)
}
function isRoleRequired(to) {
  return to.matched.some(page => {
    if (page.meta.roles) {
      if (Array.isArray(page.meta.roles)) {
        return !!page.meta.roles.length
      }
      return true
    }
    return false
  })
}
function doesUserHaveRequiredRoles(to) {
  let userRoles = Auth.getProfile() && Auth.getProfile().roles || []
  return to.matched.every(page => {
    if (page.meta.roles) {
      if (Array.isArray(page.meta.roles)) {
        if (page.meta.roles.length) {
          return page.meta.roles.some(role => userRoles.includes(role))
        }
        return true
      }
      return userRoles.includes(page.meta.roles)
    }
    return true
  })
}
function checkRole(to) {
  let roleIsNotRequired = !isRoleRequired(to)
  let userHasRequiredRoles = doesUserHaveRequiredRoles(to)
  let isRoleOk = roleIsNotRequired || userHasRequiredRoles
  return isRoleOk
}
function isPageLogin(to) {
  return to.meta.login
}
function setDocumentTitle(to) {
  if ((Auth.isAuthenticated() || isPageLogin(to))) {
    document.title = to.meta.title ? to.meta.title + " - AgroStream" : "AgroStream"
  }
}

router.beforeEach((to, from, next) => {
  let pageRequiresAuthButUserNotAuthenticated = isAuthRequired(to) && !Auth.isAuthenticated()
  let loginPageAndUserAuthenticated = isPageLogin(to) && Auth.isAuthenticated()
  let requiresCertainRole = isRoleRequired(to)
  let isRoleOk = checkRole(to)
  if (isRoleOk) setDocumentTitle(to)

  if (pageRequiresAuthButUserNotAuthenticated) {
    next("/login")
  } else if (loginPageAndUserAuthenticated) {
    next("/")
  } else if (requiresCertainRole) {
    if (isRoleOk) {
      next()
    } else {
      alert(new Error("Недостаточно прав"))
      from.fullPath == "/" ? next("/") : next(false)
    }
  } else {
    next()
  }
})
router.onError(err => {
  alert(err)
})

export {router}
