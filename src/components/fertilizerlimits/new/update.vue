<template lang="pug">
  el-dialog(v-if="dialogVisible", :visible.sync="dialogVisible", title="Редактирование", size="tiny", :close-on-click-modal="false", :before-close="beforeClose")
    el-form(label-width="90px")
      date(:propModel="models.date", :propVisible="visibility.date")
      works(:propModel="models.works", :propIterable="iterables.works", :propVisible="visibility.works")
      seed-limits(:propModel="models.seedLimits", :propIterable="iterables.seedLimits", :propVisible="visibility.seedLimits")
      fertilizers(:propModel="models.fertilizers", :propIterable="iterables.fertilizers", :propVisible="visibility.fertilizers")
      put-button(:propCurrentPage="currentPage", :propVisible="visibility.putButton")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import Date from 'components/FormFieldsLibrary/FormFields/Date.vue';
  import Works from 'components/FormFieldsLibrary/FormFields/Works.vue';
  import SeedLimits from 'components/FormFieldsLibrary/FormFields/SeedLimits.vue';
  import Fertilizers from 'components/FormFieldsLibrary/FormFields/Fertilizers.vue';

  import PutButton from 'components/FormFieldsLibrary/FormFields/PutButton.vue';
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods';
  import moment from 'moment';

  export default {
    mixins: [
      GlobalMethods
    ],
    components: {
      Date,
      Works,
      SeedLimits,
      Fertilizers,
      PutButton
    },
    data() {
      return {
        dialogVisible: false,
        currentId: null,
        currentEntity: {},
        currentPage: 'FertilizerLimits',
        models: {
          date: null,
          works: null,
          seedLimits: null,
          fertilizers: [],
        },
        iterables: {
          works: [],
          seedLimits: [],
          weedTypes: [],
          fertilizers: [],
        },
        visibility: {
          date: true,
          works: true,
          seedLimits: true,
          fertilizers: true,
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

        // Find Current Assignment
        this.currentId = id;
        this.currentEntity = this.getEntityById(id, 'fertilizerLimits');

        // Add Editable
        this.$store.dispatch('actionAddEditable', this.currentEntity);

        // Date
        this.models.date = this.formatToISODate(this.currentEntity.date);

        // Works
        this.models.works = this.currentEntity.workTypeParameterPlanWorkTypeId;
        this.iterables.works = this.getEntities('works');

        // SeedLimits
        this.models.seedLimits = this.currentEntity.seedLimitId;
        this.iterables.seedLimits = this.getEntities('seedLimits');

        // Fertilizer
        this.models.fertilizers = this.currentEntity.chemistryChemicalTreatments;
        this.iterables.fertilizers = this.getFertilizerLimitsChemicalPreparations();

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
