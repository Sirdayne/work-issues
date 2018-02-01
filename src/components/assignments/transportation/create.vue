<template lang="pug">
  div(v-if="readyToRender")
    el-form(label-width="90px")
      el-row
        organization-toggler(:propModel="models.organizationToggler", :propVisible="visibility.organizationToggler", class="organizationToggler")
      el-row
        el-col(:span=6)
          works(:propModel="models.works", :propIterable="iterables.works", :propVisible="visibility.works")
        transportation-directions(:propDirection="assignmentType", :propModels="models.directionModels", :propMode="'create'")
      el-row
        el-col(:span=6)
          date-time-start(:propModel="models.dateTimeStart", :propVisible="visibility.dateTimeStart")
        el-col(:span=6)
          date-time-end(:propModel="models.dateTimeEnd", :propVisible="visibility.dateTimeEnd")
      el-row
        el-col(:span=6)
          organizations(:propModel="models.organizations", :propIterable="iterables.organizations", :propVisible="visibility.organizations")
        el-col(:span=6)
          employees(:propModel="models.employees", :propIterable="iterables.employees", :propVisible="visibility.employees")
        el-col(:span=6)
          cars(:propModel="models.cars", :propIterable="iterables.cars", :propVisible="visibility.cars")
        el-col(:span=6)
          instruments(:propModel="models.instruments", :propIterable="iterables.instruments", :propVisible="visibility.instruments")
      el-row
        el-col(:span=6)
          post-button(:propCurrentPage="currentPage", :propVisible="visibility.postButton")
</template>

<script>
  import { EventBus } from 'services/EventBus'
  import moment from 'moment'
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods'
  import OrganizationToggler from 'components/FormFieldsLibrary/FormFields/OrganizationToggler.vue'
  import Organizations from 'components/FormFieldsLibrary/FormFields/Organizations.vue'
  import Works from 'components/FormFieldsLibrary/FormFields/Works.vue'
  import Employees from 'components/FormFieldsLibrary/FormFields/Employees.vue'
  import Cars from 'components/FormFieldsLibrary/FormFields/Cars.vue'
  import Instruments from 'components/FormFieldsLibrary/FormFields/Instruments.vue'
  import TransportationDirections from 'components/FormFieldsLibrary/FormFields/TransportationDirections.vue'
  import Fields from 'components/FormFieldsLibrary/FormFields/Fields.vue'
  import Warehouses from 'components/FormFieldsLibrary/FormFields/Warehouses.vue'
  import DateTimeStart from 'components/FormFieldsLibrary/FormFields/DateTimeStart.vue'
  import DateTimeEnd from 'components/FormFieldsLibrary/FormFields/DateTimeEnd.vue'
  import PostButton from 'components/FormFieldsLibrary/FormFields/PostButton.vue'

  export default {
    components: {
      OrganizationToggler,
      Organizations,
      Works,
      Employees,
      Cars,
      Instruments,
      TransportationDirections,
      Fields,
      Warehouses,
      DateTimeStart,
      DateTimeEnd,
      PostButton,
    },
    mixins: [
      GlobalMethods
    ],
    data() {
      return {
        readyToRender: false,
        currentPage: 'Transportation',
        assignmentType: 4,
        models: {
          organizationToggler: null,
          organizations: null,
          works: null,
          employees: null,
          cars: null,
          instruments: null,
          directionModels: {
            origin: null,
            destination: null
          },
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
          fields: [],
          warehouses: [],
        },
        visibility: {
          organizationToggler: true,
          organizations: false,
          works: true,
          employees: true,
          cars: true,
          instruments: true,
          fields: true,
          warehouses: true,
          dateTimeStart: true,
          dateTimeEnd: true,
          postButton: true,
        }
      }
    },
    created() {
      EventBus.$on(this.currentPage + '.InitCreate', () => {
        // Set Current Page
        this.$store.dispatch('actionSetCurrentPage', this.currentPage);

        // Set Current Mode
        if (this.$store.getters.getCurrentMode === null) {
          this.$store.dispatch('actionSetCurrentMode', 'CREATE');
        }

        // Works
        this.iterables.works = this.getTransportationWorks();

        // Employees
        this.iterables.employees = this.$store.getters.getEntities('employees');

        // Cars
        this.iterables.cars = this.$store.getters.getEntities('cars');
        //скрыть машину охранника
        this.iterables.cars = this.iterables.cars.filter( x => {
          if(x.isSecurityGuard == false)
            return x
        });

        // Instruments
        this.iterables.instruments = this.$store.getters.getEntities('instruments');

        // Fields
        this.iterables.fields = this.$store.getters.getEntities('fields');

        // Warehouses
        this.iterables.warehouses = this.$store.getters.getEntities('warehouses');

        // DateTimeStart
        this.models.dateTimeStart = moment().set({'year': this.$root.context.year, 'hour': 9, 'minute': 0, 'second': 0, 'millisecond': 0});

        // DateTimeEnd
        this.models.dateTimeEnd = moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0});

        // Organization Toggler
        this.models.organizationToggler = true;

        // Organizations
        this.models.organizations = this.$root.context.organization;
        this.iterables.organizations = this.$store.getters.getEntities('organizations');

        // Post Button

        // Render Create Component
        this.readyToRender = true;
      });
      EventBus.$on(this.currentPage + '.CreateComponent.PostObjectCompleted', () => {
      });
      EventBus.$on(this.currentPage + '.CreateComponent.AssignmentTypeChanged', (assignmentType) => {
        this.assignmentType = assignmentType !== this.assignmentType ? assignmentType : this.assignmentType;
      });
    }
  }
</script>

<style lang="stylus" scoped>
  .organizationToggler
    float right
    margin-right 4%
</style>
