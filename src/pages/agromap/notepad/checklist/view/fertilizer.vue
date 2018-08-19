<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  h2 Чек-лист Удобрения
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
import ListController from "mixins/ListController"
import moment from "moment"

export default {
  mixins: [
    ListController
  ],
  props: {
    "form": {
      type: Object,
      default: {},
    }
  },
  data() {
    return {
      loading: true,
    }
  },
  created() {
    this.form.formatDate = moment(this.form.date, "YYYY-MM-DDTHH:mm:ss").format("HH:mm:ss DD/MM/YYYY")
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
