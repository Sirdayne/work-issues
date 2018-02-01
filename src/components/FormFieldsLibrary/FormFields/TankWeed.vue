<template lang="pug">
  div
    el-form-item(label="Вид сорняков")
      el-select(v-model="selectModel", filterable, style="width: 180px")
        el-option(v-for="i in filterWeedTypesBySelected", :value="i.id", :key="i.id", :label="i.name")
      el-input-number(v-model="amountModel", :step="1", :debounce="deBounce", style="width: 150px")
      el-button(@click="addToWeedTankWeed()", :disabled="addToWeedButtonDisabledTankWeed") Добавить
    el-form-item
      el-tag(v-for="(item, index) in model", :key="index", type="primary", :closable="true", @close="removeFromWeedTankWeed(index)")
        | {{ selectIterable.find(p => p.id === item.weedTypeId).name }}
        b  ( {{ item.weedAmount }} )
</template>

<script>
  import FormFieldsMixin from 'components/FormFieldsLibrary/FormFieldsMixin';

  export default {
    mixins: [
      FormFieldsMixin
    ],
    data() {
      return {
        entityName: 'weedTypes',
        modelName: 'chemistryLimitWeedTypes',
        formFieldName: 'TankMix',
        selectModel: null,
        selectIterable: this.getWeedTypes(),
        amountModel: null,
        isArray: true,
        deBounce: 1200,
      }
    },
    methods: {
      handleChange(model) {
          this.updateModel({key: this.modelName, value: model});
      },
      addToWeedTankWeed() {
        let weedTypeId = this.selectModel;
        let weedAmount = this.amountModel;

        this.model.push({
          weedAmount: weedAmount,
          weedTypeId: weedTypeId
        });

        this.selectModel = null;
        this.amountModel = 0;
      },
      removeFromWeedTankWeed(index) {
        this.model.splice(index, 1);
      },
    },
    watch: {
      model(value) {
        this.handleModelChange(value);
      },
      selectModel(value) {
        this.amountModel = this.amountModel ? this.amountModel : 0;
      },
      isDialogWindowOpen(value) {
        if (!value) {
          this.selectModel = null;
          this.amountModel = 0;
        }
      }
    },
    computed: {
      addToWeedButtonDisabledTankWeed() {
        let id = this.selectModel;
        let normative = this.amountModel;

        return id === '' || normative === 0;
      },
      filterWeedTypesBySelected() {
        let weedtypes = this.model.map(c => c.weedTypeId);

        if (weedtypes.length) {
          return this.selectIterable.filter(c => {
            if (!weedtypes.includes(c.id)) {
              return c;
            }
          });
        } else {
          return this.selectIterable;
        }
      },
    }
  }
</script>

<style>

</style>
