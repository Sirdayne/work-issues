<template lang="pug">
div(v-loading="loading", element-loading-text="Загружается...")
  el-form(label-width="200px", label-position="left", v-if="ready")
    el-form-item(label="Поле")
      el-select(v-model="form.fieldId", filterable)
        el-option(
          v-for="item in fields",
          :key="item.id",
          :label="item.displayString",
          :value="item.id"
        )

    el-form-item(label="Площадь")
      el-input-number(v-model="form.area", :max="maxArea")

    el-form-item(label="Культура")
      el-select(v-model="form.cultureId", filterable)
        el-option(
          v-for="item in cultures",
          :key="item.id",
          :label="item.name",
          :value="item.id"
        )

    el-form-item(label="Сорт")
      el-select(v-model="form.cultureSortId", filterable)
        el-option(
        v-for="item in sortsByCulture",
        :key="item.id",
        :label="item.name",
        :value="item.id"
        )

    el-form-item(label="Макс. - мин. млн.га")
      div(v-if="cultureFieldZone")
        div {{ minSeedMln }} - {{ maxSeedMln }}
      div(v-else)
        div Норма млн/га не найден в справочнике - редактирование невозможно

    el-form-item(label="Норма млн/га")
      el-input-number(v-model="form.seedMillionNumber", :min="minSeedMln", :max="maxSeedMln", :step="0.05")

    el-form-item(label="Репродукция")
      el-select(v-model="form.reproductionId", filterable)
        el-option(
        v-for="item in reproductions",
        :key="item.id",
        :label="item.name",
        :value="item.id"
        )

    el-form-item(label="Чистота семян")
      el-input-number(v-model="form.seedFrequency")

    el-form-item(label="Всхожесть семян")
      el-input-number(v-model="form.seedGermination")

    el-form-item(label="Масса 1000 семян")
      el-input-number(v-model="form.seedWeight")

    el-form-item(label="Конечный продукт")
      el-select(v-model="form.cultureParameterId", filterable)
        el-option(
          v-for="item in cultureparameters",
          :key="item.id",
          :label="item.name",
          :value="item.id"
        )

    el-form-item
      el-button(v-if="showingSecondCulture", size="small", type="danger", @click="hideSecondCulture()") Скрыть
      el-button(v-else, size="small", type="primary", @click="showSecondCulture()") Показать вторую культуру

    div(v-if="showingSecondCulture")
      el-form-item(label="Вторая культура")
        el-select(v-model="form.secondCultureId", filterable, clearable)
          el-option(
          v-for="item in cultures",
          :key="item.id",
          :label="item.name",
          :value="item.id"
          )

      el-form-item(label="Второй сорт")
        el-select(v-model="form.secondCultureSortId", filterable, clearable)
          el-option(
          v-for="item in sortsBySecondCulture",
          :key="item.id",
          :label="item.name",
          :value="item.id"
          )

      el-form-item(label="Макс. - мин. млн.га")
        div(v-if="secondCultureFieldZone")
          div {{ secondMinSeedMln }} - {{ secondMaxSeedMln }}
        div(v-else)
          div Норма млн/га не найден в справочнике - редактирование невозможно

      el-form-item(label="Вторая норма млн/га")
        el-input-number(v-model="form.secondSeedMillionNumber", :min="secondMinSeedMln", :max="secondMaxSeedMln", :step="0.05")

      el-form-item(label="Вторая репродукция")
        el-select(v-model="form.secondReproductionId", filterable, clearable)
          el-option(
          v-for="item in reproductions",
          :key="item.id",
          :label="item.name",
          :value="item.id"
          )

      el-form-item(label="Вторая чистота семян")
        el-input-number(v-model="form.secondSeedFrequency")

      el-form-item(label="Вторая всхожесть семян")
        el-input-number(v-model="form.secondSeedGermination")

      el-form-item(label="Вторая масса 1000 семян")
        el-input-number(v-model="form.secondSeedWeight")

      el-form-item(label="Второй конечный продукт")
        el-select(v-model="form.secondCultureParameterId", filterable, clearable)
          el-option(
          v-for="item in cultureparameters",
          :key="item.id",
          :label="item.name",
          :value="item.id"
          )

    el-button(type="primary", :loading="loading", @click="formPut") Изменить
</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'
  import nprogress from 'lib/NProgress'
  import { Message } from 'element-ui'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController,
    ],
    props: ['form'],
    data() {
      return {
        fields: [],
        cultures: [],
        sorts: [],
        reproductions: [],
        culturefieldzones: [],
        cultureparameters: [],
        maxArea: 0,
        maxSeedMln: 0,
        minSeedMln: 0,
        cultureFieldZone: null,
        secondMaxSeedMln: 0,
        secondMinSeedMln: 0,
        secondCultureFieldZone: null,
        loading: true,
        endpoint: 'SeedLimits/',
        selectedField: null,
        showingSecondCulture: false,
      }
    },
    created() {
      this.fetchEntities([
        'fields',
        'cultures',
        'sorts',
        'reproductions',
        'culturefieldzones',
        'cultureparameters',
      ], this.afterFetch );
    },
    computed: {
      sortsByCulture() {
        let array = []
        if (this.sorts.length > 0)
        this.sorts.forEach(sort => {
          if (sort.cultureId == this.form.cultureId){
            array.push(sort)
          }
        })
        return array
      },
      sortsBySecondCulture() {
        let array = []
        if (this.sorts.length > 0)
          this.sorts.forEach(sort => {
            if (sort.cultureId == this.form.secondCultureId){
              array.push(sort)
            }
          })
        return array
      },
    },
    watch: {
      'form.fieldId' (val) {
        this.updateAllMinMax()
      },
      'form.cultureId' (val) {
        this.updateSeedMlnMinMax()
      },
      'form.secondCultureId' (val) {
        this.updateSecondSeedMlnMinMax()
      },
    },
    methods: {
      updateAllMinMax() {
        this.updateFieldMaxArea()
        this.updateSeedMlnMinMax()
        this.updateSecondSeedMlnMinMax()
      },
      updateFieldMaxArea() {
        this.selectedField = null
        if (this.fields.length > 0) {
          this.selectedField = this.fields.find(f => f.id === this.form.fieldId)
          this.maxArea = this.selectedField ? this.selectedField.area : 0
        }
      },
      updateSeedMlnMinMax() {
        this.cultureFieldZone = null
        if (this.culturefieldzones.length > 0 && this.selectedField) {
          this.cultureFieldZone = this.culturefieldzones.find(cfz => cfz.cultureId == this.form.cultureId && cfz.fieldZoneId == this.selectedField.fieldZoneId)
          this.maxSeedMln = this.cultureFieldZone ? this.cultureFieldZone.maxNumber : 0
          this.minSeedMln = this.cultureFieldZone ? this.cultureFieldZone.minNumber : 0
        }
        this.form.seedMillionNumber = 0
      },
      updateSecondSeedMlnMinMax() {
        this.secondCultureFieldZone = null
        if (this.culturefieldzones.length > 0 && this.selectedField) {
          this.secondCultureFieldZone = this.culturefieldzones.find(cfz => cfz.cultureId == this.form.secondCultureId && cfz.fieldZoneId == this.selectedField.fieldZoneId)
          this.secondMaxSeedMln = this.secondCultureFieldZone ? this.secondCultureFieldZone.maxNumber : 0
          this.secondMinSeedMln = this.secondCultureFieldZone ? this.secondCultureFieldZone.minNumber : 0
        }
        this.form.secondSeedMillionNumber = 0
      },
      afterFetch(){
        this.fields = this.fromVuex('fields')
        this.cultures = this.fromVuex('cultures')
        this.sorts = this.fromVuex('sorts')
        this.reproductions = this.fromVuex('reproductions')
        this.culturefieldzones = this.fromVuex('culturefieldzones')
        this.cultureparameters = this.fromVuex('cultureparameters')

        this.updateAllMinMax()

        this.loading = false
      },
      formPut(){
        let endpoint = this.endpoint + this.$root.context.organization;
        EventBus.$emit("SeedLimitsChanged")
        this.loading = true
        http.put(endpoint, this.form).then(() => {
          this.loading = false
        });
      },
      showSecondCulture() {
        this.showingSecondCulture = true
      },
      hideSecondCulture() {
        this.showingSecondCulture = false
      }
    }
  }

</script>

<style>

</style>
