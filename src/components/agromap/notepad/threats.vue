<template lang="pug">
el-form(label-width="200px", label-position="left", v-if="ready")
  h3 Угрозы
  el-form-item(label="Сорняки")
    el-switch(v-model="weedsSwitch", on-text="", off-text="")
  el-form-item(v-if="weedsSwitch", label="Вид")
    el-select(v-model="threat.weedTypeId", clearable, filterable)
      el-option(
        v-for="w in weedTypes",
        :key="w.id",
        :label="w.name",
        :value="w.id"
      )
  el-form-item(v-if="weedsSwitch", label="Количество")
    el-input-number(v-model="threat.weedAmount")
  el-form-item(v-if="weedsSwitch", label="Фаза роста")
    el-select(v-model="threat.weedsGrowingPhases", clearable, filterable)
      el-option(
        v-for="w in weedsGrowingPhases",
        :key="w.id",
        :label="w.name",
        :value="w.id"
      )
  el-form-item(label="Насекомые")
    el-switch(v-model="insectsSwitch", on-text="", off-text="")
  el-form-item(v-if="insectsSwitch", label="Вид")
    el-select(v-model="threat.insectId", clearable, filterable)
      el-option(
        v-for="i in insects",
        :key="i.id",
        :label="i.name",
        :value="i.id"
      )
  el-form-item(v-if="insectsSwitch", label="Уровень угрозы")
    el-select(v-model="threat.insectLevel", clearable, filterable)
      el-option(
        v-for="t in threatLevel",
        :key="t.id",
        :label="t.name",
        :value="t.id"
      )
  el-form-item(label="Болезни")
    el-switch(v-model="diseasesSwitch", on-text="", off-text="")
  el-form-item(v-if="diseasesSwitch", label="Вид")
    el-select(v-model="threat.diseaseId", clearable, filterable)
      el-option(
      v-for="i in diseases",
      :key="i.id",
      :label="i.name",
      :value="i.id"
      )
  el-form-item(v-if="diseasesSwitch", label="Уровень угрозы")
    el-select(v-model="threat.diseaseLevel", clearable, filterable)
      el-option(
      v-for="t in threatLevel",
      :key="t.id",
      :label="t.name",
      :value="t.id"
      )
</template>

<script>
  import http from 'lib/httpQueryV2'
  import { EventBus } from 'services/EventBus'
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2'
  import ListController from 'mixins/ListController'
  import moment from 'moment'
  import nprogress from 'lib/NProgress'
  import { Message } from 'element-ui'

  export default {
    mixins: [
      RecordsLoaderV2,
      ListController
    ],
    props: [
      'threat'
    ],
    data() {
      return {
        weedsSwitch: false,
        insectsSwitch: false,
        diseasesSwitch: false,
        threatLevel: [],
        diseases: [],
        insects: [],
        weedTypes: [],
        weedsGrowingPhases: [],
        loading: true,
      }
    },
    created() {
      this.fetchEntities([
        'threatLevel',
        'insects',
        'diseases',
        'weedTypes',
        'weedsGrowingPhases',
      ], this.afterFetch );
    },
    methods: {
      afterFetch(){
        this.threatLevel= this.fromVuex('threatLevel')
        this.insects = this.fromVuex('insects')
        this.diseases = this.fromVuex('diseases')
        this.weedTypes = this.fromVuex('weedTypes')
        this.weedsGrowingPhases = this.fromVuex('weedsGrowingPhases')
        this.loading = false
      },
      closeSwitches(){
        this.weedsSwitch = false
        this.diseasesSwitch = false
        this.insectsSwitch = false
      },
    }
  }

</script>

<style>

</style>
