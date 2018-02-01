<template lang="pug">
  el-form-item(label="Норма млн/га", v-show="isVisible")
    el-slider(v-model="model", :min="min", :max="max", :step="0.05", show-input)
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
        model: this.propModel.model,
        min: this.propModel.min,
        max: this.propModel.max,
        dependencies: {
          fields: {
            fieldId: null
          },
          cultureFieldZones: {
            cultureId: null
          }
        },
        filteredFields: [],
        filteredCultureFieldZones: [],
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
          case 'SeedLimits': this.modelName = 'seedMillionNumber'; break;
        }
      },
      handleChange(model) {
        this.updateModel({key: this.modelName, value: model});
      },
      initEvents() {
        EventBus.$on('SeedLimits.UpdateComponent.FieldFieldChanged', (fieldId) => {
          this.dependencies.fields.fieldId = fieldId;
          this.filteredFields = this.getFilteredFields(fieldId);
          this.updateState();
        });
        EventBus.$on('SeedLimits.UpdateComponent.CultureFieldChanged', (cultureId) => {
          this.dependencies.cultureFieldZones.cultureId = cultureId;
          this.filteredCultureFieldZones = this.getFilteredCultureFieldZones(cultureId);
          this.updateState();
        });
      },
      updateState() {
        if (this.filteredFields.length && this.filteredCultureFieldZones.length) {
          const filtered = this.getCrossFilterFieldsAndCultureFieldZones(this.filteredFields, this.filteredCultureFieldZones);

          if (filtered.length) {
            this.isVisible = true;
            this.min = filtered[0].minNumber;
            this.max = filtered[0].maxNumber;
          } else {
            this.isVisible = false;
            this.min = null;
            this.max = null;
          }
        }
      }
    }
  }
</script>

<style>

</style>
