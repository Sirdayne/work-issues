<template lang="pug">
div(v-if="ready")
  update
  el-form(:label-position="mediaObject.labelPosition", label-width="90px", :rules="formRules", :model="item", ref="formStep1Container", :inline="true")
    el-form-item(label="Дата", :style="mediaObject.datePickerLabelStyle")
      el-date-picker(v-model="item.selectedDate", format="dd.MM.yyyy", placeholder="Выберите дату", :style="mediaObject.datePickerStyle")
    el-form-item(label="Работа")
      el-select(v-model="item.workId", filterable)
        el-option(v-for="w in works", :label="w.name", :value="w.id", :key="w.id")
    el-form-item(label="Посев")
      el-select(v-model="item.seedlimitId", @change="extractExtraInfoFromSeedlimit()", filterable)
        el-option(v-for="s in filteredSeedlimits", :key="s.id", :label="s.displayString", :value="s.id")

    el-form-item(label="Баковая смесь")
      el-select(v-model="item.chemicalTreatment.preparationId", @change="refreshNormativeAfterPreparationChange()", filterable)
        el-option(v-for="c in filterChemicalPreparationsBySelected", :label="c.name", :value="c.id", :key="c.id")
      el-input-number(v-model="item.chemicalTreatment.normative", :min="minimumNorm", :max="maximumNorm", :step="0.001", :debounce="deBounce")
      el-button(@click="addToMixture()", :disabled="addToMixtureButtonDisabled") Добавить
      div.tags
        el-tag(v-for="(item, index) in item.chemicalTreatments",
        :key="index"
        type="primary",
        :closable="true",
        @close="removeFromMixture(index)", :style="mediaObject.tagStyle")
          | {{ chemicalPreparations.find(p => p.id === item.chemicalPreparationId).name }}
          b  ( {{ item.normative }} )
      el-button(type="primary", size="small", @click="save()") Сохранить #[i.el-icon-check]

    el-form-item(label="Вид сорняков", v-if="ifHerbicide")
      el-select(v-model="item.chemistryLimitWeedType.weedTypeId", filterable)
        el-option(v-for="c in filterWeedTypesBySelected", :label="c.name", :value="c.id", :key="c.id")
      el-input-number(v-model="item.chemistryLimitWeedType.weedAmount", :step="1", :min="0", :debounce="deBounce")
      el-button(@click="addToWeed()", :disabled="addToWeedButtonDisabled") Добавить
      div.tags
        el-tag(v-for="(item, index) in item.chemistryLimitWeedTypes",
        :key="index"
        type="primary",
        :closable="true",
        @close="removeFromWeed(index)", :style="mediaObject.tagStyle")
          | {{ chemistryLimitWeedTypes.find(p => p.id === item.weedTypeId).name }}
          b  ( {{ item.weedAmount }} )

  h2 Расчет химии
    span(:style="{marginRight: '30px'}")
    el-button.filter(
      @click="filterUnfolded = true",
      type="default",
    ) .
    el-button.printer(type="default", @click="exportFullTable()") .
    el-button(type="default", @click="exportTable('limit')", :loading="loadingButtons.includes('limit')") ЛЗК
    el-button(type="default", @click="exportTable('invoice')", :loading="loadingButtons.includes('invoice')") Накладная

  el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
    el-form(:model="filterModel", label-width="120px")
      el-form-item(label="Дата")
        el-date-picker(v-model="filterModel.startDateFormated", format="dd.MM.yyyy", placeholder="Выберите дату")
      el-form-item(label="Посевы")
        el-select(v-model="filterModel.seedLimitsIds", multiple, filterable)
          el-option(
            v-for="item in seedlimits",
            :label="item.displayString",
            :value="item.id",
            :key="item.id",
          )
      el-form-item
        el-button(@click="resetFilter") Сбросить

  .el-table-cont
    el-table(
      v-if="filteredChemistryLimits.length || loading",
      :data="paginate(search(filteredChemistryLimits))",
      border,
      resizable,
      v-loading="loading",
      element-loading-text="Загружается...",
    )
      el-table-column(label="Дата", prop="shortDate", width="110")
      el-table-column(label="Поле", prop="fieldName", width="130")
      el-table-column(label="Площадь га", prop="fieldArea", width="80")
      el-table-column(label="Работа", prop="workName", width="130")
      el-table-column(label="Культура", prop="cultureName", width="130")
      el-table-column(label="Вид сорняков(кол-во)", width="150")
        template(slot-scope="scope")
          el-tag(v-for="item in scope.row.chemistryLimitWeedTypes", :key="item.weedTypeId") {{ getWeedName(item.weedTypeId) }}  ({{ item.weedAmount }})
      el-table-column(label="Тип препарата", width="150")
        template(slot-scope="scope")
          el-tag(v-for="item in scope.row.chemistryChemicalTreatments", :color="item.color", :key="item.id") {{ item.preparationType }}
      el-table-column(label="Наименование препарата")
        template(slot-scope="scope")
          el-tag(v-for="item in scope.row.chemistryChemicalTreatments", :color="item.color", :key="item.id") {{ item.chemicalPreparationName }}
      el-table-column(label="Норма расхода", width="80")
        template(slot-scope="scope")
          el-tag(v-for="item in scope.row.chemistryChemicalTreatments", :color="item.color", :key="item.id") {{ item.normative }}
      el-table-column(label="Требуется", width="80")
        template(slot-scope="scope")
          el-tag(v-for="item in scope.row.chemistryChemicalTreatments", :color="item.color", :key="item.id") {{ item.total }}
      el-table-column(
      fixed="right",
      label="",
      width="120"
      ): template(slot-scope="scope")
        el-button(@click="update(scope.row.id)", size="small", icon="edit", :disabled="loadingButtons.includes('record'+scope.row.id)")
        el-button(@click="removeChemistryLimit(scope.row.id)", size="small", icon="delete2", :loading="loadingButtons.includes('record'+scope.row.id)")
    .no-results(v-else) Нет результатов
    el-pagination(
    layout="total, prev, pager, next",
    :total="filteredChemistryLimits.length",
    :page-size="perPage",
    :current-page="currentPage",
    @current-change="onCurrentPageChange",
    @size-change="onPerPageChange"
    )
</template>

<script>
import update from "./update.vue";
import http from "lib/httpQueryV2";
import RecordsLoaderV2 from "mixins/RecordsLoaderV2";
import { createIndex } from "lib/utils";
import ListController from "mixins/ListController";
import { EventBus } from "services/EventBus";
import GlobalMethods from "components/FormFieldsLibrary/GlobalMethods";
import moment from "moment";

import modifiedByName from "lib/modifiedByName";

export default {
  components: {
    update
  },
  mixins: [GlobalMethods, RecordsLoaderV2, ListController],
  data() {
    return {
      colors: {
        0: {
          color: "#DF0101",
          name: "red"
        },
        1: {
          color: "#FFD100",
          name: "yellow"
        },
        2: {
          color: "#74DF00",
          name: "green"
        },
        3: {
          color: "#2E2EFE",
          name: "blue"
        },
        4: {
          color: "#FF8000",
          name: "orange"
        }
      },
      perPage: 5,
      deBounce: 1200,
      windowWidth: 0,
      windowHeight: 0,
      loadingButtons: [],
      item: {
        carId: "",
        workId: "",
        weedAmount: "",
        cultureName: "",
        seedlimitId: "",
        instrumentId: "",
        selectedDate: new Date().setFullYear(this.$root.context.year),
        chemistryLimitWeedType: {
          weedTypeId: "",
          weedAmount: 0
        },
        chemistryLimitWeedTypes: [],
        weedTypesIds: [],
        chemicalTreatment: {
          normative: 0,
          preparationId: ""
        },
        chemicalTreatments: []
      },
      formRules: {},
      loading: true,
      updatedEnd: false,
      assignments: [],
      cars: [],
      carModels: [],
      chemicalPreparations: [],
      chemistryLimitWeedTypes: [],
      cultures: [],
      instruments: [],
      seedlimits: [],
      weedTypes: [],
      works: [],
      chemistryLimits: [],
      hasHerbicide: false,
    };
  },
  computed: {
    ifHerbicide() {
      return this.itemChemicalTreatmentIds.some(c => (this.herbicideIds.indexOf(c) >= 0))
    },
    herbicideIds() {
      return this.chemicalPreparations.filter(f => f.chemicalPreparationTypeId == 2).map(f => f.id)
    },
    itemChemicalTreatmentIds(){
      return this.item.chemicalTreatments.map(c => c.chemicalPreparationId)
    },
    paginatedFilteredChemistryLimits() {
      return this.paginate(this.filteredChemistryLimits);
    },
    filteredChemistryLimits() {
      if (this.chemistryLimits.length) this.loading = true;
      let chemistryLimits = this.chemistryLimits
        .filter(c => {
          c.shortDate = moment(c.date).format("DD.MM.YYYY");
          let date =
            !this.filterModel.startDateFormated ||
            new Date(c.date) >= new Date(this.filterModel.startDateFormated);
          let filterSeedlimits =
            !this.filterModel.seedLimitsIds.length ||
            this.filterModel.seedLimitsIds.indexOf(c.seedLimitId) > -1;
          if (date && filterSeedlimits) return c;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      if (this.chemistryLimits.length) this.loading = false;
      return chemistryLimits;
    },
    // FILTER SEEDLIMIT FIELDS BY WORKS APPLIED TO IT
    filteredSeedlimits() {
      let excludeSeedlimitIds = this.chemistryLimits
        ? this.chemistryLimits
        : [];
      excludeSeedlimitIds = excludeSeedlimitIds
        .filter(a => a.workTypeParameterPlanWorkTypeId === this.item.workId)
        .map(a => a.seedLimitId);
      return this.seedlimits.filter(s => !excludeSeedlimitIds.includes(s.id));
    },
    // CONCAT STRINGS FOR AGGREGATE
    makeAggregate() {
      let carId = this.item.carId;
      let instrumentId = this.item.instrumentId;

      if (carId !== "" && instrumentId !== "") {
        let car = this.cars.find(c => c.id === carId);
        let carModelId = car.carModelId;
        let carModel = this.carModels.find(c => c.id === carModelId);

        let instrumentName = this.instruments.find(i => i.id === instrumentId);
        this.item.aggregate = carModel.name + "+" + instrumentName.name;
      }
    },
    // EXCLUDE CHEMICAL PREPARATIONS IF SELECTED
    filterChemicalPreparationsBySelected() {
      let treatments = this.item.chemicalTreatments.map(
        c => c.chemicalPreparationId
      );

      if (treatments.length) {
        return this.chemicalPreparations.filter(c => {
          if (!treatments.includes(c.id)) {
            return c;
          }
        });
      } else {
        return this.chemicalPreparations;
      }
    },
    filterWeedTypesBySelected() {
      let weedtypes = this.item.chemistryLimitWeedTypes.map(c => c.weedTypeId);

      if (weedtypes.length) {
        return this.chemistryLimitWeedTypes.filter(c => {
          if (!weedtypes.includes(c.id)) {
            return c;
          }
        });
      } else {
        return this.chemistryLimitWeedTypes;
      }
    },
    // BORDERS FOR CHEMICAL PREPARATION NORMATIVE
    minimumNorm() {
      let id = this.item.chemicalTreatment.preparationId;
      let preparation = this.chemicalPreparations.find(c => c.id === id);
      return preparation ? preparation.minNorm : 0;
    },
    maximumNorm() {
      let id = this.item.chemicalTreatment.preparationId;
      let preparation = this.chemicalPreparations.find(c => c.id === id);
      return preparation ? preparation.maxNorm : 0;
    },
    // BUTTON FOR CHEMICAL TREATMENT
    addToMixtureButtonDisabled() {
      let id = this.item.chemicalTreatment.preparationId;
      let normative = this.item.chemicalTreatment.normative;

      return id === "" || normative === 0;
    },
    addToWeedButtonDisabled() {
      let id = this.item.chemistryLimitWeedType.weedTypeId;
      let normative = this.item.chemistryLimitWeedType.weedAmount;

      return id === "" || normative === 0;
    },
    mediaObject() {
      // at 1585 px form elements get bizarre
      if (this.windowWidth <= 1585) {
        return {
          colNotDivided: 8,
          colNotDividedBigger: 24,
          labelPosition: "top",
          datePickerStyle: {
            width: "100%"
          },
          tagsStyle: {
            margin: "0px 0 20px",
            width: "50%"
          },
          tagStyle: {
            margin: "2px"
          }
        };
      } else {
        // anything that is greater than 1585 px
        return {
          colNotDivided: 8,
          colNotDividedBigger: 24,
          labelPosition: "left",
          datePickerStyle: {
            width: "100%"
          },
          tagsStyle: {
            margin: "0px 0 20px",
            width: "50%"
          },
          tagStyle: {
            margin: "2px"
          }
        };
      }
    }
  },
  watch: {
    "item.workId"(val) {
      this.item.seedlimitId = null;
    },
    paginatedFilteredChemistryLimits: function() {
      if (this.updatedEnd)
        modifiedByName.addTooltips(this.paginatedFilteredChemistryLimits);
    }
  },
  updated() {
    this.updatedEnd = true;
    modifiedByName.addTooltips(this.paginatedFilteredChemistryLimits);
  },
  created() {
    EventBus.$on("ChemistryLimits.UpdateComponent.PutObjectCompleted", () => {
      this.refresh();
    });
    EventBus.$on("AppYearChanged", year => {
      this.item.selectedDate = new Date(
        new Date(this.item.selectedDate).setFullYear(year)
      );
      this.filterModel.startDateFormated = new Date(
        new Date(this.filterModel.startDateFormated).setFullYear(year)
      );
    });
    this.fetchEntities(
      [
        "assignments",
        "cars",
        "carModels",
        "chemicalPreparations",
        "chemistryLimits",
        "cultures",
        "instruments",
        "seedlimits",
        "weedTypes",
        "works"
      ],
      this.afterFetch
    );
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener("resize", this.getWindowWidth);
      window.addEventListener("resize", this.getWindowHeight);

      //Init
      this.getWindowWidth();
      this.getWindowHeight();
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.getWindowWidth);
    window.removeEventListener("resize", this.getWindowHeight);
  },
  methods: {
    afterFetch() {
      this.assignments = this.fromVuex("assignments");
      this.cars = this.fromVuex("cars");
      this.carModels = this.fromVuex("carModels");
      this.chemicalPreparations = this.fromVuex("chemicalPreparations").filter(
        c => c.isMacrofertilizer === false
      );
      this.works = this.fromVuex("works").filter(
        w => w.planWorkTypeIsChemicalTreatment && !w.isMacrofertilizer
      );
      this.chemistryLimits = this.fromVuex("chemistryLimits")
        .filter(c => c.isMacrofertilizer === false)
        .map(c => {
          c.workName = this.works.filter(
            w => w.id === c.workTypeParameterPlanWorkTypeId
          ).length
            ? this.works.filter(
                w => w.id === c.workTypeParameterPlanWorkTypeId
              )[0].name
            : "";
          let i = -1;
          c.chemistryChemicalTreatments.map(c => {
            i = i < 4 ? i + 1 : 0
            c.color = this.colors[i].color;
            return c;
          });
          return c;
        });
      this.chemistryLimitWeedTypes = this.fromVuex("weedTypes");
      this.weedTypes = this.fromVuex("weedTypes");
      this.cultures = createIndex(this.fromVuex("cultures"));
      this.instruments = this.fromVuex("instruments");
      this.seedlimits = this.fromVuex("seedlimits")
        .filter(s => s.year === this.$root.context.year)
        .map(s => {
          if (s.cultureId === this.cultures[s.cultureId].id) {
            s.cultureShortName = this.cultures[s.cultureId].shortName;
            s.displayString = s.displayString.split(" - ");
            s.displayString[1] = s.cultureShortName;
            s.displayString = s.displayString.join(" - ");
            return s;
          }
        });
    },
    // GET META INFO FROM SEEDLIMIT
    extractExtraInfoFromSeedlimit() {
      let seedlimit = this.seedlimits.find(s => s.id === this.item.seedlimitId);

      if (seedlimit) {
        this.item.fieldArea = seedlimit.area;
        this.item.fieldName = seedlimit.fieldName;
        this.item.cultureName = seedlimit.cultureName;
      }
    },
    refreshNormativeAfterPreparationChange() {
      this.item.chemicalTreatment.normative = this.minimumNorm;
    },
    getWeedName(id) {
      return this.weedTypes.find(x => x.id == id).name;
    },
    initFilter() {
      return {
        //'startDateFormated': this.item.selectedDate,
        startDateFormated: "",
        seedLimitsIds: []
      };
    },
    update(id) {
      EventBus.$emit("ChemistryLimits.InitUpdate", id);
    },
    getWindowWidth(event) {
      this.windowWidth = document.documentElement.clientWidth;
    },
    getWindowHeight(event) {
      this.windowHeight = document.documentElement.clientHeight;
    },
    exportTable(name) {
      let endpoint =
        name === "limit"
          ? "ChemistryLimitCardForm"
          : "ChemistryLimitInvoiceForm";
      let dateForBody = moment(this.item.selectedDate).format(
        "YYYY-MM-DDTHH:mm:ss"
      );
      let dateForFilename = moment(this.item.selectedDate).format("DD.MM.YYYY");
      let filename =
        name === "limit"
          ? "Лимитно-заборная карта за " + dateForFilename.split("T")[0]
          : "Накладная за " + dateForFilename.split("T")[0];
      let body = {
        organizationId: this.$root.context.organization,
        date: dateForBody
      };
      http.downloadPDF(endpoint, body, filename);
    },
    exportFullTable() {
      let endpoint = "ChemistryLimitAllForm";
      let filename = "Расчет химии";
      let body = {
        organizationId: this.$root.context.organization
      };
      http.downloadPDF(endpoint, body, filename);
    },
    load() {
      this.fetchEntities(["chemistryLimits"], this.afterFetch);
    },
    refresh() {
      this.loading = true;
      this.load();
    },
    addToWeed() {
      let weedTypeId = this.item.chemistryLimitWeedType.weedTypeId;
      let weedAmount = this.item.chemistryLimitWeedType.weedAmount;

      this.item.chemistryLimitWeedTypes.push({
        weedAmount: weedAmount,
        weedTypeId: weedTypeId
      });

      this.item.chemistryLimitWeedType.weedTypeId = "";
      this.item.chemistryLimitWeedType.weedAmount = 0;
    },
    removeFromWeed(index) {
      this.item.chemistryLimitWeedTypes.splice(index, 1);
    },
    addToMixture() {
      let preparationId = this.item.chemicalTreatment.preparationId;
      let normative = this.item.chemicalTreatment.normative;

      this.item.chemicalTreatments.push({
        normative: normative,
        chemicalPreparationId: preparationId
      });

      this.item.chemicalTreatment.preparationId = "";
      this.item.chemicalTreatment.normative = 0;
    },
    removeFromMixture(index) {
      this.item.chemicalTreatments.splice(index, 1);
    },
    removeChemistryLimit(id) {
      this.loadingButtons.push("record" + id);
      let endpoint = "chemistrylimits";
      http.delete(endpoint, id).then(() => {
        this.loadingButtons.pop("record" + id);
        this.refresh();
      });
    },
    save() {
      let endpoint = "chemistrylimits/" + this.$root.context.organization;

      let formattedDate = moment(this.item.selectedDate).format(
        "YYYY-MM-DDTHH:mm:ss"
      );

      let data = {
        organizationId: this.$root.context.organization,
        date: formattedDate,
        seedlimitId: this.item.seedlimitId,
        workTypeParameterPlanWorkTypeId: this.item.workId,
        chemistryLimitWeedTypes: this.item.chemistryLimitWeedTypes,
        carId: this.item.carId,
        instrumentId: this.item.instrumentId,
        fieldName: this.item.fieldName,
        fieldArea: this.item.fieldArea,
        cultureName: this.item.cultureName,
        aggregate: this.item.aggregate,
        chemistryChemicalTreatments: this.item.chemicalTreatments
      };

      http.post(endpoint, data).then(() => {
        this.refresh();
        this.item.seedlimitId = "";
        this.item.carId = "";
        this.item.instrumentId = "";
        this.item.chemistryLimitWeedTypes = [];
        this.item.chemicalTreatments = [];
        this.savingProcess = false;
      });
    }
  }
};
</script>
