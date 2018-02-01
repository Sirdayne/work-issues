<template lang="pug">
el-form-item.form-item(:label="fi.label")
  el-input(v-model="form[fi.model]")
</template>

<script>
export default {
  name: "FormItemInput",
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
