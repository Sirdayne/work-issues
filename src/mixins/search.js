import Fuse from 'fuse.js'

export default {
  data() {
    return {
      searchString: '',
      strictSearch: false,
      searchKeys: []
    }
  },
  watch: {
    searchString() {
      this.currentPage = 1
    }
  },
  computed: {
    fuse() {
      return new Fuse(this.data, {
        shouldSort: true,
        threshold: this.strictSearch? 0 : 0.4,
        tokenize: true,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: this.searchKeys
      })
    }
  },
  methods: {
    search(data) {
      return this.searchString?
        this.fuse.search(this.searchString) :
        data
    }
  }
}
