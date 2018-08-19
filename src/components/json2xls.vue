<template lang="pug">
  el-button.excel(
    type="default",
    @click="download()"
  )
</template>

<script>
import {json2xls} from "lib/utils"

export default {
  props: {
    "model": {
      type: Array,
      default: [],
    },
    "props": {
      type: Object,
      default: {},
    },
    "name": {
      type: String,
      default: "",
    },
  },
  methods: {
    download() {
      let name = this.name
      let props = this.props
      let data = this.model.map(record => {
        let obj = {}
        Object.keys(props).forEach(key => {
          obj[props[key]] = record[key] || record[key] === 0 || record[key] === "0"
            ? record[key]
            : key.split(".").reduce((a, b) => {
              return ((a && a[b]) ? a[b] : "")
            }, record);
        })
        return obj
      })
      let colNum = Object.keys(props).length;
      return json2xls(data, name, colNum)
    }
  }
}
</script>

<style>

</style>
