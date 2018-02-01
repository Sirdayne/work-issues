<template lang="pug">
  div
    div(v-if="propMode === 'create'")
      el-col(:span=6)
        el-form-item(:label="originLabel")
          el-select(v-model="originModel", filterable)
            el-option(v-for="i in originIterable", :label="i.displayString ? i.displayString : i.name", :value="i.id", :key="i.id")
      el-col(:span=6)
        el-form-item(:label="destinationLabel")
          el-select(v-model="destinationModel", filterable)
            el-option(v-for="i in destinationIterable", :label="i.displayString ? i.displayString : i.name", :value="i.id", :key="i.id")
    div(v-else-if="propMode === 'update'")
      el-form-item(:label="originLabel")
        el-select(v-model="originModel", filterable)
          el-option(v-for="i in originIterable", :label="i.displayString ? i.displayString : i.name", :value="i.id", :key="i.id")
      el-form-item(:label="destinationLabel")
        el-select(v-model="destinationModel", filterable)
          el-option(v-for="i in destinationIterable", :label="i.displayString ? i.displayString : i.name", :value="i.id", :key="i.id")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    props: ['propDirection', 'propModels', 'propMode'],
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        assignmentType: null,
        direction: this.propDirection,
        models: this.propModels,

        originLabel: 'Откуда',
        destinationLabel: 'Куда',

        originModel: null,
        destinationModel: null,

        originModelName: null,
        destinationModelName: null,

        originIterable: null,
        destinationIterable: null,
      }
    },
    watch: {
      originModel(value) {
        this.handleModelChange(value);
      },
      destinationModel(value) {
        this.handleModelChange(value);
      }
    },
    methods: {
      init() {
        switch (this.direction) {
          case 4: this.initFromFieldAssignment(); break;
          case 3: this.initToFieldAssignment();   break;
        }
      },
      initFromFieldAssignment() {
        this.originModel          = this.mode === 'Create' ? null : this.models.origin;
        this.originModelName      = 'originFieldId';
        this.originIterable       = this.$store.getters.getEntities('fields');

        this.destinationModel     = this.mode === 'Create' ? null : this.models.destination;
        this.destinationModelName = 'destinationWarehouseId';
        this.destinationIterable  = this.$store.getters.getEntities('warehouses');
      },
      initToFieldAssignment() {
        this.originModel          = this.mode === 'Create' ? null : this.models.origin;
        this.originModelName      = 'originWarehouseId';
        this.originIterable       = this.$store.getters.getEntities('warehouses');

        this.destinationModel     = this.mode === 'Create' ? null : this.models.destination;
        this.destinationModelName = 'destinationFieldId';
        this.destinationIterable  = this.$store.getters.getEntities('fields');
      },
      handleChange(model) {
        this.updateModel({key: this.originModelName, value: this.originModel});
        this.updateModel({key: this.destinationModelName, value: this.destinationModel});
      },
      initEvents() {
        EventBus.$on('Transportation.' + this.mode + 'Component.AssignmentTypeChanged', (assignmentType) => {
          if (this.assignmentType !== assignmentType) {
            this.assignmentType   = assignmentType;
            if (this.mode === 'Update') { this.updateEditable({key: 'assignmentType', value: this.assignmentType}) }
            this.originModel      = null;
            this.destinationModel = null;
            this.updateState();
          }
        })
      },
      updateState() {
        switch (this.assignmentType) {
          case 4: this.updateFromFieldAssignment(); break;
          case 3: this.updateToFieldAssignment();   break;
        }
      },
      updateFromFieldAssignment() {
        this.originModelName      = 'originFieldId';
        this.originIterable       = this.$store.getters.getEntities('fields');

        this.destinationModelName = 'destinationWarehouseId';
        this.destinationIterable  = this.$store.getters.getEntities('warehouses');
      },
      updateToFieldAssignment() {
        this.originModelName      = 'originWarehouseId';
        this.originIterable       = this.$store.getters.getEntities('warehouses');

        this.destinationModelName = 'destinationFieldId';
        this.destinationIterable  = this.$store.getters.getEntities('fields');
      }
    }
  }
</script>

<style>

</style>
