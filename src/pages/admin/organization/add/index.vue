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
    el-form-item.form-item(label="Сокращенное наименование", prop="shortName", auto-complete="off")
      el-input(v-model="form.shortName")
    el-form-item.form-item-iterable(label="Тип организации", prop="organizationType")
      el-select(v-model.number="form.organizationType", filterable, clearable)
        el-option(v-for="o in organizationtype", :key="o.id", :label="o.name", :value="o.id")
    el-form-item.form-item-iterable(label="Группа компаний", prop="organizationsGroupId")
      el-select(v-model.number="form.organizationsGroupId", filterable, clearable)
        el-option(v-for="o in organizationsgroup", :key="o.id", :label="o.name", :value="o.id")
    el-form-item
      el-button(type="primary" @click="submitForm('ruleForm')") {{submitBtn}}
      el-button(@click="resetForm('ruleForm')") Очистить
</template>
<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"

export default {
  mixins: [
    
  ],
  data() {
    return {
      form: {
        name: "",
        shortName: "",
        organizationType: null,
        organizationsGroupId: null,
      },
      rules: {
        name: [{required: true, message: "пожалуйста введите наименование", trigger: "blur"}],
        shortName: [{required: true, message: "пожалуйста введите сокращенное наименование", trigger: "blur"}],
        organizationType: [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
        organizationsGroupId: [{type: "number", required: true, message: "Выберите значение", trigger: "change"}],
      },
      loading: false,
      mode: "create",
      submitBtn: "Создать",
      header: "Добавить компанию",
      org: {},
      organizationtype: [],
      organizationsgroup: [],
    }
  },
  created() {
    fetchEntities([
      "organizationtype",
      "organizationsgroup",
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.organizationtype = fromVuex("organizationtype")
      this.organizationsgroup = fromVuex("organizationsgroup")
      if (this.$route.params.id !== undefined) {
        this.mode = "edit"
        this.submitBtn = "Редактировать"
        this.header = "Редактировать компанию"
        let orgId = +this.$route.params.id
        this.getOrgById(orgId)
      }
    },
    getOrgById(orgId) {
      this.loading = true
      http.getWithoutCache("organizations")
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
          alert("Заполните все поля");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    addOrg() {
      let body = this.form
      http.post("organizations", body)
        .then(data => {
          this.$router.push(this.$route.path.replace("/add", "/list"));
        })
    },
    editOrg() {
      Object.keys(this.form).forEach(key => {
        this.org[key] = this.form[key]
      })
      let body = this.org
      http.put("organizations", body)
        .then(data => {
          this.$router.push(this.$route.path.replace(/\/add.*/, "/list"));
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
