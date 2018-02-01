<template lang="pug">
  el-dialog(v-if="dialogVisible", :visible.sync="dialogVisible", title="Редактирование", size="tiny", :close-on-click-modal="false")
    el-form(label-width="90px", label-position="left")
      el-form-item(label="Выработка по данным учетчика")
        el-input-number(v-model="form.areaByCounter", :min="0", :step="0.01")
      el-form-item(label="Причина изменения")
        el-input(v-model="form.explanatory")
      el-button(type="primary", @click="formPut") Сохранить
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import http from 'lib/httpQueryV2'

      export default {
        data() {
          return {
            dialogVisible: false,
            currentEntity: {},
            currentPage: 'AssignmentsDailyReportItems',
            form: {
              id: null,
              areaByCounter: null,
              explanatory: null,
            },
            visibility: {
              putButton: true
            },
            endpoint: 'assignmentsdailyreportitems/'
          }
        },
        created() {
          EventBus.$on(this.currentPage + '.InitUpdate', (id) => {
            // Set Current Page
            this.$store.dispatch('actionSetCurrentPage', this.currentPage);

            // Set Current Mode
            this.$store.dispatch('actionSetCurrentMode', 'UPDATE');

            // Find Current seed Limit
            this.form.id = id;
            this.currentEntity = this.$store.getters.getEntityById(id, 'assignmentsdailyreportitems');

            // Add Editable
            this.$store.dispatch('actionAddEditable', this.currentEntity);

            // model
            this.form.areaByCounter = this.currentEntity.areaByCounter;
            this.form.explanatory = this.currentEntity.explanatory;

            // Put Button

            // Open Dialog Window
            this.dialogVisible = true;
          });
        },
        methods: {
          formPut(){
            let endpoint = this.endpoint + this.$root.context.organization;
            let data = {
              id: this.form.id,
              areaByCounter: this.form.areaByCounter,
              explanatory: this.form.explanatory,
            };
            http.put(endpoint, data).then(() => {
              this.refresh();
            });
          },
          refresh(){
            this.dialogVisible = false
            this.form.id = null
            this.form.areaByCounter = null
            this.form.explanatory = null
            EventBus.$emit('AssignmentsDailyReportItems.UpdateComponent.PutObjectCompleted');
          },
        }
      }
</script>