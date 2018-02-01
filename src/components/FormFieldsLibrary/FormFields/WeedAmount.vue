<template lang="pug">
  el-form-item(label="Количество сорняка")
    el-input-number(v-model="model", style="width: 217px")
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
        modelName: 'weedAmount',
        formFieldName: 'WeedAmount'
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
    }
  }
</script>

<style>

</style>
