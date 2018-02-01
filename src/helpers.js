export function fromDot(obj, p) {
  return p.split('.').reduce((o,i) => o !== undefined && o.constructor === Object? o[i] : o, obj)
}

export function shallowClone(obj) {
  var clone = Object.create(Object.getPrototypeOf(obj))

  var props = Object.getOwnPropertyNames(obj)
  props.forEach(function(key) {
    var desc = Object.getOwnPropertyDescriptor(obj, key)
    Object.defineProperty(clone, key, desc)
  })

  return clone
}

export function createIndexes(arr, key, isArray = false, mapFunc = false) {
  return arr.reduce((a, b) => {
    let groupId = fromDot(b, key)
    if (isArray) {
      if (!a[groupId]) {
        a[groupId] = []
      }
      a[groupId].push(b)
    } else {
      a[groupId] = b
    }
    return a
  }, {})
}

export function getKeyByValue(arr, value) {
  for (var i in arr) {
    var item = arr[i];

    if (value === item) {
      return i;
    }
  }

  return -1;
}
