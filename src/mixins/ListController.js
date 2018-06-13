import sort from 'mixins/sort'
import filter from 'mixins/filter'
import paginate from 'mixins/paginate'

import { createIndex } from 'lib/utils'

export default {
  data() {
    return {
      perPage: 20,
      previewMode: false,
      previewItem: {},
      items: []
    }
  },
  mixins: [
    sort,
    filter,
    paginate
  ],
  computed: {
    data() {
      let data = [...this.items]
      data = this.filter(data)
      data = this.sort(data)
      return data
    },
    indexedItems() {
      return createIndex(this.items)
    }
  }
}
