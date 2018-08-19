import {getCookie} from "lib/utils"
import localforage from "localforage";
import axios from "axios"

export default {
  isAuthenticated() {
    return !!getCookie("token")
  },
  forgetUser() {
    const date = new Date(0).toUTCString()
    document.cookie = `token=; path=/; expires=${date}`
    localStorage.removeItem("profile")
  },
  getToken() {
    let token = getCookie("token")
    if (token) {
      return token
    } else {
      this.logout()
    }
  },
  getProfile() {
    let profileString = localStorage.getItem("profile")
    if (!profileString) return null
    let profile = null
    try {
      profile = JSON.parse(profileString)
    } catch(e) {
      return null
    }
    return profile
  },
  changePassword(username, passwords){
    const token = this.getToken()
    let data = {
      "username": username,
      "oldPassword": passwords.old,
      "newPassword": passwords.new,
      "ConfirmPassword": passwords.confirm
    }
    return new Promise((resolve, reject) => {
      if (!token)  {
        reject("LOGOUT")
      } else {
        let url = `${SERVER_URL}api/account/changepassword`
        let headers = {headers: {"Content-Type": "application/json", "Authorization": token}}
        axios.post(url, data, headers)
          .then(response => {
            resolve(response.data)
          })
          .catch(err => {
            reject("NO_RESPONSE", err)
          })
      }
    })
  },
  saveProfile(data) {
    const token = this.getToken()
    return new Promise((resolve, reject) => {
      if (!token) {
        reject("LOGOUT")
      } else {
        let url = `${SERVER_URL}api/account/changeuserinfo`
        let headers = {headers: {"Content-Type": "application/json", "Authorization": token}}
        axios.post(url, data, headers)
          .then(response => {
            resolve(response.data)
          })
          .catch(() => {
            reject("NO_RESPONSE")
          })
      }
    })
  },
  loadProfile() {
    const token = this.getToken()
    return new Promise((resolve, reject) => {
      if (!token) {
        reject("LOGOUT")
      } else {
        let url = `${SERVER_URL}api/account/userinfo`
        let headers = {headers: {"Content-Type": "application/json", "Authorization": token}}
        axios.get(url, headers)
          .then(response => {
            let profileString = JSON.stringify(response.data)
            localStorage.setItem("profile", profileString)
            resolve(response.data)
          })
          .catch(() => {
            reject("NO_RESPONSE")
          })
      }
    })
  },
  login(username="", pass="") {
    return new Promise((resolve, reject) => {
      let url = `${SERVER_URL}token`
      let data = `userName=${encodeURIComponent(username)}&password=${encodeURIComponent(pass)}&grant_type=password`
      let headers = {headers: {"Content-Type": "application/x-www-form-urlencoded"}}
      axios.post(url, data, headers)
        .then(response => {
          let token = `${response.data.token_type} ${response.data.access_token}`
          document.cookie = `token=${token}; path=/; expires=${response.data[".expires"]};`
          resolve()
        })
        .catch(error => {
          if (error.response.data && error.response.data.error === "invalid_grant") {
            reject("INVALID")
          } else if (!error.response.data || error.response.status === 0 || error.response.status >= 500) {
            reject("NO_RESPONSE")
          } else {
            reject("OTHER")
          }
        })
    })
  },
  logout() {
    localStorage.clear()
    localforage.clear()
    this.forgetUser()
    window.location = "/"
  },
}
