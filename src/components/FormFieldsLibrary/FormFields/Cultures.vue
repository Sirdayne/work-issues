<template lang="pug">
  el-form-item(label="Культура")
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
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      }
    },
    methods: {
      init() {
        switch (this.currentPage) {
          case 'SeedLimits': this.modelName = 'cultureId'; break;
        }
      },
      handleChange(model) {
        EventBus.$emit('SeedLimits.UpdateComponent.CultureFieldChanged', model);
        this.updateModel({key: this.modelName, value: model});
      },
    }
  }
</script>

<style>

</style>
