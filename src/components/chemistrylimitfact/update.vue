<template lang="pug">
  el-dialog(v-if="dialogVisible", :visible.sync="dialogVisible", title="Редактирование", size="tiny", :close-on-click-modal="false", :before-close="beforeClose")
    el-form(label-width="150px")
      chemistry-chemical-treatments(
        :propModel="models.chemistryChemicalTreatments",
        :propVisible="visibility.chemistryChemicalTreatments"
      )
      put-button(:propCurrentPage="currentPage", :propVisible="visibility.putButton")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import ChemistryChemicalTreatments from 'components/FormFieldsLibrary/FormFields/ChemistryChemicalTreatments.vue';
  import PutButton from 'components/FormFieldsLibrary/FormFields/PutButton.vue';
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods';

  export default {
    mixins: [
      GlobalMethods
    ],
    components: {
      ChemistryChemicalTreatments,
      PutButton
    },
    data() {
      return {
        dialogVisible: false,
        currentId: null,
        currentEntity: {},
        currentPage: 'ChemistryLimitFact',
        models: {
          chemistryChemicalTreatments: null,
        },
        iterables: {
          chemistryChemicalTreatments: [],
        },
        visibility: {
          chemistryChemicalTreatments: true,
          putButton: true
        }
      }
    },
    created() {
      EventBus.$on('ChemistryLimitFact.InitUpdate', (id) => {
        // Set Current Page
        this.$store.dispatch('actionSetCurrentPage', this.currentPage);

        // Set Current Mode
        this.$store.dispatch('actionSetCurrentMode', 'UPDATE');

        // Find Current Chemistry Limit
        this.currentId = id;
        this.currentEntity = this.$store.getters.getEntityById(id, 'chemistrylimitfact');

        // Add Editable
        this.$store.dispatch('actionAddEditable', this.currentEntity);

        // Chemistry Chemical Treatments
        this.models.chemistryChemicalTreatments = this.currentEntity.chemistryChemicalTreatments;

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
