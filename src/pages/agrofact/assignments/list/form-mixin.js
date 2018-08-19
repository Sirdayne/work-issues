import {fromVuex} from "services/RecordsLoader"
import GlobalMethods from "lib/GlobalMethods";

export default {
  data() {
    return {
      works: [],
      seedlimits: [],
      fields: [],
      cars: [],
      instruments: [],
      employees: [],
      organizations: [],
      isSelf: true,
      organization: this.$root.context.organization,
      isFields: false,
      isSowingWork: false,
      minDepth: null,
      maxDepth: null,
      isSpecificYield: false,
      maxSpecificYield: null,
      isWorkingFluidConsumptionRate: false,
      maxWorkingFluidConsumptionRate: null,
      loadingItem: {
        save: false,
      },
      saved: {
        items: [],
        from: null,
        till: null,
      },
    }
  },
  created() {
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.works = GlobalMethods.getAssignmentsWorks()
        .map(w => {
          let startDate = GlobalMethods.getStartDateFromWorkDatesByWorkId(w.id)
          w.diff = Math.abs(new Date() - startDate)
          return w
        })
        .sort((a, b) => a.diff - b.diff);
      this.fields = fromVuex("fields")
      this.seedlimits = fromVuex("seedlimits")
      this.employees = GlobalMethods.getEmployeesFilteredByOrganization(this.$root.context.organization)
      this.organizations = fromVuex("organizations")
    },
    filterByOrg(orgId) {
      if (!orgId) {
        delete this.item.employeeId
        delete this.item.carId
        delete this.item.instrumentId
        return;
      }
      this.employees = GlobalMethods.getEmployeesFilteredByOrganization(orgId)
      if (!this.employees.map(e => e.id).includes(this.item.employeeId)) {
        delete this.item.employeeId
      }
      this.filterByWork(this.item.subOperationId)
      this.instruments = []
    },
    filterByWork(workId) {
      this.setFieldWorkIndicator(workId)
      this.setSowingWorkIndicator(workId)
      this.setSpecificYieldIndicator(workId)
      this.setWorkingFluidConsumptionRate(workId)
      if (!workId) {
        delete this.item.carId
        return;
      }
      let orgId = this.organization || this.$root.context.organization
      this.cars = GlobalMethods.getCarsFilteredByWorksAndOrganization(workId, orgId)
        .filter(c => !c.isSecurityGuard);
      if (!this.cars.map(c => c.id).includes(this.item.carId)) {
        delete this.item.carId
      }
    },
    filterByCar(carId) {
      let workId = this.item.subOperationId
      if (!carId || !workId) {
        delete this.item.instrumentId
        return;
      }
      this.instruments = GlobalMethods.getInstrumentsFilteredByWorksAndCars(workId, carId)
      if (!this.instruments.map(i => i.id).includes(this.item.instrumentId)) {
        delete this.item.instrumentId
      }
    },
    setOrganization() {
      if (this.isSelf) {
        this.organization = this.$root.context.organization
        this.filterByOrg(this.organization)
      }
    },
    setSowingWorkIndicator(workId) {
      if (workId) {
        this.isSowingWork = this.works.find(w => w.id == workId).planWorkTypeIsSowing
        if (this.isSowingWork) {
          let cultureDepths = GlobalMethods.getMinMaxOfSowingDepths(this.item.seedLimitId);
          this.minDepth = cultureDepths.minDepth;
          this.maxDepth = cultureDepths.maxDepth;
        } else {
          this.minDepth = null;
          this.maxDepth = null;
        }
      } else {
        this.isSowingWork = false
      }
    },
    setDepthBounds(seedLimitId) {
      let id = Array.isArray(seedLimitId) ? seedLimitId[0] : seedLimitId
      let cultureDepths = GlobalMethods.getMinMaxOfSowingDepths(id);
      this.minDepth = cultureDepths.minDepth;
      this.maxDepth = cultureDepths.maxDepth;
    },
    setSpecificYieldIndicator(workId) {
      if (workId) {
        let planWorkTypeId = GlobalMethods.getPlanWorkTypeIdByWorkId(workId);
        this.isSpecificYield = GlobalMethods.getWorkTypesIdsByConditionType(2).includes(planWorkTypeId);
        if (this.isSpecificYield) {
          this.maxSpecificYield = 100
        } else {
          this.maxSpecificYield = null
        }
      } else {
        if (this.item.hasOwnProperty("specificYield")) {
          delete this.item.specificYield
        }
      }
    },
    setWorkingFluidConsumptionRate(workId) {
      if (workId) {
        let planWorkTypeId = GlobalMethods.getPlanWorkTypeIdByWorkId(workId);
        this.isWorkingFluidConsumptionRate = GlobalMethods.getWorkTypesIdsByConditionType(4).includes(planWorkTypeId);
        if (this.isWorkingFluidConsumptionRate) {
          this.maxWorkingFluidConsumptionRate = 100
        } else {
          this.maxWorkingFluidConsumptionRate = null
        }
      } else {
        if (this.item.hasOwnProperty("workingFluidConsumptionRate")) {
          delete this.item.workingFluidConsumptionRate
        }
      }
    },
    findOrganizationByEmployeeId(employeeId) {
      let employee = fromVuex("employeesAll").find(e => e.id == employeeId)
      let organization = employee && employee.organizationId
      if (organization) {
        this.isSelf = organization == this.$root.context.organization
        this.organization = organization
      } else {
        this.isSelf = true
        this.setOrganization()
      }
    },
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.save()
        }
      });
    },
  }
}
