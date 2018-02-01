<template lang="pug">
  el-form-item(:label="label")
    el-input-number(v-model="model.weedAmountEdited" :step="1")
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
        label: '' + (this.propModel.weedTypeName ? this.propModel.weedTypeName : "")
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
          case 'FieldWeediness': this.modelName = 'weedAmountEdited';
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
