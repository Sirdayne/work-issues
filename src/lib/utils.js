export function fromDot(obj, p) {
  return p.split(".").reduce((o, i) => typeof o === "object"? o[i] : o, obj)
}
export function createIndex(arr, key = "id", isArray = false) {
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
  var XLSX = require("xlsx")
  var FileSaver = require("file-saver")

  var wb = {
    SheetNames: [],
    Sheets: [],
  }

  var ws = XLSX.utils.json_to_sheet(data)
  ws["!cols"] = Array(colNum).fill({wpx: 120});

  var ws_name = "Лист 1"
  /* Add the sheet name to the list */
  wb.SheetNames.push(ws_name);

  /* Load the worksheet object */
  wb.Sheets[ws_name] = ws;

  // let workbook = XLSX.utils.json_to_sheet(data)

  /* bookType can be any supported output type */
  var wopts = {bookType: "xlsx", bookSST: false, type: "binary"};

  var wbout = XLSX.write(wb, wopts);

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  /* the saveAs call downloads a file on the local machine */
  var blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"})
  FileSaver.saveAs(blob, name + ".xlsx");
}

import moment from "moment"

export function deepClone(item) {
  if (Array.isArray(item)) {
    return item.map(i => deepClone(i))
  } else if (Object.prototype.toString.call(item) == "[object Date]") {
    return new Date(item)
  } else if (Object.prototype.toString.call(item) == "[object RegExp]") {
    return new RegExp(item)
  } else if (Object.prototype.toString.call(item) == "[object Function]") {
    return (function() {
      item.apply(this, arguments)
    })
  } else if (item instanceof moment) {
    return item.clone()
  } else if (Object.prototype.toString.call(item) == "[object Object]") {
    let obj = {}
    Object.keys(item).forEach(key => {
      obj[key] = deepClone(item[key])
    })
    return obj
  }
  return item
}

export function escapeStringRegexp(str) {
  let matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  if (typeof str !== "string") {
    throw new TypeError("Expected a string");
  }
  return str.replace(matchOperatorsRe, "\\$&");
}

export function uniq(arr, key = "id") {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected array as a first argument");
  }
  if (typeof key !== "string") {
    throw new TypeError("Expected string as a second argument");
  }
  let ids = arr.map(a => a[key])
  let uniqArr = arr
    .filter((value, index) => ids.indexOf(value[key]) === index)
    .sort((a, b) => {
      if (typeof a[key] !== "string") {
        return a[key] - b[key]
      } else {
        return a[key].localeCompare(b[key])
      }
    })
  return uniqArr
}
