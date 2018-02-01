<template lang="pug">
  el-form-item(:label="label", v-if="isVisible")
    el-select(v-model="model", multiple, filterable)
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
        label: this.propLabel ? this.propLabel : 'Поля',
        dependencies: {
          works: {
            assignmentType: null,
          }
        }
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
        console.log(value, 'val')
      }
    },
    methods: {
      handleChange(model) {
        EventBus.$emit('SeedLimits.' + this.mode + 'Component.FieldFieldChanged', model);
        console.log(model, 'mod')
        this.updateModel({key: this.modelName, value: model});
      },
      init() {
        switch (this.currentPage) {
          case 'Assignments': this.initOnAssignmentsPage(); break;
          case 'Transportation': this.initOnTransportationPage(); break;
        }
      },
      initOnAssignmentsPage() {
        if (this.mode === 'Update') {
          let workId      = this.editable.subOperationId;
          this.isVisible  = this.getAssignmentTypeId(workId) != 1;
        }

        this.modelName  = 'fieldId';
        this.model      = this.isVisible ? this.model : [];
      },
      initOnTransportationPage() {
//        this.modelName = 'destinationFieldId';
//        this.label = 'Куда';
//
//        if (this.currentPage === 'SeedLimits') {
//          this.modelName = 'fieldId'
//        }
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
          this.model      = [];
        } else {
          this.isVisible  = true;
        }
      },
      updateStateOnTransportationPage() {
        switch (this.currentPage) {
          case 'FromFieldAssignment': this.label = 'Откуда';
                                      break;
                                      this.modelName = 'originFieldId'; break;
          case 'ToFieldAssignment'  : this.label = 'Куда';
                                      this.modelName = 'destinationFieldId'; break;

        }
      }
    }
  }
</script>

<style>

</style>
