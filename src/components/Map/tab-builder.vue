<template lang="pug">
el-tabs(v-model="activeName", v-if="tabs")
  template(v-for="tab in tabs")
    el-tab-pane(:label="tab.label", :name="tab.name")
      component(:is="tab.component", v-bind="tab.props")
</template>

<script>
import SelectedAssignments from "components/Map/Tabs/SelectedAssignments.vue";
import CarStatus from "components/Map/Tabs/CarStatus.vue";
import FieldInfo from "components/Map/Tabs/FieldInfo.vue";
import CarActions from "components/Map/Tabs/CarActions.vue";
import FieldHistory from "components/Map/Tabs/FieldHistory.vue";
import FieldWeediness from "components/Map/Tabs/FieldWeediness.vue";
import SoilResearches from "components/Map/Tabs/SoilResearches.vue";
import CarInformation from "components/Map/Tabs/CarInformation.vue";
import Cargps from "components/Map/Tabs/Cargps.vue";
import { EventBus } from 'services/EventBus'

export default {
  name: "TabBuilder",
  props: ["data", "type"],
  components: {
    SelectedAssignments,
    CarStatus,
    FieldInfo,
    FieldHistory,
    FieldWeediness,
    SoilResearches,
    CarActions,
    CarInformation,
    Cargps
  },
  data() {
    return {
      activeName: null,
      tabs: [],
    };
  },
  created() {
    if (this.$route.query.carIdTabOpen) {
      EventBus.$emit('traktorTracksTriggered', +this.$route.query.carIdTabOpen);
    } else {
      if (this.type == "default") {
        this.buildAssignmentsTab()
        if (this.data.CarStatus) this.buildCarStatusTab()
      }
    }
  },
  computed: {
    dataProps() {
      return this.data
    },
  },
  watch: {
    ['data'](val, oldVal) {
      this.tabs = []
      if (this.type == "default") {
        this.buildAssignmentsTab()
        if (this.data.CarStatus) this.buildCarStatusTab()
        this.activeName = "SelectedAssignments"
      } else if (this.type == "field") {
        this.buildFieldInfoTab()
        this.buildFieldHistoryTab()
        this.buildFieldWeedinessTab()
        this.buildFieldSoilResearchesTab()
        this.buildAssignmentsTab()
        this.activeName = "FieldInfo"
      } else if (this.type == "car") {
        if (this.data.CarActions.ids.length === 1){
          this.buildCarActionsTab()
          this.buildCarInformationTab()
        }
        this.buildAssignmentsTab()
        this.buildCargpsTab()
        this.activeName  = this.$route.query.carIdTabOpen ? "Cargps": "SelectedAssignments"
      }
    }
  },
  methods: {
    buildAssignmentsTab() {
      let tab = {
        label: "Задания",
        name: "SelectedAssignments",
        component: "SelectedAssignments",
        props: this.dataProps["SelectedAssignments"]
      }
      this.tabs.push(tab)
    },
    buildCarStatusTab() {
      let tab = {
        label: "Статус",
        name: "CarStatus",
        component: "CarStatus",
        props: ""
      }
      this.tabs.push(tab)
    },
    buildFieldInfoTab() {
      let tab = {
        label: "Паспорт поля",
        name: "FieldInfo",
        component: "FieldInfo",
        props: this.dataProps["FieldInfo"]
      }
      this.tabs.push(tab)
    },
    buildFieldHistoryTab() {
      let tab = {
        label: "История",
        name: "FieldHistory",
        component: "FieldHistory",
        props: this.dataProps["FieldInfo"]
      }
      this.tabs.push(tab)
    },
    buildFieldWeedinessTab() {
      let tab = {
        label: "Засоренность",
        name: "FieldWeediness",
        component: "FieldWeediness",
        props: this.dataProps["FieldInfo"]
      }
      this.tabs.push(tab)
    },
    buildFieldSoilResearchesTab() {
      let tab = {
        label: "Питательные вещества",
        name: "SoilResearches",
        component: "SoilResearches",
        props: this.dataProps["FieldInfo"]
      }
      this.tabs.push(tab)
    },
    buildCarActionsTab() {
      let tab = {
        label: "Действия",
        name: "CarActions",
        component: "CarActions",
        props: this.dataProps["CarActions"]
      }
      this.tabs.push(tab)
    },
    buildCarInformationTab() {
      let tab = {
        label: "Информация",
        name: "CarInformation",
        component: "CarInformation",
        props: this.dataProps["CarActions"]
      }
      this.tabs.push(tab)
    },
    buildCargpsTab() {
      let tab = {
        label: "GPS",
        name: "Cargps",
        component: "Cargps",
        props: this.dataProps["CarActions"]
      }
      this.tabs.push(tab)
    },
  }
};
</script>
