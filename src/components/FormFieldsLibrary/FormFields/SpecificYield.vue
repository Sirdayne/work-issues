<template lang="pug">
  el-form-item(label="Видовая урожайность", v-if="isVisible")
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
        max: 100,
        dependencies: {
          works: {
            planWorkTypeId: null
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
        this.modelName = 'specificYield';
      },
      initEvents() {
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.WorkFieldChanged', (workId) => {
          let planWorkTypeId = this.getPlanWorkTypeIdByWorkId(workId);
          let cleaningWorks = this.getWorkTypesIdsByConditionType(2);
          let isCleaningWork = cleaningWorks.indexOf(planWorkTypeId) > -1;
          this.isVisible = isCleaningWork
        });
      }
    }
  }
</script>

<style>

</style>
