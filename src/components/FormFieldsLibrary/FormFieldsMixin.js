import GlobalMethods from './GlobalMethods'
import moment from 'moment'

export default {
  props: ['propModel', 'propIterable', 'propVisible', 'propLabel'],
  mixins: [
    GlobalMethods
  ],
  data() {
    return {
      isVisible: this.propVisible !== undefined ? this.propVisible : true,
      model: this.propModel,
      iterable: this.propIterable,
      modelName: null,
      iterableAll: [],
    }
  },
  computed: {
    editable() {
      if (this.mode === 'Update') {
        return this.$store.getters.getEditable;
      }
    },
    creatable() {
      if (this.mode === 'Create') {
        return this.$store.getters.getCreatable;
      }
    },
    currentPage() {
      return this.$store.getters.getCurrentPage;
    },
    organization() {
      return this.$store.getters.getOrganizationId;
    },
    mode() {
      return this.getCurrentMode();
    }
  },
  watch: {
    iterable(value) {
      this.model = (value && value.length) ? value[0].id : this.refreshModel()
    },
  },
  methods: {
    updateEditable(params = {key: null, value: null}) {
      if (this.mode === 'Update') {
        this.$store.dispatch('actionUpdateEditable', params);
      }
    },
    updateCreatable(params = {key: null, value: null}) {
      if (this.mode === 'Create') {
        this.$store.dispatch('actionUpdateCreatable', params);
      }
    },
    updateModel(params) {
      this.updateEditable(params);
      this.updateCreatable(params);
    },
    refreshModel() {
      if (typeof this.model === 'number') {
        this.model = null;
      } else if (Array.isArray(this.model)) {
        this.model = [];
      } else if (typeof this.model === 'object') {
        this.model = {};
      }
    },
    handleModelChange(model) {
      // Prevent handling if value is null or undefined
      // which causes errors on dependencies
      if  (
            (typeof model === 'object' && this.modelName && this.modelName.substr(0, 4) === 'date')
            ||
            (typeof model === 'object' && model && model.hasOwnProperty(this.modelName) && model[this.modelName])
            ||
            (typeof model === 'number' && model)
            ||
            (typeof model === 'object' && Array.isArray(model) && model)
            ||
            (typeof model === 'object' && this.modelName === 'inspectionDate')
          )
      {
        this.handleChange(model);
      }
    },
    handleDateTimeObjectInitialization(name) {
      if (this.mode === 'Create') {
        return  this.creatable.hasOwnProperty('dateTimeRange') && this.creatable.dateTimeRange[name]
                ? this.creatable.dateTimeRange[name]
                : moment(moment().set({'year': this.$root.context.year, 'hour': 18, 'minute': 0, 'second': 0, 'millisecond': 0})).format("MM.DD.YYYY HH:mm")
      } else if (this.mode === 'Update') {
        return moment(this.toUnixTimestamp(this.editable.dateTimeRange[name])).format("MM.DD.YYYY HH:mm");
      }
    }
  },
  created() {
    if (this.init) this.init();
    if (this.initEvents) this.initEvents();
  }
}
