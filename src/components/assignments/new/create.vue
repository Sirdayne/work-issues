<template lang="pug">
  div(v-if="readyToRender")
    el-form(label-width="90px")
      el-row
        organization-toggler(:propModel="models.organizationToggler", :propVisible="visibility.organizationToggler", class="organizationToggler")
      el-row
        el-col(:span=6)
          works(:propModel="models.works", :propIterable="iterables.works", :propVisible="visibility.works")
        el-col(:span=6)
          fields(:propModel="models.fields", :propIterable="iterables.fields", :propVisible="visibility.fields")
          seed-limits(:propModel="models.seedLimits", :propIterable="iterables.seedLimits", :propVisible="visibility.seedLimits")
        el-col(:span=12, class="row-assign")
          el-col(:span=12, class="col-assign-1")
            date-time-start(:propModel="models.dateTimeStart", :propIterable="iterables.dateTimeStart", :propVisible="visibility.dateTimeStart")
          el-col(:span=12, class="col-assign-2")
            date-time-end(:propModel="models.dateTimeEnd", :propIterable="iterables.dateTimeEnd", :propVisible="visibility.dateTimeEnd")
      el-row
        el-col(:span=6)
          organizations(:propModel="models.organizations", :propIterable="iterables.organizations", :propVisible="visibility.organizations")
        el-col(:span=6)
          cars(:propModel="models.cars", :propIterable="iterables.cars", :propVisible="visibility.cars")
        el-col(:span=6)
          instruments(:propModel="models.instruments", :propIterable="iterables.instruments", :propVisible="visibility.instruments")
        el-col(:span=6)
          employees(:propModel="models.employees", :propIterable="iterables.employees", :propVisible="visibility.employees")
        el-col(:span=6)
          sowing-depth(:propModel="models.sowingDepth.model", :propMin="models.sowingDepth.min", :propMax="models.sowingDepth.max", :propVisible="visibility.sowingDepth")
        el-col(:span=6)
          specific-yield(:propModel="models.specificYield", :propIterable="iterables.specificYield", :propVisible="visibility.specificYield")
      el-row
        post-button(:propCurrentPage="currentPage", :propVisible="visibility.postButton")
</template>

<script>
  import { EventBus } from 'services/EventBus'
  import moment from 'moment'
  import Works from 'components/FormFieldsLibrary/FormFields/Works.vue'
  import SpecificYield from 'components/FormFieldsLibrary/FormFields/SpecificYield.vue'
  import Fields from 'components/FormFieldsLibrary/FormFields/FieldsMany.vue'
  import SeedLimits from 'components/FormFieldsLibrary/FormFields/SeedLimitsMany.vue'
  import SowingDepth from 'components/FormFieldsLibrary/FormFields/SowingDepth.vue'
  import DateTimeStart from 'components/FormFieldsLibrary/FormFields/DateTimeStart.vue'
  import DateTimeEnd from 'components/FormFieldsLibrary/FormFields/DateTimeEnd.vue'
  import OrganizationToggler from 'components/FormFieldsLibrary/FormFields/OrganizationToggler.vue'
  import Organizations from 'components/FormFieldsLibrary/FormFields/Organizations.vue'
  import Cars from 'components/FormFieldsLibrary/FormFields/Cars.vue'
  import Instruments from 'components/FormFieldsLibrary/FormFields/Instruments.vue'
  import Employees from 'components/FormFieldsLibrary/FormFields/Employees.vue'
  import PostButton from 'components/FormFieldsLibrary/FormFields/PostButton.vue'
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods'

  export default {
    mixins: [
      GlobalMethods
    ],
    components: {
      Works,
      SpecificYield,
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
      PostButton
    },
    data() {
      return {
        readyToRender: false,
        currentAssignment: {},
        currentPage: 'Assignments',
        iterables: {
          works: [],
          fields: [],
          seedLimits: [],
          organizations: [],
          cars: [],
          carsAll: [],
          instruments: [],
          employees: [],
        },
        models: {
          works: null,
          specificYield: null,
          fields: [],
          seedLimits: [],
          sowingDepth: {
            model: null,
            min: null,
            max: null,
          },
          organizationToggler: null,
          organizations: null,
          cars: null,
          carsAll: null,
          instruments: null,
          dateTimeStart: new Date(moment().set({'year': this.$root.context.year, 'hour': 9, 'minute': 0, 'second': 0, 'millisecond': 0})),
          dateTimeEnd: new Date(moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0})),
          employees: null,
        },
        visibility: {
          works: true,
          specificYield: false,
          fields: true,
          seedLimits: false,
          sowingDepth: false,
          organizationToggler: true,
          organizations: false,
          cars: true,
          carsAll: true,
          instruments: true,
          dateTimeStart: true,
          dateTimeEnd: true,
          employees: true,
          postButton: true
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
        this.iterables.works = this.getAssignmentsWorks()
        .map(w => {
          w.startDate = this.getStartDateFromWorkDatesByWorkId(w.id)
          w.diff = Math.abs(new Date() - w.startDate)
          return w
        })
        .sort((a, b) => a.diff - b.diff);

        // Fields
        this.iterables.fields = this.$store.getters.getEntities('fields');

        // SeedLimits
        this.iterables.seedLimits = this.$store.getters.getEntities('seedLimits');

        // Depth
        if (this.getPlanWorkTypeIsSowing(this.models.works)) {
          const cultureDepths = this.getMinMaxOfSowingDepths(this.models.seedLimits);
          this.models.sowingDepth.model = this.currentAssignment.depth;
          this.models.sowingDepth.min = cultureDepths.minDepth;
          this.models.sowingDepth.max = cultureDepths.maxDepth;
        }

        // Organization Toggler
        this.models.organizationToggler = true;

        // Organizations
        this.models.organizations = this.$root.context.organization;
        this.iterables.organizations = this.$store.getters.getEntities('organizations');
        // Cars
        this.iterables.cars = this.$store.getters.getEntities('cars');
        //скрыть машину охранника
        this.iterables.cars = this.iterables.cars.filter( x => {
          if(x.isSecurityGuard == false)
            return x
        });

        // Instruments
        this.iterables.instruments = this.$store.getters.getEntities('instruments');

        // Employees
        this.iterables.employees = this.$store.getters.getEntities('employees');

        // Post Button

        // Render Create Component
        this.readyToRender = true;
      });
      EventBus.$on(this.currentPage + '.CreateComponent.PostObjectCompleted', () => {
      });
    }
  }
</script>

<style lang="stylus" scoped>
  .organizationToggler
    float right
    margin-right 4%
</style>
