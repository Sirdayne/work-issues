<template lang="pug">
.field-container(v-loading="loading", element-loading-text="Загружается...")
  h2 Севоборот
  sevoborot(:fieldClickedId="fieldId", :wide="true")

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import moment from 'moment'
  import ListController from 'mixins/ListController'
  import sevoborot from "components/panelbottom/sevoborot"

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    components: {
      sevoborot,
    },
    data() {
      return {
        loading: true,
      }
    },
    computed: {
      fieldId() {
        let fieldId = this.$root.context.field
        if (fieldId){
          return fieldId
        }
        return null
      },
    },
    created() {
      this.fields = this.$root.fields
      this.loading = false
    },
    methods: {

    }
  }

</script>

<style scoped>
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

<style lang="stylus" scoped>

.field-container span
  font-weight 100

#chart
  display block

</style>
