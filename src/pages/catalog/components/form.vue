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
import {getElementData} from "./builders/element-builder";
import http from "services/http";
import moment from "moment";
import FormItemDate from "pages/catalog/components/formcomponents/date";
import FormItemInput from "pages/catalog/components/formcomponents/input";
import FormItemIterable from "pages/catalog/components/formcomponents/iterable";

export default {
  components: {
    FormItemDate,
    FormItemInput,
    FormItemIterable,
  },
  data() {
    return {
      api: null,
      organization: null,
      organizationsGroupId: null,
      yearContext: null,
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
      getElementData(element)
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
      this.organizationsGroupId = data.elementData.organizationsGroupId || false;
      this.yearContext = data.elementData.yearContext || false;
      if (this.mode == "edit") {
        this.form = store[name].find(s => s.id == this.id);
      }
      let dateList = [];
      this._addHiddenAttributes(elementData.attributes);
      this._createFormItems(elementData.attributes, store, name, dateList);
      Object.keys(this.form).forEach(key => {
        if (this.form[key] === undefined) delete this.form[key]
      })
      this._createFormItemsRelation(store)
      this.convertDates = () => this._convertDates(dateList);
      this.orderFormItems()
      this.loading = false;
      this.ready = true;
    },
    _addHiddenAttributes(attributes) {
      attributes
        .filter(a => a.fkey === undefined && a.form === false && a.default !== undefined)
        .forEach(a => {
          this.form[a.prop] = a.default
        })
    },
    _convertDates(dateList) {
      dateList
        .filter(key => this.form[key])
        .forEach(key => {
          let date = new Date(this.form[key]).toISOString()
          let obj = this.formItems.dates.find(d => d.model == key)
          this.form[key] = moment(date).format(obj.formatTo);
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
          let obj = {label: a.label, model: a.prop, element: name, component: "FormItemInput", order: this.order, formatTo: a.formatTo};
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
        disabled: a.disabled,
        getFrom: a.getFrom,
        getProp: a.getProp,
        getBy: a.getBy,
        component: "FormItemIterable",
        order: order,
        onChange: function() {},
        functions: [],
      };
      if (a.initiallyFilteredBy) {
        obj.iterable = obj.iterable.filter(s => Object.keys(a.initiallyFilteredBy).every(key => s[key] == a.initiallyFilteredBy[key]))
      }
      this.formItems.iterables.push(obj);
      if (this.mode == "edit") {
        this.form[a.fkey] = typeof this.form[a.fkey] === "boolean" ? +this.form[a.fkey] : this.form[a.fkey];
      }
      if (a.multiple && !Array.isArray(this.form[obj.model])) this.$set(this.form, obj.model, []);
    },
    _createFormItemsRelation(store) {
      this.formItems.iterables.filter(i => i.getBy !== undefined)
        .forEach(r => {
          let obj = this.formItems.iterables.find(f => f.fkey == r.getBy)
          let func = (val) => {
            if (val) {
              let ids = store[r.getFrom]
                .filter(s => s[r.getBy] == val)
                .reduce((arr, v) => {
                  return arr.concat([].concat(v[r.getProp]))
                }, [])
                .filter((v, i, arr) => arr.indexOf(v) === i)
              r.iterable = store[r.element].filter(s => ids.includes(s.id))
            } else {
              r.iterable = []
            }
          }
          obj.functions.push(func)
          obj.onChange = (val) => {
            obj.functions.forEach(f => f(val))
          }
          obj.onChange(this.form[r.getBy])
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
        let path = this.organization ? this.api + "/" + this.$root.context.organization : this.api;
        if (this.organizationsGroupId) this.form.organizationsGroupId = this.$root.context.organizationsGroupId
        if (this.yearContext) this.form.year = this.$root.context.year
        this.convertDates();
        http
          .post(path, this.form)
          .then((data) => {
            this.processing = false;
            this.loading = false;
            let query = {}
            if (data && data.id) query = {itemId: data.id}
            this.$router.push({path: this.back, query: query});
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
            this.$router.push({path: this.back, query: {itemId: this.id}});
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
