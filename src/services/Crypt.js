import CryptoJS from 'crypto-js'

const salt = 'Z$pSCTtX6gHMc!QmMcgJPg#F^hKrZtG$'
let key = salt

function encrypt(msg, forSession=false) {
  return CryptoJS.AES.encrypt(msg, forSession? key : salt).toString()
}
function decrypt(msg, forSession=false) {
  return CryptoJS.AES.decrypt(msg, forSession? key : salt).toString(CryptoJS.enc.Utf8)
}
function updateKey(_key) {
  key = CryptoJS.HmacSHA1(_key, salt).toString()
}
function resetKey() {
  key = salt
}
function md5(val) {
  return CryptoJS.MD5(val)
}

export default {
  install(Vue, options) {
    Vue.prototype.$crypt = {
      encrypt,
      decrypt,
      updateKey,
      resetKey,
      md5
    }
  },
  encrypt,
  decrypt,
  updateKey,
  resetKey,
  md5
}
