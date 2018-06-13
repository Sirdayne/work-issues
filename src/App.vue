<template lang="pug">
#app-container(v-loading.fullscreen.lock="isWaiting")
  sidebar-toggle
  el-dialog(
  title="Настройки",
  v-model="settingsDialogVisible",
  size="tiny",
  :close-on-click-modal="true",
  @close="feedbackVisible = false"
  )
    el-form(label-position="top")

      el-form-item
        el-button(v-if="!feedbackVisible", @click="feedbackVisible = true") Отправить сообщение

      el-form-item(v-if="feedbackVisible", v-loading.body="feedbackSends", label="Обратная связь")
        el-input(type="textarea", v-model="feedback")
        el-button(type="primary", size="small", @click="sendFeedback(feedback)", :disabled="feedback.trim() === ''") Отправить

      el-button(@click="profileDialogVisible = true, settingsDialogVisible = false", icon="information") Профиль

      el-button(@click="clearCacheTotally()", icon="delete") Очистить БД

  el-dialog(
  title="Профиль",
  v-model="profileDialogVisible",
  size="tiny",
  :close-on-click-modal="true",
  v-if="!isWaiting && isAuthenticated()"
  )
    el-form(label-position="top")
      el-form-item(label="Аватар")
        avatar(:user="user")

      el-form-item(label="Логин"): b {{user.userName}}
      el-form-item(label="ФИО")
        el-input(type="text", v-model="user.fullName")
      el-form-item(label="Организация")
        el-select(
        v-model="user.organizationId",
        placeholder="Организация",
        filterable,
        )
          el-option(
          v-for="organization in organizations",
          :label="organization.name",
          :value="organization.id",
          :key="organization.id",
          )
      el-form-item(label="Должность")
        el-input(type="text", v-model="user.position")
      el-form-item(label="Телефон")
        el-input(type="text", v-model="user.phoneNumber")
      el-form-item(label="Email")
        el-input(type="text", v-model="user.email")



      el-form-item
        span(@click="changePasswordVisible = !changePasswordVisible", :class="[changePasswordVisible ? 'dashGray' : 'dash']") Сменить пароль
      template(v-if="changePasswordVisible")
        el-form-item(label="Текущий пароль")
          el-input(type="password", v-model="passwords.old")
        el-form-item(label="Новый пароль", v-if="changePasswordVisible")
          el-input(type="password", v-model="passwords.new")
        el-form-item(label="Подтвердите пароль", v-if="changePasswordVisible")
          el-input(type="password", v-model="passwords.confirm")

      el-button(type="primary", @click="saveProfile(user, context.organization)", :loading="saveProfileLoading") Сохранить


  header.top-panel(v-if="!isWaiting && isAuthenticated() && this.$route.path != '/modules-tree'")
    a.logoLink(@click="navigateToHome()")
      h2.logo(v-html="logo")
    template(v-if="ENV.IS_PROD")
      span#logoTag v{{version}}
    template(v-if="!ENV.IS_PROD")
      el-tooltip(class="item", effect="dark", :content="ENV.SERVER_URL", placement="bottom-end")
        span#logoTag v{{version}}
    header-menu

    div.controls
      el-select(
        v-if="module === 'agromap'",
        v-model="context.field",
        placeholder="Поле",
        size="small",
        :style="{width: '150px', marginRight: '10px'}"
      )
        el-option(
        v-for="field in fields",
        :label="field.newName",
        :value="field.id",
        :key="field.id",
        )
      el-select(
        v-model="context.organization",
        placeholder="Организация",
        size="small",
        filterable,
        :style="{width: '220px', marginRight: '10px'}"
      )
        el-option(
          v-for="organization in organizations",
          :label="organization.name",
          :value="organization.id",
          :key="organization.id",
        )
      el-select(
        v-model="context.year",
        placeholder="Год",
        size="small",
        :style="{width: '100px', marginRight: '10px'}"
      )
        el-option(
          v-for="year in years",
          :label="year",
          :value="year",
          :key="year",
        )
      .avatar-container(v-if="user.imageByte")
        img(:src="user.imageByte")
      el-button-group
        el-button(@click="settingsDialogVisible = true", size="small", icon="setting") Настройки
        el-button.exit(@click="$router.push('/logout')", size="small") .
  router-view(v-if="!isWaiting")
</template>

<script>
import Auth from 'services/Auth'
import http from 'lib/httpQueryV2'
import localforage from 'localforage';
import {
  EventBus
} from 'services/EventBus';
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import sidebarToggle from 'components/sidebarToggle'
import headerMenu from 'components/headerMenu'
import avatar from 'components/avatar'
import moment from 'moment';

import {modules} from "modules.js"

const CURRENT_YEAR = (new Date).getFullYear();
const NODE_ENV = process.env.NODE_ENV;
const VERSION = '[AIV]{version}[/AIV]';

export default {
  components: {
    sidebarToggle,
    headerMenu,
    avatar,
  },
  mixins: [
    RecordsLoaderV2
  ],
  data() {
    return {
      datasets: {},
      settingsDialogVisible: false,
      feedback: '',
      feedbackSends: false,
      feedbackVisible: false,
      profileDialogVisible: false,
      changePasswordVisible: false,
      saveProfileLoading: false,
      profile: null,
      contextNotNull: false,
      context: {
        organization: null,
        organizationsGroupId: null,
        budget: null,
        year: null,
        culture: null,
        field: null
      },
      logos: {
        agroplan: '<b>Agro</b>plan',
        agromap: '<b>Agro</b>map',
        agrofact: '<b>Agro</b>fact',
        biagro: '<b>BI</b>agro',
        agroinfo: '<b>Agro</b>info',
        balanszerna: '<b>Баланс</b> зерна',
        agrostock: '<b>Agro</b>stock',
        admin: '<b>Ad</b>min',
        agrostream: '<b>Agro</b>stream',
      },
      state: {},
      passwords: {},
      organizations: [],
      fields: null,
      budgets: [],
      isWaiting: false,
      ENV: {
        SERVER_URL: SERVER_URL,
        IS_PROD: IS_PROD
      },
      version: VERSION,
      module: "agrostream",
      logo: "",
    }
  },
  computed: {
    user() {
      return this.profile
    },
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
  watch: {
    ['context.budget'](val, oldVal) {
      this.contextNotNull |= oldVal
      localStorage.setItem('budget', val)
    },
    ['context.culture'](val, oldVal) {
      this.contextNotNull |= oldVal
    },
    ['context.organization'](val, oldVal) {
      this.contextNotNull |= oldVal
      localStorage.setItem('organization', val)
      this.$store.dispatch('actionSetOrganizationId', val);
      EventBus.$emit('App.Context.OrganizationChanged', val);
    },
    ['context.organizationsGroupId'](val, oldVal) {
      localStorage.setItem('organizationsGroupId', val)
      this.$store.dispatch('actionSetOrganizationsGroupId', val);
    },
    ['context.field'](val, oldVal) {
      localStorage.setItem('field', val)
    },
    ['context.year'](val, oldVal) {
      this.contextNotNull |= oldVal
      localStorage.setItem('year', val)
      EventBus.$emit('AppYearChanged', this.context.year );
    },
    context: {
      handler: function(val, oldVal) {
        if (this.contextNotNull) window.location.reload()
        this.contextNotNull = false
      },
      deep: true
    },
    ['$route.path'](val) {
      let module = val.split("/")[1]
      this.module = Object.keys(modules).find(key => key === module) || "agrostream"
      this.setLogo()
      if (!this.isWaiting && !this.module) this.$router.push("/")
    },
  },
  created() {
    this.onAuth()
    this.setLogo()
    this.checkAppVersion()
    this.years = [
      CURRENT_YEAR - 4,
      CURRENT_YEAR - 3,
      CURRENT_YEAR - 2,
      CURRENT_YEAR - 1,
      CURRENT_YEAR,
      CURRENT_YEAR + 1,
      CURRENT_YEAR + 2
    ]
  },
  methods: {
    isAuthenticated() {
      return Auth.isAuthenticated()
    },
    setLogo() {
     this.logo = this.logos[this.module]
    },
    checkAppVersion() {
      localforage.getItem("AppVersion")
        .then(res => {
          if (res != this.version) {
            localforage.setItem("AppVersion", this.version)
          }
        })
    },
    clearCacheTotally() {
      //localStorage.clear()
      localforage.clear().then(() => {
        window.location.reload();
      })
    },
    navigateToHome() {
      this.$router.push('/');
    },
    saveProfile(userinfo) {
      this.saveProfileLoading = true
      Auth.saveProfile(userinfo).then(() => {
        Auth.loadProfile().then(profile => {
          this.profile = profile

          if (this.changePasswordVisible) {
            Auth.changePassword(userinfo.username, this.passwords).then(() => {
              this.profileDialogVisible = false
              this.changePasswordVisible = false
              this.saveProfileLoading = false
              this.$message({
                message: "Пароль обновлен",
                type: "success",
                duration: 5000,
                showClose: false,
              });
              this.passwords.old = this.passwords.new = this.passwords.confirm = ''
            }, () => {
              this.$message({
                message: "Проверьте правильность паролей",
                type: "error",
                duration: 5000,
                showClose: false,
              });
              this.saveProfileLoading = false
            })
          } else {
            this.profileDialogVisible = false
            this.saveProfileLoading = false
          }
          this.$message({
            message: "Профиль обновлен",
            type: "success",
            duration: 5000,
            showClose: false,
          })
        })
      })
    },
    onAuth() {
      if (this.isAuthenticated()) {
        const profile = Auth.getProfile()
        this.isWaiting = true
        if (profile) {
          this.profile = profile
          this.init()
        } else {
          Auth.loadProfile().then(profile => {
            this.profile = profile
            this.init()
          }).catch(() => {
            Auth.logout()
          })
        }
      }
    },
    loadUserProfile() {
      Auth.loadProfile().then(profile => {
        if (!this.profileDialogVisible) {
          this.profile = profile
        } else {
          this.profile.imageByte = profile.imageByte
        }
        if (!profile.hasRegistered) {
          alert('USER_NOT_REGISTERED')
        }
      }).catch(err => {
        if (err === 'LOGOUT') {
          window.location.reload()
        }
      })
    },
    loadRecords() {
      this.fetchEntities([
        'budgets',
        'userorganizations'
      ], this.onLoadContexts)
    },
    loadFields() {
      this.fetchEntities([
        'fields'
      ], this.onLoadFields)
    },
    init() {
      if (this.profile.hasRegistered) {
        this.loadRecords();
      } else {
        this.$message({
          showClose: true,
          message: 'USER_NOT_REGISTERED',
          type: 'error'
        })
      }
    },
    onLoadContexts() {
      let currentOrganization = +localStorage.getItem('organization')
      let currentOrganizationsGroupId = +localStorage.getItem('organizationsGroupId')
      let currentBudget = +localStorage.getItem('budget')
      let currentYear = +localStorage.getItem('year')

      this.organizations = this.fromVuex('userorganizations');
      this.budgets = this.fromVuex('budgets');

      if (isNaN(currentOrganization) || !this.organizations.find(organization => organization.id === currentOrganization)) {
        currentOrganization = this.organizations[0].id
        currentOrganizationsGroupId = this.organizations[0].organizationsGroupId
      }
      if (isNaN(currentBudget) || !this.budgets.find(budget => budget.id === currentBudget)) {
        currentBudget = this.budgets[0].id
      }
      if (isNaN(currentYear) || !this.years.find(year => year === currentYear)) {
        currentYear = CURRENT_YEAR
      }
      this.context.organization = currentOrganization
      this.context.organizationsGroupId = currentOrganizationsGroupId
      this.$store.dispatch('actionSetOrganizationId', this.context.organization);
      this.$store.dispatch('actionSetOrganizationsGroupId', this.context.organizationsGroupId);
      this.context.budget = currentBudget
      this.context.year = currentYear

      this.loadFields()
    },
    onLoadFields(){
      let fieldId = +localStorage.getItem('field')

      this.fields = this.fromVuex('fields')

      if (isNaN(fieldId) || !this.fields.find(f => f.id === fieldId)) {
        fieldId = (this.fields[0]) ? this.fields[0].id : 0
        localStorage.setItem('field', fieldId)
      }

      this.context.field = fieldId
      // change Map SelectedDate to context.year
      this.$store.dispatch('actionSetSelectedDate', moment().year(this.context.year).hour(8).minute(0).second(0).subtract(1, 'days').format());

      this.isWaiting = false
    },
    sendFeedback() {
      this.feedbackSends = true
      http.post('feedback', {
        message: this.feedback
      }).then(() => {
        this.feedback = ''
        this.feedbackSends = false
        this.feedbackVisible = false
      })
    }
  }
}
</script>

<style lang="stylus">
html, body
  height 100%
body
  font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  position relative !important
  overflow auto !important
#app-container
  display flex
  flex-flow column nowrap
  width inherit
  height inherit
  overflow hidden !important
.top-panel
  flex 0 0 auto
  height 60px
  position relative
  width inherit
  z-index 999
  background #324057
  .el-button-group .el-button
    padding 8px
  .el-menu
    float left
  .controls
    float right
    padding 14px
  .button
    margin 14px
  .el-menu--horizontal .el-menu-item
    padding 0 15px
.cols
  flex 0 0 auto
  width inherit
  height inherit
  display flex
  flex-flow row nowrap
  justify-content flex-start
.sidebar
  flex 0 0 auto
  width 330px
  height calc(100vh - 60px)
  overflow-x hidden
  a
    text-decoration none
.workspace
  flex 1 0 auto
  width calc(100% - 330px)
  height calc(100% - 60px)
  flex-flow column nowrap
  display flex
  background #fff
  overflow auto
  padding 10px 10px 10px 20px
  box-sizing border-box
.page
  display flex
  flex-direction column
  align-items baseline
  flex 0 0 auto
  background #fff
.bottom-panel
  padding 16px
  border-top: solid 2px #324057;
  background: #f5f5f5;
  align-self: stretch;
.el-submenu__title
  font-size 18px
.searchbar
  flex auto 0 0
  margin 10px 18px
  display flex
  .el-card
    flex 200px 1 0
    margin 0 10px
    &__body
      padding 0
.el-pagination
  text-align right
.content
  flex 100px 1 0
  table
    width 100% !important
.controls
  flex 40px 0 0
.dash
  text-decoration none
  border-bottom 1px dashed #20a0ff
  color #20a0ff
  cursor pointer
  &:hover
    border-bottom-color rgba(#20a0ff, .5)
.dashGray
  text-decoration none
  border-bottom 1px dashed #666
  color #666
  cursor pointer
  &:hover
    border-bottom-color rgba(#666, .5)
.logo
  float left
  font-size 23px
  color #fff
  margin 14px 10px 14px 20px
  b
    color #7fe67f
.logoLink
  &:hover
    cursor pointer
#logoTag
  position absolute
  top 0px
  right 0px
  color #bfcbd9
  background transparent
  padding 2px
  font-size 10px
  z-index 100
.el-button.printer
  content: ""
  display: inline-block
  background-image: url( 'assets/printer.svg' );
  background-repeat: no-repeat;
  background-size: 20px auto;
  background-position: center center;
  color: transparent;
  width: 50px;
.el-button.excel
  content: ""
  display: inline-block
  background-image: url( 'assets/excel.svg' );
  background-repeat: no-repeat;
  background-size: 20px auto;
  background-position: center center;
  width: 50px;
  color: transparent;
.el-button.filter
  content: ""
  display: inline-block
  background-image: url( 'assets/filter.svg' );
  background-repeat: no-repeat;
  background-size: 20px auto;
  background-position: center center;
  width: 50px;
  color: transparent;
.el-button.exit
  content: ""
  display: inline-block
  background-image: url( 'assets/exit.svg' );
  background-repeat: no-repeat;
  background-size: 15px auto;
  background-position: center center;
  width: 40px;
  color: transparent;
.no-results
  width 100%
  font-size 18px
  text-align center
.el-table-filter__checkbox-group
  overflow-y auto
  max-height 300px
.avatar-container
  display inline-block
  margin-right 10px
  img
    max-width 32px
    height 29px
    vertical-align middle
    border-radius 4px
</style>
