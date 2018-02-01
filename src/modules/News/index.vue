<template lang="pug">
el-card(v-loading="!news"): template(v-if="news")
  h2 Уведомления, новости и ответы на сообщения
  ul: li.record(v-for="record in news") {{showDate(record.dateModified)}} {{record.message}}
</template>

<script>
import modelNews from '_models/News'
import datasets from 'mixins/datasets'
import {EventBus} from 'services/EventBus'

export default {
  created() {
    this.init()
  },
  data() {
    return {
      news: null,
      env: process.env
    }
  },
  mixins: [
    datasets
  ],
  methods: {
    init() {
      this.getEntity(modelNews, (isFinished, r) => {
        this.news = r
        let getMilliseconds = time => new Date(time.dateModified).getTime()
        this.news.sort((a, b) => getMilliseconds(b) - getMilliseconds(a))
        localStorage.setItem('lastUnread', this.news[0].guid)
      }, true)
      this.$root.newsCount = 0
    },
    onContextChange() {
      this.init()
    },
    showDate(date) {
      const monthes = ['', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
      date = date.split('T')[0].split('-')
      return `${date[2]*1} ${monthes[date[1]*1]} ${date[0]}`
    }
  }
}
</script>

<style lang="stylus" scoped>
.record
  padding-bottom 20px
</style>
