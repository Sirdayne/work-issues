<template lang="pug">
  el-form-item(label="Репродукция")
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
        entityName: 'reproductions',
        formFieldName: 'Reproductions',
        modelName: 'reproductionId',
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      }
    },
    methods: {
      handleChange(model) {
        EventBus.$emit('SeedLimits.UpdateComponent.ReproductionFieldChanged', model);
        this.updateModel({key: this.modelName, value: model})
      },
    }
  }
</script>

<style>

</style>
