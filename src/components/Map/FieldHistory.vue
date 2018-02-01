<template lang="pug">
sevoborot(:fieldClickedId="id", :croprotations="croprotations")

</template>

<script>
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
  import moment from 'moment';
  import sevoborot from "components/panelbottom/sevoborot"

  export default {
    name: "FieldHistory",
    props: ["id", 'croprotations'],
    components: {
      sevoborot,
    },
    mixins: [
      RecordsLoaderV2
    ],
  }
</script>
