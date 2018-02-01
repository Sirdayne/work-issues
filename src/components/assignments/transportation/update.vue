<template lang="pug">
  el-dialog(  v-if="dialogVisible",
              :visible.sync="dialogVisible",
              title="Редактирование",
              size="tiny",
              :close-on-click-modal="false",
              :before-close="beforeClose"
            )
    el-form(label-width="90px")
        works(:propModel="models.works", :propIterable="iterables.works", :propVisible="visibility.works")
        transportation-directions(:propDirection="assignmentType", :propModels="directionModels", :propMode="'update'")
        date-time-start(:propModel="models.dateTimeStart", :propVisible="visibility.dateTimeStart")
        date-time-end(:propModel="models.dateTimeEnd", :propVisible="visibility.dateTimeEnd")
        organization-toggler(:propModel="models.organizationToggler", :propVisible="visibility.organizationToggler")
        organizations(:propModel="models.organizations", :propIterable="iterables.organizations", :propVisible="visibility.organizations")
        employees(:propModel="models.employees", :propIterable="iterables.employees", :propVisible="visibility.employees")
        cars(:propModel="models.cars", :propIterable="iterables.cars", :propVisible="visibility.cars")
        instruments(:propModel="models.instruments", :propIterable="iterables.instruments", :propVisible="visibility.instruments")
        put-button(:propCurrentPage="currentPage", :propVisible="visibility.putButton")
</template>

<script>
  import { EventBus } from 'services/EventBus'
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods'
  import OrganizationToggler from 'components/FormFieldsLibrary/FormFields/OrganizationToggler.vue'
  import Organizations from 'components/FormFieldsLibrary/FormFields/Organizations.vue'
  import Works from 'components/FormFieldsLibrary/FormFields/Works.vue'
  import TransportationDirections from 'components/FormFieldsLibrary/FormFields/TransportationDirections.vue'
  import Employees from 'components/FormFieldsLibrary/FormFields/Employees.vue'
  import Cars from 'components/FormFieldsLibrary/FormFields/Cars.vue'
  import Instruments from 'components/FormFieldsLibrary/FormFields/Instruments.vue'
  import DateTimeStart from 'components/FormFieldsLibrary/FormFields/DateTimeStart.vue'
  import DateTimeEnd from 'components/FormFieldsLibrary/FormFields/DateTimeEnd.vue'
  import PutButton from 'components/FormFieldsLibrary/FormFields/PutButton.vue'

  export default {
    components: {
      OrganizationToggler,
      Organizations,
      Works,
      TransportationDirections,
      Employees,
      Cars,
      Instruments,
      DateTimeStart,
      DateTimeEnd,
      PutButton,
    },
    mixins: [
      GlobalMethods
    ],
    data() {
      return {
        dialogVisible: false,
        currentPage: 'Transportation',
        currentId: null,
        currentEntity: {},
        assignmentType: null,
        models: {
          organizationToggler: null,
          organizations: null,
          works: null,
          transportationDirections: null,
          directionModels: null,
          employees: null,
          cars: null,
          instruments: null,
          fields: null,
          warehouses: null,
          dateTimeStart: null,
          dateTimeEnd: null,
        },
        iterables: {
          organizations: [],
          works: [],
          employees: [],
          cars: [],
          instruments: [],
        },
        visibility: {
          organizationToggler: true,
          organizations: false,
          works: true,
          employees: true,
          cars: true,
          instruments: true,
          dateTimeStart: true,
          dateTimeEnd: true,
          putButton: true,
        }
      }
    },
    created() {
      EventBus.$on(this.currentPage + '.InitUpdate', (id) => {
        // Set Current Page
        this.$store.dispatch('actionSetCurrentPage', this.currentPage);

        // Set Current Mode
        this.$store.dispatch('actionSetCurrentMode', 'UPDATE');

        // Find Current Entity
        this.currentId = id;
        this.currentEntity = this.$store.getters.getEntityById(id, 'transportation');

        // Set Assignment Type
        this.assignmentType = this.currentEntity.assignmentType;

        // Add Editable
        this.$store.dispatch('actionAddEditable', this.currentEntity);

        // Works
        this.models.works = this.currentEntity.subOperationId;
        this.iterables.works = this.getTransportationWorks();

        // Organization Toggler
        this.models.organizationToggler = true;

        // Organizations
        this.models.organizations = this.$root.context.organization;
        this.iterables.organizations = this.$store.getters.getEntities('organizations');

        // Employees
        this.models.employees = this.currentEntity.employeeId;
        this.iterables.employees = this.getEmployeesFilteredByOrganization(this.models.organizations);

        // Cars
        this.models.cars = this.currentEntity.carId;
        this.iterables.cars = this.getCarsFilteredByWorksAndOrganization(this.models.works, this.models.organizations);

        // Instruments
        this.models.instruments = this.currentEntity.instrumentId;
        this.iterables.instruments = this.getInstrumentsFilteredByWorksAndCars(this.models.works, this.models.cars);

        // Fields
        this.models.fields = this.assignmentType == 4 ? this.currentEntity.originFieldId : this.currentEntity.destinationFieldId;

        // Warehouses
        this.models.warehouses = this.assignmentType == 3 ? this.currentEntity.originWarehouseId : this.currentEntity.destinationWarehouseId;

        // DateTimeRange.Start
        this.models.dateTimeStart = this.currentEntity.dateTimeRange.start;

        // DateTimeRange.End
        this.models.dateTimeEnd = this.currentEntity.dateTimeRange.end;

        // Put Button

        this.directionModels = this.assignmentType == 4
                                ? { origin: this.models.fields, destination: this.models.warehouses }
                                : { origin: this.models.warehouses, destination: this.models.fields };

        // Open Dialog Window
        this.dialogVisible = true;
      });
      EventBus.$on(this.currentPage + '.UpdateComponent.AssignmentTypeChanged', (assignmentType) => {
        this.assignmentType = assignmentType !== this.assignmentType ? assignmentType : this.assignmentType;
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
