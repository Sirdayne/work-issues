<template lang="pug">
    dialog-window(:params="dialogWindowParams")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import DialogWindow from './FormFields/DialogWindow.vue';

  export default {
    components: {
      DialogWindow
    },
    data() {
      return {
        dialogWindowParams: {
          visible: false,
          title: 'Редактирование',
          size: 'tiny',
          closeOnClickModal: false,
          beforeClose: () => {
            this.$store.dispatch('actionSetCurrentPage', null);
          },
        },
      }
    },
  }
</script>

<style>

</style>
