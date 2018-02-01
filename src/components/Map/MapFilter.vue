<template lang="pug">
.map-filter
  .search-bar
    el-input(
      placeholder="Поиск",
      icon="search",
      v-model="searchText",
    )
    el-button(:disabled="!filterEnabled", type="text", @click="clearFilter()", title="Сбросить фильтр") Сбросить
  .filter
    .filters
      el-button.filter-button.combine-button(:class="{'filter-button-focused': filterBy == 'combines'}", @click="updateFilterContent('combines')", title="Комбайны")
      el-button.filter-button.tractor-button(:class="{'filter-button-focused': filterBy == 'tractors'}", @click="updateFilterContent('tractors')", title="Трактора")
      el-button.filter-button.truck-button(:class="{'filter-button-focused': filterBy == 'freights'}", @click="updateFilterContent('freights')", title="Грузовики")
      el-button.filter-button.sprayer-button(:class="{'filter-button-focused': filterBy == 'sprayers'}", @click="updateFilterContent('sprayers')", title="Опрыскиватели")
      el-button.filter-button.field-button(:class="{'filter-button-focused': filterBy == 'fields'}", @click="updateFilterContent('fields')", title="Поля")
      el-button.filter-button.driver-button(:class="{'filter-button-focused': filterBy == 'drivers'}", @click="updateFilterContent('drivers')", title="Водители")
    .filter-content
      template(v-if="filterContent")
        ul.filter-content-ul
          li(v-for="c in filterContentFiltered", @click="updateFilter(c.id)",
            :class="{'filter-content-clicked': checkedFilterContent[filterContext].includes(c.id)}") {{ defineLabel(c) }}
      template(v-else)
        p Нет данных
</template>

<script>
import { EventBus } from "services/EventBus";
import RecordsLoaderV2 from "mixins/RecordsLoaderV2";
import GlobalMethods from "components/FormFieldsLibrary/GlobalMethods";
import moment from "moment";

export default {
  name: "MapFilter",
  props: [],
  mixins: [GlobalMethods, RecordsLoaderV2],
  data() {
    return {
      searchText: "",
      filter: {
        carIds: [],
        endDate: new Date(Date.now()),
        fieldIds: [],
        startDate: new Date(Date.now()),
        employeeIds: [],
        instrumentIds: []
      },
      checkedFilterContent: {
        carIds: [],
        fieldIds: [],
        employeeIds: []
      },
      filterContent: [],
      filterContext: "",
      filterBy: "",
      combines: [],
      freights: [],
      tractors: [],
      sprayers: [],
      carModels: [],
      cars: [],
      carTypes: [],
      employees: [],
      fields: [],
      filterIds: ["carIds", "fieldIds", "employeeIds", "instrumentIds"],
    };
  },
  computed: {
    filterContentFiltered() {
      return this.filterContent.filter(
        f =>
          this.defineLabel(f)
            .toLowerCase()
            .indexOf(this.searchText.toLowerCase()) > -1
      );
    },
    filterEnabled() {
      return this.filterIds.some(fb => this.filter[fb].length)
    },
  },
  created() {
    this.apply()
    EventBus.$on("MapController.SelectedDateChanged", date => {
      this.filter.startDate = moment(date).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
      this.filter.endDate = moment(date).set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 0
      });
      this.apply()
    });
    this.fetchEntities([
      "carmodels",
      "cars",
      "cartypes",
      "employees",
      "leafletFields"
    ], this.afterFetch);
  },
  methods: {
    afterFetch() {
      this.carModels = this.fromVuex("carmodels");
      this.cars = this.fromVuex("cars");
      this.carTypes = this.fromVuex("cartypes");
      this.employees = this.fromVuex("employees");
      this.fields = this.fromVuex("leafletFields").map(f => {
        f.newName = f.fieldName
        f.id = f.fieldId
        return f
      })
      if (this.carTypes && this.carTypes.length) {
        let harvesters = this.getCarsByCarTypeName("Harvester");
        this.combines = this.getCarsByCarTypeName("Combine").concat(harvesters);
        this.tractors = this.getCarsByCarTypeName("Tractor");
        this.sprayers = this.getCarsByCarTypeName("Sprayer");
        this.freights = this.getCarsByCarTypeName("FreightCar");
        this.updateFilterContent("combines");
      }
    },
    clearFilter(doNotApply) {
      this.filterIds.forEach(fb => this.filter[fb] = [])
      this.checkedFilterContent.carIds = []
      this.checkedFilterContent.fieldIds = []
      this.checkedFilterContent.employeeIds = []
      if (!doNotApply) this.apply()
    },
    updateFilterContent(filterBy) {
      this.filterBy = filterBy
      let filterMap = {
        "combines": {content: this.combines, context: "carIds"},
        "tractors": {content: this.tractors, context: "carIds"},
        "freights": {content: this.freights, context: "carIds"},
        "sprayers": {content: this.sprayers, context: "carIds"},
        "fields": {content: this.fields, context: "fieldIds"},
        "drivers": {content: this.employees, context: "employeeIds"},
      }
      this.filterContent = filterMap[filterBy].content;
      this.filterContext = filterMap[filterBy].context;
    },
    defineLabel(item) {
      return item.newName
        ? item.newName
        : item.name
          ? item.name
          : item.displayString
            ? item.displayString
            : item.fullName ? item.fullName : "";
    },
    updateFilter(id) {
      let cond1 = this.filterContext == "carIds"
      let cond2 = this.checkedFilterContent[this.filterContext].length
      if (!(cond1 && cond2)) this.clearFilter(true)
      Object.keys(this.checkedFilterContent)
        .filter(key => key === this.filterContext)
        .forEach(key => {
          let ids = this.checkedFilterContent[key];
          if (!ids.length) {
            this.checkedFilterContent[this.filterContext].push(id);
          } else {
            let found = false;
            ids.filter(j => j === id).forEach(j => {
              found = true;
              let index = this.checkedFilterContent[this.filterContext].indexOf(j);
              this.checkedFilterContent[this.filterContext].splice(index, 1);
            })
            if (!found) {
              this.checkedFilterContent[this.filterContext].push(id);
            }
          }
        })
      this.filter[this.filterContext] = this.checkedFilterContent[this.filterContext]
      this.apply()
    },
    apply() {
      this.$emit("apply", Object.assign({}, this.filter));
    }
  }
};
</script>

<style lang="stylus" scoped>
.field-button
  background-image: url('~assets/field.png')

.combine-button
  background-image: url('~assets/combine-harvester.svg')

.tractor-button
  background-image: url('~assets/tractor-front.svg')

.truck-button
  background-image: url('~assets/delivery-truck.svg')


.driver-button
  background-image: url('~assets/male-user-manager.svg')

.sprayer-button
  background-image: url('~assets/sprayer.svg')

.map-filter
  display: flex
  flex-direction: column
  height 100%

.search-bar
  display: flex
  box-sizing: border-box
  width: 100%
  padding: 10px
  justify-content: space-between
  & > :first-child
    width: calc(100% - 80px)
  & > :last-child
    padding: 10px

.filter
  display flex
  padding 0
  justify-content space-between
  height 100%
  box-sizing border-box
  border-bottom 1px solid #e4e8f1

.filters
  display flex
  height calc((32px + 15px) * 5)
  align-items center
  justify-content space-between
  flex-direction column
  box-sizing border-box
  padding 5px 5px 0 10px

.filter-button
  align-self center
  margin 0 auto
  height 32px
  width 32px
  background-size 32px
  background-repeat no-repeat

.filter-content
  box-sizing border-box
  width calc(100% - 47px)
  height 100%
  overflow auto
  padding 0 10px 10px 5px
  box-sizing border-box
  font-size 12px

.filter-content-ul
  list-style none
  margin 0
  padding 0

.filter-content-ul >>> li
  margin 0
  box-sizing border-box
  padding 8px 15px 8px 5px

.filter-content-ul >>> li:hover
  cursor pointer
  background #858585

.filter-content-clicked
  background #525252
  position relative
  color #fff

  &:after
    content '\2713'
    color #08ff00
    position absolute
    top 8px
    right 5px

.filter-button-focused
  box-shadow 1px 1px 20px orange
  border 1px solid orange
</style>
