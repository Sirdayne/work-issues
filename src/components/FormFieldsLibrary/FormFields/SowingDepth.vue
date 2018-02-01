<template lang="pug">
  el-form-item(label="Глубина посева", v-if="isVisible")
    el-slider(v-model="model", :min="min", :max="max", show-input)
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    props: ['propMin', 'propMax'],
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        min: this.propMin,
        max: this.propMax,
        dependencies: {
          seedlimits: {
            seedlimitId: null,
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
      init() {
        switch (this.currentPage) {
          case 'Assignments': this.modelName = 'depth';
                              if (this.mode === 'Update') {
                                this.isVisible  = !!this.getPlanWorkTypeIsSowing(this.editable.subOperationId);
                              } else if (this.mode === 'Create') {
                                this.handleModelChange(this.model);
                              }
                              break;
        }
      },
      handleChange(model) {
        this.updateModel({key: this.modelName, value: model});
      },
      initEvents() {
        EventBus.$on('Assignments.' + this.mode + 'Component.SeedLimitFieldChanged', (seedLimitId) => {
          const cultureDepths = this.getMinMaxOfSowingDepths(seedLimitId);
          this.min    = cultureDepths.minDepth;
          this.max    = cultureDepths.maxDepth;
          this.model  = this.mode === 'Update' ? this.editable.depth : this.max;
        });
        EventBus.$on('Assignments.' + this.mode + 'Component.WorkFieldChanged', (workId) => {
          this.isVisible = !!this.getPlanWorkTypeIsSowing(workId);
        });
      }
    }
  }
</script>

<style>

</style>
