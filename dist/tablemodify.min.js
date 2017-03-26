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

			if (isNaN(val) || val < 1) {
				this.setCurrentPageNumber(1);
			} else if (val > this.getTotalPages()) {
				this.setCurrentPageNumber(this.getTotalPages());
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
		key: 'update',
		value: function update() {
			this.updateTotalPages();
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
			this.controller.updateTotalPages();
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
            this.setAvailableRows([].slice.call(this.DOM));
            this.setHiddenRows([]);
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

},{"./config.js":3}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZmVjaGEvZmVjaGEuanMiLCJzcmNcXGFjdGlvblBpcGVsaW5lLmpzIiwic3JjXFxjb25maWcuanMiLCJzcmNcXGRhdGVVdGlscy5qcyIsInNyY1xcZXZlbnRTeXN0ZW0uanMiLCJzcmNcXGxhbmd1YWdlLmpzIiwic3JjXFxtb2R1bGVzXFxjb2x1bW5TdHlsZXMuanMiLCJzcmNcXG1vZHVsZXNcXGZpbHRlci5qcyIsInNyY1xcbW9kdWxlc1xcZml4ZWQuanMiLCJzcmNcXG1vZHVsZXNcXG1vZHVsZS5qcyIsInNyY1xcbW9kdWxlc1xccGFnZXIuanMiLCJzcmNcXG1vZHVsZXNcXHNvcnRlci5qcyIsInNyY1xcbW9kdWxlc1xcemVicmEuanMiLCJzcmNcXHRhYmxlbW9kaWZ5LmpzIiwic3JjXFx1dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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WUFBTTtBQUN0QixRQUFJLEtBQUssR0FBVDtBQUFBLFFBQWMsVUFBZDs7QUFFQSxXQUFPLFVBQUMsRUFBRCxFQUFRO0FBQ2QsZUFBTyxZQUFQLENBQW9CLENBQXBCO0FBQ0EsWUFBSSxPQUFPLFVBQVAsQ0FBa0IsRUFBbEIsRUFBc0IsRUFBdEIsQ0FBSjtBQUNBLEtBSEQ7QUFJQSxDQVBlLEVBQWhCOztBQVNBOzs7QUFHQSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0I7QUFDcEIsUUFBSSxPQUFPLFNBQVMsYUFBVCxDQUF1QiwwQkFBd0IsSUFBeEIsR0FBNkIsR0FBcEQsQ0FBWDtBQUNBLFFBQUksQ0FBQyxJQUFMLEVBQVcsT0FBTyxJQUFQO0FBQ1gsV0FBTyxHQUFHLE9BQUgsQ0FBVyxJQUFYLENBQWdCLEtBQUssVUFBTCxDQUFnQixRQUFoQyxFQUEwQyxJQUExQyxDQUFQO0FBQ0g7QUFDRDs7O0FBR0EsUUFBUSxxQkFBUixHQUFnQyxVQUFDLE9BQUQsRUFBYTtBQUN6QyxXQUFPLElBQVAsQ0FBWSxPQUFaLEVBQXFCLE9BQXJCLENBQTZCLFVBQUMsR0FBRCxFQUFTO0FBQ2xDLFlBQUcsT0FBTyxLQUFQLElBQWdCLE1BQU0sR0FBTixDQUFuQixFQUErQjtBQUMzQixnQkFBSSxRQUFRLFNBQVMsR0FBVCxDQUFaO0FBQ0EsZ0JBQUksU0FBUyxJQUFiLEVBQW1CO0FBQ2Ysd0JBQVEsS0FBUixJQUFpQixRQUFRLEdBQVIsQ0FBakI7QUFDQSx1QkFBTyxRQUFRLEdBQVIsQ0FBUDtBQUNIO0FBQ0o7QUFDSixLQVJEO0FBU0EsV0FBTyxPQUFQO0FBQ0gsQ0FYRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKG1haW4pIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBQYXJzZSBvciBmb3JtYXQgZGF0ZXNcbiAgICogQGNsYXNzIGZlY2hhXG4gICAqL1xuICB2YXIgZmVjaGEgPSB7fTtcbiAgdmFyIHRva2VuID0gL2R7MSw0fXxNezEsNH18WVkoPzpZWSk/fFN7MSwzfXxEb3xaWnwoW0hoTXNEbV0pXFwxP3xbYUFdfFwiW15cIl0qXCJ8J1teJ10qJy9nO1xuICB2YXIgdHdvRGlnaXRzID0gL1xcZFxcZD8vO1xuICB2YXIgdGhyZWVEaWdpdHMgPSAvXFxkezN9LztcbiAgdmFyIGZvdXJEaWdpdHMgPSAvXFxkezR9LztcbiAgdmFyIHdvcmQgPSAvWzAtOV0qWydhLXpcXHUwMEEwLVxcdTA1RkZcXHUwNzAwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdK3xbXFx1MDYwMC1cXHUwNkZGXFwvXSsoXFxzKj9bXFx1MDYwMC1cXHUwNkZGXSspezEsMn0vaTtcbiAgdmFyIGxpdGVyYWwgPSAvXFxbKFteXSo/KVxcXS9nbTtcbiAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7XG4gIH07XG5cbiAgZnVuY3Rpb24gc2hvcnRlbihhcnIsIHNMZW4pIHtcbiAgICB2YXIgbmV3QXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbmV3QXJyLnB1c2goYXJyW2ldLnN1YnN0cigwLCBzTGVuKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdBcnI7XG4gIH1cblxuICBmdW5jdGlvbiBtb250aFVwZGF0ZShhcnJOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCB2LCBpMThuKSB7XG4gICAgICB2YXIgaW5kZXggPSBpMThuW2Fyck5hbWVdLmluZGV4T2Yodi5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHYuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKH5pbmRleCkge1xuICAgICAgICBkLm1vbnRoID0gaW5kZXg7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhZCh2YWwsIGxlbikge1xuICAgIHZhbCA9IFN0cmluZyh2YWwpO1xuICAgIGxlbiA9IGxlbiB8fCAyO1xuICAgIHdoaWxlICh2YWwubGVuZ3RoIDwgbGVuKSB7XG4gICAgICB2YWwgPSAnMCcgKyB2YWw7XG4gICAgfVxuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICB2YXIgZGF5TmFtZXMgPSBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J107XG4gIHZhciBtb250aE5hbWVzID0gWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XG4gIHZhciBtb250aE5hbWVzU2hvcnQgPSBzaG9ydGVuKG1vbnRoTmFtZXMsIDMpO1xuICB2YXIgZGF5TmFtZXNTaG9ydCA9IHNob3J0ZW4oZGF5TmFtZXMsIDMpO1xuICBmZWNoYS5pMThuID0ge1xuICAgIGRheU5hbWVzU2hvcnQ6IGRheU5hbWVzU2hvcnQsXG4gICAgZGF5TmFtZXM6IGRheU5hbWVzLFxuICAgIG1vbnRoTmFtZXNTaG9ydDogbW9udGhOYW1lc1Nob3J0LFxuICAgIG1vbnRoTmFtZXM6IG1vbnRoTmFtZXMsXG4gICAgYW1QbTogWydhbScsICdwbSddLFxuICAgIERvRm46IGZ1bmN0aW9uIERvRm4oRCkge1xuICAgICAgcmV0dXJuIEQgKyBbJ3RoJywgJ3N0JywgJ25kJywgJ3JkJ11bRCAlIDEwID4gMyA/IDAgOiAoRCAtIEQgJSAxMCAhPT0gMTApICogRCAlIDEwXTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGZvcm1hdEZsYWdzID0ge1xuICAgIEQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldERhdGUoKTtcbiAgICB9LFxuICAgIEREOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0RGF0ZSgpKTtcbiAgICB9LFxuICAgIERvOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5Eb0ZuKGRhdGVPYmouZ2V0RGF0ZSgpKTtcbiAgICB9LFxuICAgIGQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldERheSgpO1xuICAgIH0sXG4gICAgZGQ6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXREYXkoKSk7XG4gICAgfSxcbiAgICBkZGQ6IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLmRheU5hbWVzU2hvcnRbZGF0ZU9iai5nZXREYXkoKV07XG4gICAgfSxcbiAgICBkZGRkOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gaTE4bi5kYXlOYW1lc1tkYXRlT2JqLmdldERheSgpXTtcbiAgICB9LFxuICAgIE06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBkYXRlT2JqLmdldE1vbnRoKCkgKyAxO1xuICAgIH0sXG4gICAgTU06IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNb250aCgpICsgMSk7XG4gICAgfSxcbiAgICBNTU06IGZ1bmN0aW9uKGRhdGVPYmosIGkxOG4pIHtcbiAgICAgIHJldHVybiBpMThuLm1vbnRoTmFtZXNTaG9ydFtkYXRlT2JqLmdldE1vbnRoKCldO1xuICAgIH0sXG4gICAgTU1NTTogZnVuY3Rpb24oZGF0ZU9iaiwgaTE4bikge1xuICAgICAgcmV0dXJuIGkxOG4ubW9udGhOYW1lc1tkYXRlT2JqLmdldE1vbnRoKCldO1xuICAgIH0sXG4gICAgWVk6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBTdHJpbmcoZGF0ZU9iai5nZXRGdWxsWWVhcigpKS5zdWJzdHIoMik7XG4gICAgfSxcbiAgICBZWVlZOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRGdWxsWWVhcigpO1xuICAgIH0sXG4gICAgaDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKSAlIDEyIHx8IDEyO1xuICAgIH0sXG4gICAgaGg6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRIb3VycygpICUgMTIgfHwgMTIpO1xuICAgIH0sXG4gICAgSDogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIGRhdGVPYmouZ2V0SG91cnMoKTtcbiAgICB9LFxuICAgIEhIOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKGRhdGVPYmouZ2V0SG91cnMoKSk7XG4gICAgfSxcbiAgICBtOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRNaW51dGVzKCk7XG4gICAgfSxcbiAgICBtbTogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldE1pbnV0ZXMoKSk7XG4gICAgfSxcbiAgICBzOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRTZWNvbmRzKCk7XG4gICAgfSxcbiAgICBzczogZnVuY3Rpb24oZGF0ZU9iaikge1xuICAgICAgcmV0dXJuIHBhZChkYXRlT2JqLmdldFNlY29uZHMoKSk7XG4gICAgfSxcbiAgICBTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChkYXRlT2JqLmdldE1pbGxpc2Vjb25kcygpIC8gMTAwKTtcbiAgICB9LFxuICAgIFNTOiBmdW5jdGlvbihkYXRlT2JqKSB7XG4gICAgICByZXR1cm4gcGFkKE1hdGgucm91bmQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSAvIDEwKSwgMik7XG4gICAgfSxcbiAgICBTU1M6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHJldHVybiBwYWQoZGF0ZU9iai5nZXRNaWxsaXNlY29uZHMoKSwgMyk7XG4gICAgfSxcbiAgICBhOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpIDwgMTIgPyBpMThuLmFtUG1bMF0gOiBpMThuLmFtUG1bMV07XG4gICAgfSxcbiAgICBBOiBmdW5jdGlvbihkYXRlT2JqLCBpMThuKSB7XG4gICAgICByZXR1cm4gZGF0ZU9iai5nZXRIb3VycygpIDwgMTIgPyBpMThuLmFtUG1bMF0udG9VcHBlckNhc2UoKSA6IGkxOG4uYW1QbVsxXS50b1VwcGVyQ2FzZSgpO1xuICAgIH0sXG4gICAgWlo6IGZ1bmN0aW9uKGRhdGVPYmopIHtcbiAgICAgIHZhciBvID0gZGF0ZU9iai5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgcmV0dXJuIChvID4gMCA/ICctJyA6ICcrJykgKyBwYWQoTWF0aC5mbG9vcihNYXRoLmFicyhvKSAvIDYwKSAqIDEwMCArIE1hdGguYWJzKG8pICUgNjAsIDQpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgcGFyc2VGbGFncyA9IHtcbiAgICBEOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5kYXkgPSB2O1xuICAgIH1dLFxuICAgIERvOiBbbmV3IFJlZ0V4cCh0d29EaWdpdHMuc291cmNlICsgd29yZC5zb3VyY2UpLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5kYXkgPSBwYXJzZUludCh2LCAxMCk7XG4gICAgfV0sXG4gICAgTTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubW9udGggPSB2IC0gMTtcbiAgICB9XSxcbiAgICBZWTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIHZhciBkYSA9IG5ldyBEYXRlKCksIGNlbnQgPSArKCcnICsgZGEuZ2V0RnVsbFllYXIoKSkuc3Vic3RyKDAsIDIpO1xuICAgICAgZC55ZWFyID0gJycgKyAodiA+IDY4ID8gY2VudCAtIDEgOiBjZW50KSArIHY7XG4gICAgfV0sXG4gICAgaDogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQuaG91ciA9IHY7XG4gICAgfV0sXG4gICAgbTogW3R3b0RpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWludXRlID0gdjtcbiAgICB9XSxcbiAgICBzOiBbdHdvRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5zZWNvbmQgPSB2O1xuICAgIH1dLFxuICAgIFlZWVk6IFtmb3VyRGlnaXRzLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC55ZWFyID0gdjtcbiAgICB9XSxcbiAgICBTOiBbL1xcZC8sIGZ1bmN0aW9uIChkLCB2KSB7XG4gICAgICBkLm1pbGxpc2Vjb25kID0gdiAqIDEwMDtcbiAgICB9XSxcbiAgICBTUzogWy9cXGR7Mn0vLCBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgZC5taWxsaXNlY29uZCA9IHYgKiAxMDtcbiAgICB9XSxcbiAgICBTU1M6IFt0aHJlZURpZ2l0cywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIGQubWlsbGlzZWNvbmQgPSB2O1xuICAgIH1dLFxuICAgIGQ6IFt0d29EaWdpdHMsIG5vb3BdLFxuICAgIGRkZDogW3dvcmQsIG5vb3BdLFxuICAgIE1NTTogW3dvcmQsIG1vbnRoVXBkYXRlKCdtb250aE5hbWVzU2hvcnQnKV0sXG4gICAgTU1NTTogW3dvcmQsIG1vbnRoVXBkYXRlKCdtb250aE5hbWVzJyldLFxuICAgIGE6IFt3b3JkLCBmdW5jdGlvbiAoZCwgdiwgaTE4bikge1xuICAgICAgdmFyIHZhbCA9IHYudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICh2YWwgPT09IGkxOG4uYW1QbVswXSkge1xuICAgICAgICBkLmlzUG0gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAodmFsID09PSBpMThuLmFtUG1bMV0pIHtcbiAgICAgICAgZC5pc1BtID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XSxcbiAgICBaWjogWy9bXFwrXFwtXVxcZFxcZDo/XFxkXFxkLywgZnVuY3Rpb24gKGQsIHYpIHtcbiAgICAgIHZhciBwYXJ0cyA9ICh2ICsgJycpLm1hdGNoKC8oW1xcK1xcLV18XFxkXFxkKS9naSksIG1pbnV0ZXM7XG5cbiAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICBtaW51dGVzID0gKyhwYXJ0c1sxXSAqIDYwKSArIHBhcnNlSW50KHBhcnRzWzJdLCAxMCk7XG4gICAgICAgIGQudGltZXpvbmVPZmZzZXQgPSBwYXJ0c1swXSA9PT0gJysnID8gbWludXRlcyA6IC1taW51dGVzO1xuICAgICAgfVxuICAgIH1dXG4gIH07XG4gIHBhcnNlRmxhZ3MuZGQgPSBwYXJzZUZsYWdzLmQ7XG4gIHBhcnNlRmxhZ3MuZGRkZCA9IHBhcnNlRmxhZ3MuZGRkO1xuICBwYXJzZUZsYWdzLkREID0gcGFyc2VGbGFncy5EO1xuICBwYXJzZUZsYWdzLm1tID0gcGFyc2VGbGFncy5tO1xuICBwYXJzZUZsYWdzLmhoID0gcGFyc2VGbGFncy5IID0gcGFyc2VGbGFncy5ISCA9IHBhcnNlRmxhZ3MuaDtcbiAgcGFyc2VGbGFncy5NTSA9IHBhcnNlRmxhZ3MuTTtcbiAgcGFyc2VGbGFncy5zcyA9IHBhcnNlRmxhZ3MucztcbiAgcGFyc2VGbGFncy5BID0gcGFyc2VGbGFncy5hO1xuXG5cbiAgLy8gU29tZSBjb21tb24gZm9ybWF0IHN0cmluZ3NcbiAgZmVjaGEubWFza3MgPSB7XG4gICAgJ2RlZmF1bHQnOiAnZGRkIE1NTSBERCBZWVlZIEhIOm1tOnNzJyxcbiAgICBzaG9ydERhdGU6ICdNL0QvWVknLFxuICAgIG1lZGl1bURhdGU6ICdNTU0gRCwgWVlZWScsXG4gICAgbG9uZ0RhdGU6ICdNTU1NIEQsIFlZWVknLFxuICAgIGZ1bGxEYXRlOiAnZGRkZCwgTU1NTSBELCBZWVlZJyxcbiAgICBzaG9ydFRpbWU6ICdISDptbScsXG4gICAgbWVkaXVtVGltZTogJ0hIOm1tOnNzJyxcbiAgICBsb25nVGltZTogJ0hIOm1tOnNzLlNTUydcbiAgfTtcblxuICAvKioqXG4gICAqIEZvcm1hdCBhIGRhdGVcbiAgICogQG1ldGhvZCBmb3JtYXRcbiAgICogQHBhcmFtIHtEYXRlfG51bWJlcn0gZGF0ZU9ialxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWFzayBGb3JtYXQgb2YgdGhlIGRhdGUsIGkuZS4gJ21tLWRkLXl5JyBvciAnc2hvcnREYXRlJ1xuICAgKi9cbiAgZmVjaGEuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGVPYmosIG1hc2ssIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGRhdGVPYmogPT09ICdudW1iZXInKSB7XG4gICAgICBkYXRlT2JqID0gbmV3IERhdGUoZGF0ZU9iaik7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRlT2JqKSAhPT0gJ1tvYmplY3QgRGF0ZV0nIHx8IGlzTmFOKGRhdGVPYmouZ2V0VGltZSgpKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIERhdGUgaW4gZmVjaGEuZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgbWFzayA9IGZlY2hhLm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZmVjaGEubWFza3NbJ2RlZmF1bHQnXTtcblxuICAgIHZhciBsaXRlcmFscyA9IFtdO1xuXG4gICAgLy8gTWFrZSBsaXRlcmFscyBpbmFjdGl2ZSBieSByZXBsYWNpbmcgdGhlbSB3aXRoID8/XG4gICAgbWFzayA9IG1hc2sucmVwbGFjZShsaXRlcmFsLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICAgIGxpdGVyYWxzLnB1c2goJDEpO1xuICAgICAgcmV0dXJuICc/Pyc7XG4gICAgfSk7XG4gICAgLy8gQXBwbHkgZm9ybWF0dGluZyBydWxlc1xuICAgIG1hc2sgPSBtYXNrLnJlcGxhY2UodG9rZW4sIGZ1bmN0aW9uICgkMCkge1xuICAgICAgcmV0dXJuICQwIGluIGZvcm1hdEZsYWdzID8gZm9ybWF0RmxhZ3NbJDBdKGRhdGVPYmosIGkxOG4pIDogJDAuc2xpY2UoMSwgJDAubGVuZ3RoIC0gMSk7XG4gICAgfSk7XG4gICAgLy8gSW5saW5lIGxpdGVyYWwgdmFsdWVzIGJhY2sgaW50byB0aGUgZm9ybWF0dGVkIHZhbHVlXG4gICAgcmV0dXJuIG1hc2sucmVwbGFjZSgvXFw/XFw/L2csIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxpdGVyYWxzLnNoaWZ0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgZGF0ZSBzdHJpbmcgaW50byBhbiBvYmplY3QsIGNoYW5nZXMgLSBpbnRvIC9cbiAgICogQG1ldGhvZCBwYXJzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0ZVN0ciBEYXRlIHN0cmluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gZm9ybWF0IERhdGUgcGFyc2UgZm9ybWF0XG4gICAqIEByZXR1cm5zIHtEYXRlfGJvb2xlYW59XG4gICAqL1xuICBmZWNoYS5wYXJzZSA9IGZ1bmN0aW9uIChkYXRlU3RyLCBmb3JtYXQsIGkxOG5TZXR0aW5ncykge1xuICAgIHZhciBpMThuID0gaTE4blNldHRpbmdzIHx8IGZlY2hhLmkxOG47XG5cbiAgICBpZiAodHlwZW9mIGZvcm1hdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmb3JtYXQgaW4gZmVjaGEucGFyc2UnKTtcbiAgICB9XG5cbiAgICBmb3JtYXQgPSBmZWNoYS5tYXNrc1tmb3JtYXRdIHx8IGZvcm1hdDtcblxuICAgIC8vIEF2b2lkIHJlZ3VsYXIgZXhwcmVzc2lvbiBkZW5pYWwgb2Ygc2VydmljZSwgZmFpbCBlYXJseSBmb3IgcmVhbGx5IGxvbmcgc3RyaW5nc1xuICAgIC8vIGh0dHBzOi8vd3d3Lm93YXNwLm9yZy9pbmRleC5waHAvUmVndWxhcl9leHByZXNzaW9uX0RlbmlhbF9vZl9TZXJ2aWNlXy1fUmVEb1NcbiAgICBpZiAoZGF0ZVN0ci5sZW5ndGggPiAxMDAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuICAgIHZhciBkYXRlSW5mbyA9IHt9O1xuICAgIGZvcm1hdC5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgIGlmIChwYXJzZUZsYWdzWyQwXSkge1xuICAgICAgICB2YXIgaW5mbyA9IHBhcnNlRmxhZ3NbJDBdO1xuICAgICAgICB2YXIgaW5kZXggPSBkYXRlU3RyLnNlYXJjaChpbmZvWzBdKTtcbiAgICAgICAgaWYgKCF+aW5kZXgpIHtcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0ZVN0ci5yZXBsYWNlKGluZm9bMF0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGluZm9bMV0oZGF0ZUluZm8sIHJlc3VsdCwgaTE4bik7XG4gICAgICAgICAgICBkYXRlU3RyID0gZGF0ZVN0ci5zdWJzdHIoaW5kZXggKyByZXN1bHQubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnNlRmxhZ3NbJDBdID8gJycgOiAkMC5zbGljZSgxLCAkMC5sZW5ndGggLSAxKTtcbiAgICB9KTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgaWYgKGRhdGVJbmZvLmlzUG0gPT09IHRydWUgJiYgZGF0ZUluZm8uaG91ciAhPSBudWxsICYmICtkYXRlSW5mby5ob3VyICE9PSAxMikge1xuICAgICAgZGF0ZUluZm8uaG91ciA9ICtkYXRlSW5mby5ob3VyICsgMTI7XG4gICAgfSBlbHNlIGlmIChkYXRlSW5mby5pc1BtID09PSBmYWxzZSAmJiArZGF0ZUluZm8uaG91ciA9PT0gMTIpIHtcbiAgICAgIGRhdGVJbmZvLmhvdXIgPSAwO1xuICAgIH1cblxuICAgIHZhciBkYXRlO1xuICAgIGlmIChkYXRlSW5mby50aW1lem9uZU9mZnNldCAhPSBudWxsKSB7XG4gICAgICBkYXRlSW5mby5taW51dGUgPSArKGRhdGVJbmZvLm1pbnV0ZSB8fCAwKSAtICtkYXRlSW5mby50aW1lem9uZU9mZnNldDtcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyhkYXRlSW5mby55ZWFyIHx8IHRvZGF5LmdldEZ1bGxZZWFyKCksIGRhdGVJbmZvLm1vbnRoIHx8IDAsIGRhdGVJbmZvLmRheSB8fCAxLFxuICAgICAgICBkYXRlSW5mby5ob3VyIHx8IDAsIGRhdGVJbmZvLm1pbnV0ZSB8fCAwLCBkYXRlSW5mby5zZWNvbmQgfHwgMCwgZGF0ZUluZm8ubWlsbGlzZWNvbmQgfHwgMCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXRlID0gbmV3IERhdGUoZGF0ZUluZm8ueWVhciB8fCB0b2RheS5nZXRGdWxsWWVhcigpLCBkYXRlSW5mby5tb250aCB8fCAwLCBkYXRlSW5mby5kYXkgfHwgMSxcbiAgICAgICAgZGF0ZUluZm8uaG91ciB8fCAwLCBkYXRlSW5mby5taW51dGUgfHwgMCwgZGF0ZUluZm8uc2Vjb25kIHx8IDAsIGRhdGVJbmZvLm1pbGxpc2Vjb25kIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZTtcbiAgfTtcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZlY2hhO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZmVjaGE7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbWFpbi5mZWNoYSA9IGZlY2hhO1xuICB9XG59KSh0aGlzKTtcbiIsImNvbnN0IHtlcnJvcn0gPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XHJcbi8qXHJcbiBmaW5kZXQgZWluZSDvv71uZGVydW5nIHN0YXR0LCB3aXJkIHNpZSBkZW0gamV3ZWlscyBu77+9Y2hzdGVuIGFrdGl2ZW4gTW9kdWwgaW4gZGVyIEhpZXJhcmNoaWUgZ2VtZWxkZXQuXHJcbiAqL1xyXG5jb25zdCBSRUxPQUQgPSAnX19yZWxvYWQnLFxyXG5cdCAgRklMVEVSID0gJ2ZpbHRlcicsXHJcblx0ICBTT1JURVIgPSAnc29ydGVyJyxcclxuXHQgIFBBR0VSICA9ICdwYWdlcicsXHJcblx0ICBSRU5ERVJFUiA9ICdfX3JlbmRlcmVyJyxcclxuXHQgIEZJWEVEICA9ICdmaXhlZCc7XHJcblxyXG4vLyBvcmRlciBpcyBzdXBlciBpbXBvcnRhbnQgYW5kIG11c3Qgbm90IGJlIGNoYW5nZWQhISFcclxuY29uc3QgaGllcmFyY2h5ID0gW1JFTE9BRCwgRklMVEVSLCBTT1JURVIsIFBBR0VSLCBSRU5ERVJFUiwgRklYRURdO1xyXG5cclxuLyoqXHJcbiAqIHRtIGFsd2F5cyBob2xkcyBleGFjdGx5IG9uZSBBY3Rpb25QaXBlbGluZSBpbnN0YW5jZS5cclxuICogV2hlbiBhIE1vZHVsZSBpbiB0aGUgSGllcmFyY2h5IGNoYW5nZXMgZGF0YSBvZiB0aGUgdGFibGUgaW4gc29tZSB3YXkgKGxpa2UgZmlsdGVyaW5nLCBzb3J0aW5nLCBwYWdpbmcpLCB0aGUgbmV4dCBhY3RpdmUgTW9kdWxlIGluIHRoZSBoaWVyYXJjaHlcclxuICogZ2V0cyBub3RpZmllZCBhbmQgY2FuIGFsc28gcGVyZm9ybSBjaGFuZ2VzIChhbmQgdHJpZ2dlciBhZ2FpbiBhZnRlcndhcmRzKS5cclxuICogZm9yIEV4YW1wbGUsIGFmdGVyIGEgZmlsdGVyLW9wZXJhdGlvbiB0aGUgdGFibGUgaGFzIHRvIGJlIHJlc29ydGVkIGFuZCB0aGUgcGFnZXIgaGFzIHRvIGRpc3BsYXkgZGlmZmVyZW50IGRhdGEuXHJcbiAqXHJcbiAqIEluIHRoZSBlbmQgb2YgZWFjaCBjaGFpbiByZWFjdGlvbiwgdGhlIGJ1aWx0LWluIHBzZXVkb01vZHVsZSBSRU5ERVJFUiBpcyB0cmlnZ2VyZWQgdG8gcmUtcmVuZGVyIHRoZSB0YWJsZSBzbyB0aGUgZWZmZWN0cyB3aWxsIGJlIHNob3duLlxyXG4gKiB0aGUgYWR2YW50YWdlIGlzIHRoYXQgaXQgd2lsbCBhbHdheXMgcmVyZW5kZXIgb25jZSBhbmQgbm90IGFmdGVyIGVhY2ggYWN0aW9uXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEFjdGlvblBpcGVsaW5lIHtcclxuXHJcblx0LyoqXHJcblx0ICogb25seSBjYWxsZWQgb25jZSBpbiB0YWJsZW1vZGlmeS5qc1xyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHRtKSB7XHJcblx0XHR0aGlzLnRtID0gdG07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBjYWxsZWQgYnkgdGhlIG1vZHVsZXMuIHRoaXMgd2lsbCBjYWxsIHRoZSBub3RpZnkgbWV0aG9kIG9mIHRoZSBuZXh0IGFjdGl2YXRlZCBtb2R1bGUgaW4gdGhlIGhpZXJhcmNoeVxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzZW5kZXI6IG5hbWUgb2YgdGhlIG1vZHVsZSB0aGF0IGhhcyBmaW5pc2hlZCBhbiBvcGVyYXRpb25cclxuXHQgKiBAcGFyYW0ge29iamVjdH0gbXNnOiBvcHRpb25hbCwgY2FuIGJlIHVzZWQgdG8gcGFzcyBpbmZvcm1hdGlvbiB0byB0aGUgc3VjY2Vzc29yXHJcblx0ICovXHJcblx0bm90aWZ5KHNlbmRlciwgbXNnKSB7XHJcblx0XHR0aGlzLnRtLnRyaWdnZXIoJ2FjdGlvbicsIHNlbmRlcik7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRsZXQgcmVjZWl2ZXIgPSB0aGlzLl9nZXRTdWNjZXNzb3Ioc2VuZGVyKTtcclxuXHRcdFx0aWYgKHJlY2VpdmVyICE9IG51bGwpIHJlY2VpdmVyLm5vdGlmeShtc2cpO1xyXG5cdFx0fSBjYXRjaChlKSB7XHJcblx0XHRcdGVycm9yKGUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0X2dldFN1Y2Nlc3NvcihzZW5kZXIpIHtcclxuXHRcdGxldCBpID0gaGllcmFyY2h5LmluZGV4T2Yoc2VuZGVyKSArIDE7XHJcblx0XHRpZiAoaSA9PT0gMCkgcmV0dXJuIG51bGw7XHJcblxyXG5cdFx0Zm9yICg7IGkgPCBoaWVyYXJjaHkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0bGV0IG5hbWUgPSBoaWVyYXJjaHlbaV07XHJcblx0XHRcdGlmICh0aGlzLnRtLmFjdGl2ZU1vZHVsZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHJldHVybiB0aGlzLnRtLmFjdGl2ZU1vZHVsZXNbbmFtZV07XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG4iLCJleHBvcnRzLmRlYnVnID0gZmFsc2U7XHJcbmV4cG9ydHMuY29yZURlZmF1bHRzID0ge1xyXG4gICAgdGhlbWU6ICdkZWZhdWx0JyxcclxuICAgIGxhbmd1YWdlOiAnZW4nICAgXHJcbn07XHJcbiIsImNvbnN0IGZlY2hhID0gcmVxdWlyZSgnZmVjaGEnKTtcclxuXHJcbmNvbnN0IERBVEVfR0VSTUFOID0gJ2dlcm1hbic7XHJcbmNvbnN0IERBVEVfRU5HTElTSCA9ICdlbmdsaXNoJztcclxuY29uc3QgREFURV9JMThOID0ge1xyXG4gICAgW0RBVEVfR0VSTUFOXToge1xyXG4gICAgICAgIGRheU5hbWVzU2hvcnQ6IFsnU28nLCAnTW8nLCAnRGknLCAnTWknLCAnRG8nLCAnRnInLCAnU2EnXSxcclxuICAgICAgICBkYXlOYW1lczogWydTb25udGFnJywgJ01vbnRhZycsICdEaWVuc3RhZycsICdNaXR0d29jaCcsICdEb25uZXJzdGFnJywgJ0ZyZWl0YWcnLCAnU2Ftc3RhZyddLFxyXG4gICAgICAgIG1vbnRoTmFtZXNTaG9ydDogWydKYW4nLCAnRmViJywgJ03DpHInLCAnQXByJywgJ01haScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2t0JywgJ05vdicsICdEZXonXSxcclxuICAgICAgICBtb250aE5hbWVzOiBbJ0phbnVhcicsICdGZWJydWFyJywgJ03DpHJ6JywgJ0FwcmlsJywgJ01haScsICdKdW5pJywgJ0p1bGknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPa3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlemVtYmVyJ10sXHJcbiAgICAgICAgYW1QbTogWydhbScsICdwbSddLFxyXG4gICAgICAgIC8vIEQgaXMgdGhlIGRheSBvZiB0aGUgbW9udGgsIGZ1bmN0aW9uIHJldHVybnMgc29tZXRoaW5nIGxpa2UuLi4gIDNyZCBvciAxMXRoXHJcbiAgICAgICAgRG9GbjogZnVuY3Rpb24gKEQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEQgKyAnLic7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFtEQVRFX0VOR0xJU0hdOiB7XHJcbiAgICAgICAgZGF5TmFtZXNTaG9ydDogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1cicsICdGcmknLCAnU2F0J10sXHJcbiAgICAgICAgZGF5TmFtZXM6IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXSxcclxuICAgICAgICBtb250aE5hbWVzU2hvcnQ6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXSxcclxuICAgICAgICBtb250aE5hbWVzOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSxcclxuICAgICAgICBhbVBtOiBbJ2FtJywgJ3BtJ10sXHJcbiAgICAgICAgLy8gRCBpcyB0aGUgZGF5IG9mIHRoZSBtb250aCwgZnVuY3Rpb24gcmV0dXJucyBzb21ldGhpbmcgbGlrZS4uLiAgM3JkIG9yIDExdGhcclxuICAgICAgICBEb0ZuOiBmdW5jdGlvbiAoRCkge1xyXG4gICAgICAgICAgICByZXR1cm4gRCArIFsgJ3RoJywgJ3N0JywgJ25kJywgJ3JkJyBdWyBEICUgMTAgPiAzID8gMCA6IChEIC0gRCAlIDEwICE9PSAxMCkgKiBEICUgMTAgXTtcclxuICAgICAgICB9XHJcbiAgICB9ICBcclxufTtcclxuY29uc3QgREFURV9GT1JNQVRTID0ge1xyXG4gICAgW0RBVEVfR0VSTUFOXTogW1xyXG4gICAgICAgICdNTS5ERC5ZWVlZJyxcclxuICAgICAgICAnTU0uREQuWVknXHJcbiAgICBdLFxyXG4gICAgW0RBVEVfRU5HTElTSF06IFtcclxuICAgICAgICAnWVlZWS1NTS1ERCcsXHJcbiAgICAgICAgJ01NL0REL1lZWVknXHJcbiAgICBdXHJcbn07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBmZWNoYSxcclxuICAgIERBVEVfR0VSTUFOLFxyXG4gICAgREFURV9FTkdMSVNILFxyXG4gICAgREFURV9JMThOLFxyXG4gICAgREFURV9GT1JNQVRTXHJcbn1cclxuIiwiLyoqXHJcbiAqIHRoaXMgY2xhc3MgaXMgYSBzaW1wbGUgZXZlbnQgc3lzdGVtIGZvciBhIHRhYmxlbW9kaWZ5IGluc3RhbmNlLlxyXG4gKlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFdmVudFN5c3RlbSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0bSkge1xyXG4gICAgICAgIHRoaXMudG0gPSB0bTtcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIG9uKGV2ZW50TmFtZSwgZnVuYykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBhIGZ1bmN0aW9uIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGZ1bmMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRyaWdnZXIoZXZlbnROYW1lLCAuLi5wYXJhbXMpIHtcclxuICAgICAgICBpZiAodGhpcy5ldmVudHMuaGFzT3duUHJvcGVydHkoZXZlbnROYW1lKSkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLmZvckVhY2goKGZ1bmMpID0+IHtcclxuICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkodGhpcy50bSwgcGFyYW1zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImNvbnN0IHtleHRlbmQsIHdhcm59ID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xyXG5cclxuLypcclxuICogICAgTGlzdCBvZiBhbGwgdmFsdWVzIHRoYXQgY2FuIGJlIHNldFxyXG4gKi9cclxubGV0IGRlZmF1bHRzID0ge1xyXG4gICAgRklMVEVSX1BMQUNFSE9MREVSOiAndHlwZSBmaWx0ZXIgaGVyZScsXHJcbiAgICBGSUxURVJfQ0FTRVNFTlNJVElWRTogJ2Nhc2Utc2Vuc2l0aXZlJyxcclxuICAgIFBBR0VSX1BBR0VOVU1CRVJfU0VQQVJBVE9SOiAnIC8gJ1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMYW5ndWFnZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaWRlbnRpZmllciwgbGFuZ3VhZ2VQYWNrKSB7XHJcbiAgICAgICAgdGhpcy5pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcclxuICAgICAgICB0aGlzLnRlcm1zID0gZXh0ZW5kKGRlZmF1bHRzLCBsYW5ndWFnZVBhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCh0ZXJtKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudGVybXMuaGFzT3duUHJvcGVydHkodGVybSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGVybXNbdGVybV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdhcm4oJ3Rlcm0gJyArIHRlcm0gKyAnIG5vdCBkZWZpbmVkJyk7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG59O1xyXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5jb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIGluZm8sIGVycm9yLCByZXBsYWNlSWRzV2l0aEluZGljZXN9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAgICBuYW1lOiBcImNvbHVtblN0eWxlc1wiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgYWxsOiB7fVxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMuY29udGFpbmVyLCAndG0tY29sdW1uLXN0eWxlcycpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRhaW5lcklkID0gdGhpcy5jb250YWluZXJJZDtcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSByZXBsYWNlSWRzV2l0aEluZGljZXMoc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gc3R5bGUgZ2VuZXJhbFxyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IGBkaXYjJHtjb250YWluZXJJZH0gdGFibGUgdHIgPiAqIHtgO1xyXG4gICAgICAgICAgICBpdGVyYXRlKHNldHRpbmdzLmFsbCwgZnVuY3Rpb24ocHJvcCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRleHQgKz0gYCR7cHJvcH06ICR7dmFsdWV9O2A7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0ICs9ICd9JztcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBjdXN0b20gc3R5bGVzIHRvIHRoZSBzaW5nbGUgY29sdW1uc1xyXG4gICAgICAgICAgICBpdGVyYXRlKHNldHRpbmdzLCBmdW5jdGlvbihpbmRleCwgY3NzU3R5bGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09ICdhbGwnKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IHBhcnNlSW50KGluZGV4KSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGV4dCArPSBgZGl2IyR7Y29udGFpbmVySWR9IHRhYmxlIHRyID4gKjpudGgtb2YtdHlwZSgke2l9KSB7YDtcclxuICAgICAgICAgICAgICAgIGl0ZXJhdGUoY3NzU3R5bGVzLCBmdW5jdGlvbihwcm9wLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gYCR7cHJvcH06ICR7dmFsdWV9O2A7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRleHQgKz0gJ30nO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmRTdHlsZXModGV4dCk7XHJcbiAgICAgICAgICAgIGluZm8oJ21vZHVsZSBjb2x1bW5TdHlsZXMgbG9hZGVkJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdW5zZXQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBubyBpbXBsZW1lbnRhdGlvbiBuZWVkZWRcclxuICAgICAgICAgICAgICAgICAgICBpbmZvKCd1bnNldHRpbmcgY29sdW1uU3R5bGVzJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIGluZm8sIGVycm9yLCByZXBsYWNlSWRzV2l0aEluZGljZXN9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuY29uc3QgTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGUuanMnKTtcclxuY29uc3QgRklMVEVSX0hFSUdIVCA9ICczMHB4JztcclxuXHJcbi8qKlxyXG4gICAgRmFjdG9yeSBjbGFzcyB0byBwcm9kdWNlIGZpbHRlciBjZWxsc1xyXG4qL1xyXG5jbGFzcyBDZWxsRmFjdG9yeSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0bSkge1xyXG4gICAgICAgIGxldCBwbGFjZWhvbGRlciA9IHRtLmdldFRlcm0oJ0ZJTFRFUl9QTEFDRUhPTERFUicpLFxyXG4gICAgICAgICAgICBjYXNlU2Vuc2l0aXZlID0gdG0uZ2V0VGVybSgnRklMVEVSX0NBU0VTRU5TSVRJVkUnKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XHJcbiAgICAgICAgdGhpcy5jZWxsLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPSd0bS1pbnB1dC1kaXYnPjxpbnB1dCB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0nJHtwbGFjZWhvbGRlcn0nIC8+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSd0bS1jdXN0b20tY2hlY2tib3gnIHRpdGxlPScke2Nhc2VTZW5zaXRpdmV9Jz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdjaGVja2JveCcgdmFsdWU9JzEnIG5hbWU9J2NoZWNrYm94JyAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj0nY2hlY2tib3gnPjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5gO1xyXG4gICAgfVxyXG5cclxuICAgIHByb2R1Y2UoZW5hYmxlZCA9IHRydWUsIGNhc2VTZW5zaXRpdmUgPSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKCFlbmFibGVkKSByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgICAgICBsZXQgcmV0ID0gdGhpcy5jZWxsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgICAgICBpZiAoIWNhc2VTZW5zaXRpdmUpIHJldC5yZW1vdmVDaGlsZChyZXQubGFzdENoaWxkKTsgLy8gcmVtb3ZlIGN1c3RvbSBjaGVja2JveFxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENlbGwoZSkge1xyXG4gICAgbGV0IGNlbGwgPSBlLnRhcmdldDtcclxuICAgIHdoaWxlIChjZWxsLmNlbGxJbmRleCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY2VsbCA9IGNlbGwucGFyZW50Tm9kZTtcclxuICAgIH1cclxuICAgIHJldHVybiBjZWxsO1xyXG59XHJcblxyXG4vLyBwcm90b3R5cGUgZm9yIEZpbHRlclxyXG5jbGFzcyBGaWx0ZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRtLCBzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMudG0gPSB0bTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmRpY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5wYXR0ZXJucyA9IFtdO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IFtdO1xyXG5cclxuICAgICAgICBzZXR0aW5ncy5jb2x1bW5zID0gcmVwbGFjZUlkc1dpdGhJbmRpY2VzKHNldHRpbmdzLmNvbHVtbnMpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuICAgIH1cclxuXHJcbiAgICAvLyBzZXR0ZXJzXHJcbiAgICBzZXRQYXR0ZXJucyhwYXR0ZXJucykge1xyXG4gICAgICAgIHRoaXMucGF0dGVybnMgPSBwYXR0ZXJucztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldEluZGljZXMoaW5kaWNlcykge1xyXG4gICAgICAgIHRoaXMuaW5kaWNlcyA9IGluZGljZXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy8gZ2V0dGVyc1xyXG4gICAgZ2V0UGF0dGVybnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0dGVybnM7XHJcbiAgICB9XHJcbiAgICBnZXRJbmRpY2VzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGljZXM7XHJcbiAgICB9XHJcbiAgICBnZXRPcHRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgYW55RmlsdGVyQWN0aXZlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhdHRlcm5zKCkubGVuZ3RoICE9PSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldElzRW5hYmxlZChpKSB7cmV0dXJuIHRoaXMuZ2V0Q29sdW1uU2V0dGluZyhpLCAnZW5hYmxlZCcpO31cclxuICAgIGdldElzQ2FzZVNlbnNpdGl2ZShpKSB7cmV0dXJuIHRoaXMuZ2V0Q29sdW1uU2V0dGluZyhpLCAnY2FzZVNlbnNpdGl2ZScpO31cclxuXHJcbiAgICBnZXRDb2x1bW5TZXR0aW5nKGksIHNldHRpbmcpIHtcclxuICAgICAgICBsZXQgY29scyA9IHRoaXMuc2V0dGluZ3MuY29sdW1ucztcclxuICAgICAgICBpZiAoY29scy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBjb2xzW2ldLmhhc093blByb3BlcnR5KHNldHRpbmcpKSB7XHJcbiAgICAgICAgICAgIC8vIGEgY3VzdG9tIHZhbHVlIHdhcyBzZXRcclxuICAgICAgICAgICAgcmV0dXJuIGNvbHNbaV1bc2V0dGluZ107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2xzLmFsbFtzZXR0aW5nXTtcclxuICAgIH1cclxuXHJcbiAgICBmaWx0ZXIoKSB7XHJcbiAgICBcdGlmICh0aGlzLnRtLmJlZm9yZVVwZGF0ZSgnZmlsdGVyJykpIHtcclxuICAgIFx0XHRsZXQgaW5kaWNlcyA9IHRoaXMuZ2V0SW5kaWNlcygpLFxyXG4gICAgICAgICAgICAgICAgcGF0dGVybnMgPSB0aGlzLmdldFBhdHRlcm5zKCksXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCksXHJcbiAgICAgICAgICAgICAgICBhbGwgPSB0aGlzLnRtLmdldEFsbFJvd3MoKSxcclxuICAgICAgICAgICAgICAgIG1hdGNoaW5nID0gW10sIG5vdE1hdGNoaW5nID0gW107XHJcblxyXG5cdCAgICAgICAgY29uc3QgbWF4RGVwaCA9IGluZGljZXMubGVuZ3RoIC0gMTtcclxuXHQgICAgICAgIC8vIGZpbHRlciByb3dzXHJcblx0ICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbC5sZW5ndGg7IGkrKykge1xyXG5cdCAgICAgICAgXHRsZXQgcm93ID0gYWxsW2ldLCBkZXBoID0gMCwgbWF0Y2hlcyA9IHRydWU7XHJcblxyXG5cdCAgICAgICAgICAgIHdoaWxlIChtYXRjaGVzICYmIGRlcGggPD0gbWF4RGVwaCkge1xyXG5cdCAgICAgICAgICAgICAgICBsZXQgaiA9IGluZGljZXNbZGVwaF0sXHJcblx0ICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybnNbZGVwaF0sXHJcblx0ICAgICAgICAgICAgICAgICAgICB0ZXN0ZXIgPSByb3cuY2VsbHNbal0udGV4dENvbnRlbnQ7XHJcblxyXG5cdCAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnNbZGVwaF0pIHtcclxuXHQgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBjYXNlLXNlbnNpdGl2ZVxyXG5cdCAgICAgICAgICAgICAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcclxuXHQgICAgICAgICAgICAgICAgICAgIHRlc3RlciA9IHRlc3Rlci50b0xvd2VyQ2FzZSgpO1xyXG5cdCAgICAgICAgICAgICAgICB9XHJcblxyXG5cdCAgICAgICAgICAgICAgICBtYXRjaGVzID0gdGVzdGVyLmluZGV4T2YocGF0dGVybikgIT09IC0xO1xyXG5cdCAgICAgICAgICAgICAgICBkZXBoKys7XHJcblx0ICAgICAgICAgICAgfVxyXG5cclxuXHRcdFx0XHRpZiAobWF0Y2hlcykge1xyXG5cdFx0XHRcdFx0bWF0Y2hpbmcucHVzaChyb3cpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRub3RNYXRjaGluZy5wdXNoKHJvdyk7XHJcblx0XHRcdFx0fVxyXG5cdCAgICBcdH1cclxuXHJcblx0ICAgICAgICB0aGlzLnRtLnNldEF2YWlsYWJsZVJvd3MobWF0Y2hpbmcpXHJcblx0ICAgICAgICAgICAuc2V0SGlkZGVuUm93cyhub3RNYXRjaGluZylcclxuICAgICAgICAgICAgICAgLmFjdGlvblBpcGVsaW5lLm5vdGlmeSgnZmlsdGVyJyk7XHJcbiAgICBcdH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufTtcclxuXHJcbmNsYXNzIEZpbHRlckRlZmF1bHQgZXh0ZW5kcyBGaWx0ZXIge1xyXG4gICAgY29uc3RydWN0b3IodG0sIHNldHRpbmdzKSB7XHJcbiAgICAgICAgc3VwZXIodG0sIHNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnRIZWFkID0gdG0uaGVhZCA/IHRtLmhlYWQudEhlYWQgOiB0bS5vcmlnSGVhZDtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIHRoZSB0b29sYmFyIHJvd1xyXG4gICAgICAgIGxldCBudW0gPSB0aGlzLnRIZWFkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzLmxlbmd0aCxcclxuICAgICAgICAgICAgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSxcclxuICAgICAgICAgICAgY2VsbEZhY3RvcnkgPSBuZXcgQ2VsbEZhY3RvcnkodG0pLFxyXG4gICAgICAgICAgICB0aW1lb3V0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbmFibGVkID0gdGhpcy5nZXRJc0VuYWJsZWQoaSk7XHJcbiAgICAgICAgICAgIGxldCBjcyA9IHRoaXMuZ2V0SXNDYXNlU2Vuc2l0aXZlKGkpO1xyXG5cclxuICAgICAgICAgICAgcm93LmFwcGVuZENoaWxkKGNlbGxGYWN0b3J5LnByb2R1Y2UoZW5hYmxlZCwgY3MpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYWRkQ2xhc3Mocm93LCAndG0tZmlsdGVyLXJvdycpO1xyXG5cclxuICAgICAgICBpZiAoc2V0dGluZ3MuYXV0b0NvbGxhcHNlKXtcclxuICAgICAgICAgICAgLy8ga2VlcCBmaWx0ZXIgcm93IHZpc2libGUgaWYgYW4gaW5wdXQgaXMgZm9jdXNlZFxyXG4gICAgICAgICAgICBbXS5zbGljZS5jYWxsKHJvdy5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpKS5mb3JFYWNoKChpbnB1dCkgPT4geyAvLyBpdCBzZWVtcyBsaWtlIGluIElFMTEgLmZvckVhY2ggb25seSB3b3JrcyBvbiByZWFsIGFycmF5c1xyXG4gICAgICAgICAgICAgICAgaW5wdXQub25mb2N1cyA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93LnN0eWxlLmhlaWdodCA9IEZJTFRFUl9IRUlHSFQ7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaW5wdXQub25ibHVyID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByb3cuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2hlaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcm93LnN0eWxlLmhlaWdodCA9IEZJTFRFUl9IRUlHSFQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnNcclxuICAgICAgICByb3cub25rZXl1cCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW4oKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm93Lm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjZWxsID0gZ2V0Q2VsbChlKSxcclxuICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZS50YXJnZXQ7XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdTUEFOJyB8fCB0YXJnZXQubm9kZU5hbWUgPT0gJ0xBQkVMJykge1xyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2tib3ggY2xpY2tcclxuICAgICAgICAgICAgICAgIGxldCBjaGVja2JveCA9IGNlbGwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1jaGVja2JveF0nKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhY2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcm93Lm9uY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJ1bigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKlxyXG4gICAgICAgIHRtLmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG1Sb3dzQWRkZWQnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFueUZpbHRlckFjdGl2ZSgpKSB0aGlzLnJ1bigpO1xyXG4gICAgICAgIH0pOyovXHJcblxyXG4gICAgICAgIC8vIGluc2VydCB0b29sYmFyIHJvdyBpbnRvIHRIZWFkXHJcbiAgICAgICAgdGhpcy50SGVhZC5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bigpIHtcclxuICAgICAgICBjb25zdCBmaWx0ZXJDZWxscyA9IFtdLnNsaWNlLmNhbGwodGhpcy50SGVhZC5xdWVyeVNlbGVjdG9yKCd0ci50bS1maWx0ZXItcm93JykuY2VsbHMpO1xyXG4gICAgICAgIGxldCBwYXR0ZXJucyA9IFtdLCBpbmRpY2VzID0gW10sIG9wdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgaXRlcmF0ZShmaWx0ZXJDZWxscywgZnVuY3Rpb24oaSwgY2VsbCkge1xyXG4gICAgICAgICAgICBsZXQgaW5wdXQgPSBjZWxsLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9dGV4dF0nKTtcclxuICAgICAgICAgICAgbGV0IGNoZWNrYm94ID0gY2VsbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlucHV0ICYmIGlucHV0LnZhbHVlLnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChpKTtcclxuICAgICAgICAgICAgICAgIHBhdHRlcm5zLnB1c2goaW5wdXQudmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChjaGVja2JveCkgb3B0aW9ucy5wdXNoKGNoZWNrYm94LmNoZWNrZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGF0dGVybnMocGF0dGVybnMpXHJcbiAgICAgICAgICAgIC5zZXRJbmRpY2VzKGluZGljZXMpXHJcbiAgICAgICAgICAgIC5zZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kdWxlKHtcclxuICAgIG5hbWU6IFwiZmlsdGVyXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICBhdXRvQ29sbGFwc2U6IHRydWUsXHJcbiAgICAgICAgY29sdW1uczoge1xyXG4gICAgICAgICAgICBhbGw6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjYXNlU2Vuc2l0aXZlOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZXI6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgLy8gdGhpcyA6PSBUYWJsZW1vZGlmeS1pbnN0YW5jZVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMuY29udGFpbmVyLCAndG0tZmlsdGVyJyk7XHJcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBGaWx0ZXJEZWZhdWx0KHRoaXMsIHNldHRpbmdzKTtcclxuICAgICAgICAgICAgaW5mbygnbW9kdWxlIGZpbHRlciBsb2FkZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXHJcbiAgICAgICAgICAgICAgICBnZXRTdGF0czogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgXHRyZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgXHRcdHBhdHRlcm5zOiBpbnN0YW5jZS5nZXRQYXR0ZXJucygpLFxyXG4gICAgICAgICAgICAgICAgXHRcdGluZGljZXM6IGluc3RhbmNlLmdldEluZGljZXMoKSxcclxuICAgICAgICAgICAgICAgIFx0XHRvcHRpb25zOiBpbnN0YW5jZS5nZXRPcHRpb25zKClcclxuICAgICAgICAgICAgICAgIFx0fTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBub3RpZnk6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIFx0aW5zdGFuY2UucnVuKCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdW5zZXQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvKCd1bnNldHRpbmcgZmlsdGVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGFsbCBmaWx0ZXJzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FsbFJvd3MoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGVycm9yKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbiIsImNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcbmNvbnN0IHtpblB4LCBpdGVyYXRlLCBzZXRDc3MsIGFkZENsYXNzLCByZW1vdmVDbGFzcyxcclxuICAgICAgIGdldENzcywgZ2V0U2Nyb2xsYmFyV2lkdGgsIGluZm8sIGVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gICAgbmFtZTogXCJmaXhlZFwiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgZml4SGVhZGVyOmZhbHNlLFxyXG4gICAgICAgIGZpeEZvb3RlcjpmYWxzZVxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIC8vIHNldCB1cFxyXG4gICAgICAgIGxldCBoZWFkLFxyXG4gICAgICAgICAgICBmb290LFxyXG4gICAgICAgICAgICBoZWFkV3JhcCxcclxuICAgICAgICAgICAgZm9vdFdyYXAsXHJcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLFxyXG4gICAgICAgICAgICBib2R5ID0gdGhpcy5ib2R5LFxyXG4gICAgICAgICAgICBib2R5V3JhcCA9IHRoaXMuYm9keVdyYXAsXHJcbiAgICAgICAgICAgIG9yaWdIZWFkID0gdGhpcy5vcmlnSGVhZCxcclxuICAgICAgICAgICAgb3JpZ0Zvb3QgPSB0aGlzLm9yaWdGb290LFxyXG4gICAgICAgICAgICBzY3JvbGxiYXJXaWR0aCA9IGdldFNjcm9sbGJhcldpZHRoKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEhlYWRlckhlaWdodCgpIHsgcmV0dXJuIG9yaWdIZWFkLmNsaWVudEhlaWdodDt9O1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldEZvb3RlckhlaWdodCgpIHsgcmV0dXJuIG9yaWdGb290LmNsaWVudEhlaWdodDt9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW5kZXJIZWFkKCkge1xyXG4gICAgICAgICAgICBpZighaGVhZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgYWxsTmV3ID0gW10uc2xpY2UuY2FsbChoZWFkLmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzKSxcclxuICAgICAgICAgICAgICAgIGFsbE9sZCA9IFtdLnNsaWNlLmNhbGwob3JpZ0hlYWQuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMpO1xyXG4gICAgICAgICAgICBib2R5LnN0eWxlLm1hcmdpblRvcCA9IGluUHgoJy0nICsgZ2V0SGVhZGVySGVpZ2h0KCkpOyAvLyBpZiBoZWFkZXIgcmVzaXplcyBiZWNhdXNlIG9mIGEgdGV4dCB3cmFwXHJcblxyXG4gICAgICAgICAgICBpdGVyYXRlKGFsbE5ldywgZnVuY3Rpb24oaSwgbmV1KXtcclxuICAgICAgICAgICAgICAgIGxldCB3ID0gaW5QeChhbGxPbGRbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgbmV1LnN0eWxlLmNzc1RleHQgPSBgd2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4td2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6ICR7d31gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyRm9vdCgpIHtcclxuICAgICAgICAgICAgaWYgKCFmb290KSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBhbGxOZXcgPSBbXS5zbGljZS5jYWxsKGZvb3QuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMpLFxyXG4gICAgICAgICAgICAgICAgYWxsT2xkID0gW10uc2xpY2UuY2FsbChvcmlnRm9vdC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscyk7XHJcblxyXG4gICAgICAgICAgICBib2R5V3JhcC5zdHlsZS5tYXJnaW5Cb3R0b20gPSBpblB4KCctJyArIChzY3JvbGxiYXJXaWR0aCArIGdldEZvb3RlckhlaWdodCgpICsgMSkpOyAvLyBpZiBmb290ZXIgcmVzaXplcyBiZWNhdXNlIG9mIGEgdGV4dCB3cmFwXHJcblxyXG4gICAgICAgICAgICBpdGVyYXRlKGFsbE5ldywgZnVuY3Rpb24oaSwgbmV1KXtcclxuICAgICAgICAgICAgICAgIGxldCB3ID0gaW5QeChhbGxPbGRbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgbmV1LnN0eWxlLmNzc1RleHQgPSBgd2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4td2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6ICR7d31gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3MoY29udGFpbmVyLCAndG0tZml4ZWQnKTtcclxuICAgICAgICAgICAgbGV0IGJvcmRlckNvbGxhcHNlID0gZ2V0Q3NzKGJvZHksICdib3JkZXItY29sbGFwc2UnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcmlnSGVhZCAmJiBzZXR0aW5ncy5maXhIZWFkZXIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBoZWFkZXJIZWlnaHQgPSBnZXRIZWFkZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGhlYWQgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGhlYWRXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKG9yaWdIZWFkLmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICBoZWFkV3JhcC5hcHBlbmRDaGlsZChoZWFkKTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoaGVhZFdyYXAsIGJvZHlXcmFwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhoZWFkLCAgICAgJ3RtLWhlYWQnKTtcclxuICAgICAgICAgICAgICAgIGFkZENsYXNzKGhlYWRXcmFwLCAndG0taGVhZC13cmFwJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaGVhZC5zdHlsZS5ib3JkZXJDb2xsYXBzZSAgID0gYm9yZGVyQ29sbGFwc2U7XHJcbiAgICAgICAgICAgICAgICBvcmlnSGVhZC5zdHlsZS52aXNpYmlsaXR5ICAgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGJvZHkuc3R5bGUubWFyZ2luVG9wICAgICAgICA9IGluUHgoJy0nICsgaGVhZGVySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGhlYWRXcmFwLnN0eWxlLm1hcmdpblJpZ2h0ICA9IGluUHgoc2Nyb2xsYmFyV2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcmlnRm9vdCAmJiBzZXR0aW5ncy5maXhGb290ZXIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmb290ZXJIZWlnaHQgPSBnZXRGb290ZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGZvb3QgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICBmb290LmFwcGVuZENoaWxkKG9yaWdGb290LmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICBmb290V3JhcC5hcHBlbmRDaGlsZChmb290KTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb290V3JhcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoZm9vdCwgICAgICd0bS1mb290Jyk7XHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhmb290V3JhcCwgJ3RtLWZvb3Qtd3JhcCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFkZCBESVZzIHRvIG9yaWdGb290IGNlbGxzIHNvIGl0cyBoZWlnaHQgY2FuIGJlIHNldCB0byAwcHhcclxuICAgICAgICAgICAgICAgIGl0ZXJhdGUob3JpZ0Zvb3QuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMsIChpLCBjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInRtLWZpeGVkLWhlbHBlci13cmFwcGVyXCI+JyArIGNlbGwuaW5uZXJIVE1MICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb290LnN0eWxlLmJvcmRlckNvbGxhcHNlICAgPSBib3JkZXJDb2xsYXBzZTtcclxuICAgICAgICAgICAgICAgIG9yaWdGb290LnN0eWxlLnZpc2liaWxpdHkgICA9ICdoaWRkZW4nO1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuc3R5bGUub3ZlcmZsb3dYICAgID0gJ3Njcm9sbCc7XHJcbiAgICAgICAgICAgICAgICBib2R5V3JhcC5zdHlsZS5tYXJnaW5Cb3R0b20gPSBpblB4KCctJyArIChzY3JvbGxiYXJXaWR0aCArIGZvb3RlckhlaWdodCkpO1xyXG4gICAgICAgICAgICAgICAgZm9vdFdyYXAuc3R5bGUubWFyZ2luUmlnaHQgID0gaW5QeChzY3JvbGxiYXJXaWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBldmVudCBsaXN0ZW5lcnNcclxuICAgICAgICAgICAgaWYgKGhlYWQpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZW5kZXJIZWFkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZvb3QpIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZW5kZXJGb290KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGhlYWQgJiYgZm9vdCkge1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtJytib2R5V3JhcC5zY3JvbGxMZWZ0KydweCknO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb290V3JhcC5zY3JvbGxMZWZ0ID0gYm9keVdyYXAuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLScrZm9vdFdyYXAuc2Nyb2xsTGVmdCsncHgpJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keVdyYXAuc2Nyb2xsTGVmdCA9IGZvb3RXcmFwLnNjcm9sbExlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhlYWQgJiYgIWZvb3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBib2R5V3JhcC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkLnN0eWxlLm1hcmdpbkxlZnQgPSBpblB4KCctJyArIGJvZHlXcmFwLnNjcm9sbExlZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFoZWFkICYmIGZvb3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb290V3JhcC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5V3JhcC5zY3JvbGxMZWZ0ID0gZm9vdFdyYXAuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9vdFdyYXAuc2Nyb2xsTGVmdCA9IGJvZHlXcmFwLnNjcm9sbExlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBuw7Z0aWcsIHdlaWwgZGVyIEJyb3dzZXIgenVtIHJlbmRlcm4gbWFuY2htYWwgZWluZSBnZXdpc3NlIFplaXQgYnJhdWNodFxyXG4gICAgICAgICAgICAgICAgcmVuZGVySGVhZCgpO1xyXG4gICAgICAgICAgICAgICAgcmVuZGVyRm9vdCgpO1xyXG4gICAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gbsO2dGlnLCB3ZWlsIGRlciBCcm93c2VyIHp1bSByZW5kZXJuIG1hbmNobWFsIGVpbmUgZ2V3aXNzZSBaZWl0IGJyYXVjaHRcclxuICAgICAgICAgICAgICAgIHJlbmRlckhlYWQoKTtcclxuICAgICAgICAgICAgICAgIHJlbmRlckZvb3QoKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGVhZCA9IGhlYWQ7XHJcbiAgICAgICAgICAgIHRoaXMuZm9vdCA9IGZvb3Q7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZFdyYXAgPSBoZWFkV3JhcDtcclxuICAgICAgICAgICAgdGhpcy5mb290V3JhcCA9IGZvb3RXcmFwO1xyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgZml4ZWQgbG9hZGVkJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgXHRub3RpZnk6ICgpID0+IHtcclxuICAgICAgICAgICAgXHRcdHJlbmRlckhlYWQoKTtcclxuICAgICAgICAgICAgXHRcdHJlbmRlckZvb3QoKTtcclxuICAgICAgICAgICAgXHR9LFxyXG5cclxuICAgICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAgICogcmV2ZXJ0IGFsbCBjaGFuZ2VzIHBlcmZvcm1lZCBieSB0aGlzIG1vZHVsZVxyXG4gICAgICAgICAgICAgICAgICogaW1wbGVtZW50YXRpb24gbWlnaHQgbm90IGJlIDEwMCUgY29ycmVjdCB5ZXRcclxuICAgICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgICAgdW5zZXQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBJTklUSUFMID0gJ2luaXRpYWwnO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzKGNvbnRhaW5lciwgJ3RtLWZpeGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoZWFkV3JhcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGhlYWRXcmFwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdIZWFkLnN0eWxlLnZpc2liaWxpdHkgPSBJTklUSUFMO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keS5zdHlsZS5tYXJnaW5Ub3AgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmb290V3JhcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGZvb3RXcmFwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdGb290LnN0eWxlLnZpc2liaWxpdHkgPSBJTklUSUFMO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keVdyYXAuc3R5bGUub3ZlcmZsb3dYID0gSU5JVElBTDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHlXcmFwLnN0eWxlLm1hcmdpbkJvdHRvbSA9IElOSVRJQUw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZvb3RlciBoZWxwZXIgd3JhcHBlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3cmFwcGVycyA9IG9yaWdGb290LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Rpdi50bS1maXhlZC1oZWxwZXItd3JhcHBlcicpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLnNsaWNlLmNhbGwod3JhcHBlcnMpLmZvckVhY2goKHdyYXBwZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLm91dGVySFRNTCA9IHdyYXBwZXIuaW5uZXJIVE1MO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZW5kZXJIZWFkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlbmRlckZvb3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RtRml4ZWRGb3JjZVJlbmRlcmluZycsIHJlbmRlckhlYWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCB7ZXJyb3IsIGV4dGVuZDIsIGlzTm9uRW1wdHlTdHJpbmd9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuY29uc3QgZGVmYXVsdFBhcmFtcyA9IHsgICAgICAgICAgIC8vZGVmYXVsdC1uYW1lXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHt9LCAgICAgICAgICAgICAgICAvL1wiZGVmYXVsdFwiLWRlZmF1bHQtc2V0dGluZ3M6IGVtcHR5XHJcbiAgICBzZXR0aW5nc1ZhbGlkYXRvcjogKCkgPT4gbnVsbCwgICAgICAvL2RlZmF1bHQ6IGFjY2VwdCBhbGwgZ2l2ZW4gc2V0dGluZ3Mgb2JqZWN0c1xyXG4gICAgaW5pdGlhbGl6ZXI6ICgpID0+IG51bGwgICAgICAgICAgICAgLy9kZWZhdWx0OiBlbXB0eSBtb2R1bGVcclxufTtcclxuXHJcbi8qKlxyXG4gKiAgdGhlc2UgaXMgdGhlIGRlZmF1bHQgcmV0dXJuIG9iamVjdCBvZiBldmVyeSBNb2R1bGVcclxuICovXHJcbmNvbnN0IGRlZmF1bHRSZXR1cm5zID0ge1xyXG4gICAgaW5zdGFuY2U6IHt9LFxyXG5cdHVuc2V0OiAoKSA9PiB7fSxcclxuXHRnZXRTdGF0czogKCkgPT4ge30sXHJcblx0aW5mbzogKCkgPT4ge30sXHJcblx0bm90aWZ5OiAoKSA9PiB7fVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhIHNpbmdsZSBUYWJsZW1vZGlmeSBtb2R1bGUuXHJcbiAqIEl0IHByb3ZpZGVzIGEgc3RhbmRhcmQgaW50ZXJmYWNlIGZvciBkZWZpbmluZyBtb2R1bGVzLCB0YWtlcyBjYXJlIG9mIHNldHRpbmdzXHJcbiAqIHZhbGlkYXRpb24sIHNldHRpbmdzLWNvbXBsZXRpb24gd2l0aCBkZWZhdWx0IHNldHRpbmdzIGFuZCBjYW4gYmUgZXh0ZW5kZWQgd2l0aFxyXG4gKiBmdXJ0aGVyIGZ1bmN0aW9uYWxpdHkgKGUuZy4gbW9kdWxlIGRlcGVuZGVuY2llcylcclxuICpcclxuICogVXNhZ2U6XHJcbiAqIG1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAqICAgICBuYW1lOiA8dGhlIG1vZHVsZSdzIG5hbWU+LFxyXG4gKiAgICAgZGVmYXVsdFNldHRpbmdzOiA8dGhlIG1vZHVsZSdzIGRlZmF1bHQgc2V0dGluZ3M+LFxyXG4gKiAgICAgc2V0dGluZ3NWYWxpZGF0b3I6IDxmdW5jdGlvbiwgY2FsbGVkIHdpdGggdGhlIHNldHRpbmdzIG9iamVjdCBhbmQgdGhyb3dzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGludmFsaWQgcGFyYW1ldGVycyBhcmUgZGV0ZWN0ZWQ+LFxyXG4gKiAgICAgaW5pdGlhbGl6ZXI6IDxmdW5jdGlvbiB3aGVyZSB0aGUgbW9kdWxlIGNvZGUgaXRzZWxmIHJlc2lkZXMsIHdpbGwgYmUgY2FsbGVkXHJcbiAqICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIFRhYmxlbW9kaWZ5IGluc3RhbmNlIGFzIHRoaXMtdmFsdWUgYW5kIHRoZSByZXR1cm5cclxuICogICAgICAgICAgICAgICAgICAgdmFsdWUgd2lsbCBiZSBzdG9yZWQgaW4gdG0taW5zdGFuY2UubW9kdWxlcy48bW9kdWxlbmFtZT5cclxuICogfSk7XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1vZHVsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcclxuICAgICAgICAvL0lmIG5vIG5hbWUgaXMgZ2l2ZW4sIHRocm93XHJcbiAgICAgICAgaWYoIWlzTm9uRW1wdHlTdHJpbmcocGFyYW1zLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIGxldCBlcnJvck1zZyA9IFwiTmFtZSBtdXN0IGJlIGdpdmVuIGZvciBtb2R1bGUhXCI7XHJcbiAgICAgICAgICAgIGVycm9yKGVycm9yTXNnKTtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb21wbGV0ZSBwYXJhbWV0ZXJzIHdpdGggZGVmYXVsdCBwYXJhbWV0ZXJzXHJcbiAgICAgICAgZXh0ZW5kMihwYXJhbXMsIGRlZmF1bHRQYXJhbXMpO1xyXG4gICAgICAgIC8vc2V0IHBhcmFtZXRlcnMgYXMgcHJvcGVydGllcyBvZiB0aGlzXHJcbiAgICAgICAgZXh0ZW5kMih0aGlzLCBwYXJhbXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEb2VzIG5vdGhpbmcgbW9yZSB0aGFuIGV4dGVuZCB0aGUgZ2l2ZW4gc2V0dGluZ3Mgb2JqZWN0IHdpdGggdGhlIGRlZmF1bHRcclxuICAgICAqIHNldHRpbmdzIGFuZCBjYWxsIHRoZSBzZXR0aW5nc1ZhbGlkYXRvciBmdW5jdGlvbiBvbiB0aGUgcmVzdWx0aW5nIG9iamVjdFxyXG4gICAgICovXHJcbiAgICBnZXRTZXR0aW5ncyhzZXR0aW5ncykge1xyXG4gICAgICAgIGV4dGVuZDIoc2V0dGluZ3MsIHRoaXMuZGVmYXVsdFNldHRpbmdzKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzVmFsaWRhdG9yKHNldHRpbmdzKTtcclxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCBieSB0aGUgVGFibGVtb2RpZnkgaW5zdGFuY2UuIENhbGxzIHRoZSBpbml0aWFsaXplci1mdW5jdGlvbiB3aXRoXHJcbiAgICAgKiB0aGUgVGFibGVtb2RpZnkgaW5zdGFuY2UgYXMgdGhpcy1WYWx1ZVxyXG4gICAgICovXHJcbiAgICBnZXRNb2R1bGUodGFibGVNb2RpZnksIHNldHRpbmdzKSB7XHJcbiAgICAgICAgc2V0dGluZ3MgPSB0aGlzLmdldFNldHRpbmdzKHNldHRpbmdzKTtcclxuICAgICAgICByZXR1cm4gZXh0ZW5kMih0aGlzLmluaXRpYWxpemVyLmNhbGwodGFibGVNb2RpZnksIHNldHRpbmdzLCB0aGlzKSwgZGVmYXVsdFJldHVybnMpO1xyXG4gICAgfVxyXG59O1xyXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5jb25zdCB7YWRkQ2xhc3MsIGVycm9yLCBleHRlbmQyLCBkZWxheX0gPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxuY2xhc3MgQ29udHJvbGxlciB7XHJcblx0Y29uc3RydWN0b3Ioc2V0cywgcGFnZXIpIHtcclxuXHRcdGxldCBfdGhpcyA9IHRoaXM7XHJcblx0XHRleHRlbmQyKHRoaXMsIHNldHMpO1xyXG5cclxuXHRcdE9iamVjdC5rZXlzKHRoaXMpLmZvckVhY2goKGtleSkgPT4ge1xyXG5cdFx0XHRpZiAodGhpc1trZXldID09IG51bGwpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXhjZXB0aW9uKGtleSArICcgc2V0dGluZyBtdXN0IGJlIHNldCEnKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzW2tleV0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXNba2V5XSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMucGFnZXIgPSBwYWdlcjtcclxuXHJcblx0XHR0aGlzLmxlZnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdGxldCB2YWwgPSBfdGhpcy5nZXRDdXJyZW50UGFnZU51bWJlcigpIC0gMTtcclxuXHJcblx0XHRcdGlmICh2YWwgPiAwKSB7XHJcblx0XHRcdFx0X3RoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIodmFsKTtcclxuXHJcblx0XHRcdFx0ZGVsYXkoKCkgPT4ge1xyXG5cdFx0XHRcdFx0X3RoaXMucGFnZXIudXBkYXRlKCkucnVuKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMucmlnaHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdGxldCB2YWwgPSBfdGhpcy5nZXRDdXJyZW50UGFnZU51bWJlcigpICsgMTtcclxuXHJcblx0XHRcdGlmICh2YWwgPD0gX3RoaXMuZ2V0VG90YWxQYWdlcygpKSB7XHJcblx0XHRcdFx0X3RoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIodmFsKTtcclxuXHJcblx0XHRcdFx0ZGVsYXkoKCkgPT4ge1xyXG5cdFx0XHRcdFx0X3RoaXMucGFnZXIudXBkYXRlKCkucnVuKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMubnVtYmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuXHRcdFx0bGV0IHZhbCA9IF90aGlzLmdldEN1cnJlbnRQYWdlTnVtYmVyKCk7XHJcblxyXG5cdFx0XHRpZiAoaXNOYU4odmFsKSB8fCB2YWwgPCAxKSB7XHJcblx0XHRcdFx0dmFsID0gMTtcclxuXHRcdFx0fSBlbHNlIGlmICh2YWwgPiBfdGhpcy5nZXRUb3RhbFBhZ2VzKCkpIHtcclxuXHRcdFx0XHR2YWwgPSBfdGhpcy5nZXRUb3RhbFBhZ2VzKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0X3RoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIodmFsKTtcclxuXHRcdFx0X3RoaXMucGFnZXIudXBkYXRlKCkucnVuKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmxpbWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcclxuXHRcdFx0bGV0IHZhbCA9IF90aGlzLmxpbWl0LnZhbHVlO1xyXG5cclxuXHRcdFx0aWYgKGlzTmFOKHZhbCkgfHwgdmFsIDwgMSkge1xyXG5cdFx0XHRcdF90aGlzLmxpbWl0LnZhbHVlID0gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRfdGhpcy5zZXRDdXJyZW50UGFnZU51bWJlcigxKVxyXG5cdFx0XHRcdC51cGRhdGVUb3RhbFBhZ2VzKClcclxuXHRcdFx0XHQucGFnZXIudXBkYXRlKCkucnVuKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZVRvdGFsUGFnZXMoKTtcclxuXHR9XHJcblxyXG5cdGdldE9mZnNldCgpIHtcclxuXHRcdGxldCB2YWwgPSB0aGlzLm51bWJlci52YWx1ZTtcclxuXHJcblx0XHRpZiAoaXNOYU4odmFsKSB8fCB2YWwgPCAxKSB7XHJcblx0XHRcdHRoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIoMSk7XHJcblx0XHR9IGVsc2UgaWYgKHZhbCA+IHRoaXMuZ2V0VG90YWxQYWdlcygpKSB7XHJcblx0XHRcdHRoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIodGhpcy5nZXRUb3RhbFBhZ2VzKCkpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHBhcnNlSW50KHRoaXMuZ2V0Q3VycmVudFBhZ2VOdW1iZXIoKSAtIDEpICogdGhpcy5nZXRMaW1pdCgpO1xyXG5cdH1cclxuXHJcblx0Z2V0TGltaXQoKSB7XHJcblx0XHRyZXR1cm4gcGFyc2VJbnQodGhpcy5saW1pdC52YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRnZXRUb3RhbFBhZ2VzKCkge1xyXG5cdFx0bGV0IHRvdGFsID0gMDtcclxuXHJcblx0XHRpZiAodGhpcy5wYWdlci50b3RhbE1hbnVhbGx5ICYmIHRoaXMucGFnZXIudG90YWxNYW51YWxseSA+PSAwKSB7XHJcblx0XHRcdHRvdGFsID0gdGhpcy5wYWdlci50b3RhbE1hbnVhbGx5O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dG90YWwgPSB0aGlzLnBhZ2VyLnRtLmNvdW50QXZhaWxhYmxlUm93cygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBNYXRoLmNlaWwodG90YWwgLyB0aGlzLmdldExpbWl0KCkpO1xyXG5cdH1cclxuXHJcblx0c2V0Q3VycmVudFBhZ2VOdW1iZXIobnVtKSB7XHJcblx0XHRudW0gPSBwYXJzZUludChudW0pO1xyXG5cclxuXHRcdGlmICghaXNOYU4obnVtKSkge1xyXG5cdFx0XHRsZXQgaW5uZXJIZWlnaHQgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm51bWJlcikuaGVpZ2h0KTtcclxuXHRcdFx0dGhpcy5udW1iZXIuc3R5bGUud2lkdGggPSAobnVtLnRvU3RyaW5nKCkubGVuZ3RoICogMTIpICsgJ3B4JztcclxuXHRcdFx0dGhpcy5udW1iZXIudmFsdWUgPSBudW07XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdGdldEN1cnJlbnRQYWdlTnVtYmVyKCkge1xyXG5cdFx0cmV0dXJuIHBhcnNlSW50KHRoaXMubnVtYmVyLnZhbHVlKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVRvdGFsUGFnZXMoKSB7XHJcblx0XHRpZiAodGhpcy50b3RhbCAhPSBudWxsKSB7XHJcblx0XHRcdHRoaXMudG90YWwuaW5uZXJIVE1MID0gdGhpcy5wYWdlci50bS5nZXRUZXJtKCdQQUdFUl9QQUdFTlVNQkVSX1NFUEFSQVRPUicpICsgdGhpcy5nZXRUb3RhbFBhZ2VzKCkgKyAnICc7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHtcclxuXHRcdHRoaXMudXBkYXRlVG90YWxQYWdlcygpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBQYWdlciB7XHJcblx0Y29uc3RydWN0b3IodG0sIHNldHRpbmdzKSB7XHJcblx0XHR0aGlzLnRtID0gdG07XHJcblx0XHR0aGlzLm9mZnNldCA9IHBhcnNlSW50KHNldHRpbmdzLm9mZnNldCk7XHJcblx0XHR0aGlzLmxpbWl0ID0gcGFyc2VJbnQoc2V0dGluZ3MubGltaXQpO1xyXG5cdFx0dGhpcy50b3RhbE1hbnVhbGx5ID0gcGFyc2VJbnQoc2V0dGluZ3MudG90YWxNYW51YWxseSk7XHJcblx0XHR0aGlzLmNvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihzZXR0aW5ncy5jb250cm9sbGVyLCB0aGlzKTtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZSgpO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdHRoaXMuY29udHJvbGxlci5zZXRDdXJyZW50UGFnZU51bWJlcih0aGlzLmNvbnRyb2xsZXIuZ2V0Q3VycmVudFBhZ2VOdW1iZXIoKSk7XHJcblx0XHRcdHRoaXMuY29udHJvbGxlci5udW1iZXIucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG5cdFx0fSBjYXRjaChlKSB7fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogbWFpbiBtZXRob2QgcnVuKCk6IHBlcmZvcm1zIGNoYW5nZVxyXG5cdCAqL1xyXG5cdHJ1bigpIHtcclxuXHRcdGlmICh0aGlzLnRtLmJlZm9yZVVwZGF0ZSgncGFnZXInKSkge1xyXG5cdFx0XHR0aGlzLnRtLmFjdGlvblBpcGVsaW5lLm5vdGlmeSgncGFnZXInLCB7XHJcblx0XHRcdFx0b2Zmc2V0OiB0aGlzLmdldE9mZnNldCgpLFxyXG5cdFx0XHRcdGxpbWl0OiB0aGlzLmdldExpbWl0KClcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIGZldGNoZXMgbGltaXQgYW5kIG9mZnNldCBmcm9tIHRoZSB2aWV3XHJcblx0ICovXHJcblx0dXBkYXRlKCkge1xyXG5cdFx0dGhpcy5jb250cm9sbGVyLnVwZGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0T2Zmc2V0KHRoaXMuY29udHJvbGxlci5nZXRPZmZzZXQoKSlcclxuXHRcdCAgICAuc2V0TGltaXQodGhpcy5jb250cm9sbGVyLmdldExpbWl0KCkpO1xyXG5cdH1cclxuXHJcblx0Ly8gc2V0dGVyc1xyXG5cdHNldE9mZnNldChvZmZzZXQpIHtcclxuXHRcdGlmIChvZmZzZXQgIT0gbnVsbCAmJiAhaXNOYU4ob2Zmc2V0KSkgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblx0c2V0TGltaXQobGltaXQpIHtcclxuXHRcdGlmIChsaW1pdCAhPSBudWxsICYmICFpc05hTihsaW1pdCkpIHRoaXMubGltaXQgPSBsaW1pdDtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0Ly9cclxuXHRzZXRUb3RhbE1hbnVhbGx5KG51bSkge1xyXG5cdFx0dGhpcy50b3RhbE1hbnVhbGx5ID0gcGFyc2VJbnQobnVtKTtcclxuXHRcdHRoaXMuY29udHJvbGxlci51cGRhdGVUb3RhbFBhZ2VzKCk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdGdldE9mZnNldCgpIHtcclxuXHRcdHJldHVybiB0aGlzLm9mZnNldDtcclxuXHR9XHJcblx0Z2V0TGltaXQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5saW1pdDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcblx0bmFtZTogJ3BhZ2VyJyxcclxuXHRkZWZhdWx0U2V0dGluZ3M6IHtcclxuXHRcdG9mZnNldDogMCxcclxuXHRcdGxpbWl0OiBJbmZpbml0eSxcclxuXHRcdHRvdGFsTWFudWFsbHk6IGZhbHNlLFxyXG5cdFx0Y29udHJvbGxlcjoge1xyXG5cdFx0XHRsZWZ0OiBudWxsLFxyXG5cdFx0XHRyaWdodDogbnVsbCxcclxuXHRcdFx0bnVtYmVyOiBudWxsLFxyXG5cdFx0XHR0b3RhbDogbnVsbCxcclxuXHRcdFx0bGltaXQ6IG51bGxcclxuXHRcdH1cclxuXHR9LFxyXG5cdGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0bGV0IGluc3RhbmNlID0gbmV3IFBhZ2VyKHRoaXMsIHNldHRpbmdzKTsgLy8gdGhpcyA9IHRhYmxlbW9kaWZ5XHJcblx0XHRcdGFkZENsYXNzKHRoaXMuY29udGFpbmVyLCAndG0tcGFnZXInKTtcclxuXHJcblx0XHRcdC8vIGluaXRpYWxpemUgdGhlIHBhZ2VyIGludGVybmFsIHZhbHVlc1xyXG5cdFx0XHRpbnN0YW5jZS51cGRhdGUoKTtcclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0aW5zdGFuY2U6IGluc3RhbmNlLFxyXG5cdFx0XHRcdHNob3c6IChsaW1pdCwgb2Zmc2V0KSA9PiB7XHJcblx0XHRcdFx0XHRpbnN0YW5jZVxyXG5cdFx0XHRcdFx0XHQuc2V0T2Zmc2V0KG9mZnNldClcclxuXHRcdFx0XHRcdFx0LnNldExpbWl0KGxpbWl0KVxyXG5cdFx0XHRcdFx0XHQucnVuKCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRnZXRTdGF0czogKCkgPT4ge1xyXG5cdFx0ICAgICAgICBcdHJldHVybiB7XHJcblx0XHQgICAgICAgIFx0XHRvZmZzZXQ6IGluc3RhbmNlLmdldE9mZnNldCgpLFxyXG5cdFx0ICAgICAgICBcdFx0bGltaXQ6IGluc3RhbmNlLmdldExpbWl0KClcclxuXHRcdCAgICAgICAgXHR9O1xyXG5cdFx0ICAgICAgICB9LFxyXG5cdFx0XHRcdG5vdGlmeTogKCkgPT4ge1xyXG5cdFx0XHRcdFx0Ly8gZm9yY2UgcGFnZXIgdG8gcnVuIGFnYWluXHJcblx0XHRcdFx0XHRpbnN0YW5jZS51cGRhdGUoKS5ydW4oKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHNldFRvdGFsTWFudWFsbHk6IChudW0pID0+IHtcclxuXHRcdFx0XHRcdGluc3RhbmNlLnNldFRvdGFsTWFudWFsbHkobnVtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0fSBjYXRjaChlKSB7XHJcblx0XHRcdGVycm9yKGUpO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcbiIsImNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcbmNvbnN0IGRhdGVVdGlscyA9IHJlcXVpcmUoJy4uL2RhdGVVdGlscy5qcycpO1xyXG5jb25zdCB7YWRkQ2xhc3MsIGlzRm4sIGVycm9yVGhyb3csIGhhc1Byb3AsIGxvZywgd2FybiwgZXJyb3IsXHJcbiAgICAgICBpc0Jvb2wsIGlzTm9uRW1wdHlTdHJpbmcsXHJcbiAgICAgICBpdGVyYXRlLCByZW1vdmVDbGFzcywgZXh0ZW5kMiwgaXNPYmplY3QsIHJlcGxhY2VJZHNXaXRoSW5kaWNlc30gPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxuZnVuY3Rpb24gZ2V0VmFsdWUodHIsIGkpIHtyZXR1cm4gdHIuY2VsbHNbaV0udGV4dENvbnRlbnQudHJpbSgpLnRvTG93ZXJDYXNlKCk7fVxyXG5cclxuY29uc3QgRklSU1RfRU5BQkxFRF9DRUxMID0gJ2ZpcnN0RW5hYmxlZCc7XHJcbmNvbnN0IFNPUlRfT1JERVJfQVNDID0gJ2FzYyc7XHJcbmNvbnN0IFNPUlRfT1JERVJfREVTQyA9ICdkZXNjJztcclxuXHJcbi8qKlxyXG4gKiBUaGUgUGFyc2VyIGNsYXNzIGVuY2Fwc3VsYXRlcyBjb21wYXJlIGZ1bmN0aW9ucyBmb3IgdGhlIHNvcnRpbmcgZnVuY3Rpb25hbGl0eVxyXG4gKiBBIFBhcnNlciBjYW4gZWl0aGVyIGVuY2Fwc3VsYXRlIHR3byB0eXBlcyBvZiBjb21wYXJlIGZ1bmN0aW9uczpcclxuICogYSkgYSBzaW1wbGUgY29tcGFyZSBmdW5jdGlvbiwgdGFraW5nIDIgYXJndW1lbnRzIGFuZCByZXR1cm5pbmcgYSB2YWx1ZSA8MCwgMCBvciA+MFxyXG4gKiBiKSBhIHBhcmFtZXRyaWMgY29tcGFyZSBmdW5jdGlvbiwgdGFraW5nIG9uZSBhcmd1bWVudCAodGhlIHBhcmFtZXRlcnMpIGFuZCByZXR1cm5pbmdcclxuICogICAgYSBjb21wYXJlIGZ1bmN0aW9uIGFzIGRlc2NyaWJlZCBpbiBhKVxyXG4gKi9cclxuY2xhc3MgUGFyc2VyIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgcGFyc2VyXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRGbiAtIEVpdGhlciBhIHNpbXBsZSBjb21wYXJlIGZ1bmN0aW9uIG9yIGEgcGFyYW1ldHJpYyBvbmVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0U2V0dGluZ3MgLSBUaGUgZGVmYXVsdCBzZXR0aW5ncyBmb3IgYSBwYXJhbWV0cmljIGNvbXBhcmVcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wYXJlIGZ1bmN0aW9uLCBvbWl0IGlmIGl0IGlzIG5vdCBhIHBhcmFtZXRyaWMgb25lXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGdldEZuLCBkZWZhdWx0U2V0dGluZ3MpIHtcclxuICAgICAgICBpZiAoIWlzRm4oZ2V0Rm4pKSB7XHJcbiAgICAgICAgICAgIGVycm9yVGhyb3coJ0ZpcnN0IGFyZ3VtZW50IGdpdmVuIHRvIHBhcnNlciBtdXN0IGJlIGEgZnVuY3Rpb24hJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2V0Rm4gPSBnZXRGbjtcclxuICAgICAgICB0aGlzLmRlZmF1bHRTZXR0aW5ncyA9IGlzT2JqZWN0KGRlZmF1bHRTZXR0aW5ncykgPyBkZWZhdWx0U2V0dGluZ3MgOiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgYWN0dWFsIGNvbXBhcmUgZnVuY3Rpb24gZnJvbSB0aGUgZW5jYXBzdWxhdGVkIG9uZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3ZpZGVkU2V0dGluZ3MgLSBQYXJhbWV0ZXJzIGdpdmVuIHRvIGEgcGFyYW1ldHJpYyBjb21wYXJlIGZ1bmN0aW9uLFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbWl0IGlmIGl0J3Mgbm90IGEgcGFyYW1ldHJpYyBvbmVcclxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIGFjdHVhbCBjb21wYXJlIGZ1bmN0aW9uIHRvIGJlIHVzZWQgaW4gc29ydGluZyBhbGdvcml0aG1cclxuICAgICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwYXJhbWV0ZXJzIGFyZSBnaXZlbiBmb3IgYSBub24tcGFyYW1ldHJpYyBjb21wYXJlIGZ1bmN0aW9uXHJcbiAgICAgKi9cclxuICAgIGdldChwcm92aWRlZFNldHRpbmdzKSB7XHJcbiAgICAgICAgbGV0IHNldHRpbmdzR2l2ZW4gPSBpc09iamVjdChwcm92aWRlZFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgaWYgKHNldHRpbmdzR2l2ZW4gJiYgIXRoaXMuZGVmYXVsdFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGVycm9yVGhyb3coXCJUaGlzIHBhcnNlciBkb2Vzbid0IGFjY2VwdCBvcHRpb25zIVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vVGhlIGNvbXBhcmUgZnVuY3Rpb24gdG8gYmUgcmV0dXJuZWRcclxuICAgICAgICBsZXQgcmV0Rm4gPSB0aGlzLmdldEZuO1xyXG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRTZXR0aW5ncykge1xyXG4gICAgICAgICAgICBpZighc2V0dGluZ3NHaXZlbikge1xyXG4gICAgICAgICAgICAgICAgcHJvdmlkZWRTZXR0aW5ncyA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGV4dGVuZDIocHJvdmlkZWRTZXR0aW5ncywgdGhpcy5kZWZhdWx0U2V0dGluZ3MpO1xyXG4gICAgICAgICAgICByZXRGbiA9IHRoaXMuZ2V0Rm4ocHJvdmlkZWRTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgIGlmICghaXNGbihyZXRGbikpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yVGhyb3coXCJQYXJzZXIgZGlkbid0IHJldHVybiBhIGNvbXBhcmUgZnVuY3Rpb24hXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXRGbjtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgU29ydGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHRhYmxlTW9kaWZ5LCBzZXR0aW5ncykge1xyXG4gICAgICAgIC8vU2V0IGluaXRpYWwgdmFsdWVzXHJcbiAgICAgICAgZXh0ZW5kMih0aGlzLCB7XHJcbiAgICAgICAgICAgIHJlYWR5OiB0cnVlLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7fSxcclxuICAgICAgICAgICAgaGVhZENlbGxzOiBbXSxcclxuICAgICAgICAgICAgcm93czogW11cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2V0dGluZ3MuY29sdW1ucyA9IHJlcGxhY2VJZHNXaXRoSW5kaWNlcyhzZXR0aW5ncy5jb2x1bW5zKTtcclxuICAgICAgICAvL1N0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSB0YWJsZW1vZGlmeSBpbnN0YW5jZVxyXG4gICAgICAgIHRoaXMudG0gPSB0YWJsZU1vZGlmeTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3J0Q29sdW1ucyA9IHNldHRpbmdzLmNvbHVtbnM7XHJcbiAgICAgICAgLy9BcnJheSBvZiBzdHJ1Y3R1cmUgW1tjb2xfaW5kZXhfMSwgdHJ1ZSB8IGZhbHNlXSwgW2NvbF9pbmRleF8yLCB0cnVlIHwgZmFsc2VdLCAuLi5dXHJcbiAgICAgICAgdGhpcy5jdXJyZW50T3JkZXJzID0gW107XHJcbiAgICAgICAgdGhpcy5oZWFkQ2VsbHMgPSB0aGlzLnRtLmhlYWQgPyBbXS5zbGljZS5jYWxsKHRoaXMudG0uaGVhZC5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscykgOiBbXS5zbGljZS5jYWxsKHRoaXMudG0uYm9keS50SGVhZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscyk7XHJcblxyXG4gICAgICAgIGl0ZXJhdGUoc2V0dGluZ3MuY3VzdG9tUGFyc2VycywgKG5hbWUsIGZ1bmMpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYXJzZXJzW25hbWVdID0gbmV3IFBhcnNlcihmdW5jKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gYXR0YWNoIHNvcnRpbmcgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICAgICAgaXRlcmF0ZSh0aGlzLmhlYWRDZWxscywgKGksIGNlbGwpID0+IHtcclxuICAgICAgICAgICAgaSA9IHBhcnNlSW50KGkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0SXNFbmFibGVkKGkpKSB7XHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhjZWxsLCAnc29ydGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGNlbGwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIHNldHRpbmdzLmVuYWJsZU11bHRpc29ydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hbmFnZU11bHRpKGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFuYWdlKGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB0cnkgdG8gc29ydCBieSBpbml0aWFsIHNvcnRpbmdcclxuICAgICAgICBpZiAoc2V0dGluZ3MuaW5pdGlhbENvbHVtbiAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgbGV0IGluaXRJbmRleCA9IHNldHRpbmdzLmluaXRpYWxDb2x1bW47XHJcbiAgICAgICAgICAgIGxldCBpbml0T3JkZXIgPSBzZXR0aW5ncy5pbml0aWFsT3JkZXI7XHJcbiAgICAgICAgICAgIGluaXRPcmRlciA9IGluaXRPcmRlciA9PT0gU09SVF9PUkRFUl9BU0M7XHJcbiAgICAgICAgICAgIC8vaWYgc3BlY2lhbCB2YWx1ZSBmaXJzdF9lbmFibGVkIGlzIHByb3ZpZGVkLCBzZWFyY2ggZm9yIGZpcnN0IHNlYXJjaGFibGUgY29sdW1uXHJcbiAgICAgICAgICAgIGlmIChpbml0SW5kZXggPT09IEZJUlNUX0VOQUJMRURfQ0VMTCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbENvdW50ID0gdGhpcy50bS5nZXRDb2x1bW5Db3VudCgpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xDb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0SXNFbmFibGVkKGkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRJbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRJc0VuYWJsZWQoaW5pdEluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYW5hZ2UoaW5pdEluZGV4LCBmYWxzZSwgaW5pdE9yZGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGN1cnJlbnQgb3JkZXIgZm9yIGEgZ2l2ZW4gY29sdW1uIG9yIGFkZHMgYSBuZXcgb3JkZXIgaWYgYW4gb3JkZXJcclxuICAgICAqIGZvciB0aGlzIGNvbHVtbiBkaWQgbm90IGV4aXN0XHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY29sdW1uSW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGNvbHVtblxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBvcmRlciAtIHRydWUgZm9yIGFzY2VuZGluZywgZmFsc2UgZm9yIGRlc2NlbmRpbmcgb3JkZXJcclxuICAgICAqIEByZXR1cm5zIHRoaXMgZm9yIG1ldGhvZCBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICBzZXRPckFkZE9yZGVyKGNvbHVtbkluZGV4LCBvcmRlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmhhc09yZGVyKGNvbHVtbkluZGV4KSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRPcmRlcnMuZmlsdGVyKGUgPT4gZVswXSA9PT0gY29sdW1uSW5kZXgpWzBdWzFdID0gb3JkZXI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50T3JkZXJzLnB1c2goW2NvbHVtbkluZGV4LCBvcmRlcl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZXJlIGV4aXN0cyBhIGN1cnJlbnQgb3JkZXIgZm9yIHRoZSBjb2x1bW4gc3BlY2lmaWVkIGJ5IGNvbHVtbkluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICovXHJcbiAgICBoYXNPcmRlcihjb2x1bW5JbmRleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRPcmRlcnMuZmlsdGVyKGUgPT4gZVswXSA9PT0gY29sdW1uSW5kZXgpLmxlbmd0aCA+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IG9yZGVyIGZvciB0aGUgY29sdW1uIHNwZWNpZmllZCBieSBjb2x1bUluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBmb3IgYXNjZW5kaW5nLCBmYWxzZSBmb3IgZGVzY2VuZGluZywgdW5kZWZpbmVkIGlmIG5vIG9yZGVyIGV4aXN0c1xyXG4gICAgICovXHJcbiAgICBnZXRPcmRlcihjb2x1bW5JbmRleCkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNPcmRlcihjb2x1bW5JbmRleCkpIHJldHVybjtcclxuICAgICAgICBsZXQgb3JkZXIgPSB0aGlzLmN1cnJlbnRPcmRlcnMuZmlsdGVyKGUgPT4gZVswXSA9PT0gY29sdW1uSW5kZXgpWzBdO1xyXG4gICAgICAgIHJldHVybiBvcmRlclsxXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYWxsIGN1cnJlbnQgb3JkZXJzXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzIGZvciBtZXRob2QgY2hhaW5pbmdcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQWxsT3JkZXJzKCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE9yZGVycyA9IFtdO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgY29tcGFyZSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBjb2x1bW5cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpIC0gVGhlIGNvbHVtbiBpbmRleFxyXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgY29tcGFyZSBmdW5jdGlvblxyXG4gICAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXJzZXIgZm9yIHRoZSBnaXZlbiBjb2x1bW4gY2Fubm90IGJlIGZvdW5kXHJcbiAgICAgKi9cclxuICAgIGdldFBhcnNlcihpKSB7XHJcbiAgICAgICAgbGV0IHBhcnNlck9iajtcclxuICAgICAgICAvL0ZpbmQgb3V0IGlmIHdlIGhhdmUgdG8gdXNlIHRoZSBwYXJzZXIgZ2l2ZW4gZm9yIGFsbCBjb2x1bW5zIG9yIHRoZXJlIGlzIGFuIGluZGl2aWR1YWwgcGFyc2VyXHJcbiAgICAgICAgaWYgKGhhc1Byb3AodGhpcy5zb3J0Q29sdW1ucywgaSwgJ3BhcnNlcicpKSB7XHJcbiAgICAgICAgICAgIHBhcnNlck9iaiA9IHRoaXMuc29ydENvbHVtbnNbaV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcGFyc2VyT2JqID0gdGhpcy5zb3J0Q29sdW1ucy5hbGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighdGhpcy5wYXJzZXJzLmhhc093blByb3BlcnR5KHBhcnNlck9iai5wYXJzZXIpKSB7XHJcbiAgICAgICAgICAgIGVycm9yVGhyb3coYFRoZSBnaXZlbiBwYXJzZXIgJHtwYXJzZXJPYmoucGFyc2VyfSBkb2VzIG5vdCBleGlzdCFgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlcnNbcGFyc2VyT2JqLnBhcnNlcl0uZ2V0KHBhcnNlck9iai5wYXJzZXJPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHNvcnRpbmcgYnkgYSBnaXZlbiBjb2x1bW4gaXMgZW5hYmxlZFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGkgLSBUaGUgY29sdW1uIGluZGV4XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZ2V0SXNFbmFibGVkKGkpIHtcclxuICAgICAgICByZXR1cm4gaGFzUHJvcCh0aGlzLnNvcnRDb2x1bW5zLCBpLCAnZW5hYmxlZCcpXHJcbiAgICAgICAgICAgICAgID8gdGhpcy5zb3J0Q29sdW1uc1tpXS5lbmFibGVkXHJcbiAgICAgICAgICAgICAgIDogdGhpcy5zb3J0Q29sdW1ucy5hbGwuZW5hYmxlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYWxsIGNvbXBhcmUgZnVuY3Rpb25zIG5lZWRlZCB0byBzb3J0IGJ5IHRoZSBjdXJyZW50bHkgYWN0aXZlIHNvcnQgY29sdW1uc1xyXG4gICAgICogQHJldHVybnMge0FycmF5fSBBcnJheSBvZiBjb21wYXJlIGZ1bmN0aW9uc1xyXG4gICAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXJzZXIgZm9yIG9uZSBvZiB0aGUgY3VycmVudCBjb2x1bW5zIGNhbm5vdCBiZSBmb3VuZFxyXG4gICAgICovXHJcbiAgICBnZXRQYXJzZXJzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRPcmRlcnMubWFwKG9yZGVyID0+IHRoaXMuZ2V0UGFyc2VyKG9yZGVyWzBdKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEb2VzIHRoZSBhY3R1YWwgc29ydGluZyB3b3JrIGJ5IGFsbCBnaXZlbiBzb3J0IG9yZGVycywgZG9lcyBubyBET00gbWFuaXB1bGF0aW9uXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzIGZvciBtZXRob2QgY2hhaW5pbmdcclxuICAgICAqL1xyXG4gICAgc29ydCgpIHtcclxuICAgIFx0aWYgKHRoaXMudG0uYmVmb3JlVXBkYXRlKCdzb3J0ZXInKSkge1xyXG4gICAgXHRcdGxldCBvcmRlcnMgPSB0aGlzLmN1cnJlbnRPcmRlcnMsXHJcbiAgICAgICAgXHRtYXhEZXB0aCA9IG9yZGVycy5sZW5ndGggLSAxLFxyXG4gICAgICAgIFx0cGFyc2VycyA9IHRoaXMuZ2V0UGFyc2VycygpO1xyXG5cclxuXHQgICAgICAgIGlmIChvcmRlcnMubGVuZ3RoICE9PSAwKSB7XHJcblx0ICAgICAgICBcdGxldCBzb3J0ZWQgPSB0aGlzLnRtLmdldEF2YWlsYWJsZVJvd3MoKS5zb3J0KChhLCBiKSA9PiB7XHJcblx0ICAgICAgICAgICAgICAgIGxldCBjb21wYXJlUmVzdWx0ID0gMCwgY3VyRGVwdGggPSAwO1xyXG5cdCAgICAgICAgICAgICAgICB3aGlsZSAoY29tcGFyZVJlc3VsdCA9PT0gMCAmJiBjdXJEZXB0aCA8PSBtYXhEZXB0aCkge1xyXG5cdCAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gb3JkZXJzW2N1ckRlcHRoXVswXTtcclxuXHQgICAgICAgICAgICAgICAgICAgIGNvbXBhcmVSZXN1bHQgPSBwYXJzZXJzW2N1ckRlcHRoXShnZXRWYWx1ZShhLCBpbmRleCksIGdldFZhbHVlKGIsIGluZGV4KSk7XHJcblx0ICAgICAgICAgICAgICAgICAgICArK2N1ckRlcHRoO1xyXG5cdCAgICAgICAgICAgICAgICB9XHJcblx0ICAgICAgICAgICAgICAgIC0tY3VyRGVwdGg7XHJcblx0ICAgICAgICAgICAgICAgIHJldHVybiBvcmRlcnNbY3VyRGVwdGhdWzFdID8gY29tcGFyZVJlc3VsdCA6IC1jb21wYXJlUmVzdWx0O1xyXG5cdCAgICAgICAgICAgIH0pO1xyXG5cclxuXHQgICAgICAgICAgICB0aGlzLnRtLnNldEF2YWlsYWJsZVJvd3Moc29ydGVkKTtcclxuXHQgICAgICAgIH1cclxuXHQgICAgICAgIHRoaXMudG0uYWN0aW9uUGlwZWxpbmUubm90aWZ5KCdzb3J0ZXInKTtcclxuICAgIFx0fVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgY29ycmVzcG9uZGluZyBjc3MgY2xhc3NlcyBmb3IgYXNjZW5kaW5nL2Rlc2NlbmRpbmcgc29ydCBvcmRlciB0byB0aGUgaGVhZGVyc1xyXG4gICAgICogb2YgY3VycmVudGx5IGFjdGl2ZSBzb3J0IGNvbHVtbnMgdG8gcHJvdmlkZSBhIHZpc3VhbCBmZWVkYmFjayB0byB0aGUgdXNlclxyXG4gICAgICogQHJldHVybnMgdGhpcyBmb3IgbWV0aG9kIGNoYWluaW5nXHJcbiAgICAgKi9cclxuICAgIHJlbmRlclNvcnRpbmdBcnJvd3MoKSB7XHJcbiAgICAgICAgLy8gcmVtb3ZlIGN1cnJlbnQgc29ydGluZyBjbGFzc2VzXHJcbiAgICAgICAgaXRlcmF0ZSh0aGlzLnRtLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuc29ydC11cCwgLnNvcnQtZG93bicpLCAoaSwgY2VsbCkgPT4ge1xyXG4gICAgICAgICAgICByZW1vdmVDbGFzcyhjZWxsLCAnc29ydC11cCcpO1xyXG4gICAgICAgICAgICByZW1vdmVDbGFzcyhjZWxsLCAnc29ydC1kb3duJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IHRoaXMuY3VycmVudE9yZGVycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xyXG4gICAgICAgICAgICBsZXQgW2luZGV4LCBvcmRlcl0gPSB0aGlzLmN1cnJlbnRPcmRlcnNbaV07XHJcbiAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5oZWFkQ2VsbHNbaW5kZXhdO1xyXG4gICAgICAgICAgICBhZGRDbGFzcyhjZWxsLCBvcmRlciA/ICdzb3J0LXVwJyA6ICdzb3J0LWRvd24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGEgc29ydGluZyBhY3Rpb24gZm9yIGEgc3BlY2lmaWMgY29sdW1uXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY29sSW5kZXggLSBUaGUgY29sdW1uIGluZGV4XHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IG11bHRpU29ydCAtIGlmIHRydWUgYW5kIHNvcnRpbmcgYnkgZ2l2ZW4gY29sdW1uIHdhcyBhbHJlYWR5IGVuYWJsZWQsIGp1c3RcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIHRoZSBzb3J0aW5nIG9yZGVyLCBvdGhlcndpc2UgYXBwZW5kIHRvIHRoZSBzb3J0aW5nIG9yZGVyc1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBmYWxzZSwgYWxsIGN1cnJlbnQgc29ydGluZyBvcmRlcnMgYXJlIHJlbW92ZWQgYW5kIHNvcnRpbmcgYnlcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGdpdmVuIGNvbHVtbiB3aWxsIGJlIGVuYWJsZWRcclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3JkZXIgLSB0cnVlIGZvciBhc2NlbmRpbmcsIGZhbHNlIGZvciBkZXNjZW5kaW5nLCBvbWl0IGZvciBpbnZlcnRpbmcgb2YgdGhlXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCBvcmRlciAoaWYgbm9uZSBleGlzdGVkLCBhc2NlbmRpbmcgaXMgdXNlZClcclxuICAgICAqIEByZXR1cm5zIHRoaXMgZm9yIG1ldGhvZCBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICBtYW5hZ2UoY29sSW5kZXgsIG11bHRpU29ydCwgb3JkZXIpIHtcclxuXHJcbiAgICBcdGlmICh0eXBlb2YgY29sSW5kZXggPT0gJ3N0cmluZycgJiYgaXNOYU4ocGFyc2VJbnQoY29sSW5kZXgpKSkge1xyXG4gICAgXHRcdGxldCBpID0gdGhpcy50bS5pZDJpbmRleChjb2xJbmRleCk7XHJcblxyXG4gICAgXHRcdGlmIChpICE9IG51bGwpIGNvbEluZGV4ID0gaTtcclxuICAgIFx0fVxyXG5cclxuICAgIFx0LypcclxuICAgICAgICBpZiAoIXRoaXMuZ2V0SXNFbmFibGVkKGNvbEluZGV4KSkge1xyXG4gICAgICAgICAgICB3YXJuKGBUcmllZCB0byBzb3J0IGJ5IG5vbi1zb3J0YWJsZSBjb2x1bW4gaW5kZXggJHtjb2xJbmRleH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSovXHJcbiAgICAgICAgaWYgKCFpc0Jvb2wob3JkZXIpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc09yZGVyKGNvbEluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgb3JkZXIgPSAhdGhpcy5nZXRPcmRlcihjb2xJbmRleCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvcmRlciA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG11bHRpU29ydCAhPT0gdHJ1ZSkgdGhpcy5yZW1vdmVBbGxPcmRlcnMoKTtcclxuICAgICAgICB0aGlzLnNldE9yQWRkT3JkZXIoY29sSW5kZXgsIG9yZGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3J0KCkucmVuZGVyU29ydGluZ0Fycm93cygpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2hvcnRjdXQgZm9yIHRoZSBtYW5hZ2UgbWV0aG9kIHdpdGggbXVsdGlTb3J0IHNldCB0byB0cnVlXHJcbiAgICAgKiBAcmV0dXJucyB0aGlzIGZvciBtZXRob2QgY2hhaW5pbmdcclxuICAgICAqL1xyXG4gICAgbWFuYWdlTXVsdGkoY29sSW5kZXgsIG9yZGVyKSB7XHJcbiAgICAgICAgdGhpcy5tYW5hZ2UoY29sSW5kZXgsIHRydWUsIG9yZGVyKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5Tb3J0ZXIucHJvdG90eXBlLnBhcnNlcnMgPSB7XHJcbiAgICBzdHJpbmc6IG5ldyBQYXJzZXIoKGEsIGIpID0+IHtcclxuICAgICAgICBpZiAoYSA+IGIpIHJldHVybiAxO1xyXG4gICAgICAgIGlmIChhIDwgYikgcmV0dXJuIC0xO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfSksXHJcbiAgICBudW1lcmljOiBuZXcgUGFyc2VyKChhLCBiKSA9PiB7XHJcbiAgICAgICAgYSA9IHBhcnNlRmxvYXQoYSk7XHJcbiAgICAgICAgYiA9IHBhcnNlRmxvYXQoYik7XHJcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xyXG4gICAgfSksXHJcbiAgICBpbnRlbGxpZ2VudDogbmV3IFBhcnNlcigoYSwgYikgPT4ge1xyXG4gICAgICAgIHZhciBpc051bWVyaWNBID0gIWlzTmFOKGEpLFxyXG4gICAgICAgICAgICBpc051bWVyaWNCID0gIWlzTmFOKGIpO1xyXG5cclxuICAgICAgICBpZiAoaXNOdW1lcmljQSAmJiBpc051bWVyaWNCKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGEpIC0gcGFyc2VGbG9hdChiKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzTnVtZXJpY0EpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljQikge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoYSA+IGIpIHJldHVybiAxO1xyXG4gICAgICAgICAgICBpZiAoYSA8IGIpIHJldHVybiAtMTtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSksXHJcbiAgICAvKipcclxuICAgICAqIEEgcGFyYW1ldHJpYyBwYXJzZXIgd2hpY2ggdGFrZXMgdHdvIGFyZ3VtZW50cywgJ3ByZXNldCcgYW5kICdmb3JtYXQnLlxyXG4gICAgICogSWYgZm9ybWF0IGlzIGdpdmVuLCBpdCBvdmVycmlkZXMgYSBwb3RlbnRpYWwgcHJlc2V0LCBmb3JtYXQgc2hvdWxkIGJlIGFcclxuICAgICAqIGZvcm1hdCBzdHJpbmcgKHRva2VucyBkZXNjcmliZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3RheWxvcmhha2VzL2ZlY2hhI2Zvcm1hdHRpbmctdG9rZW5zKVxyXG4gICAgICogcHJlc2V0IGlzIGVpdGhlciAnZW5nbGlzaCcgb3IgJ2dlcm1hbicgYW5kIHdpbGwgcGFyc2UgdGhlIGNvbW1vbiBmb3JtcyBvZiBlbmdsaXNoL2dlcm1hblxyXG4gICAgICogZGF0ZSBmb3JtYXRzXHJcbiAgICAgKi9cclxuICAgIGRhdGU6IG5ldyBQYXJzZXIoc2V0dGluZ3MgPT4ge1xyXG5cclxuICAgICAgICBsZXQge2ZlY2hhLCBEQVRFX0kxOE4sIERBVEVfRk9STUFUU30gPSBkYXRlVXRpbHM7XHJcblxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5mb3JtYXQpIHtcclxuICAgICAgICAgICAgaWYgKCFpc05vbkVtcHR5U3RyaW5nKHNldHRpbmdzLmZvcm1hdCkpIHtcclxuICAgICAgICAgICAgICAgIGVycm9yVGhyb3coYEludmFsaWQgZGF0ZSBwYXJzaW5nIGZvcm1hdCAke3NldHRpbmdzLmZvcm1hdH0gZ2l2ZW5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFEYXRlID0gZmVjaGEucGFyc2UoYSwgc2V0dGluZ3MuZm9ybWF0KTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYkRhdGUgPSBmZWNoYS5wYXJzZShiLCBzZXR0aW5ncy5mb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYURhdGUgfHwgIWJEYXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJjb3VsZG4ndCBwYXJzZSBkYXRlIVwiKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYURhdGUgLSBiRGF0ZTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvclRocm93KGBFcnJvciB3aGlsZSBjb21wYXJpbmcgZGF0ZXM6ICR7ZX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoc2V0dGluZ3MucHJlc2V0KSB7XHJcbiAgICAgICAgICAgIGxldCBpMThuID0gREFURV9JMThOW3NldHRpbmdzLnByZXNldF07XHJcbiAgICAgICAgICAgIGlmICghaTE4bikgZXJyb3JUaHJvdyhgSW52YWxpZCBwcmVzZXQgbmFtZSAke3NldHRpbmdzLnByZXNldH0gZ2l2ZW4hYCk7XHJcbiAgICAgICAgICAgIGxldCBmb3JtYXRzID0gREFURV9GT1JNQVRTW3NldHRpbmdzLnByZXNldF07XHJcbiAgICAgICAgICAgIHJldHVybiAoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYURhdGUgPSBmYWxzZSwgYkRhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoIWFEYXRlICYmIGluZGV4IDwgZm9ybWF0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYURhdGUgPSBmZWNoYS5wYXJzZShhLCBmb3JtYXRzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJEYXRlID0gZmVjaGEucGFyc2UoYiwgZm9ybWF0c1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK2luZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFEYXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJOb25lIG9mIHRoZSBnaXZlbiBwYXJzZXJzIG1hdGNoZWQhXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhRGF0ZSAtIGJEYXRlO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGhyb3coYENvdWxkbid0IGNvbXBhcmUgZGF0ZXM6ICR7ZX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVycm9yVGhyb3coXCJOZWl0aGVyIGEgcHJlc2V0IG5vciBhIGRhdGUgZm9ybWF0IGhhcyBiZWVuIGdpdmVuIVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9LCB7XHJcbiAgICAgICAgcHJlc2V0OiBkYXRlVXRpbHMuREFURV9HRVJNQU5cclxuICAgIH0pLFxyXG4gICAgLypcclxuICAgICAgICBnZXJtYW4gZGF5cyBvZiB0aGUgd2Vla1xyXG4gICAgKi9cclxuICAgIGRheXNPZlRoZVdlZWs6IGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICBmdW5jdGlvbiBnZXRJbmRleChzdHIpIHtcclxuICAgICAgICAgICAgdmFyIGkgPSAtMSwgbCA9IGRheXMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgd2hpbGUgKGwgPiAtMSAmJiBpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaSA9IGRheXNbbF0uaW5kZXhPZihzdHIpO1xyXG4gICAgICAgICAgICAgICAgbC0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGRheXMgPSBbXHJcbiAgICAgICAgICAgIC8vIGdlcm1hblxyXG4gICAgICAgICAgICBbJ21vJywgJ2RpJywgJ21pJywgJ2RvJywgJ2ZyJywgJ3NhJywgJ3NvJ10sXHJcbiAgICAgICAgICAgIFsnbW9udGFnJywgJ2RpZW5zdGFnJywgJ21pdHR3b2NoJywgJ2Rvbm5lcnN0YWcnLCAnZnJlaXRhZycsICdzYW1zdGFnJywgJ3Nvbm50YWcnXSxcclxuICAgICAgICAgICAgLy8gZW5nbGlzaFxyXG4gICAgICAgICAgICBbJ21vbicsICd0dWUnLCAnd2VkJywgJ3RodScsICdmcmknLCAnc2F0JywgJ3N1biddLFxyXG4gICAgICAgICAgICBbJ21vbmRheScsICd0dWVzZGF5JywgJ3dlZG5lc2RheScsICd0aHVyc2RheScsICdmcmlkYXknLCAnc2F0dXJkYXknLCAnc3VuZGF5J11cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICByZXR1cm4gZ2V0SW5kZXgoYi50b0xvd2VyQ2FzZSgpKSAtIGdldEluZGV4KGEudG9Mb3dlckNhc2UoKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAgICBuYW1lOiBcInNvcnRlclwiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgY29sdW1uczoge1xyXG4gICAgICAgICAgICBhbGw6IHtcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBwYXJzZXI6ICdpbnRlbGxpZ2VudCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdGlhbENvbHVtbjogRklSU1RfRU5BQkxFRF9DRUxMLFxyXG4gICAgICAgIGluaXRpYWxPcmRlcjogU09SVF9PUkRFUl9BU0MsXHJcbiAgICAgICAgZW5hYmxlTXVsdGlzb3J0OiB0cnVlLFxyXG4gICAgICAgIGN1c3RvbVBhcnNlcnM6IHt9XHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZXI6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gbmV3IFNvcnRlcih0aGlzLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgYWRkQ2xhc3ModGhpcy5jb250YWluZXIsICd0bS1zb3J0ZXInKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICBcdGluc3RhbmNlOiBpbnN0YW5jZSxcclxuICAgICAgICBcdG5vdGlmeTogKCkgPT4ge1xyXG4gICAgICAgIFx0XHRpbnN0YW5jZS5zb3J0KCk7XHJcbiAgICAgICAgXHR9LFxyXG5cdFx0XHRnZXRTdGF0czogKCkgPT4ge1xyXG5cdFx0XHRcdGxldCBvcmRlcnMgPSBpbnN0YW5jZS5jdXJyZW50T3JkZXJzLm1hcCgoYXJyKSA9PiB7XHJcblx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHRpbmRleDogYXJyWzBdLFxyXG5cdFx0XHRcdFx0XHRvcmRlcjogKGFyclsxXSA/ICdhc2MnIDogJ2Rlc2MnKVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHR9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcmRlcnM7XHJcblx0XHRcdH0sXHJcbiAgICAgICAgICAgIHNvcnRBc2M6IGluZGV4ID0+IGluc3RhbmNlLm1hbmFnZShpbmRleCwgZmFsc2UsIHRydWUpLFxyXG4gICAgICAgICAgICBzb3J0RGVzYzogaW5kZXggPT4gaW5zdGFuY2UubWFuYWdlKGluZGV4LCBmYWxzZSwgZmFsc2UpLFxyXG4gICAgICAgICAgICBpbmZvOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGluc3RhbmNlLmN1cnJlbnRPcmRlcnMpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgdW5zZXQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxvZygndW5zZXR0aW5nIHNvcnRlci4uLiBub3QgaW1wbGVtZW50ZWQgeWV0Jyk7XHJcbiAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgIEBUb2RvIHNldCBvcmRlciB0byBpbml0aWFsIC4uLiBkb24ndCBrbm93IGhvdyB0byBkbyBpdCB5ZXRcclxuICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KTtcclxuIiwiY29uc3Qge2FkZENsYXNzLCBleHRlbmQsIGluZm8sIGVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcbmNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcbi8qXHJcblxyXG4gICAgREVQUkVDQVRFRCwgY2FuIGJlIHJlYWxpemVkIHZpYSBDU1MsIHNlZSBkZWZhdWx0IHRoZW1lXHJcblxyXG4qL1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gICAgbmFtZTogXCJ6ZWJyYVwiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgZXZlbjonI2YwZjBmMCcsXHJcbiAgICAgICAgb2RkOid3aGl0ZSdcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplcjogZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAvLyB0aGlzIDo9IFRhYmxlbW9kaWZ5LWluc3RhbmNlXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5jb250YWluZXIsICd0bS16ZWJyYScpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRleHQgPSAndGFibGUnICsgdGhpcy5ib2R5U2VsZWN0b3IgKyAnIHRyOm50aC1vZi10eXBlKGV2ZW4pe2JhY2tncm91bmQtY29sb3I6JyArIHNldHRpbmdzLmV2ZW4gKyAnfSdcclxuICAgICAgICAgICAgICAgICAgICAgKyAndGFibGUnICsgdGhpcy5ib2R5U2VsZWN0b3IgKyAnIHRyOm50aC1vZi10eXBlKG9kZCkge2JhY2tncm91bmQtY29sb3I6JyArIHNldHRpbmdzLm9kZCArICd9JztcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmRTdHlsZXModGV4dCk7XHJcblxyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgemVicmEgbG9hZGVkJyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdW5zZXQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBubyBpbXBsZW1lbnRhdGlvbiBuZWVkZWRcclxuICAgICAgICAgICAgICAgICAgICBpbmZvKCd1bnNldHRpbmcgemVicmEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGVycm9yKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xyXG5jb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbW9kdWxlLmpzJyk7XHJcbmNvbnN0IExhbmd1YWdlID0gcmVxdWlyZSgnLi9sYW5ndWFnZS5qcycpO1xyXG5jb25zdCBBY3Rpb25QaXBlbGluZSA9IHJlcXVpcmUoJy4vYWN0aW9uUGlwZWxpbmUuanMnKTtcclxuY29uc3QgRXZlbnRTeXN0ZW0gPSByZXF1aXJlKCcuL2V2ZW50U3lzdGVtLmpzJyk7XHJcbmNvbnN0IHtlcnJvciwgd2FybiwgaXNOb25FbXB0eVN0cmluZywgaXRlcmF0ZSwgZXh0ZW5kLCBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLCBnZXRVbmlxdWVJZCwgdGFibGVGYWN0b3J5fSA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcclxuXHJcbmNsYXNzIFRhYmxlbW9kaWZ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHNlbGVjdG9yLCBjb3JlU2V0dGluZ3MpIHtcclxuICAgICAgICBleHRlbmQoY29uZmlnLmNvcmVEZWZhdWx0cywgY29yZVNldHRpbmdzKTtcclxuICAgICAgICBsZXQgY29udGFpbmVySWQsIG9sZEJvZHlQYXJlbnQsIF90aGlzID0gdGhpcywgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyAvLyBtdXN0IGJlIGEgdGFibGVcclxuXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLSBFUlJPUiBQUkVWRU5USU9OIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHRhYmxlIGlzIHZhbGlkXHJcbiAgICAgICAgaWYgKCFib2R5IHx8IGJvZHkubm9kZU5hbWUgIT09ICdUQUJMRScpIHtcclxuICAgICAgICAgICAgZXJyb3IoJ3RoZXJlIGlzIG5vIDx0YWJsZT4gd2l0aCBzZWxlY3RvciAnICsgc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIFRtIGhhc24ndCBhbHJlYWR5IGJlZW4gY2FsbGVkIGZvciB0aGlzIHRhYmxlXHJcbiAgICAgICAgaWYgKGhhc0NsYXNzKGJvZHksICd0bS1ib2R5JykpIHtcclxuICAgICAgICAgICAgd2FybigndGhlIHRhYmxlICcgKyBzZWxlY3RvciArICcgaXMgYWxyZWFkeSBpbml0aWFsaXplZC4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjaGVjayBpZiBjb250YWluZXJJZCBpcyB2YWxpZCBvciBwcm9kdWNlIGEgdW5pcXVlIGlkXHJcbiAgICAgICAgaWYgKGNvcmVTZXR0aW5ncy5jb250YWluZXJJZCAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb3JlU2V0dGluZ3MuY29udGFpbmVySWQpKSB7XHJcbiAgICAgICAgICAgIGVycm9yKCd0aGUgcGFzc2VkIGlkICcgKyBjb3JlU2V0dGluZ3MuY29udGFpbmVySWQgKyAnIGlzIG5vdCB1bmlxdWUhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29yZVNldHRpbmdzLmNvbnRhaW5lcklkKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcklkID0gY29yZVNldHRpbmdzLmNvbnRhaW5lcklkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcklkID0gZ2V0VW5pcXVlSWQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlZmVyZW5jZXMgdG8gYWxsIGFjdGl2ZSBtb2R1bGVzIHN0b3JlZCBpbiBoZXJlXHJcbiAgICAgICAgdGhpcy5hY3RpdmVNb2R1bGVzID0ge1xyXG4gICAgICAgIFx0IC8qKlxyXG4gICAgICAgIFx0ICAqIGEgc3BlY2lhbCBtb2R1bGUgd2hpY2ggaXMgYWx3YXlzIG5vdGlmaWVkIGFmdGVyIHN0aC4gaGFwcGVuZWQgb24gdGhlIHRhYmxlIGRhdGFcclxuICAgICAgICBcdCAgKiBpdCBvbmx5IHBlcmZvcm1zIGEgcmUtcmVuZGVyaW5nIG9uIHRoZSBkYXRhXHJcbiAgICAgICAgXHQgICovXHJcbiAgICAgICAgXHRfX3JlbmRlcmVyOiB7XHJcbiAgICAgICAgXHRcdG5vdGlmeTogKG1zZyA9IHt9KSA9PiB7XHJcbiAgICAgICAgXHRcdFx0bGV0IG9mZnNldCA9IG1zZy5vZmZzZXQgfHwgMCxcclxuICAgICAgICBcdFx0XHRcdGxpbWl0ID0gbXNnLmxpbWl0IHx8IEluZmluaXR5O1xyXG4gICAgICAgICAgICBcdFx0X3RoaXMucmVuZGVyKGxpbWl0LCBvZmZzZXQpLmFjdGlvblBpcGVsaW5lLm5vdGlmeSgnX19yZW5kZXJlcicpO1xyXG4gICAgICAgIFx0XHR9XHJcbiAgICAgICAgXHR9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5U2VsZWN0b3IgPSBzZWxlY3RvcjtcclxuICAgICAgICBvbGRCb2R5UGFyZW50ID0gYm9keS5wYXJlbnRFbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLmNvbHVtbkNvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbHVtbkNvdW50KGJvZHkpO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRMYW5ndWFnZSA9IGNvcmVTZXR0aW5ncy5sYW5ndWFnZTtcclxuXHJcbiAgICAgICAgYm9keS5vdXRlckhUTUwgPVxyXG4gICAgICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPSd0bS1jb250YWluZXInPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3R5bGUgY2xhc3M9J3RtLWN1c3RvbS1zdHlsZSc+PC9zdHlsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ndG0tYm9keS13cmFwJz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7Ym9keS5vdXRlckhUTUx9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gb2xkQm9keVBhcmVudC5xdWVyeVNlbGVjdG9yKCcudG0tY29udGFpbmVyJyk7XHJcblxyXG4gICAgICAgIGJvZHkgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCd0YWJsZScpOyAvLyBpbXBvcnRhbnQhIHJlbG9hZCBib2R5IHZhcmlhYmxlXHJcblxyXG4gICAgICAgIHRoaXMuYm9keSA9IGJvZHk7XHJcbiAgICAgICAgdGhpcy5ib2R5V3JhcCA9IGJvZHkucGFyZW50RWxlbWVudDtcclxuICAgICAgICB0aGlzLnN0eWxlc2hlZXQgPSB0aGlzLmJvZHlXcmFwLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcblxyXG4gICAgICAgIHRoaXMub3JpZ0hlYWQgPSBib2R5LnRIZWFkO1xyXG4gICAgICAgIHRoaXMub3JpZ0Zvb3QgPSBib2R5LnRGb290O1xyXG5cclxuICAgICAgICAvLyBhZGQgb3B0aW9uYWwgaWQgdG8gY29udGFpbmVyXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuaWQgPSBjb250YWluZXJJZDtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lcklkICA9IGNvbnRhaW5lcklkO1xyXG5cclxuICAgICAgICAvLyBhZGQgdGhlbWUgY2xhc3MgdG8gY29udGFpbmVyXHJcbiAgICAgICAgYWRkQ2xhc3ModGhpcy5jb250YWluZXIsICgndG0tdGhlbWUtJyArIGNvcmVTZXR0aW5ncy50aGVtZSkpO1xyXG4gICAgICAgIGFkZENsYXNzKGJvZHksICd0bS1ib2R5Jyk7XHJcblxyXG4gICAgICAgIC8vIHRoZSB0Qm9keSwgY29udGFpbnMgYWxsIHZpc2libGUgcm93cyBpbiB0aGUgdGFibGVcclxuICAgICAgICB0aGlzLkRPTSA9IHRoaXMuYm9keS50Qm9kaWVzWzBdO1xyXG4gICAgICAgIC8vIGNvbnRhaW5zIGFsbCB0ci1ub2RlcyB0aGF0IGFyZSBub3QgZGlzcGxheWVkIGF0IHRoZSBtb21lbnRcclxuICAgICAgICB0aGlzLmhpZGRlblJvd3MgPSBbXTtcclxuICAgICAgICAvLyBhbiBhcnJheSBjb250YWluaW5nIHJlZmVyZW5jZXMgdG8gYWxsIGF2YWlsYWJsZSB0ciBlbGVtZW50cy4gVGhleSBhcmUgbm90IG5lY2Vzc2FyaWx5IGRpc3BsYXllZCBpbiB0aGUgRE9NXHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVSb3dzID0gW10uc2xpY2UuY2FsbCh0aGlzLkRPTS5yb3dzKTtcclxuXHJcbiAgICAgICAgdGhpcy5hY3Rpb25QaXBlbGluZSA9IG5ldyBBY3Rpb25QaXBlbGluZSh0aGlzKTtcclxuICAgICAgICB0aGlzLmV2ZW50U3lzdGVtID0gbmV3IEV2ZW50U3lzdGVtKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY29yZVNldHRpbmdzID0gY29yZVNldHRpbmdzO1xyXG5cclxuICAgICAgICAvLyBjYWxsIGFsbCBtb2R1bGVzXHJcbiAgICAgICAgaWYgKGNvcmVTZXR0aW5ncy5tb2R1bGVzKSB7XHJcbiAgICAgICAgICAgIC8vIGludGVyZmFjZSBmb3IgbW9kdWxlc1xyXG4gICAgICAgICAgICBpdGVyYXRlKGNvcmVTZXR0aW5ncy5tb2R1bGVzLCBmdW5jdGlvbihtb2R1bGVOYW1lLCBtb2R1bGVTZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1vZHVsZSA9IFRhYmxlbW9kaWZ5Lm1vZHVsZXNbbW9kdWxlTmFtZV0sXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlUmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZVJldHVybiA9IG1vZHVsZS5nZXRNb2R1bGUoX3RoaXMsIG1vZHVsZVNldHRpbmdzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2FybignTW9kdWxlJyArIG1vZHVsZU5hbWUgKyAnIG5vdCByZWdpc3RlcmVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZVJldHVybiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmFjdGl2ZU1vZHVsZXNbbW9kdWxlTmFtZV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkZWZpbmUgcmV0IGFzIGEgcHJvcGVydHkgb2YgdGhlIFRhYmxlbW9kaWZ5IGluc3RhbmNlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub3cgeW91IGNhbiBhY2Nlc3MgaXQgbGF0ZXIgdmlhIHRtLm1vZHVsZW5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYWN0aXZlTW9kdWxlc1ttb2R1bGVOYW1lXSA9IG1vZHVsZVJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcignbW9kdWxlIG5hbWUgJyArIG1vZHVsZU5hbWUgKyAnIGNhdXNlcyBhIGNvbGxpc2lvbiBhbmQgaXMgbm90IGFsbG93ZWQsIHBsZWFzZSBjaG9vc2UgYW5vdGhlciBvbmUhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIGNhbGN1bGF0ZSBudW1iZXIgb2YgY29sdW1ucy4gVXN1YWxseSBvbmx5IGNhbGxlZCBhdCB0aGUgaW5pdGlhbGlzYXRpb25cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlQ29sdW1uQ291bnQoZWxlbWVudCkge1xyXG4gICAgICAgIGxldCBtYXhDb2xzID0gMDtcclxuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoZWxlbWVudC5yb3dzLCByb3cgPT4ge1xyXG4gICAgICAgICAgICBpZiAocm93LmNlbGxzLmxlbmd0aCA+IG1heENvbHMpIG1heENvbHMgPSByb3cuY2VsbHMubGVuZ3RoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY29sdW1uQ291bnQgPSBtYXhDb2xzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0dGVyIGZvciBudW1iZXIgb2YgY29sdW1uc1xyXG4gICAgICovXHJcbiAgICBnZXRDb2x1bW5Db3VudCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb2x1bW5Db3VudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBjc3MgdGV4dCB0byB0aGUgaW50ZXJuYWwgc3R5bGUtdGFnIGVhY2ggdG0tY29udGFpbmVyIGNvbnRhaW5zXHJcbiAgICAgKi9cclxuICAgIGFwcGVuZFN0eWxlcyh0ZXh0KSB7XHJcbiAgICAgICAgaWYgKHRleHQudHJpbSgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZXNoZWV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQudHJpbSgpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGEgdGVybSBvdXQgb2YgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgcGFja1xyXG4gICAgICovXHJcbiAgICBnZXRUZXJtKHRlcm0pIHtcclxuICAgICAgICByZXR1cm4gVGFibGVtb2RpZnkubGFuZ3VhZ2VzW3RoaXMuY3VycmVudExhbmd1YWdlXS5nZXQodGVybSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgZ2V0IGFycmF5IG9mIHJlZmVyZW5jZXMgdG8gdGhlIHZpc2libGUgcm93c1xyXG4gICAgICovXHJcbiAgICBnZXRBdmFpbGFibGVSb3dzKCkge1xyXG4gICAgXHRyZXR1cm4gdGhpcy5hdmFpbGFibGVSb3dzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIGdldCBhcnJheSBvZiByZWZlcmVuY2VzIHRvIHRoZSBoaWRkZW4gcm93c1xyXG4gICAgICovXHJcbiAgICBnZXRIaWRkZW5Sb3dzKCkge1xyXG4gICAgXHRyZXR1cm4gdGhpcy5oaWRkZW5Sb3dzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIGdldCBhcnJheSBvZiByZWZlcmVuY2VzIHRvIGFsbCByb3dzLCBib3RoIGhpZGRlbiBhbmQgdmlzaWJsZVxyXG4gICAgICovXHJcbiAgICBnZXRBbGxSb3dzKCkge1xyXG4gICAgXHRyZXR1cm4gdGhpcy5hdmFpbGFibGVSb3dzLmNvbmNhdCh0aGlzLmhpZGRlblJvd3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0dGVyXHJcbiAgICAgKi9cclxuICAgIHNldEF2YWlsYWJsZVJvd3MoYXJyKSB7XHJcbiAgICBcdHRoaXMuYXZhaWxhYmxlUm93cyA9IGFycjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldHRlclxyXG4gICAgICovXHJcbiAgICBzZXRIaWRkZW5Sb3dzKGFycikge1xyXG4gICAgXHR0aGlzLmhpZGRlblJvd3MgPSBhcnI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXR1cm5zIG51bWJlciBvZiBhdmFpbGFibGUgcm93c1xyXG4gICAgICovXHJcbiAgICBjb3VudEF2YWlsYWJsZVJvd3MoKSB7XHJcbiAgICBcdHJldHVybiB0aGlzLmF2YWlsYWJsZVJvd3MubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJucyBudW1iZXIgb2YgaGlkZGVuIHJvd3NcclxuICAgICAqL1xyXG4gICAgY291bnRIaWRkZW5Sb3dzKCkge1xyXG4gICAgXHRyZXR1cm4gdGhpcy5oaWRkZW5Sb3dzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNob3cgYWxsIHRoZSByb3dzIHRoYXQgdGhlIHBhcmFtIHJvd0FycmF5IGNvbnRhaW5zIChhcyByZWZlcmVuY2VzKS5cclxuICAgICAqIHVzZWQgYnkgZmlsdGVyIG1vZHVsZVxyXG4gICAgICovXHJcbiAgICByZW5kZXIobGltaXQgPSBJbmZpbml0eSwgb2Zmc2V0ID0gMCkge1xyXG4gICAgXHR0aGlzLmNsZWFyRE9NKCk7XHJcbiAgICBcdGxldCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuXHJcbiAgICBcdGlmIChsaW1pdCA9PT0gSW5maW5pdHkgfHwgbGltaXQrb2Zmc2V0ID4gdGhpcy5hdmFpbGFibGVSb3dzLmxlbmd0aCkge1xyXG4gICAgXHRcdGxpbWl0ID0gdGhpcy5hdmFpbGFibGVSb3dzLmxlbmd0aDtcclxuICAgIFx0fSBlbHNlIHtcclxuICAgIFx0XHRsaW1pdCArPSBvZmZzZXQ7XHJcbiAgICBcdH1cclxuICAgICAgICAvKlxyXG4gICAgXHRmb3IgKDsgb2Zmc2V0IDwgbGltaXQ7IG9mZnNldCsrKSB7XHJcbiAgICBcdFx0ZnJhZ21lbnQuYXBwZW5kQ2hpbGQodGhpcy5hdmFpbGFibGVSb3dzW29mZnNldF0pO1xyXG4gICAgXHR9Ki9cclxuICAgICAgICB3aGlsZSAodGhpcy5hdmFpbGFibGVSb3dzW29mZnNldF0gIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgPCBsaW1pdCkge1xyXG4gICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0aGlzLmF2YWlsYWJsZVJvd3Nbb2Zmc2V0XSk7XHJcbiAgICAgICAgICAgIG9mZnNldCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIFx0dGhpcy5ET00uYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xyXG4gICAgXHRyZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVmZmljaWVudCB3YXkgdG8gZW1wdHkgdGhlIHZpc2libGUgdGFibGUgcm93c1xyXG4gICAgICogQHJldHVybiB0aGlzIGZvciBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICBjbGVhckRPTSgpIHtcclxuICAgIFx0d2hpbGUgKHRoaXMuRE9NLmZpcnN0Q2hpbGQpIHtcclxuICAgIFx0XHR0aGlzLkRPTS5yZW1vdmVDaGlsZCh0aGlzLkRPTS5maXJzdENoaWxkKTtcclxuICAgIFx0fVxyXG4gICAgXHRyZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFycyB0aGUgYm9keSBhbmQgYXBwZW5kcyBuZXcgcm93c1xyXG4gICAgICogQHBhcmFtIGRhdGE6IGFycmF5IG9yIHN0cmluZ1xyXG4gICAgICogQHJldHVybiB0aGlzIGZvciBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICBpbnNlcnRSb3dzKGRhdGEpIHtcclxuICAgIFx0cmV0dXJuIHRoaXMuY2xlYXJET00oKS5hcHBlbmRSb3dzKGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXBwZW5kcyByb3dzIHRvIHRoZSB0YWJsZSBhbmQgdXBkYXRlcyB0aGUgaW50ZXJuYWwgYXZhaWxhYmxlUm93cyAmIGhpZGRlblJvd3MgYXJyYXlzXHJcbiAgICAgKiBAcGFyYW0gZGF0YTogYXJyYXkgb3Igc3RyaW5nXHJcbiAgICAgKiBAcmV0dXJuIHRoaXMgZm9yIGNoYWluaW5nXHJcbiAgICAgKi9cclxuICAgIGFwcGVuZFJvd3MoZGF0YSkge1xyXG4gICAgXHRpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XHJcblx0ICAgICAgICB0aGlzLkRPTS5pbm5lckhUTUwgKz0gZGF0YTtcclxuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBcdFx0XHR0aGlzLkRPTS5hcHBlbmRDaGlsZChkYXRhW2ldKTtcclxuICAgIFx0XHR9XHJcbiAgICBcdH1cclxuICAgIFx0dGhpcy5zZXRBdmFpbGFibGVSb3dzKFtdLnNsaWNlLmNhbGwodGhpcy5ET00pKTtcclxuXHRcdHRoaXMuc2V0SGlkZGVuUm93cyhbXSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVSb3dzKCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXJET00oKVxyXG4gICAgICAgICAgICAuc2V0SGlkZGVuUm93cyhbXSlcclxuICAgICAgICAgICAgLnNldEF2YWlsYWJsZVJvd3MoW10pXHJcbiAgICAgICAgICAgIC5yZWxvYWQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFycyBET00gYW5kIHRoZW4gZG9lcyBhcHBlbmRSYXcoKS4gU2VlIGl0IGZvciBtb3JlIGluZm9ybWF0aW9uXHJcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAgICAgKiBAcmV0dXJuIHRoaXMgZm9yIGNoYWluaW5nXHJcbiAgICAgKi9cclxuICAgIGluc2VydFJhdyhkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xlYXJET00oKS5hcHBlbmRSYXcoZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcHBlbmRzIGRhdGEgb2YgYSBzcGVjaWFsIHJhdyBkYXRhIHR5cGU6XHJcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBkYXRhOiAyRC1hcnJheSBvZiBvYmplY3RzIGxpa2UgdGhpczoge2M6IFwiY29udGVudFwiLCBhOiB7YXR0cmlidXRlMTogdmFsdWUsIGF0dHJpYnV0ZTI6IHZhbHVlfX1cclxuICAgICAqIEByZXR1cm4gdGhpcyBmb3IgY2hhaW5pbmdcclxuICAgICAqL1xyXG4gICAgYXBwZW5kUmF3KGRhdGEpIHtcclxuICAgICAgICBsZXQgdHJQYXR0ZXJuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSxcclxuICAgICAgICAgICAgdGRQYXR0ZXJuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0ciA9IHRyUGF0dGVybi5jbG9uZU5vZGUoKSwgcm93ID0gZGF0YVtpXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGQgPSB0ZFBhdHRlcm4uY2xvbmVOb2RlKCksIGNlbGwgPSByb3dbal07XHJcbiAgICAgICAgICAgICAgICB0ZC5pbm5lckhUTUwgPSBjZWxsLmM7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5oYXNPd25Qcm9wZXJ0eSgnYScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY2VsbC5hKS5mb3JFYWNoKChwcm9wKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRkLmFkZEF0dHJpYnV0ZShwcm9wLCBjZWxsLmFbcHJvcF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdHIuYXBwZW5kQ2hpbGQodGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXZhaWxhYmxlUm93cy5wdXNoKHRyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZWxvYWQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNhbGxlZCB3aGVuIGFueSBtb2R1bGUgZGV0ZWN0cyBhIGNoYW5nZSBhbmQgYmVmb3JlIGl0IHBlcmZvcm1zIGl0cyBhY3Rpb25zLlxyXG4gICAgICogaWYgYSBcImJlZm9yZVVwZGF0ZVwiIGZ1bmN0aW9uIGlzIHBhc3NlZCBhdCB0aGUgdGFibGVtb2RpeSBpbml0aWFsaXNhdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQuXHJcbiAgICAgKiB0aGUgbW9kdWxlIG9ubHkgZG9lcyBzb21ldGhpbmcgaWYgdGhpcyBtZXRob2QgZG9lc24ndCByZXR1cm4gZmFsc2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2R1bGVOYW1lOiB3aGljaCBtb2R1bGUgY2FsbHMgdGhpcyBtZXRob2RcclxuICAgICAqL1xyXG4gICAgYmVmb3JlVXBkYXRlKG1vZHVsZU5hbWUpIHtcclxuICAgIFx0Ly8gYmVmb3JlVXBkYXRlIG1ldGhvZCBwYXNzZWQ/IEp1c3QgZ28gb24gaWYgbm90LlxyXG4gICAgXHRpZiAoIXRoaXMuY29yZVNldHRpbmdzLmhhc093blByb3BlcnR5KCdiZWZvcmVVcGRhdGUnKSkgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgXHQvLyBjb2xsZWN0IGFsbCBuZWNlc3NhcnkgZGF0YVxyXG4gICAgXHRsZXQgaW5mb3MgPSB7fTtcclxuICAgIFx0Wydzb3J0ZXInLCAnZmlsdGVyJywgJ3BhZ2VyJ10uZm9yRWFjaCgobmFtZSkgPT4ge1xyXG4gICAgXHRcdGlmICh0aGlzLmlzQWN0aXZlKG5hbWUpKSB7XHJcbiAgICBcdFx0XHRpbmZvc1tuYW1lXSA9IHRoaXMuZ2V0TW9kdWxlKG5hbWUpLmdldFN0YXRzKCk7XHJcbiAgICBcdFx0fVxyXG4gICAgXHR9KTtcclxuXHJcbiAgICBcdGxldCByZXQgPSB0aGlzLmNvcmVTZXR0aW5ncy5iZWZvcmVVcGRhdGUoaW5mb3MsIG1vZHVsZU5hbWUpO1xyXG4gICAgXHRyZXR1cm4gKHJldCA9PT0gbnVsbCB8fCByZXQgPT09IHVuZGVmaW5lZCB8fCByZXQgPT09IHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hlY2sgaWYgYSBtb2R1bGUgaXMgYWNpdHZlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZTogbmFtZSBvZiBtb2R1bGVzXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG5cdCAqL1xyXG4gICAgaXNBY3RpdmUobmFtZSkge1xyXG4gICAgXHRyZXR1cm4gdGhpcy5hY3RpdmVNb2R1bGVzLmhhc093blByb3BlcnR5KG5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJucyB0aGUgbW9kdWxlIGlmIGl0IGlzIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWU6IG5hbWUgb2YgdGhlIG1vZHVsZVxyXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBtb2R1bGUgcmV0dXJuIG9mIG51bGwgaWYgbW9kdWxlIGlzIG5vdCBhY3RpdmVcclxuICAgICAqL1xyXG4gICAgZ2V0TW9kdWxlKG5hbWUpIHtcclxuICAgIFx0aWYgKHRoaXMuaXNBY3RpdmUobmFtZSkpIHtcclxuICAgIFx0XHRyZXR1cm4gdGhpcy5hY3RpdmVNb2R1bGVzW25hbWVdO1xyXG4gICAgXHR9XHJcbiAgICBcdHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IHRoZSBpbmRleCBvZiB0aGUgdGFibGUgaGVhZGVyIGNlbGwgd2l0aCB0aGUgcGFzc2VkIHRtLWlkIGF0dHJpYnV0ZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRtSWRcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gaW5kZXggaWYgaXQgZXhpc3RzLCBudWxsIG90aGVyd2lzZVxyXG4gICAgICovXHJcbiAgICBpZDJpbmRleCh0bUlkKSB7XHJcbiAgICBcdGxldCBjZWxsID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcigndGhlYWQgPiB0ciA+ICpbdG0taWQ9Jyt0bUlkKyddJyk7XHJcbiAgICAgICAgaWYgKCFjZWxsKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gW10uaW5kZXhPZi5jYWxsKGNlbGwucGFyZW50Tm9kZS5jaGlsZHJlbiwgY2VsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXR1cm5zIHRoZSB0bS1pZCBvZiBhIHRhYmxlIGhlYWRlciBjZWxsIHdpdGggdGhlIHBhc3NlZCBpbmRleFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRtLWlkXHJcbiAgICAgKi9cclxuICAgIGluZGV4MmlkKGluZGV4KSB7XHJcbiAgICBcdGluZGV4Kys7XHJcbiAgICBcdGxldCBjZWxsID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcigndGhlYWQgPiB0cjpmaXJzdC1vZi10eXBlID4gKjpudGgtb2YtdHlwZSgnK2luZGV4KycpJyk7XHJcbiAgICAgICAgaWYgKCFjZWxsKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gY2VsbC5nZXRBdHRyaWJ1dGUoJ3RtLWlkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpbml0aWF0ZXMgcmVsb2FkaW5nIHRocm91Z2ggdGhlIGFjdGlvbiBwaXBlbGluZVxyXG4gICAgICogQHJldHVybiB0aGlzIGZvciBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICByZWxvYWQoKSB7XHJcbiAgICBcdHRoaXMuYWN0aW9uUGlwZWxpbmUubm90aWZ5KCdfX3JlbG9hZCcpO1xyXG4gICAgXHRyZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlZ2lzdGVyIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoaXMgdG0gaW5zdGFuY2UuXHJcbiAgICAgKiBtdWx0aXBsZSBsaXN0ZW5lcnMgY2FuIGxpc3RlbiB0byB0aGUgc2FtZSBldmVudCBhbmQgd2lsbCBiZSBmaXJlZCBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IGFyZSBhcHBsaWVkLlxyXG4gICAgICogKCEpIG5vdCBhIG5vcm1hbCBqcyBFdmVudFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZnVuY1xyXG4gICAgICogQHJldHVybiB0aGlzIGZvciBjaGFpbmluZ1xyXG4gICAgICovXHJcbiAgICBvbihldmVudE5hbWUsIGZ1bmMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50U3lzdGVtLm9uKGV2ZW50TmFtZSwgZnVuYyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0cmlnZ2VyIGFuIGV2ZW50IG9uIHRoaXMgdG0gaW5zdGFuY2VcclxuICAgICAqICghKSB0bSBldmVudCwgbm90IGEgbm9ybWFsIGpzIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXHJcbiAgICAgKiBAcmV0dXJuIHRoaXMgZm9yIGNoYWluaW5nXHJcbiAgICAgKi9cclxuICAgIHRyaWdnZXIoZXZlbnROYW1lLCAuLi5wYXJhbXMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50U3lzdGVtLnRyaWdnZXIoZXZlbnROYW1lLCAuLi5wYXJhbXMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhdGljIG1ldGhvZCBmb3IgYWRkaW5nIHVzZXItZGVmaW5lZCBtb2R1bGVzXHJcbiAgICAgKiB0aGlzLXZhbHVlIGluIGEgc3RhdGljIG1ldGhvZCBpcyB0aGUgY29uc3RydWN0b3IgZnVuY3Rpb24gaXRzZWxmIChoZXJlXHJcbiAgICAgKiBUYWJsZW1vZGlmeSlcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFkZE1vZHVsZShtb2R1bGUsIG5hbWUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGEgbmV3IG1vZHVsZSBiYXNlZCBvbiB0aGUgZ2l2ZW4gbmFtZSBhbmQgaW5pdGlhbGl6ZXIgZnVuY3Rpb25cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTW9kdWxlKG5ldyBNb2R1bGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVyOiBtb2R1bGVcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICAvL0NoZWNrIGlmIGl0IGlzIGEgTW9kdWxlIGluc3RhbmNlXHJcbiAgICAgICAgICAgIGlmIChtb2R1bGUgaW5zdGFuY2VvZiBNb2R1bGUpIHtcclxuICAgICAgICAgICAgICAgIC8vaWYgdGhlIG1vZHVsZSBhbHJlYWR5IGV4aXN0cywgdGhyb3dcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kdWxlc1ttb2R1bGUubmFtZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZXJyb3JNc2cgPSBcIk1vZHVsZSBcIiArIG1vZHVsZS5uYW1lICsgXCIgZG9lcyBhbHJlYWR5IGV4aXN0IVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGVycm9yTXNnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVzW21vZHVsZS5uYW1lXSA9IG1vZHVsZTtcclxuICAgICAgICAgICAgLy9UcmVhdCB0aGUgb2JqZWN0cyBhcyBwYXJhbWV0ZXJzIGZvciBuZXcgbW9kdWxlIGluc3RhbmNlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvL0lmIGEgbmFtZSBpcyBnaXZlbiBhcyBwYXJhbWV0ZXIsIG92ZXJyaWRlIGEgbmFtZSBpbiB0aGUgcGFyYW1ldGVycyBvYmplY3RcclxuICAgICAgICAgICAgICAgIGlmKGlzTm9uRW1wdHlTdHJpbmcobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGUubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZE1vZHVsZShuZXcgTW9kdWxlKG1vZHVsZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAgIGFkZCBhIGxhbmd1YWdlIHBhY2sgdG8gdGhlIGNvbGxlY3Rpb24gb2YgTGFuZ3VhZ2VzLlxyXG4gICAgICAgIHBhcmFtIG5hbWU6IGlkZW50aWZpZXIgb2YgdGhlIGxhbmd1YWdlLiBNYXkgb3ZlcndyaXRlIG9sZGVyIG9uZXNcclxuICAgICAgICBwYXJhbSB0ZXJtOiBvYmplY3QgY29udGFpbmluZyB0aGUgdGVybXMuIHNlZSBmdWxsIGxpc3QgaW4gbGFuZ3VhZ2UuanNcclxuICAgICovXHJcbiAgICBzdGF0aWMgYWRkTGFuZ3VhZ2UobmFtZSwgdGVybXMpIHtcclxuICAgICAgICBUYWJsZW1vZGlmeS5sYW5ndWFnZXNbbmFtZV0gPSBuZXcgTGFuZ3VhZ2UobmFtZSwgdGVybXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAgIHJlc2V0IGFsbCBsb2FkZWQgbW9kdWxlcyBvZiBpbnN0YW5jZVxyXG4gICAgICAgIGFuZCB1bnNldCBpbnN0YW5jZSBhZnRlcndhcmRzXHJcbiAgICAqL1xyXG4gICAgc3RhdGljIF9kZXN0cm95KGluc3RhbmNlKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZSB8fCAhaW5zdGFuY2UgaW5zdGFuY2VvZiBUYWJsZW1vZGlmeSkgdGhyb3cgbmV3IEVycm9yKCdub3QgYSBUYWJsZW1vZGlmeS1vYmplY3QnKTtcclxuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZS5hY3RpdmVNb2R1bGVzKSB0aHJvdyBuZXcgRXJyb3IoJ2luc3RhbmNlIGhhcyBubyBwcm9wZXJ0eSBhY3RpdmVNb2R1bGVzJyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gaW5zdGFuY2UuY29udGFpbmVyO1xyXG4gICAgICAgICAgICBsZXQgdGFibGUgPSBpbnN0YW5jZS5ib2R5O1xyXG5cclxuICAgICAgICAgICAgaXRlcmF0ZShpbnN0YW5jZS5hY3RpdmVNb2R1bGVzLCAobW9kdWxlTmFtZSwgbW9kdWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyByZXZlcnQgYWxsIGNoYW5nZXMgcGVyZm9ybWVkIGJ5IHRoaXMgbW9kdWxlLiBNb2R1bGUgaXRzZWxmIGlzIHJlc3BvbnNpYmxlIGZvciBjb3JyZWN0IHJldmVyc2lvblxyXG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZS51bnNldCkgbW9kdWxlLnVuc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmVtb3ZlQ2xhc3ModGFibGUsICd0bS1ib2R5Jyk7XHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSBhbGwgd3JhcHBlcnNcclxuICAgICAgICAgICAgY29udGFpbmVyLnBhcmVudEVsZW1lbnQucmVwbGFjZUNoaWxkKHRhYmxlLCBjb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gZGVsZXRlIGluc3RhbmNlXHJcbiAgICAgICAgICAgIGl0ZXJhdGUoaW5zdGFuY2UsIChwcm9wLCB2YWwpID0+IHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBpbnN0YW5jZVtwcm9wXTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5UYWJsZW1vZGlmeS5tb2R1bGVzID0ge1xyXG4gICAgY29sdW1uU3R5bGVzOiByZXF1aXJlKCcuL21vZHVsZXMvY29sdW1uU3R5bGVzLmpzJyksXHJcbiAgICBmaWx0ZXI6IHJlcXVpcmUoJy4vbW9kdWxlcy9maWx0ZXIuanMnKSxcclxuICAgIGZpeGVkOiByZXF1aXJlKCcuL21vZHVsZXMvZml4ZWQuanMnKSxcclxuICAgIHNvcnRlcjogcmVxdWlyZSgnLi9tb2R1bGVzL3NvcnRlci5qcycpLFxyXG4gICAgcGFnZXI6IHJlcXVpcmUoJy4vbW9kdWxlcy9wYWdlci5qcycpLFxyXG4gICAgemVicmE6IHJlcXVpcmUoJy4vbW9kdWxlcy96ZWJyYS5qcycpXHJcbn07XHJcblxyXG5UYWJsZW1vZGlmeS5sYW5ndWFnZXMgPSB7XHJcbiAgICBlbjogbmV3IExhbmd1YWdlKCdlbicsIHtcclxuICAgICAgICBGSUxURVJfUExBQ0VIT0xERVI6ICd0eXBlIGZpbHRlciBoZXJlJyxcclxuICAgICAgICBGSUxURVJfQ0FTRVNFTlNJVElWRTogJ2Nhc2Utc2Vuc2l0aXZlJyxcclxuICAgICAgICBQQUdFUl9QQUdFTlVNQkVSX1NFUEFSQVRPUjogJyAvICdcclxuICAgIH0pLFxyXG4gICAgZGU6IG5ldyBMYW5ndWFnZSgnZGUnLCB7XHJcbiAgICAgICAgRklMVEVSX1BMQUNFSE9MREVSOiAnRmlsdGVyIGVpbmdlYmVuJyxcclxuICAgICAgICBGSUxURVJfQ0FTRVNFTlNJVElWRTogJ0dyb++/vS0gdW5kIEtsZWluc2NocmVpYnVuZyB1bnRlcnNjaGVpZGVuJyxcclxuICAgICAgICBQQUdFUl9QQUdFTlVNQkVSX1NFUEFSQVRPUjogJyAvICdcclxuICAgIH0pXHJcbn07XHJcblxyXG5UYWJsZW1vZGlmeS5MYW5ndWFnZSA9IExhbmd1YWdlO1xyXG4vL1N0b3JlIHJlZmVyZW5jZSB0byB0aGUgbW9kdWxlIGNsYXNzIGZvciB1c2VyLWRlZmluZWQgbW9kdWxlc1xyXG5UYWJsZW1vZGlmeS5Nb2R1bGUgPSBNb2R1bGU7XHJcbi8vIHNldCB2ZXJzaW9uIG9mIFRhYmxlbW9kaWZ5XHJcblRhYmxlbW9kaWZ5LnZlcnNpb24gPSAndjAuOS41JztcclxuLy9tYWtlIHRoZSBUYWJsZW1vZGlmeSBvYmplY3QgYWNjZXNzaWJsZSBnbG9iYWxseVxyXG53aW5kb3cuVGFibGVtb2RpZnkgPSBUYWJsZW1vZGlmeTtcclxuIiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanMnKTtcclxuLy8gY3VzdG9tIGNvbnNvbGUgbG9nZ2luZyBmdW5jdGlvbnNcclxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICBpZihjb25maWcuZGVidWcpIGNvbnNvbGUubG9nKCd0bS1sb2c6ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLmluZm8gPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICBpZihjb25maWcuZGVidWcpIGNvbnNvbGUuaW5mbygndG0taW5mbzogJyArIHRleHQpO1xyXG59XHJcbmV4cG9ydHMud2FybiA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS53YXJuKCd0bS13YXJuOiAnICsgdGV4dCk7XHJcbn1cclxuZXhwb3J0cy50cmFjZSA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS50cmFjZSgndG0tdHJhY2U6ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLmVycm9yID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgY29uc29sZS5lcnJvcigndG0tZXJyb3I6ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLmVycm9yVGhyb3cgPSB0ZXh0ID0+IHtcclxuICAgIGV4cG9ydHMuZXJyb3IodGV4dCk7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XHJcbn1cclxuLy8gdXRpbHNcclxuZXhwb3J0cy5oYXNDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcclxuICAgIHJldHVybiBlbC5jbGFzc0xpc3QgPyBlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSA6IG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicpLnRlc3QoZWwuY2xhc3NOYW1lKTtcclxufVxyXG5leHBvcnRzLmFkZENsYXNzID0gZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSkge1xyXG4gICAgaWYgKGVsLmNsYXNzTGlzdCkgZWwuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgZWxzZSBpZiAoIWhhc0NsYXNzKGVsLCBjbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG4gICAgcmV0dXJuIGVsO1xyXG59XHJcbmV4cG9ydHMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKSB7XHJcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcbiAgICBlbHNlIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicsICdnJyksICcnKTtcclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLndyYXAgPSBmdW5jdGlvbihlbCwgd3JhcHBlcikge1xyXG4gICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgZWwpO1xyXG4gICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxufVxyXG4vKipcclxuICogRXh0ZW5kZWQgdmVyc2lvbiBvZiB0aGUgXCJleHRlbmRcIi1GdW5jdGlvbi4gU3VwcG9ydHMgbXVsdGlwbGUgc291cmNlcyxcclxuICogZXh0ZW5kcyBkZWVwIHJlY3Vyc2l2ZWx5LlxyXG4gKi9cclxuZXhwb3J0cy5leHRlbmQyID0gZnVuY3Rpb24gZXh0ZW5kMihkZXN0aW5hdGlvbiwgLi4uc291cmNlcykge1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgc291cmNlID0gc291cmNlc1tpXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgaWYoe30uaGFzT3duUHJvcGVydHkuY2FsbChkZXN0aW5hdGlvbiwga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHREZXN0ID0gdHlwZW9mIGRlc3RpbmF0aW9uW2tleV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdFNyYyA9IHR5cGVvZiBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmKHREZXN0ID09PSB0U3JjICYmICh0RGVzdCA9PT0gJ29iamVjdCcgfHwgdERlc3QgPT09ICdmdW5jdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kMihkZXN0aW5hdGlvbltrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5leHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZChkLCBzKSB7XHJcbiAgICBPYmplY3Qua2V5cyhkKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIGlmKCFzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgc1trZXldID0gZFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNba2V5XSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgLy8gcmVjdXJzaXZlIGRlZXAtZXh0ZW5kXHJcbiAgICAgICAgICAgIHNba2V5XSA9IGV4dGVuZChkW2tleV0sIHNba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHM7XHJcbn1cclxuZXhwb3J0cy5nZXRTY3JvbGxiYXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgdmFyIGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMTAwcHhcIjtcclxuICBvdXRlci5zdHlsZS5tc092ZXJmbG93U3R5bGUgPSBcInNjcm9sbGJhclwiOyAvLyBuZWVkZWQgZm9yIFdpbkpTIGFwcHNcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcclxuICB2YXIgd2lkdGhOb1Njcm9sbCA9IG91dGVyLm9mZnNldFdpZHRoO1xyXG4gIC8vIGZvcmNlIHNjcm9sbGJhcnNcclxuICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwic2Nyb2xsXCI7XHJcbiAgLy8gYWRkIGlubmVyZGl2XHJcblxyXG4gIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xyXG4gIHZhciB3aWR0aFdpdGhTY3JvbGwgPSBpbm5lci5vZmZzZXRXaWR0aDtcclxuICAvLyByZW1vdmUgZGl2c1xyXG4gIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xyXG4gIHJldHVybiB3aWR0aE5vU2Nyb2xsIC0gd2lkdGhXaXRoU2Nyb2xsO1xyXG59XHJcbmV4cG9ydHMuc2V0Q3NzID0gZnVuY3Rpb24oZWwsIHN0eWxlcykge1xyXG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gc3R5bGVzKSB7XHJcbiAgICAgICAgZWwuc3R5bGVbcHJvcGVydHldID0gc3R5bGVzW3Byb3BlcnR5XTtcclxuICAgIH1cclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLmdldENzcyA9IGZ1bmN0aW9uKGVsLCBzdHlsZSkgeyByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpW3N0eWxlXTt9XHJcbmV4cG9ydHMuaW5QeCA9IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIGMgKyAncHgnO31cclxuLy8gaXRlcmF0ZSBvdmVyIGEgc2V0IG9mIGVsZW1lbnRzIGFuZCBjYWxsIGZ1bmN0aW9uIGZvciBlYWNoIG9uZVxyXG5leHBvcnRzLml0ZXJhdGUgPSAoZWxlbXMsIGZ1bmMpID0+IHtcclxuICBpZiAodHlwZW9mIGVsZW1zID09PSAnb2JqZWN0Jykge1xyXG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGVsZW1zKSxcclxuICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgIC8vIHByb3BlcnR5LCB2YWx1ZVxyXG4gICAgICAgICAgZnVuYyhrZXlzW2ldLCBlbGVtc1trZXlzW2ldXSk7XHJcbiAgICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgICB2YXIgbCA9IGVsZW1zLmxlbmd0aDtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgIC8vIHZhbHVlLCBpbmRleCBAVE9ETyB1bWRyZWhlbiBmw7xyIGtvbnNpc3RlbnosIGFuIGFsbGVuIHN0ZWxsZW4gYW5wYXNzZW4gLT4gaW5kZXgsIHZhbHVlXHJcbiAgICAgICAgICBmdW5jKGVsZW1zW2ldLCBpKTtcclxuICAgICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0cy5nZXRVbmlxdWVJZCA9IChmdW5jdGlvbigpe1xyXG4gICAgdmFyIHVuaXF1ZSA9IDA7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBpZCA9ICd0bS11bmlxdWUtJyArIHVuaXF1ZTtcclxuICAgICAgICB1bmlxdWUrKztcclxuICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0cy5pc05vbkVtcHR5U3RyaW5nID0gZnVuY3Rpb24oc3RyKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gXCJzdHJpbmdcIiAmJiBzdHIudHJpbSgpLmxlbmd0aCA+IDA7XHJcbn1cclxuXHJcbmxldCBpc09iaiA9IGV4cG9ydHMuaXNPYmplY3QgPSBvID0+IHR5cGVvZiBvID09PSAnb2JqZWN0JztcclxuXHJcbmV4cG9ydHMuaXNGbiA9IGYgPT4gdHlwZW9mIGYgPT09ICdmdW5jdGlvbic7XHJcblxyXG5leHBvcnRzLmlzQm9vbCA9IGIgPT4gdHlwZW9mIGIgPT09ICdib29sZWFuJztcclxuXHJcbmxldCBnZXRQcm9wID0gZXhwb3J0cy5nZXRQcm9wZXJ0eSA9IChvYmosIC4uLnByb3BzKSA9PiB7XHJcbiAgICBpZiAoIWlzT2JqKG9iaikgfHwgcHJvcHMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcbiAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgd2hpbGUgKGluZGV4IDwgcHJvcHMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIG9iaiA9IG9ialtwcm9wc1tpbmRleF1dO1xyXG4gICAgICAgIGlmICghaXNPYmoob2JqKSkgcmV0dXJuO1xyXG4gICAgICAgICsraW5kZXg7XHJcbiAgICB9XHJcbiAgICBpZiAob2JqW3Byb3BzW2luZGV4XV0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG4gICAgcmV0dXJuIG9ialtwcm9wc1tpbmRleF1dO1xyXG59XHJcbmV4cG9ydHMuaGFzUHJvcCA9IChvYmosIC4uLnByb3BzKSA9PiBnZXRQcm9wKG9iaiwgLi4ucHJvcHMpICE9PSB1bmRlZmluZWQ7XHJcblxyXG5leHBvcnRzLmRlbGF5ID0gKCgpID0+IHtcclxuXHRsZXQgbXMgPSA0MDAsIHQ7XHJcblxyXG5cdHJldHVybiAoY2IpID0+IHtcclxuXHRcdHdpbmRvdy5jbGVhclRpbWVvdXQodCk7XHJcblx0XHR0ID0gd2luZG93LnNldFRpbWVvdXQoY2IsIG1zKTtcclxuXHR9O1xyXG59KSgpO1xyXG5cclxuLyoqXHJcbiAgICBmaW5kcyBoZWFkIGNlbGwgd2l0aCB0bS1pZCA9IHRtSWQgYW5kIHJldHVybnMgaXRzIGluZGV4XHJcbiAgICAqL1xyXG5mdW5jdGlvbiBpZDJpbmRleCh0bUlkKSB7XHJcbiAgICBsZXQgY2VsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3RoZWFkID4gdHIgPiAqW3RtLWlkPScrdG1JZCsnXScpO1xyXG4gICAgaWYgKCFjZWxsKSByZXR1cm4gbnVsbDtcclxuICAgIHJldHVybiBbXS5pbmRleE9mLmNhbGwoY2VsbC5wYXJlbnROb2RlLmNoaWxkcmVuLCBjZWxsKTtcclxufVxyXG4vKipcclxuICAgIGVyc2V0emUgYWxsZSBzcGFsdGVuLCBkaWUgw7xiZXIgZGllIHRtLWlkIGlkZW50aWZpemllcnQgd2VyZGVuLCBkdXJjaCBpaHJlbiBpbmRleFxyXG4qL1xyXG5leHBvcnRzLnJlcGxhY2VJZHNXaXRoSW5kaWNlcyA9IChjb2x1bW5zKSA9PiB7XHJcbiAgICBPYmplY3Qua2V5cyhjb2x1bW5zKS5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICBpZihrZXkgIT0gJ2FsbCcgJiYgaXNOYU4oa2V5KSkge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBpZDJpbmRleChrZXkpO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29sdW1uc1tpbmRleF0gPSBjb2x1bW5zW2tleV07XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgY29sdW1uc1trZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29sdW1ucztcclxufVxyXG4iXX0=
