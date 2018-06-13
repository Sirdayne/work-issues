<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Анкета ВПР
  .j-container
    .j-row
      span Дата:
      p {{ form.formatDate }}
    .j-row
      span Текст:
      p {{ form.text }}
    .j-row
      span Автор:
      p {{ form.authorFullName }}
    .j-row
      span Ответственный:
      p {{ form.responsibleUserFullName }}
</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    props: ['form'],
    data() {
      return {
        loading: true,
      }
    },
    created() {
      this.form.formatDate = moment(this.form.date, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm:ss DD/MM/YYYY')
      this.loading = false
    },
    computed: {

    },
    methods: {

    }
  }

</script>

<style>

</style>
