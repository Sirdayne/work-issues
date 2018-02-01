<template lang="pug">
  div
    template(v-for="chemistry in model")
      fact-normative(:propModel="chemistry")
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';
  import FactNormative from './ChemistryFactNormative.vue';

  export default {
    components: {
      FactNormative
    },
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
      }
    },
    watch: {
      model(value) {
        this.handleChange(value);
      }
    },
    methods: {
      handleChange(model) {
        this.updateModel({mode: 'update', formField: {name: this.modelKey, value: this.model}});
      },
      initEvents() {
        EventBus.$on('ChemistryLimitFact.UpdateComponent.FactNormativeFieldChanged', (chemistryChemicalTreatments) => {
          this.model.map(c => {
            if (c.chemicalPreparationId === chemistryChemicalTreatments.chemicalPreparationId) {
              c.factNormative = chemistryChemicalTreatments.factNormative;
            }
          });
        });
      }
    }
  }
</script>
