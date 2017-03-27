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

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./utils.js'),
    error = _require.error;
/*
 findet eine �nderung statt, wird sie dem jeweils n�chsten aktiven Modul in der Hierarchie gemeldet.
 */


var RELOAD = '__reload',
    FILTER = 'filter',
    SORTER = 'sorter',
    PAGER = 'pager',
    RENDERER = '__renderer',
    FIXED = 'fixed';

// order is super important and must not be changed!!!
var hierarchy = [RELOAD, FILTER, SORTER, PAGER, RENDERER, FIXED];

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
			this.tm.trigger('action', sender);
			try {
				var receiver = this._getSuccessor(sender);
				if (receiver != null) receiver.notify(msg);
			} catch (e) {
				error(e);
			}
		}
	}, {
		key: '_getSuccessor',
		value: function _getSuccessor(sender) {
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

},{"./utils.js":15}],3:[function(require,module,exports){
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
    FILTER_PLACEHOLDER: 'type filter here',
    FILTER_CASESENSITIVE: 'case-sensitive',
    PAGER_PAGENUMBER_SEPARATOR: ' / '
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
            return '';
        }
    }]);

    return Language;
}();

},{"./utils.js":15}],7:[function(require,module,exports){
'use strict';

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
        try {
            addClass(this.container, 'tm-column-styles');

            var containerId = this.containerId;
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
            this.appendStyles(text);
            info('module columnStyles loaded');

            return {
                unset: function unset() {
                    // no implementation needed
                    info('unsetting columnStyles');
                }
            };
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":15,"./module.js":10}],8:[function(require,module,exports){
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
            if (this.tm.beforeUpdate('filter')) {
                var indices = this.getIndices(),
                    patterns = this.getPatterns(),
                    options = this.getOptions(),
                    all = this.tm.getAllRows(),
                    matching = [],
                    notMatching = [];

                var maxDeph = indices.length - 1;
                // filter rows
                for (var i = 0; i < all.length; i++) {
                    var row = all[i],
                        deph = 0,
                        matches = true;

                    while (matches && deph <= maxDeph) {
                        var j = indices[deph],
                            pattern = patterns[deph],
                            tester = row.cells[j].textContent;

                        if (!options[deph]) {
                            // not case-sensitive
                            pattern = pattern.toLowerCase();
                            tester = tester.toLowerCase();
                        }

                        matches = tester.indexOf(pattern) !== -1;
                        deph++;
                    }

                    if (matches) {
                        matching.push(row);
                    } else {
                        notMatching.push(row);
                    }
                }

                this.tm.setAvailableRows(matching).setHiddenRows(notMatching).actionPipeline.notify('filter');
            }
            return this;
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
        /*
        tm.body.addEventListener('tmRowsAdded', () => {
            if (this.anyFilterActive()) this.run();
        });*/

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
                getStats: function getStats() {
                    return {
                        patterns: instance.getPatterns(),
                        indices: instance.getIndices(),
                        options: instance.getOptions()
                    };
                },
                notify: function notify() {
                    instance.run();
                },
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

},{"../utils.js":15,"./module.js":10}],9:[function(require,module,exports){
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

                notify: function notify() {
                    renderHead();
                    renderFoot();
                },

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

},{"../utils.js":15,"./module.js":10}],10:[function(require,module,exports){
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
 *  these is the default return object of every Module
 */
var defaultReturns = {
    instance: {},
    unset: function unset() {},
    getStats: function getStats() {},
    info: function info() {},
    notify: function notify() {}
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
            return extend2(this.initializer.call(tableModify, settings, this), defaultReturns);
        }
    }]);

    return Module;
}();

},{"../utils.js":15}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = require('./module.js');

var _require = require('../utils.js'),
    addClass = _require.addClass,
    error = _require.error,
    extend2 = _require.extend2,
    delay = _require.delay;

var Controller = function () {
	function Controller(sets, pager) {
		var _this2 = this;

		_classCallCheck(this, Controller);

		var _this = this;
		extend2(this, sets);

		Object.keys(this).forEach(function (key) {
			if (_this2[key] == null) {
				throw new Exception(key + ' setting must be set!');
			} else {
				_this2[key] = document.querySelector(_this2[key]);
			}
		});

		this.pager = pager;

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
			_this.setCurrentPageNumber(val);
			_this.pager.update().run();
		});

		this.limit.addEventListener('change', function () {
			var val = _this.limit.value;
			console.log(val);
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
			var val = this.number.value;
			var totalPages = this.getTotalPages();
			if (isNaN(val) || val < 1 && totalPages != 0) {
				this.setCurrentPageNumber(1);
			} else if (val > totalPages) {
				this.setCurrentPageNumber(totalPages);
			}
			return parseInt(this.getCurrentPageNumber() - 1) * this.getLimit();
		}
	}, {
		key: 'getLimit',
		value: function getLimit() {
			return parseInt(this.limit.value);
		}
	}, {
		key: 'getTotalPages',
		value: function getTotalPages() {
			var total = 0;

			if (this.pager.totalManually && this.pager.totalManually >= 0) {
				total = this.pager.totalManually;
			} else {
				total = this.pager.tm.countAvailableRows();
			}

			return Math.ceil(total / this.getLimit());
		}
	}, {
		key: 'setCurrentPageNumber',
		value: function setCurrentPageNumber(num) {
			num = parseInt(num);

			if (!isNaN(num)) {
				var innerHeight = parseInt(window.getComputedStyle(this.number).height);
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
				this.total.innerHTML = this.pager.tm.getTerm('PAGER_PAGENUMBER_SEPARATOR') + this.getTotalPages() + ' ';
			}
			return this;
		}
	}, {
		key: 'updatePageNumber',
		value: function updatePageNumber() {
			var totalPages = this.getTotalPages();
			if (this.getCurrentPageNumber() > totalPages) {
				this.setCurrentPageNumber(totalPages);
				this.pager.update().run();
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
	function Pager(tm, settings) {
		_classCallCheck(this, Pager);

		this.tm = tm;
		this.offset = parseInt(settings.offset);
		this.limit = parseInt(settings.limit);
		this.totalManually = parseInt(settings.totalManually);
		this.controller = new Controller(settings.controller, this);

		this.update();

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
			if (this.tm.beforeUpdate('pager')) {
				this.tm.actionPipeline.notify('pager', {
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

		//

	}, {
		key: 'setTotalManually',
		value: function setTotalManually(num) {
			this.totalManually = parseInt(num);
			this.update();
			//this.controller.updateTotalPages();
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
		limit: Infinity,
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
			var instance = new Pager(this, settings); // this = tablemodify
			addClass(this.container, 'tm-pager');

			// initialize the pager internal values
			instance.update();

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

},{"../utils.js":15,"./module.js":10}],12:[function(require,module,exports){
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
    return tr.cells[i].textContent.trim().toLowerCase();
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
            rows: []
        });

        settings.columns = replaceIdsWithIndices(settings.columns);
        //Store a reference to the tablemodify instance
        this.tm = tableModify;

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
            if (this.tm.beforeUpdate('sorter')) {
                var orders = this.currentOrders,
                    maxDepth = orders.length - 1,
                    parsers = this.getParsers();

                if (orders.length !== 0) {
                    var sorted = this.tm.getAvailableRows().sort(function (a, b) {
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

                    this.tm.setAvailableRows(sorted);
                }
                this.tm.actionPipeline.notify('sorter');
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

            if (typeof colIndex == 'string' && isNaN(parseInt(colIndex))) {
                var i = this.tm.id2index(colIndex);

                if (i != null) colIndex = i;
            }

            /*
               if (!this.getIsEnabled(colIndex)) {
                   warn(`Tried to sort by non-sortable column index ${colIndex}`);
                   return this;
               }*/
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
                    if (!aDate) throw new Error("None of the given parsers matched!");
                    return aDate - bDate;
                } catch (e) {
                    errorThrow('Couldn\'t compare dates: ' + e);
                }
            };
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
        var instance = new Sorter(this, settings);
        addClass(this.container, 'tm-sorter');

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
                console.log(instance.currentOrders);
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

},{"../dateUtils.js":4,"../utils.js":15,"./module.js":10}],13:[function(require,module,exports){
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

},{"../utils.js":15,"./module.js":10}],14:[function(require,module,exports){
"use strict";

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
    iterate = _require.iterate,
    extend = _require.extend,
    hasClass = _require.hasClass,
    addClass = _require.addClass,
    removeClass = _require.removeClass,
    getUniqueId = _require.getUniqueId,
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
                    _this.render(limit, offset).actionPipeline.notify('__renderer');
                }
            }
        };

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
        this.DOM = this.body.tBodies[0];
        // contains all tr-nodes that are not displayed at the moment
        this.hiddenRows = [];
        // an array containing references to all available tr elements. They are not necessarily displayed in the DOM
        this.availableRows = [].slice.call(this.DOM.rows);

        this.actionPipeline = new ActionPipeline(this);
        this.eventSystem = new EventSystem(this);
        this.coreSettings = coreSettings;

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
        key: 'getAvailableRows',
        value: function getAvailableRows() {
            return this.availableRows;
        }

        /**
         *  get array of references to the hidden rows
         */

    }, {
        key: 'getHiddenRows',
        value: function getHiddenRows() {
            return this.hiddenRows;
        }

        /**
         *  get array of references to all rows, both hidden and visible
         */

    }, {
        key: 'getAllRows',
        value: function getAllRows() {
            return this.availableRows.concat(this.hiddenRows);
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
        key: 'setHiddenRows',
        value: function setHiddenRows(arr) {
            this.hiddenRows = arr;
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
            return this.hiddenRows.length;
        }

        /**
         * show all the rows that the param rowArray contains (as references).
         * used by filter module
         */

    }, {
        key: 'render',
        value: function render() {
            var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Infinity;
            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this.clearDOM();
            var fragment = document.createDocumentFragment();

            if (limit === Infinity || limit + offset > this.availableRows.length) {
                limit = this.availableRows.length;
            } else {
                limit += offset;
            }
            /*
            for (; offset < limit; offset++) {
            fragment.appendChild(this.availableRows[offset]);
            }*/
            while (this.availableRows[offset] !== undefined && offset < limit) {
                fragment.appendChild(this.availableRows[offset]);
                offset++;
            }

            this.DOM.appendChild(fragment);
            return this;
        }

        /**
         * efficient way to empty the visible table rows
         * @return this for chaining
         */

    }, {
        key: 'clearDOM',
        value: function clearDOM() {
            while (this.DOM.firstChild) {
                this.DOM.removeChild(this.DOM.firstChild);
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
            return this.clearDOM().appendRows(data);
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
                this.DOM.innerHTML += data;
            } else if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    this.DOM.appendChild(data[i]);
                }
            }
            this.setAvailableRows([].slice.call(this.DOM)).setHiddenRows([]);

            return this;
        }
    }, {
        key: 'removeRows',
        value: function removeRows() {
            this.clearDOM().setHiddenRows([]).setAvailableRows([]).reload();
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
                this.availableRows.push(tr);
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
            var _this2 = this;

            // beforeUpdate method passed? Just go on if not.
            if (!this.coreSettings.hasOwnProperty('beforeUpdate')) return true;

            // collect all necessary data
            var infos = {};
            ['sorter', 'filter', 'pager'].forEach(function (name) {
                if (_this2.isActive(name)) {
                    infos[name] = _this2.getModule(name).getStats();
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
            var cell = this.container.querySelector('thead > tr > *[tm-id=' + tmId + ']');
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
            var cell = this.container.querySelector('thead > tr:first-of-type > *:nth-of-type(' + index + ')');
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
    pager: require('./modules/pager.js'),
    zebra: require('./modules/zebra.js')
};

Tablemodify.languages = {
    en: new Language('en', {
        FILTER_PLACEHOLDER: 'type filter here',
        FILTER_CASESENSITIVE: 'case-sensitive',
        PAGER_PAGENUMBER_SEPARATOR: ' / '
    }),
    de: new Language('de', {
        FILTER_PLACEHOLDER: 'Filter eingeben',
        FILTER_CASESENSITIVE: 'Gro�- und Kleinschreibung unterscheiden',
        PAGER_PAGENUMBER_SEPARATOR: ' / '
    })
};

Tablemodify.Language = Language;
//Store reference to the module class for user-defined modules
Tablemodify.Module = Module;
// set version of Tablemodify
Tablemodify.version = 'v0.9.5';
//make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;

},{"./actionPipeline.js":2,"./config.js":3,"./eventSystem.js":5,"./language.js":6,"./modules/columnStyles.js":7,"./modules/filter.js":8,"./modules/fixed.js":9,"./modules/module.js":10,"./modules/pager.js":11,"./modules/sorter.js":12,"./modules/zebra.js":13,"./utils.js":15}],15:[function(require,module,exports){
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

exports.delay = function () {
    var ms = 400,
        t = void 0;

    return function (cb) {
        window.clearTimeout(t);
        t = window.setTimeout(cb, ms);
    };
}();

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

},{"./config.js":3}]},{},[14]);
