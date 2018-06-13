<template lang="pug">
.catalog-static-container(v-loading="loading", element-loading-text="Загружается...")
  div.new-entry
    el-button(@click="add()", type="default") Новая запись
  el-dialog(
    :visible.sync="formDialogVisible",
    :before-close="handleClose",
    :title="formTitle",
    size="medium",
    :modal="false",
  )
    el-form(:model="item")
      el-form-item(label="Наименование")
        el-input(v-model="item.name")
      el-form-item(label="Тип")
        el-select(v-model="item.weedTypeId", filterable)
          el-option(
            v-for="wt in weedtypes",
            :label="wt.name",
            :value="wt.id",
            :key="wt.id",
            )
      el-form-item(label="Описание")
        el-input(v-model="item.description")
      el-form-item(label="Семена")
        el-upload(action="", :auto-upload="false", :show-file-list="false", :on-change="addSeedImage")
          el-button(slot="trigger", size="small", type="primary", icon="picture") Выбрать
      el-form-item(label="Всходы")
        el-upload(action="", :auto-upload="false", :show-file-list="false", :on-change="addSeedLingImage")
          el-button(slot="trigger", size="small", type="primary", icon="picture") Выбрать
      el-form-item(label="Созревание")
        el-upload(action="", :auto-upload="false", :show-file-list="false", :on-change="addMaturationImage")
          el-button(slot="trigger", size="small", type="primary", icon="picture") Выбрать
      el-form-item
        el-button(type="primary", @click="submitForm(item)", :loading="!!base64Queue") Сохранить
  el-dialog(
    :visible.sync="imgDialogVisible",
    :before-close="handleClose",
    title="",
    size="small",
    :modal="false",
  )
    template(v-if="imgLoading")
      div(style="height: 400px; position: relative;")
        div(style="position: absolute; left: 0; right: 0; top: 40%; bottom: 0; text-align: center;") Загружается...
    template(v-else)
      .image-content
        .image-viewer
          div(class="images", v-viewer="options")
            img(v-for="src in [img]", :src="src", :key="src")
  .el-table-cont
    el-table(
      v-if="tableData.length",
      :data="paginate(tableData)",
      resizable,
      border,
      v-loading="loading",
      max-height="500",
    ).content
      el-table-column(prop="name", label="Наименование")
      el-table-column(prop="weedType", label="Тип")
      el-table-column(label="Описание", min-width="300")
        template(slot-scope="scope")
          span {{scope.row.limitDescription()}}
          template(v-if="scope.row.descriptionCharLimit == 50")
            span ...
            el-button(type="text", @click="showMoreDescription(scope.row)") подробнее
          template(v-else)
            span(style="margin-left: 5px; color: transparent") .
            el-button(type="text", @click="showLessDescription(scope.row)") скрыть
      el-table-column(label="Семена")
        template(slot-scope="scope")
          el-button(size="small", icon="picture", @click="showImg(scope.row.id, 1)")
      el-table-column(label="Всходы")
        template(slot-scope="scope")
          el-button(size="small", icon="picture", @click="showImg(scope.row.id, 2)")
      el-table-column(label="Созревание")
        template(slot-scope="scope")
          el-button(size="small", icon="picture", @click="showImg(scope.row.id, 3)")
      el-table-column(
        fixed="right",
        align="center",
        width="100"
      )
        el-button-group(slot-scope="scope")
          el-button(@click="edit(scope.row.id)", size="small", icon="edit")
          el-button(@click="remove(scope.row.id)", size="small", icon="delete")
    el-pagination(
      layout="total, prev, pager, next",
      :total="tableData.length",
      :page-size="perPage",
      :current-page="currentPage",
      style="margin-top: 10px;",
      @current-change="onCurrentPageChange",
      @size-change="onPerPageChange"
    )
</template>
<script>
import Vue from 'vue'
import http from 'lib/httpQueryV2'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import Viewer from 'v-viewer'
import {deepClone} from 'lib/utils';

Vue.use(Viewer)

export default {
  mixins: [
    RecordsLoaderV2,
    ListController,
  ],
  data() {
    return {
      api: "weed",
      perPage: 10,
      currentPage: 1,
      weed: [],
      weedtypes: [],
      loading: false,
      imgLoading: false,
      imgDialogVisible: false,
      formDialogVisible: false,
      img: null,
      options: {
        "inline": false,
        "button": false,
        "navbar": false,
        "title": false,
        "toolbar": false,
        "tooltip": false,
        "movable": false,
        "zoomable": false,
        "rotatable": false,
        "scalable": false,
        "transition": false,
        "fullscreen": false,
        "keyboard": true,
        "url": "data-source"
      },
      item: {},
      formTitle: "",
      base64Queue: 0,
      mode: "",
    }
  },
  computed: {
    tableData() {
      let tableData = deepClone(this.weed)
      tableData.map(td => {
        let weedType = this.weedtypes.find(wt => wt.id == td.weedTypeId)
        td.weedType = weedType && weedType.name || ""
        td.descriptionCharLimit = 50
        td.limitDescription = () => td.description.slice(0, td.descriptionCharLimit)
        return td
      })
      return tableData
    },
  },
  created() {
    this.load()
  },
  methods: {
    afterFetch() {
      this.weed = this.fromVuex('weed')
      this.weedtypes = this.fromVuex('weedtypes')
      this.loading = false
    },
    load() {
      this.loading = true
      this.fetchEntities([
        'weed',
        'weedtypes',
      ], this.afterFetch);
    },
    refresh() {
      this.load()
    },
    showMoreDescription(td) {
      td.descriptionCharLimit = td.description.length
    },
    showLessDescription(td) {
      td.descriptionCharLimit = 50
    },
    showImg(weedId, WeedsGrowingPhasesId) {
      if (!this.imgLoading) {
        this.imgDialogVisible = true
        this.imgLoading = true
        http.getWithoutCache([this.api, weedId, WeedsGrowingPhasesId].join("/"))
          .then(data => {
            this.img = data
            this.imgLoading = false
          })
      }
    },
    addSeedImage(file) {
      this.getBase64(file, "seedImage")
    },
    addSeedLingImage(file) {
      this.getBase64(file, "seedLingImage")
    },
    addMaturationImage(file) {
      this.getBase64(file, "maturationImage")
    },
    handleClose(done) {
      this.imgLoading = false
      this.img = null
      done();
    },
    edit(id) {
      this.mode = "edit"
      this.formTitle = "Редактирование"
      let item = this.weed.find(w => w.id == id) || {}
      this.item = Object.assign({}, item)
      this.formDialogVisible = true
    },
    submitForm(item) {
      this.formDialogVisible = false
      this.loading = true
      let httpMethod = this.mode == "edit" ? "put" : "post"
      http[httpMethod](this.api, item)
        .then(() => {
          this.refresh()
        })
    },
    add() {
      this.mode = "add"
      this.formTitle = "Добавление"
      this.item = {
        name: "",
        weedTypeId: null,
        description: "",
        seedImage: "",
        seedLingImage: "",
        maturationImage: "",
      }
      this.formDialogVisible = true
    },
    remove(id) {
      this.loading = true
      http.delete(this.api, id)
        .then(() => {
          this.refresh()
        })
    },
    getBase64(file, key) {
      let reader = new FileReader();
      this.base64Queue++
      reader.readAsDataURL(file.raw);
      reader.onload = () => {
        this.item[key] = reader.result
        this.base64Queue--
      };
      reader.onerror = (error) => {
        this.base64Queue--
      };
    },
  }
}
</script>
<style lang="stylus" scoped>
.catalog-static-container{
  width: 100%;
}
.image-content
  display grid
  grid-template 1fr / 1fr
.image-viewer
  height 400px
  width 643px
  position relative
.images img
  height 400px
  width 643px
.new-entry
  margin-bottom 10px
</style>
