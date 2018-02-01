<template lang="pug">
  el-form-item(:label="label")
    el-input-number(v-model="model", :step="0.01")
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
        label: 'Выработка по данным учетчика'
      }
    },
    watch: {
      'model'(value) {
        this.handleModelChange(this.model);
      }
    },
    methods: {
      init() {
        switch (this.currentPage) {
          case 'AssignmentsDailyReportItems': this.modelName = 'areaByCounter';
        }
      },
      handleChange(model) {
        this.emitEvents(model);
        this.updateModel({key: this.modelName, value: model});
      },
      emitEvents(model) {
        EventBus.$emit(this.currentPage + '.UpdateComponent.AssignmentsDailyReportItemsFieldChanged', model);
      }
    }
  }
</script>
