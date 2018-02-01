<template lang="pug">
div(v-loading="loading")
  .buttons
    router-link(tag="el-button", :to="back") Назад
  template(v-if="ready")
    el-form.form(ref="form", :model="form", label-position="top")
      component(v-for="fi in formItems.order", :key="fi.order",  :is="fi.component", :form="form", :fi="fi")
    .buttons
      template(v-if="mode == 'create'")
        el-button(type="primary", @click="create()") Создать
      template(v-else-if="mode == 'edit'")
        el-button(type="primary", @click="save()") Сохранить
</template>

<script>
import ElementBuilder from "./builders/element-builder";
import http from "lib/httpQueryV2";
import moment from "moment";
import FormItemDate from "components/catalog/formcomponents/date";
import FormItemInput from "components/catalog/formcomponents/input";
import FormItemIterable from "components/catalog/formcomponents/iterable";

export default {
  mixins: [ElementBuilder],
  components: {
    FormItemDate,
    FormItemInput,
    FormItemIterable,
  },
  data() {
    return {
      api: null,
      organization: null,
      form: {},
      formItems: {
        dates: [],
        inputs: [],
        iterables: [],
        order: [],
      },
      order: 0,
      id: null,
      loading: true,
      mode: "create",
      processing: null,
      ready: false,
    };
  },
  computed: {
    back() {
      return this.$route.path.slice(0, this.$route.path.indexOf("/form"));
    }
  },
  created() {
    let element = this.$route.params.type;
    this.id = this.$route.params.id;
    if (this.id !== undefined) this.mode = "edit";
    if (element) this.init(element);
  },
  methods: {
    init(element) {
      this.loading = true;
      this.ready = false;
      this.get(element)
        .then(data => {
          if (data.elementData.changeable === false) this.$router.push(this.back);
          if (data.elementData.editable === false && this.mode === "edit") this.$router.push(this.back);
          this._buildForm(data);
        })
        .catch(error => {
          this.loading = false;
          if (error == "FileNotFoundError") {
            this.$router.push("/");
          }
        });
    },
    _buildForm(data) {
      let elementData = data.elementData;
      let store = data.store;
      let name = data.elementData.name;
      this.api = data.elementData.api;
      this.organization = data.elementData.organization;
      if (this.mode == "edit") {
        this.form = store[name].find(s => s.id == this.id);
      }
      let dateList = [];
      this._createFormItems(elementData.attributes, store, name, dateList);
      this._createFormItemsRelation(store)
      this.convertDates = () => this._convertDates(dateList);
      this.orderFormItems()
      this.loading = false;
      this.ready = true;
    },
    _convertDates(dateList) {
      dateList.forEach(key => {
        this.form[key] = moment(new Date(this.form[key]).toISOString()).format("DD.MM.YYYY");
      });
    },
    _createFormItems(attributes, store, name, dateList) {
      attributes.filter(a => a.form !== false).forEach(a => {
        if (a.iterable) {
          if (a.default === undefined) {
            this.order++
            this._createFormIterables(a, store, this.order)
          } else {
            this.form[a.fkey] = a.default
          }
        } else {
          this.order++
          let obj = {label: a.label, model: a.prop, element: name, component: "FormItemInput", order: this.order};
          if (a.type && a.type == "date") {
            obj.component = "FormItemDate"
            this.formItems.dates.push(obj);
            dateList.push(obj.model);
          } else {
            this.formItems.inputs.push(obj);
          }
        }
      });
    },
    _createFormIterables(a, store, order) {
      let element = a.prop.split(".")[0];
      let prop = a.prop.split(".")[1];
      let obj = {
        iterable: store[element],
        fkey: a.fkey,
        prop: prop,
        label: a.label,
        model: a.fkey,
        element: element,
        multiple: a.multiple,
        relation: a.relation,
        component: "FormItemIterable",
        order: order,
        onChange: function() {},
      };
      this.formItems.iterables.push(obj);
      if (this.mode == "edit") {
        this.form[a.fkey] = typeof this.form[a.fkey] === "boolean" ? +this.form[a.fkey] : this.form[a.fkey];
      }
      if (a.multiple && !Array.isArray(this.form[obj.model])) this.$set(this.form, obj.model, []);
    },
    _createFormItemsRelation(store) {
      this.formItems.iterables.filter(i => i.relation !== undefined)
        .forEach(r => {
          let obj = this.formItems.iterables.find(f => f.fkey == r.relation)
          obj.onChange = (val) => {
            if (val) {
              r.iterable = store[r.element].filter(s => s[r.relation] == val)
            } else {
              r.iterable = store[r.element]
            }
          }
        })
    },
    orderFormItems() {
      for (var i = 1; i <= this.order; i++) {
        let found = this.formItems.iterables.find(o => o.order == i) ||
                    this.formItems.dates.find(o => o.order == i) ||
                    this.formItems.inputs.find(o => o.order == i)
        this.formItems.order.push(found)
      }
    },
    create() {
      if (!this.processing) {
        this.processing = true;
        this.loading = true;
        let path = this.organization
          ? this.api + "/" + this.$root.context.organization
          : this.api;
        this.convertDates();
        http
          .post(path, this.form)
          .then(() => {
            this.processing = false;
            this.loading = false;
            this.$router.push(this.back);
          })
          .catch(e => {
            this.processing = false;
            this.loading = false;
            throw e;
          });
      }
    },
    save() {
      if (!this.processing) {
        this.processing = true;
        this.loading = true;
        let path = this.organization
          ? this.api + "/" + this.$root.context.organization
          : this.api;
        this.convertDates();
        http
          .put(path, this.form)
          .then(() => {
            this.processing = false;
            this.loading = false;
            this.$router.push(this.back);
          })
          .catch(e => {
            this.processing = false;
            this.loading = false;
            throw e;
          });
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
.form {
  display: flex;
  flex-flow: column wrap;
  margin-top: 20px;
}

.buttons {
  flex: 0 1 auto;
  align-self: flex-start;
}
</style>
