<template lang="pug">
.panels
  update
  .panel-fields
    el-form(
      :model="item",
      :inline="true",
      :rules="rules",
      ref="form",
      :label-position="'top'"
    )
      el-form-item(label="Бригада", prop="brigadeId")
        el-select(v-model="item.brigadeId" clearable placeholder="Выбрать")
          el-option(
            v-for="b in brigades",
            :key="b.id",
            :label="b.name",
            :value="b.id"
            )
      el-form-item(label="Количество сорняков после обработки", prop="weedConditionId")
        el-select(v-model="item.weedConditionId" clearable placeholder="Выбрать" filterable)
          el-option(
          v-for="c in weedConditions",
          :key="c.id",
          :label="c.name",
          :value="c.id"
          )

    .weediness-fields
      template( v-for="field in fieldsData" )
        .field( @click="clickedField( field.id )", :class="{ 'field-active': field.clicked }") ({{field.newName}})
  .panel-bottom
    h2(class="tableHeading") Акт засоренности поля
    el-table(
      v-if="(tableData.length || loading) && fieldClicked",
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
      element-loading-text="Загружается...",
      )
      el-table-column(
        prop="date.startFormated",
        label="Дата обработки",
        header-align="center",
        width="200"
      )
      el-table-column(
        prop="workName",
        label="Работа",
        header-align="center",
        width="200"
      )
      el-table-column(
        label="Препараты",
        header-align="center",
        width="200"
      )
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryChemicalTreatments")
            el-tag {{ item.chemicalPreparationName }}

      el-table-column(
        prop="inspectionDateFormated",
        label="Дата обследования после обработки",
        header-align="center",
        width="200"
      )
      el-table-column(
        label="Вид сорняка",
        header-align="center",
        width="200"
      )
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryLimitWeedTypes")
            el-tag(:color="item.color") {{ item.weedTypeName }}

      el-table-column(
        label="Количество до обработки",
        header-align="center",
        width="200"
      )
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryLimitWeedTypes")
            el-tag(:color="item.color") {{ item.weedAmount }}

      el-table-column(
        label="Количество после обработки",
        header-align="center",
        width="200"
      )
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryLimitWeedTypes")
            el-tag(:color="item.color") {{ item.weedAmountEdited }}

      el-table-column(
        label="Операции",
        fixed="right",
        header-align="center",
        align="center",
        width="120"
      )
        template(slot-scope="scope")
          el-button(@click="update(scope.row.id)" size="small" icon="edit")
    .no-results(v-else) Нет результатов
    el-row(type="flex" v-if="(tableData.length || loading) && fieldClicked")
      el-col(:span="0")
        el-pagination(
          layout="total, prev, pager, next",
          :total="totalItems",
          :page-size="perPage",
          :current-page="currentPage",
          @current-change="onCurrentPageChange",
          @size-change="onPerPageChange",
        )

</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import moment from 'moment'
  import ListController from 'mixins/ListController'
  import update from './update.vue'

  export default {
    components: {
      update
    },
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        colors: {
          0: {
            color: '#8391a5',
            name: 'grey'
          },
          1: {
            color: '#FF8000',
            name: 'orange'
          },
          2: {
            color: '#74DF00',
            name: 'green'
          },
          3: {
            color: '#2E2EFE',
            name: 'blue'
          },
          4: {
            color: '#FFD100',
            name: 'yellow'
          }
        },
        watcher: 1,
        fields: [],
        fieldweediness: [],
        fieldIds: [],
        fieldClicked: false,
        item: {
          brigadeId: null,
          weedConditionId: "",
          fieldId: null,
        },
        rules: {
          brigadeId: [
              { required: true, type: 'integer', message: 'Поле обязательно', trigger: 'change' }
          ]
        },
        perPage: 5,
        currentPage: 1,
        loading: true,
      }
    },
    computed: {
      brigades() {
        let brigades = this.fromVuex('brigades')
        if (brigades && brigades.length) this.item.brigadeId = brigades[0].id
        return brigades;
      },
      weedConditions(){
        let array = [
          {
            id: 0,
            name: 'все'
          },
          {
            id: 1,
            name: 'определены'
          },
          {
            id: 2,
            name: 'не определены'
          }
          ];

        this.item.weedConditionId = array[0].id

        return array;
      },
      totalItems: function() {
        return this.tableData.length;
      },
      tableData: function() {
        let brigadeId = this.item.brigadeId
        let fieldId = this.item.fieldId
        let weedConditionId = this.item.weedConditionId
        if (this.fieldweediness.length) this.loading = true
        let tableData = this.fieldweediness.filter(function(record) {
          let brigade = record.brigadeId === brigadeId || !brigadeId
          let field = record.fieldId === fieldId || !fieldId
          let weedCondition = record.weedConditionId === weedConditionId || !weedConditionId
          return brigade && field && weedCondition
        })
        if (this.fieldweediness.length) this.loading = false
        console.log(tableData, 'tableData')
        return tableData
      },
      fieldsData: function() {
        let weedConditionId = this.item.weedConditionId
        let brigadeId = this.item.brigadeId
        let fieldsData = this.fields.filter(function(record) {
          let weedCondition = record.weedConditionId === weedConditionId || !weedConditionId
          let brigade = record.brigadeId === brigadeId || !brigadeId
          return brigade && weedCondition
        })
        console.log(fieldsData, 'fieldsData')
        return this.watcher && fieldsData;
      },
      fieldsFiltered(){
        return this.watcher && this.fields;
      }
    },
    created() {
      EventBus.$on('FieldWeediness.UpdateComponent.PutObjectCompleted', () => {
        this.refresh()
      });
      this.fetchEntities([
        'brigades',
        'fields',
        'fieldweediness',
      ], this.afterFetch );
    },
    methods: {
      afterFetch(){
        this.fieldweediness = this.fromVuex('fieldweediness').map(x => {
          x.date.startFormated = moment(x.date.start).format("DD.MM.YYYY")
          x.date.year = moment(x.date.start).year()
          x.inspectionDateFormated = moment(x.inspectionDate).format("DD.MM.YYYY")
          if (x.inspectionDateFormated == "Invalid date") {
            x.inspectionDateFormated = "нет даты";
            x.inspectionDate = moment().format("YYYY-MM-DDTHH:mm:ss");
          }
          let i = -1;
          let weedLength = x.chemistryLimitWeedTypes.length
          let weedCondition = 0;
          x.chemistryLimitWeedTypes.map(c => {
            if (i < 4) {
              i++;
            } else {
              i = 0;
            }
            c.color = this.colors[i].color;

            if (c.weedAmount != c.weedAmountEdited)
              weedCondition++

            return c;
          });
          if (weedLength == weedCondition) {
            x.weedConditionId = 1
          }
          else {
            x.weedConditionId = 2
          }

          return x
        }).filter(x => x.date.year == this.$root.context.year);

        this.fieldIds = [];
        this.fieldweediness.forEach( x => this.fieldIds.push(x.fieldId) );

        this.fields = this.fromVuex('fields').filter(x => this.fieldIds.indexOf(x.id) >= 0);
        console.log(this.fields, 'fieldsVuex');

        //**********************
        //fields weedConditionId
        //**********************
        this.fieldweediness.forEach(x => {
          let weedCondition = 0;
          let weedLength = x.chemistryLimitWeedTypes.length
          x.chemistryLimitWeedTypes.forEach(c => {
            if (c.weedAmount != c.weedAmountEdited)
              weedCondition++
          });
          let field = this.fields.find( f => f.id == x.fieldId );
          if (field) {
            if (weedLength == weedCondition) {
              field.weedConditionId = 1
            }
            else {
              field.weedConditionId = 2
            }
          }
        })
        console.log(this.fieldweediness, 'fieldweedinessVuex')

        this.fields.forEach( f => f.clicked = false );
      },
      clickedField(id){
        this.fields.forEach( f => f.clicked = false );
        this.fields.find( x => x.id == id ).clicked = true;
        this.watcher++;
        this.item.fieldId = id;
        this.fieldClicked = true;
      },
      update(id) {
        EventBus.$emit('FieldWeediness.InitUpdate', id);
      },
      load() {
        this.fetchEntities([
          'brigades',
          'fields',
          'fieldweediness',
        ], this.afterFetch );
      },
      refresh() {
        this.loading = true
        this.load();
      }
    }
  }

</script>

<style scoped>
  .tableHeading {
    display: inline-block;
    margin-right: 20px;
  }

  .downloadLzkStyle {
    display: block;
    margin-top: 20px;
  }

  .downloadFieldSelect {
    width: 250px;
  }
  .panels{
    flex: 1 0 auto;
    width: 100%;
    height: 100%;
    flex-flow: column nowrap;
    display: flex;
    box-sizing: border-box;
  }
  .panel-fields{
    width: 100%;
    height: 40vh;
    box-sizing: border-box;
    overflow: auto;
  }
  .weediness-fields{
    width: 100%;
    display: block;
    height: auto;
  }
  .field{
    float: left;
    width: 120px;
    height: 38px;
    padding: 10px 8px;
    margin: 5px;
    font-size: 12px;
    background: #9e9e9e;
    box-sizing: border-box;
    border: 1px solid #828282;
    text-transform: uppercase;
    cursor: pointer;
  }
  .field-active{
    background: #63a263;
    color: #fff;
    border: 1px solid #00ba4a;
  }
  .panel-bottom{
    height: 60vh;
    position: static;
    padding: 10px;
  }
  .panel-bottom-text{
    width: 100%;
    height: auto;
  }

</style>
