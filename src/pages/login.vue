<template lang="pug">
.page(v-loading.fullscreen.lock="isWaiting"): .modal
  h2.title Agrostream
  el-form(label-width="70px",)
    el-form-item(label="Логин")
      el-input(v-model="username", name="username")
    el-form-item(label="Пароль")
      el-input(type="password", v-model="pass")
    el-form-item(label=".", :class="{invisibleColor: true}")
      el-button(type="primary", @click.prevent="login", native-type="submit") Войти
</template>

<script>
import Auth from 'services/Auth'

export default {
  data() {
    return {
      isWaiting: false,
      username: '',
      pass: ''
    }
  },
  methods: {
    login() {
      this.isWaiting = true
      Auth.login(this.username, this.pass)
        .then(() => {
          this.isWaiting = false
          this.$root.context.year = null
          this.$root.onAuth()
          this.$router.push('/')
        })
        .catch(err => {
          this.isWaiting = false
          this.$message({
            showClose: true,
            message: err === 'INVALID'? 'Неверный E-mail или пароль' : 'Ошибка соединения с интернетом',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.title
  text-align center
.page
  display flex
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #ccc;
.modal
  width 300px
  margin auto
  background #fff
  padding 1rem
</style>
