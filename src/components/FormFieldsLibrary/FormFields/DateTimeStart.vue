<template lang="pug">
  el-form-item(label="Время начала")
    el-date-picker(
      v-model="model",
      type="datetime",
      placeholder="Выберите время",
      format="dd.MM.yyyy HH:mm:ss",
      style="width:217px",
      editable)
</template>

<script>
  import { EventBus } from 'services/EventBus'
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin'
  import moment from 'moment'

  export default {
    mixins: [
      FormFieldsMixin
    ],
    watch: {
      model(value) {
        this.handleModelChange(value);
      }
    },
    created() {
      EventBus.$on('AppYearChanged', (year) => {
        this.model = new Date(this.model.setFullYear(this.$root.context.year));
      });
    },
    methods: {
      init() {
        switch (this.currentPage) {
          case 'Assignments':     this.initOnAssignmentsPage();
                                  break;

          case 'Transportation':  this.initOnTransportationPage();
                                  break;
        }
      },
      initOnAssignmentsPage() {
        this.modelName = 'dateTimeRange';
        if (this.mode === 'Create') {
          this.handleModelChange(this.model);
        } else if (this.mode === 'Update') {
          this.model = moment(this.editable[this.modelName].start).format();
        }
      },
      initOnTransportationPage() {
        this.modelName = 'dateTimeRange';

        if (this.mode === 'Create') {
          this.handleModelChange(this.model);
        } else if (this.mode === 'Update') {
          this.model = moment(this.editable[this.modelName].start).format();
        }
      },
      handleChange(model) {
        this.emitEvents();
        switch (this.currentPage) {
          case 'Assignments'    : this.onAssignmentsPage(model); break;
          case 'Transportation' : this.onTransportationPage(model); break;
        }
      },
      emitEvents() {
        if (this.mode === 'Create') {
          EventBus.$emit(this.currentPage + '.CreateComponent.DateTimeStartFieldChanged', this.model);
        }
      },
      onAssignmentsPage(model) {
        const dateTimeRangeStart  = moment(model).format("MM.DD.YYYY HH:mm");
        const dateTimeRangeEnd    = this.handleDateTimeObjectInitialization('end');
        this.updateModel({key: this.modelName, value: {start: dateTimeRangeStart, end: dateTimeRangeEnd}});
      },
      onTransportationPage(model) {
        const dateTimeRangeStart  = moment(model).format("MM.DD.YYYY HH:mm");
        const dateTimeRangeEnd    = this.handleDateTimeObjectInitialization('end');
        this.updateModel({key: this.modelName, value: {start: dateTimeRangeStart, end: dateTimeRangeEnd}});
      }
    }
  }
</script>

<style>

</style>
