export function def(obj, key, val) {
  if (val === undefined) {
    obj[key] = val
    return
  }
  Object.defineProperty(obj, key, {
    // configurable: true,
    get: val.constructor === Function? val : () => val
  })
}

/*
let obj = {
  id: 1,
  foo: {
    bar: 'baz'
  }
}
fromDot(obj, 'foo.bar') -> 'baz'
*/
export function fromDot(obj, p) {
  return p.split('.').reduce((o,i) => typeof o === 'object'? o[i] : o, obj)
}

/* Create full copy of object/array */
export function clone(obj) {
  const props = Object.getOwnPropertyNames(obj)
  let clonedObj = Object.create(Object.getPrototypeOf(obj))

  props.forEach(function(key) {
    let desc = Object.getOwnPropertyDescriptor(obj, key)
    if (
      desc.value &&
      (desc.value.constructor === Object || desc.value.constructor === Array)
    ) {
      clonedObj[key] = clone(obj[key])
    } else {
      Object.defineProperty(clonedObj, key, desc)
    }
  })

  return clonedObj
}

/*
let obj = {
  id: 1,
  values: [1, 2, 3]
}
destructure(obj, {value: 'values'}) ->
[
  {
    id: 1,
    value: 1
  },
  {
    id: 1,
    value: 2
  },
  {
    id: 1,
    value: 3
  }
]
*/
export function destructure(obj, elems) {
  const elemValues = Object.values(elems)
  let initialItem = clone(obj)
  // elemValues.forEach(key => {
  //   delete initialItem[key]
  // })
  let out = [initialItem]
  Object.keys(elems).forEach(singleKey => {
    let _out = []
    out.forEach(prevObj => {
      obj[elems[singleKey]].forEach(val => {
        let item = clone(prevObj)
        item[singleKey] = val
        _out.push(item)
      })
    })
    out = _out
  })
  return out
}

/*
let arr = [
  {id: 1, name: 'foo', group: 'a'},
  {id: 2, name: 'bar', group: 'b'},
  {id: 3, name: 'baz', group: 'a'}
]
createIndex(arr, 'id') ->
{
  1: {id: 1, name: 'foo', group: 'a'},
  2: {id: 2, name: 'bar', group: 'b'},
  3: {id: 3, name: 'baz', group: 'a'}
}
createIndex(arr, 'group', true) ->
{
  a: [
    {id: 1, name: 'foo', group: 'a'},
    {id: 3, name: 'baz', group: 'a'}
  ],
  b: [
    {id: 2, name: 'bar', group: 'b'}
  ]
}
createIndex(arr, {id: 'id', group: 'group'}, true) ->
{
  '{"id":1,"group":'a'}': [{id: 1, name: 'foo', group: 'a'}],
  '{"id":2,"group":'b'}': [{id: 2, name: 'bar', group: 'b'}],
  '{"id":3,"group":'a'}': [{id: 3, name: 'baz', group: 'a'}]
}
*/
export function createIndex(arr, key = 'id', isArray = false) {
  return arr.reduce((resObj, item) => {
    let groupId
    if (key.constructor === Object) {
      groupId = {}
      Object.keys(key).forEach(partOfKey => {
        groupId[partOfKey] = fromDot(item, key[partOfKey])
      })
      groupId = JSON.stringify(groupId)
    } else {
      groupId = fromDot(item, key)
    }
    if (isArray) {
      if (!resObj[groupId]) {
        resObj[groupId] = []
      }
      resObj[groupId].push(item)
    } else {
      resObj[groupId] = item
    }
    return resObj
  }, {})
}

export function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
  return undefined
}

export function json2xls(data, name, colNum) {
  var XLSX = require('xlsx')
  var FileSaver = require('file-saver')

  var wb = {
    SheetNames: [],
    Sheets: [],
  }

  var ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = Array(colNum).fill({wpx: 120});

  var ws_name = "Лист 1"
  /* Add the sheet name to the list */
  wb.SheetNames.push(ws_name);

  /* Load the worksheet object */
  wb.Sheets[ws_name] = ws;

  // let workbook = XLSX.utils.json_to_sheet(data)

  /* bookType can be any supported output type */
  var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };

  var wbout = XLSX.write(wb,wopts);

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  /* the saveAs call downloads a file on the local machine */
  var blob = new Blob([s2ab(wbout)],{type:"application/octet-stream"})
  FileSaver.saveAs(blob, name + ".xlsx");
}

export function deepClone(item) {
  if (Array.isArray(item)) {
    return item.map(i => deepClone(i))
  } else if (item && typeof item == "object") {
    if (Object.prototype.toString.call(item) == '[object Date]') {
      return new Date(item)
    } else {
      let obj = {}
      Object.keys(item).forEach(key => {
        obj[key] = deepClone(item[key])
      })
      return obj
    }
  }
  return item
}

export function escapeStringRegexp(str) {
  let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe, '\\$&');
}
