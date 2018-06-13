<template lang="pug">
sevoborot(:fieldClickedId="id")

</template>

<script>
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
  import moment from 'moment';
  import sevoborot from "components/panelbottom/sevoborot"

  export default {
    name: "FieldHistory",
    props: ["id"],
    components: {
      sevoborot,
    },
    mixins: [
      RecordsLoaderV2
    ],
  }
</script>
