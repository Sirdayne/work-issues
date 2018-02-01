<template lang="pug">
  el-form-item(label="Дата")
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
    data() {
      return {
        formFieldName: 'DateTime',
        modelName: 'date',
      }
    },
    watch: {
      model(value) {
        this.handleChange(value);
      }
    },
    methods: {
      handleChange(model) {
        this.changeHandler(() => {
          const updateDateTime = moment(model).format("MM.DD.YYYY HH:mm");
          this.preSave({mode: 'update', formField: {name: this.modelKey, value: updateDateTime}});
        });
      }
    }
  }
</script>

<style>

</style>
