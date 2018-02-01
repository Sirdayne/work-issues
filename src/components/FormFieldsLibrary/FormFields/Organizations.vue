<template lang="pug">
  el-form-item(label="Организация", v-if="isVisible")
    el-select(v-model="model", filterable)
      el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.name")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    mixins: [
      FormFieldsMixin
    ],
    watch: {
      model(value) {
        this.handleChange(value);
      }
    },
    methods: {
      handleChange(model) {
        this.emitEvents(model);
        this.$store.dispatch('actionSetOrganizationId', model);
      },
      initEvents() {
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.OrganizationTogglerFieldChanged', (state) => {
          this.isVisible = !state;
        });
      },
      emitEvents(model) {
        EventBus.$emit(this.currentPage + '.' + this.mode + 'Component.OrganizationFieldChanged', model);
      }
    }
  }
</script>

<style>

</style>
