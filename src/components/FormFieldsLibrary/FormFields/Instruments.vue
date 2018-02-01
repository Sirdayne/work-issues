<template lang="pug">
  el-form-item(label="Орудие", v-if="isVisible")
    el-select(v-model="model", filterable)
      el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.displayString")
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
          works: {
            workId: null,
            planWorkTypeId: null,
            assignmentType: null
          },
          cars: {
            carId: null,
            carModelId: null
          },
          organizationToggler: {
            state: null,
          },
          organizations: {
            id: this.$store.getters.getOrganizationId,
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
      handleChange(model) {
        this.updateModel({key: this.modelName, value: model});
      },
      init() {
        switch (this.currentPage) {
          case 'Assignments': if (this.mode === 'Update') {
                                this.dependencies.works.workId = this.editable.subOperationId;
                              } else if (this.mode === 'Create') {
                                this.dependencies.works.workId = this.creatable.subOperationId;
                              }
                              this.modelName = 'instrumentId';
                              break;

          case 'Transportation': this.modelName = 'instrumentId'; break;
        }
      },
      initEvents() {
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.WorkFieldChanged', (workId) => {
          this.dependencies.works.workId = workId;
          this.refreshModel();
          this.updateState();
        });
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.CarFieldChanged', (carId) => {
          this.dependencies.cars.carId = carId;
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
        if (this.dependencies.works.workId && this.dependencies.cars.carId) {
          this.iterable = this.getInstrumentsFilteredByWorksAndCars(this.dependencies.works.workId, this.dependencies.cars.carId);
        }
      }
    }
  }
</script>

<style>

</style>
