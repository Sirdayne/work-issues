<template lang="pug">
.cols
  el-menu.sidebar(
    unique-opened=true,
    :defaultActive="defaultActive",
    v-if="sidebarToggleState"
  )
    router-link(:to="`/notepad?path=notes`")
      el-menu-item(:index="`1`") Журнал заметок
    router-link(:to="`/notepad?path=create-note`")
      el-menu-item(:index="`2`") Добавить заметки
    router-link(:to="`/notepad?path=calendar`")
      el-menu-item(:index="`3`") Календарь задач

  .workspace
    template(v-if="this.path === `notes`")
      notes(ref="Notes")
    template(v-if="this.path === `create-note`")
      create-note(ref="CreateNote")
    template(v-if="this.path === `calendar`")
      calendar(ref="Calendar")

</template>

<script>
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import Notes from 'components/agromap/notepad/notes'
import CreateNote from 'components/agromap/notepad/createnote'
import Calendar from 'components/agromap/notepad/calendar'

export default {
  mixins: [
    RecordsLoaderV2,
  ],
  components: {
    Notes,
    CreateNote,
    Calendar
  },
  data() {
    return {
      path: 'notes',
      defaultActive: "1",
    }
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    }
  },
  created() {
    this.path = (this.$route.query && this.$route.query.path) ? this.$route.query.path : 'notes'
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
        case 'notes' :
          this.defaultActive = "1"
          break
        case 'create-note' :
          this.defaultActive = "2"
          break
        case 'calendar' :
          this.defaultActive = "3"
          break
        default :
          this.defaultActive = "1"
      }
    }
  }
}
</script>
