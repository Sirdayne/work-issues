<template lang="pug">
  el-form-item(label="Вид сорняков")
    el-select(v-model="model", multiple, filterable)
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
          case 'ChemistryLimits': this.modelName = 'weedTypesIds'; break;
        }
      },
      handleChange(model) {
          this.updateModel({key: this.modelName, value: model});
      },
    }
  }
</script>

<style>

</style>
