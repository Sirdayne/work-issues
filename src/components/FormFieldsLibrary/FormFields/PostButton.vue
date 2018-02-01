<template lang="pug">
  el-form-item(v-if="isVisible")
    el-button(:type="type", @click="post") {{ label }}
</template>

<script>
  import GlobalMethods from 'components/FormFieldsLibrary/GlobalMethods';
  import http from 'lib/httpQueryV2';
  import { EventBus } from 'services/EventBus';
  import moment from 'moment';

  export default {
    props: ['propCurrentPage', 'propVisible', 'propLabel', 'propType'],
    data() {
      return {
        path: null,
        currentPage: this.propCurrentPage,
        isVisible: this.propVisible,
        eDateTimeStart: moment().set({'year': this.$root.context.year, 'hour': 9, 'minute': 0, 'second': 0, 'millisecond': 0}),
        eDateTimeEnd: moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0})
      }
    },
    mixins: [
      GlobalMethods
    ],
    computed: {
      type() {
        return this.propType ? this.propType : 'primary';
      },
      label() {
        return this.propLabel ? this.propLabel : 'Добавить';
      },
      mode() {
        return this.getCurrentMode();
      },
      creatable() {
        return this.$store.getters.getCreatable;
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
                                            : this.getAssignmentTypeByAssignmentTypeId(this.getAssignmentTypeId(this.creatable.subOperationId)).value + 's/' + this.$root.context.organization;
                                    break;

          case 'FertilizerLimits' : path =  'ChemistryLimits' + '/' + this.$root.context.organization;
                                    break;

          case 'Transportation'   : path =  this.creatable.assignmentType == 3
                                            ? 'ToFieldTransportation/' + this.$root.context.organization
                                            : 'FromFieldTransportation/' + this.$root.context.organization;
                                    break;

          default                 : path =  this.currentPage + '/' + this.$root.context.organization;
        }
        return path;
      },
      // TODO: Generalize
      initEvents() {
        EventBus.$on(this.currentPage + '.' + this.mode + 'Component.AssignmentTypeChanged', (assignmentType) => {
          switch (this.currentPage) {
            case 'Assignments'      : this.path = this.getAssignmentTypeByAssignmentTypeId(assignmentType).value + 's/' + this.$root.context.organization;
                                      break;

            case 'Transportation: ' : this.path = this.creatable.assignmentType == 3
                                                  ? 'ToFieldTransportation/' + this.$root.context.organization
                                                  : 'FromFieldTransportation/' + this.$root.context.organization;
                                      break;
          }
        });
        if( this.currentPage == 'Assignments'){
          EventBus.$on('Assignments.CreateComponent.DateTimeStartFieldChanged', (dateTimeStart) => {
            this.eDateTimeStart = dateTimeStart;
          });
          EventBus.$on('Assignments.CreateComponent.DateTimeEndFieldChanged', (dateTimeEnd) => {
            this.eDateTimeEnd = dateTimeEnd;
          });
        }
      },
      post() {
        this.path   = this.pathBuilder();
        const item  = this.creatable;
        //для страницы assignments есть валидация дат и часов
        if( this.currentPage == 'Assignments') {
          let start = new Date(this.eDateTimeStart);
          let end = new Date(this.eDateTimeEnd);
          start = moment(start.getTime());
          end = moment(end.getTime());
          let diffMoment = 0;
          diffMoment = end.diff(start, 'hours');
          if (diffMoment <= 24) {
            if(item.seedLimitId.length > 0){
              for(var i = 0; i < item.seedLimitId.length; i++){
                let postItem = Object.assign({}, item)
                postItem.seedLimitId = item.seedLimitId[i]
                this.postData(postItem)
              }
            }
            else if(item.fieldId.length > 0){
              for(var i = 0; i < item.fieldId.length; i++){
                let postItem = Object.assign({}, item)
                postItem.fieldId = item.fieldId[i]
                this.postData(postItem)
              }
            }
            else {
              this.postData(item)
            }
          }
          else {
            this.$message('Разница между датами не должна превышать 24 часа');
          }
        //для любой другой страницы
        } else {
          this.postData(item)
        }
      },
      postData(item){
        http.post(this.path, item)
          .then(response => {
            EventBus.$emit(this.currentPage + '.' + this.mode + 'Component.PostObjectCompleted', true);
            this.savingProcess = false;
          })
          .catch((error) => {
          });
      },
    }
  }
</script>

<style>

</style>
