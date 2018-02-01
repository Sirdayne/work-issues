<template lang="pug">
  el-form-item(label="Площадь посева")
    el-slider(v-model="model", :max="max", show-input)
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
        min: null,
        max: null,
        dependencies: {
          fields: {
            fieldId: null
          }
        }
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
      init() {
        switch (this.currentPage) {
          case 'SeedLimits': this.modelName = 'area'; this.max = this.model; break;
        }
      },
      initEvents() {
        EventBus.$on('SeedLimits.UpdateComponent.FieldFieldChanged', (fieldId) => {
          const area = this.getAreaOfSeedLimitField(fieldId);
          this.model = area;
          this.max = area;
        });
      }
    }
  }
</script>

<style>

</style>
