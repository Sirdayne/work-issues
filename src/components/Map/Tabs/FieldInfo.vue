<template lang="pug">
passport( :fieldId="id",
          :orientation="orientation",
         )
</template>

<script>
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
  import passport from "components/agromap/field/fieldpassport/passport"

  export default {
    name: "FieldInfo",
    props: ["id",
      'orientation',
    ],
    mixins: [
      RecordsLoaderV2
    ],
    components: {
      passport,
    },
  }
</script>
