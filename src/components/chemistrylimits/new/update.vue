<template lang="pug">
  el-dialog(v-if="dialogVisible", :visible.sync="dialogVisible", title="Редактирование", size="tiny", :close-on-click-modal="false", :before-close="beforeClose")
    el-form(label-width="90px")
      date(:propModel="models.date", :propVisible="visibility.date")
      works(:propModel="models.works", :propIterable="iterables.works", :propVisible="visibility.works")
      seed-limits(:propModel="models.seedLimits", :propIterable="iterables.seedLimits", :propVisible="visibility.seedLimits")
      tank-mix(:propModel="models.tankMix", :propIterable="iterables.tankMix", :propVisible="visibility.tankMix")
      tank-weed(:propModel="models.tankWeed", :propIterable="iterables.tankWeed", :propVisible="visibility.tankWeed")
      put-button(:propCurrentPage="currentPage", :propVisible="visibility.putButton")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import Date from 'components/FormFieldsLibrary/FormFields/Date.vue';
  import Works from 'components/FormFieldsLibrary/FormFields/Works.vue';
  import SeedLimits from 'components/FormFieldsLibrary/FormFields/SeedLimits.vue';
  import WeedAmount from 'components/FormFieldsLibrary/FormFields/WeedAmount.vue';
  import WeedTypes from 'components/FormFieldsLibrary/FormFields/WeedTypesMultiple.vue';
  import TankMix from 'components/FormFieldsLibrary/FormFields/TankMix.vue';
  import TankWeed from 'components/FormFieldsLibrary/FormFields/TankWeed.vue';

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
      WeedAmount,
      WeedTypes,
      TankMix,
      TankWeed,
      PutButton
    },
    data() {
      return {
        dialogVisible: false,
        currentId: null,
        currentEntity: {},
        currentPage: 'ChemistryLimits',
        models: {
          date: null,
          works: null,
          seedLimits: null,
          weedAmount: null,
          weedTypes: [],
          tankMix: [],
          tankWeed: [],
        },
        iterables: {
          works: [],
          seedLimits: [],
          weedTypes: [],
          tankMix: [],
          tankWeed: [],
        },
        visibility: {
          date: true,
          works: true,
          seedLimits: true,
          weedAmount: true,
          weedTypes: true,
          tankMix: true,
          tankWeed: true,
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
        this.currentEntity = this.getEntityById(id, 'chemistryLimits');

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

        // Weed Amount
        this.models.weedAmount = this.currentEntity.weedAmount;

        // Weed Types
        this.models.weedTypes = this.currentEntity.weedTypesIds;
        this.iterables.weedTypes = this.getEntities('weedTypes');

        // Tank Mix
        this.models.tankMix = this.currentEntity.chemistryChemicalTreatments;
        this.iterables.tankMix = this.getEntities('chemicalPreparations');

        // Tank Mix
        this.models.tankWeed = this.currentEntity.chemistryLimitWeedTypes;
        this.iterables.tankWeed = this.getEntities('weedTypes');

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
