<template lang="pug">
  el-form-item(label="Машина", v-if="isVisible")
    el-select(v-model="model", filterable)
      el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.displayString")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    props: ['propModel', 'propIterable', 'propVisible'],
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {

//        entityName: 'cars',
//        formFieldName: 'Cars',
//        modelName: 'carId',
        dependencies: {
          works: {
            workId: null,
            planWorkTypeId: null,
            assignmentType: null
          }
        }
      }
    },
    watch: {
      model(value) {
        this.handleChange(value);
      }
    },
    methods: {
      handleChange(model) {
        EventBus.$emit('Assignments.UpdateComponent.CarFieldChanged', model);

        switch (this.currentPage) {
          case 'Assignments': this.updateEditable({key: 'carId', value: model});
        }
      },
      initEvents() {
        EventBus.$on('Assignments.UpdateComponent.WorkFieldChanged', (workId) => {
          this.dependencies.works.workId = workId;
          this.updateState();
        });
      },
      updateState() {
        this.refreshModel();
        this.iterable = this.getCarsFilteredByWorks(this.dependencies.works.workId);
      }
    }
  }
</script>

<style>

</style>
