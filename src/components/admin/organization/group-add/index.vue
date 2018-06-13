<template lang="pug">
div
  h2 {{header}}
  el-form(
    :model="form",
    :rules="rules",
    ref="ruleForm",
    label-width="180px",
    v-loading="loading",
  )
    el-form-item.form-item(label="Наименование", prop="name", auto-complete="off")
      el-input(v-model="form.name")
    el-form-item.form-item(label="Описание", prop="description", auto-complete="off")
      el-input(v-model="form.description")
    el-form-item.form-item(label="Адрес", prop="address", auto-complete="off")
      el-input(v-model="form.address")
    el-form-item.form-item(label="Контакты", prop="contacts", auto-complete="off")
      el-input(v-model="form.contacts")
    el-form-item.form-item(label="Номер контракта", prop="contractNumber", auto-complete="off")
      el-input(v-model="form.contractNumber")
    el-form-item.form-item(label="Юр. информация", prop="jurInfo", auto-complete="off")
      el-input(v-model="form.jurInfo")
    el-form-item
      el-button(type="primary" @click="submitForm('ruleForm')") {{submitBtn}}
      el-button(@click="resetForm('ruleForm')") Очистить
</template>
<script>
import http from 'lib/httpQueryV2';

export default {
  data() {
    return {
      form: {
        name: '',
        description: '',
        address: '',
        contacts: '',
        contractNumber: '',
        jurInfo: '',
      },
      rules: {
        name: [
          { required: true, message: 'пожалуйста введите наименование', trigger: 'blur' },
        ],
        contacts: [
          { required: true, message: 'пожалуйста введите контакты', trigger: 'blur' },
        ],
        contractNumber: [
          { required: true, message: 'пожалуйста введите номер контракта', trigger: 'blur' },
        ],
        jurInfo: [
          { required: true, message: 'пожалуйста введите юр. информацию', trigger: 'blur' },
        ],
      },
      loading: false,
      mode: "create",
      submitBtn: "Создать",
      header: "Добавить группу компаний",
      org: {},
    }
  },
  created() {
    if (this.$route.params.id !== undefined) {
      this.mode = "edit"
      this.submitBtn = "Редактировать"
      this.header = "Редактировать группу компаний"
      let orgId = +this.$route.params.id
      this.getOrgById(orgId)
    }
  },
  methods: {
    getOrgById(orgId) {
      this.loading = true
      http.getWithoutCache("organizationsgroup")
        .then(data => {
          this.org = data.find(d => d.id == orgId)
          Object.keys(this.form).forEach(key => {
            this.form[key] = this.org[key]
          })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (confirm(`${this.header}?`)) {
            (this.mode == "create") ? this.addOrg() : this.editOrg()
          } else {
            return false;
          }
        } else {
          alert('Заполните все поля');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    addOrg() {
      let body = this.form
      http.post("organizationsgroup", body)
        .then(data => {
          this.$router.push(this.$route.path.replace("/group-add", "/group-list"));
        })
    },
    editOrg() {
      Object.keys(this.form).forEach(key => {
        this.org[key] = this.form[key]
      })
      let body = this.org
      http.put("organizationsgroup", body)
        .then(data => {
          this.$router.push(this.$route.path.replace(/\/group-add.*/, "/group-list"));
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
