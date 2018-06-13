<template lang="pug">
div
  el-button(type="primary", @click="formDelete") Да
  el-button(type="error", @click="closeDialogs") Отмена

</template>

<script>
  import http from 'lib/httpQueryV2'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import {EventBus} from 'services/EventBus'
  import nprogress from 'lib/NProgress'

  export default {
    props: ['id', 'endpoint'],
    mixins: [
      RecordsLoaderV2,
      ListController,
    ],
    methods: {
      formDelete(){
        nprogress.start()
        http.delete(this.endpoint, this.id).then(() => {
          EventBus.$emit("checklistChanged")
          nprogress.done()
        });
      },
      closeDialogs() {
        EventBus.$emit("checklistDialogsClose")
      }
    }
  }

</script>