<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  el-form(label-width="90px", label-position="left")
    el-form-item(label="Дата")
      el-date-picker(v-model="form.inspectionDate")

    el-form-item(v-for="(item, index) in form.chemistryLimitWeedTypes", :label="item.weedTypeName", :key="index")
      el-input-number(v-model="item.weedAmountEdited")
    el-button(type="primary", @click="formPut") Сохранить
</template>

<script>
import { EventBus } from 'services/EventBus';
import http from 'lib/httpQueryV2'

export default {
  props: ['form'],
  data() {
    return {
      loading: true,
      endpoint: 'fieldweediness/'
    }
  },
  created() {
    this.loading = false
  },
  methods: {
    formPut(){
      let endpoint = this.endpoint + this.$root.context.organization;
      this.loading = true
      http.put(endpoint, this.form).then(() => {
        EventBus.$emit('FieldWeedinessChanged');
        this.loading = false
      }).catch((error) => {
        this.loading = false
      })
    },
  }
}
</script>
