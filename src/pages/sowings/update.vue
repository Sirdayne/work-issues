<template lang="pug">
el-form(label-width="180px")
  el-form-item(label="Год")
    el-input(v-model="form.year")
  el-form-item(label="Поле:")
    el-select(v-model="form.fieldId", clearable, filterable)
      el-option(
        v-for="item in fields",
        :label="item.newName",
        :value="item.id",
        :key="item.id",
      )
  el-form-item(label="Культура:")
    el-select(v-model="form.cultureId", clearable, filterable)
      el-option(
        v-for="item in cultures",
        :label="item.name",
        :value="item.id",
        :key="item.id",
      )
  el-form-item(label="Площадь")
    el-input(v-model="form.area")
  el-form-item(label="Урожайность")
    el-input(v-model="form.yield")
  el-form-item(label="Сорт:")
    el-select(v-model="form.cultureSortId", clearable, filterable)
      el-option(
      v-for="item in sorts",
      :label="item.name",
      :value="item.id",
      :key="item.id",
      )
  el-form-item(label="Репродукция:")
    el-select(v-model="form.reproductionId", clearable, filterable)
      el-option(
      v-for="item in reproductions",
      :label="item.name",
      :value="item.id",
      :key="item.id",
      )
  el-form-item(label="Конечный продукт:")
    el-select(v-model="form.cultureParameterId", clearable, filterable)
      el-option(
      v-for="item in cultureparameters",
      :label="item.name",
      :value="item.id",
      :key="item.id",
      )
  el-form-item(label="Норма высева")
    el-input(v-model="form.sowingNormative")

  el-form-item
    el-button(type="primary", @click="formPut") Сохранить

</template>

<script>
  import http from 'lib/httpQueryV2'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import {EventBus} from 'services/EventBus'

  export default {
    props: [
      'form',
      'id',
      'sowings',
      'fields',
      'cultures',
      'sorts',
      'reproductions',
      'cultureparameters',
      'croprotations',
    ],
    mixins: [
      RecordsLoaderV2,
      ListController,
    ],
    data() {
      return {
        endpoint: `sowings/${this.$root.context.organization}`,
      }
    },
    methods: {
      formPut(){
        let endpoint = this.endpoint;
        let data = Object.assign({}, this.form)
        data.id = this.id
        data.budgetId = this.$root.context.budget
        http.put(endpoint, data).then(() => {
          EventBus.$emit("SowingsChanged")
        });
      },
    }
  }

</script>

<style scoped>
.car-image{
  max-height: 150px;
  max-width: 150px;
}
.el-dialog__body .el-input{
  max-width: 217px;
}
</style>