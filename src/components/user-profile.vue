<template lang="pug">
el-dialog.el-dialog--scrollable(:visible="visible", title="Профиль", size="tiny", top="50px", :before-close="handleClose")
  el-form(label-position="top")
    el-form-item(label="Аватар")
      avatar(:user="user")
    el-form-item(label="Логин")
      b {{user.userName}}
    el-form-item(label="ФИО")
      el-input(type="text", v-model="user.fullName")
    el-form-item(label="Организация")
      el-select.form-item-iterable(v-model="user.organizationId", placeholder="Организация", filterable)
        el-option(v-for="organization in organizations", :label="organization.name", :value="organization.id", :key="organization.id")
    el-form-item(label="Должность")
      el-input(type="text", v-model="user.position")
    el-form-item(label="Телефон")
      el-input(type="text", v-model="user.phoneNumber")
    el-form-item(label="Email")
      el-input(type="text", v-model="user.email")
    el-form-item
      span(@click="changePasswordVisible = !changePasswordVisible", :class="[changePasswordVisible ? 'dashGray' : 'dash']") Сменить пароль
  template(v-if="changePasswordVisible")
    el-form(label-position="top", :model="passwords", :rules="passwordFormRules", ref="passwordForm")
      el-form-item.form-item(label="Текущий пароль", prop="old")
        el-input(v-model="passwords.old", type="password")
      el-form-item.form-item(label="Новый пароль", prop="new")
        el-input(v-model="passwords.new", type="password")
      el-form-item.form-item(label="Подтверждение нового пароля", prop="confirm")
        el-input(v-model="passwords.confirm", type="password")
  el-button(type="primary", @click="submit()", :loading="loadingItem.save") Сохранить
</template>
<script>
import {fromVuex} from "services/RecordsLoader";
import Auth from "services/Auth"
import avatar from "components/avatar"
import {deepClone} from "lib/utils"

export default {
  name: "UserProfile",
  props: {
    "profileDialogVisible": {
      type: Boolean,
      default: false,
    },
    "userData": {
      type: Object,
      default: {},
    },
  },
  components: {
    avatar,
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("пожалуйста введите новый пароль"));
      } else if (value.length < 6 || value.length > 20) {
        callback(new Error("от 6 до 20 символов"));
      } else if (!(/[a-z0-9]/i).test(value)) {
        callback(new Error("должны содержаться только латинские буквы и цифры"));
      } else if (!(/[a-z]/).test(value)) {
        callback(new Error("должна содержаться хотя бы одна буква a-z"));
      } else if (!(/[A-Z]/).test(value)) {
        callback(new Error("должна содержаться хотя бы одна заглавная буква A-Z"));
      } else {
        if (this.passwords.new !== "") {
          this.$refs.passwordForm.validateField("confirm");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("пожалуйста введите новый пароль снова"));
      } else if (value !== this.passwords.new) {
        callback(new Error("новые пароли разнятся"));
      } else {
        callback();
      }
    };
    return {
      visible: false,
      organizations: [],
      user: {},
      changePasswordVisible: false,
      loadingItem: {
        save: false,
      },
      passwords: {
        old: "",
        new: "",
        confirm: "",
      },
      passwordFormRules: {
        old: [
          {required: true, message: "Введите текущий пароль", trigger: "blur"},
        ],
        new: [
          {required: true, validator: validatePass, trigger: "blur"},
        ],
        confirm: [
          {required: true, validator: validatePass2, trigger: "blur"},
        ],
      }
    }
  },
  watch: {
    ["profileDialogVisible"](val, oldVal) {
      this.visible = val
    },
    ["userData"](val, oldVal) {
      this.user = deepClone(val)
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.organizations = fromVuex("userorganizations");
      this.user = deepClone(this.userData)
      this.visible = this.profileDialogVisible
    },
    submit() {
      this.loadingItem.save = true
      if (this.isModified()) {
        this.saveProfile()
      } else {
        this.changePassword()
      }
    },
    isModified() {
      let keys = ["fullName", "organizationId", "position", "phoneNumber", "email"]
      return keys.some(key => {
        return this.user[key] !== this.userData[key]
      })
    },
    saveProfile() {
      Auth.saveProfile(this.user).then(() => {
        Auth.loadProfile().then(profile => {
          this.$emit("profile-loaded", profile)
          this.showMsg("Профиль обновлен")
          this.changePassword()
        })
      })
    },
    changePassword() {
      if (this.changePasswordVisible) {
        this.$refs["passwordForm"].validate((valid) => {
          if (valid) {
            Auth.changePassword(this.user.username, this.passwords)
              .then(() => {
                this.changePasswordVisible = false
                this.loadingItem.save = false
                this.reset()
                this.close()
                this.showMsg("Пароль обновлен")
              })
              .catch(error => {
                this.showMsg("Проверьте правильность паролей", "error")
                this.loadingItem.save = false
              })
          } else {
            this.loadingItem.save = false
          }
        })
      } else {
        this.loadingItem.save = false
        this.close()
      }
    },
    showMsg(msg, type = "success") {
      this.$message({message: msg, type: type, duration: 5000, showClose: false});
    },
    reset() {
      this.$refs["passwordForm"].resetFields();
    },
    close() {
      this.visible = false
      this.$emit("closed")
    },
    handleClose(done) {
      this.close()
      done()
    }
  }
}
</script>

<style lang="stylus" scoped>
.form-item-iterable {
  width: 100%;
}
</style>
