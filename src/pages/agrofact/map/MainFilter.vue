<template lang="pug">
.map-main-filter(v-loading="loading", element-loading-text="Загрузка...")
  el-input.search-input(v-model="searchText" icon="search", placeholder="Поиск")
  el-button.search-reset(type="text", @click="nullSearch()", title="Сбросить фильтр") Сбросить
  .filter-contents(:class="{'rerender': rerender}")
    .fc-icons
      .fc-icon.car(@click="changeActiveContainer('car')", :class="{'active': activeContainerClass.car}", :title="titleCar")
      .fc-icon.field(@click="changeActiveContainer('field')", :class="{'active': activeContainerClass.field}", :title="titleField")
      .fc-icon.employee(@click="changeActiveContainer('employee')", :class="{'active': activeContainerClass.employee}", :title="titleEmployee")
    .fc-container(v-if="activeContainer === 'car'")
      .fc-accord(v-for="cartype in cartypes")
        .fc-accordeon(@click="toggleSpoiler(cartype)") {{cartype.name}} ({{cartype.carsTotal}})
          span(v-if="cartype.active") -
          span(v-else) +
        .fc-spoiler(:class="{'active': cartype.active}")
          .fc-row.fc-row-car(v-for="item in cartype.cars", @click="clickCar(item)", :class="[{'active': item.active}, item.color]") {{ item.displayString }}
    .fc-container(v-else-if="activeContainer === 'field'")
      .fc-row(v-for="item in filteredFields", @click="clickField(item)", :class="{'active': item.active}") {{ item.newName }}
    .fc-container(v-else-if="activeContainer === 'employee'")
      .fc-row(v-for="item in filteredEmployees", @click="clickEmployee(item)", :class="{'active': item.active}") {{ item.fullName }}
</template>

<script>
import {EventBus} from "services/EventBus"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import {deepClone} from "lib/utils"
import TrafficLight from "./TrafficLight"

export default {
  mixins: [
    
    ListController,
    TrafficLight
  ],
  data() {
    return {
      titleCar: "Машины ()",
      titleField: "Поля ()",
      titleEmployee: "Водители ()",
      searchText: "",
      employees: [],
      fields: [],
      cars: [],
      cartypes: [],
      leafletFields: [],
      rerender: false,
      activeContainer: "car",
      activeContainerClass: {
        car: true,
        field: false,
        employee: false
      },
      filteredFields: [],
      filteredCars: [],
      filteredEmployees: [],
      carIds: [],
      loading: true
    }
  },
  created() {
    EventBus.$on("MapApplyFilter", (eventObj) => {
      this.applyFilter(eventObj.id, eventObj.type)
    })
    fetchEntities([
      "cars",
      "cartypes",
      "fields",
      "employees",
      "leafletFields"
    ], this.afterFetch );
  },
  watch: {
    "searchText"() {
      this.searchFilter()
    }
  },
  methods: {
    searchFilter() {
      this.filteredFields = deepClone(this.fields).filter(x => x.newName.toLowerCase().includes(this.searchText.toLowerCase()))
      this.filteredEmployees = deepClone(this.employees).filter(x => x.fullName.toLowerCase().includes(this.searchText.toLowerCase()))
      this.filteredCars = deepClone(this.cars).filter(x => x.displayString.toLowerCase().includes(this.searchText.toLowerCase()))
      this.modifyCarTypes()
    },
    initDOMData() {
      this.deepCloneData()
      this.modifyCarTypes(true)
    },
    deepCloneData() {
      this.filteredFields = deepClone(this.fields)
      this.filteredEmployees = deepClone(this.employees)
      this.filteredCars = deepClone(this.cars)
    },
    modifyCarTypes(init) {
      this.cartypes.forEach(cartype => {
        cartype.cars = []
        cartype.carsTotal = 0
        if (init)
          cartype.active = false
        this.filteredCars.forEach(car => {
          if (car.carTypeId === cartype.id) {
            cartype.cars.push(car)
            cartype.carsTotal++
          }
        })
      })
    },
    afterFetch(){
      this.leafletFields = fromVuex("leafletFields")
      this.employees = fromVuex("employees")
      this.fields = fromVuex("fields").filter(field => {
        let found = this.leafletFields.find(leaflet => leaflet.fieldId === field.id)
        if (found)
          return field
      })
      this.cars = fromVuex("cars").filter(c => c.carTypeId != 3)
      this.cartypes = fromVuex("cartypes").filter(c => c.id != 3)
      this.addTitles()
      this.initDOMData()
      this.nullActive()
      this.loading = false
    },
    clickCar(item) {
      this.nullActiveWithoutCar()
      item.active = !item.active
      if (item.active){
        this.carIds.push(item.id)
      } else {
        let index = this.carIds.indexOf(item.id)
        if (index !== -1)
          this.carIds.splice(index, 1)
      }
      this.$store.dispatch("actionSetFilterCars", this.carIds);
    },
    clickField(item, withEventBus = true) {
      if (!this.$store.getters.getModeEditPoints) {
        this.nullActive()
        item.active = !item.active
        this.$store.dispatch("actionSetFilterField", item.id);
        if (withEventBus){
          EventBus.$emit("MapChangeSelectedField", item.id)
        }
      }
    },
    clickEmployee(item) {
      this.nullActive()
      item.active = !item.active
      this.$store.dispatch("actionSetFilterEmployee", item.id);
    },
    nullActive() {
      this.nullActiveArray(this.filteredFields)
      this.nullActiveArray(this.filteredCars)
      this.nullActiveArray(this.filteredEmployees)
      this.carIds = []
      this.reRender()
    },
    nullActiveWithoutCar() {
      this.nullActiveArray(this.filteredFields)
      this.nullActiveArray(this.filteredEmployees)
      this.reRender()
    },
    nullActiveArray(array) {
      array.forEach(a => {
        a.active = false
        return a
      })
    },
    applyFilter(id, type) {
      this.changeActiveContainer(type)
      if (type === "field"){
        let item = this.filteredFields.find(item => item.id === id)
        if (item) {
          this.clickField(item, false)
        }
      } else if (type === "employee"){
        let found = this.filteredEmployees.find(item => item.id === id)
        if (found) {
          this.clickEmployee(found)
        }
      } else if (type === "car"){
        let found = this.filteredCars.find(item => item.id === id)
        if (found) {
          this.clickCar(found)
        }
      }
    },
    changeActiveContainer(val) {
      if (!this.$store.getters.getModeEditPoints) {
        this.activeContainer = val
        Object.keys(this.activeContainerClass).forEach(key => this.activeContainerClass[key] = false)
        this.activeContainerClass[val] = true
      }
    },
    nullSearch() {
      this.searchText = ""
      this.nullActive()
      this.$store.dispatch("actionSetFilterBy", "def");
    },
    toggleSpoiler(cartype) {
      cartype.active = !cartype.active
      this.reRender()
    },
    addTitles() {
      this.titleCar = `Машины (${this.cars.length})`
      this.titleField = `Поля (${this.fields.length})`
      this.titleEmployee = `Водители (${this.employees.length})`
    },
    reRender() {
      this.rerender = !this.rerender
    }
  }
}

</script>

<style lang="stylus" scoped>
.map-main-filter
  float left
  width 100%
  padding 15px 10px
  box-sizing border-box
.search-input
  float left
  width 230px
  box-sizing border-box
.search-reset
  float left
  width calc(100% - 230px)
  font-size 12px
  cursor pointer
  color #20a0ff
  box-sizing border-box
.filter-contents
  float left
  width 100%
  margin-top 15px
  .fc-icons
    float left
    width 30px
    margin 0 15px 0 0
  .fc-container
    float left
    width calc(100% - 45px)
    .fc-row
      float left
      width 100%
      height auto
      line-height 26px
      font-size 12px
      cursor pointer
      padding 0px 52px 0 5px
      box-sizing border-box
      position relative
      &:after
        display none
        content '\2713'
        color #08ff00
        color #20a0ff
        position absolute
        top 0px
        right 5px
      &:hover
        background #858585
      &.active
        background #525252
        &:after
          display block

.fc-row-car
  position relative
  &:before
    content ''
    position relative
    margin-right 5px
    font-size 16px
    color rgba(0,0,0,0)
  &.green
    &:before
      content '\25A3'
      color #0f0
  &.yellow
    &:before
      content '\25A3'
      color #ff0
  &.grey
    &:before
      content '\25A3'
      color #808080
  &.red
    &:before
      content '\25A3'
      color #f00
  &.white
    &:before
      content ''
      color rgba(0,0,0,0)

.fc-accord
  float left
  width 100%
  margin-bottom 10px
  font-size 12px
  span
    float left
    width auto
    color #20a0ff
    margin-right 5px
  .fc-accordeon
    float left
    width 100%
    margin 0
    height 20px
    cursor pointer

.fc-spoiler
  float left
  width 100%
  display none
  &.active
    display block

.fc-icon
  float left
  width 30px
  height 30px
  margin 0 0 10px
  cursor pointer
  background-size cover
  border 1px solid #fff
  &.field
    background-image url('~assets/field.png')
  &.employee
    background-image url('~assets/male-user-manager.svg')
  &.car
    background-image url('~assets/tractor-front.svg')
  &:hover
    border 1px solid #20a0ff
  &.active
    box-shadow 1px 1px 20px #20a0ff
    border 1px solid #20a0ff

</style>

