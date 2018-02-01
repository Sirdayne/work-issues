<template lang="pug">
.cols(
  v-loading="!ready",
  element-loading-text="Загружается..."
  )
  el-menu.sidebar(
    unique-opened=true,
    :defaultActive="defaultActive",
    v-if="ready && sidebarToggleState"
  )
    el-submenu(:index="`0`")
      template(slot="title") Отчеты ТОК
      router-link(:to="`/reportsbz?path=accounting-incoming-transfers`")
        el-menu-item(:index="`1`") Журнал весовщика - прием
      router-link(:to="`/reportsbz?path=accounting-internal-transfers`")
        el-menu-item(:index="`2`") Журнал весовщика - перемещение
      router-link(:to="`/reportsbz?path=accounting-outgoing-transfers`")
        el-menu-item(:index="`3`") Журнал весовщика - отгрузка
      router-link(:to="`/reportsbz?path=accounting-grain-registry`")
        el-menu-item(:index="`4`") Реестр приема зерна
    el-submenu(:index="`5`")
      template(slot="title") Отчеты хоз-ва
      router-link(:to="`/reportsbz?path=`")
        el-menu-item(:index="`6`")
    el-submenu(:index="`7`")
      template(slot="title") Отчеты группы
      router-link(:to="`/reportsbz?path=`")
        el-menu-item(:index="`8`")
  .workspace(v-if="ready")
    template(v-if="this.path === `accounting-incoming-transfers`")
      incoming-transfers(ref="IncomingTransfers")
    template(v-if="this.path === `accounting-internal-transfers`")
      internal-transfers(ref="InternalTransfers")
    template(v-if="this.path === `accounting-outgoing-transfers`")
      outgoing-transfers(ref="OutgoingTransfers")
    template(v-if="this.path === `accounting-grain-registry`")
      grain-registry(ref="GrainRegistry")
</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import IncomingTransfers from 'components/incomingtransfers'
import InternalTransfers from 'components/internaltransfers'
import OutgoingTransfers from 'components/outgoingtransfers'
import GrainRegistry from 'components/grainregistry'

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  components: {
    IncomingTransfers,
    InternalTransfers,
    OutgoingTransfers,
    GrainRegistry
  },
  data() {
    return {
      path: 'accounting-incoming-transfers',
      defaultActive: "1",
    }
  },
  computed: {
    cultures() {
      return this.fromVuex('cultures')
    },
    _reports() {
      return this.fromVuex('reports')
    },
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    }
  },
  created() {
    this.path = (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'accounting-incoming-transfers'
    this.defaultActive = this.path
    this.defineActiveLink()
    this.fetchEntities([
      'reports',
      'cultures',
    ], this.onLoad);
  },
  watch: {
    ['$route.params.id'] (val) {      // TODO !! Fast fix
      location.reload()
    },
    ['$route.fullPath'] (val) {
      this.path =  (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'reportsbz'
    }
  },
  methods: {
    defineActiveLink() {
      switch(this.defaultActive) {
        case 'accounting-incoming-transfers' :
          this.defaultActive = "1"
          break
        case 'accounting-internal-transfers' :
          this.defaultActive = "2"
          break
        case 'accounting-outgoing-transfers' :
          this.defaultActive = "3"
          break
        case 'accounting-grain-registry' :
          this.defaultActive = "4"
          break
        default :
          this.defaultActive = "1"
      }
    }
  }
}
</script>
