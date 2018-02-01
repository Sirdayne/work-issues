import { getCookie } from 'lib/utils'
import { store } from 'store/store';

function saveToken(token) {
  const date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7).toUTCString()
  document.cookie = `token=${token}; path=/; expires=${date};`
}

function forgetUser(token) {
  const date = new Date(0).toUTCString()
  document.cookie = `token=; path=/; expires=${date}`
  document.cookie = `authToken=; path=/; expires=${date}`
  localStorage.removeItem('p_')
}

export default function install(Vue, options) {
  let router = options.router
  let crypt  = options.crypt

  function getToken() {
    let token = getCookie('token')
    if (!token) return false
    if (crypt) {
      try {
        token = crypt.decrypt(token, false)
      } catch(e) {
        forgetUser()
      }
      if (!token.length) forgetUser()
    }
    return token.length? token : false
  }

  function getProfile() {
    let profileString = localStorage.getItem('p_')
    if (!profileString) return null
    if (crypt) {
      try {
        profileString = crypt.decrypt(profileString, false)
      } catch(e) {
        return null
      }
      if (!profileString.length) return null
    }
    let profile = null
    try {
      profile = JSON.parse(profileString)
    } catch(e) {
      return null
    }
    return profile
  }

  function changePassword(username,passwords){
    const token = getToken()
    let data = {
      "username" : username,
      "oldPassword" : passwords.old,
      "newPassword" : passwords.new,
      "ConfirmPassword" : passwords.confirm
    }
    return new Promise((resolve, reject) => {
      if (!token) reject('LOGOUT')
      else Vue.http.post(
        process.env.API_URL + 'api' + '/account/changepassword', data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        }
      ).then(response => {
        resolve(response.body)
      }, response => {
        reject('NO_RESPONSE', response)
      })
    })
  }

  function saveProfile(data) {
    const token = getToken()
    return new Promise((resolve, reject) => {
      if (!token) reject('LOGOUT')
      else Vue.http.post(
        process.env.API_URL + 'api' + '/account/changeuserinfo', data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        }
      ).then(response => {
        resolve(response.body)
      }, response => {
        reject('NO_RESPONSE')
      })
    })
  }

  function loadProfile() {
    const token = getToken()
    return new Promise((resolve, reject) => {
      if (!token) reject('LOGOUT')
      else Vue.http.get(
        process.env.API_URL + 'api' + '/account/userinfo',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        }
      ).then(response => {
        let profileString = JSON.stringify(response.body)
        if (crypt) profileString = crypt.encrypt(profileString, false)
        localStorage.setItem('p_', profileString)
        resolve(response.body)
      }, response => {
        reject('NO_RESPONSE')
      })
    })
  }

  let authenticated = !!getToken()

  if (router) {
    router.beforeEach((to, from, next) => {
      if (authenticated || to.meta.login) {
        let module = to.meta.module ? to.meta.module : store.getters.getModule ? store.getters.getModule : "agrofact";
        store.dispatch('actionSetModule', module);
        document.title = to.meta.title ? to.meta.title + ' - AgroStream' : 'AgroStream'
      }
      if (to.meta.auth !== false && !authenticated) {
        next('/login')
      } else if (to.meta.login && authenticated) {
        next('/')
      } else {
        next()
      }
    })
  }

  Vue.prototype.$auth = {
    authenticated,
    loadProfile,
    saveProfile,
    changePassword,
    getProfile,
    getToken,
    login(username='', pass='') {
      return new Promise((resolve, reject) => {
        Vue.http.post(
          process.env.API_URL + 'token',
          `userName=${encodeURIComponent(username)}&password=${encodeURIComponent(pass)}&grant_type=password`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        ).then(response => {
          let token = `${response.body.token_type} ${response.body.access_token}`
          if (crypt) token = crypt.encrypt(token, false)
          saveToken(token)
          Vue.prototype.$auth.authenticated = authenticated = true
          resolve()
        }, response => {
          if (response.body && response.body.error === 'invalid_grant') {
            reject('INVALID')
          } else if (!response.body || response.status === 0 || response.status >= 500) {
            reject('NO_RESPONSE')
          }
        })
      })
    },
    logout(redirect=true) {
      Vue.prototype.$auth.authenticated = authenticated = false
      if (crypt) crypt.resetKey()
      forgetUser()
      if (redirect) router.replace('/login')
    }
  }
}
