<template lang="pug">
div.cols
  el-menu.sidebar(
  v-if="sidebarToggleState",
  :default-active='$route.path',
  unique-opened=true,
  )
    el-submenu(:index='`menu_${i}`', v-for="(group, i) in navigation", :key="i", :id="group.id")
      template(slot='title') {{group.label}}
      router-link(v-for="item in group.items", :to="`/${$root.module}/${item.link}`", :key="item.link")
        el-menu-item(:index='`/${$root.module}/${item.link}`') {{item.label}}
    el-button(@click="startHelpCatalog", class="button-help") ?
  router-view.workspace
</template>

<script>
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import navigation from 'pages/catalog/navigation'
import {EventBus} from 'services/EventBus'

import introLib from 'lib/introLib';
import Steps from 'components/help/steps';

export default {
  mixins: [
    RecordsLoaderV2
  ],
  data() {
    return {
      nav: navigation,
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
    navigation() {
      return this.nav
    }
  },
  methods: {
    startHelpCatalog() {
      if(Steps.catalog)
        introLib.begin(Steps.catalog);
    },
  }
}
</script>
