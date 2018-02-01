export default {
  data() {
    return {
      context: {
        organization: this.$root.context.organization,
        budget: this.$root.context.budget,
        year: this.$root.context.year,
        culture: this.$root.context.culture
      }
    }
  },
  watch: {
    '$root.context.culture': function(id) {
      this.context.culture = id
      this.$nextTick(() => this.onContextChange && this.onContextChange('culture'))
    },
    '$root.context.organization': function(id) {
      this.context.organization = id
      this.$nextTick(() => this.onContextChange && this.onContextChange('organization'))
    },
    '$root.context.budget': function(id) {
      this.context.budget = id
      this.$nextTick(() => this.onContextChange && this.onContextChange('budget'))
    },
    '$root.context.year': function(id) {
      this.context.year = id
      this.$nextTick(() => this.onContextChange && this.onContextChange('year'))
    }
  }
}
