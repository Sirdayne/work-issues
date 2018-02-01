<template lang="pug">
  el-form-item(label="Сорт")
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
        entityName: 'sorts',
        formFieldName: 'CultureSorts',
        modelName: 'cultureSortId',
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      }
    },
    methods: {
      handleChange(model) {
        EventBus.$emit('SeedLimits.UpdateComponent.CultureSortFieldChanged', model);
        this.updateModel({key: this.modelName, value: model})
      },
    }
  }
</script>

<style>

</style>
