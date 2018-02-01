<template lang="pug">
.page
</template>

<script>
export default {
  created() {
    this.$auth.logout()
  }
}
</script>
