<template lang="pug">
  el-dialog(v-if="dialogVisible", :visible.sync="dialogVisible", title="Редактирование", size="tiny", :close-on-click-modal="false", :before-close="beforeClose")
    el-form(label-width="90px")
      works(:propModel="models.works", :propIterable="iterables.works", :propVisible="visibility.works")
      fields(:propModel="models.fields", :propIterable="iterables.fields", :propVisible="visibility.fields")
      seed-limits(:propModel="models.seedlimits", :propIterable="iterables.seedlimits", :propVisible="visibility.seedlimits")
      sowing-depth(:propModel="models.sowingdepth.model", :propMin="models.sowingdepth.min", :propMax="models.sowingdepth.max", :propVisible="visibility.sowingdepth")
      date-time-start(:propModel="models.dateTimeStart", :propIterable="iterables.dateTimeStart", :propVisible="visibility.dateTimeStart")
      date-time-end(:propModel="models.dateTimeEnd", :propIterable="iterables.dateTimeEnd", :propVisible="visibility.dateTimeEnd")
      organization-toggler(:propModel="models.organizationToggler", :propVisible="visibility.organizationToggler")
      organizations(:propModel="models.organizations", :propIterable="iterables.organizations", :propVisible="visibility.organizations")
      cars(:propModel="models.cars", :propIterable="iterables.cars", :propVisible="visibility.cars")
      instruments(:propModel="models.instruments", :propIterable="iterables.instruments", :propVisible="visibility.instruments")
      employees(:propModel="models.employees", :propIterable="iterables.employees", :propVisible="visibility.employees")
      put-button(:propCurrentPage="currentPage", :propVisible="visibility.putButton")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import Works from 'components/FormFieldsLibrary/FormFields/Works.vue';
  import Fields from 'components/FormFieldsLibrary/FormFields/Fields.vue';
  import SeedLimits from 'components/FormFieldsLibrary/FormFields/SeedLimits.vue';
  import SowingDepth from 'components/FormFieldsLibrary/FormFields/SowingDepth.vue';
  import DateTimeStart from 'components/FormFieldsLibrary/FormFields/DateTimeStart.vue';
  import DateTimeEnd from 'components/FormFieldsLibrary/FormFields/DateTimeEnd.vue';
  import OrganizationToggler from 'components/FormFieldsLibrary/FormFields/OrganizationToggler.vue';
  import Organizations from 'components/FormFieldsLibrary/FormFields/Organizations.vue';
  import Cars from 'components/FormFieldsLibrary/FormFields/Cars.vue';
  import Instruments from 'components/FormFieldsLibrary/FormFields/Instruments.vue';
  import Employees from 'components/FormFieldsLibrary/FormFields/Employees.vue';
  import PutButton from 'components/FormFieldsLibrary/FormFields/PutButton.vue';
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods';

  export default {
    mixins: [
      GlobalMethods
    ],
    components: {
      Works,
      Fields,
      SeedLimits,
      SowingDepth,
      DateTimeStart,
      DateTimeEnd,
      OrganizationToggler,
      Organizations,
      Cars,
      Instruments,
      Employees,
      PutButton
    },
    data() {
      return {
        dialogVisible: false,
        currentId: null,
        currentEntity: {},
        currentPage: 'Assignments',
        models: {
          works: null,
          fields: null,
          seedlimits: null,
          sowingdepth: {
            model: null,
            min: null,
            max: null,
          },
          organizationToggler: null,
          organizations: null,
          cars: null,
          carsAll: null,
          instruments: null,
          dateTimeStart: null,
          dateTimeEnd: null,
          employees: null,
        },
        iterables: {
          works: [],
          fields: [],
          seedlimits: [],
          organizations: [],
          cars: [],
          carsAll: [],
          instruments: [],
          employees: [],
        },
        visibility: {
          works: true,
          fields: true,
          seedlimits: true,
          sowingdepth: true,
          organizationToggler: true,
          organizations: false,
          cars: true,
          carsAll: true,
          instruments: true,
          dateTimeStart: true,
          dateTimeEnd: true,
          employees: true,
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
        this.currentEntity = this.getCurrentAssignment(id);

        // Add Editable
        this.$store.dispatch('actionAddEditable', this.currentEntity);

        // Works
        this.models.works = this.currentEntity.subOperationId;
        this.iterables.works = this.getAssignmentsWorks();

        // Fields
        this.models.fields = this.currentEntity.fieldId;
        this.iterables.fields = this.$store.getters.getEntities('fields');

        // SeedLimits
        this.models.seedlimits = this.currentEntity.seedLimitId;
        this.iterables.seedlimits  = this.$store.getters.getEntities('seedlimits');

        // Depth
        if (this.getPlanWorkTypeIsSowing(this.models.works)) {
          const cultureDepths = this.getMinMaxOfSowingDepths(this.models.seedlimits);
          this.models.sowingdepth.model = this.currentEntity.depth;
          this.models.sowingdepth.min = cultureDepths.minDepth;
          this.models.sowingdepth.max = cultureDepths.maxDepth;
        }

        // DateTimeRange.Start
        this.models.dateTimeStart = new Date(this.currentEntity.dateTimeRange.start).getTime() - (1000 * 60 * 360);

        // DateTimeRange.End
        this.models.dateTimeEnd = new Date(this.currentEntity.dateTimeRange.end).getTime() - (1000 * 60 * 360);

        // Organization Toggler
        this.models.organizationToggler = true;

        // Organizations
        this.models.organizations = this.$root.context.organization;
        this.iterables.organizations = this.$store.getters.getEntities('organizations');

        // Cars
        this.models.cars = this.currentEntity.carId;
        this.iterables.cars = this.getCarsFilteredByWorks(this.models.works);

        // Instruments
        this.models.instruments = this.currentEntity.instrumentId;
        this.iterables.instruments = this.getInstrumentsFilteredByWorksAndCars(this.models.works, this.models.cars);

        // Employees
        this.models.employees = this.currentEntity.employeeId;
        this.iterables.employees = this.getEmployeesFilteredByOrganization(this.models.organizations);

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
