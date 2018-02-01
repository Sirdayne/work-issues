<template lang="pug">
  el-form-item(v-if="isVisible")
    el-checkbox(v-model="model", class="organizationToggler") {{ label }}
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        label: this.propLabel ? this.propLabel : 'Свои'
      }
    },
    watch: {
      model(value) {
        this.handleChange(value);
      }
    },
    methods: {
      handleChange(model) {
        this.emitEvents(model);
      },
      emitEvents(model) {
        EventBus.$emit(this.currentPage + '.' + this.mode + 'Component.OrganizationTogglerFieldChanged', model);
      }
    }
  }
</script>

<style>

</style>
