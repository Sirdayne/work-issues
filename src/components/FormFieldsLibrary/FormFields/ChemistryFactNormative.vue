<template lang="pug">
  el-form-item(:label="label")
    el-input-number(v-model="model.factNormative" :step="0.01")
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
        label: 'Фактическая норма ' + (this.propModel.chemicalPreparationName ? this.propModel.chemicalPreparationName : "")
      }
    },
    watch: {
      'model.factNormative'(value) {
        this.handleModelChange(this.model);
      }
    },
    methods: {
      init() {
        switch (this.currentPage) {
          case 'ChemistryLimitFact': this.modelName = 'factNormative';
        }
      },
      handleChange(model) {
        this.emitEvents(model);
        this.updateModel({key: this.modelName, value: model});
      },
      emitEvents(model) {
        EventBus.$emit(this.currentPage + '.UpdateComponent.FactNormativeFieldChanged', model);
      }
    }
  }
</script>
