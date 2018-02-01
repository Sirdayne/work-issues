<template lang="pug">
el-tabs(v-model="activeName", v-if="tabs")
  template(v-for="tab in tabs")
    el-tab-pane(:label="tab.label", :name="tab.name")
      component(:is="tab.component", v-bind="tab.props")
</template>

<script>
import SelectedAssignments from "components/Map/SelectedAssignments.vue";
import CarStatus from "components/Map/CarStatus.vue";
import FieldInfo from "components/Map/FieldInfo.vue";
import FieldHistory from "components/Map/FieldHistory.vue";

export default {
  name: "TabBuilder",
  props: ["data", "type"],
  components: {
    SelectedAssignments,
    CarStatus,
    FieldInfo,
    FieldHistory,
  },
  data() {
    return {
      activeName: null,
      tabs: [],
    };
  },
  created() {
    if (this.type == "default") {
      this.buildAssignmentsTab()
      if (this.data.CarStatus) this.buildCarStatusTab()
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
        this.buildAssignmentsTab()
        this.activeName = "FieldInfo"
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
  }
};
</script>
