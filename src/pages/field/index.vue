<template lang="pug">
.cols
  el-menu.sidebar(
    unique-opened=true,
    :defaultActive="defaultActive",
    v-if="sidebarToggleState"
  )
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`1`") Паспорт поля
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`2`") Севооборот
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`3`") Карта работ
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`4`") БПЛА
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`5`") Фото
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`6`") История работ
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`7`") История удобрений
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`8`") История СЗР
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`9`") Учет сорняков
    router-link(:to="`/field?path=field-passport`")
      el-menu-item(:index="`10`") Прогноз погоды

  .workspace
    template(v-if="this.path === `field-passport`")
      field-passport(ref="FieldPassport")

</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import FieldPassport from 'components/agromap/field/fieldpassport'

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  components: {
    FieldPassport
  },
  data() {
    return {
      path: 'field-passport',
      defaultActive: "1",
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    }
  },
  created() {
    this.path = (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'field-passport'
    this.defaultActive = this.path
    this.defineActiveLink()
  },
  watch: {
    ['$route.params.id'] (val) {      // TODO !! Fast fix
      location.reload()
    },
    ['$route.fullPath'] (val) {
      this.path =  (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'field'
    }
  },
  methods: {
    defineActiveLink() {
      switch(this.defaultActive) {
        case 'field-passport' :
          this.defaultActive = "1"
          break
        default :
          this.defaultActive = "1"
      }
    }
  }
}
</script>
