<template lang="pug">
  div
    el-form-item(label="Удобрение")
      el-select(v-model="selectModel", filterable, style="width: 180px")
        el-option(v-for="i in iterable", :value="i.id", :key="i.id", :label="i.name")
      el-input-number(v-model="amountModel", :min="minimumNorm", :max="maximumNorm", :debounce="deBounce", style="width: 150px")
</template>

<script>
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        selectModel: null,
        amountModel: null,
        iterable: this.getFertilizerLimitsChemicalPreparations(),
        deBounce: 1200,
      }
    },
    methods: {
      init() {
        switch (this.currentPage) {
          case 'FertilizerLimits': this.initOnFertilizerLimitsPage(); break;
        }
      },
      initOnFertilizerLimitsPage() {
        this.modelName = 'chemistryChemicalTreatments';
        this.selectModel = this.model && this.model.length ? this.model[0].chemicalPreparationId : null;
        this.amountModel = this.model && this.model.length ? this.model[0].normative : null;
      },
      handleChange(model) {
        this.updateModel({key: this.modelName, value: model});
      },
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
        this.selectModel = value.length ? value[0].chemicalPreparationId : null;
        this.amountModel = value.length ? value[0].normative : null;
      },
      selectModel(value) {
        let model = this.model;

        if (model.length) {
          model[0].chemicalPreparationId = value;
          this.handleChange(model);
        }

        this.amountModel = this.amountModel ? this.amountModel : this.minimumNorm;
      },
      amountModel(value) {
        let model = this.model;

        if (model.length) {
          model[0].normative = value;
          this.handleChange(model);
        }
      },
      isDialogWindowOpen(value) {
        if (!value) {
          this.selectModel = null;
          this.amountModel = 0;
        }
      }
    },
    computed: {
      minimumNorm() {
        return  this.getMinMaxChemicalPreparationNorm(this.selectModel, 'minNorm')
                ? this.getMinMaxChemicalPreparationNorm(this.selectModel, 'minNorm')
                : 0;
      },
      maximumNorm() {
        return  this.getMinMaxChemicalPreparationNorm(this.selectModel, 'maxNorm')
                ? this.getMinMaxChemicalPreparationNorm(this.selectModel, 'maxNorm')
                : 0;
      },
    }
  }
</script>

<style>

</style>
