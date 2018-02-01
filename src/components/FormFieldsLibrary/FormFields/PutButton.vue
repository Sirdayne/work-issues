<template lang="pug">
  el-form-item(v-if="isVisible")
    el-button(:type="type", @click="put") {{ label }}
</template>

<script>
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods';
  import http from 'lib/httpQueryV2';
  import { EventBus } from 'services/EventBus';

  export default {
    props: ['propCurrentPage', 'propVisible', 'propLabel', 'propType'],
    data() {
      return {
        path: null,
        currentPage: this.propCurrentPage,
        isVisible: this.propVisible,
      }
    },
    mixins: [
      GlobalMethods
    ],
    computed: {
      type() {
        return this.propType ? this.propType : 'default';
      },
      label() {
        return this.propLabel ? this.propLabel : 'Сохранить';
      },
      editable() {
        return this.$store.getters.getEditable;
      }
    },
    created() {
      this.initEvents();
    },
    methods: {
      pathBuilder() {
        let path;

        switch (this.currentPage) {
          case 'Assignments'      : path =  this.path
                                            ? this.path
                                            : this.getAssignmentTypeByAssignmentTypeId(this.getAssignmentTypeId(this.editable.subOperationId)).value + 's/' + this.$root.context.organization;
                                    break;

          case 'ChemistryLimits' :  path =  'ChemistryLimits' + '/' + this.$root.context.organization;
                                    break;

          case 'FertilizerLimits' : path =  'ChemistryLimits' + '/' + this.$root.context.organization;
                                    break;

          case 'Transportation'   : path =  this.editable.assignmentType == 3
                                            ? 'ToFieldTransportation/' + this.$root.context.organization
                                            : 'FromFieldTransportation/' + this.$root.context.organization;
                                    break;
          case 'ChemistryLimitFact': path = 'ChemistryLimitFact' + '/' + this.$root.context.organization;
                                    break;
          case 'SeedLimitFact': path = 'SeedLimitFact' + '/' + this.$root.context.organization;
                                    break;
          default                 : path =  this.currentPage + '/' + this.$root.context.organization;
        }

        return path;
      },
      // TODO: Generalize
      initEvents() {
        EventBus.$on('Assignments.UpdateComponent.AssignmentTypeChanged', (assignmentType) => {
          this.path = this.getAssignmentTypeByAssignmentTypeId(assignmentType).value + 's/' + this.$root.context.organization;
        });
      },
      put() {
        this.path         = this.pathBuilder();
        let modifications = this.$store.getters.getPUTObject;
        let item          = this.editable;
        // Legacy implementation of Update Component
        // Differentiate what was modified
        for (let i in modifications) {
          if (modifications.hasOwnProperty(i)) {
            for (let j in item) {
              if (item.hasOwnProperty(j)) {
                if (i === j) {
                  item[j] = modifications[i];
                }
              }
            }
          }
        }
        http.put(this.path, item)
          .then(response => {
            EventBus.$emit(this.currentPage + '.UpdateComponent.PutObjectCompleted', true);
            this.savingProcess = false;
          })
      }
    }
  }
</script>

<style>

</style>
