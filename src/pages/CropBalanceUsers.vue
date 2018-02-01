<template lang="pug">
  el-dialog(:visible.sync="dialogVisible", size="full")
    div(class="pageForPrint")
      div(class="personCard", v-for="user in users")
        table
          tr
            th Имя
            td {{ user.name }}
          tr
            th Фамилия
            td {{ user.surname }}
          tr
            th Логин
            td {{ user.userName }}
          tr
            th Пароль
            td {{ user.password }}
          tr
            th Организация
            td {{ user.organization.name }}
          tr
            th Ток
            td {{ user.warehouse.name }}
</template>

<script>
  import { EventBus } from 'services/EventBus';
  import RecordsLoaderV2 from 'mixins/RecordsLoaderV2';

  export default {
    mixins: [
      RecordsLoaderV2
    ],
    data() {
      return {
        users: [],
        dialogVisible: true
      }
    },
    created() {
      this.fetchEntities([
        'cropbalanceusers',
        'userorganizations',
        'warehousesAll',
      ], this.onLoad);
    },
    computed: {
      cropbalanceusers() {
        return this.fromVuex('cropbalanceusers')
      },
      organizations() {
        return this.fromVuex('userorganizations')
      },
      warehousesAll() {
        return this.fromVuex('warehousesAll')
      },
    },
    methods: {
      onLoad() {
        this.users = this.cropbalanceusers.map(c => {
          c.organization = this.organizations.find(o => o.id === c.organizationId);
          c.warehouse = this.warehousesAll.find(w => w.id === c.warehouseId);
          c.warehouse = c.warehouse ? c.warehouse : {name: c.warehouseId};
          return c;
        });
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .pageForPrint
    box-sizing border-box
    height 1035.590551181px
    width 793.700787402px
    display flex
    flex-direction row
    flex-wrap wrap
  .personCard
    width 350px
    height 200px
    border 1px solid #5e7382
    border-radius 4px
    box-sizing border-box
    padding 5px 25px
    margin 10px
    display flex
    flex-direction column
    overflow hidden
  .personCard table tr th
    text-align left
  .personCard table tr td
    padding 5px 25px
</style>
