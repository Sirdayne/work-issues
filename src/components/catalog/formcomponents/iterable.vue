<template lang="pug">
el-form-item.form-item(:label="fi.label")
  el-select(v-model="form[fi.model]", clearable, filterable, :multiple="fi.multiple", @change="fi.onChange(form[fi.model])")
    el-option(
      v-for="item in fi.iterable",
      :label="item[fi.prop]",
      :value="item.id",
      :key="item.id"
      )
</template>

<script>
export default {
  name: "FormItemIterable",
  props: ["form", "fi"],
  data() {
    return {
    };
  },
};
</script>
<style lang="stylus" scoped>
.form-item {
  flex: 1 0 auto;
  margin-right: 30px;
  max-width: 217px;
}
</style>
