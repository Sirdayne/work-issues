<template lang="pug">
.cols
  sidebar-toggle
  transition(name="slide-fade")
    el-menu.sidebar(
      v-if="sidebarToggleState",
      :default-active="$route.path",
      :unique-opened="true",
      router,
    )
      el-submenu(index="1")
        template(slot="title") Заметки
        router-link(:to="`/agromap/notepad/calendar`")
          el-menu-item(:index="`/agromap/notepad/calendar`") Календарь задач
        router-link(:to="`/agromap/notepad/create`")
          el-menu-item(:index="`/agromap/notepad/create`") Добавить заметку
      el-submenu(index="2")
        template(slot="title") Добавление анкет
        router-link(:to="`/agromap/notepad/anketa-vpr`")
          el-menu-item(:index="`/agromap/notepad/anketa-vpr`") ВПР
        router-link(:to="`/agromap/notepad/anketa-sev`")
          el-menu-item(:index="`/agromap/notepad/anketa-sev`") Сев
        router-link(:to="`/agromap/notepad/anketa-uhod`")
          el-menu-item(:index="`/agromap/notepad/anketa-uhod`") Уход
        router-link(:to="`/agromap/notepad/anketa-uborka`")
          el-menu-item(:index="`/agromap/notepad/anketa-uborka`") Уборка
        router-link(:to="`/agromap/notepad/anketa-par`")
          el-menu-item(:index="`/agromap/notepad/anketa-par`") Пар
      el-submenu(v-if="false", index="3")
        template(slot="title") Добавление чек-листов
        router-link(:to="`/agromap/notepad/checklist-chemical`")
          el-menu-item(:index="`/agromap/notepad/checklist-chemical`") Химия
        router-link(:to="`/agromap/notepad/checklist-sowing`")
          el-menu-item(:index="`/agromap/notepad/checklist-sowing`") Посев
        router-link(:to="`/agromap/notepad/checklist-fertilizer`")
          el-menu-item(:index="`/agromap/notepad/checklist-fertilizer`") Удобрения
        router-link(:to="`/agromap/notepad/checklist-harvest`")
          el-menu-item(:index="`/agromap/notepad/checklist-harvest`") Уборка
        router-link(:to="`/agromap/notepad/checklist-harrowing`")
          el-menu-item(:index="`/agromap/notepad/checklist-harrowing`") Боронование
      el-submenu(index="4")
        template(slot="title") Журналы
        router-link(:to="`/agromap/notepad/journal`")
          el-menu-item(:index="`/agromap/notepad/journal`") Журнал заметок
        router-link(:to="`/agromap/notepad/anketa-data`")
          el-menu-item(:index="`/agromap/notepad/anketa-data`") Анкетные данные
        router-link(:to="`/agromap/notepad/journal-events`")
          el-menu-item(:index="`/agromap/notepad/journal-events`") Журнал событий
      el-submenu(index="5")
        template(slot="title") Данные чек-листов
        router-link(:to="`/agromap/notepad/checklist-chemical-data`")
          el-menu-item(:index="`/agromap/notepad/checklist-chemical-data`") Химия
        router-link(:to="`/agromap/notepad/checklist-sowing-data`")
          el-menu-item(:index="`/agromap/notepad/checklist-sowing-data`") Посев
        router-link(:to="`/agromap/notepad/checklist-fertilizer-data`")
          el-menu-item(:index="`/agromap/notepad/checklist-fertilizer-data`") Удобрения
        router-link(:to="`/agromap/notepad/checklist-harvest-data`")
          el-menu-item(:index="`/agromap/notepad/checklist-harvest-data`") Уборка
        router-link(:to="`/agromap/notepad/checklist-harrowing-data`")
          el-menu-item(:index="`/agromap/notepad/checklist-harrowing-data`") Боронование
  transition(name="fade")
    router-view.workspace.workspace-notepad
</template>

<script>
import sidebarToggle from "components/sidebarToggle"

export default {
  components: {
    sidebarToggle,
  },
  computed: {
    sidebarToggleState() {
      return this.$store.getters.getSidebarToggleState;
    },
  },
}
</script>

<style scoped lang="stylus">
</style>
