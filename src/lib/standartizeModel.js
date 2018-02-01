export default function(model) {
  let _model = {
    idKey:      model.idKey || 'id',
    path:       model.path,
    protected:  !!model.protected,
    contexts:   model.contexts || [],
    suffix:     model.suffix   || false,
    filter:     model.filter,
    prefilter:  model.prefilter,
    source:     model.source,
    fields:     (model.fields || []).map(field => {
      let [name, props = {}] = field
      return {
        name       : name,
        label      : props.label  || name,
        type       : props.type   || String,
        getter     : props.getter || (/\./.test(name)?
          function() { return name.split('.').reduce((a,b)=>a[b], this) } :
          null),
        editable   : model.protected? // Here BUG with undefined
          false :
          (props.editable !== undefined? props.editable : true),
        preview    : props.preview !== undefined?
          props.preview :
          (props.hidden? false : true),
        hidden     : props.hidden     !== undefined? props.hidden     : false,
        searchable : props.searchable !== undefined? props.searchable : true,
        cssClass   : props.cssClass   !== undefined? props.cssClass   : ''
      }
    }),
    relations: {}
  }
  Object.keys(model.relations||{}).forEach(key => {
    _model.relations[key] = {
      key: model.relations[key].key,
      fKey: model.relations[key].fKey,
      many: model.relations[key].many,
      fromMany: model.relations[key].fromMany,
      // TODO !! add context linking
    }
    Object.defineProperty(_model.relations[key], 'model', {
      get() {
        return require('_models/'+model.relations[key].model)
      }
    })
  })
  return _model
}
