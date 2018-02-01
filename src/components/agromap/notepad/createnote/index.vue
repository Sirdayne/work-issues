<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")

  h2 Создать заметку

  el-form(label-width="170px", label-position="left", v-if="ready")
    el-form-item(label="Текст")
      el-input(type="textarea", :rows="5", v-model="form.text", placeholder="Новая заметка", style="max-width: 500px")
    el-form-item(label="Отвественный")
      el-select(v-model="form.responsibleUserId", clearable, filterable)
        el-option(
          v-for="u in users",
          :key="u.id",
          :label="u.fullName",
          :value="u.id"
        )
    el-form-item(label="Срок")
      el-date-picker(
        v-model="form.date"
        type="date"
        placeholder="Выберите срок"
      )
    el-form-item(label="Болезнь")
      el-select(v-model="form.diseaseId", clearable, filterable)
        el-option(
          v-for="d in diseases",
          :key="d.id",
          :label="d.name",
          :value="d.id"
        )
    el-form-item(label="Насекомые")
      el-select(v-model="form.insectId", clearable, filterable)
        el-option(
          v-for="i in insects",
          :key="i.id",
          :label="i.name",
          :value="i.id"
        )
    el-form-item(label="Вид сорняков")
      el-select(v-model="weedTypeId", filterable)
        el-option(v-for="c in filterWeedTypesBySelected", :label="c.name", :value="c.id", :key="c.id")
      el-input-number(v-model="weedAmount", :step="1", :min="0")
      el-button(@click="addToWeed()", :disabled="addToWeedButton()") Добавить
      div.tags
        el-tag(v-for="(item, index) in form.noteWeedTypes",
        :key="index"
        type="primary",
        :closable="true",
        @close="removeFromWeed(index)")
          | {{ weedTypes.find(w => w.id === item.weedTypeId).name }}
          b  ( {{ item.weedAmount }} )

  el-button(type="primary", @click="formPost") Создать

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        form: {
          date: null,
          text: null,
          responsibleUserId: null,
          diseaseId: null,
          insectId: null,
          noteWeedTypes: [],
        },
        deBounce: 1200,
        diseases: null,
        insects: null,
        loading: true,
        weedTypes: null,
        weedTypeId: null,
        weedAmount: 0,
        users: [],
        endpoint: 'Notes/',
      }
    },
    created() {
      this.fetchEntities([
        'diseases',
        'insects',
        'users',
        'weedTypes'
      ], this.afterFetch );
//      let path = "/Account/Users/" + this.$root.context.organization
//      http.get(path).then(r => { this.users = r })
    },
    computed: {
      filterWeedTypesBySelected() {
        let weedtypes = this.form.noteWeedTypes.map(c => c.weedTypeId);

        if (weedtypes.length) {
          return this.weedTypes.filter(c => {
            if (!weedtypes.includes(c.id)) {
              return c;
            }
          });
        } else {
          return this.weedTypes;
        }
      },
    },
    methods: {
      addToWeedButton() {
        if (this.weedTypeId && this.weedAmount > 0)
          return false
        else
          return true
      },
      addToWeed() {
        this.form.noteWeedTypes.push({
          weedTypeId: this.weedTypeId,
          weedAmount: this.weedAmount
        });

        this.weedTypeId = null
        this.weedAmount = 0
      },
      removeFromWeed(index) {
        this.form.noteWeedTypes.splice(index, 1);
      },
      afterFetch(){
        this.users = this.fromVuex('users')
        this.diseases = this.fromVuex('diseases')
        this.insects = this.fromVuex('insects')
        this.weedTypes = this.fromVuex('weedTypes')
        this.loading = false
      },
      refresh() {
        this.nullForm()
        this.fetchEntities([
          'diseases',
          'insects',
          'users',
          'weedTypes'
        ], this.afterFetch);
        this.loading = true
      },
      formPost(){
        let endpoint = this.endpoint + this.$root.context.organization;
        if (this.form.date){
          this.form.date = moment(this.form.date, 'YYYY-MM-DD').format("YYYY-MM-DDTHH:mm:ss")
        }
        let data = {
          date: this.form.date,
          fieldId: this.$root.context.field,
          text: this.form.text,
          responsibleUserId: this.form.responsibleUserId,
          diseaseId: this.form.diseaseId,
          insectId: this.form.insectId,
          noteWeedTypes: this.form.noteWeedTypes
        };
        http.post(endpoint, data).then(() => {
          this.refresh();
        });
      },
      nullForm(){
        for (let item in this.form){
          this.form[item] = null
        }
        this.form.noteWeedTypes = []
        this.weedTypeId = null
        this.weedAmount = 0
      },
    }
  }

</script>

<style>
  .tableHeading {
    display: inline-block;
    margin-right: 20px;
  }

  .downloadLzkStyle {
    display: block;
    margin-top: 20px;
  }

  .downloadFieldSelect {
    width: 250px;
  }

</style>
