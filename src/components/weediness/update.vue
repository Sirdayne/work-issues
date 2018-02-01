<template lang="pug">
  el-dialog(v-if="dialogVisible", :visible.sync="dialogVisible", title="Редактирование", size="tiny", :close-on-click-modal="false", :before-close="beforeClose")
    el-form(label-width="150px")
      date(:propModel="models.inspectionDate")
      h4 Количество после обработки:
      chemistry-limit-weed-types(:propModel="models.chemistryLimitWeedTypes")
      put-button(:propCurrentPage="currentPage", :propVisible="visibility.putButton")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods';
  import PutButton from 'components/FormFieldsLibrary/FormFields/PutButton.vue';
  import Date from 'components/FormFieldsLibrary/FormFields/DateWeediness.vue';
  import ChemistryLimitWeedTypes from 'components/FormFieldsLibrary/FormFields/chemistryLimitWeedTypes.vue';
  import moment from 'moment'

  export default {
    mixins: [
      GlobalMethods
    ],
    components: {
      Date,
      ChemistryLimitWeedTypes,
      PutButton
    },
    data() {
      return {
        dialogVisible: false,
        currentId: null,
        currentEntity: {},
        currentPage: 'FieldWeediness',
        models: {
          inspectionDate: null,
          chemistryLimitWeedTypes: null
        },
        iterables: {
          chemistryLimitWeedTypes: [],
        },
        visibility: {
          putButton: true
        }
      }
    },
    created() {
      EventBus.$on(this.currentPage + '.InitUpdate', (id) => {
        // Set Current Page
        this.$store.dispatch('actionSetCurrentPage', this.currentPage);

        // Set Current Mode
        this.$store.dispatch('actionSetCurrentMode', 'UPDATE');

        // Find Current seed Limit
        this.currentId = id;
        this.currentEntity = this.$store.getters.getEntityById(id, 'FieldWeediness');

        // Add Editable
        this.$store.dispatch('actionAddEditable', this.currentEntity);

        // Date
        this.models.inspectionDate = this.formatToISODate(this.currentEntity.inspectionDate);

        // model
        this.models.chemistryLimitWeedTypes = this.currentEntity.chemistryLimitWeedTypes;

        // Put Button

        // Open Dialog Window
        this.dialogVisible = true;
      });
      EventBus.$on(this.currentPage + '.DestroyUpdate', () => {
        this.currentId = null;
        this.dialogVisible = false;
        this.$store.dispatch('actionSetCurrentMode', 'CREATE');
      });
      EventBus.$on(this.currentPage + '.UpdateComponent.PutObjectCompleted', () => {
        this.currentId = null;
        this.dialogVisible = false;
        this.$store.dispatch('actionSetCurrentMode', 'CREATE');
      });
    },
    methods: {
      beforeClose(done) {
        EventBus.$emit(this.currentPage + '.DestroyUpdate');
        done();
      }
    }
  }
</script>
