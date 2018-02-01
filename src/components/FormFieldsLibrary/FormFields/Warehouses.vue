<template lang="pug">
  el-form-item(:label="label", v-if="isVisible")
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
    data() {
      return {
        label: this.propLabel ? this.propLabel : 'Склад'
      }
    },
    watch: {
      model(value) {
        this.handleChange(value);
      }
    },
    methods: {
      handleChange(model) {
        this.updateModel({key: this.modelName, value: model});
      },
      init() {
        switch (this.currentPage)  {
          case 'Transportation': this.initOnTransportationPage();
        }
      },
      initOnTransportationPage() {
        this.modelName = 'originWarehouseId';
        this.label = 'Откуда';
      },
      initEvents() {
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.AssignmentTypeChanged', (assignmentType) => {
          this.assignmentType = assignmentType !== this.assignmentType ? assignmentType : this.assignmentType;
          this.updateState();
        });
      },
      updateState() {
        switch (this.currentPage) {
          case 'Assignments': this.updateStateOnAssignmentsPage(); break;
          case 'Transportation': this.updateStateOnTransportationPage(); break;
        }
      },
      updateStateOnAssignmentsPage() {
        if (this.assignmentType == 1) {
          this.isVisible  = false;
          this.model      = null;
        } else {
          this.isVisible  = true;
        }
      },
      updateStateOnTransportationPage() {
        switch (this.assignmentType) {
          case 4: this.label = 'Куда';
                                      this.modelName = 'destinationWarehouseId'; break;
          case 3: this.label = 'Откуда';
                                      this.modelName = 'originWarehouseId'; break;
        }
      }
    }
  }
</script>

<style>

</style>
