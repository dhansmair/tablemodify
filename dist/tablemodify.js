(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    ZZ: [/([\+\-]\d\d:?\d\d|Z)/, function (d, v) {
      if (v === 'Z') v = '+00:00';
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
    default: 'ddd MMM DD YYYY HH:mm:ss',
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

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./utils.js'),
    error = _require.error;
/*
 findet eine Änderung statt, wird sie dem jeweils nächsten aktiven Modul in der Hierarchie gemeldet.
 */


var RELOAD = '__reload',
    FILTER = 'filter',
    SORTER = 'sorter',
    PAGER = 'pager',
    RENDERER = '__renderer',
    FIXED = 'fixed',
    RESIZER = 'resizer';

// order is super important and must not be changed!!!
var hierarchy = [RELOAD, FILTER, SORTER, PAGER, RENDERER, RESIZER, FIXED];

/**
 * tm always holds exactly one ActionPipeline instance.
 * When a Module in the Hierarchy changes data of the table in some way (like filtering, sorting, paging), the next active Module in the hierarchy
 * gets notified and can also perform changes (and trigger again afterwards).
 * for Example, after a filter-operation the table has to be resorted and the pager has to display different data.
 *
 * In the end of each chain reaction, the built-in pseudoModule RENDERER is triggered to re-render the table so the effects will be shown.
 * the advantage is that it will always rerender once and not after each action
 */
module.exports = function () {

	/**
  * only called once in tablemodify.js
  */
	function ActionPipeline(tm) {
		_classCallCheck(this, ActionPipeline);

		this.tm = tm;
	}

	/**
  * called by the modules. this will call the notify method of the next activated module in the hierarchy
  * @param {string} sender: name of the module that has finished an operation
  * @param {object} msg: optional, can be used to pass information to the successor
  */


	_createClass(ActionPipeline, [{
		key: 'notify',
		value: function notify(sender, msg) {
			try {
				var receiver = this.getSuccessor(sender);
				if (receiver != null) receiver.notify(msg);
			} catch (e) {
				error(e);
			}
		}
	}, {
		key: 'getSuccessor',
		value: function getSuccessor(sender) {
			var i = hierarchy.indexOf(sender) + 1;
			if (i === 0) return null;

			for (; i < hierarchy.length; i++) {
				var name = hierarchy[i];
				if (this.tm.activeModules.hasOwnProperty(name)) return this.tm.activeModules[name];
			}
		}
	}]);

	return ActionPipeline;
}();

},{"./utils.js":16}],3:[function(require,module,exports){
'use strict';

exports.debug = false;
exports.coreDefaults = {
    theme: 'default',
    language: 'en',
    usesExternalData: false
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

},{"fecha":1}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * this class is a simple event system for a tablemodify instance.
 *
 */
module.exports = function () {
    function EventSystem(tm) {
        _classCallCheck(this, EventSystem);

        this.tm = tm;
        this.events = {};
    }

    _createClass(EventSystem, [{
        key: 'on',
        value: function on(eventName, func) {
            if (typeof func !== 'function') {
                throw new Error('not a function!');
            }
            if (!this.events.hasOwnProperty(eventName)) this.events[eventName] = [];

            this.events[eventName].push(func);
        }
    }, {
        key: 'trigger',
        value: function trigger(eventName) {
            var _this = this;

            for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                params[_key - 1] = arguments[_key];
            }

            if (this.events.hasOwnProperty(eventName)) {
                this.events[eventName].forEach(function (func) {
                    func.apply(_this.tm, params);
                });
            }
        }
    }]);

    return EventSystem;
}();

},{}],6:[function(require,module,exports){
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
  FILTER_DISCARD: 'discard filter',
  FILTER_PLACEHOLDER: 'type filter here',
  FILTER_CASESENSITIVE: 'case-sensitive',
  FILTER_MATCHING: 'matching',
  FILTER_COMPARATOR: 'comparator',
  FILTER_RANGE: 'range',
  FILTER_RANGE_LIMIT: 'upper limit',
  FILTER_TITLE_STRING: 'string search',
  FILTER_TITLE_NUMERIC: 'numeric search',
  FILTER_TITLE_DATE: 'date search',
  PAGER_PAGENUMBER_SEPARATOR: ' / '
};

module.exports = function () {
  function Language(identifier, languagePack) {
    _classCallCheck(this, Language);

    this.identifier = identifier;
    this.terms = extend(languagePack, defaults);
  }

  _createClass(Language, [{
    key: 'get',
    value: function get(term) {
      if (this.terms.hasOwnProperty(term)) {
        return this.terms[term];
      }
      warn('term ' + term + ' not defined');
      return '';
    }
  }]);

  return Language;
}();

},{"./utils.js":16}],7:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = require('./module.js');

var _require = require('../utils.js'),
    addClass = _require.addClass,
    iterate = _require.iterate,
    info = _require.info,
    error = _require.error,
    replaceIdsWithIndices = _require.replaceIdsWithIndices;

var tm = void 0;

var ColumnStyles = function ColumnStyles(settings) {
  _classCallCheck(this, ColumnStyles);

  addClass(tm.domElements.container, 'tm-column-styles');

  var containerId = tm.containerId;
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

  tm.appendStyles(text);
  info('module columnStyles loaded');
};

module.exports = new Module({
  name: 'columnStyles',
  defaultSettings: {
    all: {}
  },
  initializer: function initializer(settings) {
    try {
      tm = this;
      var instance = new ColumnStyles(settings);
      return {};
    } catch (e) {
      error(e);
    }
  }
});

},{"../utils.js":16,"./module.js":12}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js'),
    addClass = _require.addClass,
    removeClass = _require.removeClass,
    extend = _require.extend,
    replaceIdsWithIndices = _require.replaceIdsWithIndices,
    isNumber = _require.isNumber,
    info = _require.info,
    error = _require.error;

var Module = require('./module.js');
var HandlerFactory = require('./filterHandlers.js');

var tm = void 0;

var HandlerList = function () {
  function HandlerList() {
    _classCallCheck(this, HandlerList);

    this.list = [];
    this.limit = 1;
  }

  _createClass(HandlerList, [{
    key: 'setLimit',
    value: function setLimit(val) {
      this.limit = val;
    }
  }, {
    key: 'countShown',
    value: function countShown() {
      return this.list.length;
    }
  }, {
    key: 'hideAll',
    value: function hideAll() {
      while (this.list.length > 0) {
        this.setInActive(this.list[0]);
      }
    }
  }, {
    key: 'setActive',
    value: function setActive(handler) {
      if (this.list.length === 0) {
        addClass(tm.domElements.container, 'tm-filter-open');
      }

      var index = this.list.indexOf(handler);
      if (index !== -1) this.list.splice(index, 1);
      if (this.list.length === this.limit) {
        var odd = this.list.shift();
        odd.hide();
      }
      this.list.push(handler);
      handler.show();
      this._setZIndices();
    }
  }, {
    key: 'setInActive',
    value: function setInActive(handler) {
      var index = this.list.indexOf(handler);
      if (index !== -1) {
        this.list.splice(index, 1);
        handler.hide();
        this._setZIndices();
      }

      if (this.list.length === 0) {
        removeClass(tm.domElements.container, 'tm-filter-open');
      }
    }
  }, {
    key: '_setZIndices',
    value: function _setZIndices() {
      var offset = 10;
      for (var i = 0; i < this.list.length; i++) {
        this.list[i].setZIndex(offset + i);
      }
    }
  }]);

  return HandlerList;
}();

var handlerList = new HandlerList();

var defaultStringSettings = {
  enabled: true,
  type: 'string',
  options: {
    cs: false,
    matching: false
  }
},
    defaultNumericSettings = {
  enabled: true,
  type: 'numeric',
  options: {
    comparator: true,
    range: true
  }
};

var Model = function () {
  function Model() {
    _classCallCheck(this, Model);

    this.evaluators = null;
  }

  _createClass(Model, [{
    key: 'setEvaluators',
    value: function setEvaluators(evaluators) {
      this.evaluators = evaluators;
    }
  }, {
    key: 'getStats',
    value: function getStats() {
      var ret = [];
      for (var i = 0; i < this.evaluators.length; i++) {
        var evaluator = this.evaluators[i];
        if (evaluator.isActive()) {
          var stats = evaluator.getStats();
          ret.push(stats);
        }
      }
      return ret;
    }
  }, {
    key: 'filter',
    value: function filter() {
      if (tm.beforeUpdate('filter')) {
        var all = tm.getAllRows(),
            matching = void 0,
            activeEvaluators = this.evaluators.filter(function (evaluator) {
          return evaluator.isActive();
        });

        if (activeEvaluators.length === 0) {
          tm.setAvailableRows(all);
        } else {
          var maxDeph = activeEvaluators.length;

          matching = all.filter(function (row) {
            var deph = 0,
                matches = true;

            while (matches && deph < maxDeph) {
              var evaluator = activeEvaluators[deph],
                  i = evaluator.index,
                  cellContent = row.cells[i].textContent;
              matches = evaluator.evaluate(cellContent);
              deph++;
            }
            return matches;
          });
          tm.setAvailableRows(matching);
        }
        tm.actionPipeline.notify('filter'); // tell successor that an action took place
      }
      return this;
    }
  }]);

  return Model;
}();

var Controller = function () {
  function Controller(settings) {
    var _this2 = this;

    _classCallCheck(this, Controller);

    // attribute
    this.settings = settings;
    this.handlers = [];
    this.model = new Model();
    handlerList.setLimit(settings.maxPanelsOpen);

    // basic setup
    var _this = this,
        timeout = void 0,
        tHead = tm.domElements.head,
        count = tHead.firstElementChild.children.length,
        row = document.createElement('tr'),
        handlerFactory = new HandlerFactory(tm, handlerList);
    tHead.appendChild(row);
    addClass(row, 'tm-filter-row');

    if (!settings.autoCollapse) {
      addClass(tm.domElements.container, 'tm-filter-keep-open');
    }

    this.columnSettings = replaceIdsWithIndices(settings.columns);
    // generate cells
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      fragment.appendChild(document.createElement('td'));
    }
    row.appendChild(fragment);
    this.row = row;
    // apply functionality to cells
    var cells = [].slice.call(row.children);
    var evaluators = [];
    for (var _i = 0; _i < cells.length; _i++) {
      var cell = cells[_i],
          _settings = this.getColumnSettings(_i),
          handler = null;

      if (_settings.enabled) {
        handler = handlerFactory.create(_settings, _i, cell);
        evaluators.push(handler.getEvaluator());
      }
      this.handlers.push(handler);
    }

    this.model.setEvaluators(evaluators);

    tm.on('handlerChange', function (e) {
      if (e === 'manuell') {
        _this2.run();
      } else if (e.type === 'keyup' && e.key === 'Enter') {
        _this2.run();
      } else if (e.type === 'keyup' && isNumber(settings.filterAfterTimeout)) {
        clearTimeout(timeout);
        timeout = window.setTimeout(function () {
          _this2.run();
        }, settings.filterAfterTimeout);
      } else if (e.type === 'change' && !(e.target.nodeName === 'INPUT' && e.target.type === 'text')) {
        _this2.run();
      }
    });
  }

  /**
   *  method MUST return correct setting for a passed index!
   * @return {object} settings
   */


  _createClass(Controller, [{
    key: 'getColumnSettings',
    value: function getColumnSettings(i) {
      i = i.toString();
      var settings = void 0;

      if (this.columnSettings.hasOwnProperty(i)) {
        settings = extend(this.columnSettings[i], this.columnSettings.all);
      } else {
        settings = this.columnSettings.all;
      }

      switch (settings.type) {
        case 'numeric':
          extend(settings, defaultNumericSettings);
          delete settings.options.cs;
          delete settings.options.matching;
          break;
        default:
          // string is default
          extend(settings, defaultStringSettings);
          delete settings.options.comparator;
          delete settings.options.range;
      }
      return settings;
    }

    /**
     * only needed when beforeUpdate-function exists. It collects all necessary information from the handlers.
     * @return {array} stats - collection of all options of the active handlers
     */

  }, {
    key: 'getStats',
    value: function getStats() {
      return this.model.getStats();
    }

    /**
     * MAIN METHOD OF THIS CLASS.
     * Executes the filtering operation, works directly on the data of the Tablemodify-instance (imperative style).
     * @return {Model} this - for chaining
     */

  }, {
    key: 'run',
    value: function run() {
      this.model.filter();
      // highlight all active handlers
      var oneOpen = false;
      this.handlers.forEach(function (handler) {
        if (handler !== null && handler.checkIfActive()) {
          oneOpen = true;
        }
      });

      if (!oneOpen && this.settings.autoCollapse) {
        removeClass(tm.domElements.container, 'tm-filter-keep-open');
      } else {
        addClass(tm.domElements.container, 'tm-filter-keep-open');
      }
      return this;
    }
  }]);

  return Controller;
}();

module.exports = new Module({
  name: 'filter',
  defaultSettings: {
    autoCollapse: true,
    maxPanelsOpen: 3,
    filterAfterTimeout: 500,
    columns: {
      all: {
        enabled: true,
        type: 'string',
        options: {}
      }
    }
  },
  initializer: function initializer(settings) {
    // this := Tablemodify-instance
    try {
      tm = this;
      addClass(tm.domElements.container, 'tm-filter');
      var instance = new Controller(settings);
      info('module filter loaded');

      return {
        instance: instance,
        getStats: function getStats() {
          return instance.getStats();
        },
        notify: function notify() {
          instance.run();
        }
      };
    } catch (e) {
      error(e);
    }
  }
});

},{"../utils.js":16,"./filterHandlers.js":10,"./module.js":12}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js'),
    isNumber = _require.isNumber;
/**
 *
 *
 */

var Evaluator = function () {
  function Evaluator() {
    _classCallCheck(this, Evaluator);
  }

  _createClass(Evaluator, [{
    key: 'contructor',
    value: function contructor() {}
    // required functions

  }, {
    key: 'update',
    value: function update(handler) {
      throw new Error('function update() has to be overwritten');
    }
  }, {
    key: 'evaluate',
    value: function evaluate() {
      throw new Error('function evaluate() has to be overwritten');
    }
  }, {
    key: 'getStats',
    value: function getStats() {
      throw new Error('function getStats() has to be overwritten');
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      throw new Error('function isActive() has to be overwritten');
    }
  }]);

  return Evaluator;
}();

var StringEvaluator = function (_Evaluator) {
  _inherits(StringEvaluator, _Evaluator);

  function StringEvaluator(index) {
    _classCallCheck(this, StringEvaluator);

    var _this = _possibleConstructorReturn(this, (StringEvaluator.__proto__ || Object.getPrototypeOf(StringEvaluator)).call(this));

    _this.index = index;
    _this.pattern = null;
    _this.cs = false;
    _this.matching = false;
    return _this;
  }

  _createClass(StringEvaluator, [{
    key: 'setPattern',
    value: function setPattern(val) {
      if (typeof val === 'string' || val === null) {
        this.pattern = val;
      } else {
        throw new Error('parameter is not a string');
      }
      return this;
    }
  }, {
    key: 'setCS',
    value: function setCS(bool) {
      if (typeof bool === 'boolean') {
        this.cs = bool;
      } else {
        throw new Error('parameter is not a boolean');
      }
      return this;
    }
  }, {
    key: 'setMatching',
    value: function setMatching(bool) {
      if (typeof bool === 'boolean') {
        this.matching = bool;
      } else {
        throw new Error('parameter is not a boolean');
      }
      return this;
    }
  }, {
    key: 'update',
    value: function update(handler) {
      this.setPattern(handler.getPattern()).setCS(handler.getCS()).setMatching(handler.getMatching());
      return this;
    }
  }, {
    key: 'evaluate',
    value: function evaluate(val) {
      var pattern = this.pattern;

      if (!this.cs) {
        val = val.toLowerCase();
        pattern = pattern.toLowerCase();
      }

      if (this.matching) {
        return val === pattern;
      } else {
        return val.indexOf(pattern) !== -1;
      }
    }
  }, {
    key: 'getStats',
    value: function getStats() {
      return {
        type: 'string',
        index: this.index,
        pattern: this.pattern,
        cs: this.cs,
        matching: this.matching
      };
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.pattern != null && this.pattern.length > 0;
    }
  }]);

  return StringEvaluator;
}(Evaluator);

/**
 *
 *
 */


var NumericEvaluator = function (_Evaluator2) {
  _inherits(NumericEvaluator, _Evaluator2);

  function NumericEvaluator(index) {
    _classCallCheck(this, NumericEvaluator);

    var _this2 = _possibleConstructorReturn(this, (NumericEvaluator.__proto__ || Object.getPrototypeOf(NumericEvaluator)).call(this));

    _this2.index = index;
    _this2.mode = 'comparator'; // comparator or range
    _this2.comparator = '=';
    _this2.pattern = null;
    _this2.minVal = null;
    _this2.maxVal = null;

    _this2.evaluate = _this2._evaluateComparator;
    _this2._comparatorFunction = NumericEvaluator.operatorString2Function(_this2.operator);
    return _this2;
  }

  _createClass(NumericEvaluator, [{
    key: 'setMode',
    value: function setMode(mode) {
      if (mode === 'comparator') {
        this.mode = mode;
        this.evaluate = this._evaluateComparator;
      } else if (mode === 'range') {
        this.mode = mode;
        this.evaluate = this._evaluateRange;
      } else {
        throw new Error('wrong mode specified');
      }
      return this;
    }
  }, {
    key: 'setComparator',
    value: function setComparator(op) {
      this.comparator = op;
      this._comparatorFunction = NumericEvaluator.operatorString2Function(op);
      return this;
    }
  }, {
    key: 'setPattern',
    value: function setPattern(val) {
      if (val === null || val === '') {
        this.pattern = null;
      } else {
        val = parseFloat(val);
        if (isNumber(val)) {
          this.pattern = val;
        } else {
          throw new Error('no number passed for pattern');
        }
      }
      return this;
    }
  }, {
    key: 'setMinVal',
    value: function setMinVal(val) {
      if (val === null || val === '') {
        this.minVal = null;
      } else {
        val = parseFloat(val);
        if (isNumber(val)) {
          this.minVal = val;
        } else {
          throw new Error('no number passed for minVal');
        }
      }
      return this;
    }
  }, {
    key: 'setMaxVal',
    value: function setMaxVal(val) {
      if (val === null || val === '') {
        this.maxVal = null;
      } else {
        val = parseFloat(val);
        if (isNumber(val)) {
          this.maxVal = val;
        } else {
          throw new Error('no number passed for minVal');
        }
      }
      return this;
    }
  }, {
    key: 'update',
    value: function update(handler) {
      this.setMode(handler.getMode()).setComparator(handler.getComparator()).setPattern(handler.getPattern()).setMinVal(handler.getMinVal()).setMaxVal(handler.getMaxVal());
      return this;
    }
  }, {
    key: 'evaluate',
    value: function evaluate(val) {
      throw new Error('an error occured. this function must never be called');
    }
  }, {
    key: '_evaluateRange',
    value: function _evaluateRange(val) {
      return (this.minVal === null || val >= this.minVal) && (this.maxVal === null || val <= this.maxVal);
    }
  }, {
    key: '_evaluateComparator',
    value: function _evaluateComparator(val) {
      return this._comparatorFunction(val, this.pattern);
    }
  }, {
    key: 'getStats',
    value: function getStats() {
      if (this.mode === 'comparator') {
        return {
          type: 'numeric',
          index: this.index,
          mode: 'comparator',
          comparator: this.comparator,
          pattern: this.pattern
        };
      } else {
        return {
          type: 'numeric',
          index: this.index,
          mode: 'range',
          minVal: this.minVal,
          maxVal: this.maxVal
        };
      }
    }
  }, {
    key: 'isActive',
    value: function isActive() {
      if (this.mode === 'comparator') {
        return this.pattern != null;
      } else {
        return this.minVal != null || this.maxVal != null;
      }
    }

    /**
     * used to transform an operator-String into a function
     */

  }], [{
    key: 'operatorString2Function',
    value: function operatorString2Function(operatorString) {
      switch (operatorString) {
        case '<':
          return function (a, b) {
            return a < b;
          };
        case '>':
          return function (a, b) {
            return a > b;
          };
        case '<=':
          return function (a, b) {
            return a <= b;
          };
        case '>=':
          return function (a, b) {
            return a >= b;
          };
        default:
          return function (a, b) {
            return a === b;
          };
      }
    }
  }]);

  return NumericEvaluator;
}(Evaluator);

module.exports = function () {
  function Factory() {
    _classCallCheck(this, Factory);
  }

  _createClass(Factory, [{
    key: 'create',
    value: function create(type, index) {
      switch (type) {
        case 'numeric':
          return new NumericEvaluator(index);
        case 'string':
          return new StringEvaluator(index);
      }
    }
  }]);

  return Factory;
}();

},{"../utils.js":16}],10:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js'),
    isNumber = _require.isNumber,
    addClass = _require.addClass,
    removeClass = _require.removeClass;

var EvaluatorFactory = require('./filterEvaluators.js');

var tm = void 0,
    handlerList = void 0;
var evaluatorFactory = new EvaluatorFactory();
var unique = function () {
  var c = 0;
  return function () {
    c++;
    return c;
  };
}();

var Handler = function () {
  function Handler(settings, index, cell) {
    var _this2 = this;

    _classCallCheck(this, Handler);

    var _this = this;
    this.index = index;
    this.cell = cell;
    this.evaluator = null;
    this.isVisible = false;

    this.cell.innerHTML = '\n            <div class=\'tm-filter-div\'></div>\n            <div class=\'tm-filter-icon\'></div>\n            <div class=\'tm-filter-panel\'>\n            <div class=\'tm-filter-panel-triangle\'></div>\n            <div class=\'tm-filter-panel-title\'></div>\n            <div class=\'tm-filter-panel-content\'></div>\n            <div class=\'tm-filter-panel-discard\'></div>\n            </div>';
    this.div = this.cell.querySelector('tm-filter-div');
    this.icon = this.cell.querySelector('.tm-filter-icon');
    this.discardIcon = this.cell.querySelector('.tm-filter-panel-discard');
    this.discardIcon.title = tm.getTerm('FILTER_DISCARD');
    this.panel = this.cell.querySelector('.tm-filter-panel');
    this.content = this.cell.querySelector('.tm-filter-panel-content');

    if (settings.beautify && typeof settings.beautify === 'function') {
      this.beautify = function (val) {
        try {
          return settings.beautify(val);
        } catch (e) {
          return false;
        }
      };
    } else {
      this.beautify = function (val) {
        return val;
      };
    }

    // add event Listeners
    this.icon.addEventListener('click', function (e) {
      if (_this2.isVisible) {
        handlerList.setInActive(_this2);
      } else {
        handlerList.setActive(_this2);
      }
    });
    this.discardIcon.addEventListener('click', function (e) {
      [].slice.call(_this2.panel.querySelectorAll('input[type="text"]')).forEach(function (input) {
        input.value = '';
      });
      _this2.evaluator.update(_this2);
      // force reload
      _this2.notifyController('manuell');
      handlerList.setInActive(_this2);
      e.stopPropagation();
    });

    this.panel.addEventListener('click', function (e) {
      handlerList.setActive(_this2);
    });

    this.panel.addEventListener('change', function (e) {
      _this2.evaluator.update(_this2);
      _this2.notifyController(e);
    }, false);

    this.panel.addEventListener('keyup', function (e) {
      _this2.evaluator.update(_this2);
      _this2.notifyController(e);
    }, false);
  }

  _createClass(Handler, [{
    key: 'hide',
    value: function hide() {
      if (this.isVisible) {
        removeClass(this.icon, 'tm-filter-icon-open');
        this.panel.style.display = 'none';
        this.isVisible = false;
      }
    }
  }, {
    key: 'show',
    value: function show() {
      if (!this.isVisible) {
        addClass(this.icon, 'tm-filter-icon-open');
        this.panel.style.display = 'block';

        var td = this.panel.parentElement,
            tr = td.parentElement,
            rowWidth = tr.clientWidth,
            panelWidth = this.panel.clientWidth,
            cellOffset = td.offsetLeft;

        if (cellOffset + panelWidth + 20 > rowWidth) {
          addClass(this.panel, 'tm-filter-panel-rightaligned');
        }

        this.isVisible = true;
      }
    }
  }, {
    key: 'checkIfActive',
    value: function checkIfActive() {
      if (this.evaluator.isActive()) {
        addClass(this.cell, 'tm-filter-active');
        this.discardIcon.style.display = 'block';
        return true;
      } else {
        removeClass(this.cell, 'tm-filter-active');
        this.discardIcon.style.display = 'none';
        return false;
      }
    }
  }, {
    key: 'setTitle',
    value: function setTitle(str) {
      this.panel.querySelector('.tm-filter-panel-title').innerHTML = str;
    }
  }, {
    key: 'setZIndex',
    value: function setZIndex(val) {
      this.panel.style.zIndex = val;
      return this;
    }
  }, {
    key: 'setContent',
    value: function setContent(str) {
      var replace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var content = this.panel.querySelector('.tm-filter-panel-content');

      if (replace) {
        while (content.firstChild) {
          content.removeChild(content.firstChild);
        }
      }

      if ((typeof str === 'undefined' ? 'undefined' : _typeof(str)) === 'object') {
        content.appendChild(str);
      } else if (typeof str === 'string') {
        content.innerHTML += str;
      }
      return this;
    }
  }, {
    key: 'getEvaluator',
    value: function getEvaluator() {
      return this.evaluator;
    }
  }, {
    key: 'notifyController',
    value: function notifyController(param) {
      tm.trigger('handlerChange', param);
    }
  }]);

  return Handler;
}();

var StringHandler = function (_Handler) {
  _inherits(StringHandler, _Handler);

  function StringHandler(settings, index, cell) {
    _classCallCheck(this, StringHandler);

    var _this3 = _possibleConstructorReturn(this, (StringHandler.__proto__ || Object.getPrototypeOf(StringHandler)).call(this, settings, index, cell));

    var _this = _this3,
        options = settings.options;

    _this3.evaluator = evaluatorFactory.create('string', index);
    _this3.setTitle(tm.getTerm('FILTER_TITLE_STRING'));
    addClass(_this3.panel, 'tm-filter-stringpanel');
    var fragment = document.createDocumentFragment();
    var div = document.createElement('div');
    var input = document.createElement('input');
    var span = null;
    input.type = 'text';
    _this3.patternInput = input;
    div.appendChild(input);
    fragment.appendChild(div);

    if (options.cs) {
      div = document.createElement('div');
      input = document.createElement('input');
      span = document.createElement('span');
      span.innerHTML = tm.getTerm('FILTER_CASESENSITIVE');
      input.type = 'checkbox';
      input.value = 'cs';
      div.appendChild(input);
      div.appendChild(span);
      _this3.csCheckbox = input;
      fragment.appendChild(div);
    }
    if (options.matching) {
      div = document.createElement('div');
      input = document.createElement('input');
      input.type = 'checkbox';
      input.value = 'matching';
      span = document.createElement('span');
      span.innerHTML = tm.getTerm('FILTER_MATCHING');
      div.appendChild(input);
      div.appendChild(span);
      _this3.matchingCheckbox = input;
      fragment.appendChild(div);
    }
    _this3.setContent(fragment);

    _this3.panel.addEventListener('change', function (e) {
      var el = e.target;
      if (el.nodeName === 'INPUT' && el.type === 'checkbox' && _this3.patternInput.value === '') {
        e.stopPropagation();
      }
    }, true);
    return _this3;
  }

  _createClass(StringHandler, [{
    key: 'getPattern',
    value: function getPattern() {
      var pattern = this.patternInput.value;
      if (pattern === '') {
        return null;
      } else {
        return this.beautify(pattern);
      }
    }
  }, {
    key: 'getCS',
    value: function getCS() {
      if (this.hasOwnProperty('csCheckbox')) {
        return this.csCheckbox.checked;
      } else {
        return false;
      }
    }
  }, {
    key: 'getMatching',
    value: function getMatching() {
      if (this.hasOwnProperty('matchingCheckbox')) {
        return this.matchingCheckbox.checked;
      } else {
        return false;
      }
    }
  }]);

  return StringHandler;
}(Handler);

var NumericHandler = function (_Handler2) {
  _inherits(NumericHandler, _Handler2);

  function NumericHandler(settings, index, cell) {
    _classCallCheck(this, NumericHandler);

    var _this4 = _possibleConstructorReturn(this, (NumericHandler.__proto__ || Object.getPrototypeOf(NumericHandler)).call(this, settings, index, cell));

    var options = settings.options;

    if (!settings.beautify) {
      _this4.beautify = function (val) {
        return parseFloat(val);
      };
    }

    _this4.evaluator = evaluatorFactory.create('numeric', index);
    _this4.setTitle(tm.getTerm('FILTER_TITLE_NUMERIC'));
    addClass(_this4.panel, 'tm-filter-numericpanel');

    _this4.comparatorElement = document.createElement('div');
    _this4.rangeElement = document.createElement('div');
    _this4.controllerElement = document.createElement('div');
    addClass(_this4.comparatorElement, 'tm-filter-comparator-input');
    addClass(_this4.rangeElement, 'tm-filter-range-input');

    // comparator element
    var fragment = document.createDocumentFragment();
    var select = document.createElement('select');
    select.innerHTML = '\n        <option selected>=</option>\n        <option>&lt;</option>\n        <option>&gt;</option>\n        <option>&lt;=</option>\n        <option>&gt;=</option>';
    addClass(select, 'tm-filter-option-comparator');
    fragment.appendChild(select);
    _this4.comparatorSelect = select;
    var input = document.createElement('input');
    addClass(input, 'tm-filter-pattern');
    input.type = 'text';
    input.placeholder = tm.getTerm('FILTER_PLACEHOLDER');
    fragment.appendChild(input);
    _this4.patternInput = input;
    _this4.comparatorElement.appendChild(fragment);

    // range element
    input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'von';
    addClass(input, 'tm-filter-minVal');
    fragment.appendChild(input);
    _this4.minValInput = input;
    var span = document.createElement('span');
    span.innerHTML = '-';
    fragment.appendChild(span);
    input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'bis';
    addClass(input, 'tm-filter-maxVal');
    fragment.appendChild(input);
    _this4.maxValInput = input;
    _this4.rangeElement.appendChild(fragment);

    // controller element
    var id = 'handler-' + unique();

    _this4.controllerElement.innerHTML = '<div><input type=\'radio\' name=\'' + id + '\' value=\'comparator\' checked />Vergleichsoperator</div>\n        <div><input type=\'radio\' name=\'' + id + '\' value=\'range\' />Wertebereich</div>';

    if (!options.range) {
      // only enable comparator -> at least one must be set
      _this4.setContent(_this4.comparatorElement);
      _this4._mode = 'comparator';
    } else if (!options.comparator) {
      // only enable range
      _this4.setContent(_this4.rangeElement);
      _this4._mode = 'range';
    } else {
      _this4.setContent(_this4.comparatorElement).setContent(_this4.controllerElement, false);
      _this4._mode = 'comparator';
    }

    _this4.panel.addEventListener('change', function (e) {
      var el = e.target;
      if (el.tagName === 'SELECT' && _this4.patternInput.value === '') {
        e.stopPropagation();
      } else if (el.tagName === 'INPUT' && el.type === 'radio') {
        _this4.setMode(el.value);
        if (_this4.isAllEmpty()) e.stopPropagation();
      }
    }, true);
    return _this4;
  }

  _createClass(NumericHandler, [{
    key: 'getMode',
    value: function getMode() {
      return this._mode;
    }
  }, {
    key: 'getComparator',
    value: function getComparator() {
      if (this.comparatorSelect) {
        return this.comparatorSelect.value;
      } else {
        return '=';
      }
    }
  }, {
    key: '_getAnyInputValue',
    value: function _getAnyInputValue(type) {
      var val = this[type].value;
      val = this.beautify(val);
      if (!isNumber(val)) {
        return null;
      } else {
        return val;
      }
    }
  }, {
    key: 'getPattern',
    value: function getPattern() {
      return this._getAnyInputValue('patternInput');
    }
  }, {
    key: 'getMinVal',
    value: function getMinVal() {
      return this._getAnyInputValue('minValInput');
    }
  }, {
    key: 'getMaxVal',
    value: function getMaxVal() {
      return this._getAnyInputValue('maxValInput');
    }
  }, {
    key: 'isAllEmpty',
    value: function isAllEmpty() {
      return this.getPattern() === null && this.getMinVal() === null && this.getMaxVal() === null;
    }
  }, {
    key: 'setMode',
    value: function setMode(mode) {
      var panel = this.panel;
      if (mode === 'comparator') {
        this.content.replaceChild(this.comparatorElement, panel.querySelector('div.tm-filter-range-input'));
        this._mode = mode;
      } else if (mode === 'range') {
        this.content.replaceChild(this.rangeElement, panel.querySelector('div.tm-filter-comparator-input'));
        this._mode = mode;
      } else {
        throw new Error('invalid mode value passed');
      }
    }
  }]);

  return NumericHandler;
}(Handler);

/**
 *    export class Factory, handlers itself are not directly accessible
 */


module.exports = function () {
  function Factory(tmInstance, hl) {
    _classCallCheck(this, Factory);

    tm = tmInstance;
    handlerList = hl;
  }

  _createClass(Factory, [{
    key: 'create',
    value: function create(settings, index, cell) {
      switch (settings.type) {
        case 'numeric':
          return new NumericHandler(settings, index, cell);
        default:
          return new StringHandler(settings, index, cell);
      }
    }
  }]);

  return Factory;
}();

},{"../utils.js":16,"./filterEvaluators.js":9}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = require('./module.js');

var _require = require('../utils.js'),
    iterate = _require.iterate,
    addClass = _require.addClass,
    info = _require.info;

function getScrollbarWidth() {
  var outer = document.createElement('div');
  var inner = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);
  var widthNoScroll = outer.offsetWidth;
  // force scrollbars
  outer.style.overflow = 'scroll';
  // add innerdiv
  inner.style.width = '100%';
  outer.appendChild(inner);
  var widthWithScroll = inner.offsetWidth;
  // remove divs
  outer.parentNode.removeChild(outer);
  return widthNoScroll - widthWithScroll;
}
var inPx = function inPx(c) {
  return c + 'px';
};

var tm = void 0,
    scrollbarWidth = void 0;

var Fixed = function () {
  function Fixed(settings) {
    var _this2 = this;

    _classCallCheck(this, Fixed);

    try {
      // set up
      var headTable = void 0,
          bodyTable = tm.domElements.table,
          footTable = void 0,
          headWrap = void 0,
          tableWrap = tm.domElements.tableWrap,
          footWrap = void 0,
          origHead = tm.domElements.origHead,
          origFoot = tm.domElements.origFoot,
          _this = this,
          container = tm.domElements.container,
          borderCollapse = window.getComputedStyle(tm.domElements.table, null)['border-collapse'];
      scrollbarWidth = getScrollbarWidth();

      if (origHead && settings.fixHeader) {
        var headerHeight = this.getHeaderHeight();
        headTable = document.createElement('table');
        headWrap = document.createElement('div');
        var rightUpperCorner = document.createElement('div');
        headTable.appendChild(origHead.cloneNode(true));
        headWrap.appendChild(headTable);
        container.insertBefore(headWrap, tableWrap);
        headWrap.appendChild(rightUpperCorner);

        addClass(headTable, 'tm-head');
        addClass(headWrap, 'tm-head-wrap');
        addClass(rightUpperCorner, 'tm-head-rightCorner');

        headTable.style.borderCollapse = borderCollapse;
        origHead.style.visibility = 'hidden';
        bodyTable.style.marginTop = inPx('-' + headerHeight);
        headWrap.style.marginRight = inPx(scrollbarWidth);
        rightUpperCorner.style.width = inPx(scrollbarWidth);
        rightUpperCorner.style.right = inPx(-scrollbarWidth);

        tm.domElements.headWrap = headWrap;
        tm.domElements.head = headTable.tHead;
      }
      if (origFoot && settings.fixFooter) {
        var footerHeight = this.getFooterHeight();
        footTable = document.createElement('table');
        footWrap = document.createElement('div');
        footTable.appendChild(origFoot.cloneNode(true));
        footWrap.appendChild(footTable);
        container.appendChild(footWrap);

        addClass(footTable, 'tm-foot');
        addClass(footWrap, 'tm-foot-wrap');

        // add DIVs to origFoot cells so its height can be set to 0px
        iterate(origFoot.firstElementChild.cells, function (i, cell) {
          cell.innerHTML = '<div class="tm-fixed-helper-wrapper">' + cell.innerHTML + '</div>';
        });

        footTable.style.borderCollapse = borderCollapse;
        origFoot.style.visibility = 'hidden';
        tableWrap.style.overflowX = 'scroll';
        tableWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight));
        footWrap.style.marginRight = inPx(scrollbarWidth);

        tm.domElements.footWrap = footWrap;
        tm.domElements.foot = footTable.tFoot;
      }

      // add event listeners
      if (headTable) {
        window.addEventListener('resize', function () {
          _this.renderHead();
          if (tm.domElements.table.clientWidth > tm.domElements.tableWrap.clientWidth) {
            tm.domElements.tableWrap.style.overflowX = 'scroll';
          } else {
            tm.domElements.tableWrap.style.overflowX = 'auto';
          }
        });
      }

      if (footTable) {
        window.addEventListener('resize', function () {
          _this.renderFoot();
        });
      }

      if (headTable && footTable) {
        tableWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            headTable.style.transform = 'translateX(-' + tableWrap.scrollLeft + 'px)';
            footWrap.scrollLeft = tableWrap.scrollLeft;
          }, false);
        });
        footWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            headTable.style.transform = 'translateX(-' + footWrap.scrollLeft + 'px)';
            tableWrap.scrollLeft = footWrap.scrollLeft;
          });
        }, false);
      } else if (headTable && !footTable) {
        tableWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            headTable.style.marginLeft = inPx('-' + tableWrap.scrollLeft);
          });
        });
      } else if (!headTable && footTable) {
        footWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            tableWrap.scrollLeft = footWrap.scrollLeft;
          });
        });
        tableWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            footWrap.scrollLeft = tableWrap.scrollLeft;
          });
        });
      }

      setTimeout(function () {
        // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
        _this2.renderHead();
        _this2.renderFoot();
      }, 50);
      setTimeout(function () {
        // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
        _this2.renderHead();
        _this2.renderFoot();
      }, 500);

      this.headTable = headTable;
      this.footTable = footTable;
      this.headWrap = headWrap;
      this.footWrap = footWrap;

      info('module fixed loaded');
    } catch (e) {
      console.warn(e);
    }
  }

  _createClass(Fixed, [{
    key: 'getHeaderHeight',
    value: function getHeaderHeight() {
      return tm.domElements.origHead.clientHeight;
    }
  }, {
    key: 'getFooterHeight',
    value: function getFooterHeight() {
      return tm.domElements.origFoot.clientHeight;
    }
  }, {
    key: 'renderHead',
    value: function renderHead() {
      if (!this.headTable) return;

      var allNew = [].slice.call(this.headTable.firstElementChild.firstElementChild.cells),
          allOld = [].slice.call(tm.domElements.origHead.firstElementChild.cells);
      tm.domElements.table.style.marginTop = inPx('-' + this.getHeaderHeight()); // if header resizes because of a text wrap

      iterate(allNew, function (i, neu) {
        var w = inPx(allOld[i].getBoundingClientRect().width);

        neu.style.width = w;
        neu.style['minWidth'] = w;
        neu.style['maxWidth'] = w;
      });
    }
  }, {
    key: 'renderFoot',
    value: function renderFoot() {
      if (!this.footTable) return;
      var allNew = [].slice.call(this.footTable.firstElementChild.firstElementChild.cells),
          allOld = [].slice.call(tm.domElements.origFoot.firstElementChild.cells);

      tm.domElements.tableWrap.style.marginBottom = inPx('-' + (scrollbarWidth + this.getFooterHeight() + 1)); // if footer resizes because of a text wrap

      iterate(allNew, function (i, neu) {
        var w = inPx(allOld[i].getBoundingClientRect().width);

        neu.style.width = w;
        neu.style['minWidth'] = w;
        neu.style['maxWidth'] = w;
      });
    }
  }]);

  return Fixed;
}();

module.exports = new Module({
  name: 'fixed',
  defaultSettings: {
    fixHeader: false,
    fixFooter: false
  },
  initializer: function initializer(settings) {
    tm = this;

    addClass(tm.domElements.container, 'tm-fixed');
    scrollbarWidth = getScrollbarWidth();
    var instance = new Fixed(settings);

    return {
      notify: function notify() {
        instance.renderHead();
        instance.renderFoot();
      },
      renderHead: instance.renderHead,
      renderFoot: instance.renderFoot
    };
  }
});

},{"../utils.js":16,"./module.js":12}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js'),
    error = _require.error,
    extend = _require.extend,
    isNonEmptyString = _require.isNonEmptyString;

var defaultParams = { // default-name
  defaultSettings: {}, // "default"-default-settings: empty
  settingsValidator: function settingsValidator() {
    return null;
  }, // default: accept all given settings objects
  initializer: function initializer() {
    return null;
  } // default: empty module


  /**
   *  these is the default return object of every Module
   */
};var defaultReturns = {
  instance: {},
  unset: function unset() {},
  getStats: function getStats() {},
  info: function info() {},
  notify: function notify() {}

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
};module.exports = function () {
  function Module(params) {
    _classCallCheck(this, Module);

    // If no name is given, throw
    if (!isNonEmptyString(params.name)) {
      var errorMsg = 'Name must be given for module!';
      error(errorMsg);
      throw new Error(errorMsg);
    }
    // complete parameters with default parameters
    extend(params, defaultParams);
    // set parameters as properties of this
    extend(this, params);
  }
  /**
   * Does nothing more than extend the given settings object with the default
   * settings and call the settingsValidator function on the resulting object
   */


  _createClass(Module, [{
    key: 'getSettings',
    value: function getSettings(settings) {
      extend(settings, this.defaultSettings);
      this.settingsValidator(settings);
      return settings;
    }
    /**
     * Called by the Tablemodify instance. Calls the initializer-function with
     * the Tablemodify instance as this-Value
     */

  }, {
    key: 'getModule',
    value: function getModule(tableModify, settings) {
      settings = this.getSettings(settings);
      return extend(this.initializer.call(tableModify, settings, this), defaultReturns);
    }
  }]);

  return Module;
}();

},{"../utils.js":16}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = require('./module.js');

var _require = require('../utils.js'),
    addClass = _require.addClass,
    info = _require.info,
    error = _require.error,
    delay = _require.delay;

var tm = void 0;

var Controller = function () {
  function Controller(sets, pager) {
    _classCallCheck(this, Controller);

    var _this = this;
    this.pager = pager;

    Object.keys(sets).forEach(function (key) {
      if (sets[key] == null) throw new Error(key + ' setting must be set!');
      _this[key] = sets[key] instanceof Element ? sets[key] : document.querySelector(sets[key]);
    });

    this.left.addEventListener('click', function () {
      var val = _this.getCurrentPageNumber() - 1;

      if (val > 0) {
        _this.setCurrentPageNumber(val);
        delay(function () {
          _this.pager.update().run();
        });
      }
    });

    this.right.addEventListener('click', function () {
      var val = _this.getCurrentPageNumber() + 1;

      if (val <= _this.getTotalPages()) {
        _this.setCurrentPageNumber(val);
        delay(function () {
          _this.pager.update().run();
        });
      }
    });

    this.number.addEventListener('change', function () {
      var val = _this.getCurrentPageNumber();

      if (isNaN(val) || val < 1) {
        val = 1;
      } else if (val > _this.getTotalPages()) {
        val = _this.getTotalPages();
      }
      _this.setCurrentPageNumber(val).pager.update().run();
    });

    this.limit.addEventListener('change', function () {
      var val = _this.limit.value;
      if (isNaN(val) || val < 1) {
        _this.limit.value = 1;
      }
      _this.setCurrentPageNumber(1).updateTotalPages().pager.update().run();
    });

    this.updateTotalPages();
  }

  _createClass(Controller, [{
    key: 'getOffset',
    value: function getOffset() {
      var val = parseInt(this.number.value);
      var totalPages = this.getTotalPages();
      if (isNaN(val) || val < 1 && totalPages !== 0) {
        this.setCurrentPageNumber(1);
      } else if (val > totalPages) {
        this.setCurrentPageNumber(totalPages);
      }

      if (this.getCurrentPageNumber() <= 1) return 0;

      return parseInt(this.getCurrentPageNumber() - 1) * this.getLimit();
    }
  }, {
    key: 'getLimit',
    value: function getLimit() {
      var val = parseInt(this.limit.value);

      if (isNaN(val) || val < 1) {
        this.limit.value = this.pager.limit;
        return this.pager.limit;
      }
      return val;
    }
  }, {
    key: 'getTotalPages',
    value: function getTotalPages() {
      var total = 0;

      if (this.pager.totalManually && this.pager.totalManually >= 0) {
        total = this.pager.totalManually;
      } else {
        total = tm.countAvailableRows();
      }
      return Math.ceil(total / this.getLimit());
    }
  }, {
    key: 'setCurrentPageNumber',
    value: function setCurrentPageNumber(num) {
      num = parseInt(num);

      if (!isNaN(num)) {
        this.number.style.width = num.toString().length * 12 + 'px';
        this.number.value = num;
      }
      return this;
    }
  }, {
    key: 'getCurrentPageNumber',
    value: function getCurrentPageNumber() {
      return parseInt(this.number.value);
    }
  }, {
    key: 'updateTotalPages',
    value: function updateTotalPages() {
      if (this.total != null) {
        this.total.innerHTML = tm.getTerm('PAGER_PAGENUMBER_SEPARATOR') + this.getTotalPages() + ' ';
      }
      return this;
    }
  }, {
    key: 'updatePageNumber',
    value: function updatePageNumber() {
      var totalPages = this.getTotalPages();
      if (this.getCurrentPageNumber() > totalPages) {
        this.setCurrentPageNumber(totalPages);
      }
      return this;
    }
  }, {
    key: 'update',
    value: function update() {
      this.updateTotalPages().updatePageNumber();
      return this;
    }
  }]);

  return Controller;
}();

var Pager = function () {
  function Pager(settings) {
    _classCallCheck(this, Pager);

    this.offset = parseInt(settings.offset);
    this.limit = parseInt(settings.limit);
    this.totalManually = parseInt(settings.totalManually);
    this.controller = new Controller(settings.controller, this);

    try {
      this.controller.setCurrentPageNumber(this.controller.getCurrentPageNumber());
      this.controller.number.removeAttribute('disabled');
    } catch (e) {}
  }

  /**
   * main method run(): performs change
   */


  _createClass(Pager, [{
    key: 'run',
    value: function run() {
      if (tm.beforeUpdate('pager')) {
        tm.actionPipeline.notify('pager', {
          offset: this.getOffset(),
          limit: this.getLimit()
        });
      }
      return this;
    }

    /**
     * fetches limit and offset from the view
     */

  }, {
    key: 'update',
    value: function update() {
      this.controller.update();
      return this.setOffset(this.controller.getOffset()).setLimit(this.controller.getLimit());
    }

    // setters

  }, {
    key: 'setOffset',
    value: function setOffset(offset) {
      if (offset != null && !isNaN(offset)) this.offset = offset;
      return this;
    }
  }, {
    key: 'setLimit',
    value: function setLimit(limit) {
      if (limit != null && !isNaN(limit)) this.limit = limit;
      return this;
    }
  }, {
    key: 'setTotalManually',
    value: function setTotalManually(num) {
      this.totalManually = parseInt(num);
      this.update();
      return this;
    }
  }, {
    key: 'getOffset',
    value: function getOffset() {
      return this.offset;
    }
  }, {
    key: 'getLimit',
    value: function getLimit() {
      return this.limit;
    }
  }]);

  return Pager;
}();

module.exports = new Module({
  name: 'pager',
  defaultSettings: {
    offset: 0,
    limit: 500,
    totalManually: false,
    controller: {
      left: null,
      right: null,
      number: null,
      total: null,
      limit: null
    }
  },
  initializer: function initializer(settings) {
    try {
      tm = this;
      var instance = new Pager(settings);
      addClass(tm.domElements.container, 'tm-pager');
      info('module pager loaded');

      return {
        instance: instance,
        show: function show(limit, offset) {
          instance.setOffset(offset).setLimit(limit).run();
        },
        getStats: function getStats() {
          return {
            offset: instance.getOffset(),
            limit: instance.getLimit()
          };
        },
        notify: function notify() {
          // force pager to run again
          instance.update().run();
        },
        setTotalManually: function setTotalManually(num) {
          instance.setTotalManually(num);
        }
      };
    } catch (e) {
      error(e);
    }
  }
});

},{"../utils.js":16,"./module.js":12}],14:[function(require,module,exports){
'use strict';

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
    info = _require.info,
    isBool = _require.isBool,
    isNonEmptyString = _require.isNonEmptyString,
    iterate = _require.iterate,
    removeClass = _require.removeClass,
    extend = _require.extend,
    isObject = _require.isObject,
    replaceIdsWithIndices = _require.replaceIdsWithIndices;

function getValue(tr, i) {
  return tr.cells[i].textContent.trim().toLowerCase();
}

var FIRST_ENABLED_CELL = 'firstEnabled';
var SORT_ORDER_ASC = 'asc';
var SORT_ORDER_DESC = 'desc';

var tm = void 0;

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

      // The compare function to be returned
      var retFn = this.getFn;
      if (this.defaultSettings) {
        if (!settingsGiven) {
          providedSettings = {};
        }
        extend(providedSettings, this.defaultSettings);
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
  function Sorter(settings) {
    var _this = this;

    _classCallCheck(this, Sorter);

    // Set initial values
    extend(this, {
      ready: true,
      headers: {},
      headCells: [],
      rows: []
    });

    settings.columns = replaceIdsWithIndices(settings.columns);
    // Store a reference to the tablemodify instance

    this.sortColumns = settings.columns;
    // Array of structure [[col_index_1, true | false], [col_index_2, true | false], ...]
    this.currentOrders = [];
    this.headCells = [].slice.call(tm.domElements.head.firstElementChild.cells);

    iterate(settings.customParsers, function (name, func) {
      _this.parsers[name] = new Parser(func);
    });

    // attach sorting event listeners
    iterate(this.headCells, function (i, cell) {
      i = parseInt(i);

      if (_this.getIsEnabled(i)) {
        addClass(cell, 'sortable');
        cell.addEventListener('click', function (e) {
          if (e.ctrlKey && settings.enableMultisort) {
            _this.manageMulti(i);
          } else {
            _this.manage(i);
          }
        });
      }
    });

    // try to sort by initial sorting
    if (settings.initialColumn !== false) {
      var initIndex = settings.initialColumn,
          initOrder = settings.initialOrder;

      if (isNaN(initIndex)) {
        var index = tm.id2index(initIndex);
        if (index !== null) {
          initIndex = index;
        }
      }

      initOrder = initOrder === SORT_ORDER_ASC;

      // if special value first_enabled is provided, search for first searchable column
      if (initIndex === FIRST_ENABLED_CELL) {
        var colCount = tm.getColumnCount();
        for (var i = 0; i < colCount; ++i) {
          if (this.getIsEnabled(i)) {
            initIndex = i;
            break;
          }
        }
      }

      if (this.getIsEnabled(initIndex)) {
        this.setOrAddOrder(initIndex, initOrder).renderSortingArrows();
      }
    }
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
      // Find out if we have to use the parser given for all columns or there is an individual parser
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
      if (tm.beforeUpdate('sorter')) {
        var orders = this.currentOrders,
            maxDepth = orders.length - 1,
            parsers = this.getParsers();

        if (orders.length !== 0) {
          var sorted = tm.getAvailableRows().sort(function (a, b) {
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

          tm.setAvailableRows(sorted);
        }
        tm.actionPipeline.notify('sorter');
      }
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
      iterate(tm.domElements.container.querySelectorAll('.sort-up, .sort-down'), function (i, cell) {
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
      if (typeof colIndex === 'string' && isNaN(parseInt(colIndex))) {
        var i = tm.id2index(colIndex);
        if (i != null) colIndex = i;
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
      var i18n = DATE_I18N[settings.preset];
      if (!i18n) errorThrow('Invalid preset name ' + settings.preset + ' given!');
      var formats = DATE_FORMATS[settings.preset];
      return function (a, b) {
        try {
          var aDate = false,
              bDate = void 0;
          var index = 0;
          while (!aDate && index < formats.length) {
            aDate = fecha.parse(a, formats[index]);
            bDate = fecha.parse(b, formats[index]);
            ++index;
          }
          if (!aDate) throw new Error('None of the given parsers matched!');
          return aDate - bDate;
        } catch (e) {
          errorThrow('Couldn\'t compare dates: ' + e);
        }
      };
    } else {
      errorThrow('Neither a preset nor a date format has been given!');
    }
  }, {
    preset: dateUtils.DATE_GERMAN
  })
};

module.exports = new Module({
  name: 'sorter',
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
    tm = this;

    var instance = new Sorter(settings);
    addClass(tm.domElements.container, 'tm-sorter');

    info('module sorter loaded');

    return {
      instance: instance,
      notify: function notify() {
        instance.sort();
      },
      getStats: function getStats() {
        var orders = instance.currentOrders.map(function (arr) {
          return {
            index: arr[0],
            order: arr[1] ? 'asc' : 'desc'
          };
        });
        return orders;
      },
      sortAsc: function sortAsc(index) {
        return instance.manage(index, false, true);
      },
      sortDesc: function sortDesc(index) {
        return instance.manage(index, false, false);
      },
      info: function info() {
        log(instance.currentOrders);
      }
    };
  }
});

},{"../dateUtils.js":4,"../utils.js":16,"./module.js":12}],15:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = require('./config.js');
var Module = require('./modules/module.js');
var Language = require('./language.js');
var ActionPipeline = require('./actionPipeline.js');
var EventSystem = require('./eventSystem.js');

var _require = require('./utils.js'),
    error = _require.error,
    warn = _require.warn,
    isNonEmptyString = _require.isNonEmptyString,
    extend = _require.extend,
    hasClass = _require.hasClass,
    addClass = _require.addClass,
    cloneArray = _require.cloneArray;

// used to create a unique id for each Tablemodify-instance


var getUniqueId = function () {
  var unique = 0;

  return function () {
    var id = 'tm-unique-' + unique;
    unique++;
    return id;
  };
}();

var Tablemodify = function () {
  function Tablemodify(selector, coreSettings) {
    _classCallCheck(this, Tablemodify);

    extend(coreSettings, config.coreDefaults);
    var containerId = void 0,
        oldTableParent = void 0,
        _this = this,
        table = document.querySelector(selector); // must be a table

    // ------------- ERROR PREVENTION ---------------------------
    // check if table is valid
    if (!table || table.nodeName !== 'TABLE') {
      error('there is no <table> with selector ' + selector);
      return null;
    }

    // check if Tm hasn't already been called for this table
    if (hasClass(table, 'tm-body')) {
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
    this.activeModules = {
      /**
      * a special module which is always notified after sth. happened on the table data
      * it only performs a re-rendering on the data
      */
      __renderer: {
        notify: function notify() {
          var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          var offset = msg.offset || 0,
              limit = msg.limit || Infinity;
          _this.render(limit, offset);
        }
      }
    };

    if (coreSettings.transition === 'fade') {
      this.render = this._transitionedRender;
    } else {
      this.render = this._standardRender;
    }

    this.tableSelector = selector;
    oldTableParent = table.parentElement;

    this.columnCount = 0;
    this.calculateColumnCount(table);

    this.currentLanguage = coreSettings.language;

    table.outerHTML = '<div class=\'tm-container\'>\n                        <style class=\'tm-custom-style\'></style>\n                        <div class=\'tm-body-wrap\'>\n                            ' + table.outerHTML + '\n                        </div>\n                    </div>';

    this.domElements = {
      container: oldTableParent.querySelector('.tm-container'),
      stylesheet: null,
      table: null,

      head: null,
      body: null,
      foot: null,

      headWrap: null,
      tableWrap: null,
      footWrap: null,

      origHead: null,
      origFoot: null
    };

    table = this.domElements.container.querySelector('table'); // important! reload body variable
    this.domElements.table = table;
    this.domElements.tableWrap = table.parentElement;
    this.domElements.stylesheet = this.domElements.tableWrap.previousElementSibling;
    this.domElements.head = table.tHead;
    this.domElements.body = table.tBodies[0];
    this.domElements.foot = table.tFoot;
    this.domElements.origHead = table.tHead;
    this.domElements.origFoot = table.tFoot;

    // add optional id to container
    this.domElements.container.id = containerId;
    this.containerId = containerId;

    // add theme class to container
    addClass(this.domElements.container, 'tm-theme-' + coreSettings.theme);
    addClass(table, 'tm-body');

    this.allRows = [].slice.call(this.domElements.body.rows);
    // an array containing references to all available tr elements. They are not necessarily displayed in the DOM
    this.availableRows = cloneArray(this.allRows);

    this.actionPipeline = new ActionPipeline(this);
    this.eventSystem = new EventSystem(this);
    this.coreSettings = coreSettings;

    // call all modules
    if (coreSettings.modules) {
      Object.keys(Tablemodify.modules).forEach(function (moduleName) {
        if (coreSettings.modules.hasOwnProperty(moduleName)) {
          // activate module?
          var module = Tablemodify.modules[moduleName],
              moduleSettings = coreSettings.modules[moduleName],
              moduleReturn = void 0;
          moduleReturn = module.getModule(_this, moduleSettings);

          if (moduleReturn !== undefined) {
            if (_this.activeModules[moduleName] === undefined) {
              // define ret as a property of the Tablemodify instance.
              // now you can access it later via tm.modulename
              _this.activeModules[moduleName] = moduleReturn;
            } else {
              error('module name ' + moduleName + ' causes a collision and is not allowed, please choose another one!');
            }
          }
        }
      });
    }

    // initialisation completed, now start first reload
    this.actionPipeline.notify('__reload');
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
        this.domElements.stylesheet.appendChild(document.createTextNode(text.trim()));
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
    key: 'getAvailableRows',
    value: function getAvailableRows() {
      return this.availableRows;
    }

    /**
     *  get array of references to all rows, both hidden and visible
     */

  }, {
    key: 'getAllRows',
    value: function getAllRows() {
      return this.allRows;
    }

    /**
     * setter
     */

  }, {
    key: 'setAvailableRows',
    value: function setAvailableRows(arr) {
      this.availableRows = arr;
      return this;
    }

    /**
     * setter
     */

  }, {
    key: 'setAllRows',
    value: function setAllRows(arr) {
      this.allRows = arr;
      return this;
    }
    /**
     * returns number of available rows
     */

  }, {
    key: 'countAvailableRows',
    value: function countAvailableRows() {
      return this.availableRows.length;
    }

    /**
     * returns number of hidden rows
     */

  }, {
    key: 'countHiddenRows',
    value: function countHiddenRows() {
      return this.allRows.length - this.availableRows.length;
    }

    /*
     * returns number of all rows
     */

  }, {
    key: 'countAllRows',
    value: function countAllRows() {
      return this.allRows.length;
    }
  }, {
    key: 'render',
    value: function render() {
      throw new Error('an error occured! tablemodify is not able to render the table');
    }

    /**
     * show all the rows that the param rowArray contains (as references).
     * used by filter module
     */

  }, {
    key: '_standardRender',
    value: function _standardRender() {
      var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Infinity;
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      this.clearDOM();
      var fragment = document.createDocumentFragment();

      if (limit === Infinity || limit + offset > this.availableRows.length) {
        limit = this.availableRows.length;
      } else {
        limit += offset;
      }

      while (offset < this.availableRows.length && offset < limit) {
        fragment.appendChild(this.availableRows[offset]);
        offset++;
      }

      this.domElements.body.appendChild(fragment);
      this.actionPipeline.notify('__renderer');
      return this;
    }
  }, {
    key: '_transitionedRender',
    value: function _transitionedRender() {
      var _this2 = this;

      var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Infinity;
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var func = function func() {
        _this2.domElements.body.removeEventListener('transitionend', func);
        _this2._standardRender(limit, offset);
        _this2.domElements.body.style.opacity = 1;
      };
      this.domElements.body.addEventListener('transitionend', func);
      this.domElements.body.style.opacity = 0.3;

      setTimeout(function () {
        _this2.domElements.body.style.opacity = 1;
      }, 2000);

      return this;
    }

    /**
     * efficient way to empty the visible table rows
     * @return this for chaining
     */

  }, {
    key: 'clearDOM',
    value: function clearDOM() {
      var body = this.domElements.body;
      while (body.firstChild) {
        body.removeChild(body.firstChild);
      }
      return this;
    }

    /**
     * clears the body and appends new rows
     * @param data: array or string
     * @return this for chaining
     */

  }, {
    key: 'insertRows',
    value: function insertRows(data) {
      return this.clearDOM().setAllRows([]).appendRows(data);
    }

    /**
     * appends rows to the table and updates the internal availableRows & hiddenRows arrays
     * @param data: array or string
     * @return this for chaining
     */

  }, {
    key: 'appendRows',
    value: function appendRows(data) {
      if (typeof data === 'string') {
        this.domElements.body.innerHTML = data;
        data = [].slice.call(this.domElements.body.children);
      }

      if (Array.isArray(data)) {
        var all = this.getAllRows().concat(data);

        this.setAllRows(all).setAvailableRows(all);

        if (this.coreSettings.usesExternalData) {
          this.actionPipeline.notify('__renderer');
        } else {
          this.reload();
        }
      }
      return this;
    }
  }, {
    key: 'removeRows',
    value: function removeRows(arr) {
      var allRows = [];
      if (arr !== null) {
        allRows = this.getAllRows().filter(function (tr) {
          return arr.indexOf(tr) === -1;
        });
      }

      this.clearDOM().setAllRows(allRows).setAvailableRows(allRows).reload();
      return this;
    }

    /**
     * clears DOM and then does appendRaw(). See it for more information
     * @param {array} data
     * @return this for chaining
     */

  }, {
    key: 'insertRaw',
    value: function insertRaw(data) {
      return this.clearDOM().appendRaw(data);
    }

    /**
     * appends data of a special raw data type:
     * @param {array} data: 2D-array of objects like this: {c: "content", a: {attribute1: value, attribute2: value}}
     * @return this for chaining
     */

  }, {
    key: 'appendRaw',
    value: function appendRaw(data) {
      var trPattern = document.createElement('tr'),
          tdPattern = document.createElement('td');

      for (var i = 0; i < data.length; i++) {
        var tr = trPattern.cloneNode(),
            row = data[i];

        var _loop = function _loop(j) {
          var td = tdPattern.cloneNode(),
              cell = row[j];
          td.innerHTML = cell.c;
          if (cell.hasOwnProperty('a')) {
            Object.keys(cell.a).forEach(function (prop) {
              td.addAttribute(prop, cell.a[prop]);
            });
          }
          tr.appendChild(td);
        };

        for (var j = 0; j < row.length; j++) {
          _loop(j);
        }
        this.allRows.push(tr);
      }
      this.reload();
      return this;
    }

    /**
     * called when any module detects a change and before it performs its actions.
     * if a "beforeUpdate" function is passed at the tablemodiy initialisation, it will be called.
     * the module only does something if this method doesn't return false
     * @param {string} moduleName: which module calls this method
     */

  }, {
    key: 'beforeUpdate',
    value: function beforeUpdate(moduleName) {
      var _this3 = this;

      // beforeUpdate method passed? Just go on if not.
      if (!this.coreSettings.hasOwnProperty('beforeUpdate')) return true;

      // collect all necessary data
      var infos = {};
      ['sorter', 'filter', 'pager'].forEach(function (name) {
        if (_this3.isActive(name)) {
          infos[name] = _this3.getModule(name).getStats();
        }
      });

      var ret = this.coreSettings.beforeUpdate(infos, moduleName);
      return ret === null || ret === undefined || ret === true;
    }

    /**
     * check if a module is acitve
     * @param {string} name: name of modules
     * @return {boolean}
    */

  }, {
    key: 'isActive',
    value: function isActive(name) {
      return this.activeModules.hasOwnProperty(name);
    }

    /**
     * returns the module if it is active
     * @param {string} name: name of the module
     * @return {object} module return of null if module is not active
     */

  }, {
    key: 'getModule',
    value: function getModule(name) {
      if (this.isActive(name)) {
        return this.activeModules[name];
      }
      return null;
    }

    /**
     * get the index of the table header cell with the passed tm-id attribute
     * @param {string} tmId
     * @return {number} index if it exists, null otherwise
     */

  }, {
    key: 'id2index',
    value: function id2index(tmId) {
      var cell = this.domElements.container.querySelector('thead > tr > *[tm-id=' + tmId + ']');
      if (!cell) return null;
      return [].indexOf.call(cell.parentNode.children, cell);
    }

    /**
     * returns the tm-id of a table header cell with the passed index
     * @param {number} index
     * @return {string} tm-id
     */

  }, {
    key: 'index2id',
    value: function index2id(index) {
      index++;
      var cell = this.domElements.container.querySelector('thead > tr:first-of-type > *:nth-of-type(' + index + ')');
      if (!cell) return null;
      return cell.getAttribute('tm-id');
    }

    /**
     * initiates reloading through the action pipeline
     * @return this for chaining
     */

  }, {
    key: 'reload',
    value: function reload() {
      this.actionPipeline.notify('__reload');
      return this;
    }

    /**
     * register an event listener to this tm instance.
     * multiple listeners can listen to the same event and will be fired in the same order as they are applied.
     * (!) not a normal js Event
     * @param {string} eventName
     * @param {function} func
     * @return this for chaining
     */

  }, {
    key: 'on',
    value: function on(eventName, func) {
      this.eventSystem.on(eventName, func);
      return this;
    }

    /**
     * trigger an event on this tm instance
     * (!) tm event, not a normal js event
     * @param {string} eventName
     * @return this for chaining
     */

  }, {
    key: 'trigger',
    value: function trigger(eventName) {
      var _eventSystem;

      for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      (_eventSystem = this.eventSystem).trigger.apply(_eventSystem, [eventName].concat(params));
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
      if (typeof module === 'function') {
        // Create a new module based on the given name and initializer function
        return this.addModule(new Module({
          name: name,
          initializer: module
        }));
      } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') {
        // Check if it is a Module instance
        if (module instanceof Module) {
          // if the module already exists, throw
          if (this.modules[module.name]) {
            var errorMsg = 'Module ' + module.name + ' does already exist!';
            error(errorMsg);
            throw new Error(errorMsg);
          }
          this.modules[module.name] = module;
          // Treat the objects as parameters for new module instance
        } else {
          // If a name is given as parameter, override a name in the parameters object
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
  }]);

  return Tablemodify;
}();

// order is important! modules will be initialized in this order


Tablemodify.modules = {
  columnStyles: require('./modules/columnStyles.js'),
  fixed: require('./modules/fixed.js'),
  filter: require('./modules/filter.js'),
  sorter: require('./modules/sorter.js'),
  pager: require('./modules/pager.js') //,
  // resizer: require('./modules/resizer.js')
};

Tablemodify.languages = {
  en: new Language('en', {
    FILTER_DISCARD: 'discard filter',
    FILTER_PLACEHOLDER: 'type filter here',
    FILTER_CASESENSITIVE: 'case-sensitive',
    FILTER_MATCHING: 'matching',
    FILTER_COMPARATOR: 'comparator',
    FILTER_RANGE: 'range',
    FILTER_RANGE_LIMIT: 'upper limit',
    FILTER_TITLE_STRING: 'string search',
    FILTER_TITLE_NUMERIC: 'numeric search',
    FILTER_TITLE_DATE: 'date search',
    PAGER_PAGENUMBER_SEPARATOR: ' / '
  }),
  de: new Language('de', {
    FILTER_DISCARD: 'Eingabe verwerfen',
    FILTER_PLACEHOLDER: 'Filter eingeben',
    FILTER_CASESENSITIVE: 'Gro&szlig; - und Kleinschreibung unterscheiden',
    FILTER_MATCHING: 'Exakte Suche',
    FILTER_COMPARATOR: 'Vergleichsoperator',
    FILTER_RANGE: 'Zahlenbereich',
    FILTER_RANGE_LIMIT: 'obere Grenze',
    FILTER_TITLE_STRING: 'Filter nach Zeichenketten',
    FILTER_TITLE_NUMERIC: 'Numerischer Filter',
    FILTER_TITLE_DATE: 'Datumsfilter',
    PAGER_PAGENUMBER_SEPARATOR: ' / '
  })
};

Tablemodify.Language = Language;
// Store reference to the module class for user-defined modules
Tablemodify.Module = Module;
// set version of Tablemodify
Tablemodify.version = 'v0.9.6';
// make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;

},{"./actionPipeline.js":2,"./config.js":3,"./eventSystem.js":5,"./language.js":6,"./modules/columnStyles.js":7,"./modules/filter.js":8,"./modules/fixed.js":11,"./modules/module.js":12,"./modules/pager.js":13,"./modules/sorter.js":14,"./utils.js":16}],16:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var config = require('./config.js');
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
function hasClass(el, className) {
  return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
}
exports.hasClass = hasClass;
exports.addClass = function (el, className) {
  if (el.classList) el.classList.add(className);else if (!hasClass(el, className)) el.className += ' ' + className;
  return el;
};
exports.removeClass = function (el, className) {
  if (el.classList) el.classList.remove(className);else el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
  return el;
};
/**
 *  get index of an HTML-element,
 * for example the index of a cell in the row
 */
exports.elementIndex = function (node) {
  try {
    var index = 0;
    while (node = node.previousElementSibling) {
      index++;
    }
    return index;
  } catch (e) {
    return -1;
  }
};
/**
 * Extended version of the "extend"-Function. Supports multiple sources,
 * extends deep recursively.
 */
exports.extend = function extend(destination) {
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
          extend(destination[key], source[key]);
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
    var _l = elems.length;
    for (var _i = 0; _i < _l; _i++) {
      // value, index @TODO umdrehen für konsistenz, an allen stellen anpassen -> index, value
      func(elems[_i], _i);
    }
  }
};

exports.isNonEmptyString = function (str) {
  return typeof str === 'string' && str.trim().length > 0;
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
exports.isNumber = function (val) {
  return typeof val === 'number' && !isNaN(val);
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
    finds head cell with tm-id = tmId and returns its index
    */
function id2index(tmId) {
  var cell = document.querySelector('thead > tr > *[tm-id=' + tmId + ']');
  if (!cell) return null;
  return [].indexOf.call(cell.parentNode.children, cell);
}
/**
    ersetze alle spalten, die über die tm-id identifiziert werden, durch ihren index
*/
exports.replaceIdsWithIndices = function (columns) {
  Object.keys(columns).forEach(function (key) {
    if (key !== 'all' && isNaN(key)) {
      var index = id2index(key);
      if (index != null) {
        columns[index] = columns[key];
        delete columns[key];
      }
    }
  });
  return columns;
};

// fastest way to clone an array
exports.cloneArray = function (arr) {
  var ret = [],
      i = arr.length;
  while (i--) {
    ret[i] = arr[i];
  }return ret;
};

exports.delay = function () {
  var ms = 400,
      t = void 0;

  return function (cb) {
    window.clearTimeout(t);
    t = window.setTimeout(cb, ms);
  };
}();

},{"./config.js":3}]},{},[15]);
