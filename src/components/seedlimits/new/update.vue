<template lang="pug">
  el-dialog(v-if="dialogVisible", :visible.sync="dialogVisible", title="Редактирование", size="tiny", :close-on-click-modal="false", :before-close="beforeClose")
    el-form(label-width="90px")
      fields(:propModel="models.fields", :propIterable="iterables.fields", :propVisible="visibility.fields")
      seed-limits-area(:propModel="models.area", :propVisible="visibility.area")
      cultures(:propModel="models.cultures", :propIterable="iterables.cultures", :propVisible="visibility.cultures")
      culture-sorts(:propModel="models.cultureSorts", :propIterable="iterables.cultureSorts", :propVisible="visibility.cultureSorts")
      seed-million-number(:propModel="models.seedMillionNumber", :propVisible="visibility.seedMillionNumber")
      reproductions(:propModel="models.reproductions", :propIterable="iterables.reproductions", :propVisible="visibility.reproductions")
      seed-frequency(:propModel="models.seedFrequency", :propVisible="visibility.seedFrequency")
      seed-germination(:propModel="models.seedGermination", :propVisible="visibility.seedGermination")
      seed-weight(:propModel="models.seedWeight", :propVisible="visibility.seedWeight")
      put-button(:propCurrentPage="currentPage", :propVisible="visibility.putButton")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import Fields from 'components/FormFieldsLibrary/FormFields/Fields.vue';
  import SeedLimitsArea from 'components/FormFieldsLibrary/FormFields/Area.vue';
  import Cultures from 'components/FormFieldsLibrary/FormFields/Cultures.vue';
  import CultureSorts from 'components/FormFieldsLibrary/FormFields/CultureSorts.vue';
  import SeedMillionNumber from 'components/FormFieldsLibrary/FormFields/SeedMillionNumber.vue';
  import PutButton from 'components/FormFieldsLibrary/FormFields/PutButton.vue';
  import Reproductions from 'components/FormFieldsLibrary/FormFields/Reproductions.vue';
  import SeedFrequency from 'components/FormFieldsLibrary/FormFields/SeedFrequency.vue';
  import SeedGermination from 'components/FormFieldsLibrary/FormFields/SeedGermination.vue';
  import SeedWeight from 'components/FormFieldsLibrary/FormFields/SeedWeight.vue';
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods';

  export default {
    mixins: [
      GlobalMethods
    ],
    components: {
      Fields,
      SeedLimitsArea,
      Cultures,
      CultureSorts,
      SeedMillionNumber,
      Reproductions,
      SeedFrequency,
      SeedGermination,
      SeedWeight,
      PutButton
    },
    data() {
      return {
        dialogVisible: false,
        currentId: null,
        currentEntity: {},
        currentPage: 'SeedLimits',
        models: {
          fields: null,
          area: null,
          cultures: null,
          cultureSorts: null,
          seedMillionNumber: {
            model: null,
            min: null,
            max: null,
          },
          reproductions: null,
          seedFrequency: null,
          seedGermination: null,
          seedWeight: null,
        },
        iterables: {
          fields: [],
          cultures: [],
          cultureSorts: [],
          reproductions: [],
        },
        visibility: {
          fields: true,
          area: true,
          cultures: true,
          cultureSorts: true,
          seedMillionNumber: true,
          reproductions: true,
          seedFrequency: true,
          SeedGermination: true,
          seedWeight: true,
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
        this.currentEntity = this.$store.getters.getEntityById(id, 'seedlimits');

        // Add Editable
        this.$store.dispatch('actionAddEditable', this.currentEntity);

        // Fields
        this.models.fields = this.currentEntity.fieldId;
        this.iterables.fields = this.$store.getters.getEntities('fields');

        // Area

        this.models.area = this.currentEntity.area;
        // Cultures
        this.models.cultures = this.currentEntity.cultureId;
        this.iterables.cultures = this.$store.getters.getEntities('cultures');

        // CultureSorts
        this.models.cultureSorts = this.currentEntity.cultureSortId;
        this.iterables.cultureSorts = this.$store.getters.getEntities('sorts');

        // SeedMillionNumber
        this.filteredFields = this.getFilteredFields(this.models.fields);
        this.filteredCultureFieldZones = this.getFilteredCultureFieldZones(this.models.cultures);
        const filtered = this.getCrossFilterFieldsAndCultureFieldZones(this.filteredFields, this.filteredCultureFieldZones);
        this.models.seedMillionNumber.model = this.currentEntity.seedMillionNumber ? this.currentEntity.seedMillionNumber : 0;
        this.models.seedMillionNumber.min = filtered.length ? filtered[0].minNumber : null;
        this.models.seedMillionNumber.max = filtered.length ? filtered[0].maxNumber : null;

        // Reproductions
        this.models.reproductions = this.currentEntity.reproductionId;
        this.iterables.reproductions = this.$store.getters.getEntities('reproductions');

        // SeedFrequency
        this.models.seedFrequency = this.currentEntity.seedFrequency;

        // SeedGermination
        this.models.seedGermination = this.currentEntity.seedGermination;

        // SeedWeight
        this.models.seedWeight = this.currentEntity.seedWeight;


        // Put Button

        // Open Dialog Window
        this.dialogVisible = true;
      });
      EventBus.$on('SeedLimits.DestroyUpdate', () => {
        this.currentId = null;
        this.dialogVisible = false;
        this.$store.dispatch('actionSetCurrentMode', 'CREATE');
      });
      EventBus.$on('SeedLimits.UpdateComponent.PutObjectCompleted', () => {
        this.currentId = null;
        this.dialogVisible = false;
        this.$store.dispatch('actionSetCurrentMode', 'CREATE');
      });
    },
    methods: {
      beforeClose(done) {
        EventBus.$emit('SeedLimits.DestroyUpdate');
        done();
      }
    }
  }
</script>
