<template lang="pug">
  el-form-item(label="Фактическая площадь")
    el-slider(v-model="model", :max="max", show-input)
</template>

<script>
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';
  export default {
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        formFieldName: 'FactArea',
        modelName: 'factArea',
        max: null,
      }
    },
    methods: {
      init() {
        this.max = this.calculateMaxFactArea(this.editable.seedLimitId);
      }
    }

  }
</script>

<style>

</style>
