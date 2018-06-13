<template lang="pug">
.map-main-filter(v-loading="loading", element-loading-text="Загрузка...")
  el-input.search-input(v-model="searchText", @change="searchFilter()" icon="search", placeholder='Поиск')
  el-button.search-reset(type="text", @click="nullSearch()", title="Сбросить фильтр") Сбросить
  .filter-contents(:class="{'rerender': rerender}")
    .fc-icons
      .fc-icon.car(@click="changeActiveContainer('car')", :class="{'active': activeContainerClass.car}")
      .fc-icon.field(@click="changeActiveContainer('field')", :class="{'active': activeContainerClass.field}")
      .fc-icon.employee(@click="changeActiveContainer('employee')", :class="{'active': activeContainerClass.employee}")
    .fc-container(v-if="activeContainer === 'car'")
      .fc-accord(v-for="cartype in cartypes")
        .fc-accordeon(@click="toggleSpoiler(cartype)") {{cartype.name}} ({{cartype.carsTotal}})
          span(v-if="cartype.active") -
          span(v-else) +
        .fc-spoiler(:class="{'active': cartype.active}")
          .fc-row(v-for="item in cartype.cars", @click="clickCar(item)", :class="{'active': item.active}") {{ item.displayString }}
    .fc-container(v-else-if="activeContainer === 'field'")
      .fc-row(v-for="item in filteredFields", @click="clickField(item)", :class="{'active': item.active}") {{ item.newName }}
    .fc-container(v-else-if="activeContainer === 'employee'")
      .fc-row(v-for="item in filteredEmployees", @click="clickEmployee(item)", :class="{'active': item.active}") {{ item.fullName }}
</template>

<script>
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import {deepClone} from 'lib/utils'

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  data() {
    return {
      searchText: '',
      employees: [],
      fields: [],
      cars: [],
      cartypes: [],
      rerender: false,
      activeContainer: 'car',
      activeContainerClass: {
        car: true,
        field: false,
        employee: false
      },
      filteredFields: [],
      filteredCars: [],
      filteredEmployees: [],
      dispatchCars: [],
      loading: true
    }
  },
  created() {
    this.fetchEntities([
      'leafletFields',
      'cars',
      'cartypes',
      'fields',
      'employees'
    ], this.afterFetch );
  },
  methods: {
    searchFilter() {
      this.filteredFields = deepClone(this.fields).filter(x => x.newName.includes(this.searchText))
      this.filteredEmployees = deepClone(this.employees).filter(x => x.fullName.includes(this.searchText))
      this.filteredCars = deepClone(this.cars).filter(x => x.displayString.includes(this.searchText))
      this.modifyCarTypes()
    },
    initDOMData() {
      this.filteredFields = deepClone(this.fields)
      this.filteredEmployees = deepClone(this.employees)
      this.filteredCars = deepClone(this.cars)
      this.modifyCarTypes(true)
    },
    afterFetch(){
      this.employees = this.fromVuex('employees')
      this.fields = this.fromVuex('fields')
      this.cars = this.fromVuex('cars')
      this.cartypes = this.fromVuex('cartypes').filter(c => c.id != 3)
      this.initDOMData()
      this.loading = false

      this.nullActive()
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
    changeActiveContainer(val) {
      this.activeContainer = val
      Object.keys(this.activeContainerClass).forEach(key => this.activeContainerClass[key] = false)
      this.activeContainerClass[val] = true
    },
    clickCar(item) {
      this.nullActiveWithoutCar()
      item.active = !item.active
      if (item.active){
        this.dispatchCars.push(item.id)
      } else {
        let index = this.dispatchCars.indexOf(item.id)
        if (index !== -1)
          this.dispatchCars.splice(index, 1)
      }
      this.$store.dispatch('actionSetFilterCars', this.dispatchCars);
    },
    clickField(item) {
      this.nullActive()
      item.active = !item.active
      this.$store.dispatch('actionSetFilterField', item.id);
    },
    clickEmployee(item) {
      this.nullActive()
      item.active = !item.active
      this.$store.dispatch('actionSetFilterEmployee', item.id);
    },
    nullActive() {
      this.nullActiveArray(this.filteredFields)
      this.nullActiveArray(this.filteredCars)
      this.nullActiveArray(this.filteredEmployees)
      this.dispatchCars = []
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
    nullSearch() {
      this.nullActive()
      this.searchText = ''
      this.$store.dispatch('actionSetFilterBy', 'def');
    },
    toggleSpoiler(cartype) {
      cartype.active = !cartype.active
      this.reRender()
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

