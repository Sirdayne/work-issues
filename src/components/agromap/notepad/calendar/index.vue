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

    el-dialog(v-if="dialogvisibleLoupe", :visible.sync="dialogvisibleLoupe", title="Информация", size="tiny")
      .loupe
        div Срок: {{ loupeRows.formatDate }}
        div Болезнь: {{ loupeRows.diseaseName }}
        div Насекомые: {{ loupeRows.insectName }}
        div Вид сорняков:
        div(v-for="item in loupeRows.noteWeedTypes")
          el-tag(:color="item.color") {{ item.weedTypeName }}
          el-tag(:color="item.color") {{ item.weedAmount }}
          el-tag(:color="item.color") {{ item.weedAmountEdited }}

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
        el-form-item(label="Насекомые")
          el-select(v-model="filterModel.insect", clearable, filterable)
            el-option(
            v-for="item in insects",
            :label="item.name",
            :value="item.id",
            :key="item.id",
            )
        el-form-item(label="Болезнь")
          el-select(v-model="filterModel.disease", clearable, filterable)
            el-option(
            v-for="item in diseases",
            :label="item.name",
            :value="item.id",
            :key="item.id",
            )
        el-form-item
          el-button(@click="resetFilter") Сбросить

    el-dialog(v-if="dialogvisibleEdit", :visible.sync="dialogvisibleEdit", title="Редактирование заметки", size="tiny", :close-on-click-modal="false")
      el-form(label-width="170px", label-position="left", v-if="ready")
        el-form-item(label="Текст")
          el-input(type="textarea", :rows="5", v-model="form.text", placeholder="Редактируемая заметка", style="max-width: 500px")
        el-form-item(label="Ответственный")
          el-select(v-model="form.responsibleUserId", clearable, filterable)
            el-option(
            v-for="u in users",
            :key="u.id",
            :label="u.fullName",
            :value="u.id"
            )
        el-form-item(label="Срок")
          el-date-picker(
          v-model="form.date",
          type="date",
          placeholder="Выберите срок",
          format="dd-MM-yyyy"
          )
        el-form-item(label="Болезнь")
          el-select(v-model="form.diseaseId", clearable, filterable)
            el-option(
            v-for="d in diseases",
            :key="d.id",
            :label="d.name",
            :value="d.id"
            )
        el-form-item(label="Насекомые")
          el-select(v-model="form.insectId", clearable, filterable)
            el-option(
            v-for="i in insects",
            :key="i.id",
            :label="i.name",
            :value="i.id"
            )
        el-form-item(label="Вид сорняков")
          el-select(v-model="weedTypeId", filterable)
            el-option(v-for="c in filterWeedTypesBySelected", :label="c.name", :value="c.id", :key="c.id")
          el-input-number(v-model="weedAmount", :step="1", :min="0")
          el-button(@click="addToWeed()", :disabled="addToWeedButton()") Добавить
          div.tags
            el-tag(v-for="(item, index) in form.noteWeedTypes",
            :key="index"
            type="primary",
            :closable="true",
            @close="removeFromWeed(index)")
              | {{ weedTypes.find(w => w.id === item.weedTypeId).name }}
              b  ( {{ item.weedAmount }} )
        el-form-item
          el-button(type="primary", @click="formPut") Сохранить

    el-table(
    v-if="filteredNotes && ready",
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
          el-button.btn-icon(@click="showDialogLoupe(scope.row.id)", size="small", icon="view")
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
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    data() {
      return {
        colors: [
          {
            color: '#8391a5',
            name: 'grey'
          },
          {
            color: '#FF8000',
            name: 'orange'
          },
          {
            color: '#74DF00',
            name: 'green'
          },
          {
            color: '#2E2EFE',
            name: 'blue'
          },
          {
            color: '#FFD100',
            name: 'yellow'
          }
        ],
        searchForm: null,
        searchFormMin: 1,
        searchFormMax: 20,
        form: {
          date: null,
          text: null,
          responsibleUserId: null,
          diseaseId: null,
          insectId: null,
          noteWeedTypes: [],
        },
        loupeRows: {},
        notes: [],
        diseases: [],
        insects: [],
        users: [],
        weedTypes: [],
        weedTypeId: null,
        weedAmount: 0,
        dialogvisibleEdit: false,
        dialogvisibleLoupe: false,
        perPage: 10,
        currentPage: 1,
        endpoint: 'Notes/',
        loading: true
      }
    },
    created() {
      this.fetchEntities([
        'diseases',
        'insects',
        'users',
        'weedTypes',
        'notes'
      ], this.afterFetch );
    },
    computed: {
      filteredNotes() {
        return this.notes.filter(note => {
          return (!this.searchForm || !note.text || note.text.toLowerCase().includes(this.searchForm.toLowerCase()))
            && (!this.filterModel.start || new Date(note.date) >= new Date(this.filterModel.start))
            && (!this.filterModel.end || new Date(note.date) <= new Date(this.filterModel.end))
            && (!this.filterModel.insect || note.insectId === this.filterModel.insect)
            && (!this.filterModel.disease || note.diseaseId === this.filterModel.disease)
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
      filterWeedTypesBySelected() {
        let weedtypes = this.form.noteWeedTypes.map(c => c.weedTypeId);

        if (weedtypes.length) {
          return this.weedTypes.filter(c => {
            if (!weedtypes.includes(c.id)) {
              return c;
            }
          });
        } else {
          return this.weedTypes;
        }
      },
    },
    methods: {
      afterFetch(){
        this.users = this.fromVuex('users')
        this.diseases = this.fromVuex('diseases')
        this.insects = this.fromVuex('insects')
        this.weedTypes = this.fromVuex('weedTypes')
        this.notes = this.fromVuex('notes').map(x => {
          if(x.date){
            x.formatDate = moment(x.date).format('DD.MM.YYYY')
          }
          let i = -1;
          x.noteWeedTypes.map(c => {
            if (i < this.colors.length-1) {
              i++;
            } else {
              i = 0;
            }
            c.color = this.colors[i].color;

            return c;
          })
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
        this.fetchEntities([
          'diseases',
          'insects',
          'users',
          'weedTypes',
          'notes'
        ], this.afterFetch);
        this.loading = true
      },
      edit(id){
        let note = this.notes.find(n => n.id === id)
        this.form.id = note.id
        this.form.date = note.date
        this.form.text = note.text
        this.form.fieldId = note.fieldId
        this.form.responsibleUserId = note.responsibleUserId
        this.form.diseaseId = note.diseaseId
        this.form.insectId = note.insectId
        this.form.noteWeedTypes = note.noteWeedTypes

        this.dialogvisibleEdit = true
      },
      formPut(){
        let endpoint = this.endpoint + this.$root.context.organization;
        if (this.form.date && typeof this.form.date !== 'string'){
          this.form.date = moment(this.form.date, 'YYYY-MM-DD').format("YYYY-MM-DDTHH:mm:ss")
        }
        let note = this.notes.find(n => n.id === this.form.id)
        for (var key in this.form) {
          note[key] = this.form[key]
        }
        http.put(endpoint, note).then(() => {
          this.refresh();
        });
      },
      remove(id){
        let endpoint = this.endpoint;
        http.delete(endpoint, id).then(() => {
          this.refresh();
        });
      },
      hideDialogs(){
        this.dialogvisibleEdit = false
      },
      nullForm(){
        for (let item in this.form){
          this.form[item] = null
        }
        this.form.noteWeedTypes = []
        this.weedTypeId = null
        this.weedAmount = 0
      },
      addToWeedButton() {
        if (this.weedTypeId && this.weedAmount > 0)
          return false
        else
          return true
      },
      addToWeed() {
        this.form.noteWeedTypes.push({
          weedTypeId: this.weedTypeId,
          weedAmount: this.weedAmount
        });

        this.weedTypeId = null
        this.weedAmount = 0
      },
      removeFromWeed(index) {
        this.form.noteWeedTypes.splice(index, 1);
      },
      showDialogLoupe(id){
        let note = this.notes.find(n => n.id === id)
        this.loupeRows.formatDate = note.formatDate
        this.loupeRows.diseaseName = note.diseaseName
        this.loupeRows.insectName = note.insectName
        this.loupeRows.noteWeedTypes = note.noteWeedTypes
        this.dialogvisibleLoupe = true
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
