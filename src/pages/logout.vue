<template lang="pug">
.page
</template>

<script>
import Auth from "services/Auth"

export default {
  created() {
    Auth.logout()
  }
}
</script>
