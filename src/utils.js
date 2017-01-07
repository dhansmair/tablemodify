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
    console.error('tm-error: ' + text);
}
exports.errorThrow = text => {
    exports.error(text);
    throw new Error(text);
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
        if(!s.hasOwnProperty(key)) {
            s[key] = d[key];
        } else if (typeof s[key] === 'object') {
            // recursive deep-extend
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
    for (var property in styles) {
        el.style[property] = styles[property];
    }
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
          // property, value
          func(keys[i], elems[keys[i]]);
      }
  } else {
      var l = elems.length;
      for (var i = 0; i < l; i++) {
          // value, index @TODO umdrehen für konsistenz, an allen stellen anpassen -> index, value
          func(elems[i], i);
      }
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

let isObj = exports.isObject = o => typeof o === 'object';

exports.isFn = f => typeof f === 'function';

exports.isBool = b => typeof b === 'boolean';

let getProp = exports.getProperty = (obj, ...props) => {
    if (!isObj(obj) || props.length === 0) return;
    //console.log("in getprop");
    let index = 0;
    while (index < props.length - 1) {
        obj = obj[props[index]];
        if (!isObj(obj)) return;
        ++index;
    }
    //console.log(obj, props[index]);
    if (obj[props[index]] === undefined) return;
    return obj[props[index]];
}
exports.hasProp = (obj, ...props) => getProp(obj, ...props) !== undefined;


// Polyfill for creating CustomEvents on IE9/10/11

// code pulled from:
// https://github.com/d4tocchini/customevent-polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill

try {
    var ce = new window.CustomEvent('test');
    ce.preventDefault();
    if (ce.defaultPrevented !== true) {
        // IE has problems with .preventDefault() on custom events
        // http://stackoverflow.com/questions/23349191
        throw new Error('Could not prevent default');
    }
} catch(e) {
  var CustomEvent = function(event, params) {
    var evt, origPrevent;
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };

    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    origPrevent = evt.preventDefault;
    evt.preventDefault = function () {
      origPrevent.call(this);
      try {
        Object.defineProperty(this, 'defaultPrevented', {
          get: function () {
            return true;
          }
        });
      } catch(e) {
        this.defaultPrevented = true;
      }
    };
    return evt;
  };

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent; // expose definition to window
}

/**
    trigger custom events supported by all browsers
*/
exports.trigger = (target, eventName, props) => {
    target.dispatchEvent(new CustomEvent(eventName, props));
}
