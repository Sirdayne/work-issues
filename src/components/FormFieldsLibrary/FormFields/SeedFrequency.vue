<template lang="pug">
  el-form-item(label="Чистота семян")
    el-input(v-model="model", style="width: 217px",filterable)
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
        formFieldName: 'SeedFrequency',
        modelName: 'seedFrequency',
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      }
    },
    methods: {
      handleChange(model) {
        this.updateModel({key: this.modelName, value: model})
      },
    }
  }
</script>

<style>

</style>
