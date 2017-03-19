(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
(function (main) {
  'use strict';

  /**
   * Parse or format dates
   * @class fecha
   */
  var fecha = {};
  var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
  var twoDigits = /\d\d?/;
  var threeDigits = /\d{3}/;
  var fourDigits = /\d{4}/;
  var word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
  var literal = /\[([^]*?)\]/gm;
  var noop = function () {
  };

  function shorten(arr, sLen) {
    var newArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      newArr.push(arr[i].substr(0, sLen));
    }
    return newArr;
  }

  function monthUpdate(arrName) {
    return function (d, v, i18n) {
      var index = i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());
      if (~index) {
        d.month = index;
      }
    };
  }

  function pad(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) {
      val = '0' + val;
    }
    return val;
  }

  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var monthNamesShort = shorten(monthNames, 3);
  var dayNamesShort = shorten(dayNames, 3);
  fecha.i18n = {
    dayNamesShort: dayNamesShort,
    dayNames: dayNames,
    monthNamesShort: monthNamesShort,
    monthNames: monthNames,
    amPm: ['am', 'pm'],
    DoFn: function DoFn(D) {
      return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
    }
  };

  var formatFlags = {
    D: function(dateObj) {
      return dateObj.getDate();
    },
    DD: function(dateObj) {
      return pad(dateObj.getDate());
    },
    Do: function(dateObj, i18n) {
      return i18n.DoFn(dateObj.getDate());
    },
    d: function(dateObj) {
      return dateObj.getDay();
    },
    dd: function(dateObj) {
      return pad(dateObj.getDay());
    },
    ddd: function(dateObj, i18n) {
      return i18n.dayNamesShort[dateObj.getDay()];
    },
    dddd: function(dateObj, i18n) {
      return i18n.dayNames[dateObj.getDay()];
    },
    M: function(dateObj) {
      return dateObj.getMonth() + 1;
    },
    MM: function(dateObj) {
      return pad(dateObj.getMonth() + 1);
    },
    MMM: function(dateObj, i18n) {
      return i18n.monthNamesShort[dateObj.getMonth()];
    },
    MMMM: function(dateObj, i18n) {
      return i18n.monthNames[dateObj.getMonth()];
    },
    YY: function(dateObj) {
      return String(dateObj.getFullYear()).substr(2);
    },
    YYYY: function(dateObj) {
      return dateObj.getFullYear();
    },
    h: function(dateObj) {
      return dateObj.getHours() % 12 || 12;
    },
    hh: function(dateObj) {
      return pad(dateObj.getHours() % 12 || 12);
    },
    H: function(dateObj) {
      return dateObj.getHours();
    },
    HH: function(dateObj) {
      return pad(dateObj.getHours());
    },
    m: function(dateObj) {
      return dateObj.getMinutes();
    },
    mm: function(dateObj) {
      return pad(dateObj.getMinutes());
    },
    s: function(dateObj) {
      return dateObj.getSeconds();
    },
    ss: function(dateObj) {
      return pad(dateObj.getSeconds());
    },
    S: function(dateObj) {
      return Math.round(dateObj.getMilliseconds() / 100);
    },
    SS: function(dateObj) {
      return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
    },
    SSS: function(dateObj) {
      return pad(dateObj.getMilliseconds(), 3);
    },
    a: function(dateObj, i18n) {
      return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
    },
    A: function(dateObj, i18n) {
      return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
    },
    ZZ: function(dateObj) {
      var o = dateObj.getTimezoneOffset();
      return (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4);
    }
  };

  var parseFlags = {
    D: [twoDigits, function (d, v) {
      d.day = v;
    }],
    Do: [new RegExp(twoDigits.source + word.source), function (d, v) {
      d.day = parseInt(v, 10);
    }],
    M: [twoDigits, function (d, v) {
      d.month = v - 1;
    }],
    YY: [twoDigits, function (d, v) {
      var da = new Date(), cent = +('' + da.getFullYear()).substr(0, 2);
      d.year = '' + (v > 68 ? cent - 1 : cent) + v;
    }],
    h: [twoDigits, function (d, v) {
      d.hour = v;
    }],
    m: [twoDigits, function (d, v) {
      d.minute = v;
    }],
    s: [twoDigits, function (d, v) {
      d.second = v;
    }],
    YYYY: [fourDigits, function (d, v) {
      d.year = v;
    }],
    S: [/\d/, function (d, v) {
      d.millisecond = v * 100;
    }],
    SS: [/\d{2}/, function (d, v) {
      d.millisecond = v * 10;
    }],
    SSS: [threeDigits, function (d, v) {
      d.millisecond = v;
    }],
    d: [twoDigits, noop],
    ddd: [word, noop],
    MMM: [word, monthUpdate('monthNamesShort')],
    MMMM: [word, monthUpdate('monthNames')],
    a: [word, function (d, v, i18n) {
      var val = v.toLowerCase();
      if (val === i18n.amPm[0]) {
        d.isPm = false;
      } else if (val === i18n.amPm[1]) {
        d.isPm = true;
      }
    }],
    ZZ: [/[\+\-]\d\d:?\d\d/, function (d, v) {
      var parts = (v + '').match(/([\+\-]|\d\d)/gi), minutes;

      if (parts) {
        minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
        d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
      }
    }]
  };
  parseFlags.dd = parseFlags.d;
  parseFlags.dddd = parseFlags.ddd;
  parseFlags.DD = parseFlags.D;
  parseFlags.mm = parseFlags.m;
  parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
  parseFlags.MM = parseFlags.M;
  parseFlags.ss = parseFlags.s;
  parseFlags.A = parseFlags.a;


  // Some common format strings
  fecha.masks = {
    'default': 'ddd MMM DD YYYY HH:mm:ss',
    shortDate: 'M/D/YY',
    mediumDate: 'MMM D, YYYY',
    longDate: 'MMMM D, YYYY',
    fullDate: 'dddd, MMMM D, YYYY',
    shortTime: 'HH:mm',
    mediumTime: 'HH:mm:ss',
    longTime: 'HH:mm:ss.SSS'
  };

  /***
   * Format a date
   * @method format
   * @param {Date|number} dateObj
   * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
   */
  fecha.format = function (dateObj, mask, i18nSettings) {
    var i18n = i18nSettings || fecha.i18n;

    if (typeof dateObj === 'number') {
      dateObj = new Date(dateObj);
    }

    if (Object.prototype.toString.call(dateObj) !== '[object Date]' || isNaN(dateObj.getTime())) {
      throw new Error('Invalid Date in fecha.format');
    }

    mask = fecha.masks[mask] || mask || fecha.masks['default'];

    var literals = [];

    // Make literals inactive by replacing them with ??
    mask = mask.replace(literal, function($0, $1) {
      literals.push($1);
      return '??';
    });
    // Apply formatting rules
    mask = mask.replace(token, function ($0) {
      return $0 in formatFlags ? formatFlags[$0](dateObj, i18n) : $0.slice(1, $0.length - 1);
    });
    // Inline literal values back into the formatted value
    return mask.replace(/\?\?/g, function() {
      return literals.shift();
    });
  };

  /**
   * Parse a date string into an object, changes - into /
   * @method parse
   * @param {string} dateStr Date string
   * @param {string} format Date parse format
   * @returns {Date|boolean}
   */
  fecha.parse = function (dateStr, format, i18nSettings) {
    var i18n = i18nSettings || fecha.i18n;

    if (typeof format !== 'string') {
      throw new Error('Invalid format in fecha.parse');
    }

    format = fecha.masks[format] || format;

    // Avoid regular expression denial of service, fail early for really long strings
    // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
    if (dateStr.length > 1000) {
      return false;
    }

    var isValid = true;
    var dateInfo = {};
    format.replace(token, function ($0) {
      if (parseFlags[$0]) {
        var info = parseFlags[$0];
        var index = dateStr.search(info[0]);
        if (!~index) {
          isValid = false;
        } else {
          dateStr.replace(info[0], function (result) {
            info[1](dateInfo, result, i18n);
            dateStr = dateStr.substr(index + result.length);
            return result;
          });
        }
      }

      return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
    });

    if (!isValid) {
      return false;
    }

    var today = new Date();
    if (dateInfo.isPm === true && dateInfo.hour != null && +dateInfo.hour !== 12) {
      dateInfo.hour = +dateInfo.hour + 12;
    } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
      dateInfo.hour = 0;
    }

    var date;
    if (dateInfo.timezoneOffset != null) {
      dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
      date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
        dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
    } else {
      date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
        dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
    }
    return date;
  };

  /* istanbul ignore next */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fecha;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return fecha;
    });
  } else {
    main.fecha = fecha;
  }
})(this);

},{}],3:[function(require,module,exports){
'use strict';

exports.debug = false;
exports.coreDefaults = {
    theme: 'default',
    language: 'en'
};

},{}],4:[function(require,module,exports){
'use strict';

var _DATE_I18N, _DATE_FORMATS;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fecha = require('fecha');

var DATE_GERMAN = 'german';
var DATE_ENGLISH = 'english';
var DATE_I18N = (_DATE_I18N = {}, _defineProperty(_DATE_I18N, DATE_GERMAN, {
    dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    amPm: ['am', 'pm'],
    // D is the day of the month, function returns something like...  3rd or 11th
    DoFn: function DoFn(D) {
        return D + '.';
    }
}), _defineProperty(_DATE_I18N, DATE_ENGLISH, {
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    amPm: ['am', 'pm'],
    // D is the day of the month, function returns something like...  3rd or 11th
    DoFn: function DoFn(D) {
        return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
    }
}), _DATE_I18N);
var DATE_FORMATS = (_DATE_FORMATS = {}, _defineProperty(_DATE_FORMATS, DATE_GERMAN, ['MM.DD.YYYY', 'MM.DD.YY']), _defineProperty(_DATE_FORMATS, DATE_ENGLISH, ['YYYY-MM-DD', 'MM/DD/YYYY']), _DATE_FORMATS);

module.exports = {
    fecha: fecha,
    DATE_GERMAN: DATE_GERMAN,
    DATE_ENGLISH: DATE_ENGLISH,
    DATE_I18N: DATE_I18N,
    DATE_FORMATS: DATE_FORMATS
};

},{"fecha":2}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./utils.js'),
    extend = _require.extend,
    warn = _require.warn;

/*
 *    List of all values that can be set
 */


var defaults = {
    FILTER_PLACEHOLDER: 'type filter here',
    FILTER_CASESENSITIVE: 'case-sensitive'
};

module.exports = function () {
    function Language(identifier, languagePack) {
        _classCallCheck(this, Language);

        this.identifier = identifier;
        this.terms = extend(defaults, languagePack);
    }

    _createClass(Language, [{
        key: 'get',
        value: function get(term) {
            if (this.terms.hasOwnProperty(term)) {
                return this.terms[term];
            }
            warn('term ' + term + ' not defined');
            return null;
        }
    }]);

    return Language;
}();

},{"./utils.js":13}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Module = require('./module.js');

var _require = require('../utils.js'),
    addClass = _require.addClass,
    iterate = _require.iterate,
    info = _require.info,
    error = _require.error,
    replaceIdsWithIndices = _require.replaceIdsWithIndices;

module.exports = new Module({
    name: "columnStyles",
    defaultSettings: {
        all: {}
    },
    initializer: function initializer(settings) {
        var _this = this;

        try {
            var _ret = function () {
                addClass(_this.container, 'tm-column-styles');

                var containerId = _this.containerId;
                settings = replaceIdsWithIndices(settings);

                // style general
                var text = 'div#' + containerId + ' table tr > * {';
                iterate(settings.all, function (prop, value) {
                    text += prop + ': ' + value + ';';
                });
                text += '}';

                // add custom styles to the single columns
                iterate(settings, function (index, cssStyles) {
                    if (index === 'all') return;
                    var i = parseInt(index) + 1;

                    text += 'div#' + containerId + ' table tr > *:nth-of-type(' + i + ') {';
                    iterate(cssStyles, function (prop, value) {
                        text += prop + ': ' + value + ';';
                    });
                    text += '}';
                });
                _this.appendStyles(text);
                info('module columnStyles loaded');

                return {
                    v: {
                        unset: function unset() {
                            // no implementation needed
                            info('unsetting columnStyles');
                        }
                    }
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":13,"./module.js":9}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js'),
    addClass = _require.addClass,
    iterate = _require.iterate,
    info = _require.info,
    error = _require.error,
    trigger = _require.trigger,
    replaceIdsWithIndices = _require.replaceIdsWithIndices;

var Module = require('./module.js');
var FILTER_HEIGHT = '30px';

/**
    Factory class to produce filter cells
*/

var CellFactory = function () {
    function CellFactory(tm) {
        _classCallCheck(this, CellFactory);

        var placeholder = tm.getTerm('FILTER_PLACEHOLDER'),
            caseSensitive = tm.getTerm('FILTER_CASESENSITIVE');

        this.cell = document.createElement('td');
        this.cell.innerHTML = '<div class=\'tm-input-div\'><input type=\'text\' placeholder=\'' + placeholder + '\' /></div>\n                                                <span class=\'tm-custom-checkbox\' title=\'' + caseSensitive + '\'>\n                                                    <input type=\'checkbox\' value=\'1\' name=\'checkbox\' />\n                                                    <label for=\'checkbox\'></label>\n                                                </span>';
    }

    _createClass(CellFactory, [{
        key: 'produce',
        value: function produce() {
            var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var caseSensitive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (!enabled) return document.createElement('td');
            var ret = this.cell.cloneNode(true);
            if (!caseSensitive) ret.removeChild(ret.lastChild); // remove custom checkbox
            return ret;
        }
    }]);

    return CellFactory;
}();

function getCell(e) {
    var cell = e.target;
    while (cell.cellIndex === undefined) {
        cell = cell.parentNode;
    }
    return cell;
}

// prototype for Filter

var Filter = function () {
    function Filter(tm, settings) {
        _classCallCheck(this, Filter);

        this.tm = tm;

        this.indices = [];
        this.patterns = [];
        this.options = [];

        settings.columns = replaceIdsWithIndices(settings.columns);
        this.settings = settings;
    }

    // setters


    _createClass(Filter, [{
        key: 'setPatterns',
        value: function setPatterns(patterns) {
            this.patterns = patterns;
            return this;
        }
    }, {
        key: 'setIndices',
        value: function setIndices(indices) {
            this.indices = indices;
            return this;
        }
    }, {
        key: 'setOptions',
        value: function setOptions(options) {
            this.options = options;
            return this;
        }
        // getters

    }, {
        key: 'getPatterns',
        value: function getPatterns() {
            return this.patterns;
        }
    }, {
        key: 'getIndices',
        value: function getIndices() {
            return this.indices;
        }
    }, {
        key: 'getOptions',
        value: function getOptions() {
            return this.options;
        }
    }, {
        key: 'anyFilterActive',
        value: function anyFilterActive() {
            return this.getPatterns().length !== 0;
        }
    }, {
        key: 'getIsEnabled',
        value: function getIsEnabled(i) {
            return this.getColumnSetting(i, 'enabled');
        }
    }, {
        key: 'getIsCaseSensitive',
        value: function getIsCaseSensitive(i) {
            return this.getColumnSetting(i, 'caseSensitive');
        }
    }, {
        key: 'getColumnSetting',
        value: function getColumnSetting(i, setting) {
            var cols = this.settings.columns;
            if (cols.hasOwnProperty(i) && cols[i].hasOwnProperty(setting)) {
                // a custom value was set
                return cols[i][setting];
            }
            return cols.all[setting];
        }
    }, {
        key: 'filter',
        value: function filter() {
            var indices = this.getIndices(),
                patterns = this.getPatterns(),
                options = this.getOptions();

            var maxDeph = indices.length - 1;

            // filter rows
            var arr = this.tm.getAllRows().filter(function (row) {
                var deph = 0,
                    matches = true;

                while (matches && deph <= maxDeph) {
                    var i = indices[deph],
                        pattern = patterns[deph],
                        tester = row.cells[i].innerHTML;

                    if (!options[deph]) {
                        // not case-sensitive
                        pattern = pattern.toLowerCase();
                        tester = tester.toLowerCase();
                    }

                    matches = tester.indexOf(pattern) !== -1;
                    deph++;
                }
                return matches;
            });

            return this.tm.showRows(arr);
        }
    }]);

    return Filter;
}();

;

var FilterDefault = function (_Filter) {
    _inherits(FilterDefault, _Filter);

    function FilterDefault(tm, settings) {
        _classCallCheck(this, FilterDefault);

        var _this = _possibleConstructorReturn(this, (FilterDefault.__proto__ || Object.getPrototypeOf(FilterDefault)).call(this, tm, settings));

        _this.tHead = tm.head ? tm.head.tHead : tm.origHead;

        // create the toolbar row
        var num = _this.tHead.firstElementChild.cells.length,
            row = document.createElement('tr'),
            cellFactory = new CellFactory(tm),
            timeout = void 0;

        for (var i = 0; i < num; i++) {
            var enabled = _this.getIsEnabled(i);
            var cs = _this.getIsCaseSensitive(i);

            row.appendChild(cellFactory.produce(enabled, cs));
        }
        addClass(row, 'tm-filter-row');

        if (settings.autoCollapse) {
            // keep filter row visible if an input is focused
            [].slice.call(row.querySelectorAll('input')).forEach(function (input) {
                // it seems like in IE11 .forEach only works on real arrays
                input.onfocus = function (e) {
                    row.style.height = FILTER_HEIGHT;
                };
                input.onblur = function (e) {
                    row.style.removeProperty('height');
                };
            });
        } else {
            row.style.height = FILTER_HEIGHT;
        }

        // bind listeners
        row.onkeyup = function (e) {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                _this.run();
            }, 500);
        };
        row.onclick = function (e) {
            var cell = getCell(e),
                target = e.target;

            if (target.nodeName == 'SPAN' || target.nodeName == 'LABEL') {
                // checkbox click
                var checkbox = cell.querySelector('input[type=checkbox]');
                checkbox.checked = !checkbox.checked;
                _this.run();
            } else if (target.nodeName == 'INPUT') {
                target.select();
            }
        };

        row.onchange = function () {
            _this.run();
        };

        tm.body.addEventListener('tmRowsAdded', function () {
            if (_this.anyFilterActive()) _this.run();
        });

        // insert toolbar row into tHead
        _this.tHead.appendChild(row);
        return _this;
    }

    _createClass(FilterDefault, [{
        key: 'run',
        value: function run() {
            var filterCells = [].slice.call(this.tHead.querySelector('tr.tm-filter-row').cells);
            var patterns = [],
                indices = [],
                options = [];

            iterate(filterCells, function (i, cell) {
                var input = cell.querySelector('input[type=text]');
                var checkbox = cell.querySelector('input[type=checkbox]');

                if (input && input.value.trim() !== '') {
                    indices.push(i);
                    patterns.push(input.value.trim());
                    if (checkbox) options.push(checkbox.checked);
                }
            });

            this.setPatterns(patterns).setIndices(indices).setOptions(options).filter();

            this.tm.signal('tmSorterSortAgain', 'tmFixedForceRendering');

            return this;
        }
    }]);

    return FilterDefault;
}(Filter);

module.exports = new Module({
    name: "filter",
    defaultSettings: {
        autoCollapse: true,
        columns: {
            all: {
                enabled: true,
                caseSensitive: true
            }
        }
    },
    initializer: function initializer(settings) {
        var _this2 = this;

        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-filter');

            var instance = new FilterDefault(this, settings);

            info('module filter loaded');

            return {
                instance: instance,
                unset: function unset() {
                    info('unsetting filter');
                    // remove all filters;
                    _this2.showAllRows();
                }
            };
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":13,"./module.js":9}],8:[function(require,module,exports){
'use strict';

var Module = require('./module.js');

var _require = require('../utils.js'),
    inPx = _require.inPx,
    iterate = _require.iterate,
    setCss = _require.setCss,
    addClass = _require.addClass,
    removeClass = _require.removeClass,
    getCss = _require.getCss,
    getScrollbarWidth = _require.getScrollbarWidth,
    info = _require.info,
    error = _require.error;

module.exports = new Module({
    name: "fixed",
    defaultSettings: {
        fixHeader: false,
        fixFooter: false
    },
    initializer: function initializer(settings) {
        // set up
        var head = void 0,
            foot = void 0,
            headWrap = void 0,
            footWrap = void 0,
            container = this.container,
            body = this.body,
            bodyWrap = this.bodyWrap,
            origHead = this.origHead,
            origFoot = this.origFoot,
            scrollbarWidth = getScrollbarWidth();

        function getHeaderHeight() {
            return origHead.clientHeight;
        };
        function getFooterHeight() {
            return origFoot.clientHeight;
        };

        function renderHead() {
            if (!head) return;
            var allNew = [].slice.call(head.firstElementChild.firstElementChild.cells),
                allOld = [].slice.call(origHead.firstElementChild.cells);
            body.style.marginTop = inPx('-' + getHeaderHeight()); // if header resizes because of a text wrap

            iterate(allNew, function (i, neu) {
                var w = inPx(allOld[i].getBoundingClientRect().width);
                neu.style.cssText = 'width: ' + w + ';\n                                     min-width: ' + w + ';\n                                     max-width: ' + w;
            });
        }
        function renderFoot() {
            if (!foot) return;
            var allNew = [].slice.call(foot.firstElementChild.firstElementChild.cells),
                allOld = [].slice.call(origFoot.firstElementChild.cells);

            bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + getFooterHeight() + 1)); // if footer resizes because of a text wrap

            iterate(allNew, function (i, neu) {
                var w = inPx(allOld[i].getBoundingClientRect().width);
                neu.style.cssText = 'width: ' + w + ';\n                                     min-width: ' + w + ';\n                                     max-width: ' + w;
            });
        }
        try {
            addClass(container, 'tm-fixed');
            var borderCollapse = getCss(body, 'border-collapse');

            if (origHead && settings.fixHeader) {
                var headerHeight = getHeaderHeight();
                head = document.createElement('table');
                headWrap = document.createElement('div');
                head.appendChild(origHead.cloneNode(true));
                headWrap.appendChild(head);
                container.insertBefore(headWrap, bodyWrap);

                addClass(head, 'tm-head');
                addClass(headWrap, 'tm-head-wrap');

                head.style.borderCollapse = borderCollapse;
                origHead.style.visibility = 'hidden';
                body.style.marginTop = inPx('-' + headerHeight);
                headWrap.style.marginRight = inPx(scrollbarWidth);
            }
            if (origFoot && settings.fixFooter) {
                var footerHeight = getFooterHeight();
                foot = document.createElement('table');
                footWrap = document.createElement('div');
                foot.appendChild(origFoot.cloneNode(true));
                footWrap.appendChild(foot);
                container.appendChild(footWrap);

                addClass(foot, 'tm-foot');
                addClass(footWrap, 'tm-foot-wrap');

                // add DIVs to origFoot cells so its height can be set to 0px
                iterate(origFoot.firstElementChild.cells, function (i, cell) {
                    cell.innerHTML = '<div class="tm-fixed-helper-wrapper">' + cell.innerHTML + '</div>';
                });

                foot.style.borderCollapse = borderCollapse;
                origFoot.style.visibility = 'hidden';
                bodyWrap.style.overflowX = 'scroll';
                bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight));
                footWrap.style.marginRight = inPx(scrollbarWidth);
            }

            // add event listeners
            if (head) {
                window.addEventListener('resize', renderHead);
            }

            if (foot) {
                window.addEventListener('resize', renderFoot);
            }

            body.addEventListener('tmRowsAdded', function () {
                renderHead();
                renderFoot();
            });
            body.addEventListener('tmFixedForceRendering', function () {
                renderHead();
                renderFoot();
            });

            if (head && foot) {
                bodyWrap.addEventListener('scroll', function () {
                    window.requestAnimationFrame(function () {
                        head.style.transform = 'translateX(-' + bodyWrap.scrollLeft + 'px)';
                        footWrap.scrollLeft = bodyWrap.scrollLeft;
                    }, false);
                });
                footWrap.addEventListener('scroll', function () {
                    window.requestAnimationFrame(function () {
                        head.style.transform = 'translateX(-' + footWrap.scrollLeft + 'px)';
                        bodyWrap.scrollLeft = footWrap.scrollLeft;
                    });
                }, false);
            } else if (head && !foot) {

                bodyWrap.addEventListener('scroll', function () {
                    window.requestAnimationFrame(function () {
                        head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);
                    });
                });
            } else if (!head && foot) {

                footWrap.addEventListener('scroll', function () {
                    window.requestAnimationFrame(function () {
                        bodyWrap.scrollLeft = footWrap.scrollLeft;
                    });
                });
                bodyWrap.addEventListener('scroll', function () {
                    window.requestAnimationFrame(function () {
                        footWrap.scrollLeft = bodyWrap.scrollLeft;
                    });
                });
            }

            setTimeout(function () {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                renderHead();
                renderFoot();
            }, 50);
            setTimeout(function () {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                renderHead();
                renderFoot();
            }, 500);

            this.head = head;
            this.foot = foot;
            this.headWrap = headWrap;
            this.footWrap = footWrap;
            info('module fixed loaded');

            return {
                /**
                 * revert all changes performed by this module
                 * implementation might not be 100% correct yet
                 */
                unset: function unset() {
                    var INITIAL = 'initial';
                    try {
                        removeClass(container, 'tm-fixed');
                        if (headWrap) {
                            container.removeChild(headWrap);
                            origHead.style.visibility = INITIAL;
                            body.style.marginTop = 0;
                        }
                        if (footWrap) {
                            container.removeChild(footWrap);
                            origFoot.style.visibility = INITIAL;
                            bodyWrap.style.overflowX = INITIAL;
                            bodyWrap.style.marginBottom = INITIAL;

                            // remove footer helper wrappers
                            var wrappers = origFoot.querySelectorAll('div.tm-fixed-helper-wrapper');

                            [].slice.call(wrappers).forEach(function (wrapper) {
                                wrapper.outerHTML = wrapper.innerHTML;
                            });
                        }

                        window.removeEventListener('resize', renderHead);
                        window.removeEventListener('resize', renderFoot);
                        body.removeEventListener('tmFixedForceRendering', renderHead);
                    } catch (e) {
                        error(e);
                    }
                }
            };
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":13,"./module.js":9}],9:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js'),
    error = _require.error,
    extend2 = _require.extend2,
    isNonEmptyString = _require.isNonEmptyString;

var defaultParams = { //default-name
    defaultSettings: {}, //"default"-default-settings: empty
    settingsValidator: function settingsValidator() {
        return null;
    }, //default: accept all given settings objects
    initializer: function initializer() {
        return null;
    } //default: empty module
};

/**
 * This class represents a single Tablemodify module.
 * It provides a standard interface for defining modules, takes care of settings
 * validation, settings-completion with default settings and can be extended with
 * further functionality (e.g. module dependencies)
 *
 * Usage:
 * module.exports = new Module({
 *     name: <the module's name>,
 *     defaultSettings: <the module's default settings>,
 *     settingsValidator: <function, called with the settings object and throws
 *                         if invalid parameters are detected>,
 *     initializer: <function where the module code itself resides, will be called
 *                   with the Tablemodify instance as this-value and the return
 *                   value will be stored in tm-instance.modules.<modulename>
 * });
 */
module.exports = function () {
    function Module(params) {
        _classCallCheck(this, Module);

        //If no name is given, throw
        if (!isNonEmptyString(params.name)) {
            var errorMsg = "Name must be given for module!";
            error(errorMsg);
            throw new Error(errorMsg);
        }
        //complete parameters with default parameters
        extend2(params, defaultParams);
        //set parameters as properties of this
        extend2(this, params);
    }
    /**
     * Does nothing more than extend the given settings object with the default
     * settings and call the settingsValidator function on the resulting object
     */


    _createClass(Module, [{
        key: "getSettings",
        value: function getSettings(settings) {
            extend2(settings, this.defaultSettings);
            this.settingsValidator(settings);
            return settings;
        }
        /**
         * Called by the Tablemodify instance. Calls the initializer-function with
         * the Tablemodify instance as this-Value
         */

    }, {
        key: "getModule",
        value: function getModule(tableModify, settings) {
            settings = this.getSettings(settings);
            return this.initializer.call(tableModify, settings, this);
        }
    }]);

    return Module;
}();

},{"../utils.js":13}],10:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = require('./module.js');
var dateUtils = require('../dateUtils.js');

var _require = require('../utils.js'),
    addClass = _require.addClass,
    isFn = _require.isFn,
    errorThrow = _require.errorThrow,
    hasProp = _require.hasProp,
    log = _require.log,
    warn = _require.warn,
    error = _require.error,
    isBool = _require.isBool,
    isNonEmptyString = _require.isNonEmptyString,
    iterate = _require.iterate,
    removeClass = _require.removeClass,
    extend2 = _require.extend2,
    isObject = _require.isObject,
    replaceIdsWithIndices = _require.replaceIdsWithIndices;

function getValue(tr, i) {
    return tr.cells[i].innerHTML.trim().toLowerCase();
}

var FIRST_ENABLED_CELL = 'firstEnabled';
var SORT_ORDER_ASC = 'asc';
var SORT_ORDER_DESC = 'desc';

/**
 * The Parser class encapsulates compare functions for the sorting functionality
 * A Parser can either encapsulate two types of compare functions:
 * a) a simple compare function, taking 2 arguments and returning a value <0, 0 or >0
 * b) a parametric compare function, taking one argument (the parameters) and returning
 *    a compare function as described in a)
 */

var Parser = function () {
    /**
     * Create a parser
     * @param {Function} getFn - Either a simple compare function or a parametric one
     * @param {Object} defaultSettings - The default settings for a parametric compare
     *                                   compare function, omit if it is not a parametric one
     */
    function Parser(getFn, defaultSettings) {
        _classCallCheck(this, Parser);

        if (!isFn(getFn)) {
            errorThrow('First argument given to parser must be a function!');
        }
        this.getFn = getFn;
        this.defaultSettings = isObject(defaultSettings) ? defaultSettings : false;
    }

    /**
     * Get the actual compare function from the encapsulated one
     * @param {Object} providedSettings - Parameters given to a parametric compare function,
     *                                    omit if it's not a parametric one
     * @returns {Function} The actual compare function to be used in sorting algorithm
     * @throws {Error} If parameters are given for a non-parametric compare function
     */


    _createClass(Parser, [{
        key: 'get',
        value: function get(providedSettings) {
            var settingsGiven = isObject(providedSettings);

            if (settingsGiven && !this.defaultSettings) {
                errorThrow("This parser doesn't accept options!");
            }

            //The compare function to be returned
            var retFn = this.getFn;
            if (this.defaultSettings) {
                if (!settingsGiven) {
                    providedSettings = {};
                }
                extend2(providedSettings, this.defaultSettings);
                retFn = this.getFn(providedSettings);
                if (!isFn(retFn)) {
                    errorThrow("Parser didn't return a compare function!");
                }
            }
            return retFn;
        }
    }]);

    return Parser;
}();

var Sorter = function () {
    function Sorter(tableModify, settings) {
        var _this = this;

        _classCallCheck(this, Sorter);

        //Set initial values
        extend2(this, {
            ready: true,
            headers: {},
            headCells: [],
            body: null,
            rows: []
        });

        settings.columns = replaceIdsWithIndices(settings.columns);
        //Store a reference to the tablemodify instance
        this.tm = tableModify;
        addClass(this.tm.container, 'tm-sorter');
        this.body = this.tm.body.tBodies[0];

        this.sortColumns = settings.columns;
        //Array of structure [[col_index_1, true | false], [col_index_2, true | false], ...]
        this.currentOrders = [];
        this.headCells = this.tm.head ? [].slice.call(this.tm.head.firstElementChild.firstElementChild.cells) : [].slice.call(this.tm.body.tHead.firstElementChild.cells);

        iterate(settings.customParsers, function (name, func) {
            _this.parsers[name] = new Parser(func);
        });

        // attach sorting event listeners
        iterate(this.headCells, function (i, cell) {
            i = parseInt(i);

            if (_this.getIsEnabled(i)) {
                addClass(cell, 'sortable');
                cell.addEventListener('click', function (e) {
                    if (e.shiftKey && settings.enableMultisort) {
                        _this.manageMulti(i);
                    } else {
                        _this.manage(i);
                    }
                });
            }
        });

        // try to sort by initial sorting
        if (settings.initialColumn !== false) {
            var initIndex = settings.initialColumn;
            var initOrder = settings.initialOrder;
            initOrder = initOrder === SORT_ORDER_ASC;
            //if special value first_enabled is provided, search for first searchable column
            if (initIndex === FIRST_ENABLED_CELL) {
                var colCount = this.tm.getColumnCount();
                for (var i = 0; i < colCount; ++i) {
                    if (this.getIsEnabled(i)) {
                        initIndex = i;
                        break;
                    }
                }
            }
            if (this.getIsEnabled(initIndex)) {
                this.manage(initIndex, false, initOrder);
            }
        }

        // sort again in case it's needed.
        this.tm.body.addEventListener('tmSorterSortAgain', function () {
            _this.sort();
        });

        this.tm.body.addEventListener('tmRowsAdded', function () {
            _this.sort();
        });
    }

    /**
     * Sets the current order for a given column or adds a new order if an order
     * for this column did not exist
     * @param {Number} columnIndex - The index of the column
     * @param {Boolean} order - true for ascending, false for descending order
     * @returns this for method chaining
     */


    _createClass(Sorter, [{
        key: 'setOrAddOrder',
        value: function setOrAddOrder(columnIndex, order) {
            if (this.hasOrder(columnIndex)) {
                this.currentOrders.filter(function (e) {
                    return e[0] === columnIndex;
                })[0][1] = order;
            } else {
                this.currentOrders.push([columnIndex, order]);
            }
            return this;
        }

        /**
         * Check if there exists a current order for the column specified by columnIndex
         * @returns {Boolean}
        */

    }, {
        key: 'hasOrder',
        value: function hasOrder(columnIndex) {
            return this.currentOrders.filter(function (e) {
                return e[0] === columnIndex;
            }).length > 0;
        }

        /**
         * Gets the current order for the column specified by columIndex
         * @returns {Boolean} true for ascending, false for descending, undefined if no order exists
         */

    }, {
        key: 'getOrder',
        value: function getOrder(columnIndex) {
            if (!this.hasOrder(columnIndex)) return;
            var order = this.currentOrders.filter(function (e) {
                return e[0] === columnIndex;
            })[0];
            return order[1];
        }

        /**
         * Removes all current orders
         * @returns this for method chaining
         */

    }, {
        key: 'removeAllOrders',
        value: function removeAllOrders() {
            this.currentOrders = [];
            return this;
        }

        /**
         * Gets the compare function for a given column
         * @param {Number} i - The column index
         * @returns {Function} The compare function
         * @throws {Error} If the parser for the given column cannot be found
         */

    }, {
        key: 'getParser',
        value: function getParser(i) {
            var parserObj = void 0;
            //Find out if we have to use the parser given for all columns or there is an individual parser
            if (hasProp(this.sortColumns, i, 'parser')) {
                parserObj = this.sortColumns[i];
            } else {
                parserObj = this.sortColumns.all;
            }

            if (!this.parsers.hasOwnProperty(parserObj.parser)) {
                errorThrow('The given parser ' + parserObj.parser + ' does not exist!');
            }

            return this.parsers[parserObj.parser].get(parserObj.parserOptions);
        }

        /**
         * Checks whether sorting by a given column is enabled
         * @param {Number} i - The column index
         * @returns {Boolean}
         */

    }, {
        key: 'getIsEnabled',
        value: function getIsEnabled(i) {
            return hasProp(this.sortColumns, i, 'enabled') ? this.sortColumns[i].enabled : this.sortColumns.all.enabled;
        }

        /**
         * Gets all compare functions needed to sort by the currently active sort columns
         * @returns {Array} Array of compare functions
         * @throws {Error} If the parser for one of the current columns cannot be found
         */

    }, {
        key: 'getParsers',
        value: function getParsers() {
            var _this2 = this;

            return this.currentOrders.map(function (order) {
                return _this2.getParser(order[0]);
            });
        }

        /**
         * Does the actual sorting work by all given sort orders, does no DOM manipulation
         * @returns this for method chaining
         */

    }, {
        key: 'sort',
        value: function sort() {
            var orders = this.currentOrders;
            var maxDepth = orders.length - 1;
            var parsers = this.getParsers();

            var sorted = this.tm.getVisibleRows().sort(function (a, b) {
                var compareResult = 0,
                    curDepth = 0;
                while (compareResult === 0 && curDepth <= maxDepth) {
                    var index = orders[curDepth][0];
                    compareResult = parsers[curDepth](getValue(a, index), getValue(b, index));
                    ++curDepth;
                }
                --curDepth;
                return orders[curDepth][1] ? compareResult : -compareResult;
            });

            this.tm.showRows(sorted);
            return this;
        }

        /**
         * Adds the corresponding css classes for ascending/descending sort order to the headers
         * of currently active sort columns to provide a visual feedback to the user
         * @returns this for method chaining
         */

    }, {
        key: 'renderSortingArrows',
        value: function renderSortingArrows() {
            // remove current sorting classes
            iterate(this.tm.container.querySelectorAll('.sort-up, .sort-down'), function (i, cell) {
                removeClass(cell, 'sort-up');
                removeClass(cell, 'sort-down');
            });

            for (var i = this.currentOrders.length - 1; i >= 0; --i) {
                var _currentOrders$i = _slicedToArray(this.currentOrders[i], 2),
                    index = _currentOrders$i[0],
                    order = _currentOrders$i[1];

                var cell = this.headCells[index];
                addClass(cell, order ? 'sort-up' : 'sort-down');
            }
            return this;
        }

        /**
         * Handles a sorting action for a specific column
         * @param {Number} colIndex - The column index
         * @param {Boolean} multiSort - if true and sorting by given column was already enabled, just
         *                              change the sorting order, otherwise append to the sorting orders
         *                              if false, all current sorting orders are removed and sorting by
         *                              the given column will be enabled
         * @param {Boolean} order - true for ascending, false for descending, omit for inverting of the
         *                          current order (if none existed, ascending is used)
         * @returns this for method chaining
         */

    }, {
        key: 'manage',
        value: function manage(colIndex, multiSort, order) {
            if (!this.getIsEnabled(colIndex)) {
                warn('Tried to sort by non-sortable column index ' + colIndex);
                return this;
            }
            if (!isBool(order)) {
                if (this.hasOrder(colIndex)) {
                    order = !this.getOrder(colIndex);
                } else {
                    order = true;
                }
            }
            if (multiSort !== true) this.removeAllOrders();
            this.setOrAddOrder(colIndex, order);

            this.sort().renderSortingArrows();

            return this;
        }
        /**
         * Shortcut for the manage method with multiSort set to true
         * @returns this for method chaining
         */

    }, {
        key: 'manageMulti',
        value: function manageMulti(colIndex, order) {
            this.manage(colIndex, true, order);
            return this;
        }
    }]);

    return Sorter;
}();

Sorter.prototype.parsers = {
    string: new Parser(function (a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    }),
    numeric: new Parser(function (a, b) {
        a = parseFloat(a);
        b = parseFloat(b);
        return a - b;
    }),
    intelligent: new Parser(function (a, b) {
        var isNumericA = !isNaN(a),
            isNumericB = !isNaN(b);

        if (isNumericA && isNumericB) {
            return parseFloat(a) - parseFloat(b);
        } else if (isNumericA) {
            return -1;
        } else if (isNumericB) {
            return 1;
        } else {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        }
    }),
    /**
     * A parametric parser which takes two arguments, 'preset' and 'format'.
     * If format is given, it overrides a potential preset, format should be a
     * format string (tokens described in https://github.com/taylorhakes/fecha#formatting-tokens)
     * preset is either 'english' or 'german' and will parse the common forms of english/german
     * date formats
     */
    date: new Parser(function (settings) {
        var fecha = dateUtils.fecha,
            DATE_I18N = dateUtils.DATE_I18N,
            DATE_FORMATS = dateUtils.DATE_FORMATS;


        if (settings.format) {
            if (!isNonEmptyString(settings.format)) {
                errorThrow('Invalid date parsing format ' + settings.format + ' given');
            }
            return function (a, b) {
                try {
                    var aDate = fecha.parse(a, settings.format);
                    var bDate = fecha.parse(b, settings.format);
                    if (!aDate || !bDate) throw new Error("couldn't parse date!");
                    return aDate - bDate;
                } catch (e) {
                    errorThrow('Error while comparing dates: ' + e);
                }
            };
        } else if (settings.preset) {
            var _ret = function () {
                var i18n = DATE_I18N[settings.preset];
                if (!i18n) errorThrow('Invalid preset name ' + settings.preset + ' given!');
                var formats = DATE_FORMATS[settings.preset];
                return {
                    v: function v(a, b) {
                        try {
                            var aDate = false,
                                bDate = void 0;
                            var index = 0;
                            while (!aDate && index < formats.length) {
                                aDate = fecha.parse(a, formats[index]);
                                bDate = fecha.parse(b, formats[index]);
                                ++index;
                            }
                            if (!aDate) throw new Error("None of the given parsers matched!");
                            return aDate - bDate;
                        } catch (e) {
                            errorThrow('Couldn\'t compare dates: ' + e);
                        }
                    }
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
            errorThrow("Neither a preset nor a date format has been given!");
        }
    }, {
        preset: dateUtils.DATE_GERMAN
    }),
    /*
        german days of the week
    */
    daysOfTheWeek: function daysOfTheWeek(a, b) {
        function getIndex(str) {
            var i = -1,
                l = days.length - 1;
            while (l > -1 && i === -1) {
                i = days[l].indexOf(str);
                l--;
            }
            return i;
        }

        var days = [
        // german
        ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'], ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'],
        // english
        ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']];

        return getIndex(b.toLowerCase()) - getIndex(a.toLowerCase());
    }
};

module.exports = new Module({
    name: "sorter",
    defaultSettings: {
        columns: {
            all: {
                enabled: true,
                parser: 'intelligent'
            }
        },
        initialColumn: FIRST_ENABLED_CELL,
        initialOrder: SORT_ORDER_ASC,
        enableMultisort: true,
        customParsers: {}
    },
    initializer: function initializer(settings) {
        var sorterInstance = new Sorter(this, settings);
        return {
            sortAsc: function sortAsc(index) {
                return sorterInstance.manage(index, false, true);
            },
            sortDesc: function sortDesc(index) {
                return sorterInstance.manage(index, false, false);
            },
            info: function info() {
                console.log(sorterInstance.currentOrders);
            },
            unset: function unset() {
                log('unsetting sorter... not implemented yet');
                /*
                    @Todo set order to initial ... don't know how to do it yet
                */
            }
        };
    }
});

},{"../dateUtils.js":4,"../utils.js":13,"./module.js":9}],11:[function(require,module,exports){
'use strict';

var _require = require('../utils.js'),
    addClass = _require.addClass,
    extend = _require.extend,
    info = _require.info,
    error = _require.error;

var Module = require('./module.js');
/*

    DEPRECATED, can be realized via CSS, see default theme

*/
module.exports = new Module({
    name: "zebra",
    defaultSettings: {
        even: '#f0f0f0',
        odd: 'white'
    },
    initializer: function initializer(settings) {
        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-zebra');

            var text = 'table' + this.bodySelector + ' tr:nth-of-type(even){background-color:' + settings.even + '}' + 'table' + this.bodySelector + ' tr:nth-of-type(odd) {background-color:' + settings.odd + '}';
            this.appendStyles(text);

            info('module zebra loaded');

            return {
                unset: function unset() {
                    // no implementation needed
                    info('unsetting zebra');
                }
            };
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":13,"./module.js":9}],12:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = require('./config.js');
var Module = require('./modules/module.js');
var Language = require('./language.js');

var _require = require('./utils.js'),
    error = _require.error,
    warn = _require.warn,
    isNonEmptyString = _require.isNonEmptyString,
    getCss = _require.getCss,
    iterate = _require.iterate,
    extend = _require.extend,
    hasClass = _require.hasClass,
    addClass = _require.addClass,
    removeClass = _require.removeClass,
    getUniqueId = _require.getUniqueId,
    trigger = _require.trigger,
    tableFactory = _require.tableFactory;

var Tablemodify = function () {
    function Tablemodify(selector, coreSettings) {
        _classCallCheck(this, Tablemodify);

        extend(config.coreDefaults, coreSettings);
        var containerId = void 0,
            oldBodyParent = void 0,
            _this = this,
            body = document.querySelector(selector); // must be a table

        // ------------- ERROR PREVENTION ---------------------------
        // check if table is valid
        if (!body || body.nodeName !== 'TABLE') {
            error('there is no <table> with selector ' + selector);
            return null;
        }

        // check if Tm hasn't already been called for this table
        if (hasClass(body, 'tm-body')) {
            warn('the table ' + selector + ' is already initialized.');
            return null;
        }

        // check if containerId is valid or produce a unique id
        if (coreSettings.containerId && document.getElementById(coreSettings.containerId)) {
            error('the passed id ' + coreSettings.containerId + ' is not unique!');
            return null;
        } else if (coreSettings.containerId) {
            containerId = coreSettings.containerId;
        } else {
            containerId = getUniqueId();
        }

        // references to all active modules stored in here
        this.activeModules = {};

        this.bodySelector = selector;
        oldBodyParent = body.parentElement;

        this.columnCount = 0;
        this.calculateColumnCount(body);

        this.currentLanguage = coreSettings.language;

        body.outerHTML = '<div class=\'tm-container\'>\n                        <style class=\'tm-custom-style\'></style>\n                        <div class=\'tm-body-wrap\'>\n                            ' + body.outerHTML + '\n                        </div>\n                    </div>';

        this.container = oldBodyParent.querySelector('.tm-container');

        body = this.container.querySelector('table'); // important! reload body variable

        this.body = body;
        this.bodyWrap = body.parentElement;
        this.stylesheet = this.bodyWrap.previousElementSibling;

        this.origHead = body.tHead;
        this.origFoot = body.tFoot;

        // add optional id to container
        this.container.id = containerId;
        this.containerId = containerId;

        // add theme class to container
        addClass(this.container, 'tm-theme-' + coreSettings.theme);
        addClass(body, 'tm-body');

        // the tBody, contains all visible rows in the table
        this.visibleRows = this.body.tBodies[0];
        // contains all tr-nodes that are not displayed at the moment
        this.hiddenRows = document.createDocumentFragment();

        // call all modules
        if (coreSettings.modules) {
            // interface for modules
            iterate(coreSettings.modules, function (moduleName, moduleSettings) {
                var module = Tablemodify.modules[moduleName],
                    moduleReturn = void 0;
                if (module) {
                    moduleReturn = module.getModule(_this, moduleSettings);
                } else {
                    warn('Module' + moduleName + ' not registered!');
                }
                if (moduleReturn !== undefined) {
                    if (_this.activeModules[moduleName] === undefined) {
                        // define ret as a property of the Tablemodify instance.
                        // now you can access it later via tm.modulename
                        _this.activeModules[moduleName] = moduleReturn;
                    } else {
                        error('module name ' + moduleName + ' causes a collision and is not allowed, please choose another one!');
                    }
                }
            });
        }
        this.coreSettings = coreSettings;
    }

    /**
     * calculate number of columns. Usually only called at the initialisation
     */


    _createClass(Tablemodify, [{
        key: 'calculateColumnCount',
        value: function calculateColumnCount(element) {
            var maxCols = 0;
            [].forEach.call(element.rows, function (row) {
                if (row.cells.length > maxCols) maxCols = row.cells.length;
            });
            this.columnCount = maxCols;
        }

        /**
         * getter for number of columns
         */

    }, {
        key: 'getColumnCount',
        value: function getColumnCount() {
            return this.columnCount;
        }

        /**
         * add css text to the internal style-tag each tm-container contains
         */

    }, {
        key: 'appendStyles',
        value: function appendStyles(text) {
            if (text.trim().length > 0) {
                this.stylesheet.appendChild(document.createTextNode(text.trim()));
            }
            return this;
        }

        /**
         * get a term out of the current language pack
         */

    }, {
        key: 'getTerm',
        value: function getTerm(term) {
            return Tablemodify.languages[this.currentLanguage].get(term);
        }

        /**
         *  get array of references to the visible rows
         */

    }, {
        key: 'getVisibleRows',
        value: function getVisibleRows() {
            return [].slice.call(this.visibleRows.rows);
        }

        /**
         *  get array of references to the hidden rows
         */

    }, {
        key: 'getHiddenRows',
        value: function getHiddenRows() {
            return [].slice.call(this.hiddenRows.childNodes);
        }

        /**
         *  get array of references to all rows, both hidden and visible
         */

    }, {
        key: 'getAllRows',
        value: function getAllRows() {
            return this.getVisibleRows().concat(this.getHiddenRows());
        }

        /**
         * show all the rows that the param rowArray contains (as references).
         * used by filter module
         */

    }, {
        key: 'showRows',
        value: function showRows(rowArray) {
            var fragment = document.createDocumentFragment();
            this.hideAllRows();

            for (var i = 0; i < rowArray.length; i++) {
                fragment.appendChild(rowArray[i]);
            }

            this.visibleRows.appendChild(fragment);
            return this;
        }

        /**
         * May be used from outside the plugin to add rows to the table.
         * This will automatically rerun the filter & sorter module.
         */

    }, {
        key: 'addRows',
        value: function addRows(arr) {
            if (arr.length === 0) return this;

            if (Array.isArray(arr[0])) {
                return this._addJSONRows(arr);
            } else if (arr[0].tagName === 'TR') {
                return this._addHTMLRows(arr);
            } else {
                error('wrong parameter for addRows()');
                return this;
            }
        }
    }, {
        key: '_addHTMLRows',
        value: function _addHTMLRows(rowArray) {
            var fragment = document.createDocumentFragment();
            for (var i = 0; i < rowArray.length; i++) {
                fragment.appendChild(rowArray[i]);
            }
            this.visibleRows.appendChild(fragment);
            return this.signal('tmRowsAdded');
        }
    }, {
        key: '_addJSONRows',
        value: function _addJSONRows(rowArray) {
            var tr = document.createElement('tr'),
                td = document.createElement('td'),
                newTr = void 0,
                newTd = void 0,
                fragment = document.createDocumentFragment();

            for (var i = 0; i < rowArray.length; i++) {
                newTr = tr.cloneNode();
                for (var j = 0; j < rowArray[i].length; j++) {
                    newTd = td.cloneNode();
                    newTd.innerHTML = rowArray[i][j];
                    newTr.appendChild(newTd);
                }
                fragment.appendChild(newTr);
            }

            this.visibleRows.appendChild(fragment);
            return this.signal('tmRowsAdded');
        }

        /**
         * add a single row
         */

    }, {
        key: 'addRow',
        value: function addRow(row) {
            return this.addRows([row]);
        }

        /**
         * this method cleares the tablebody, without the table rows being lost. Instead, they are stored in the DocumentFragment.
         * References to the table rows (laying in the array this.rows) now point on the elements in the fragment.
         * The References can be used to insert the rows in the original DOM again.
         * This is necessary because IE11 had several issues with references to deleted table rows
         */

    }, {
        key: 'hideAllRows',
        value: function hideAllRows() {
            var rows = this.visibleRows.rows,
                next = void 0;

            while (next = rows[0]) {
                this.hiddenRows.appendChild(next);
            }
            return this;
        }

        /**
         * display all hidden rows again
         * this is correct usage of documentFragment! appending the fragment itself appends all children instead
         */

    }, {
        key: 'showAllRows',
        value: function showAllRows() {
            this.visibleRows.appendChild(this.hiddenRows);
            return this.signal('tmRowsAdded');
        }

        /**
         * deletes all rows in the table (hidden AND visible).
         * Faster implementation than setting innerHTMl = ''
         */

    }, {
        key: 'deleteAllRows',
        value: function deleteAllRows() {
            [this.visibleRows, this.hiddenRows].forEach(function (p) {
                while (p.firstChild) {
                    p.removeChild(p.firstChild);
                }
            });
            return this;
        }

        /**
         * used to fire events on the original table. Modules may react to this events.
         * Its a convention that all events are fired on this element and the modules listen to the same.
         */

    }, {
        key: 'signal',
        value: function signal() {
            var _this2 = this;

            for (var _len = arguments.length, events = Array(_len), _key = 0; _key < _len; _key++) {
                events[_key] = arguments[_key];
            }

            events.forEach(function (e) {
                trigger(_this2.body, e);
            });
            return this;
        }

        /**
         * Static method for adding user-defined modules
         * this-value in a static method is the constructor function itself (here
         * Tablemodify)
         */

    }], [{
        key: 'addModule',
        value: function addModule(module, name) {
            if (typeof module === "function") {
                //Create a new module based on the given name and initializer function
                return this.addModule(new Module({
                    name: name,
                    initializer: module
                }));
            } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === "object") {
                //Check if it is a Module instance
                if (module instanceof Module) {
                    //if the module already exists, throw
                    if (this.modules[module.name]) {
                        var errorMsg = "Module " + module.name + " does already exist!";
                        error(errorMsg);
                        throw new Error(errorMsg);
                    }
                    this.modules[module.name] = module;
                    //Treat the objects as parameters for new module instance
                } else {
                    //If a name is given as parameter, override a name in the parameters object
                    if (isNonEmptyString(name)) {
                        module.name = name;
                    }
                    this.addModule(new Module(module));
                }
            }
        }

        /**
            add a language pack to the collection of Languages.
            param name: identifier of the language. May overwrite older ones
            param term: object containing the terms. see full list in language.js
        */

    }, {
        key: 'addLanguage',
        value: function addLanguage(name, terms) {
            Tablemodify.languages[name] = new Language(name, terms);
        }

        /**
            reset all loaded modules of instance
            and unset instance afterwards
        */

    }, {
        key: '_destroy',
        value: function _destroy(instance) {
            try {
                if (!instance || !instance instanceof Tablemodify) throw new Error('not a Tablemodify-object');
                if (!instance.activeModules) throw new Error('instance has no property activeModules');

                var container = instance.container;
                var table = instance.body;

                iterate(instance.activeModules, function (moduleName, module) {
                    // revert all changes performed by this module. Module itself is responsible for correct reversion
                    if (module.unset) module.unset();
                });

                removeClass(table, 'tm-body');
                // remove all wrappers
                container.parentElement.replaceChild(table, container);

                // delete instance
                iterate(instance, function (prop, val) {
                    delete instance[prop];
                });
            } catch (e) {
                console.warn(e);
            }
        }
    }]);

    return Tablemodify;
}();

Tablemodify.modules = {
    columnStyles: require('./modules/columnStyles.js'),
    filter: require('./modules/filter.js'),
    fixed: require('./modules/fixed.js'),
    sorter: require('./modules/sorter.js'),
    zebra: require('./modules/zebra.js')
};

Tablemodify.languages = {
    en: new Language('en', {
        FILTER_PLACEHOLDER: 'type filter here',
        FILTER_CASESENSITIVE: 'case-sensitive'
    }),
    de: new Language('de', {
        FILTER_PLACEHOLDER: 'Filter eingeben',
        FILTER_CASESENSITIVE: 'Groß- und Kleinschreibung unterscheiden'
    })
};

Tablemodify.Language = Language;
//Store reference to the module class for user-defined modules
Tablemodify.Module = Module;
// set version of Tablemodify
Tablemodify.version = 'v0.9.4';
//make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;

},{"./config.js":3,"./language.js":5,"./modules/columnStyles.js":6,"./modules/filter.js":7,"./modules/fixed.js":8,"./modules/module.js":9,"./modules/sorter.js":10,"./modules/zebra.js":11,"./utils.js":13}],13:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var config = require('./config.js');
require('custom-event-polyfill');
// custom console logging functions
exports.log = function (text) {
    if (config.debug) console.log('tm-log: ' + text);
};
exports.info = function (text) {
    if (config.debug) console.info('tm-info: ' + text);
};
exports.warn = function (text) {
    if (config.debug) console.warn('tm-warn: ' + text);
};
exports.trace = function (text) {
    if (config.debug) console.trace('tm-trace: ' + text);
};
exports.error = function (text) {
    console.error('tm-error: ' + text);
};
exports.errorThrow = function (text) {
    exports.error(text);
    throw new Error(text);
};
// utils
exports.hasClass = function (el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
};
exports.addClass = function (el, className) {
    if (el.classList) el.classList.add(className);else if (!hasClass(el, className)) el.className += ' ' + className;
    return el;
};
exports.removeClass = function (el, className) {
    if (el.classList) el.classList.remove(className);else el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
    return el;
};
exports.wrap = function (el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    return wrapper;
};
/**
 * Extended version of the "extend"-Function. Supports multiple sources,
 * extends deep recursively.
 */
exports.extend2 = function extend2(destination) {
    for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
    }

    var _loop = function _loop(i) {
        var source = sources[i];
        Object.keys(source).forEach(function (key) {
            if ({}.hasOwnProperty.call(destination, key)) {
                var tDest = _typeof(destination[key]);
                var tSrc = _typeof(source[key]);
                if (tDest === tSrc && (tDest === 'object' || tDest === 'function')) {
                    extend2(destination[key], source[key]);
                }
            } else {
                destination[key] = source[key];
            }
        });
    };

    for (var i = 0; i < sources.length; i++) {
        _loop(i);
    }
    return destination;
};
exports.extend = function extend(d, s) {
    Object.keys(d).forEach(function (key) {
        if (!s.hasOwnProperty(key)) {
            s[key] = d[key];
        } else if (_typeof(s[key]) === 'object') {
            // recursive deep-extend
            s[key] = extend(d[key], s[key]);
        }
    });

    return s;
};
exports.getScrollbarWidth = function () {
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
};
exports.setCss = function (el, styles) {
    for (var property in styles) {
        el.style[property] = styles[property];
    }
    return el;
};
exports.getCss = function (el, style) {
    return window.getComputedStyle(el, null)[style];
};
exports.inPx = function (c) {
    return c + 'px';
};
// iterate over a set of elements and call function for each one
exports.iterate = function (elems, func) {
    if ((typeof elems === 'undefined' ? 'undefined' : _typeof(elems)) === 'object') {
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
};

exports.getUniqueId = function () {
    var unique = 0;

    return function () {
        var id = 'tm-unique-' + unique;
        unique++;
        return id;
    };
}();

exports.isNonEmptyString = function (str) {
    return typeof str === "string" && str.trim().length > 0;
};

var isObj = exports.isObject = function (o) {
    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
};

exports.isFn = function (f) {
    return typeof f === 'function';
};

exports.isBool = function (b) {
    return typeof b === 'boolean';
};

var getProp = exports.getProperty = function (obj) {
    for (var _len2 = arguments.length, props = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        props[_key2 - 1] = arguments[_key2];
    }

    if (!isObj(obj) || props.length === 0) return;
    var index = 0;
    while (index < props.length - 1) {
        obj = obj[props[index]];
        if (!isObj(obj)) return;
        ++index;
    }
    if (obj[props[index]] === undefined) return;
    return obj[props[index]];
};
exports.hasProp = function (obj) {
    for (var _len3 = arguments.length, props = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        props[_key3 - 1] = arguments[_key3];
    }

    return getProp.apply(undefined, [obj].concat(props)) !== undefined;
};

/**
    trigger custom events supported by all browsers
*/
exports.trigger = function (target, eventName, props) {
    target.dispatchEvent(new CustomEvent(eventName, props));
};

/**
    finds head cell with tm-id = tmId and returns its index
    */
function id2index(tmId) {
    var cell = document.querySelector('thead > tr > *[tm-id=' + tmId + ']');
    if (!cell) return null;
    return [].slice.call(cell.parentNode.children).indexOf(cell);
}

/**
    ersetze alle spalten, die über die tm-id identifiziert werden, durch ihren index
*/
exports.replaceIdsWithIndices = function (columns) {
    Object.keys(columns).forEach(function (key) {
        if (key != 'all' && isNaN(key)) {
            var index = id2index(key);
            if (index != null) {
                columns[index] = columns[key];
                delete columns[key];
            }
        }
    });
    return columns;
};

},{"./config.js":3,"custom-event-polyfill":1}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY3VzdG9tLWV2ZW50LXBvbHlmaWxsL2N1c3RvbS1ldmVudC1wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9mZWNoYS9mZWNoYS5qcyIsInNyY1xcY29uZmlnLmpzIiwic3JjXFxkYXRlVXRpbHMuanMiLCJzcmNcXGxhbmd1YWdlLmpzIiwic3JjXFxtb2R1bGVzXFxjb2x1bW5TdHlsZXMuanMiLCJzcmNcXG1vZHVsZXNcXGZpbHRlci5qcyIsInNyY1xcbW9kdWxlc1xcZml4ZWQuanMiLCJzcmNcXG1vZHVsZXNcXG1vZHVsZS5qcyIsInNyY1xcbW9kdWxlc1xcc29ydGVyLmpzIiwic3JjXFxtb2R1bGVzXFx6ZWJyYS5qcyIsInNyY1xcdGFibGVtb2RpZnkuanMiLCJzcmNcXHV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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YixFQUFtQjtBQUNmLHdCQUFRLEtBQVIsSUFBaUIsUUFBUSxHQUFSLENBQWpCO0FBQ0EsdUJBQU8sUUFBUSxHQUFSLENBQVA7QUFDSDtBQUNKO0FBQ0osS0FSRDtBQVNBLFdBQU8sT0FBUDtBQUNILENBWEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gUG9seWZpbGwgZm9yIGNyZWF0aW5nIEN1c3RvbUV2ZW50cyBvbiBJRTkvMTAvMTFcblxuLy8gY29kZSBwdWxsZWQgZnJvbTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kNHRvY2NoaW5pL2N1c3RvbWV2ZW50LXBvbHlmaWxsXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQjUG9seWZpbGxcblxudHJ5IHtcbiAgICB2YXIgY2UgPSBuZXcgd2luZG93LkN1c3RvbUV2ZW50KCd0ZXN0Jyk7XG4gICAgY2UucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoY2UuZGVmYXVsdFByZXZlbnRlZCAhPT0gdHJ1ZSkge1xuICAgICAgICAvLyBJRSBoYXMgcHJvYmxlbXMgd2l0aCAucHJldmVudERlZmF1bHQoKSBvbiBjdXN0b20gZXZlbnRzXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjMzNDkxOTFcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgcHJldmVudCBkZWZhdWx0Jyk7XG4gICAgfVxufSBjYXRjaChlKSB7XG4gIHZhciBDdXN0b21FdmVudCA9IGZ1bmN0aW9uKGV2ZW50LCBwYXJhbXMpIHtcbiAgICB2YXIgZXZ0LCBvcmlnUHJldmVudDtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7XG4gICAgZXZ0LmluaXRDdXN0b21FdmVudChldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgICBvcmlnUHJldmVudCA9IGV2dC5wcmV2ZW50RGVmYXVsdDtcbiAgICBldnQucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBvcmlnUHJldmVudC5jYWxsKHRoaXMpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdkZWZhdWx0UHJldmVudGVkJywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIGV2dDtcbiAgfTtcblxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW5kb3cuRXZlbnQucHJvdG90eXBlO1xuICB3aW5kb3cuQ3VzdG9tRXZlbnQgPSBDdXN0b21FdmVudDsgLy8gZXhwb3NlIGRlZmluaXRpb24gdG8gd2luZG93XG59XG4iLCIoZnVuY3Rpb24gKG1haW4pIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBQYXJzZSBvciBmb3JtYXQgZGF0ZXNcbiAgICogQGNsYXNzIGZlY2hhXG4gICAqL1xuICB2YXIgZmVjaGEgPSB7fTtcbiAgdmFyIHRva2VuID0gL2R7MSw0fXxNezEsNH18WVkoPzpZWSk/fFN7MSwzfXxEb3xaWnwoW0hoTXNEbV0pXFwxP3xbYUFdfFwiW15cIl0qXCJ8J1teJ10qJy9nO1xuICB2YXIgdHdvRGlnaXRzID0gL1xcZFxcZD8vO1xuICB2YXIgdGhyZWVEaWdpdHMgPSAvXFxkezN9LztcbiAgdmFyIGZvdXJEaWdpdHMgPSAvXFxkezR9LztcbiAgdmFyIHdvcmQgPSAvWzAtOV0qWydhLXpcXHUwMEEwLVxcdTA1RkZcXHUwNzAwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdK3xbXFx1MDYwMC1cXHUwNkZGXFwvXSsoXFxzKj9bXFx1MDYwMC1cXHUwNkZGXSspezEsMn0vaTtcbiAgdmFyIGxpdGVyYWwgPSAvXFxbKFteXSo/KVxcXS9nbTtcbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7XG4gIH07XG5cbiAgZnVuY3Rpb24gc2hvcnRlbihhcnIsIHNMZW4pIHtcbiAgICB2YXIgbmV3QXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbmV3QXJyLnB1c2goYXJyW2ldLnN1YnN0cigwLCBzTGVuKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdBcnI7XG4gIH1cblxuICBmdW5jdGlvbiBtb250aFVwZGF0ZShhcnJOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCB2LCBpMThuKSB7XG4gICAgICB2YXIgaW5kZXggPSBpMThuW2Fyck5hbWVdLmluZGV4T2Yodi5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHYuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKH5pbmRleCkge1xuICAgICAgICBkLm1vbnRoID0gaW5kZXg7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhZCh2YWwsIGxlbikge1xuICAgIHZhbCA9IFN0cmluZyh2YWwpO1xuICAgIGxlbiA9IGxlbiB8fCAyO1xuICAgIHdoaWxlICh2YWwubGVuZ3RoIDwgbGVuKSB7XG4gICAgICB2YWwgPSAnMCcgKyB2YWw7XG4gICAgfVxuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICB2YXIgZGF5TmFtZXMgPSBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J107XG4gIHZhciBtb250aE5hbWVzID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG4gIHZhciBtb250aE5hbWVzU2hvcnQgPSBzaG9ydGVuKG1vbnRoTmFtZXMsIDMpO1xuICB2YXIgZGF5TmFtZXNTaG9ydCA9IHNob3J0ZW4oZGF5TmFtZXMsIDMpO1xuICBmZWNoYS5pMThuID0ge1xuICAgIGRheU5hbWVzU2hvcnQ6IGRheU5hbWVzU2hvcnQsXG4gICAgZGF5TmFtZXM6IGRheU5hbWVzLFxuICAgIG1vbnRoTmFtZXNTaG9ydDogbW9udGhOYW1lc1Nob3J0LFxuICAgIG1vbnRoTmFtZXM6IG1vbnRoTmFtZXMsXG4gICAgYW1QbTogWydhbScsICdwbSddLFxuICAgIERvRm46IGZ1bmN0aW9uIERvRm4oRCkge1xuICAgICAgcmV0dXJuIEQgKyBbJ3RoJywgJ3N0JywgJ25kJywgJ3JkJ11bRCAlIDEwID4gMyA/IDAgOiAoRCAtIEQgJSAxMCAhPT0gMTApICogRCAlIDEwXTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGZvcm1hdEZsYWdzID0ge1xuICAgIEQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldERhdGUoKTtcbiAgICB9LFxuICAgIEREOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0RGF0ZSgpKTtcbiAgICB9LFxuICAgIERvOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5Eb0ZuKGRhdGVPYmouZ2V0RGF0ZSgpKTtcbiAgICB9LFxuICAgIGQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldERheSgpO1xuICAgIH0sXG4gICAgZGQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXREYXkoKSk7XG4gICAgfSxcbiAgICBkZGQ6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLmRheU5hbWVzU2hvcnRbZGF0ZU9iai5nZXREYXkoKV07XG4gICAgfSxcbiAgICBkZGRkOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5kYXlOYW1lc1tkYXRlT2JqLmdldERheSgpXTtcbiAgICB9LFxuICAgIE06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldE1vbnRoKCkgKyAxO1xuICAgIH0sXG4gICAgTU06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNb250aCgpICsgMSk7XG4gICAgfSxcbiAgICBNTU06IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLm1vbnRoTmFtZXNTaG9ydFtkYXRlT2JqLmdldE1vbnRoKCldO1xuICAgIH0sXG4gICAgTU1NTTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4ubW9udGhOYW1lc1tkYXRlT2JqLmdldE1vbnRoKCldO1xuICAgIH0sXG4gICAgWVk6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBTdHJpbmcoZGF0ZU9iai5nZXRGdWxsWWVhcigpKS5zdWJzdHIoMik7XG4gICAgfSxcbiAgICBZWVlZOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRGdWxsWWVhcigpO1xuICAgIH0sXG4gICAgaDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKSAlIDEyIHx8IDEyO1xuICAgIH0sXG4gICAgaGg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRIb3VycygpICUgMTIgfHwgMTIpO1xuICAgIH0sXG4gICAgSDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKTtcbiAgICB9LFxuICAgIEhIOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0SG91cnMoKSk7XG4gICAgfSxcbiAgICBtOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRNaW51dGVzKCk7XG4gICAgfSxcbiAgICBtbTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1pbnV0ZXMoKSk7XG4gICAgfSxcbiAgICBzOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRTZWNvbmRzKCk7XG4gICAgfSxcbiAgICBzczogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldFNlY29uZHMoKSk7XG4gICAgfSxcbiAgICBTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpIC8gMTAwKTtcbiAgICB9LFxuICAgIFNTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKE1hdGgucm91bmQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSAvIDEwKSwgMik7XG4gICAgfSxcbiAgICBTU1M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSwgMyk7XG4gICAgfSxcbiAgICBhOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpIDwgMTIgPyBpMThuLmFtUG1bMF0gOiBpMThuLmFtUG1bMV07XG4gICAgfSxcbiAgICBBOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpIDwgMTIgPyBpMThuLmFtUG1bMF0udG9VcHBlckNhc2UoKSA6IGkxOG4uYW1QbVsxXS50b1VwcGVyQ2FzZSgpO1xuICAgIH0sXG4gICAgWlo6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHZhciBvID0gZGF0ZU9iai5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgcmV0dXJuIChvID4gMCA/ICctJyA6ICcrJykgKyBwYWQoTWF0aC5mbG9vcihNYXRoLmFicyhvKSAvIDYwKSAqIDEwMCArIE1hdGguYWJzKG8pICUgNjAsIDQpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgcGFyc2VGbGFncyA9IHtcbiAgICBEOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5kYXkgPSB2O1xuICAgIH1dLFxuICAgIERvOiBbbmV3IFJlZ0V4cCh0d29EaWdpdHMuc291cmNlICsgd29yZC5zb3VyY2UpLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5kYXkgPSBwYXJzZUludCh2LCAxMCk7XG4gICAgfV0sXG4gICAgTTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubW9udGggPSB2IC0gMTtcbiAgICB9XSxcbiAgICBZWTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIHZhciBkYSA9IG5ldyBEYXRlKCksIGNlbnQgPSArKCcnICsgZGEuZ2V0RnVsbFllYXIoKSkuc3Vic3RyKDAsIDIpO1xuICAgICAgZC55ZWFyID0gJycgKyAodiA+IDY4ID8gY2VudCAtIDEgOiBjZW50KSArIHY7XG4gICAgfV0sXG4gICAgaDogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuaG91ciA9IHY7XG4gICAgfV0sXG4gICAgbTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWludXRlID0gdjtcbiAgICB9XSxcbiAgICBzOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5zZWNvbmQgPSB2O1xuICAgIH1dLFxuICAgIFlZWVk6IFtmb3VyRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC55ZWFyID0gdjtcbiAgICB9XSxcbiAgICBTOiBbL1xcZC8sIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdiAqIDEwMDtcbiAgICB9XSxcbiAgICBTUzogWy9cXGR7Mn0vLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHYgKiAxMDtcbiAgICB9XSxcbiAgICBTU1M6IFt0aHJlZURpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2O1xuICAgIH1dLFxuICAgIGQ6IFt0d29EaWdpdHMsIG5vb3BdLFxuICAgIGRkZDogW3dvcmQsIG5vb3BdLFxuICAgIE1NTTogW3dvcmQsIG1vbnRoVXBkYXRlKCdtb250aE5hbWVzU2hvcnQnKV0sXG4gICAgTU1NTTogW3dvcmQsIG1vbnRoVXBkYXRlKCdtb250aE5hbWVzJyldLFxuICAgIGE6IFt3b3JkLCBmdW5jdGlvbiAoZCwgdiwgaTE4bikge1xuICAgICAgdmFyIHZhbCA9IHYudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICh2YWwgPT09IGkxOG4uYW1QbVswXSkge1xuICAgICAgICBkLmlzUG0gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAodmFsID09PSBpMThuLmFtUG1bMV0pIHtcbiAgICAgICAgZC5pc1BtID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XSxcbiAgICBaWjogWy9bXFwrXFwtXVxcZFxcZDo/XFxkXFxkLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIHZhciBwYXJ0cyA9ICh2ICsgJycpLm1hdGNoKC8oW1xcK1xcLV18XFxkXFxkKS9naSksIG1pbnV0ZXM7XG5cbiAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICBtaW51dGVzID0gKyhwYXJ0c1sxXSAqIDYwKSArIHBhcnNlSW50KHBhcnRzWzJdLCAxMCk7XG4gICAgICAgIGQudGltZXpvbmVPZmZzZXQgPSBwYXJ0c1swXSA9PT0gJysnID8gbWludXRlcyA6IC1taW51dGVzO1xuICAgICAgfVxuICAgIH1dXG4gIH07XG4gIHBhcnNlRmxhZ3MuZGQgPSBwYXJzZUZsYWdzLmQ7XG4gIHBhcnNlRmxhZ3MuZGRkZCA9IHBhcnNlRmxhZ3MuZGRkO1xuICBwYXJzZUZsYWdzLkREID0gcGFyc2VGbGFncy5EO1xuICBwYXJzZUZsYWdzLm1tID0gcGFyc2VGbGFncy5tO1xuICBwYXJzZUZsYWdzLmhoID0gcGFyc2VGbGFncy5IID0gcGFyc2VGbGFncy5ISCA9IHBhcnNlRmxhZ3MuaDtcbiAgcGFyc2VGbGFncy5NTSA9IHBhcnNlRmxhZ3MuTTtcbiAgcGFyc2VGbGFncy5zcyA9IHBhcnNlRmxhZ3MucztcbiAgcGFyc2VGbGFncy5BID0gcGFyc2VGbGFncy5hO1xuXG5cbiAgLy8gU29tZSBjb21tb24gZm9ybWF0IHN0cmluZ3NcbiAgZmVjaGEubWFza3MgPSB7XG4gICAgJ2RlZmF1bHQnOiAnZGRkIE1NTSBERCBZWVlZIEhIOm1tOnNzJyxcbiAgICBzaG9ydERhdGU6ICdNL0QvWVknLFxuICAgIG1lZGl1bURhdGU6ICdNTU0gRCwgWVlZWScsXG4gICAgbG9uZ0RhdGU6ICdNTU1NIEQsIFlZWVknLFxuICAgIGZ1bGxEYXRlOiAnZGRkZCwgTU1NTSBELCBZWVlZJyxcbiAgICBzaG9ydFRpbWU6ICdISDptbScsXG4gICAgbWVkaXVtVGltZTogJ0hIOm1tOnNzJyxcbiAgICBsb25nVGltZTogJ0hIOm1tOnNzLlNTUydcbiAgfTtcblxuICAvKioqXG4gICAqIEZvcm1hdCBhIGRhdGVcbiAgICogQG1ldGhvZCBmb3JtYXRcbiAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gZGF0ZU9ialxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWFzayBGb3JtYXQgb2YgdGhlIGRhdGUsIGkuZS4gJ21tLWRkLXl5JyBvciAnc2hvcnREYXRlJ1xuICAgKi9cbiAgZmVjaGEuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGVPYmosIG1hc2ssIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGRhdGVPYmogPT09ICdudW1iZXInKSB7XG4gICAgICBkYXRlT2JqID0gbmV3IERhdGUoZGF0ZU9iaik7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRlT2JqKSAhPT0gJ1tvYmplY3QgRGF0ZV0nIHx8IGlzTmFOKGRhdGVPYmouZ2V0VGltZSgpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIERhdGUgaW4gZmVjaGEuZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgbWFzayA9IGZlY2hhLm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZmVjaGEubWFza3NbJ2RlZmF1bHQnXTtcblxuICAgIHZhciBsaXRlcmFscyA9IFtdO1xuXG4gICAgLy8gTWFrZSBsaXRlcmFscyBpbmFjdGl2ZSBieSByZXBsYWNpbmcgdGhlbSB3aXRoID8/XG4gICAgbWFzayA9IG1hc2sucmVwbGFjZShsaXRlcmFsLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICAgIGxpdGVyYWxzLnB1c2goJDEpO1xuICAgICAgcmV0dXJuICc/Pyc7XG4gICAgfSk7XG4gICAgLy8gQXBwbHkgZm9ybWF0dGluZyBydWxlc1xuICAgIG1hc2sgPSBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uICgkMCkge1xuICAgICAgcmV0dXJuICQwIGluIGZvcm1hdEZsYWdzID8gZm9ybWF0RmxhZ3NbJDBdKGRhdGVPYmosIGkxOG4pIDogJDAuc2xpY2UoMSwgJDAubGVuZ3RoIC0gMSk7XG4gICAgfSk7XG4gICAgLy8gSW5saW5lIGxpdGVyYWwgdmFsdWVzIGJhY2sgaW50byB0aGUgZm9ybWF0dGVkIHZhbHVlXG4gICAgcmV0dXJuIG1hc2sucmVwbGFjZSgvXFw/XFw/L2csIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxpdGVyYWxzLnNoaWZ0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgZGF0ZSBzdHJpbmcgaW50byBhbiBvYmplY3QsIGNoYW5nZXMgLSBpbnRvIC9cbiAgICogQG1ldGhvZCBwYXJzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0ZVN0ciBEYXRlIHN0cmluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IERhdGUgcGFyc2UgZm9ybWF0XG4gICAqIEByZXR1cm5zIHtEYXRlfGJvb2xlYW59XG4gICAqL1xuICBmZWNoYS5wYXJzZSA9IGZ1bmN0aW9uIChkYXRlU3RyLCBmb3JtYXQsIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGZvcm1hdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmb3JtYXQgaW4gZmVjaGEucGFyc2UnKTtcbiAgICB9XG5cbiAgICBmb3JtYXQgPSBmZWNoYS5tYXNrc1tmb3JtYXRdIHx8IGZvcm1hdDtcblxuICAgIC8vIEF2b2lkIHJlZ3VsYXIgZXhwcmVzc2lvbiBkZW5pYWwgb2Ygc2VydmljZSwgZmFpbCBlYXJseSBmb3IgcmVhbGx5IGxvbmcgc3RyaW5nc1xuICAgIC8vIGh0dHBzOi8vd3d3Lm93YXNwLm9yZy9pbmRleC5waHAvUmVndWxhcl9leHByZXNzaW9uX0RlbmlhbF9vZl9TZXJ2aWNlXy1fUmVEb1NcbiAgICBpZiAoZGF0ZVN0ci5sZW5ndGggPiAxMDAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuICAgIHZhciBkYXRlSW5mbyA9IHt9O1xuICAgIGZvcm1hdC5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgIGlmIChwYXJzZUZsYWdzWyQwXSkge1xuICAgICAgICB2YXIgaW5mbyA9IHBhcnNlRmxhZ3NbJDBdO1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRlU3RyLnNlYXJjaChpbmZvWzBdKTtcbiAgICAgICAgaWYgKCF+aW5kZXgpIHtcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0ZVN0ci5yZXBsYWNlKGluZm9bMF0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGluZm9bMV0oZGF0ZUluZm8sIHJlc3VsdCwgaTE4bik7XG4gICAgICAgICAgICBkYXRlU3RyID0gZGF0ZVN0ci5zdWJzdHIoaW5kZXggKyByZXN1bHQubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnNlRmxhZ3NbJDBdID8gJycgOiAkMC5zbGljZSgxLCAkMC5sZW5ndGggLSAxKTtcbiAgICB9KTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgaWYgKGRhdGVJbmZvLmlzUG0gPT09IHRydWUgJiYgZGF0ZUluZm8uaG91ciAhPSBudWxsICYmICtkYXRlSW5mby5ob3VyICE9PSAxMikge1xuICAgICAgZGF0ZUluZm8uaG91ciA9ICtkYXRlSW5mby5ob3VyICsgMTI7XG4gICAgfSBlbHNlIGlmIChkYXRlSW5mby5pc1BtID09PSBmYWxzZSAmJiArZGF0ZUluZm8uaG91ciA9PT0gMTIpIHtcbiAgICAgIGRhdGVJbmZvLmhvdXIgPSAwO1xuICAgIH1cblxuICAgIHZhciBkYXRlO1xuICAgIGlmIChkYXRlSW5mby50aW1lem9uZU9mZnNldCAhPSBudWxsKSB7XG4gICAgICBkYXRlSW5mby5taW51dGUgPSArKGRhdGVJbmZvLm1pbnV0ZSB8fCAwKSAtICtkYXRlSW5mby50aW1lem9uZU9mZnNldDtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhkYXRlSW5mby55ZWFyIHx8IHRvZGF5LmdldEZ1bGxZZWFyKCksIGRhdGVJbmZvLm1vbnRoIHx8IDAsIGRhdGVJbmZvLmRheSB8fCAxLFxuICAgICAgICBkYXRlSW5mby5ob3VyIHx8IDAsIGRhdGVJbmZvLm1pbnV0ZSB8fCAwLCBkYXRlSW5mby5zZWNvbmQgfHwgMCwgZGF0ZUluZm8ubWlsbGlzZWNvbmQgfHwgMCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRlID0gbmV3IERhdGUoZGF0ZUluZm8ueWVhciB8fCB0b2RheS5nZXRGdWxsWWVhcigpLCBkYXRlSW5mby5tb250aCB8fCAwLCBkYXRlSW5mby5kYXkgfHwgMSxcbiAgICAgICAgZGF0ZUluZm8uaG91ciB8fCAwLCBkYXRlSW5mby5taW51dGUgfHwgMCwgZGF0ZUluZm8uc2Vjb25kIHx8IDAsIGRhdGVJbmZvLm1pbGxpc2Vjb25kIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZTtcbiAgfTtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZlY2hhO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZmVjaGE7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbWFpbi5mZWNoYSA9IGZlY2hhO1xuICB9XG59KSh0aGlzKTtcbiIsImV4cG9ydHMuZGVidWcgPSBmYWxzZTtcclxuZXhwb3J0cy5jb3JlRGVmYXVsdHMgPSB7XHJcbiAgICB0aGVtZTogJ2RlZmF1bHQnLFxyXG4gICAgbGFuZ3VhZ2U6ICdlbidcclxufTtcclxuIiwiY29uc3QgZmVjaGEgPSByZXF1aXJlKCdmZWNoYScpO1xyXG5cclxuY29uc3QgREFURV9HRVJNQU4gPSAnZ2VybWFuJztcclxuY29uc3QgREFURV9FTkdMSVNIID0gJ2VuZ2xpc2gnO1xyXG5jb25zdCBEQVRFX0kxOE4gPSB7XHJcbiAgICBbREFURV9HRVJNQU5dOiB7XHJcbiAgICAgICAgZGF5TmFtZXNTaG9ydDogWydTbycsICdNbycsICdEaScsICdNaScsICdEbycsICdGcicsICdTYSddLFxyXG4gICAgICAgIGRheU5hbWVzOiBbJ1Nvbm50YWcnLCAnTW9udGFnJywgJ0RpZW5zdGFnJywgJ01pdHR3b2NoJywgJ0Rvbm5lcnN0YWcnLCAnRnJlaXRhZycsICdTYW1zdGFnJ10sXHJcbiAgICAgICAgbW9udGhOYW1lc1Nob3J0OiBbJ0phbicsICdGZWInLCAnTcOkcicsICdBcHInLCAnTWFpJywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPa3QnLCAnTm92JywgJ0RleiddLFxyXG4gICAgICAgIG1vbnRoTmFtZXM6IFsnSmFudWFyJywgJ0ZlYnJ1YXInLCAnTcOkcnonLCAnQXByaWwnLCAnTWFpJywgJ0p1bmknLCAnSnVsaScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09rdG9iZXInLCAnTm92ZW1iZXInLCAnRGV6ZW1iZXInXSxcclxuICAgICAgICBhbVBtOiBbJ2FtJywgJ3BtJ10sXHJcbiAgICAgICAgLy8gRCBpcyB0aGUgZGF5IG9mIHRoZSBtb250aCwgZnVuY3Rpb24gcmV0dXJucyBzb21ldGhpbmcgbGlrZS4uLiAgM3JkIG9yIDExdGhcclxuICAgICAgICBEb0ZuOiBmdW5jdGlvbiAoRCkge1xyXG4gICAgICAgICAgICByZXR1cm4gRCArICcuJztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgW0RBVEVfRU5HTElTSF06IHtcclxuICAgICAgICBkYXlOYW1lc1Nob3J0OiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHVyJywgJ0ZyaScsICdTYXQnXSxcclxuICAgICAgICBkYXlOYW1lczogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxyXG4gICAgICAgIG1vbnRoTmFtZXNTaG9ydDogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddLFxyXG4gICAgICAgIG1vbnRoTmFtZXM6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLFxyXG4gICAgICAgIGFtUG06IFsnYW0nLCAncG0nXSxcclxuICAgICAgICAvLyBEIGlzIHRoZSBkYXkgb2YgdGhlIG1vbnRoLCBmdW5jdGlvbiByZXR1cm5zIHNvbWV0aGluZyBsaWtlLi4uICAzcmQgb3IgMTF0aFxyXG4gICAgICAgIERvRm46IGZ1bmN0aW9uIChEKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBEICsgWyAndGgnLCAnc3QnLCAnbmQnLCAncmQnIF1bIEQgJSAxMCA+IDMgPyAwIDogKEQgLSBEICUgMTAgIT09IDEwKSAqIEQgJSAxMCBdO1xyXG4gICAgICAgIH1cclxuICAgIH0gIFxyXG59O1xyXG5jb25zdCBEQVRFX0ZPUk1BVFMgPSB7XHJcbiAgICBbREFURV9HRVJNQU5dOiBbXHJcbiAgICAgICAgJ01NLkRELllZWVknLFxyXG4gICAgICAgICdNTS5ERC5ZWSdcclxuICAgIF0sXHJcbiAgICBbREFURV9FTkdMSVNIXTogW1xyXG4gICAgICAgICdZWVlZLU1NLUREJyxcclxuICAgICAgICAnTU0vREQvWVlZWSdcclxuICAgIF1cclxufTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGZlY2hhLFxyXG4gICAgREFURV9HRVJNQU4sXHJcbiAgICBEQVRFX0VOR0xJU0gsXHJcbiAgICBEQVRFX0kxOE4sXHJcbiAgICBEQVRFX0ZPUk1BVFNcclxufVxyXG4iLCJjb25zdCB7ZXh0ZW5kLCB3YXJufSA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcclxuXHJcbi8qXHJcbiAqICAgIExpc3Qgb2YgYWxsIHZhbHVlcyB0aGF0IGNhbiBiZSBzZXRcclxuICovXHJcbmxldCBkZWZhdWx0cyA9IHtcclxuICAgIEZJTFRFUl9QTEFDRUhPTERFUjogJ3R5cGUgZmlsdGVyIGhlcmUnLFxyXG4gICAgRklMVEVSX0NBU0VTRU5TSVRJVkU6ICdjYXNlLXNlbnNpdGl2ZSdcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTGFuZ3VhZ2Uge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlkZW50aWZpZXIsIGxhbmd1YWdlUGFjaykge1xyXG4gICAgICAgIHRoaXMuaWRlbnRpZmllciA9IGlkZW50aWZpZXI7XHJcbiAgICAgICAgdGhpcy50ZXJtcyA9IGV4dGVuZChkZWZhdWx0cywgbGFuZ3VhZ2VQYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQodGVybSkge1xyXG4gICAgICAgIGlmICh0aGlzLnRlcm1zLmhhc093blByb3BlcnR5KHRlcm0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRlcm1zW3Rlcm1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3YXJuKCd0ZXJtICcgKyB0ZXJtICsgJyBub3QgZGVmaW5lZCcpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59O1xyXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5jb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIGluZm8sIGVycm9yLCByZXBsYWNlSWRzV2l0aEluZGljZXN9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAgICBuYW1lOiBcImNvbHVtblN0eWxlc1wiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgYWxsOiB7fVxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMuY29udGFpbmVyLCAndG0tY29sdW1uLXN0eWxlcycpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lcklkID0gdGhpcy5jb250YWluZXJJZDtcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSByZXBsYWNlSWRzV2l0aEluZGljZXMoc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gc3R5bGUgZ2VuZXJhbFxyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IGBkaXYjJHtjb250YWluZXJJZH0gdGFibGUgdHIgPiAqIHtgO1xyXG4gICAgICAgICAgICBpdGVyYXRlKHNldHRpbmdzLmFsbCwgZnVuY3Rpb24ocHJvcCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRleHQgKz0gYCR7cHJvcH06ICR7dmFsdWV9O2A7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0ICs9ICd9JztcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBjdXN0b20gc3R5bGVzIHRvIHRoZSBzaW5nbGUgY29sdW1uc1xyXG4gICAgICAgICAgICBpdGVyYXRlKHNldHRpbmdzLCBmdW5jdGlvbihpbmRleCwgY3NzU3R5bGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09ICdhbGwnKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IHBhcnNlSW50KGluZGV4KSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGV4dCArPSBgZGl2IyR7Y29udGFpbmVySWR9IHRhYmxlIHRyID4gKjpudGgtb2YtdHlwZSgke2l9KSB7YDtcclxuICAgICAgICAgICAgICAgIGl0ZXJhdGUoY3NzU3R5bGVzLCBmdW5jdGlvbihwcm9wLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gYCR7cHJvcH06ICR7dmFsdWV9O2A7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRleHQgKz0gJ30nO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmRTdHlsZXModGV4dCk7XHJcbiAgICAgICAgICAgIGluZm8oJ21vZHVsZSBjb2x1bW5TdHlsZXMgbG9hZGVkJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdW5zZXQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBubyBpbXBsZW1lbnRhdGlvbiBuZWVkZWRcclxuICAgICAgICAgICAgICAgICAgICBpbmZvKCd1bnNldHRpbmcgY29sdW1uU3R5bGVzJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIGluZm8sIGVycm9yLCB0cmlnZ2VyLCByZXBsYWNlSWRzV2l0aEluZGljZXN9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuY29uc3QgTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGUuanMnKTtcclxuY29uc3QgRklMVEVSX0hFSUdIVCA9ICczMHB4JztcclxuXHJcbi8qKlxyXG4gICAgRmFjdG9yeSBjbGFzcyB0byBwcm9kdWNlIGZpbHRlciBjZWxsc1xyXG4qL1xyXG5jbGFzcyBDZWxsRmFjdG9yeSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0bSkge1xyXG4gICAgICAgIGxldCBwbGFjZWhvbGRlciA9IHRtLmdldFRlcm0oJ0ZJTFRFUl9QTEFDRUhPTERFUicpLFxyXG4gICAgICAgICAgICBjYXNlU2Vuc2l0aXZlID0gdG0uZ2V0VGVybSgnRklMVEVSX0NBU0VTRU5TSVRJVkUnKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgdGhpcy5jZWxsLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPSd0bS1pbnB1dC1kaXYnPjxpbnB1dCB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0nJHtwbGFjZWhvbGRlcn0nIC8+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSd0bS1jdXN0b20tY2hlY2tib3gnIHRpdGxlPScke2Nhc2VTZW5zaXRpdmV9Jz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdjaGVja2JveCcgdmFsdWU9JzEnIG5hbWU9J2NoZWNrYm94JyAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj0nY2hlY2tib3gnPjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5gO1xyXG4gICAgfVxyXG5cclxuICAgIHByb2R1Y2UoZW5hYmxlZCA9IHRydWUsIGNhc2VTZW5zaXRpdmUgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKCFlbmFibGVkKSByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICBsZXQgcmV0ID0gdGhpcy5jZWxsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICBpZiAoIWNhc2VTZW5zaXRpdmUpIHJldC5yZW1vdmVDaGlsZChyZXQubGFzdENoaWxkKTsgLy8gcmVtb3ZlIGN1c3RvbSBjaGVja2JveFxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGwoZSkge1xyXG4gICAgbGV0IGNlbGwgPSBlLnRhcmdldDtcclxuICAgIHdoaWxlIChjZWxsLmNlbGxJbmRleCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY2VsbCA9IGNlbGwucGFyZW50Tm9kZTtcclxuICAgIH1cclxuICAgIHJldHVybiBjZWxsO1xyXG59XHJcblxyXG4vLyBwcm90b3R5cGUgZm9yIEZpbHRlclxyXG5jbGFzcyBGaWx0ZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRtLCBzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMudG0gPSB0bTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmRpY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5wYXR0ZXJucyA9IFtdO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IFtdO1xyXG5cclxuICAgICAgICBzZXR0aW5ncy5jb2x1bW5zID0gcmVwbGFjZUlkc1dpdGhJbmRpY2VzKHNldHRpbmdzLmNvbHVtbnMpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICAvLyBzZXR0ZXJzXHJcbiAgICBzZXRQYXR0ZXJucyhwYXR0ZXJucykge1xyXG4gICAgICAgIHRoaXMucGF0dGVybnMgPSBwYXR0ZXJucztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldEluZGljZXMoaW5kaWNlcykge1xyXG4gICAgICAgIHRoaXMuaW5kaWNlcyA9IGluZGljZXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy8gZ2V0dGVyc1xyXG4gICAgZ2V0UGF0dGVybnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0dGVybnM7XHJcbiAgICB9XHJcbiAgICBnZXRJbmRpY2VzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGljZXM7XHJcbiAgICB9XHJcbiAgICBnZXRPcHRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgYW55RmlsdGVyQWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhdHRlcm5zKCkubGVuZ3RoICE9PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElzRW5hYmxlZChpKSB7cmV0dXJuIHRoaXMuZ2V0Q29sdW1uU2V0dGluZyhpLCAnZW5hYmxlZCcpO31cclxuICAgIGdldElzQ2FzZVNlbnNpdGl2ZShpKSB7cmV0dXJuIHRoaXMuZ2V0Q29sdW1uU2V0dGluZyhpLCAnY2FzZVNlbnNpdGl2ZScpO31cclxuXHJcbiAgICBnZXRDb2x1bW5TZXR0aW5nKGksIHNldHRpbmcpIHtcclxuICAgICAgICBsZXQgY29scyA9IHRoaXMuc2V0dGluZ3MuY29sdW1ucztcclxuICAgICAgICBpZiAoY29scy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBjb2xzW2ldLmhhc093blByb3BlcnR5KHNldHRpbmcpKSB7XHJcbiAgICAgICAgICAgIC8vIGEgY3VzdG9tIHZhbHVlIHdhcyBzZXRcclxuICAgICAgICAgICAgcmV0dXJuIGNvbHNbaV1bc2V0dGluZ107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xzLmFsbFtzZXR0aW5nXTtcclxuICAgIH1cclxuXHJcbiAgICBmaWx0ZXIoKSB7XHJcbiAgICAgICAgbGV0IGluZGljZXMgPSB0aGlzLmdldEluZGljZXMoKSxcclxuICAgICAgICAgICAgcGF0dGVybnMgPSB0aGlzLmdldFBhdHRlcm5zKCksXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4RGVwaCA9IGluZGljZXMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgLy8gZmlsdGVyIHJvd3NcclxuICAgICAgICBsZXQgYXJyID0gdGhpcy50bS5nZXRBbGxSb3dzKCkuZmlsdGVyKGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgICAgICBsZXQgZGVwaCA9IDAsIG1hdGNoZXMgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKG1hdGNoZXMgJiYgZGVwaCA8PSBtYXhEZXBoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IGluZGljZXNbZGVwaF0sXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm5zW2RlcGhdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RlciA9IHJvdy5jZWxsc1tpXS5pbm5lckhUTUw7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zW2RlcGhdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90IGNhc2Utc2Vuc2l0aXZlXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXN0ZXIgPSB0ZXN0ZXIudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVzID0gdGVzdGVyLmluZGV4T2YocGF0dGVybikgIT09IC0xO1xyXG4gICAgICAgICAgICAgICAgZGVwaCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG0uc2hvd1Jvd3MoYXJyKTtcclxuICAgIH1cclxufTtcclxuXHJcbmNsYXNzIEZpbHRlckRlZmF1bHQgZXh0ZW5kcyBGaWx0ZXIge1xyXG4gICAgY29uc3RydWN0b3IodG0sIHNldHRpbmdzKSB7XHJcbiAgICAgICAgc3VwZXIodG0sIHNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnRIZWFkID0gdG0uaGVhZCA/IHRtLmhlYWQudEhlYWQgOiB0bS5vcmlnSGVhZDtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIHRoZSB0b29sYmFyIHJvd1xyXG4gICAgICAgIGxldCBudW0gPSB0aGlzLnRIZWFkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzLmxlbmd0aCxcclxuICAgICAgICAgICAgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSxcclxuICAgICAgICAgICAgY2VsbEZhY3RvcnkgPSBuZXcgQ2VsbEZhY3RvcnkodG0pLFxyXG4gICAgICAgICAgICB0aW1lb3V0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbmFibGVkID0gdGhpcy5nZXRJc0VuYWJsZWQoaSk7XHJcbiAgICAgICAgICAgIGxldCBjcyA9IHRoaXMuZ2V0SXNDYXNlU2Vuc2l0aXZlKGkpO1xyXG5cclxuICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGxGYWN0b3J5LnByb2R1Y2UoZW5hYmxlZCwgY3MpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYWRkQ2xhc3Mocm93LCAndG0tZmlsdGVyLXJvdycpO1xyXG5cclxuICAgICAgICBpZiAoc2V0dGluZ3MuYXV0b0NvbGxhcHNlKXtcclxuICAgICAgICAgICAgLy8ga2VlcCBmaWx0ZXIgcm93IHZpc2libGUgaWYgYW4gaW5wdXQgaXMgZm9jdXNlZFxyXG4gICAgICAgICAgICBbXS5zbGljZS5jYWxsKHJvdy5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpKS5mb3JFYWNoKChpbnB1dCkgPT4geyAvLyBpdCBzZWVtcyBsaWtlIGluIElFMTEgLmZvckVhY2ggb25seSB3b3JrcyBvbiByZWFsIGFycmF5c1xyXG4gICAgICAgICAgICAgICAgaW5wdXQub25mb2N1cyA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LnN0eWxlLmhlaWdodCA9IEZJTFRFUl9IRUlHSFQ7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaW5wdXQub25ibHVyID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByb3cuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2hlaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcm93LnN0eWxlLmhlaWdodCA9IEZJTFRFUl9IRUlHSFQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnNcclxuICAgICAgICByb3cub25rZXl1cCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW4oKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm93Lm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjZWxsID0gZ2V0Q2VsbChlKSxcclxuICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZS50YXJnZXQ7XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdTUEFOJyB8fCB0YXJnZXQubm9kZU5hbWUgPT0gJ0xBQkVMJykge1xyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2tib3ggY2xpY2tcclxuICAgICAgICAgICAgICAgIGxldCBjaGVja2JveCA9IGNlbGwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1jaGVja2JveF0nKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhY2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm93Lm9uY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdG0uYm9keS5hZGRFdmVudExpc3RlbmVyKCd0bVJvd3NBZGRlZCcsICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYW55RmlsdGVyQWN0aXZlKCkpIHRoaXMucnVuKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGluc2VydCB0b29sYmFyIHJvdyBpbnRvIHRIZWFkXHJcbiAgICAgICAgdGhpcy50SGVhZC5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bigpIHtcclxuICAgICAgICBjb25zdCBmaWx0ZXJDZWxscyA9IFtdLnNsaWNlLmNhbGwodGhpcy50SGVhZC5xdWVyeVNlbGVjdG9yKCd0ci50bS1maWx0ZXItcm93JykuY2VsbHMpO1xyXG4gICAgICAgIGxldCBwYXR0ZXJucyA9IFtdLCBpbmRpY2VzID0gW10sIG9wdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgaXRlcmF0ZShmaWx0ZXJDZWxscywgZnVuY3Rpb24oaSwgY2VsbCkge1xyXG4gICAgICAgICAgICBsZXQgaW5wdXQgPSBjZWxsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9dGV4dF0nKTtcclxuICAgICAgICAgICAgbGV0IGNoZWNrYm94ID0gY2VsbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LnZhbHVlLnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChpKTtcclxuICAgICAgICAgICAgICAgIHBhdHRlcm5zLnB1c2goaW5wdXQudmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChjaGVja2JveCkgb3B0aW9ucy5wdXNoKGNoZWNrYm94LmNoZWNrZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGF0dGVybnMocGF0dGVybnMpXHJcbiAgICAgICAgICAgIC5zZXRJbmRpY2VzKGluZGljZXMpXHJcbiAgICAgICAgICAgIC5zZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy50bS5zaWduYWwoJ3RtU29ydGVyU29ydEFnYWluJywgJ3RtRml4ZWRGb3JjZVJlbmRlcmluZycpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kdWxlKHtcclxuICAgIG5hbWU6IFwiZmlsdGVyXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICBhdXRvQ29sbGFwc2U6IHRydWUsXHJcbiAgICAgICAgY29sdW1uczoge1xyXG4gICAgICAgICAgICBhbGw6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjYXNlU2Vuc2l0aXZlOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZXI6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgLy8gdGhpcyA6PSBUYWJsZW1vZGlmeS1pbnN0YW5jZVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMuY29udGFpbmVyLCAndG0tZmlsdGVyJyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW5zdGFuY2UgPSBuZXcgRmlsdGVyRGVmYXVsdCh0aGlzLCBzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgZmlsdGVyIGxvYWRlZCcpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZSxcclxuICAgICAgICAgICAgICAgIHVuc2V0OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5mbygndW5zZXR0aW5nIGZpbHRlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBhbGwgZmlsdGVycztcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dBbGxSb3dzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5jb25zdCB7aW5QeCwgaXRlcmF0ZSwgc2V0Q3NzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsXHJcbiAgICAgICBnZXRDc3MsIGdldFNjcm9sbGJhcldpZHRoLCBpbmZvLCBlcnJvcn0gPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kdWxlKHtcclxuICAgIG5hbWU6IFwiZml4ZWRcIixcclxuICAgIGRlZmF1bHRTZXR0aW5nczoge1xyXG4gICAgICAgIGZpeEhlYWRlcjpmYWxzZSxcclxuICAgICAgICBmaXhGb290ZXI6ZmFsc2VcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplcjogZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAvLyBzZXQgdXBcclxuICAgICAgICBsZXQgaGVhZCxcclxuICAgICAgICAgICAgZm9vdCxcclxuICAgICAgICAgICAgaGVhZFdyYXAsXHJcbiAgICAgICAgICAgIGZvb3RXcmFwLFxyXG4gICAgICAgICAgICBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcixcclxuICAgICAgICAgICAgYm9keSA9IHRoaXMuYm9keSxcclxuICAgICAgICAgICAgYm9keVdyYXAgPSB0aGlzLmJvZHlXcmFwLFxyXG4gICAgICAgICAgICBvcmlnSGVhZCA9IHRoaXMub3JpZ0hlYWQsXHJcbiAgICAgICAgICAgIG9yaWdGb290ID0gdGhpcy5vcmlnRm9vdCxcclxuICAgICAgICAgICAgc2Nyb2xsYmFyV2lkdGggPSBnZXRTY3JvbGxiYXJXaWR0aCgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRIZWFkZXJIZWlnaHQoKSB7IHJldHVybiBvcmlnSGVhZC5jbGllbnRIZWlnaHQ7fTtcclxuICAgICAgICBmdW5jdGlvbiBnZXRGb290ZXJIZWlnaHQoKSB7IHJldHVybiBvcmlnRm9vdC5jbGllbnRIZWlnaHQ7fTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVuZGVySGVhZCgpIHtcclxuICAgICAgICAgICAgaWYoIWhlYWQpIHJldHVybjtcclxuICAgICAgICAgICAgdmFyIGFsbE5ldyA9IFtdLnNsaWNlLmNhbGwoaGVhZC5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscyksXHJcbiAgICAgICAgICAgICAgICBhbGxPbGQgPSBbXS5zbGljZS5jYWxsKG9yaWdIZWFkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzKTtcclxuICAgICAgICAgICAgYm9keS5zdHlsZS5tYXJnaW5Ub3AgPSBpblB4KCctJyArIGdldEhlYWRlckhlaWdodCgpKTsgLy8gaWYgaGVhZGVyIHJlc2l6ZXMgYmVjYXVzZSBvZiBhIHRleHQgd3JhcFxyXG5cclxuICAgICAgICAgICAgaXRlcmF0ZShhbGxOZXcsIGZ1bmN0aW9uKGksIG5ldSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdyA9IGluUHgoYWxsT2xkW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcclxuICAgICAgICAgICAgICAgIG5ldS5zdHlsZS5jc3NUZXh0ID0gYHdpZHRoOiAke3d9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluLXdpZHRoOiAke3d9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4LXdpZHRoOiAke3d9YDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbmRlckZvb3QoKSB7XHJcbiAgICAgICAgICAgIGlmICghZm9vdCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgYWxsTmV3ID0gW10uc2xpY2UuY2FsbChmb290LmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzKSxcclxuICAgICAgICAgICAgICAgIGFsbE9sZCA9IFtdLnNsaWNlLmNhbGwob3JpZ0Zvb3QuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMpO1xyXG5cclxuICAgICAgICAgICAgYm9keVdyYXAuc3R5bGUubWFyZ2luQm90dG9tID0gaW5QeCgnLScgKyAoc2Nyb2xsYmFyV2lkdGggKyBnZXRGb290ZXJIZWlnaHQoKSArIDEpKTsgLy8gaWYgZm9vdGVyIHJlc2l6ZXMgYmVjYXVzZSBvZiBhIHRleHQgd3JhcFxyXG5cclxuICAgICAgICAgICAgaXRlcmF0ZShhbGxOZXcsIGZ1bmN0aW9uKGksIG5ldSl7XHJcbiAgICAgICAgICAgICAgICBsZXQgdyA9IGluUHgoYWxsT2xkW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcclxuICAgICAgICAgICAgICAgIG5ldS5zdHlsZS5jc3NUZXh0ID0gYHdpZHRoOiAke3d9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluLXdpZHRoOiAke3d9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4LXdpZHRoOiAke3d9YDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKGNvbnRhaW5lciwgJ3RtLWZpeGVkJyk7XHJcbiAgICAgICAgICAgIGxldCBib3JkZXJDb2xsYXBzZSA9IGdldENzcyhib2R5LCAnYm9yZGVyLWNvbGxhcHNlJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3JpZ0hlYWQgJiYgc2V0dGluZ3MuZml4SGVhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaGVhZGVySGVpZ2h0ID0gZ2V0SGVhZGVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBoZWFkICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBoZWFkV3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChvcmlnSGVhZC5jbG9uZU5vZGUodHJ1ZSkpO1xyXG4gICAgICAgICAgICAgICAgaGVhZFdyYXAuYXBwZW5kQ2hpbGQoaGVhZCk7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGhlYWRXcmFwLCBib2R5V3JhcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoaGVhZCwgICAgICd0bS1oZWFkJyk7XHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhoZWFkV3JhcCwgJ3RtLWhlYWQtd3JhcCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIGhlYWQuc3R5bGUuYm9yZGVyQ29sbGFwc2UgICA9IGJvcmRlckNvbGxhcHNlO1xyXG4gICAgICAgICAgICAgICAgb3JpZ0hlYWQuc3R5bGUudmlzaWJpbGl0eSAgID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgICAgICBib2R5LnN0eWxlLm1hcmdpblRvcCAgICAgICAgPSBpblB4KCctJyArIGhlYWRlckhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBoZWFkV3JhcC5zdHlsZS5tYXJnaW5SaWdodCAgPSBpblB4KHNjcm9sbGJhcldpZHRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3JpZ0Zvb3QgJiYgc2V0dGluZ3MuZml4Rm9vdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9vdGVySGVpZ2h0ID0gZ2V0Rm9vdGVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBmb290ICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBmb290V3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICAgICAgZm9vdC5hcHBlbmRDaGlsZChvcmlnRm9vdC5jbG9uZU5vZGUodHJ1ZSkpO1xyXG4gICAgICAgICAgICAgICAgZm9vdFdyYXAuYXBwZW5kQ2hpbGQoZm9vdCk7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9vdFdyYXApO1xyXG5cclxuICAgICAgICAgICAgICAgIGFkZENsYXNzKGZvb3QsICAgICAndG0tZm9vdCcpO1xyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoZm9vdFdyYXAsICd0bS1mb290LXdyYXAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBhZGQgRElWcyB0byBvcmlnRm9vdCBjZWxscyBzbyBpdHMgaGVpZ2h0IGNhbiBiZSBzZXQgdG8gMHB4XHJcbiAgICAgICAgICAgICAgICBpdGVyYXRlKG9yaWdGb290LmZpcnN0RWxlbWVudENoaWxkLmNlbGxzLCAoaSwgY2VsbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJ0bS1maXhlZC1oZWxwZXItd3JhcHBlclwiPicgKyBjZWxsLmlubmVySFRNTCArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9vdC5zdHlsZS5ib3JkZXJDb2xsYXBzZSAgID0gYm9yZGVyQ29sbGFwc2U7XHJcbiAgICAgICAgICAgICAgICBvcmlnRm9vdC5zdHlsZS52aXNpYmlsaXR5ICAgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGJvZHlXcmFwLnN0eWxlLm92ZXJmbG93WCAgICA9ICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuc3R5bGUubWFyZ2luQm90dG9tID0gaW5QeCgnLScgKyAoc2Nyb2xsYmFyV2lkdGggKyBmb290ZXJIZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwLnN0eWxlLm1hcmdpblJpZ2h0ICA9IGluUHgoc2Nyb2xsYmFyV2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICAgICAgICAgIGlmIChoZWFkKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVuZGVySGVhZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmb290KSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVuZGVyRm9vdCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG1Sb3dzQWRkZWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJIZWFkKCk7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJGb290KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RtRml4ZWRGb3JjZVJlbmRlcmluZycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlbmRlckhlYWQoKTtcclxuICAgICAgICAgICAgICAgIHJlbmRlckZvb3QoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGVhZCAmJiBmb290KSB7XHJcbiAgICAgICAgICAgICAgICBib2R5V3JhcC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC0nK2JvZHlXcmFwLnNjcm9sbExlZnQrJ3B4KSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb3RXcmFwLnNjcm9sbExlZnQgPSBib2R5V3JhcC5zY3JvbGxMZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9vdFdyYXAuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtJytmb290V3JhcC5zY3JvbGxMZWZ0KydweCknO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5V3JhcC5zY3JvbGxMZWZ0ID0gZm9vdFdyYXAuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGVhZCAmJiAhZm9vdCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGJvZHlXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWQuc3R5bGUubWFyZ2luTGVmdCA9IGluUHgoJy0nICsgYm9keVdyYXAuc2Nyb2xsTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWhlYWQgJiYgZm9vdCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlXcmFwLnNjcm9sbExlZnQgPSBmb290V3JhcC5zY3JvbGxMZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBib2R5V3JhcC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb290V3JhcC5zY3JvbGxMZWZ0ID0gYm9keVdyYXAuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIG7DtnRpZywgd2VpbCBkZXIgQnJvd3NlciB6dW0gcmVuZGVybiBtYW5jaG1hbCBlaW5lIGdld2lzc2UgWmVpdCBicmF1Y2h0XHJcbiAgICAgICAgICAgICAgICByZW5kZXJIZWFkKCk7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJGb290KCk7XHJcbiAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBuw7Z0aWcsIHdlaWwgZGVyIEJyb3dzZXIgenVtIHJlbmRlcm4gbWFuY2htYWwgZWluZSBnZXdpc3NlIFplaXQgYnJhdWNodFxyXG4gICAgICAgICAgICAgICAgcmVuZGVySGVhZCgpO1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyRm9vdCgpO1xyXG4gICAgICAgICAgICB9LCA1MDApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5oZWFkID0gaGVhZDtcclxuICAgICAgICAgICAgdGhpcy5mb290ID0gZm9vdDtcclxuICAgICAgICAgICAgdGhpcy5oZWFkV3JhcCA9IGhlYWRXcmFwO1xyXG4gICAgICAgICAgICB0aGlzLmZvb3RXcmFwID0gZm9vdFdyYXA7XHJcbiAgICAgICAgICAgIGluZm8oJ21vZHVsZSBmaXhlZCBsb2FkZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgICAqIHJldmVydCBhbGwgY2hhbmdlcyBwZXJmb3JtZWQgYnkgdGhpcyBtb2R1bGVcclxuICAgICAgICAgICAgICAgICAqIGltcGxlbWVudGF0aW9uIG1pZ2h0IG5vdCBiZSAxMDAlIGNvcnJlY3QgeWV0XHJcbiAgICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIHVuc2V0OiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgSU5JVElBTCA9ICdpbml0aWFsJztcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyhjb250YWluZXIsICd0bS1maXhlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZFdyYXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChoZWFkV3JhcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnSGVhZC5zdHlsZS52aXNpYmlsaXR5ID0gSU5JVElBTDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkuc3R5bGUubWFyZ2luVG9wID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZm9vdFdyYXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChmb290V3JhcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnRm9vdC5zdHlsZS52aXNpYmlsaXR5ID0gSU5JVElBTDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlXcmFwLnN0eWxlLm92ZXJmbG93WCA9IElOSVRJQUw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5V3JhcC5zdHlsZS5tYXJnaW5Cb3R0b20gPSBJTklUSUFMO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBmb290ZXIgaGVscGVyIHdyYXBwZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgd3JhcHBlcnMgPSBvcmlnRm9vdC5xdWVyeVNlbGVjdG9yQWxsKCdkaXYudG0tZml4ZWQtaGVscGVyLXdyYXBwZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXS5zbGljZS5jYWxsKHdyYXBwZXJzKS5mb3JFYWNoKCh3cmFwcGVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5vdXRlckhUTUwgPSB3cmFwcGVyLmlubmVySFRNTDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVuZGVySGVhZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZW5kZXJGb290KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0bUZpeGVkRm9yY2VSZW5kZXJpbmcnLCByZW5kZXJIZWFkKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIiwiY29uc3Qge2Vycm9yLCBleHRlbmQyLCBpc05vbkVtcHR5U3RyaW5nfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcbmNvbnN0IGRlZmF1bHRQYXJhbXMgPSB7ICAgICAgICAgICAvL2RlZmF1bHQtbmFtZVxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7fSwgICAgICAgICAgICAgICAgLy9cImRlZmF1bHRcIi1kZWZhdWx0LXNldHRpbmdzOiBlbXB0eVxyXG4gICAgc2V0dGluZ3NWYWxpZGF0b3I6ICgpID0+IG51bGwsICAgICAgLy9kZWZhdWx0OiBhY2NlcHQgYWxsIGdpdmVuIHNldHRpbmdzIG9iamVjdHNcclxuICAgIGluaXRpYWxpemVyOiAoKSA9PiBudWxsICAgICAgICAgICAgIC8vZGVmYXVsdDogZW1wdHkgbW9kdWxlXHJcbn07XHJcblxyXG4vKipcclxuICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgc2luZ2xlIFRhYmxlbW9kaWZ5IG1vZHVsZS5cclxuICogSXQgcHJvdmlkZXMgYSBzdGFuZGFyZCBpbnRlcmZhY2UgZm9yIGRlZmluaW5nIG1vZHVsZXMsIHRha2VzIGNhcmUgb2Ygc2V0dGluZ3NcclxuICogdmFsaWRhdGlvbiwgc2V0dGluZ3MtY29tcGxldGlvbiB3aXRoIGRlZmF1bHQgc2V0dGluZ3MgYW5kIGNhbiBiZSBleHRlbmRlZCB3aXRoXHJcbiAqIGZ1cnRoZXIgZnVuY3Rpb25hbGl0eSAoZS5nLiBtb2R1bGUgZGVwZW5kZW5jaWVzKVxyXG4gKlxyXG4gKiBVc2FnZTpcclxuICogbW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kdWxlKHtcclxuICogICAgIG5hbWU6IDx0aGUgbW9kdWxlJ3MgbmFtZT4sXHJcbiAqICAgICBkZWZhdWx0U2V0dGluZ3M6IDx0aGUgbW9kdWxlJ3MgZGVmYXVsdCBzZXR0aW5ncz4sXHJcbiAqICAgICBzZXR0aW5nc1ZhbGlkYXRvcjogPGZ1bmN0aW9uLCBjYWxsZWQgd2l0aCB0aGUgc2V0dGluZ3Mgb2JqZWN0IGFuZCB0aHJvd3NcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgaWYgaW52YWxpZCBwYXJhbWV0ZXJzIGFyZSBkZXRlY3RlZD4sXHJcbiAqICAgICBpbml0aWFsaXplcjogPGZ1bmN0aW9uIHdoZXJlIHRoZSBtb2R1bGUgY29kZSBpdHNlbGYgcmVzaWRlcywgd2lsbCBiZSBjYWxsZWRcclxuICogICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgVGFibGVtb2RpZnkgaW5zdGFuY2UgYXMgdGhpcy12YWx1ZSBhbmQgdGhlIHJldHVyblxyXG4gKiAgICAgICAgICAgICAgICAgICB2YWx1ZSB3aWxsIGJlIHN0b3JlZCBpbiB0bS1pbnN0YW5jZS5tb2R1bGVzLjxtb2R1bGVuYW1lPlxyXG4gKiB9KTtcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW9kdWxlIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xyXG4gICAgICAgIC8vSWYgbm8gbmFtZSBpcyBnaXZlbiwgdGhyb3dcclxuICAgICAgICBpZighaXNOb25FbXB0eVN0cmluZyhwYXJhbXMubmFtZSkpIHtcclxuICAgICAgICAgICAgbGV0IGVycm9yTXNnID0gXCJOYW1lIG11c3QgYmUgZ2l2ZW4gZm9yIG1vZHVsZSFcIjtcclxuICAgICAgICAgICAgZXJyb3IoZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbXBsZXRlIHBhcmFtZXRlcnMgd2l0aCBkZWZhdWx0IHBhcmFtZXRlcnNcclxuICAgICAgICBleHRlbmQyKHBhcmFtcywgZGVmYXVsdFBhcmFtcyk7XHJcbiAgICAgICAgLy9zZXQgcGFyYW1ldGVycyBhcyBwcm9wZXJ0aWVzIG9mIHRoaXNcclxuICAgICAgICBleHRlbmQyKHRoaXMsIHBhcmFtcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERvZXMgbm90aGluZyBtb3JlIHRoYW4gZXh0ZW5kIHRoZSBnaXZlbiBzZXR0aW5ncyBvYmplY3Qgd2l0aCB0aGUgZGVmYXVsdFxyXG4gICAgICogc2V0dGluZ3MgYW5kIGNhbGwgdGhlIHNldHRpbmdzVmFsaWRhdG9yIGZ1bmN0aW9uIG9uIHRoZSByZXN1bHRpbmcgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIGdldFNldHRpbmdzKHNldHRpbmdzKSB7XHJcbiAgICAgICAgZXh0ZW5kMihzZXR0aW5ncywgdGhpcy5kZWZhdWx0U2V0dGluZ3MpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NWYWxpZGF0b3Ioc2V0dGluZ3MpO1xyXG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIGJ5IHRoZSBUYWJsZW1vZGlmeSBpbnN0YW5jZS4gQ2FsbHMgdGhlIGluaXRpYWxpemVyLWZ1bmN0aW9uIHdpdGhcclxuICAgICAqIHRoZSBUYWJsZW1vZGlmeSBpbnN0YW5jZSBhcyB0aGlzLVZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldE1vZHVsZSh0YWJsZU1vZGlmeSwgc2V0dGluZ3MpIHtcclxuICAgICAgICBzZXR0aW5ncyA9IHRoaXMuZ2V0U2V0dGluZ3Moc2V0dGluZ3MpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemVyLmNhbGwodGFibGVNb2RpZnksIHNldHRpbmdzLCB0aGlzKTtcclxuICAgIH1cclxufTtcclxuIiwiY29uc3QgTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGUuanMnKTtcclxuY29uc3QgZGF0ZVV0aWxzID0gcmVxdWlyZSgnLi4vZGF0ZVV0aWxzLmpzJyk7XHJcbmNvbnN0IHthZGRDbGFzcywgaXNGbiwgZXJyb3JUaHJvdywgaGFzUHJvcCwgbG9nLCB3YXJuLCBlcnJvcixcclxuICAgICAgIGlzQm9vbCwgaXNOb25FbXB0eVN0cmluZyxcclxuICAgICAgIGl0ZXJhdGUsIHJlbW92ZUNsYXNzLCBleHRlbmQyLCBpc09iamVjdCwgcmVwbGFjZUlkc1dpdGhJbmRpY2VzfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5mdW5jdGlvbiBnZXRWYWx1ZSh0ciwgaSkge3JldHVybiB0ci5jZWxsc1tpXS5pbm5lckhUTUwudHJpbSgpLnRvTG93ZXJDYXNlKCk7fVxyXG5cclxuXHJcblxyXG5jb25zdCBGSVJTVF9FTkFCTEVEX0NFTEwgPSAnZmlyc3RFbmFibGVkJztcclxuY29uc3QgU09SVF9PUkRFUl9BU0MgPSAnYXNjJztcclxuY29uc3QgU09SVF9PUkRFUl9ERVNDID0gJ2Rlc2MnO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBQYXJzZXIgY2xhc3MgZW5jYXBzdWxhdGVzIGNvbXBhcmUgZnVuY3Rpb25zIGZvciB0aGUgc29ydGluZyBmdW5jdGlvbmFsaXR5XHJcbiAqIEEgUGFyc2VyIGNhbiBlaXRoZXIgZW5jYXBzdWxhdGUgdHdvIHR5cGVzIG9mIGNvbXBhcmUgZnVuY3Rpb25zOlxyXG4gKiBhKSBhIHNpbXBsZSBjb21wYXJlIGZ1bmN0aW9uLCB0YWtpbmcgMiBhcmd1bWVudHMgYW5kIHJldHVybmluZyBhIHZhbHVlIDwwLCAwIG9yID4wXHJcbiAqIGIpIGEgcGFyYW1ldHJpYyBjb21wYXJlIGZ1bmN0aW9uLCB0YWtpbmcgb25lIGFyZ3VtZW50ICh0aGUgcGFyYW1ldGVycykgYW5kIHJldHVybmluZ1xyXG4gKiAgICBhIGNvbXBhcmUgZnVuY3Rpb24gYXMgZGVzY3JpYmVkIGluIGEpXHJcbiAqL1xyXG5jbGFzcyBQYXJzZXIge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBwYXJzZXJcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGdldEZuIC0gRWl0aGVyIGEgc2ltcGxlIGNvbXBhcmUgZnVuY3Rpb24gb3IgYSBwYXJhbWV0cmljIG9uZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRTZXR0aW5ncyAtIFRoZSBkZWZhdWx0IHNldHRpbmdzIGZvciBhIHBhcmFtZXRyaWMgY29tcGFyZVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhcmUgZnVuY3Rpb24sIG9taXQgaWYgaXQgaXMgbm90IGEgcGFyYW1ldHJpYyBvbmVcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZ2V0Rm4sIGRlZmF1bHRTZXR0aW5ncykge1xyXG4gICAgICAgIGlmICghaXNGbihnZXRGbikpIHtcclxuICAgICAgICAgICAgZXJyb3JUaHJvdygnRmlyc3QgYXJndW1lbnQgZ2l2ZW4gdG8gcGFyc2VyIG11c3QgYmUgYSBmdW5jdGlvbiEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nZXRGbiA9IGdldEZuO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFNldHRpbmdzID0gaXNPYmplY3QoZGVmYXVsdFNldHRpbmdzKSA/IGRlZmF1bHRTZXR0aW5ncyA6IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBhY3R1YWwgY29tcGFyZSBmdW5jdGlvbiBmcm9tIHRoZSBlbmNhcHN1bGF0ZWQgb25lXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvdmlkZWRTZXR0aW5ncyAtIFBhcmFtZXRlcnMgZ2l2ZW4gdG8gYSBwYXJhbWV0cmljIGNvbXBhcmUgZnVuY3Rpb24sXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9taXQgaWYgaXQncyBub3QgYSBwYXJhbWV0cmljIG9uZVxyXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgYWN0dWFsIGNvbXBhcmUgZnVuY3Rpb24gdG8gYmUgdXNlZCBpbiBzb3J0aW5nIGFsZ29yaXRobVxyXG4gICAgICogQHRocm93cyB7RXJyb3J9IElmIHBhcmFtZXRlcnMgYXJlIGdpdmVuIGZvciBhIG5vbi1wYXJhbWV0cmljIGNvbXBhcmUgZnVuY3Rpb25cclxuICAgICAqL1xyXG4gICAgZ2V0KHByb3ZpZGVkU2V0dGluZ3MpIHtcclxuICAgICAgICBsZXQgc2V0dGluZ3NHaXZlbiA9IGlzT2JqZWN0KHByb3ZpZGVkU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICBpZiAoc2V0dGluZ3NHaXZlbiAmJiAhdGhpcy5kZWZhdWx0U2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgZXJyb3JUaHJvdyhcIlRoaXMgcGFyc2VyIGRvZXNuJ3QgYWNjZXB0IG9wdGlvbnMhXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9UaGUgY29tcGFyZSBmdW5jdGlvbiB0byBiZSByZXR1cm5lZFxyXG4gICAgICAgIGxldCByZXRGbiA9IHRoaXMuZ2V0Rm47XHJcbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGlmKCFzZXR0aW5nc0dpdmVuKSB7XHJcbiAgICAgICAgICAgICAgICBwcm92aWRlZFNldHRpbmdzID0ge307XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXh0ZW5kMihwcm92aWRlZFNldHRpbmdzLCB0aGlzLmRlZmF1bHRTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIHJldEZuID0gdGhpcy5nZXRGbihwcm92aWRlZFNldHRpbmdzKTtcclxuICAgICAgICAgICAgaWYgKCFpc0ZuKHJldEZuKSkge1xyXG4gICAgICAgICAgICAgICAgZXJyb3JUaHJvdyhcIlBhcnNlciBkaWRuJ3QgcmV0dXJuIGEgY29tcGFyZSBmdW5jdGlvbiFcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldEZuO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBTb3J0ZXIge1xyXG4gICAgY29uc3RydWN0b3IodGFibGVNb2RpZnksIHNldHRpbmdzKSB7XHJcbiAgICAgICAgLy9TZXQgaW5pdGlhbCB2YWx1ZXNcclxuICAgICAgICBleHRlbmQyKHRoaXMsIHtcclxuICAgICAgICAgICAgcmVhZHk6IHRydWUsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9LFxyXG4gICAgICAgICAgICBoZWFkQ2VsbHM6IFtdLFxyXG4gICAgICAgICAgICBib2R5OiBudWxsLFxyXG4gICAgICAgICAgICByb3dzOiBbXSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2V0dGluZ3MuY29sdW1ucyA9IHJlcGxhY2VJZHNXaXRoSW5kaWNlcyhzZXR0aW5ncy5jb2x1bW5zKTtcclxuICAgICAgICAvL1N0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSB0YWJsZW1vZGlmeSBpbnN0YW5jZVxyXG4gICAgICAgIHRoaXMudG0gPSB0YWJsZU1vZGlmeTtcclxuICAgICAgICBhZGRDbGFzcyh0aGlzLnRtLmNvbnRhaW5lciwgJ3RtLXNvcnRlcicpO1xyXG4gICAgICAgIHRoaXMuYm9keSA9IHRoaXMudG0uYm9keS50Qm9kaWVzWzBdO1xyXG5cclxuICAgICAgICB0aGlzLnNvcnRDb2x1bW5zID0gc2V0dGluZ3MuY29sdW1ucztcclxuXHQvL0FycmF5IG9mIHN0cnVjdHVyZSBbW2NvbF9pbmRleF8xLCB0cnVlIHwgZmFsc2VdLCBbY29sX2luZGV4XzIsIHRydWUgfCBmYWxzZV0sIC4uLl1cclxuICAgICAgICB0aGlzLmN1cnJlbnRPcmRlcnMgPSBbXTtcclxuICAgICAgICB0aGlzLmhlYWRDZWxscyA9IHRoaXMudG0uaGVhZCA/IFtdLnNsaWNlLmNhbGwodGhpcy50bS5oZWFkLmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzKSA6IFtdLnNsaWNlLmNhbGwodGhpcy50bS5ib2R5LnRIZWFkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzKTtcclxuXHJcbiAgICAgICAgaXRlcmF0ZShzZXR0aW5ncy5jdXN0b21QYXJzZXJzLCAobmFtZSwgZnVuYykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnNlcnNbbmFtZV0gPSBuZXcgUGFyc2VyKGZ1bmMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBhdHRhY2ggc29ydGluZyBldmVudCBsaXN0ZW5lcnNcclxuICAgICAgICBpdGVyYXRlKHRoaXMuaGVhZENlbGxzLCAoaSwgY2VsbCkgPT4ge1xyXG4gICAgICAgICAgICBpID0gcGFyc2VJbnQoaSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRJc0VuYWJsZWQoaSkpIHtcclxuICAgICAgICAgICAgICAgIGFkZENsYXNzKGNlbGwsICdzb3J0YWJsZScpO1xyXG4gICAgICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgc2V0dGluZ3MuZW5hYmxlTXVsdGlzb3J0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFuYWdlTXVsdGkoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYW5hZ2UoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHRyeSB0byBzb3J0IGJ5IGluaXRpYWwgc29ydGluZ1xyXG4gICAgICAgIGlmIChzZXR0aW5ncy5pbml0aWFsQ29sdW1uICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBsZXQgaW5pdEluZGV4ID0gc2V0dGluZ3MuaW5pdGlhbENvbHVtbjtcclxuICAgICAgICAgICAgbGV0IGluaXRPcmRlciA9IHNldHRpbmdzLmluaXRpYWxPcmRlcjtcclxuICAgICAgICAgICAgaW5pdE9yZGVyID0gaW5pdE9yZGVyID09PSBTT1JUX09SREVSX0FTQztcclxuICAgICAgICAgICAgLy9pZiBzcGVjaWFsIHZhbHVlIGZpcnN0X2VuYWJsZWQgaXMgcHJvdmlkZWQsIHNlYXJjaCBmb3IgZmlyc3Qgc2VhcmNoYWJsZSBjb2x1bW5cclxuICAgICAgICAgICAgaWYgKGluaXRJbmRleCA9PT0gRklSU1RfRU5BQkxFRF9DRUxMKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29sQ291bnQgPSB0aGlzLnRtLmdldENvbHVtbkNvdW50KCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbENvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRJc0VuYWJsZWQoaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdEluZGV4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdldElzRW5hYmxlZChpbml0SW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hbmFnZShpbml0SW5kZXgsIGZhbHNlLCBpbml0T3JkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzb3J0IGFnYWluIGluIGNhc2UgaXQncyBuZWVkZWQuXHJcbiAgICAgICAgdGhpcy50bS5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RtU29ydGVyU29ydEFnYWluJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNvcnQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50bS5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RtUm93c0FkZGVkJywgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNvcnQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGN1cnJlbnQgb3JkZXIgZm9yIGEgZ2l2ZW4gY29sdW1uIG9yIGFkZHMgYSBuZXcgb3JkZXIgaWYgYW4gb3JkZXJcclxuICAgICAqIGZvciB0aGlzIGNvbHVtbiBkaWQgbm90IGV4aXN0XHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY29sdW1uSW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGNvbHVtblxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBvcmRlciAtIHRydWUgZm9yIGFzY2VuZGluZywgZmFsc2UgZm9yIGRlc2NlbmRpbmcgb3JkZXJcclxuICAgICAqIEByZXR1cm5zIHRoaXMgZm9yIG1ldGhvZCBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICBzZXRPckFkZE9yZGVyKGNvbHVtbkluZGV4LCBvcmRlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmhhc09yZGVyKGNvbHVtbkluZGV4KSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPcmRlcnMuZmlsdGVyKGUgPT4gZVswXSA9PT0gY29sdW1uSW5kZXgpWzBdWzFdID0gb3JkZXI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T3JkZXJzLnB1c2goW2NvbHVtbkluZGV4LCBvcmRlcl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZXJlIGV4aXN0cyBhIGN1cnJlbnQgb3JkZXIgZm9yIHRoZSBjb2x1bW4gc3BlY2lmaWVkIGJ5IGNvbHVtbkluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICovXHJcbiAgICBoYXNPcmRlcihjb2x1bW5JbmRleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRPcmRlcnMuZmlsdGVyKGUgPT4gZVswXSA9PT0gY29sdW1uSW5kZXgpLmxlbmd0aCA+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IG9yZGVyIGZvciB0aGUgY29sdW1uIHNwZWNpZmllZCBieSBjb2x1bUluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBmb3IgYXNjZW5kaW5nLCBmYWxzZSBmb3IgZGVzY2VuZGluZywgdW5kZWZpbmVkIGlmIG5vIG9yZGVyIGV4aXN0c1xyXG4gICAgICovXHJcbiAgICBnZXRPcmRlcihjb2x1bW5JbmRleCkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNPcmRlcihjb2x1bW5JbmRleCkpIHJldHVybjtcclxuICAgICAgICBsZXQgb3JkZXIgPSB0aGlzLmN1cnJlbnRPcmRlcnMuZmlsdGVyKGUgPT4gZVswXSA9PT0gY29sdW1uSW5kZXgpWzBdO1xyXG4gICAgICAgIHJldHVybiBvcmRlclsxXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYWxsIGN1cnJlbnQgb3JkZXJzXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzIGZvciBtZXRob2QgY2hhaW5pbmdcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQWxsT3JkZXJzKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE9yZGVycyA9IFtdO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgY29tcGFyZSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBjb2x1bW5cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpIC0gVGhlIGNvbHVtbiBpbmRleFxyXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgY29tcGFyZSBmdW5jdGlvblxyXG4gICAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXJzZXIgZm9yIHRoZSBnaXZlbiBjb2x1bW4gY2Fubm90IGJlIGZvdW5kXHJcbiAgICAgKi9cclxuICAgIGdldFBhcnNlcihpKSB7XHJcbiAgICAgICAgbGV0IHBhcnNlck9iajtcclxuICAgICAgICAvL0ZpbmQgb3V0IGlmIHdlIGhhdmUgdG8gdXNlIHRoZSBwYXJzZXIgZ2l2ZW4gZm9yIGFsbCBjb2x1bW5zIG9yIHRoZXJlIGlzIGFuIGluZGl2aWR1YWwgcGFyc2VyXHJcbiAgICAgICAgaWYgKGhhc1Byb3AodGhpcy5zb3J0Q29sdW1ucywgaSwgJ3BhcnNlcicpKSB7XHJcbiAgICAgICAgICAgIHBhcnNlck9iaiA9IHRoaXMuc29ydENvbHVtbnNbaV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFyc2VyT2JqID0gdGhpcy5zb3J0Q29sdW1ucy5hbGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighdGhpcy5wYXJzZXJzLmhhc093blByb3BlcnR5KHBhcnNlck9iai5wYXJzZXIpKSB7XHJcbiAgICAgICAgICAgIGVycm9yVGhyb3coYFRoZSBnaXZlbiBwYXJzZXIgJHtwYXJzZXJPYmoucGFyc2VyfSBkb2VzIG5vdCBleGlzdCFgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlcnNbcGFyc2VyT2JqLnBhcnNlcl0uZ2V0KHBhcnNlck9iai5wYXJzZXJPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHNvcnRpbmcgYnkgYSBnaXZlbiBjb2x1bW4gaXMgZW5hYmxlZFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGkgLSBUaGUgY29sdW1uIGluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0SXNFbmFibGVkKGkpIHtcclxuICAgICAgICByZXR1cm4gaGFzUHJvcCh0aGlzLnNvcnRDb2x1bW5zLCBpLCAnZW5hYmxlZCcpXHJcbiAgICAgICAgICAgICAgID8gdGhpcy5zb3J0Q29sdW1uc1tpXS5lbmFibGVkXHJcbiAgICAgICAgICAgICAgIDogdGhpcy5zb3J0Q29sdW1ucy5hbGwuZW5hYmxlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYWxsIGNvbXBhcmUgZnVuY3Rpb25zIG5lZWRlZCB0byBzb3J0IGJ5IHRoZSBjdXJyZW50bHkgYWN0aXZlIHNvcnQgY29sdW1uc1xyXG4gICAgICogQHJldHVybnMge0FycmF5fSBBcnJheSBvZiBjb21wYXJlIGZ1bmN0aW9uc1xyXG4gICAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXJzZXIgZm9yIG9uZSBvZiB0aGUgY3VycmVudCBjb2x1bW5zIGNhbm5vdCBiZSBmb3VuZFxyXG4gICAgICovXHJcbiAgICBnZXRQYXJzZXJzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRPcmRlcnMubWFwKG9yZGVyID0+IHRoaXMuZ2V0UGFyc2VyKG9yZGVyWzBdKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEb2VzIHRoZSBhY3R1YWwgc29ydGluZyB3b3JrIGJ5IGFsbCBnaXZlbiBzb3J0IG9yZGVycywgZG9lcyBubyBET00gbWFuaXB1bGF0aW9uXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzIGZvciBtZXRob2QgY2hhaW5pbmdcclxuICAgICAqL1xyXG4gICAgc29ydCgpIHtcclxuICAgICAgICBsZXQgb3JkZXJzID0gdGhpcy5jdXJyZW50T3JkZXJzO1xyXG4gICAgICAgIGxldCBtYXhEZXB0aCA9IG9yZGVycy5sZW5ndGggLSAxO1xyXG4gICAgICAgIGxldCBwYXJzZXJzID0gdGhpcy5nZXRQYXJzZXJzKCk7XHJcblxyXG4gICAgICAgIGxldCBzb3J0ZWQgPSB0aGlzLnRtLmdldFZpc2libGVSb3dzKCkuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY29tcGFyZVJlc3VsdCA9IDAsIGN1ckRlcHRoID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGNvbXBhcmVSZXN1bHQgPT09IDAgJiYgY3VyRGVwdGggPD0gbWF4RGVwdGgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IG9yZGVyc1tjdXJEZXB0aF1bMF07XHJcbiAgICAgICAgICAgICAgICBjb21wYXJlUmVzdWx0ID0gcGFyc2Vyc1tjdXJEZXB0aF0oZ2V0VmFsdWUoYSwgaW5kZXgpLCBnZXRWYWx1ZShiLCBpbmRleCkpO1xyXG4gICAgICAgICAgICAgICAgKytjdXJEZXB0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAtLWN1ckRlcHRoO1xyXG4gICAgICAgICAgICByZXR1cm4gb3JkZXJzW2N1ckRlcHRoXVsxXSA/IGNvbXBhcmVSZXN1bHQgOiAtY29tcGFyZVJlc3VsdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50bS5zaG93Um93cyhzb3J0ZWQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgY29ycmVzcG9uZGluZyBjc3MgY2xhc3NlcyBmb3IgYXNjZW5kaW5nL2Rlc2NlbmRpbmcgc29ydCBvcmRlciB0byB0aGUgaGVhZGVyc1xyXG4gICAgICogb2YgY3VycmVudGx5IGFjdGl2ZSBzb3J0IGNvbHVtbnMgdG8gcHJvdmlkZSBhIHZpc3VhbCBmZWVkYmFjayB0byB0aGUgdXNlclxyXG4gICAgICogQHJldHVybnMgdGhpcyBmb3IgbWV0aG9kIGNoYWluaW5nXHJcbiAgICAgKi9cclxuICAgIHJlbmRlclNvcnRpbmdBcnJvd3MoKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIGN1cnJlbnQgc29ydGluZyBjbGFzc2VzXHJcbiAgICAgICAgaXRlcmF0ZSh0aGlzLnRtLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuc29ydC11cCwgLnNvcnQtZG93bicpLCAoaSwgY2VsbCkgPT4ge1xyXG4gICAgICAgICAgICByZW1vdmVDbGFzcyhjZWxsLCAnc29ydC11cCcpO1xyXG4gICAgICAgICAgICByZW1vdmVDbGFzcyhjZWxsLCAnc29ydC1kb3duJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IHRoaXMuY3VycmVudE9yZGVycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xyXG4gICAgICAgICAgICBsZXQgW2luZGV4LCBvcmRlcl0gPSB0aGlzLmN1cnJlbnRPcmRlcnNbaV07XHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5oZWFkQ2VsbHNbaW5kZXhdO1xyXG4gICAgICAgICAgICBhZGRDbGFzcyhjZWxsLCBvcmRlciA/ICdzb3J0LXVwJyA6ICdzb3J0LWRvd24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGEgc29ydGluZyBhY3Rpb24gZm9yIGEgc3BlY2lmaWMgY29sdW1uXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY29sSW5kZXggLSBUaGUgY29sdW1uIGluZGV4XHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IG11bHRpU29ydCAtIGlmIHRydWUgYW5kIHNvcnRpbmcgYnkgZ2l2ZW4gY29sdW1uIHdhcyBhbHJlYWR5IGVuYWJsZWQsIGp1c3RcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIHRoZSBzb3J0aW5nIG9yZGVyLCBvdGhlcndpc2UgYXBwZW5kIHRvIHRoZSBzb3J0aW5nIG9yZGVyc1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBmYWxzZSwgYWxsIGN1cnJlbnQgc29ydGluZyBvcmRlcnMgYXJlIHJlbW92ZWQgYW5kIHNvcnRpbmcgYnlcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGdpdmVuIGNvbHVtbiB3aWxsIGJlIGVuYWJsZWRcclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3JkZXIgLSB0cnVlIGZvciBhc2NlbmRpbmcsIGZhbHNlIGZvciBkZXNjZW5kaW5nLCBvbWl0IGZvciBpbnZlcnRpbmcgb2YgdGhlXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCBvcmRlciAoaWYgbm9uZSBleGlzdGVkLCBhc2NlbmRpbmcgaXMgdXNlZClcclxuICAgICAqIEByZXR1cm5zIHRoaXMgZm9yIG1ldGhvZCBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICBtYW5hZ2UoY29sSW5kZXgsIG11bHRpU29ydCwgb3JkZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZ2V0SXNFbmFibGVkKGNvbEluZGV4KSkge1xyXG4gICAgICAgICAgICB3YXJuKGBUcmllZCB0byBzb3J0IGJ5IG5vbi1zb3J0YWJsZSBjb2x1bW4gaW5kZXggJHtjb2xJbmRleH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNCb29sKG9yZGVyKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXNPcmRlcihjb2xJbmRleCkpIHtcclxuICAgICAgICAgICAgICAgIG9yZGVyID0gIXRoaXMuZ2V0T3JkZXIoY29sSW5kZXgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3JkZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtdWx0aVNvcnQgIT09IHRydWUpIHRoaXMucmVtb3ZlQWxsT3JkZXJzKCk7XHJcbiAgICAgICAgdGhpcy5zZXRPckFkZE9yZGVyKGNvbEluZGV4LCBvcmRlcik7XHJcblxyXG4gICAgICAgIHRoaXMuc29ydCgpLnJlbmRlclNvcnRpbmdBcnJvd3MoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNob3J0Y3V0IGZvciB0aGUgbWFuYWdlIG1ldGhvZCB3aXRoIG11bHRpU29ydCBzZXQgdG8gdHJ1ZVxyXG4gICAgICogQHJldHVybnMgdGhpcyBmb3IgbWV0aG9kIGNoYWluaW5nXHJcbiAgICAgKi9cclxuICAgIG1hbmFnZU11bHRpKGNvbEluZGV4LCBvcmRlcikge1xyXG4gICAgICAgIHRoaXMubWFuYWdlKGNvbEluZGV4LCB0cnVlLCBvcmRlcik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuU29ydGVyLnByb3RvdHlwZS5wYXJzZXJzID0ge1xyXG4gICAgc3RyaW5nOiBuZXcgUGFyc2VyKChhLCBiKSA9PiB7XHJcbiAgICAgICAgaWYgKGEgPiBiKSByZXR1cm4gMTtcclxuICAgICAgICBpZiAoYSA8IGIpIHJldHVybiAtMTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH0pLFxyXG4gICAgbnVtZXJpYzogbmV3IFBhcnNlcigoYSwgYikgPT4ge1xyXG4gICAgICAgIGEgPSBwYXJzZUZsb2F0KGEpO1xyXG4gICAgICAgIGIgPSBwYXJzZUZsb2F0KGIpO1xyXG4gICAgICAgIHJldHVybiBhIC0gYjtcclxuICAgIH0pLFxyXG4gICAgaW50ZWxsaWdlbnQ6IG5ldyBQYXJzZXIoKGEsIGIpID0+IHtcclxuICAgICAgICB2YXIgaXNOdW1lcmljQSA9ICFpc05hTihhKSxcclxuICAgICAgICAgICAgaXNOdW1lcmljQiA9ICFpc05hTihiKTtcclxuXHJcbiAgICAgICAgaWYgKGlzTnVtZXJpY0EgJiYgaXNOdW1lcmljQikge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChhKSAtIHBhcnNlRmxvYXQoYik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc051bWVyaWNBKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzTnVtZXJpY0IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGEgPiBiKSByZXR1cm4gMTtcclxuICAgICAgICAgICAgaWYgKGEgPCBiKSByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH0pLFxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHBhcmFtZXRyaWMgcGFyc2VyIHdoaWNoIHRha2VzIHR3byBhcmd1bWVudHMsICdwcmVzZXQnIGFuZCAnZm9ybWF0Jy5cclxuICAgICAqIElmIGZvcm1hdCBpcyBnaXZlbiwgaXQgb3ZlcnJpZGVzIGEgcG90ZW50aWFsIHByZXNldCwgZm9ybWF0IHNob3VsZCBiZSBhXHJcbiAgICAgKiBmb3JtYXQgc3RyaW5nICh0b2tlbnMgZGVzY3JpYmVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS90YXlsb3JoYWtlcy9mZWNoYSNmb3JtYXR0aW5nLXRva2VucylcclxuICAgICAqIHByZXNldCBpcyBlaXRoZXIgJ2VuZ2xpc2gnIG9yICdnZXJtYW4nIGFuZCB3aWxsIHBhcnNlIHRoZSBjb21tb24gZm9ybXMgb2YgZW5nbGlzaC9nZXJtYW5cclxuICAgICAqIGRhdGUgZm9ybWF0c1xyXG4gICAgICovXHJcbiAgICBkYXRlOiBuZXcgUGFyc2VyKHNldHRpbmdzID0+IHtcclxuXHJcbiAgICAgICAgbGV0IHtmZWNoYSwgREFURV9JMThOLCBEQVRFX0ZPUk1BVFN9ID0gZGF0ZVV0aWxzO1xyXG5cclxuICAgICAgICBpZiAoc2V0dGluZ3MuZm9ybWF0KSB7XHJcbiAgICAgICAgICAgIGlmICghaXNOb25FbXB0eVN0cmluZyhzZXR0aW5ncy5mb3JtYXQpKSB7XHJcbiAgICAgICAgICAgICAgICBlcnJvclRocm93KGBJbnZhbGlkIGRhdGUgcGFyc2luZyBmb3JtYXQgJHtzZXR0aW5ncy5mb3JtYXR9IGdpdmVuYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhRGF0ZSA9IGZlY2hhLnBhcnNlKGEsIHNldHRpbmdzLmZvcm1hdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJEYXRlID0gZmVjaGEucGFyc2UoYiwgc2V0dGluZ3MuZm9ybWF0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFEYXRlIHx8ICFiRGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiY291bGRuJ3QgcGFyc2UgZGF0ZSFcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFEYXRlIC0gYkRhdGU7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUaHJvdyhgRXJyb3Igd2hpbGUgY29tcGFyaW5nIGRhdGVzOiAke2V9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHNldHRpbmdzLnByZXNldCkge1xyXG4gICAgICAgICAgICBsZXQgaTE4biA9IERBVEVfSTE4TltzZXR0aW5ncy5wcmVzZXRdO1xyXG4gICAgICAgICAgICBpZiAoIWkxOG4pIGVycm9yVGhyb3coYEludmFsaWQgcHJlc2V0IG5hbWUgJHtzZXR0aW5ncy5wcmVzZXR9IGdpdmVuIWApO1xyXG4gICAgICAgICAgICBsZXQgZm9ybWF0cyA9IERBVEVfRk9STUFUU1tzZXR0aW5ncy5wcmVzZXRdO1xyXG4gICAgICAgICAgICByZXR1cm4gKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFEYXRlID0gZmFsc2UsIGJEYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCFhRGF0ZSAmJiBpbmRleCA8IGZvcm1hdHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFEYXRlID0gZmVjaGEucGFyc2UoYSwgZm9ybWF0c1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiRGF0ZSA9IGZlY2hhLnBhcnNlKGIsIGZvcm1hdHNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKytpbmRleDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhRGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiTm9uZSBvZiB0aGUgZ2l2ZW4gcGFyc2VycyBtYXRjaGVkIVwiKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYURhdGUgLSBiRGF0ZTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvclRocm93KGBDb3VsZG4ndCBjb21wYXJlIGRhdGVzOiAke2V9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlcnJvclRocm93KFwiTmVpdGhlciBhIHByZXNldCBub3IgYSBkYXRlIGZvcm1hdCBoYXMgYmVlbiBnaXZlbiFcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICAgIHByZXNldDogZGF0ZVV0aWxzLkRBVEVfR0VSTUFOXHJcbiAgICB9KSxcclxuICAgIC8qXHJcbiAgICAgICAgZ2VybWFuIGRheXMgb2YgdGhlIHdlZWtcclxuICAgICovXHJcbiAgICBkYXlzT2ZUaGVXZWVrOiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0SW5kZXgoc3RyKSB7XHJcbiAgICAgICAgICAgIHZhciBpID0gLTEsIGwgPSBkYXlzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIHdoaWxlIChsID4gLTEgJiYgaSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGkgPSBkYXlzW2xdLmluZGV4T2Yoc3RyKTtcclxuICAgICAgICAgICAgICAgIGwtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkYXlzID0gW1xyXG4gICAgICAgICAgICAvLyBnZXJtYW5cclxuICAgICAgICAgICAgWydtbycsICdkaScsICdtaScsICdkbycsICdmcicsICdzYScsICdzbyddLFxyXG4gICAgICAgICAgICBbJ21vbnRhZycsICdkaWVuc3RhZycsICdtaXR0d29jaCcsICdkb25uZXJzdGFnJywgJ2ZyZWl0YWcnLCAnc2Ftc3RhZycsICdzb25udGFnJ10sXHJcbiAgICAgICAgICAgIC8vIGVuZ2xpc2hcclxuICAgICAgICAgICAgWydtb24nLCAndHVlJywgJ3dlZCcsICd0aHUnLCAnZnJpJywgJ3NhdCcsICdzdW4nXSxcclxuICAgICAgICAgICAgWydtb25kYXknLCAndHVlc2RheScsICd3ZWRuZXNkYXknLCAndGh1cnNkYXknLCAnZnJpZGF5JywgJ3NhdHVyZGF5JywgJ3N1bmRheSddXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEluZGV4KGIudG9Mb3dlckNhc2UoKSkgLSBnZXRJbmRleChhLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gICAgbmFtZTogXCJzb3J0ZXJcIixcclxuICAgIGRlZmF1bHRTZXR0aW5nczoge1xyXG4gICAgICAgIGNvbHVtbnM6IHtcclxuICAgICAgICAgICAgYWxsOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyOiAnaW50ZWxsaWdlbnQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRpYWxDb2x1bW46IEZJUlNUX0VOQUJMRURfQ0VMTCxcclxuICAgICAgICBpbml0aWFsT3JkZXI6IFNPUlRfT1JERVJfQVNDLFxyXG4gICAgICAgIGVuYWJsZU11bHRpc29ydDogdHJ1ZSxcclxuICAgICAgICBjdXN0b21QYXJzZXJzOiB7fVxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIGxldCBzb3J0ZXJJbnN0YW5jZSA9IG5ldyBTb3J0ZXIodGhpcywgc2V0dGluZ3MpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNvcnRBc2M6IGluZGV4ID0+IHNvcnRlckluc3RhbmNlLm1hbmFnZShpbmRleCwgZmFsc2UsIHRydWUpLFxyXG4gICAgICAgICAgICBzb3J0RGVzYzogaW5kZXggPT4gc29ydGVySW5zdGFuY2UubWFuYWdlKGluZGV4LCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgICAgICBpbmZvOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNvcnRlckluc3RhbmNlLmN1cnJlbnRPcmRlcnMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1bnNldDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbG9nKCd1bnNldHRpbmcgc29ydGVyLi4uIG5vdCBpbXBsZW1lbnRlZCB5ZXQnKTtcclxuICAgICAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICAgICAgQFRvZG8gc2V0IG9yZGVyIHRvIGluaXRpYWwgLi4uIGRvbid0IGtub3cgaG93IHRvIGRvIGl0IHlldFxyXG4gICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCB7YWRkQ2xhc3MsIGV4dGVuZCwgaW5mbywgZXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuY29uc3QgTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGUuanMnKTtcclxuLypcclxuXHJcbiAgICBERVBSRUNBVEVELCBjYW4gYmUgcmVhbGl6ZWQgdmlhIENTUywgc2VlIGRlZmF1bHQgdGhlbWVcclxuXHJcbiovXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAgICBuYW1lOiBcInplYnJhXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICBldmVuOicjZjBmMGYwJyxcclxuICAgICAgICBvZGQ6J3doaXRlJ1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIC8vIHRoaXMgOj0gVGFibGVtb2RpZnktaW5zdGFuY2VcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhZGRDbGFzcyh0aGlzLmNvbnRhaW5lciwgJ3RtLXplYnJhJyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGV4dCA9ICd0YWJsZScgKyB0aGlzLmJvZHlTZWxlY3RvciArICcgdHI6bnRoLW9mLXR5cGUoZXZlbil7YmFja2dyb3VuZC1jb2xvcjonICsgc2V0dGluZ3MuZXZlbiArICd9J1xyXG4gICAgICAgICAgICAgICAgICAgICArICd0YWJsZScgKyB0aGlzLmJvZHlTZWxlY3RvciArICcgdHI6bnRoLW9mLXR5cGUob2RkKSB7YmFja2dyb3VuZC1jb2xvcjonICsgc2V0dGluZ3Mub2RkICsgJ30nO1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZFN0eWxlcyh0ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIGluZm8oJ21vZHVsZSB6ZWJyYSBsb2FkZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB1bnNldDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vIGltcGxlbWVudGF0aW9uIG5lZWRlZFxyXG4gICAgICAgICAgICAgICAgICAgIGluZm8oJ3Vuc2V0dGluZyB6ZWJyYScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLmpzJyk7XHJcbmNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9tb2R1bGUuanMnKTtcclxuY29uc3QgTGFuZ3VhZ2UgPSByZXF1aXJlKCcuL2xhbmd1YWdlLmpzJyk7XHJcbmNvbnN0IHtlcnJvciwgd2FybiwgaXNOb25FbXB0eVN0cmluZywgZ2V0Q3NzLFxyXG4gICAgICAgaXRlcmF0ZSwgZXh0ZW5kLCBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLCBnZXRVbmlxdWVJZCwgdHJpZ2dlciwgdGFibGVGYWN0b3J5fSA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcclxuXHJcbmNsYXNzIFRhYmxlbW9kaWZ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHNlbGVjdG9yLCBjb3JlU2V0dGluZ3MpIHtcclxuICAgICAgICBleHRlbmQoY29uZmlnLmNvcmVEZWZhdWx0cywgY29yZVNldHRpbmdzKTtcclxuICAgICAgICBsZXQgY29udGFpbmVySWQsIG9sZEJvZHlQYXJlbnQsIF90aGlzID0gdGhpcywgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyAvLyBtdXN0IGJlIGEgdGFibGVcclxuXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLSBFUlJPUiBQUkVWRU5USU9OIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHRhYmxlIGlzIHZhbGlkXHJcbiAgICAgICAgaWYgKCFib2R5IHx8IGJvZHkubm9kZU5hbWUgIT09ICdUQUJMRScpIHtcclxuICAgICAgICAgICAgZXJyb3IoJ3RoZXJlIGlzIG5vIDx0YWJsZT4gd2l0aCBzZWxlY3RvciAnICsgc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIFRtIGhhc24ndCBhbHJlYWR5IGJlZW4gY2FsbGVkIGZvciB0aGlzIHRhYmxlXHJcbiAgICAgICAgaWYgKGhhc0NsYXNzKGJvZHksICd0bS1ib2R5JykpIHtcclxuICAgICAgICAgICAgd2FybigndGhlIHRhYmxlICcgKyBzZWxlY3RvciArICcgaXMgYWxyZWFkeSBpbml0aWFsaXplZC4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayBpZiBjb250YWluZXJJZCBpcyB2YWxpZCBvciBwcm9kdWNlIGEgdW5pcXVlIGlkXHJcbiAgICAgICAgaWYgKGNvcmVTZXR0aW5ncy5jb250YWluZXJJZCAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb3JlU2V0dGluZ3MuY29udGFpbmVySWQpKSB7XHJcbiAgICAgICAgICAgIGVycm9yKCd0aGUgcGFzc2VkIGlkICcgKyBjb3JlU2V0dGluZ3MuY29udGFpbmVySWQgKyAnIGlzIG5vdCB1bmlxdWUhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29yZVNldHRpbmdzLmNvbnRhaW5lcklkKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcklkID0gY29yZVNldHRpbmdzLmNvbnRhaW5lcklkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcklkID0gZ2V0VW5pcXVlSWQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlZmVyZW5jZXMgdG8gYWxsIGFjdGl2ZSBtb2R1bGVzIHN0b3JlZCBpbiBoZXJlXHJcbiAgICAgICAgdGhpcy5hY3RpdmVNb2R1bGVzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuYm9keVNlbGVjdG9yID0gc2VsZWN0b3I7XHJcbiAgICAgICAgb2xkQm9keVBhcmVudCA9IGJvZHkucGFyZW50RWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5jb2x1bW5Db3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVDb2x1bW5Db3VudChib2R5KTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50TGFuZ3VhZ2UgPSBjb3JlU2V0dGluZ3MubGFuZ3VhZ2U7XHJcblxyXG4gICAgICAgIGJvZHkub3V0ZXJIVE1MID1cclxuICAgICAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz0ndG0tY29udGFpbmVyJz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHN0eWxlIGNsYXNzPSd0bS1jdXN0b20tc3R5bGUnPjwvc3R5bGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9J3RtLWJvZHktd3JhcCc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2JvZHkub3V0ZXJIVE1MfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IG9sZEJvZHlQYXJlbnQucXVlcnlTZWxlY3RvcignLnRtLWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICBib2R5ID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcigndGFibGUnKTsgLy8gaW1wb3J0YW50ISByZWxvYWQgYm9keSB2YXJpYWJsZVxyXG5cclxuICAgICAgICB0aGlzLmJvZHkgPSBib2R5O1xyXG4gICAgICAgIHRoaXMuYm9keVdyYXAgPSBib2R5LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5zdHlsZXNoZWV0ID0gdGhpcy5ib2R5V3JhcC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG5cclxuICAgICAgICB0aGlzLm9yaWdIZWFkID0gYm9keS50SGVhZDtcclxuICAgICAgICB0aGlzLm9yaWdGb290ID0gYm9keS50Rm9vdDtcclxuXHJcbiAgICAgICAgLy8gYWRkIG9wdGlvbmFsIGlkIHRvIGNvbnRhaW5lclxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmlkID0gY29udGFpbmVySWQ7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJJZCAgPSBjb250YWluZXJJZDtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRoZW1lIGNsYXNzIHRvIGNvbnRhaW5lclxyXG4gICAgICAgIGFkZENsYXNzKHRoaXMuY29udGFpbmVyLCAoJ3RtLXRoZW1lLScgKyBjb3JlU2V0dGluZ3MudGhlbWUpKTtcclxuICAgICAgICBhZGRDbGFzcyhib2R5LCAndG0tYm9keScpO1xyXG5cclxuICAgICAgICAvLyB0aGUgdEJvZHksIGNvbnRhaW5zIGFsbCB2aXNpYmxlIHJvd3MgaW4gdGhlIHRhYmxlXHJcbiAgICAgICAgdGhpcy52aXNpYmxlUm93cyA9IHRoaXMuYm9keS50Qm9kaWVzWzBdO1xyXG4gICAgICAgIC8vIGNvbnRhaW5zIGFsbCB0ci1ub2RlcyB0aGF0IGFyZSBub3QgZGlzcGxheWVkIGF0IHRoZSBtb21lbnRcclxuICAgICAgICB0aGlzLmhpZGRlblJvd3MgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcblxyXG4gICAgICAgIC8vIGNhbGwgYWxsIG1vZHVsZXNcclxuICAgICAgICBpZiAoY29yZVNldHRpbmdzLm1vZHVsZXMpIHtcclxuICAgICAgICAgICAgLy8gaW50ZXJmYWNlIGZvciBtb2R1bGVzXHJcbiAgICAgICAgICAgIGl0ZXJhdGUoY29yZVNldHRpbmdzLm1vZHVsZXMsIGZ1bmN0aW9uKG1vZHVsZU5hbWUsIG1vZHVsZVNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kdWxlID0gVGFibGVtb2RpZnkubW9kdWxlc1ttb2R1bGVOYW1lXSxcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVSZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAobW9kdWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlUmV0dXJuID0gbW9kdWxlLmdldE1vZHVsZShfdGhpcywgbW9kdWxlU2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB3YXJuKCdNb2R1bGUnICsgbW9kdWxlTmFtZSArICcgbm90IHJlZ2lzdGVyZWQhJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobW9kdWxlUmV0dXJuICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuYWN0aXZlTW9kdWxlc1ttb2R1bGVOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlZmluZSByZXQgYXMgYSBwcm9wZXJ0eSBvZiB0aGUgVGFibGVtb2RpZnkgaW5zdGFuY2UuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdyB5b3UgY2FuIGFjY2VzcyBpdCBsYXRlciB2aWEgdG0ubW9kdWxlbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5hY3RpdmVNb2R1bGVzW21vZHVsZU5hbWVdID0gbW9kdWxlUmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKCdtb2R1bGUgbmFtZSAnICsgbW9kdWxlTmFtZSArICcgY2F1c2VzIGEgY29sbGlzaW9uIGFuZCBpcyBub3QgYWxsb3dlZCwgcGxlYXNlIGNob29zZSBhbm90aGVyIG9uZSEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvcmVTZXR0aW5ncyA9IGNvcmVTZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNhbGN1bGF0ZSBudW1iZXIgb2YgY29sdW1ucy4gVXN1YWxseSBvbmx5IGNhbGxlZCBhdCB0aGUgaW5pdGlhbGlzYXRpb25cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQ29sdW1uQ291bnQoZWxlbWVudCkge1xyXG4gICAgICAgIGxldCBtYXhDb2xzID0gMDtcclxuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoZWxlbWVudC5yb3dzLCByb3cgPT4ge1xyXG4gICAgICAgICAgICBpZiAocm93LmNlbGxzLmxlbmd0aCA+IG1heENvbHMpIG1heENvbHMgPSByb3cuY2VsbHMubGVuZ3RoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY29sdW1uQ291bnQgPSBtYXhDb2xzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0dGVyIGZvciBudW1iZXIgb2YgY29sdW1uc1xyXG4gICAgICovXHJcbiAgICBnZXRDb2x1bW5Db3VudCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2x1bW5Db3VudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBjc3MgdGV4dCB0byB0aGUgaW50ZXJuYWwgc3R5bGUtdGFnIGVhY2ggdG0tY29udGFpbmVyIGNvbnRhaW5zXHJcbiAgICAgKi9cclxuICAgIGFwcGVuZFN0eWxlcyh0ZXh0KSB7XHJcbiAgICAgICAgaWYgKHRleHQudHJpbSgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQudHJpbSgpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGEgdGVybSBvdXQgb2YgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgcGFja1xyXG4gICAgICovXHJcbiAgICBnZXRUZXJtKHRlcm0pIHtcclxuICAgICAgICByZXR1cm4gVGFibGVtb2RpZnkubGFuZ3VhZ2VzW3RoaXMuY3VycmVudExhbmd1YWdlXS5nZXQodGVybSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgZ2V0IGFycmF5IG9mIHJlZmVyZW5jZXMgdG8gdGhlIHZpc2libGUgcm93c1xyXG4gICAgICovXHJcbiAgICBnZXRWaXNpYmxlUm93cygpIHtcclxuICAgICAgICByZXR1cm4gW10uc2xpY2UuY2FsbCh0aGlzLnZpc2libGVSb3dzLnJvd3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIGdldCBhcnJheSBvZiByZWZlcmVuY2VzIHRvIHRoZSBoaWRkZW4gcm93c1xyXG4gICAgICovXHJcbiAgICBnZXRIaWRkZW5Sb3dzKCkge1xyXG4gICAgICAgIHJldHVybiBbXS5zbGljZS5jYWxsKHRoaXMuaGlkZGVuUm93cy5jaGlsZE5vZGVzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICBnZXQgYXJyYXkgb2YgcmVmZXJlbmNlcyB0byBhbGwgcm93cywgYm90aCBoaWRkZW4gYW5kIHZpc2libGVcclxuICAgICAqL1xyXG4gICAgZ2V0QWxsUm93cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRWaXNpYmxlUm93cygpLmNvbmNhdCh0aGlzLmdldEhpZGRlblJvd3MoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzaG93IGFsbCB0aGUgcm93cyB0aGF0IHRoZSBwYXJhbSByb3dBcnJheSBjb250YWlucyAoYXMgcmVmZXJlbmNlcykuXHJcbiAgICAgKiB1c2VkIGJ5IGZpbHRlciBtb2R1bGVcclxuICAgICAqL1xyXG4gICAgc2hvd1Jvd3Mocm93QXJyYXkpIHtcclxuICAgICAgICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICAgICAgdGhpcy5oaWRlQWxsUm93cygpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvd0FycmF5Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKHJvd0FycmF5W2ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudmlzaWJsZVJvd3MuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWF5IGJlIHVzZWQgZnJvbSBvdXRzaWRlIHRoZSBwbHVnaW4gdG8gYWRkIHJvd3MgdG8gdGhlIHRhYmxlLlxyXG4gICAgICogVGhpcyB3aWxsIGF1dG9tYXRpY2FsbHkgcmVydW4gdGhlIGZpbHRlciAmIHNvcnRlciBtb2R1bGUuXHJcbiAgICAgKi9cclxuICAgIGFkZFJvd3MoYXJyKSB7XHJcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPT09IDApIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcnJbMF0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRKU09OUm93cyhhcnIpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYXJyWzBdLnRhZ05hbWUgPT09ICdUUicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZEhUTUxSb3dzKGFycik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXJyb3IoJ3dyb25nIHBhcmFtZXRlciBmb3IgYWRkUm93cygpJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfYWRkSFRNTFJvd3Mocm93QXJyYXkpIHtcclxuICAgICAgICBsZXQgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dBcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChyb3dBcnJheVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlzaWJsZVJvd3MuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNpZ25hbCgndG1Sb3dzQWRkZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICBfYWRkSlNPTlJvd3Mocm93QXJyYXkpIHtcclxuICAgICAgICBsZXQgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpLFxyXG4gICAgICAgICAgICB0ZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyksXHJcbiAgICAgICAgICAgIG5ld1RyLCBuZXdUZCxcclxuICAgICAgICAgICAgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm93QXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbmV3VHIgPSB0ci5jbG9uZU5vZGUoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByb3dBcnJheVtpXS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbmV3VGQgPSB0ZC5jbG9uZU5vZGUoKTtcclxuICAgICAgICAgICAgICAgIG5ld1RkLmlubmVySFRNTCA9IHJvd0FycmF5W2ldW2pdO1xyXG4gICAgICAgICAgICAgICAgbmV3VHIuYXBwZW5kQ2hpbGQobmV3VGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKG5ld1RyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudmlzaWJsZVJvd3MuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNpZ25hbCgndG1Sb3dzQWRkZWQnKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYSBzaW5nbGUgcm93XHJcbiAgICAgKi9cclxuICAgIGFkZFJvdyhyb3cpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hZGRSb3dzKFtyb3ddKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoaXMgbWV0aG9kIGNsZWFyZXMgdGhlIHRhYmxlYm9keSwgd2l0aG91dCB0aGUgdGFibGUgcm93cyBiZWluZyBsb3N0LiBJbnN0ZWFkLCB0aGV5IGFyZSBzdG9yZWQgaW4gdGhlIERvY3VtZW50RnJhZ21lbnQuXHJcbiAgICAgKiBSZWZlcmVuY2VzIHRvIHRoZSB0YWJsZSByb3dzIChsYXlpbmcgaW4gdGhlIGFycmF5IHRoaXMucm93cykgbm93IHBvaW50IG9uIHRoZSBlbGVtZW50cyBpbiB0aGUgZnJhZ21lbnQuXHJcbiAgICAgKiBUaGUgUmVmZXJlbmNlcyBjYW4gYmUgdXNlZCB0byBpbnNlcnQgdGhlIHJvd3MgaW4gdGhlIG9yaWdpbmFsIERPTSBhZ2Fpbi5cclxuICAgICAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgSUUxMSBoYWQgc2V2ZXJhbCBpc3N1ZXMgd2l0aCByZWZlcmVuY2VzIHRvIGRlbGV0ZWQgdGFibGUgcm93c1xyXG4gICAgICovXHJcbiAgICBoaWRlQWxsUm93cygpIHtcclxuICAgICAgICBsZXQgcm93cyA9IHRoaXMudmlzaWJsZVJvd3Mucm93cywgbmV4dDtcclxuXHJcbiAgICAgICAgd2hpbGUgKG5leHQgPSByb3dzWzBdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZGVuUm93cy5hcHBlbmRDaGlsZChuZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkaXNwbGF5IGFsbCBoaWRkZW4gcm93cyBhZ2FpblxyXG4gICAgICogdGhpcyBpcyBjb3JyZWN0IHVzYWdlIG9mIGRvY3VtZW50RnJhZ21lbnQhIGFwcGVuZGluZyB0aGUgZnJhZ21lbnQgaXRzZWxmIGFwcGVuZHMgYWxsIGNoaWxkcmVuIGluc3RlYWRcclxuICAgICAqL1xyXG4gICAgc2hvd0FsbFJvd3MoKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlUm93cy5hcHBlbmRDaGlsZCh0aGlzLmhpZGRlblJvd3MpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNpZ25hbCgndG1Sb3dzQWRkZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlbGV0ZXMgYWxsIHJvd3MgaW4gdGhlIHRhYmxlIChoaWRkZW4gQU5EIHZpc2libGUpLlxyXG4gICAgICogRmFzdGVyIGltcGxlbWVudGF0aW9uIHRoYW4gc2V0dGluZyBpbm5lckhUTWwgPSAnJ1xyXG4gICAgICovXHJcbiAgICBkZWxldGVBbGxSb3dzKCkge1xyXG4gICAgICAgIFt0aGlzLnZpc2libGVSb3dzLCB0aGlzLmhpZGRlblJvd3NdLmZvckVhY2goKHApID0+IHtcclxuICAgICAgICAgICAgd2hpbGUgKHAuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgcC5yZW1vdmVDaGlsZChwLmZpcnN0Q2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2VkIHRvIGZpcmUgZXZlbnRzIG9uIHRoZSBvcmlnaW5hbCB0YWJsZS4gTW9kdWxlcyBtYXkgcmVhY3QgdG8gdGhpcyBldmVudHMuXHJcbiAgICAgKiBJdHMgYSBjb252ZW50aW9uIHRoYXQgYWxsIGV2ZW50cyBhcmUgZmlyZWQgb24gdGhpcyBlbGVtZW50IGFuZCB0aGUgbW9kdWxlcyBsaXN0ZW4gdG8gdGhlIHNhbWUuXHJcbiAgICAgKi9cclxuICAgIHNpZ25hbCguLi5ldmVudHMpIHtcclxuICAgICAgICBldmVudHMuZm9yRWFjaCgoZSkgPT4ge1xyXG4gICAgICAgICAgICB0cmlnZ2VyKHRoaXMuYm9keSwgZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGF0aWMgbWV0aG9kIGZvciBhZGRpbmcgdXNlci1kZWZpbmVkIG1vZHVsZXNcclxuICAgICAqIHRoaXMtdmFsdWUgaW4gYSBzdGF0aWMgbWV0aG9kIGlzIHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBpdHNlbGYgKGhlcmVcclxuICAgICAqIFRhYmxlbW9kaWZ5KVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkTW9kdWxlKG1vZHVsZSwgbmFtZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgLy9DcmVhdGUgYSBuZXcgbW9kdWxlIGJhc2VkIG9uIHRoZSBnaXZlbiBuYW1lIGFuZCBpbml0aWFsaXplciBmdW5jdGlvblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRNb2R1bGUobmV3IE1vZHVsZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZXI6IG1vZHVsZVxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIC8vQ2hlY2sgaWYgaXQgaXMgYSBNb2R1bGUgaW5zdGFuY2VcclxuICAgICAgICAgICAgaWYgKG1vZHVsZSBpbnN0YW5jZW9mIE1vZHVsZSkge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgbW9kdWxlIGFscmVhZHkgZXhpc3RzLCB0aHJvd1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2R1bGVzW21vZHVsZS5uYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlcnJvck1zZyA9IFwiTW9kdWxlIFwiICsgbW9kdWxlLm5hbWUgKyBcIiBkb2VzIGFscmVhZHkgZXhpc3QhXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZXNbbW9kdWxlLm5hbWVdID0gbW9kdWxlO1xyXG4gICAgICAgICAgICAvL1RyZWF0IHRoZSBvYmplY3RzIGFzIHBhcmFtZXRlcnMgZm9yIG5ldyBtb2R1bGUgaW5zdGFuY2VcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vSWYgYSBuYW1lIGlzIGdpdmVuIGFzIHBhcmFtZXRlciwgb3ZlcnJpZGUgYSBuYW1lIGluIHRoZSBwYXJhbWV0ZXJzIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgaWYoaXNOb25FbXB0eVN0cmluZyhuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZS5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kdWxlKG5ldyBNb2R1bGUobW9kdWxlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICAgYWRkIGEgbGFuZ3VhZ2UgcGFjayB0byB0aGUgY29sbGVjdGlvbiBvZiBMYW5ndWFnZXMuXHJcbiAgICAgICAgcGFyYW0gbmFtZTogaWRlbnRpZmllciBvZiB0aGUgbGFuZ3VhZ2UuIE1heSBvdmVyd3JpdGUgb2xkZXIgb25lc1xyXG4gICAgICAgIHBhcmFtIHRlcm06IG9iamVjdCBjb250YWluaW5nIHRoZSB0ZXJtcy4gc2VlIGZ1bGwgbGlzdCBpbiBsYW5ndWFnZS5qc1xyXG4gICAgKi9cclxuICAgIHN0YXRpYyBhZGRMYW5ndWFnZShuYW1lLCB0ZXJtcykge1xyXG4gICAgICAgIFRhYmxlbW9kaWZ5Lmxhbmd1YWdlc1tuYW1lXSA9IG5ldyBMYW5ndWFnZShuYW1lLCB0ZXJtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICAgcmVzZXQgYWxsIGxvYWRlZCBtb2R1bGVzIG9mIGluc3RhbmNlXHJcbiAgICAgICAgYW5kIHVuc2V0IGluc3RhbmNlIGFmdGVyd2FyZHNcclxuICAgICovXHJcbiAgICBzdGF0aWMgX2Rlc3Ryb3koaW5zdGFuY2UpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlIHx8ICFpbnN0YW5jZSBpbnN0YW5jZW9mIFRhYmxlbW9kaWZ5KSB0aHJvdyBuZXcgRXJyb3IoJ25vdCBhIFRhYmxlbW9kaWZ5LW9iamVjdCcpO1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlLmFjdGl2ZU1vZHVsZXMpIHRocm93IG5ldyBFcnJvcignaW5zdGFuY2UgaGFzIG5vIHByb3BlcnR5IGFjdGl2ZU1vZHVsZXMnKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250YWluZXIgPSBpbnN0YW5jZS5jb250YWluZXI7XHJcbiAgICAgICAgICAgIGxldCB0YWJsZSA9IGluc3RhbmNlLmJvZHk7XHJcblxyXG4gICAgICAgICAgICBpdGVyYXRlKGluc3RhbmNlLmFjdGl2ZU1vZHVsZXMsIChtb2R1bGVOYW1lLCBtb2R1bGUpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIHJldmVydCBhbGwgY2hhbmdlcyBwZXJmb3JtZWQgYnkgdGhpcyBtb2R1bGUuIE1vZHVsZSBpdHNlbGYgaXMgcmVzcG9uc2libGUgZm9yIGNvcnJlY3QgcmV2ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICBpZiAobW9kdWxlLnVuc2V0KSBtb2R1bGUudW5zZXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZW1vdmVDbGFzcyh0YWJsZSwgJ3RtLWJvZHknKTtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIGFsbCB3cmFwcGVyc1xyXG4gICAgICAgICAgICBjb250YWluZXIucGFyZW50RWxlbWVudC5yZXBsYWNlQ2hpbGQodGFibGUsIGNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBkZWxldGUgaW5zdGFuY2VcclxuICAgICAgICAgICAgaXRlcmF0ZShpbnN0YW5jZSwgKHByb3AsIHZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGluc3RhbmNlW3Byb3BdO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblRhYmxlbW9kaWZ5Lm1vZHVsZXMgPSB7XHJcbiAgICBjb2x1bW5TdHlsZXM6IHJlcXVpcmUoJy4vbW9kdWxlcy9jb2x1bW5TdHlsZXMuanMnKSxcclxuICAgIGZpbHRlcjogcmVxdWlyZSgnLi9tb2R1bGVzL2ZpbHRlci5qcycpLFxyXG4gICAgZml4ZWQ6IHJlcXVpcmUoJy4vbW9kdWxlcy9maXhlZC5qcycpLFxyXG4gICAgc29ydGVyOiByZXF1aXJlKCcuL21vZHVsZXMvc29ydGVyLmpzJyksXHJcbiAgICB6ZWJyYTogcmVxdWlyZSgnLi9tb2R1bGVzL3plYnJhLmpzJylcclxufTtcclxuXHJcblRhYmxlbW9kaWZ5Lmxhbmd1YWdlcyA9IHtcclxuICAgIGVuOiBuZXcgTGFuZ3VhZ2UoJ2VuJywge1xyXG4gICAgICAgIEZJTFRFUl9QTEFDRUhPTERFUjogJ3R5cGUgZmlsdGVyIGhlcmUnLFxyXG4gICAgICAgIEZJTFRFUl9DQVNFU0VOU0lUSVZFOiAnY2FzZS1zZW5zaXRpdmUnXHJcbiAgICB9KSxcclxuICAgIGRlOiBuZXcgTGFuZ3VhZ2UoJ2RlJywge1xyXG4gICAgICAgIEZJTFRFUl9QTEFDRUhPTERFUjogJ0ZpbHRlciBlaW5nZWJlbicsXHJcbiAgICAgICAgRklMVEVSX0NBU0VTRU5TSVRJVkU6ICdHcm/Dny0gdW5kIEtsZWluc2NocmVpYnVuZyB1bnRlcnNjaGVpZGVuJ1xyXG4gICAgfSlcclxufTtcclxuXHJcblRhYmxlbW9kaWZ5Lkxhbmd1YWdlID0gTGFuZ3VhZ2U7XHJcbi8vU3RvcmUgcmVmZXJlbmNlIHRvIHRoZSBtb2R1bGUgY2xhc3MgZm9yIHVzZXItZGVmaW5lZCBtb2R1bGVzXHJcblRhYmxlbW9kaWZ5Lk1vZHVsZSA9IE1vZHVsZTtcclxuLy8gc2V0IHZlcnNpb24gb2YgVGFibGVtb2RpZnlcclxuVGFibGVtb2RpZnkudmVyc2lvbiA9ICd2MC45LjQnO1xyXG4vL21ha2UgdGhlIFRhYmxlbW9kaWZ5IG9iamVjdCBhY2Nlc3NpYmxlIGdsb2JhbGx5XHJcbndpbmRvdy5UYWJsZW1vZGlmeSA9IFRhYmxlbW9kaWZ5O1xyXG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xyXG5yZXF1aXJlKCdjdXN0b20tZXZlbnQtcG9seWZpbGwnKTtcclxuLy8gY3VzdG9tIGNvbnNvbGUgbG9nZ2luZyBmdW5jdGlvbnNcclxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICBpZihjb25maWcuZGVidWcpIGNvbnNvbGUubG9nKCd0bS1sb2c6ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLmluZm8gPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICBpZihjb25maWcuZGVidWcpIGNvbnNvbGUuaW5mbygndG0taW5mbzogJyArIHRleHQpO1xyXG59XHJcbmV4cG9ydHMud2FybiA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS53YXJuKCd0bS13YXJuOiAnICsgdGV4dCk7XHJcbn1cclxuZXhwb3J0cy50cmFjZSA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS50cmFjZSgndG0tdHJhY2U6ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLmVycm9yID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgY29uc29sZS5lcnJvcigndG0tZXJyb3I6ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLmVycm9yVGhyb3cgPSB0ZXh0ID0+IHtcclxuICAgIGV4cG9ydHMuZXJyb3IodGV4dCk7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XHJcbn1cclxuLy8gdXRpbHNcclxuZXhwb3J0cy5oYXNDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcclxuICAgIHJldHVybiBlbC5jbGFzc0xpc3QgPyBlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSA6IG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicpLnRlc3QoZWwuY2xhc3NOYW1lKTtcclxufVxyXG5leHBvcnRzLmFkZENsYXNzID0gZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSkge1xyXG4gICAgaWYgKGVsLmNsYXNzTGlzdCkgZWwuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgZWxzZSBpZiAoIWhhc0NsYXNzKGVsLCBjbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG4gICAgcmV0dXJuIGVsO1xyXG59XHJcbmV4cG9ydHMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKSB7XHJcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcbiAgICBlbHNlIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicsICdnJyksICcnKTtcclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLndyYXAgPSBmdW5jdGlvbihlbCwgd3JhcHBlcikge1xyXG4gICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgZWwpO1xyXG4gICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxufVxyXG4vKipcclxuICogRXh0ZW5kZWQgdmVyc2lvbiBvZiB0aGUgXCJleHRlbmRcIi1GdW5jdGlvbi4gU3VwcG9ydHMgbXVsdGlwbGUgc291cmNlcyxcclxuICogZXh0ZW5kcyBkZWVwIHJlY3Vyc2l2ZWx5LlxyXG4gKi9cclxuZXhwb3J0cy5leHRlbmQyID0gZnVuY3Rpb24gZXh0ZW5kMihkZXN0aW5hdGlvbiwgLi4uc291cmNlcykge1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgc291cmNlID0gc291cmNlc1tpXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgaWYoe30uaGFzT3duUHJvcGVydHkuY2FsbChkZXN0aW5hdGlvbiwga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHREZXN0ID0gdHlwZW9mIGRlc3RpbmF0aW9uW2tleV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdFNyYyA9IHR5cGVvZiBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmKHREZXN0ID09PSB0U3JjICYmICh0RGVzdCA9PT0gJ29iamVjdCcgfHwgdERlc3QgPT09ICdmdW5jdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kMihkZXN0aW5hdGlvbltrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5leHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZChkLCBzKSB7XHJcbiAgICBPYmplY3Qua2V5cyhkKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIGlmKCFzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgc1trZXldID0gZFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNba2V5XSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgLy8gcmVjdXJzaXZlIGRlZXAtZXh0ZW5kXHJcbiAgICAgICAgICAgIHNba2V5XSA9IGV4dGVuZChkW2tleV0sIHNba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHM7XHJcbn1cclxuZXhwb3J0cy5nZXRTY3JvbGxiYXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgdmFyIGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMTAwcHhcIjtcclxuICBvdXRlci5zdHlsZS5tc092ZXJmbG93U3R5bGUgPSBcInNjcm9sbGJhclwiOyAvLyBuZWVkZWQgZm9yIFdpbkpTIGFwcHNcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcclxuICB2YXIgd2lkdGhOb1Njcm9sbCA9IG91dGVyLm9mZnNldFdpZHRoO1xyXG4gIC8vIGZvcmNlIHNjcm9sbGJhcnNcclxuICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwic2Nyb2xsXCI7XHJcbiAgLy8gYWRkIGlubmVyZGl2XHJcblxyXG4gIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xyXG4gIHZhciB3aWR0aFdpdGhTY3JvbGwgPSBpbm5lci5vZmZzZXRXaWR0aDtcclxuICAvLyByZW1vdmUgZGl2c1xyXG4gIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xyXG4gIHJldHVybiB3aWR0aE5vU2Nyb2xsIC0gd2lkdGhXaXRoU2Nyb2xsO1xyXG59XHJcbmV4cG9ydHMuc2V0Q3NzID0gZnVuY3Rpb24oZWwsIHN0eWxlcykge1xyXG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gc3R5bGVzKSB7XHJcbiAgICAgICAgZWwuc3R5bGVbcHJvcGVydHldID0gc3R5bGVzW3Byb3BlcnR5XTtcclxuICAgIH1cclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLmdldENzcyA9IGZ1bmN0aW9uKGVsLCBzdHlsZSkgeyByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpW3N0eWxlXTt9XHJcbmV4cG9ydHMuaW5QeCA9IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIGMgKyAncHgnO31cclxuLy8gaXRlcmF0ZSBvdmVyIGEgc2V0IG9mIGVsZW1lbnRzIGFuZCBjYWxsIGZ1bmN0aW9uIGZvciBlYWNoIG9uZVxyXG5leHBvcnRzLml0ZXJhdGUgPSAoZWxlbXMsIGZ1bmMpID0+IHtcclxuICBpZiAodHlwZW9mIGVsZW1zID09PSAnb2JqZWN0Jykge1xyXG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGVsZW1zKSxcclxuICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgIC8vIHByb3BlcnR5LCB2YWx1ZVxyXG4gICAgICAgICAgZnVuYyhrZXlzW2ldLCBlbGVtc1trZXlzW2ldXSk7XHJcbiAgICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgICB2YXIgbCA9IGVsZW1zLmxlbmd0aDtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgIC8vIHZhbHVlLCBpbmRleCBAVE9ETyB1bWRyZWhlbiBmw7xyIGtvbnNpc3RlbnosIGFuIGFsbGVuIHN0ZWxsZW4gYW5wYXNzZW4gLT4gaW5kZXgsIHZhbHVlXHJcbiAgICAgICAgICBmdW5jKGVsZW1zW2ldLCBpKTtcclxuICAgICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0cy5nZXRVbmlxdWVJZCA9IChmdW5jdGlvbigpe1xyXG4gICAgdmFyIHVuaXF1ZSA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpZCA9ICd0bS11bmlxdWUtJyArIHVuaXF1ZTtcclxuICAgICAgICB1bmlxdWUrKztcclxuICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0cy5pc05vbkVtcHR5U3RyaW5nID0gZnVuY3Rpb24oc3RyKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gXCJzdHJpbmdcIiAmJiBzdHIudHJpbSgpLmxlbmd0aCA+IDA7XHJcbn1cclxuXHJcbmxldCBpc09iaiA9IGV4cG9ydHMuaXNPYmplY3QgPSBvID0+IHR5cGVvZiBvID09PSAnb2JqZWN0JztcclxuXHJcbmV4cG9ydHMuaXNGbiA9IGYgPT4gdHlwZW9mIGYgPT09ICdmdW5jdGlvbic7XHJcblxyXG5leHBvcnRzLmlzQm9vbCA9IGIgPT4gdHlwZW9mIGIgPT09ICdib29sZWFuJztcclxuXHJcbmxldCBnZXRQcm9wID0gZXhwb3J0cy5nZXRQcm9wZXJ0eSA9IChvYmosIC4uLnByb3BzKSA9PiB7XHJcbiAgICBpZiAoIWlzT2JqKG9iaikgfHwgcHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcbiAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgd2hpbGUgKGluZGV4IDwgcHJvcHMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIG9iaiA9IG9ialtwcm9wc1tpbmRleF1dO1xyXG4gICAgICAgIGlmICghaXNPYmoob2JqKSkgcmV0dXJuO1xyXG4gICAgICAgICsraW5kZXg7XHJcbiAgICB9XHJcbiAgICBpZiAob2JqW3Byb3BzW2luZGV4XV0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG4gICAgcmV0dXJuIG9ialtwcm9wc1tpbmRleF1dO1xyXG59XHJcbmV4cG9ydHMuaGFzUHJvcCA9IChvYmosIC4uLnByb3BzKSA9PiBnZXRQcm9wKG9iaiwgLi4ucHJvcHMpICE9PSB1bmRlZmluZWQ7XHJcblxyXG4vKipcclxuICAgIHRyaWdnZXIgY3VzdG9tIGV2ZW50cyBzdXBwb3J0ZWQgYnkgYWxsIGJyb3dzZXJzXHJcbiovXHJcbmV4cG9ydHMudHJpZ2dlciA9ICh0YXJnZXQsIGV2ZW50TmFtZSwgcHJvcHMpID0+IHtcclxuICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHByb3BzKSk7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICAgIGZpbmRzIGhlYWQgY2VsbCB3aXRoIHRtLWlkID0gdG1JZCBhbmQgcmV0dXJucyBpdHMgaW5kZXhcclxuICAgICovXHJcbmZ1bmN0aW9uIGlkMmluZGV4KHRtSWQpIHtcclxuICAgIGxldCBjZWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigndGhlYWQgPiB0ciA+ICpbdG0taWQ9Jyt0bUlkKyddJyk7XHJcbiAgICBpZiAoIWNlbGwpIHJldHVybiBudWxsO1xyXG4gICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwoY2VsbC5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKGNlbGwpO1xyXG59XHJcblxyXG4vKipcclxuICAgIGVyc2V0emUgYWxsZSBzcGFsdGVuLCBkaWUgw7xiZXIgZGllIHRtLWlkIGlkZW50aWZpemllcnQgd2VyZGVuLCBkdXJjaCBpaHJlbiBpbmRleFxyXG4qL1xyXG5leHBvcnRzLnJlcGxhY2VJZHNXaXRoSW5kaWNlcyA9IChjb2x1bW5zKSA9PiB7XHJcbiAgICBPYmplY3Qua2V5cyhjb2x1bW5zKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICBpZihrZXkgIT0gJ2FsbCcgJiYgaXNOYU4oa2V5KSkge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBpZDJpbmRleChrZXkpO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29sdW1uc1tpbmRleF0gPSBjb2x1bW5zW2tleV07XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgY29sdW1uc1trZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29sdW1ucztcclxufVxyXG4iXX0=
