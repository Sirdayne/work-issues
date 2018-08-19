<template lang="pug">
.container-upload
  h3 Загрузка АХО
  el-form
    el-form-item
      .file-upload
        input(type="file", id="upload-axo", accept=".kml", @change="readFileAxo()")
        .file-name
          p Выберите или перетащите АХО kml файл
          p(v-if="fileNameAxo") Имя файла: {{ fileNameAxo }}
          p(v-else) ...

    el-form-item
      el-button( type="primary", @click="validateAxo()") Загрузить

  el-dialog(title="АХО", :visible.sync="dialogSamplesVisible", class="dialog-opacity", :modal="false")
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
import http from "services/http"
import ListController from "mixins/ListController"
import moment from "moment"
import inside from "point-in-polygon"

export default {
  mixins: [
    ListController
  ],
  props: {
    "fieldId": {
      type: Number,
      default: null,
    },
    "kml": {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      axo: null,
      fileNameAxo: null,
      endpointAxo: "SoilResearches/",
      soilstructures: [],
      dialogSamplesVisible: false,
      titleValidation: "Выберите поле и выберите файл",
      selectedSoilStructures: [],
      loading: false,
      loadingBtn: false,
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedSoilStructures = val;
    },
    validateAxo() {
      if (this.fieldId && this.axo) {
        this.openDialogSamples()
      } else {
        this.$message({
          message: "Выберите поле и выберите файл",
          type: "warning",
          duration: 5000,
          showClose: false,
        })
      }
    },
    openDialogSamples(){
      this.dialogSamplesVisible = true
      this.$refs.samplesTable.clearSelection()
      this.soilstructures.forEach(s => {
        let pointPos = s.coordinates.indexOf(",", 0)
        s.lng = s.coordinates.substring(0, pointPos)
        s.lat = s.coordinates.substring(pointPos + 1, s.coordinates.length)
        for (let key in s) {
          if (key != "coordinates")
            s[key] = parseFloat(s[key])
        }
      })
      this.soilstructures.forEach(s => {
        if (this.kml) {
          if (inside([s.lat, s.lng], this.kml)) {
            this.$refs.samplesTable.toggleRowSelection(s);
          }
        } else {
          this.$message({
            message: "У выбранного поля нет полигона",
            type: "error",
            duration: 5000,
            showClose: false,
          })
          this.dialogSamplesVisible = false
        }
      })
    },
    readFileAxo() {
      let file = document.getElementById("upload-axo")
      this.soilstructures = []
      var reader = new FileReader();
      reader.onload = (event) => {
        let samples = event.target.result
        const tagPlacemark = {
          start: "<Placemark>",
          end: "</Placemark>",
        }
        const tags = [
          {
            start: "<SimpleData name=\"Sample_Num\">",
            end: "</SimpleData>",
            key: "number"
          },
          {
            start: "<SimpleData name=\"Hydrolytic\">",
            end: "</SimpleData>",
            key: "sourness"
          },
          {
            start: "<SimpleData name=\"Total_nitr\">",
            end: "</SimpleData>",
            key: "nitrogen"
          },
          {
            start: "<SimpleData name=\"Phosphorus\">",
            end: "</SimpleData>",
            key: "phosphorus"
          },
          {
            start: "<SimpleData name=\"Potassium.\">",
            end: "</SimpleData>",
            key: "potassium"
          },
          {
            start: "<SimpleData name=\"Organic_ma\">",
            end: "</SimpleData>",
            key: "organic"
          },
          {
            start: "<SimpleData name=\"Sulfur._S_\">",
            end: "</SimpleData>",
            key: "sulfur"
          },
          {
            start: "<coordinates>",
            end: "</coordinates>",
            key: "coordinates"
          },
        ]
        this.axo = samples
        let soil = {}
        for (let i = 0; i < samples.length; i++){
          if (samples.substr(i, tagPlacemark.start.length) == tagPlacemark.start) {
            soil = {}
          }
          tags.forEach(tag => {
            if (samples.substr(i, tag.start.length) == tag.start){
              let tagEndNotFound = true
              let j = i + tag.start.length
              while (tagEndNotFound) {
                if (samples.substr(j, tag.end.length) == tag.end) {
                  let sample = samples.substring(i + tag.start.length, j)
                  soil[tag.key] = sample
                  tagEndNotFound = false
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
      filename = filename.replace(/\\/g, "/").split("/").pop();
      this.fileNameAxo = filename
    },
    postAxo(array) {
      let endpoint = this.endpointAxo + this.$root.context.organization;
      let data = {
        fieldId: this.fieldId,
        date: moment().format("YYYY-MM-DDTHH:mm:ss"),
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
    },
  }
}

</script>
