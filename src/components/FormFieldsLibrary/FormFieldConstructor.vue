<template lang="pug">
  el-form(label-width="90px")
    template(v-for="f in fields")
      component(:is="f")
</template>

<script>
  import { EventBus } from 'services/EventBus';

  export default {
    dependencies: ['FormFields'],
    data() {
      return {
        fields: [],
      }
    },
    created() {
      this.fields = this.FormFields.get(this.$store.getters.getFormFields.map(f => f.formFieldName));

    }
  }
</script>

<style>

</style>
