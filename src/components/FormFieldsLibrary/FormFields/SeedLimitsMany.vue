<template lang="pug">
  el-form-item(label="Посевы", v-show="isVisible")
    el-select(v-model="model", multiple, filterable)
      el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.displayString")
</template>

<script>
import { EventBus } from "services/EventBus";
import FormFieldsMixin from "components/FormFieldsLibrary/FormFieldsMixin";

export default {
  mixins: [FormFieldsMixin],
  watch: {
    model(value) {
      this.handleModelChange(value);
    }
  },
  methods: {
    handleChange(model) {
      this.emitEvents(model);
      this.updateModel({ key: "seedLimitId", value: model });
    },
    init() {
      switch (this.currentPage) {
        case "Assignments":
          this.initOnAssignmentsPage();
          break;
      }
    },
    initOnAssignmentsPage() {
      if (this.mode === "Update") {
        let workId = this.editable.subOperationId;
        this.isVisible = this.getAssignmentTypeId(workId) == 1;
      } else if (this.mode === "Create") {
        this.isVisible = false;
      }
      this.modelName = "seedLimitId";
    },
    emitEvents(model) {
      EventBus.$emit(
        this.currentPage + "." + this.mode + "Component.SeedLimitsManyFieldChanged",
        model
      );
    },
    initEvents() {
      EventBus.$on(
        this.currentPage + "." + this.mode + "Component.AssignmentTypeChanged",
        assignmentType => {
          if (assignmentType == 1) {
            this.isVisible = true;
          } else {
            this.isVisible = false;
            this.model = [];
          }
        }
      );
    }
  }
};
</script>
