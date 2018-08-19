<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  el-form(label-width="90px", label-position="left")
    el-form-item(label="Выработка по данным учетчика")
      el-input-number(v-model="form.areaByCounter", :min="0", :step="0.01")
    el-form-item(label="Причина изменения")
      el-input(v-model="form.explanatory")
    el-button(type="primary", @click="formPut") Сохранить
</template>

<script>
import {EventBus} from "services/EventBus";
import http from "services/http"

export default {
  props: {
    "form": {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      loading: true,
      endpoint: "assignmentsdailyreportitems/"
    }
  },
  created() {
    this.loading = false
  },
  methods: {
    formPut(){
      let endpoint = this.endpoint + this.$root.context.organization;
      let data = {
        id: this.form.id,
        areaByCounter: this.form.areaByCounter,
        explanatory: this.form.explanatory,
      }
      this.loading = true
      http.put(endpoint, data).then(() => {
        EventBus.$emit("AssignmentsDailyReportItemsChanged");
        this.loading = false
      })
    },
  }
}
</script>
