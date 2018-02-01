<template lang="pug">
  div
    el-form-item(label="Баковая смесь")
      el-select(v-model="selectModel", filterable, style="width: 180px")
        el-option(v-for="i in filterChemicalPreparationsBySelected", :value="i.id", :key="i.id", :label="i.name")
      el-input-number(v-model="amountModel", :min="minimumNorm", :max="maximumNorm", :step="0.001", :debounce="deBounce", style="width: 150px")
      el-button(@click="addToMixtureTankMix()", :disabled="addToMixtureButtonDisabledTankMix") Добавить
    el-form-item
      el-tag(v-for="(item, index) in model", :key="index", type="primary", :closable="true", @close="removeFromMixtureTankMix(index)")
        | {{ selectIterable.find(p => p.id === item.chemicalPreparationId).name }}
        b  ( {{ item.normative }} )
</template>

<script>
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        entityName: 'chemicalPreparations',
        modelName: 'chemistryChemicalTreatments',
        formFieldName: 'TankMix',
        selectModel: null,
        selectIterable: this.getChemistryLimitsChemicalPreparations(),
        amountModel: null,
        isArray: true,
        deBounce: 1200,
      }
    },
    methods: {
      handleChange(model) {
          this.updateModel({key: this.modelName, value: model});
      },
      addToMixtureTankMix() {
        let preparationId = this.selectModel;
        let normative = this.amountModel;

        this.model.push({
          normative: normative,
          chemicalPreparationId: preparationId
        });

        this.selectModel = null;
        this.amountModel = 0;
      },
      removeFromMixtureTankMix(index) {
        this.model.splice(index, 1);
      },
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      },
      selectModel(value) {
        this.amountModel = this.amountModel ? this.amountModel : this.minimumNorm;
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
      addToMixtureButtonDisabledTankMix() {
        let id = this.selectModel;
        let normative = this.amountModel;

        return id === '' || normative === 0;
      },
      filterChemicalPreparationsBySelected() {
        let treatments = this.model.map(c => c.chemicalPreparationId);

        if (treatments.length) {
          return this.selectIterable.filter(c => {
            if (!treatments.includes(c.id)) {
              return c;
            }
          });
        } else {
          return this.selectIterable;
        }
      }
    }
  }
</script>

<style>

</style>
