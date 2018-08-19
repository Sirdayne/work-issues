<template lang="pug">
  div(v-loading="loading", element-loading-text="Загружается...")
    el-form(
    :inline="true",
    label-position="left",
    class="head-notes"
    )
      el-form-item
        h2 Календарь задач
      el-form-item
        el-button.filter(
        @click="filterUnfolded = true",
        type="default",
        class="tf-filter"
        ) .
      el-form-item(class="tf-search")
        el-input(
        placeholder="Поиск по тексту заметки...",
        icon="search",
        v-model="searchForm",
        :minlength="searchFormMin",
        :maxlength="searchFormMax",
        )

    el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
      el-form(:model="filterModel", label-width="130px", label-position="left")
        el-form(:model="filterModel", label-width="130px", label-position="left")
          el-form-item(label="Дата начала")
            el-date-picker(
            v-model="filterModel.start"
            type="date"
            placeholder="Выберите дату начала",
            format="dd-MM-yyyy"
            )
          el-form-item(label="Дата окончания")
            el-date-picker(
            v-model="filterModel.end"
            type="date"
            placeholder="Выберите дату окончания",
            format="dd-MM-yyyy"
            )
        el-form-item(label="Ответственный")
          el-select(v-model="filterModel.responsible", clearable, filterable)
            el-option(
            v-for="item in users",
            :label="item.fullName",
            :value="item.id",
            :key="item.id",
            )
        el-form-item
          el-button(@click="resetFilter") Сбросить

    el-dialog(v-if="dialogvisibleEdit", :visible.sync="dialogvisibleEdit", title="Редактирование заметки", size="tiny", :close-on-click-modal="false")
      update(:form="form")

    el-dialog(v-if="dialogvisibleDelete", :visible.sync="dialogvisibleDelete", title="Удаление заметки", size="tiny", :close-on-click-modal="false")
      remove(:id="selectedNoteId")

    el-table(
      v-if="filteredNotes && !loading",
      :data="paginate(filteredNotes)",
      border,
      resizable,
      v-loading="loading",
      element-loading-text="Загружается..."
    )
      el-table-column(
        label="Выполнено",
        header-align="center",
        align="center",
        width="130"
      )
        template(slot-scope="scope")
          el-checkbox(v-model="scope.row.isCompleted", @change="changeCompleted(scope.row.id)")

      el-table-column(label="Срок", prop="formatDate", width="150", header-align="center")
      el-table-column(label="Текст", prop="text", header-align="center")
      el-table-column(label="Ответственный", width="300", prop="responsibleUserFullName", header-align="center")
      el-table-column(label="Автор", width="250", prop="authorFullName", header-align="center")

      el-table-column(
      label="Операции",
      header-align="center",
      align="center",
      width="160"
      )
        template(slot-scope="scope")
          el-button.btn-icon(v-if="scope.row.editRights", @click="edit(scope.row.id)", size="small", icon="edit")
          el-button.btn-icon(v-if="scope.row.editRights", @click="remove(scope.row.id)", size="small", icon="delete2")

    .no-results(v-else) Нет результатов
    el-pagination(
      v-if="filteredNotes",
      layout="total, prev, pager, next",
      :total="filteredNotes.length",
      :page-size="perPage",
      :current-page="currentPage",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )
</template>

<script>
import http from "services/http"
import {EventBus} from "services/EventBus"
import {fetchEntities, fromVuex} from "services/RecordsLoader"
import ListController from "mixins/ListController"
import moment from "moment"
import update from "pages/agromap/notepad/notes/update.vue"
import remove from "pages/agromap/notepad/notes/remove.vue"

export default {
  mixins: [

    ListController
  ],
  components: {
    update,
    remove
  },
  data() {
    return {
      searchForm: null,
      searchFormMin: 1,
      searchFormMax: 20,
      form: {
        date: null,
        text: null,
        responsibleUserId: null,
      },
      notes: [],
      users: [],
      dialogvisibleEdit: false,
      dialogvisibleDelete: false,
      perPage: 10,
      currentPage: 1,
      endpoint: "Notes/",
      loading: true
    }
  },
  created() {
    EventBus.$on("notesChanged", () => {
      this.refresh()
    });
    EventBus.$on("notesDialogsClose", () => {
      this.hideDialogs()
    });
    fetchEntities([
      "users",
      "notes"
    ], this.afterFetch );
  },
  computed: {
    filteredNotes() {
      return this.notes.filter(note => {
        return (!this.searchForm || !note.text || note.text.toLowerCase().includes(this.searchForm.toLowerCase()))
            && (!this.filterModel.start || new Date(note.date) >= new Date(this.filterModel.start))
            && (!this.filterModel.end || new Date(note.date) <= new Date(this.filterModel.end))
            && (!this.filterModel.responsible || note.responsibleUserId === this.filterModel.responsible)
      }).sort(function (a, b) {
        if (a.date > b.date) {
          return 1;
        }
        if (a.date < b.date) {
          return -1;
        }
        return 0;
      })
    },
  },
  methods: {
    afterFetch(){
      this.users = fromVuex("users")
      this.notes = fromVuex("notes").map(x => {
        if(x.date){
          x.formatDate = moment(x.date).format("DD.MM.YYYY")
        }
        //this.$root.profile.id
        this.$root.profile.fullName === x.authorFullName ?  x.editRights = true : x.editRight = false
        x.checked = false
        return x
      }).filter(n => n.date)
      this.loading = false
    },
    changeCompleted(id){
      let note = this.notes.find(n => n.id === id)
      let endpoint = this.endpoint + this.$root.context.organization;
      http.put(endpoint, note).then(() => {
        this.refresh();
      });
    },
    refresh() {
      this.hideDialogs()
      this.nullForm()
      fetchEntities([
        "users",
        "notes"
      ], this.afterFetch);
      this.loading = true
    },
    edit(id){
      let note = this.notes.find(n => n.id === id)
      this.form.id = note.id
      this.form.date = note.date
      this.form.fieldId = note.fieldId
      this.form.text = note.text
      this.form.responsibleUserId = note.responsibleUserId

      this.dialogvisibleEdit = true
    },
    remove(id){
      this.selectedNoteId = id
      this.dialogvisibleDelete = true
    },
    hideDialogs(){
      this.dialogvisibleEdit = false
      this.dialogvisibleDelete = false
    },
    nullForm(){
      for (let item in this.form) {
        this.form[item] = null
      }
    },
  }
}

</script>

<style>
  .head-notes{
    margin-top: 10px;
  }
  .head-notes h2{
    margin: 0;
    font-size: 24px;
  }
  .tf-search, .tf-search input{
    width: 350px;
  }
  .tableHeading {
    display: inline-block;
    margin-right: 20px;
  }

  .downloadLzkStyle {
    display: block;
    margin-top: 20px;
  }

  .downloadFieldSelect {
    width: 250px;
  }

  .btn-icon+.btn-icon, .btn-icon{
    margin-left: 0;
    padding: 4px 6px;
  }

  .loupe div{
    font-size: 14px;
    margin-bottom: 5px;
  }

</style>
