<template lang="pug">
  el-form-item(label="Машина", v-if="isVisible")
    el-select(v-model="model", filterable)
      el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.displayString")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    props: ['propModel', 'propIterable', 'propVisible'],
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        dependencies: {
          works: {
            workId: null,
            planWorkTypeId: null,
            assignmentType: null
          },
          organizations: {
            id: this.$store.getters.getOrganizationId,
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
          case 'Assignments': if (this.mode === 'Update') {
                                this.dependencies.works.workId = this.editable.subOperationId;
                              } else if (this.mode === 'Create') {
                                this.dependencies.works.workId = this.creatable.subOperationId;
                              }
                              this.modelName = 'carId';
                              break;

          case 'Transportation': this.modelName = 'carId'; break;
        }
      },
      handleChange(model) {
        EventBus.$emit(this.currentPage + '.' + this.mode + 'Component.CarFieldChanged', model);
        this.updateModel({key: this.modelName, value: model});
      },
      initEvents() {
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.WorkFieldChanged', (workId) => {
          this.dependencies.works.workId = workId;
          this.refreshModel();
          this.updateState();
        });
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
        if (this.dependencies.works.workId) {
          switch (this.dependencies.organizationToggler.state) {
            case true :   this.iterable = this.getCarsFilteredByWorks(this.dependencies.works.workId);
                          break;

            case false:   this.iterable = this.getCarsFilteredByWorksAndOrganization(this.dependencies.works.workId, this.dependencies.organizations.id);
                          break;

            case null :   this.iterable = this.getCarsFilteredByWorks(this.dependencies.works.workId);
                          break;
          }
        }
      }
    }
  }
</script>

<style>

</style>
