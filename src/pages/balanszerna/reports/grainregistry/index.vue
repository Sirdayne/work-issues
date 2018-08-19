<template lang="pug">
div
  el-form(
    :model="item",
    :inline="true",
    :rules="rules",
    ref="form",
    :label-position="'top'"
  )
    el-form-item(label="Дата")
      el-date-picker(v-model="item.selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату")
    el-form-item(label="Поле", prop="fieldId")
      el-select(v-model="item.fieldId", clearable, filterable, placeholder="Выбрать")
        el-option(
          v-for="f in fields",
          :key="f.id",
          :label="f.newName",
          :value="f.id"
          )
    el-form-item(label="Культура", prop="cultureId")
      el-select(v-model="item.cultureId", clearable, filterable, placeholder="Выбрать")
        el-option(
          v-for="c in cultures",
          :key="c.id",
          :label="c.name",
          :value="c.id"
        )
    el-form-item(label="ТОК", prop="warehouseId")
      el-select(v-model="item.warehouseId", clearable, filterable, placeholder="Выбрать", @change="warehouseChange(item.warehouseId)")
        el-option(
          v-for="w in warehouses",
          :key="w.id",
          :label="w.name",
          :value="w.id"
        )
    el-form-item(label=".", :class="{invisibleColor: true}")
      el-button.excel(type="default", @click="exportTable('form')") .

  h2(class="tableHeading") Реестр приема зерна весовщиком

  el-table(
    :data="paginate(tableData)",
    border,
    resizable,
    )
    el-table-column(
      prop="rowNumber",
      label="Номер записи",
      header-align="center",
      width="110"
    )
    el-table-column(
      prop="tractorDriver",
      label="ФИО водителя",
      header-align="center",
      width="180"
    )
    el-table-column(
      label="Автомашина",
      header-align="center",
    )
      el-table-column(
        prop="carModel",
        label="марка",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="stateNumber",
        label="гос номер",
        header-align="center",
        width="120"
      )
      el-table-column(
        prop="organizationNumber",
        label="хоз номер",
        header-align="center",
        width="120"
      )
    el-table-column(
      label="вес, кг",
      header-align="center",
    )
      el-table-column(
        prop="weightBrutto",
        label="брутто",
        header-align="center",
        width="90"
      )
      el-table-column(
        prop="weightOfTare",
        label="тара",
        header-align="center",
        width="90"
      )
      el-table-column(
        prop="weightNetto",
        label="вес",
        header-align="center",
        width="90"
      )
    el-table-column(
      label="комбайнеры, ФИО (вес)",
      header-align="center",
    )
      template(slot-scope="scope")
        table.driver-table
          tr
            template(v-for="driverName in scope.row.columns")
              th {{ driverName.fullName }}

          tr
            template(v-for="driverWeight in scope.row.columns")
              td {{ driverWeight.weight }}

    el-table-column(
      prop="isFingerSignature",
      label="подпись водителя",
      header-align="center",
      width="120"
    )
  el-row(type="flex")
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
import http from "services/http"
import {EventBus} from "services/EventBus"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import moment from "moment"
import ListController from "mixins/ListController"

export default {
  mixins: [
    
    ListController
  ],
  data() {
    return {
      item: {
        warehouseId: null,
        cultureId: null,
        culture: "",
        fieldId: null,
        selectedDate: new Date(new Date().setFullYear(this.$root.context.year))
      },
      rules: {
        fieldId: [
          {required: true, type: "integer", message: "Поле обязательно", trigger: "change"}
        ]
      },
      perPage: 5,
      currentPage: 1,
      loading: true,
    }
  },
  computed: {
    fields() {
      let fields = fromVuex("fields")
      if (fields && fields.length) this.item.fieldId = fields[0].id
      return fields;
    },
    cultures() {
      let cultures = fromVuex("cultures")
      if (cultures && cultures.length) this.item.cultureId = cultures[0].id
      return cultures;
    },
    warehouses() {
      let warehouses = fromVuex("warehouses")
      //id баланса зерна равно 2, фильтруем по нему
      warehouses = warehouses.filter( x => x.warehouseType == 2)

      if (warehouses && warehouses.length) {
        this.item.warehouseId = warehouses[0].id

        let localWarehouseId = localStorage.getItem("warehouseId");

        if (localWarehouseId){
          this.item.warehouseId = parseInt(localWarehouseId);
        } else {
          localStorage.setItem("warehouseId", this.item.warehouseId);
        }

      }
      return warehouses;
    },
    grainregistry() {
      return fromVuex("grainregistry")
    },
    totalItems() {
      return this.tableData.length;
    },
    tableData() {
      let isDate = moment(this.item.selectedDate || new Date().getFullYear()).format("L")
      let fieldId = this.item.fieldId
      let cultureId = this.item.cultureId
      let warehouseId = this.item.warehouseId
      if (this.grainregistry.length) this.loading = true
      let tableData = this.grainregistry.filter((record) => {
        let inDate = moment(record.inDateTime).format("L")
        let dateEqual = (inDate == isDate)
        let field = record.sourceFieldId === fieldId || !fieldId
        let culture = record.cultureId === cultureId || !cultureId
        let warehouse = record.warehouseId === warehouseId || !warehouseId
        return dateEqual && field && culture && warehouse
      })
      if (this.grainregistry.length) this.loading = false
      return tableData
    },
  },
  created() {
    EventBus.$on("AppYearChanged", (year) => {
      this.item.selectedDate = new Date(new Date(this.item.selectedDate).setFullYear(year));
    });
    EventBus.$on("App.Context.OrganizationChanged", (orgId) => {
      localStorage.removeItem("warehouseId");
    });
    fetchEntities([
      "grainregistry",
      "fields",
      "cultures",
      "warehouses"
    ]);
  },
  methods: {
    warehouseChange(value) {
      localStorage.setItem("warehouseId", value);
    },
    load() {
      fetchEntities([
        "grainregistry",
      ]);
    },
    refresh() {
      this.loading = true
      this.load();
    },
    exportTable(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let endpoint = "GrainRegistryReport";
          let filename = "Реестр приема зерна";

          let body = {
            CultureId: this.item.cultureId,
            WarehouseId: this.item.warehouseId,
            OrganizationId: this.$root.context.organization,
            SourceFieldId: this.item.fieldId
          };
          http.downloadXLS(endpoint, body, filename);
        } else {
          return false;
        }
      });
    },
  }
}

</script>

<style lang="scss" scoped>
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

  .driver-table {
    display: block;
    margin: -2px -20px;

    width: calc(100% + 40px);

    overflow-y: hidden;
    overflow-x: visible;

    th, td{
      padding: 3px 7px;
      text-align: center;

      border: 1px solid #dfe6ec;
    }

    th{
      font-size: 12px;
      font-weight: normal;
    }
  }


</style>
