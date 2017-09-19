const config = require('./config.js')
// custom console logging functions
exports.log = function (text) {
  if (config.debug) console.log('tm-log: ' + text)
}
exports.info = function (text) {
  if (config.debug) console.info('tm-info: ' + text)
}
exports.warn = function (text) {
  if (config.debug) console.warn('tm-warn: ' + text)
}
exports.trace = function (text) {
  if (config.debug) console.trace('tm-trace: ' + text)
}
exports.error = function (text) {
  console.error('tm-error: ' + text)
}
exports.errorThrow = text => {
  exports.error(text)
  throw new Error(text)
}
// utils
function hasClass (el, className) {
  return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className)
}
exports.hasClass = hasClass
exports.addClass = function (el, className) {
  if (el.classList) el.classList.add(className)
  else if (!hasClass(el, className)) el.className += ' ' + className
  return el
}
exports.removeClass = function (el, className) {
  if (el.classList) el.classList.remove(className)
  else el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '')
  return el
}
/**
 *  get index of an HTML-element,
 * for example the index of a cell in the row
 */
exports.elementIndex = function (node) {
  try {
    let index = 0
    while ((node = node.previousElementSibling)) {
      index++
    }
    return index
  } catch (e) {
    return -1
  }
}
/**
 * Extended version of the "extend"-Function. Supports multiple sources,
 * extends deep recursively.
 */
exports.extend = function extend (destination, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i]
    Object.keys(source).forEach(key => {
      if ({}.hasOwnProperty.call(destination, key)) {
        let tDest = typeof destination[key]
        let tSrc = typeof source[key]
        if (tDest === tSrc && (tDest === 'object' || tDest === 'function')) {
          extend(destination[key], source[key])
        }
      } else {
        destination[key] = source[key]
      }
    })
  }
  return destination
}

// iterate over a set of elements and call function for each one
exports.iterate = (elems, func) => {
  if (typeof elems === 'object') {
    let keys = Object.keys(elems),
      l = keys.length
    for (let i = 0; i < l; i++) {
          // property, value
      func(keys[i], elems[keys[i]])
    }
  } else {
    let l = elems.length
    for (let i = 0; i < l; i++) {
          // value, index @TODO umdrehen für konsistenz, an allen stellen anpassen -> index, value
      func(elems[i], i)
    }
  }
}

exports.isNonEmptyString = function (str) {
  return typeof str === 'string' && str.trim().length > 0
}

let isObj = exports.isObject = o => typeof o === 'object'

exports.isFn = f => typeof f === 'function'
exports.isBool = b => typeof b === 'boolean'
exports.isNumber = (val) => {
  return typeof val === 'number' && !isNaN(val)
}

let getProp = exports.getProperty = (obj, ...props) => {
  if (!isObj(obj) || props.length === 0) return
  let index = 0
  while (index < props.length - 1) {
    obj = obj[props[index]]
    if (!isObj(obj)) return
    ++index
  }
  if (obj[props[index]] === undefined) return
  return obj[props[index]]
}
exports.hasProp = (obj, ...props) => getProp(obj, ...props) !== undefined

/**
    finds head cell with tm-id = tmId and returns its index
    */
function id2index (tmId) {
  let cell = document.querySelector('thead > tr > *[tm-id=' + tmId + ']')
  if (!cell) return null
  return [].indexOf.call(cell.parentNode.children, cell)
}
/**
    ersetze alle spalten, die über die tm-id identifiziert werden, durch ihren index
*/
exports.replaceIdsWithIndices = (columns) => {
  Object.keys(columns).forEach((key) => {
    if (key !== 'all' && isNaN(key)) {
      let index = id2index(key)
      if (index != null) {
        columns[index] = columns[key]
        delete columns[key]
      }
    }
  })
  return columns
}

// fastest way to clone an array
exports.cloneArray = function (arr) {
  let ret = [], i = arr.length
  while (i--) ret[i] = arr[i]
  return ret
}

exports.delay = (() => {
  let ms = 400, t

  return (cb) => {
    window.clearTimeout(t)
    t = window.setTimeout(cb, ms)
  }
})()
