<template lang="pug">
  el-dialog(:title="title", :visible.sync="visible", :size="size", :before-close="beforeClose", :close-on-click-modal="closeOnClickModal")
    form-field-constructor(v-if="visible")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldConstructor from 'components/FormFieldsLibrary/FormFieldConstructor.vue';

  export default {
    props: ['params'],
    components: {
      FormFieldConstructor,
    },
    computed: {
      title() {
        return this.params.title;
      },
      visible() {
        return this.$store.getters.getIsDialogWindowOpen;
      },
      size() {
        return this.params.size;
      },
      closeOnClickModal() {
        return this.params.closeOnClickModal;
      },
    },
    methods: {
      beforeClose(done) {
        if (this.params.beforeClose) this.params.beforeClose();
        this.$store.dispatch('actionCloseDialogWindow');
        this.$store.dispatch('actionSetDialogWindowMode', null);
        done();
      }
    },
  }
</script>

<style>

</style>
