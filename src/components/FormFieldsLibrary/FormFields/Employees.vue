<template lang="pug">
  el-form-item(label="Водитель")
    el-select(v-model="model", filterable)
      el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.fullName")
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
        dependencies: {
          organizations: {
            id: this.$store.getters.getOrganizationId
          },
          organizationToggler: {
            state: null,
          }
        }
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      }
    },
    methods: {
      init() {
        switch (this.currentPage) {
          case 'Assignments': this.modelName = 'employeeId'; break;
          case 'Transportation': this.modelName = 'employeeId'; break;
        }
      },
      handleChange(model) {
        this.updateModel({key: this.modelName, value: model});
      },
      initEvents() {
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.OrganizationTogglerFieldChanged', (state) => {
          this.dependencies.organizationToggler.state = state;
          this.updateState();
        });
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.OrganizationFieldChanged', (organizationId) => {
          this.dependencies.organizations.id = organizationId;
          this.refreshModel();
          this.updateState();
        });
      },
      updateState() {
        this.iterable = this.getEmployeesFilteredByOrganization(this.dependencies.organizations.id);
      }
    }
  }
</script>

<style>

</style>
