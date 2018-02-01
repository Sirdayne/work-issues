<template lang="pug">
  el-form-item(label="Работа", v-if="isVisible")
    el-select(v-model="model", filterable)
      el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.name")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    mixins: [
      FormFieldsMixin,
    ],
    data() {
      return {
        assignmentType: null,
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value)
      }
    },
    methods: {
      init() {
        switch (this.currentPage) {
          case 'Assignments': this.modelName = 'subOperationId'; break;
          case 'Transportation': this.modelName = 'subOperationId'; break;
          default: this.modelName = 'workTypeParameterPlanWorkTypeId'; break;
        }
      },
      handleChange(model) {
        this.emitEvents(model);
        this.updateModel({key: this.modelName, value: model});

        switch (this.currentPage) {
          case 'Transportation': this.updateCreatable({key: 'assignmentType', value: this.assignmentType}); break;
        }
      },
      emitEvents(model) {
        EventBus.$emit(this.currentPage + '.' + this.mode + 'Component.WorkFieldChanged', model);
        let assignmentType = this.getAssignmentTypeId(model);

        if (assignmentType !== this.assignmentType) {
          this.assignmentType = assignmentType;
          EventBus.$emit(this.currentPage + '.' + this.mode + 'Component.AssignmentTypeChanged', this.assignmentType);
        }
      }
    }
  }
</script>

<style>

</style>
