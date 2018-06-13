<template lang="pug">
.container-upload
  .titles
    .title(v-for="spoiler in spoilers", :class="{'active': spoiler.active}", @click="activateSpoilers(spoiler)", :key="spoiler.key") {{ spoiler.title }}
  el-form
    el-form-item
      el-select(v-model="form.fieldId", clearable, filterable)
        el-option(
          v-for="f in fields",
          :key="f.id",
          :label="f.newName",
          :value="f.id"
        )
    el-form-item(v-if="tab === 'kml'")
      .file-upload
        input(type="file", id="upload", accept=".kml", @change="readFile()")
        .file-name
          p Выберите или перетащите kml файл
          p(v-if="fileName") Имя файла: {{ fileName }}
          p(v-else) ...

    el-form-item(v-if="tab === 'kml'")
      el-button(v-if="form.fieldId && form.upload", :loading="loadingBtn", type="primary", @click="postKml()") Загрузить
      el-alert(v-else, :title="titleValidation", type="error", :closable="false", show-icon, style="width: 100%")

    el-form-item(v-if="tab === 'axo'")
      .file-upload
        input(type="file", id="upload-axo", accept=".kml", @change="readFileAxo()")
        .file-name
          p Выберите или перетащите АХО kml файл
          p(v-if="fileNameAxo") Имя файла: {{ fileNameAxo }}
          p(v-else) ...

    el-form-item(v-if="tab === 'axo'")
      el-button(v-if="form.fieldId && form.axo", type="primary", @click="openDialogSamples()") Загрузить
      el-alert(v-else, title="Выберите поле и выберите файл", type="error", :closable="false", show-icon, style="width: 100%")

  el-dialog(title="АХО", :visible.sync="dialogSamplesVisible", class="dialog-opacity")
    .samples-txt Выбраны данные проб внутри поля {{ formFieldName }}
    el-table(
      ref="samplesTable",
      v-if="soilstructures",
      :data="soilstructures",
      border,
      resizable,
      @selection-change="handleSelectionChange",
    )
      el-table-column(
        type="selection",
        width="55",
      )

      el-table-column(
        prop="sourness",
        label="Кислотность",
         width="140",
      )
      el-table-column(
        prop="nitrogen",
        label="Азот",
        width="140",
      )
      el-table-column(
        prop="phosphorus",
        label="Фосфор",
        width="140",
      )
      el-table-column(
        prop="potassium",
        label="Калий",
        width="140",
      )
      el-table-column(
        prop="organic",
        label="Гумус",
        width="140",
      )
      el-table-column(
        prop="sulfur",
        label="Сера",
      )

    .sample-buttons
      el-button(type="success", @click="postAxo(selectedSoilStructures)") Загрузить выбранные
      el-button(type="info", @click="postAxo(soilstructures)") Загрузить все
      el-button(type="danger", @click="dialogSamplesVisible = false") Отмена

</template>

<script>
import http from 'lib/httpQueryV2'
import { EventBus } from 'services/EventBus'
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
import ListController from 'mixins/ListController'
import moment from 'moment'
import inside from 'point-in-polygon'
import { Message } from 'element-ui'
import L from 'leaflet'
import geodesy from 'leaflet-geodesy'

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  props: [
    'leafletFields',
  ],
  data() {
    return {
      form: {
        fieldId: null,
        upload: null,
        axo: null,
      },
      fileName: null,
      fileNameAxo: null,
      fields: [],
      endpoint: 'kml/',
      endpointAxo: 'SoilResearches/',
      tab: 'kml',
      spoilers: [
        {
          title: "Загрузка полигона",
          active: true,
          key: 'kml',
        },
        {
          title: "Загрузка АХО",
          active: false,
          key: 'axo'
        },
      ],
      soilstructures: [],
      dialogSamplesVisible: true,
      titleValidation: "Выберите поле и выберите файл",
      selectedSoilStructures: [],
      loading: false,
      loadingBtn: false,
    }
  },
  created() {
    this.fetchEntities([
      'fields'
    ], this.afterFetch );
  },
  mounted() {
    this.dialogSamplesVisible = false
  },
  computed: {
    formFieldName() {
      let name = '<Нет данных>'
      if (this.form.fieldId && this.fields){
        name = this.fields.find(f => f.id === this.form.fieldId).newName
      }
      return name
    },
  },
  methods: {
    afterFetch(){
      this.fields = this.fromVuex('fields')
    },
    handleSelectionChange(val) {
      this.selectedSoilStructures = val;
    },
    openDialogSamples(){
      this.dialogSamplesVisible = true
      this.$refs.samplesTable.clearSelection()
      this.soilstructures.forEach(s => {
        let pointPos = s.coordinates.indexOf(',', 0)
        s.lng = s.coordinates.substring(0, pointPos)
        s.lat = s.coordinates.substring(pointPos + 1, s.coordinates.length)
        for (let key in s) {
          if (key != 'coordinates')
          s[key] = parseFloat(s[key])
        }
      })
      this.soilstructures.forEach(s => {
        let polygon = this.leafletFields.find(l => l.fieldId == this.form.fieldId)
        if (polygon) {
          let kml = JSON.parse(polygon.kml)
          kml = kml[0]
          if (inside([s.lat, s.lng], kml)) {
            this.$refs.samplesTable.toggleRowSelection(s);
          }
        } else {
          Message({
            message: 'У выбранного поля нет полигона',
            type: "error",
            duration: 5000,
            showClose: false,
          })
          this.dialogSamplesVisible = false
        }
      })
    },
    readFile() {
      this.titleValidation = "Выберите поле и выберите файл"
      //readFile($event) - html
      //readFile(event) - function
      //let file = event.target.files[0]
      let file = document.getElementById('upload')
      var reader = new FileReader();
      reader.onload = (event) => {
        this.form.upload = event.target.result
      };
      reader.readAsText(file.files[0]);
      let filename = file.value;
      filename = filename.replace(/\\/g, "/").split('/').pop();
      this.fileName = filename
    },
    postKml() {
      let endpoint = this.endpoint + this.$root.context.organization
      let data = {
        fieldId: this.form.fieldId,
        kml: this.form.upload,
      };
      this.loadingBtn = true
      http.post(endpoint, data)
        .then(() => {
          Message({
            message: 'Полигон добавлен',
            type: "success",
            duration: 5000,
            showClose: false,
          })
          this.refresh();
        })
        .catch((error) => {
          Message({
            message: `Ошибка ${error}`,
            type: "error",
            duration: 5000,
            showClose: false,
          })
          this.refresh();
        })
    },
    readFileAxo() {
      let file = document.getElementById('upload-axo')
      this.soilstructures = []
      var reader = new FileReader();
      reader.onload = (event) => {
        let samples = event.target.result
        const tagPlacemark = {
          start: '<Placemark>',
          end: '</Placemark>',
        }
        const tags = [
          {
            start: '<SimpleData name="Sample_Num">',
            end: '</SimpleData>',
            key: 'number'
          },
          {
            start: '<SimpleData name="Hydrolytic">',
            end: '</SimpleData>',
            key: 'sourness'
          },
          {
            start: '<SimpleData name="Total_nitr">',
            end: '</SimpleData>',
            key: 'nitrogen'
          },
          {
            start: '<SimpleData name="Phosphorus">',
            end: '</SimpleData>',
            key: 'phosphorus'
          },
          {
            start: '<SimpleData name="Potassium.">',
            end: '</SimpleData>',
            key: 'potassium'
          },
          {
            start: '<SimpleData name="Organic_ma">',
            end: '</SimpleData>',
            key: 'organic'
          },
          {
            start: '<SimpleData name="Sulfur._S_">',
            end: '</SimpleData>',
            key: 'sulfur'
          },
          {
            start: '<coordinates>',
            end: '</coordinates>',
            key: 'coordinates'
          },
        ]
        this.form.axo = samples
        let soil = {}
        for (let i = 0; i < samples.length; i++){
          if (samples.substr(i, tagPlacemark.start.length) == tagPlacemark.start) {
            soil = {}
          }
          tags.forEach(tag => {
            if (samples.substr(i, tag.start.length) == tag.start){
              let tagEndNotFinded = true
              let j = i + tag.start.length
              while (tagEndNotFinded) {
                if (samples.substr(j, tag.end.length) == tag.end) {
                  let sample = samples.substring(i + tag.start.length, j)
                  soil[tag.key] = sample
                  tagEndNotFinded = false
                }
                j++
              }
            }
          })
          if (samples.substr(i, tagPlacemark.end.length) == tagPlacemark.end && Object.keys(soil).length > 0) {
            this.soilstructures.push(soil)
            soil = {}
          }
        }
      };
      reader.readAsText(file.files[0]);
      let filename = file.value;
      filename = filename.replace(/\\/g, "/").split('/').pop();
      this.fileNameAxo = filename
    },
    postAxo(array) {
      let endpoint = this.endpointAxo + this.$root.context.organization;
      let data = {
        fieldId: this.form.fieldId,
        date: moment().format('YYYY-MM-DDTHH:mm:ss'),
        SoilStructures: array
      };
      this.loadingBtn = true
      http.post(endpoint, data).then(() => {
        this.refresh();
      });
    },
    refresh(){
      this.loadingBtn = false
      this.dialogSamplesVisible = false
      this.fetchEntities([
        'fields'
      ], this.afterFetch )
    },
    activateSpoilers(spoiler){
      this.spoilers.forEach(s => {
        s.active = false
      })
      spoiler.active = true
      this.tab = spoiler.key
    },
    getArea(polygon) {
      return Math.round(geodesy.area(polygon) / 10000);
    },
  }
}

</script>

<style lang="stylus" scoped>
.container-upload
  padding 5px 15px

  h3
    margin-top 0

.titles
  font-size 16px
  font-weight bold
  margin-bottom 15px

.title
  display inline-block
  text-align center
  box-sizing border-box
  border 1px solid #d1dbe5
  padding 10px 0
  width calc(50% - 2px)
  margin 0 1px
  cursor pointer
  font-size 14px
  transition .3s linear
  &.active
    color #20a0ff
    background #fff

.file-upload
  width 100%
  height 68px
  position relative

#upload, #upload-axo
  opacity 0
  width 100%
  height 100%
  position absolute
  top 0px
  left 0px
  cursor pointer
  z-index 5

.file-name
  border 2px dashed #ccc
  width 100%
  height 68px
  box-sizing border-box
  position absolute
  top 0px
  left 0px
  overflow hidden
  z-index 1

  p
    width 100%
    margin 5px 0px
    height 24px
    line-height 24px
    font-size 14px
    text-align center

.samples-txt
  float left
  width 100%
  margin 0 0 20px
  font-size 15px

.sample-buttons
  float left
  width 100%
  margin 25px 0 30px


</style>

