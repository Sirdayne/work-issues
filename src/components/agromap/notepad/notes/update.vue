<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  el-form(label-width="170px", label-position="left")
    el-form-item(label="Текст")
      el-input(type="textarea", :rows="5", v-model="form.text", placeholder="Редактируемая заметка", style="max-width: 500px")
    el-form-item(label="Ответственный")
      el-select(v-model="form.responsibleUserId", clearable, filterable)
        el-option(
          v-for="u in users",
          :key="u.id",
          :label="u.fullName",
          :value="u.id"
        )
    el-form-item(label="Срок")
      el-date-picker(
        v-model="form.date",
        type="date",
        placeholder="Выберите срок",
        format="dd-MM-yyyy"
      )
    el-form-item
      el-button(type="primary", :loading="loading", @click="formPut") Сохранить

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'
  import nprogress from 'lib/NProgress'
  import { Message } from 'element-ui'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController,
    ],
    props: ['form'],
    data() {
      return {
        users: [],
        loading: true,
        endpoint: 'Notes/',
      }
    },
    created() {
      this.fetchEntities([
        'users',
      ], this.afterFetch );
    },
    computed: {

    },
    methods: {
      afterFetch(){
        this.users = this.fromVuex('users')
        this.loading = false
      },
      formPut(){
        let endpoint = this.endpoint + this.$root.context.organization;
        if (this.form.date && typeof this.form.date !== 'string'){
          this.form.date = moment(this.form.date, 'YYYY-MM-DD').format("YYYY-MM-DDTHH:mm:ss")
        }
        this.loading = true
        http.put(endpoint, this.form).then(() => {
          this.loading = false
          EventBus.$emit("notesChanged")
        });
      },
    }
  }

</script>

<style>

</style>
