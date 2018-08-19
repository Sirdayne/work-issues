<template lang="pug">
div
  h2 Добавить пользователя
  el-form(
    :model="form",
    :rules="rules",
    ref="ruleForm",
    label-width="180px",
  )
    el-form-item.form-item(label="email", prop="email", auto-complete="off")
      el-input(v-model="form.email")
    el-form-item.form-item(label="пароль", prop="password")
      el-input(v-model="form.password", type="password", auto-complete="off")
    el-form-item.form-item(label="подтверждение пароля", prop="confirmpassword")
      el-input(v-model="form.confirmpassword", type="password", auto-complete="off")
    el-form-item.form-item(label="организации", prop="organizations")
      el-select(v-model="form.organizations", filterable, multiple)
        el-option(
          v-for="f in organizations",
          :label="f.name",
          :value="f.id",
          :key="f.id",
          )
    el-form-item
      el-button(type="primary" @click="submitForm('ruleForm')") Создать
      el-button(@click="resetForm('ruleForm')") Очистить
</template>
<script>
import http from "services/http";
import {fetchEntities, fromVuex} from "services/RecordsLoader";

export default {
  mixins: [
    
  ],
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("пожалуйста введите пароль"));
      } else if (value.length < 6 || value.length > 20) {
        callback(new Error("от 6 до 20 символов"));
      } else if (!(/[a-z0-9]/i).test(value)) {
        callback(new Error("должны содержаться только латинские буквы и цифры"));
      } else if (!(/[a-z]/).test(value)) {
        callback(new Error("должна содержаться хотя бы одна буква a-z"));
      } else if (!(/[A-Z]/).test(value)) {
        callback(new Error("должна содержаться хотя бы одна заглавная буква A-Z"));
      } else {
        if (this.form.password !== "") {
          this.$refs.ruleForm.validateField("confirmpassword");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("пожалуйста введите пароль снова"));
      } else if (value !== this.form.password) {
        callback(new Error("пароли разнятся"));
      } else {
        callback();
      }
    };
    var validateOrg = (rule, value, callback) => {
      if (!value.length) {
        callback(new Error("пожалуйста выберите организацию"));
      } else {
        callback();
      }
    };
    return {
      form: {
        email: "",
        password: "",
        confirmpassword: "",
        organizations: [],
      },
      rules: {
        email: [
          {required: true, message: "пожалуйста введите email", trigger: "blur"},
          {type: "email", message: "пожалуйста введите верный email", trigger: "blur, change"}
        ],
        password: [
          {required: true, validator: validatePass, trigger: "blur"},
        ],
        confirmpassword: [
          {required: true, validator: validatePass2, trigger: "blur"},
        ],
        organizations: [
          {required: true, validator: validateOrg, trigger: "blur, change"}
        ],
      }
    }
  },
  computed: {
    organizations() {
      return fromVuex("organizations")
    },
  },
  created() {
    fetchEntities([
      "organizations"
    ])
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (confirm("Добавить пользователя?")) {
            this.addUser()
          } else {
            return false;
          }
        } else {
          alert("Заполните все поля");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    addUser() {
      let body = this.form
      http.post("account/register", body)
        .then(data => {
        })
    }
  }
}
</script>
<style scoped lang="stylus">
.form-item {
  width: 497px;
  .el-select {
    width: 317px !important;
  }
}
</style>
