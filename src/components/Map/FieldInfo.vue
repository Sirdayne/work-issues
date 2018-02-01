<template lang="pug">
passport( :fieldId="id",
          :fields="fields",
          :brigades="brigades",
          :fieldzones="fieldzones",
          :fieldcontours="fieldcontours",
          :terrains="terrains",
          :soiltypes="soiltypes",
          :compositions="compositions",
          :croprotations="croprotations",
          :seedlimits="seedlimits",
          :sorts="sorts",
          :sowings="sowings",
          :reproductions="reproductions",
          :orientation="orientation",
         )
</template>

<script>
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
  import passport from "components/agromap/field/fieldpassport/passport"

  export default {
    name: "FieldInfo",
    props: ["id",
      'fields',
      'brigades',
      'fieldzones',
      'fieldcontours',
      'terrains',
      'soiltypes',
      'compositions',
      'croprotations',
      'seedlimits',
      'sorts',
      'sowings',
      'reproductions',
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
