<template lang="pug">
.panels
  el-dialog(:visible.sync="dialogVisibleUpdate", title="Редактирование", size="tiny")
    update(:form="form")
  .panel-fields
    .fx-form
      .fx-item
        .fx-label Бригада
        el-select(v-model="item.brigadeId", clearable, placeholder="Выбрать")
          el-option(v-for="b in brigades", :key="b.id", :label="b.name", :value="b.id")
      .fx-item
        .fx-label Сорняки после обработки
        el-select(v-model="item.weedConditionId", clearable, placeholder="Выбрать", filterable)
          el-option(v-for="c in weedConditions", :key="c.id", :label="c.name", :value="c.id")
    .weediness-fields
      template( v-for="field in fieldsData" )
        .field( @click="clickedField( field.id )", :class="{ 'field-active': field.clicked }") ({{field.newName}})
  .panel-bottom
    h2 Акт засоренности поля
      span(:style="{marginRight: '30px'}")
      filter-cols(:cols="cols")
    el-table(
      v-if="(tableData.length || loading) && fieldClicked",
      :data="paginate(tableData)",
      border,
      resizable,
      v-loading="loading",
      )
      el-table-column(v-for="col in cols", v-if="col.active", :prop="col.prop", :label="col.label", :key="col.prop", header-align="center")
      el-table-column(label="Препараты", header-align="center")
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryChemicalTreatments")
            el-tag {{ item.chemicalPreparationName }}
      el-table-column(label="Вид сорняка", header-align="center")
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryLimitWeedTypes")
            el-tag(:color="item.color") {{ item.weedTypeName }}
      el-table-column(label="Количество до обработки", header-align="center")
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryLimitWeedTypes")
            el-tag(:color="item.color") {{ item.weedAmount }}
      el-table-column(label="Количество после обработки", header-align="center")
        template(slot-scope="scope")
          template(v-for="item in scope.row.chemistryLimitWeedTypes")
            el-tag(:color="item.color") {{ item.weedAmountEdited }}
      el-table-column(label="Операции", header-align="center", align="center", width="120")
        template(slot-scope="scope")
          el-button(@click="edit(scope.row.id)" size="small" icon="edit")
    el-row(type="flex", v-if="(tableData.length || loading) && fieldClicked")
      el-col(:span="0")
        el-pagination(
          layout="total, prev, pager, next",
          :total="tableData.length",
          :page-size="perPage",
          :current-page="currentPage",
          @current-change="onCurrentPageChange",
          @size-change="onPerPageChange",
        )
</template>
<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import moment from 'moment'
import paginate from 'mixins/paginate'
import filterCols from "components/filterCols"
import { EventBus } from 'services/EventBus'
import update from './update.vue'

export default {
  components: {
    filterCols,
    update
  },
  mixins: [
    RecordsLoaderV2,
    paginate
  ],
  data() {
    return {
      colors: {
        0: {color: '#8391a5', name: 'grey'},
        1: {color: '#FF8000', name: 'orange'},
        2: {color: '#74DF00', name: 'green'},
        3: {color: '#2E2EFE', name: 'blue'},
        4: {color: '#FFD100', name: 'yellow'}
      },
      cols: [
        {prop: "dateFormated", label: "Дата обработки", active: true},
        {prop: "workName", label: "Работа", active: true},
        {prop:"inspectionDateFormated", label:"Дата обследования после обработки", active: true}
      ],
      watcher: 1,
      brigades: [],
      fields: [],
      fieldweediness: [],
      fieldIds: [],
      fieldClicked: false,
      item: {
        brigadeId: null,
        weedConditionId: "",
        fieldId: null,
      },
      perPage: 5,
      currentPage: 1,
      loading: true,
      dialogVisibleUpdate: false,
      form: {},
    }
  },
  computed: {
    weedConditions(){
      let array = [
        {id: 0, name: 'все'},
        {id: 1, name: 'определены'},
        {id: 2, name: 'не определены'}
      ];
      this.item.weedConditionId = array[0].id
      return array;
    },
    tableData: function() {
      let brigadeId = this.item.brigadeId
      let fieldId = this.item.fieldId
      let weedConditionId = this.item.weedConditionId
      let tableData = this.fieldweediness.filter(function(record) {
        let brigade = record.brigadeId === brigadeId || !brigadeId
        let field = record.fieldId === fieldId || !fieldId
        let weedCondition = record.weedConditionId === weedConditionId || !weedConditionId
        return brigade && field && weedCondition
      })
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
      return this.watcher && fieldsData;
    },
    fieldsFiltered(){
      return this.watcher && this.fields;
    }
  },
  created() {
    EventBus.$on('FieldWeedinessChanged', () => {
      this.refresh()
    });
    this.load()
  },
  methods: {
    load() {
      this.loading = true
      this.fetchEntities([
        'brigades',
        'fields',
      ], this.afterFetch);
    },
    refresh() {
      this.load();
    },
    afterFetch(){
      this.brigades = this.fromVuex('brigades')
      if (this.brigades && this.brigades.length) this.item.brigadeId = this.brigades[0].id
      this.getFW()
    },
    getFW() {
      http.getWithoutCache(`fieldweediness/${this.$root.context.organization}`)
        .then(data => {
          this.setFW(data)
        })
        .catch(() => {
          this.setFW([])
        })
    },
    setFW(data) {
      this.$store.dispatch("actionAddEntities", {name: "fieldweediness", data: data})
      this.fieldweediness = data.map(fw => {
        fw.dateFormated = moment(fw.date, "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")
        fw.inspectionDateFormated = moment(fw.inspectionDate).format("DD.MM.YYYY")
        if (fw.inspectionDateFormated == "Invalid date") {
          fw.inspectionDateFormated = "нет даты";
          fw.inspectionDate = moment().format("YYYY-MM-DDTHH:mm:ss");
        }
        let i = -1;
        let weedLength = fw.chemistryLimitWeedTypes.length
        let weedCondition = 0;
        fw.chemistryLimitWeedTypes.map(c => {
          i < 4 ? i++ : i = 0
          c.color = this.colors[i].color;
          if (c.weedAmount != c.weedAmountEdited) weedCondition++
          return c;
        });
        fw.weedConditionId = weedLength == weedCondition ? 1 : 2
        return fw
      })
      .filter(fw => fw.dateFormated.slice(-4) == this.$root.context.year);
      this.setFields()
    },
    setFields() {
      this.fieldIds = [];
      this.fieldweediness.forEach( x => this.fieldIds.push(x.fieldId) );
      this.fields = this.fromVuex('fields').filter(x => this.fieldIds.indexOf(x.id) >= 0);
      this.setWCId()
      this.fields.forEach( f => f.clicked = false );
      this.loading = false
    },
    setWCId() {
      //**********************
      //fields weedConditionId
      //**********************
      this.fieldweediness.forEach(x => {
        let weedCondition = 0;
        let weedLength = x.chemistryLimitWeedTypes.length
        x.chemistryLimitWeedTypes.forEach(c => {
          if (c.weedAmount != c.weedAmountEdited) weedCondition++
        });
        let field = this.fields.find( f => f.id == x.fieldId );
        if (field) {
          field.weedConditionId = weedLength == weedCondition ? 1 : 2
        }
      })
    },
    clickedField(id){
      this.fields.forEach( f => f.clicked = false );
      this.fields.find( x => x.id == id ).clicked = true;
      this.watcher++;
      this.item.fieldId = id;
      this.fieldClicked = true;
    },
    edit(id) {
      this.form = this.fieldweediness.find(a => a.id == id)
      this.dialogVisibleUpdate = true
    },
  }
}
</script>
<style scoped>
.panels{
  flex: 1 0 auto;
  width: calc(100% - 330px);
  height: calc(100% - 60px);
  flex-flow: column nowrap;
  display: flex;
  box-sizing: border-box;
}
.panel-fields{
  width: 100%;
  height: calc(100% - 350px);
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
  height: 350px;
  position: static;
  padding: 10px;
}
.panel-bottom-text{
  width: 100%;
  height: auto;
}
</style>
