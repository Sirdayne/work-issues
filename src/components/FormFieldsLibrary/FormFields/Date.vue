<template lang="pug">
  el-form-item(label="Дата")
    el-date-picker(
      v-model="model",
      placeholder="Выберите время",
      format="dd.MM.yyyy",
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
        formFieldName: 'Date',
        modelName: 'date'
      }
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      }
    },
    methods: {
      handleChange(model) {
        const updateDate = moment(model).format("YYYY-MM-DDTHH:mm:ss");
        this.updateModel({key: this.modelName, value: updateDate});
      }
    }
  }
</script>
