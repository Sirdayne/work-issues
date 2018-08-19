<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")

  h2 Добавить заметку

  el-form(label-width="170px", label-position="left")
    el-form-item(label="Текст")
      el-input(type="textarea", :rows="5", v-model="form.text", placeholder="Новая заметка", style="max-width: 500px")
    el-form-item(label="Отвественный")
      el-select(v-model="form.responsibleUserId", clearable, filterable)
        el-option(
          v-for="u in users",
          :key="u.id",
          :label="u.fullName",
          :value="u.id"
        )
    el-form-item(label="Срок")
      el-date-picker(
        v-model="form.date"
        type="date"
        placeholder="Выберите срок"
      )
    el-button(type="primary", :loading="loading", @click="formPost") Создать

</template>

<script>
import http from "services/http"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"

export default {
  mixins: [

    ListController
  ],
  data() {
    return {
      form: {
        date: null,
        text: null,
        responsibleUserId: null,
      },
      deBounce: 1200,
      loading: true,
      users: [],
      endpoint: "Notes/",
    }
  },
  created() {
    fetchEntities([
      "users",
    ], this.afterFetch );
    //      let path = "/Account/Users/" + this.$root.context.organization
    //      http.get(path).then(r => { this.users = r })
  },
  methods: {
    afterFetch(){
      this.users = fromVuex("users")
      this.loading = false
    },
    refresh() {
      this.nullForm()
      fetchEntities([
        "users",
      ], this.afterFetch);
      this.loading = true
    },
    formPost(){
      this.loading = true
      let endpoint = this.endpoint + this.$root.context.organization;
      if (this.form.date){
        this.form.date = moment(this.form.date, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ss")
      }
      let data = {
        date: this.form.date,
        fieldId: this.$root.context.field,
        text: this.form.text,
        responsibleUserId: this.form.responsibleUserId,
      };
      http.post(endpoint, data).then(() => {
        this.refresh();
      });
    },
    nullForm(){
      for (let item in this.form){
        this.form[item] = null
      }
    },
  }
}

</script>

<style>
  .tableHeading {
    display: inline-block;
    margin-right: 20px;
  }

  .downloadLzkStyle {
    display: block;
    margin-top: 20px;
  }

  .downloadFieldSelect {
    width: 250px;
  }

</style>
