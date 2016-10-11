const config = require('./config.js');
// custom console logging functions
exports.log = function(text) {
    if(config.debug) console.log('tm-log: ' + text);
}
exports.info = function(text) {
    if(config.debug) console.info('tm-info: ' + text);
}
exports.warn = function(text) {
    if(config.debug) console.warn('tm-warn: ' + text);
}
exports.trace = function(text) {
    if(config.debug) console.trace('tm-trace: ' + text);
}
exports.error = function(text) {
    if(config.debug) console.error('tm-error: ' + text);
}
// utils
exports.hasClass = function(el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
}
exports.addClass = function(el, className) {
    if (el.classList) el.classList.add(className);
    else if (!hasClass(el, className)) el.className += ' ' + className;
    return el;
}
exports.removeClass = function(el, className) {
    if (el.classList) el.classList.remove(className);
    else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
    return el;
}
exports.wrap = function(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    return wrapper;
}
/**
 * Extended version of the "extend"-Function. Supports multiple sources,
 * extends deep recursively.
 */
exports.extend2 = function extend2(destination, ...sources) {
    for(let i = 0; i < sources.length; i++) {
        let source = sources[i];
        Object.keys(source).forEach(key => {
            if({}.hasOwnProperty.call(destination, key)) {
                let tDest = typeof destination[key];
                let tSrc = typeof source[key];
                if(tDest === tSrc && (tDest === 'object' || tDest === 'function')) {
                    extend2(destination[key], source[key]);
                }
            } else {
                destination[key] = source[key];
            }
        });
    }
    return destination;
}
exports.extend = function extend(d, s) {
    Object.keys(d).forEach(function(key) {
        if(!s.hasOwnProperty(key)) s[key] = d[key];
        // recursive deep-extend
        if (typeof s[key] === 'object') {
            s[key] = extend(d[key], s[key]);
        }
    });

    return s;
}
exports.getScrollbarWidth = function() {
  var outer = document.createElement("div");
  var inner = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.width = "100px";
  outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
  document.body.appendChild(outer);
  var widthNoScroll = outer.offsetWidth;
  // force scrollbars
  outer.style.overflow = "scroll";
  // add innerdiv

  inner.style.width = "100%";
  outer.appendChild(inner);
  var widthWithScroll = inner.offsetWidth;
  // remove divs
  outer.parentNode.removeChild(outer);
  return widthNoScroll - widthWithScroll;
}
exports.setCss = function(el, styles) {
    for (var property in styles) { el.style[property] = styles[property]; }
    return el;
}
exports.getCss = function(el, style) { return window.getComputedStyle(el, null)[style];}
exports.inPx = function(c) { return c + 'px';}
// iterate over a set of elements and call function for each one
exports.iterate = function(elems, func) {
  if (typeof elems === 'object') {
      var keys = Object.keys(elems),
          l = keys.length;
      for (var i = 0; i < l; i++) {
          //func.call(undefined, keys[i], elems[keys[i]]);
          func(keys[i], elems[keys[i]]);
      }
  } else {
      var l = elems.length;
      for (var i = 0; i < l; i++) {
        //func.call(undefined, elems[i], i);
        func(elems[i], i);
      }
  }
}
exports.getValueIn = function(arr, i) {
  if (!Array.isArray(arr)) return arr;
  if (arr.length > i) {
    return arr[i];
  } else {
    return arr[arr.length-1];
  }
}

exports.getUniqueId = (function(){
    var unique = 0;

    return function() {
        var id = 'tm-unique-' + unique;
        unique++;
        return id;
    };
}());

exports.isNonEmptyString = function(str) {
    return typeof str === "string" && str.trim().length > 0;
}
