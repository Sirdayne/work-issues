<template lang="pug">
.cols(v-loading="!ready", element-loading-text="Загружается...")
  .dashboard-page(v-if="ready")
    .dashboard-sidebar
      .ds-link(  v-scroll-to="'#scroll-structures'" ) Структуры
      .ds-link(  v-scroll-to="'#scroll-works'" ) Работы
      router-link(:to="`/agrostream/dashboard/`")
        .ds-link На главную

    .dashboard-content
      section.dashboard-section#dashboard-container
        .dashboard-part(v-if="cultures.length")
          .dashboard-title.scroll-structure
            h2 Работы - {{ ourWork.name }}

            h2( id="scroll-structures") Структура посева
            h3 по состоянию на {{ elSliderDate1 }}
            .dashboard-options
              .dashboard-option
                p Общая площадь
                span {{ sumAreaFields }}
              .dashboard-option
                p Под посевами
                span {{ sowingAreasNum }}
              .dashboard-option
                p Средний балбонитет
                span {{ averageBonitet }}
              .dashboard-option
                p Количество полей
                span {{ numberFields }}
          .dashboard-container
            .el-slider-first-col
              .fc-row(v-for="culture in firstCultures")
                p {{ culture.name }}
                p площадь {{ culture.area }}
              .fc-row( v-if="otherCultures.length", @click="otherCulturesShow()", class="fc-row-show")
                p Прочие культуры
                .fc-row-others-icon( :class="{ active: otherCulturesDisplay }" )
              .fc-row-others( v-if="otherCulturesDisplay")
                .fc-row(v-for="culture in otherCultures")
                  p {{ culture.name }}
                  p площадь {{ culture.area }}

            .el-slider-container
              el-slider(id="el-slider-1", v-model="value1", :show-tooltip="true", :max="max", :min="min", :format-tooltip="formatTooltip")
              .el-slider-inner
                .el-slider-row(v-for="culture in firstCultures")

                  .el-slider-part(style="width: 25%", class="red")
                  .el-slider-part(style="width: 25%", class="green")
                  .el-slider-part(style="width: 25%", class="yellow")
                  .el-slider-part(style="width: 25%", class="pur")
                .el-slider-row( v-if="otherCultures.length" )

                  .el-slider-part(style="width: 25%", class="red")
                  .el-slider-part(style="width: 25%", class="green")
                  .el-slider-part(style="width: 25%", class="yellow")
                  .el-slider-part(style="width: 25%", class="pur")
                .el-slider-row-others( v-if="otherCulturesDisplay")
                  .el-slider-row(v-for="culture in otherCultures")

                    .el-slider-part(style="width: 25%", class="red")
                    .el-slider-part(style="width: 25%", class="green")
                    .el-slider-part(style="width: 25%", class="yellow")
                    .el-slider-part(style="width: 25%", class="pur")

        .dashboard-part(v-if="newWorks.length")
          .dashboard-title.scroll-works
            h2( id="scroll-works" ) Работы
            h3 по состоянию на {{ elSliderDate2 }}
            .dashboard-options
              .dashboard-option
                p План
                span {{ worksAreas }}
              .dashboard-option
                p Выполнено
                span {{ worksDonePlan }}
              .dashboard-option
                p % от плана
                span {{ worksPercentagePlan }}
              .dashboard-option
                p выполнено
                span {{ worksDoneDay }}


          .dashboard-container
            .el-slider-first-col

              .fc-row( v-for="work in firstWorks")
                p {{ work.name }}
              .fc-row( v-if="otherWorks.length", @click="otherWorksShow()", class="fc-row-show")
                p Прочее
                .fc-row-others-icon( :class="{ active: otherWorksDisplay }" )
              .fc-row-others( v-if="otherWorksDisplay")
                .fc-row( v-for="work in otherWorks")
                  p {{ work.name }}

            .el-slider-container
              el-slider(id="el-slider-2", v-model="value2", :show-tooltip="true", :max="maxWorksDates", :min="min", :format-tooltip="formatTooltipWorksDates")
              .el-slider-inner
                .el-slider-row( v-for="work in firstWorks")
                  .el-slider-part( v-for="step in work.fills", :style="oneStep", :class="step" )
                .el-slider-row( v-if="otherWorks.length" )

                .el-slider-row-others( v-if="otherWorksDisplay")
                  .el-slider-row(v-for="work in otherWorks")
                    .el-slider-part( v-for="step in work.fills", :style="oneStep", :class="step" )

</template>

<script>
import httpQueryV2 from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import VueChartist from 'v-chartist'
import $ from 'jquery'
import moment from 'moment'
import './dashboard.styl'

import {EventBus} from 'services/EventBus';

export default {
  mixins: [
    RecordsLoaderV2
  ],
  components: {
    VueChartist
  },
  created() {
    this.fetchEntities([
      'technologyRecipe',
      'cultures',
      'works',
      'fields',
      'AreaAssignments',
      'seedLimits',
      'cttops',
      'operations',
      'workDates'
    ], this.afterFetch );
  },
  updated() {
    let elSlider1 = document.querySelector('#el-slider-1 .el-slider__button')
    if (elSlider1)
      elSlider1.style.height = (60 * this.cultures.length + 5) + 60 + "px";

    let elSlider2 = document.querySelector('#el-slider-2 .el-slider__button')
    if (elSlider2)
      elSlider2.style.height = (60 * this.newWorks.length + 5) + 60 + "px";
  },
  mounted() {
    // для vue-scroll, scrolling - надо поменять высоту на %
    var elApp = document.querySelector('#app-container');
    elApp.style.height = "100%";
    //scroll в начале
    this.$scrollTo('#dashboard-container');
  },
  data() {
    return {
      areaAssignmentsSubOperationId: [],
      unique: [],
      dates: [
        { name: '1 апр. 2017 г.', area: 466000, underCrops: 240000 ,averageBalbonitet: 120 ,numberAreas: 20 },
        { name: '2 апр. 2017 г.', area: 466001, underCrops: 240001 ,averageBalbonitet: 121 ,numberAreas: 21  },
        { name: '3 апр. 2017 г.', area: 466002, underCrops: 240002 ,averageBalbonitet: 122 ,numberAreas: 22 },
        { name: '4 апр. 2017 г.', area: 466003, underCrops: 240003 ,averageBalbonitet: 123 ,numberAreas: 23 }
      ],
      pies:[
        { pieOne: 10, pieTwo: 15, pieThree: 20, pieFour: 25, pieFive: 30 },
        { pieOne: 11, pieTwo: 14, pieThree: 19, pieFour: 26, pieFive: 30 },
        { pieOne: 12, pieTwo: 13, pieThree: 18, pieFour: 27, pieFive: 30 },
        { pieOne: 13, pieTwo: 12, pieThree: 17, pieFour: 28, pieFive: 30 },
      ],
      min: 0,
      value1: 9,
      value2: 1,
      value3: 25,
      elSliderDate1: '',
      elSliderDate2: '',
      otherCulturesDisplay: false,
      otherWorksDisplay: false,
      vuexWorks: null,
      vuexCultures: null,
      vuexSeedLimits: null,
      vuexWorkDates: null,
      vuexCttops: null,
      vuexOperations: null,
      vuexRecipes: null,
      vuexFields: null,
      vuexAreaAssignments: null,
      routeId: this.$route.params.id
    }
  },
  methods: {
    afterFetch(){
      this.vuexWorks = this.fromVuex('works');
      this.vuexCultures = this.fromVuex('cultures');
      this.vuexSeedLimits = this.fromVuex('seedLimits');
      this.vuexWorkDates = this.fromVuex('workDates');
      this.vuexCttops = this.fromVuex('cttops');
      this.vuexOperations = this.fromVuex('operations');
      this.vuexRecipes = this.fromVuex('technologyRecipe');
      this.vuexFields = this.fromVuex('fields');
      this.vuexAreaAssignments = this.fromVuex('AreaAssignments');
    },
    otherCulturesShow(){
      this.otherCulturesDisplay = !this.otherCulturesDisplay;
    },
    otherWorksShow(){
      this.otherWorksDisplay = !this.otherWorksDisplay;
    },
    formatTooltip(val) {
      if (val != null){
        this.elSliderDate1 = this.dates[val].name;
        return this.dates[val].name;
      }
    },
    formatTooltipWorksDates(val) {
      if ((val != null) && (this.worksDates.length)) {
        this.elSliderDate2 = this.worksDates[val].daterus;
        return this.worksDates[val].daterus;
      }
    }
  },
  computed: {
    oneStep() {
      let worksDates = this.worksDates;

      let oneStep = (100 / worksDates.length);

      oneStep = 'width: ' + oneStep + '%';

      return oneStep;
    },
    ourWork() {
      let ourWork = this.cttopsUnique.find( x => x.id == this.routeId);
      return this.cttopsUnique.length && ourWork;
    },
    //культуры
    cultures() {
      let culturesArray = this.vuexCultures;
      let seedsArray = this.vuexSeedLimits;
      //достаем только cultureId и оставляем только уникальные ID
      let seedsFiltered = seedsArray.map(x => x.cultureId).filter((v, i, a) => a.indexOf(v) === i);
      //из культур оставляем только те что совпадают с culturedId
      culturesArray = culturesArray.filter( x => seedsFiltered.indexOf(x.id) >= 0);
      //добавляем площади по культурам из seed в новое свойство area

      let mappingId = {};
      culturesArray.map( (v, i, a) => { mappingId[v.id] = i; v.area = 0; });

      seedsArray.forEach( x => {
        let culArea = culturesArray[mappingId[x.cultureId]];
        culArea.area += x.area ;
      });
      return culturesArray;
    },
    firstCultures() {
      let firstCultures = this.cultures.slice(0,5);
      return firstCultures;
    },
    otherCultures() {
      let otherCultures = this.cultures.slice(5, this.cultures.length);
      return otherCultures;
    },
    sumAreaFields() {
      let sumAreaFields = 0;
      this.vuexFields.forEach(d => {
        sumAreaFields += parseInt(d.area);
      });
      return sumAreaFields;
    },
    sowingAreasNum() {
      /*
      //прошлые вычисления
      let sowingAreasNum = 0;
      let sowingWorkTypes = this.vuexWorkTypes.filter(x => x.isSowing).map(x => x.id);
      //массив из айдишников которые в works
      let sowingWorks = this.works.filter(x => sowingWorkTypes.indexOf(x.planWorkTypeId) >= 0).map(x => x.id);
      //суммируем площадь у areaAssignments у которых айдишники равны suboperationID
      let area = 0;
      this.vuexAreaAssignments.filter(x => sowingWorks.indexOf(x.subOperationId) > 0).map(x => area += x.area);
      sowingAreasNum = area.toFixed(2);
      return sowingAreasNum;
      */

      let sumSowing = 0;
      this.cultures.forEach(d => {
        sumSowing += parseInt(d.area);
      });
      return sumSowing;
    },
    //изменен, считатет только для одной культуры
    averageBonitet() {
      let averageBonitet = 0;
      this.vuexFields.forEach(d => {
        averageBonitet += parseInt(d.area) * parseInt(d.bonitetScore);
      });
      averageBonitet /= this.sumAreaFields;
      averageBonitet = averageBonitet.toFixed(2);
      return averageBonitet;
    },
    numberFields() {
      return this.vuexFields ? this.vuexFields.length : 0;
    },
    //работы
    works(){
      let assigns = this.cttopsUnique;
      //need resolve
      if ((this.vuexCttops.length) && (this.vuexOperations.length)){
        let newWorks = assigns.map( x => { x.name = ''; return x });
        assigns = newWorks.map( x => {
          let neededOperation = this.vuexOperations.find( d => d.id == x.technologicalOperationId );
          x.name = neededOperation.name;
          return x;
        });
      }
      return assigns;
    },
    worksFiltered(){
      //берем только те WorkTypes, которые совпадают с айдишниками в массиве ourWork.workTypeParameterPlanWorkTypesIds
      let worksFiltered = this.vuexWorks;
      if (this.ourWork){
        worksFiltered = worksFiltered.filter( x => {
          if( this.ourWork.workTypeParameterPlanWorkTypesIds.indexOf(x.id) > -1 )
            return x;
        });
      }

      return worksFiltered;
    },
    newWorks(){

      let newWorks = this.worksFiltered;
      let worksDates = this.worksDates;
      let workingDates = this.workingDates;
      //делаем пустой массив размером с worksDates
      let fills = Array(worksDates.length).fill('');
      //заполняем свойства fills у worksFiltered пустыми массивами
      newWorks.forEach( x => x.fills = fills.slice() );
      //если id из planWorkTypeId равен id у workingDates(это тоже workTypeParameterPlanWorkTypesIds) то заполням fills
      newWorks.forEach( x => {
        workingDates.forEach( d => {
          if (x.planWorkTypeId == d.id){
            d.fills.forEach(function(item, i, arr){
              if (item != '')
                x.fills[i] = item;
            });
          }
        });
      });

      return newWorks;

    },
    cttopsUnique(){
      //достаем только уникальные айди
      let cttopsUnique = this.vuexCttops.map(x => x.technologicalOperationId).filter((item, i, arr) => arr.indexOf(item) === i);
      //делаем массив объектов с нужными айди и свойствами
      let cttopsUniqueObject = [];

      let i = 1;
      cttopsUnique.forEach( x => {
        cttopsUniqueObject.push({ id: i, technologicalOperationId: x, name: '', workTypeParameterPlanWorkTypesIds: [] });
        i++;
      });
      //достаем массивы с cttops.x.workTypeParameterPlanWorkTypesIds и ложим в наш
      cttopsUniqueObject.forEach( x => {
        this.vuexCttops.forEach( d => {
          if (d.technologicalOperationId == x.technologicalOperationId){
            x.workTypeParameterPlanWorkTypesIds = x.workTypeParameterPlanWorkTypesIds.concat( d.workTypeParameterPlanWorkTypesIds );
          }
        });
      });
      //оставляем только уникальные id в нашем workTypeParameterPlanWorkTypesIds
      cttopsUniqueObject.forEach( x => {
        x.workTypeParameterPlanWorkTypesIds = x.workTypeParameterPlanWorkTypesIds.filter((item, i, arr) => arr.indexOf(item) === i);
        return x;
      });
      return cttopsUniqueObject;
    },
    firstWorks() {
      let firstWorks = this.newWorks.slice(0,5);
      return firstWorks;
    },
    otherWorks() {
      let otherWorks = this.newWorks.slice(5, this.newWorks.length);
      return otherWorks;
    },
    worksAreas(){
      //берем только айдишники у работ
      let worksId = this.worksFiltered.map(w => w.id);
      //фильтруем те рецепты у которых хотя бы 1 workTypeParameterPlanWorkTypeId совпадает с worksId
      let recipesFilter = this.vuexRecipes.filter(r => {
        return r.recieptWorks.some(
          t => {
            return worksId.indexOf( t.workTypeParameterPlanWorkTypeId ) > -1
          }
        )
      });
      //суммируем площади по отфильтрованному массиву из technologyRecieptSowings -> area
      let recipesFilterSum = recipesFilter.reduce( (sum, value) => {
        return ( sum + value.technologyRecieptSowings.reduce(
          (sum1, value1) =>  sum1 + value1.area , 0
        ))
      }, 0);
      return recipesFilterSum;
    },
    worksDonePlan() {
      let worksId = this.worksFiltered.map(w => w.id);
      let worksDonePlan = 0;

      this.vuexAreaAssignments.forEach( d => {
        if (d.area > 0){
          if (worksId.indexOf(d.subOperationId) > -1)
            worksDonePlan += d.area
        }
      });

      return worksDonePlan.toFixed(2);
    },
    worksPercentagePlan() {
      let worksPercentagePlan = 0;
      worksPercentagePlan = this.worksDonePlan / this.worksAreas * 100;
      if (isNaN(worksPercentagePlan))
        worksPercentagePlan = 0;
      return worksPercentagePlan.toFixed(2);
    },
    worksDates() {

      let worksId = this.worksFiltered.map(w => w.id);

      let worksDates = [];
      //находим минимальную и макс даты в areaassignments -> datetimerange

//        let minDate = new Date( this.vuexAreaAssignments[0].dateTimeRange.start );
//        let maxDate = new Date( this.vuexAreaAssignments[0].dateTimeRange.end );
//        this.vuexAreaAssignments.forEach(d => minDate = (new Date(d.dateTimeRange.start) < minDate) ? new Date(d.dateTimeRange.start) : minDate);
//        this.vuexAreaAssignments.forEach(d => maxDate = (new Date(d.dateTimeRange.end) > maxDate) ? new Date(d.dateTimeRange.end) : maxDate);

      let minDate = this.vuexAreaAssignments.reduce( (min, value) => {
        let date = new Date(value.dateTimeRange.start);
        min = date < min ? date : min;
        return min;
      }, new Date('2100-06-01T20:00:00'));

      let maxDate = this.vuexAreaAssignments.reduce( (max, value) => {
        let date = new Date(value.dateTimeRange.end);
        max = date > max ? date : max;
        return max;
      }, new Date('1999-06-01T20:00:00'));

      //заполняем worksDates датами
      while( maxDate > minDate ){
        //lang('ru')
        worksDates.push({ date: moment(minDate).format(), area: 0, daterus: moment(minDate).locale('ru').format('ll')});
        minDate.setDate(minDate.getDate() + 1);
      }
      //прибавляем к worksDates.area только те что лежат в диапазоне datetimerange
      worksDates.forEach( d => {
        this.vuexAreaAssignments.forEach( x => {
          if (x.area > 0){
            if (worksId.indexOf(x.subOperationId) > -1) {
              let startDate = new Date(moment(x.dateTimeRange.start).format('L'));
              let endDate = new Date(moment(x.dateTimeRange.end).format('L'));
              let todayDate = new Date(moment(d.date).format('L'));
              // format dates to one format
              if ((startDate <= todayDate) && (todayDate <= endDate)) {
                d.area += x.area;
              }
            }
          }
        })
      });

      return worksDates;
    },
    workingDates(){
      let works = this.works;
      let workDates = this.vuexWorkDates;
      let worksDates = this.worksDates;

      let workTypeUnique = [];

      //ложим в пустой массив только workTypeParameterPlanWorkTypesIds
      works.forEach( x => {
        workTypeUnique = workTypeUnique.concat(x.workTypeParameterPlanWorkTypesIds);
      });
      //оставляем только уникальные
      workTypeUnique  = workTypeUnique.filter((v, i, a) => a.indexOf(v) === i).sort();

      let workingDates = [];
      //создаем пустой массив размером с worksDates и заполняем нулями
      let fills = Array(worksDates.length).fill('');
      //let fills = Array(worksDates.length).fill(0);

      //добавляем default элементы в массив workingDates
      workTypeUnique.forEach(function(item, i, arr) {
        workingDates.push({ id: item, fills: fills.slice() });
      });

      //если id workingdates равен одному из id у workDates.workTypeParameterPlanWorkTypesIds
      workingDates.forEach( x => {
        workDates.forEach( d => {

          d.workTypeParameterPlanWorkTypesIds.forEach(function(item, i, arr) {
            //если id workingdates равен одному из id у workDates.workTypeParameterPlanWorkTypesIds
            if ( x.id == item ){
              //то заполняем наш workingDates.fills от startDate до endDate
              let startDate = moment( d.startDate ).format();
              let endDate = moment(d.endDate).format();

              //находим разницу в днях - сколько элементов для заполнения(единицами)
              let startDateMoment = new Date(d.startDate);
              let endDateMoment = new Date(d.endDate);

              startDateMoment = moment([startDateMoment.getFullYear(), startDateMoment.getMonth(), startDateMoment.getDate()]);
              endDateMoment = moment([endDateMoment.getFullYear(), endDateMoment.getMonth(), endDateMoment.getDate()]);

              let diffMoment = 0;
              diffMoment = endDateMoment.diff(startDateMoment, 'days');

              let firstIndex = 0;
              firstIndex = worksDates.findIndex( y => moment( y.date ).format('L') == moment( startDate ).format('L') );
              //заполняем workingDates.fills единицами
              if (( firstIndex > 0 ) && ( diffMoment > 0)) {
                x.fills.fill('blue-dark-dim', firstIndex, firstIndex + diffMoment);
                //x.fills.fill(1, firstIndex, firstIndex + diffMoment);
              }

            }

          });

        });


      });

      return workingDates;
    },
    maxWorksDates() {
      return this.worksDates.length && this.worksDates.length-1;
    },
    worksDoneDay() {
      return this.worksDates.length && this.worksDates[this.value2].area.toFixed(2);
    },
    max() {
      return this.dates.length-1;
    },
    costPlan() {
      return this.dates[this.value3].area;
    },
    costFact() {
      return this.dates[this.value3].underCrops;
    },
    costPercentagePlan() {
      return this.dates[this.value3].averageBalbonitet;
    },
    costLastYear() {
      return this.dates[this.value3].numberAreas;
    },
    costDoneDay() {
      return this.dates[this.value3].numberAreas;
    },
    data() {
      return {
        series:
          [{
            value: this.pies[this.value1].pieOne,
            name: 'легенда 1',
            className: 'red',
            meta: 'Meta One'
          }, {
            value: this.pies[this.value1].pieTwo,
            name: 'легенда 2',
            className: 'green',
            meta: 'Meta Two'
          }, {
            value: this.pies[this.value1].pieThree,
            name: 'легенда 3',
            className: 'yellow',
            meta: 'Meta Three'
          }, {
            value: this.pies[this.value1].pieFour,
            name: 'легенда 4',
            className: 'pur',
            meta: 'Meta Four'
          }]
      }
    },
    options() {
      var thisSeriesSum = this.seriesSum;
      return{
        width: "300px",
        height: "250px",
        chartPadding: 50,
        labelOffset: 20,
        labelPosition: 'inside',
        labelInterpolationFnc: function(value) {
          return Math.round( value / thisSeriesSum * 100 ) + '%';
        }
      }
    },
    seriesSum() {
      return this.data.series.reduce(function(a,b) {return a + b.value}, 0);
    }
  }
}
</script>
