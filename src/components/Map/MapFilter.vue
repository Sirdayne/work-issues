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
      el-button.filter-button.tractor-button(:class="{'filter-button-focused': filterBy == 'cars'}", @click="updateFilterContent('cars')", title="Машины")
      el-button.filter-button.field-button(:class="{'filter-button-focused': filterBy == 'fields'}", @click="updateFilterContent('fields')", title="Поля")
      el-button.filter-button.driver-button(:class="{'filter-button-focused': filterBy == 'drivers'}", @click="updateFilterContent('drivers')", title="Водители")
    .filter-content
      template(v-if="filterContent")
        template(v-if="filterBy == 'cars'")
          ul.plus-minus-list
            li(v-for="ct in carTypes", @click="updateSelectedCarType(ct)",
              v-if="carsFiltered[ct.id].length",
              :class="['pml-item', ct.isSelected ? 'pml-minus-item' : 'pml-plus-item']") {{ct.name}} ({{carsFiltered[ct.id].length}})
              ul.filter-content-ul(v-if="ct.isSelected")
                li(v-for="c in filterCarsFiltered", @click.stop="updateFilter(c.id)",
                  :class="[c.carstatusColorClass, {'filter-content-clicked': checkedFilterContent[filterContext].includes(c.id)}]") {{ defineLabel(c) }}
        template(v-else)
          ul.filter-content-ul
            li(v-for="c in filterContentFiltered", @click="updateFilter(c.id)",
              :class="{'filter-content-clicked': checkedFilterContent[filterContext].includes(c.id)}") {{ defineLabel(c) }}
      template(v-else)
        p Нет данных
</template>

<script>
import { EventBus } from "services/EventBus";
import RecordsLoaderV2 from "mixins/RecordsLoaderV2";
import moment from "moment";
import http from 'lib/httpQueryV2';
import { Message } from 'element-ui'

export default {
  name: "MapFilter",
  props: [
    "data",
  ],
  mixins: [RecordsLoaderV2],
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
      cars: [],
      employees: [],
      filterIds: ["carIds", "fieldIds", "employeeIds", "instrumentIds"],
      carTypes: [],
      selectedCarTypeId: null,
      carstatus: [],
      carstatusDate: null,
    };
  },
  computed: {
    filterCarsFiltered() {
      let filterCarsFiltered = this.carsFiltered[this.selectedCarTypeId] || []
      filterCarsFiltered = filterCarsFiltered.filter(
        f =>
          this.defineLabel(f)
            .toLowerCase()
            .indexOf(this.searchText.toLowerCase()) > -1
      )
      return filterCarsFiltered
    },
    carsFiltered() {
      let carsFiltered = {}
      this.carTypes.forEach(ct => {
        carsFiltered[ct.id] = this.cars.filter(car => car.carTypeId == ct.id)
      })
      return carsFiltered
    },
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
    fields() {
      let leafletFields = this.fromVuex("leafletFields").map(f => {
        f.newName = f.fieldName
        f.id = f.fieldId
        return f
      })
      return leafletFields || []
    },
  },
  created() {
    this.apply()
    this.getCarstatus(moment(this.$store.getters.getSelectedDate).format("YYYY-MM-DDTHH:mm:ss"))
    EventBus.$on("MapController.SelectedDateChanged", date => {
      this.filter.startDate = moment(date).set({hour: 0, minute: 0, second: 0, millisecond: 0});
      this.filter.endDate = moment(date).set({hour: 23, minute: 59, second: 59, millisecond: 0});
      this.getCarstatus(moment(date).format("YYYY-MM-DDTHH:mm:ss"))
      this.apply()
    });
    EventBus.$on("MapController.TrackDateChanged", date => {
      this.getCarstatus(moment(date).format("YYYY-MM-DDTHH:mm:ss"))
    });
    EventBus.$once("traktorTracksTriggered", (carId) => {
      this.updateFilterContent('cars')
      let carTypeId = this.cars.find(c => c.id == carId).carTypeId
      let carType = this.carTypes.find(ct => ct.id == carTypeId)
      this.updateSelectedCarType(carType)

      this.updateFilter(carId)
    }),
    EventBus.$on("Map.FieldDblclicked", (fieldId) => {
      this.updateFilterContent('fields')
      this.updateFilter(fieldId)
    }),
    this.afterFetch()
  },
  methods: {
    afterFetch() {
      this.employees = this.fromVuex("employees");
      this.carTypes = this.fromVuex("cartypes").filter(ct => ct.id != 3)
      this.unselectCarTypes()
      this.updateFilterContent("cars");
    },
    getCarstatus(selectedDate) {
      if (this.carstatusDate && this.carstatusDate.slice(0, 10) == selectedDate.slice(0, 10)) {
        this.carstatusDate = selectedDate
        this.setCars()
      } else {
        this.carstatusDate = selectedDate
        this.setCars()
        let body = {
          "organizationId": this.$root.context.organization,
          "daterange": {
            "start": moment(selectedDate, "YYYY-MM-DDTHH:mm:ss").hour(0).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
            "end": moment(selectedDate, "YYYY-MM-DDTHH:mm:ss").hour(23).minute(59).second(59).format("YYYY-MM-DDTHH:mm:ss"),
          },
          "interval": 20,
        }
        http.post("carstatus", body)
          .then(data => {
            let cond = this.carstatusDate && this.carstatusDate.slice(0, 10) == selectedDate.slice(0, 10)
            if (cond) {
              this.carstatus = data || []
              this.setCars()
            }
          })
      }
    },
    unselectCarTypes() {
      this.carTypes = this.carTypes.map(ct => {
        ct.isSelected = false
        return ct
      });
    },
    setCars() {
      let carstatus = this.carstatus.find(cs => moment(cs.time.slice(0, 19)).isSameOrAfter(this.carstatusDate.slice(0, 19), "second"))
      carstatus = carstatus && carstatus.data || []
      let cars = this.fromVuex("cars").map(c => {
        let green, yellow, gray, red
        if (carstatus.length) {
          green = carstatus.find(cs => cs.status == 0).carIds.includes(c.id)
          yellow = carstatus.find(cs => cs.status == 1).carIds.includes(c.id)
          gray = carstatus.find(cs => cs.status == 2).carIds.includes(c.id)
          red = carstatus.find(cs => cs.status == 3).carIds.includes(c.id)
        }
        c.carstatusColorClass = red ? "car-status-color-red"
          : yellow ? "car-status-color-yellow"
          : green ? "car-status-color-green"
          : gray ? "car-status-color-gray"
          : ""
        return c
      });
      this.cars = cars || []
      if (this.filterBy == "cars") this.updateFilterContent("cars")
    },
    updateSelectedCarType(cartype) {
      let isSelected = cartype.isSelected
      this.unselectCarTypes()
      cartype.isSelected = isSelected ? false : !isSelected
      this.selectedCarTypeId = cartype.isSelected ? cartype.id : null
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
        "cars": {content: this.cars, context: "carIds"},
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
      if (this.$route.params.id) return;
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

.driver-button
  background-image: url('~assets/male-user-manager.svg')

.tractor-button
  background-image: url('~assets/tractor-front.svg')

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
  height calc((32px + 10px) * 3)
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

.plus-minus-list >>> .pml-item:hover
  cursor pointer
.plus-minus-list
  list-style none
  margin 0
  padding 0
  .pml-item
    padding 8px 15px 8px 5px
  .pml-minus-item:before
    content '-'
    display inline-block
    position relative
    width 7px
    margin-right 5px
    margin-bottom 10px
    color red
    text-align center
  .pml-plus-item:before
    content '+'
    display inline-block
    position relative
    width 7px
    margin-right 5px
    color #4db3ff

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

.car-status-color-gray:before
  content '\25A3'
  position relative
  margin-right 5px
  color gray
.car-status-color-red:before
  content '\25A3'
  position relative
  margin-right 5px
  color #f00
.car-status-color-yellow:before
  content '\25A3'
  position relative
  margin-right 5px
  color yellow
.car-status-color-green:before
  content '\25A3'
  position relative
  margin-right 5px
  color #0f0
</style>
