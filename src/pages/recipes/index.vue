<template lang="pug">
.cols(
  v-loading="!ready",
  element-loading-text="Загружается...",
  )
  .bottom-panel(v-if="ready")

    el-form( class="recipes-form", id="step1")
      el-form-item(label="")
        .recipes-radio(v-for="b in budgets"): el-radio(v-model="$root.context.budget", :label="b.id") {{b.name}}

    el-button(@click="startHelpRecipes") ?
    el-button.m(size="small", icon="plus", type="primary", @click="$router.push('/recipes/new')", id="step3") Новая группа работ
    el-button.filter(
      @click="filterUnfolded = true",
      type="default",
    ) .
    el-dialog(title="Фильтр", v-model="filterUnfolded", size="tiny")
      el-form(:model="filterModel", label-width="120px")
        el-form-item(label="Тип работы")
          el-select(v-model="filterModel.filterType", filterable)
            el-option(
            v-for="item in filteredTypes",
            :label="item.name",
            :value="item.id",
            :key="item.id",
            )
        el-form-item(label="Работа")
          el-select(v-model="filterModel.filterWork", filterable)
            el-option(
            v-for="item in filteredWorks",
            :label="item.name",
            :value="item.id",
            :key="item.id",
            )
        el-form-item(label="Посев")
          el-select(v-model="filterModel.filterSowing", filterable)
            el-option(
            v-for="item in filteredSowings",
            :label="item.displayString",
            :value="item.id",
            :key="item.id",
            )
        el-form-item
          el-button(@click="resetFilter") Сбросить
  .workspace(v-if="ready" id="step2")
    h2 Список работ
    .el-table-cont
      el-table(
        v-if="filteredRecipes || loading",
        :data="filteredRecipes"
        resizable,
        border
        )
        el-table-column(
          prop="name",
          label="Название"
        )
        el-table-column(
          prop="type.name",
          label="Тип"
        )
        el-table-column(
          label="Работа"
        )
          template(slot-scope="scope")
            template(v-for="item in scope.row.recieptWorks")
              el-tag {{item.workName}}
        el-table-column(
          label="Общая площадь по культурам(га)"
        )
          template(slot-scope="scope")
            el-tag(v-for="item in getTotalCulturesArea(scope.row.technologyRecieptSowings)", :key="item.shortName") {{item.area}} - {{item.shortName}}
        el-table-column(
          label="Общая площадь (га)"
        )
          template(slot-scope="scope") {{getTotalArea(scope.row.technologyRecieptSowings)}}
        el-table-column(
          label="",
          width="120",
        )
          template(slot-scope="scope")
            el-button(@click="$router.push(`/recipes/${scope.row.id}`)", size="small", icon="edit")
            el-button(@click="removeRecipe(scope.row.id)", size="small", icon="delete2")


</template>

<script>
import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';
import { createIndex } from 'lib/utils'
import http from 'lib/httpQueryV2'
import modifiedByName from 'lib/modifiedByName';
import {EventBus} from 'services/EventBus'
import ListController from 'mixins/ListController'

import introLib from 'lib/introLib';
import Steps from 'components/help/steps';

export default {
  mixins: [
    RecordsLoaderV2,
    ListController
  ],
  data() {
    return {
      loading: true
    }
  },
  computed: {
    types() {
      return this.fromVuex('technologyRecipeTypes')
    },
    sowings() {
      return this.fromVuex('sowings')
    },
    works() {
      return this.fromVuex('works')
    },
    recipes() {
      let recipes = this.updated && this.fromVuex('technologyRecipe')
      const types = createIndex(this.types)
      return recipes.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
      .map(recipe => {
        recipe.type = types[recipe.technologyRecieptTypeId]
        return recipe
      })
    },
    filteredRecipes() {
      let filteredRecipes = this.recipes.filter(recipe => !this.filterModel.filterType || recipe.type.id === this.filterModel.filterType)
      if (this.filterModel.filterSowing){
       filteredRecipes = filteredRecipes.filter(recipe => recipe.technologyRecieptSowings.some(t => t.sowingId === this.filterModel.filterSowing))
      }
      if (this.filterModel.filterWork){
        filteredRecipes = filteredRecipes.filter(recipe => recipe.recieptWorks.some(t => t.workTypeParameterPlanWorkTypeId === this.filterModel.filterWork))
      }

      return filteredRecipes
    },
    filteredTypes() {
      return this.types.filter(type => this.recipes.some(recipe => recipe.type.id === type.id))
    },
    filteredSowings() {
      return this.sowings.filter(sowing => this.recipes.some(recipe => recipe.technologyRecieptSowings.some(t => t.sowingId === sowing.id)))
    },
    filteredWorks() {
      return this.works.filter(work => this.recipes.some(recipe => recipe.recieptWorks.some(t => t.workTypeParameterPlanWorkTypeId === work.id)))
    },
    budgets() {
      return this.fromVuex('budgets');
    }
  },
  updated() {
    modifiedByName.addTooltips( this.filteredRecipes );
  },
  created() {
    this.load()
  },
  methods: {
    startHelpRecipes() {
      if(Steps.recipes)
        introLib.begin(Steps.recipes);
    },
    refresh() {
      this.load()
    },
    load() {
      this.loading = true
      this.fetchEntities([
        'technologyRecipeTypes',
        'technologyRecipe',
        'sowings',
        'works'
      ]);
    },
    getTotalArea(sowings){
      let result = 0
      sowings.forEach(el=>result+=el.area)
      return result
    },
    getTotalCulturesArea(sowings){
      var cultures = [];
      var res = sowings.forEach(el=>{
        if(cultures.some(name => name.shortName === el.shortName)){
          var index = cultures.findIndex(item => item.shortName === el.shortName)
          cultures[index].area+=el.area;
        } else {
          cultures.push({
            shortName: el.shortName,
            area: el.area
          })
        }
      })
      return cultures;
    },
    removeRecipe(id) {
      this.$confirm('Действительно удалить работу?', 'Внимание', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }).then(() => {
        http.delete('technologyReciept', id).then(() => {
          this.refresh()
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.cols
  flex 0 1 auto
  width inherit
  height inherit
  display flex
  flex-flow column nowrap
  justify-content center
.bottom-panel
  flex 0 1 auto
  padding 16px
  border-top: solid 2px #324057;
  background: #f5f5f5;
  align-self: stretch;
  box-sizing border-box
.workspace
  flex 0 1 auto
  width 100%
  height inherit
  flex-flow column nowrap
  display flex
  background #fff
  padding 10px
  box-sizing border-box
.el-table
  overflow auto

.el-form-edit
  padding-left 15px

  .el-radio
    width 100%


.recipes-radio
  float left
  width auto
  margin-right 10px
  margin-bottom 10px

.recipes-form
  .el-form-item
    margin-bottom 5px

</style>
