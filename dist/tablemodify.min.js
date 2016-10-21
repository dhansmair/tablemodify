(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.debug = true;
exports.coreDefaults = {
    theme: 'default'
};

},{}],2:[function(require,module,exports){
'use strict';

var Module = require('./module.js');

var _require = require('../utils.js');

var addClass = _require.addClass;
var iterate = _require.iterate;
var info = _require.info;
var error = _require.error;


module.exports = new Module({
    name: "columnStyles",
    defaultSettings: {
        all: {
            'text-align': 'center',
            'padding': '3px'
        }
    },
    initializer: function initializer(settings) {
        try {
            addClass(this.container, 'tm-column-styles');

            var containerId = this.containerId;

            // style general
            var text = 'div#' + containerId + ' table tr > *{';
            iterate(settings.all, function (prop, value) {
                text += prop + ':' + value + ';';
            });
            text += '}';

            delete settings.all;

            // add custom styles to the single columns
            iterate(settings, function (index, cssStyles) {
                var i = parseInt(index) + 1;

                text += 'div#' + containerId + ' table tr > *:nth-of-type(' + i + '){';
                iterate(cssStyles, function (prop, value) {
                    text += prop + ':' + value + ';';
                });
                text += '}';
            });
            this.appendStyles(text);
            info('module columnStyles loaded');
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":9,"./module.js":5}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js');

var addClass = _require.addClass;
var iterate = _require.iterate;
var info = _require.info;
var error = _require.error;

var Module = require('./module.js');

var newCell = function () {
    var cell = document.createElement('td');
    cell.innerHTML = '<div class=\'tm-input-div\'><input type=\'text\' placeholder=\'type filter here\'/></div>\n                        <span class=\'tm-custom-checkbox\' title=\'case-sensitive\'>\n                        <input type=\'checkbox\' value=\'1\' name=\'checkbox\' />\n                        <label for=\'checkbox\'></label>\n                        </span>';

    return function () {
        return cell.cloneNode(true);
    };
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
    function Filter(tm) {
        _classCallCheck(this, Filter);

        this.tm = tm;
        this.rows = tm.getRows();

        this.indices = [];
        this.patterns = [];
        this.options = [];
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
        key: 'filter',
        value: function filter() {
            var indices = this.getIndices(),
                patterns = this.getPatterns(),
                options = this.getOptions();

            var maxDeph = indices.length - 1;

            // filter rows
            var arr = this.rows.filter(function (row) {
                var deph = 0,
                    matches = true;

                while (matches && deph <= maxDeph) {
                    var i = indices[deph];
                    var pattern = patterns[deph];
                    var tester = row.cells[i].innerHTML;

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

            this.tm.setRows(arr);
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

        var _this = _possibleConstructorReturn(this, (FilterDefault.__proto__ || Object.getPrototypeOf(FilterDefault)).call(this, tm));

        _this.tHead = tm.head ? tm.head.tHead : tm.origHead;

        // create the toolbar row
        var num = _this.tHead.firstElementChild.cells.length - 1;
        var row = document.createElement('tr');
        for (; num >= 0; num--) {
            row.appendChild(newCell());
        }
        addClass(row, 'tm-filter-row');

        if (!settings.autoCollapse) {
            row.style.height = '30px';
        }

        // bind listeners
        var timeout = void 0;
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

        // insert toolbar row into tHead
        _this.tHead.appendChild(row);
        return _this;
    }

    _createClass(FilterDefault, [{
        key: 'run',
        value: function run() {
            var inputs = [].slice.call(this.tHead.querySelectorAll('input[type=text]'));
            var checkboxes = [].slice.call(this.tHead.querySelectorAll('input[type=checkbox]'));

            var patterns = [],
                indices = [],
                options = [];

            iterate(inputs, function (i, input) {
                if (input.value.trim() !== '') {
                    indices.push(i);
                    patterns.push(input.value.trim());
                    options.push(checkboxes[i].checked);
                }
            });

            this.setPatterns(patterns).setIndices(indices).setOptions(options).filter();

            // trigger sorting
            this.tm.body.dispatchEvent(new Event('tmSorterSortAgain'));

            this.tm.render();

            return this;
        }
    }]);

    return FilterDefault;
}(Filter);
/*
class FilterSpecial extends Filter {
    constructor() {
        var _this = this, timeout;
        // modify DOM
        var wrapper = document.createElement('div');
        addClass(wrapper, 'tm-filter-wrap');
        core.container.insertBefore(wrapper, core.bodyWrap);

        wrapper.innerHTML = "<span class='tm-filter-loaded'>&nbsp;</span>"
                          + "<span class='tm-filter-add-button'>+</span>";

        wrapper.onclick = function(e) {
            var target = e.target;

            if (hasClass(target, 'tm-filter-instance')) {
                if (hasClass(target, 'tm-open')) {
                    // close it
                    removeClass(target, 'tm-open');
                } else {
                    // open it
                    _this.minAll();
                    addClass(target, 'tm-open');
                }
            } else if (hasClass(target, 'tm-filter-add-button')) {
                _this.minAll();
                _this.addFilter();
            } else if (hasClass(target, 'tm-custom-checkbox')) {
                target.firstElementChild.checked = !target.firstElementChild.checked;
                _this.run();
            } else if (hasClass(target.parentNode, 'tm-custom-checkbox')) {
                target.previousSibling.checked = !target.previousSibling.checked;

                _this.run();
            } else if (hasClass(target, 'tm-filter-wrap')) {
                _this.minAll();
            }
        };
        wrapper.onchange = function(e) {
            _this.run();
        }
        wrapper.onkeyup = function(e) {
            if (e.target.nodeName === 'INPUT') {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    _this.run();
                }, 500);
            }
        }

        this.activeFilters = wrapper.querySelector('.tm-filter-loaded');
        this.filterWrap = wrapper;
        this.rows = core.getRows();

        this.addFilter = function() {
            var newFilter = document.createElement('span');
            addClass(newFilter, 'tm-filter-instance');
            addClass(newFilter, 'tm-open');

            newFilter.innerHTML = "<select></select>"
                                + "<input type='text' placeholder='type filter here' />"
                                + "<span class='tm-custom-checkbox' title='case-sensitive'>"
                                    + "<input type='checkbox' value='1' name='checkbox' />"
                                    + "<label for='checkbox'></label>"
                                    + "</span>";

            // add options to select field
            var select = newFilter.firstElementChild;

            iterate(core.origHead.firstElementChild.cells, function(i, cell) {
                var option = document.createElement('option');
                option.text = cell.innerHTML;
                option.value = i;

                select.add(option);
            });

            // define getters
            newFilter.getIndex = function() {
                var select = this.firstElementChild;
                return select.options[select.selectedIndex].value;
            }
            newFilter.getPattern = function() {
                return this.children[1].value.trim();
            }
            newFilter.getOption = function() {
                return this.querySelector('input[type=checkbox]').checked;
            }
            this.activeFilters.appendChild(newFilter);
        }
        this.minAll = function() {
            iterate(this.filterWrap.querySelectorAll('.tm-filter-instance.tm-open'), function(i, instance) {
                removeClass(instance, 'tm-open');
            });
        }
        this.run = function() {
            // collect all information
            var filters = [].slice.call(this.activeFilters.children),
                patterns = [], indices = [], options = [];

            iterate(filters, function(i, filterObj) {
                indices.push(filterObj.getIndex());
                patterns.push(filterObj.getPattern());
                options.push(filterObj.getOption());
            });

            this.setIndices(indices)
                .setPatterns(patterns)
                .setOptions(options)
                .filter();
        }
    }
}
*/


module.exports = new Module({
    name: "filter",
    defaultSettings: {
        //filterStyle: 'default'
        autoCollapse: true
    },
    initializer: function initializer(settings) {
        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-filter');

            /*switch (settings.filterStyle) {
                  case 'special':
                    new FilterB();
                break;
                default:*/
            var instance = new FilterDefault(this, settings);
            //}
            info('module filter loaded');

            return instance;
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":9,"./module.js":5}],4:[function(require,module,exports){
'use strict';

var Module = require('./module.js');

var _require = require('../utils.js');

var inPx = _require.inPx;
var iterate = _require.iterate;
var setCss = _require.setCss;
var addClass = _require.addClass;
var getCss = _require.getCss;
var getScrollbarWidth = _require.getScrollbarWidth;
var info = _require.info;
var error = _require.error;


module.exports = new Module({
    name: "fixed",
    defaultSettings: {
        fixHeader: false,
        fixFooter: false
    },
    initializer: function initializer(settings) {
        // set up
        var head,
            foot,
            headWrap,
            footWrap,
            container = this.container,
            body = this.body,
            bodyWrap = this.bodyWrap,
            origHead = this.origHead,
            origFoot = this.origFoot;

        var getHeaderHeight = function getHeaderHeight() {
            return origHead.clientHeight;
        };
        var getFooterHeight = function getFooterHeight() {
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
            var borderCollapse = getCss(body, 'border-collapse'),
                scrollbarWidth = getScrollbarWidth();

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
                    cell.innerHTML = '<div>' + cell.innerHTML + '</div>';
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
                body.addEventListener('tmFixedForceRendering', renderHead);
            }

            if (foot) {
                window.addEventListener('resize', renderFoot);
                body.addEventListener('tmFixedForceRendering', renderHead);
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
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":9,"./module.js":5}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../utils.js');

var error = _require.error;
var extend2 = _require.extend2;
var isNonEmptyString = _require.isNonEmptyString;

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

},{"../utils.js":9}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = require('./module.js');

var _require = require('../utils.js');

var addClass = _require.addClass;
var iterate = _require.iterate;
var removeClass = _require.removeClass;
var error = _require.error;
var extend2 = _require.extend2;


function getValue(tr, i) {
    return tr.cells[i].innerHTML.trim();
}

var Sorter = function () {
    function Sorter(tableModify, settings) {
        var _this2 = this;

        _classCallCheck(this, Sorter);

        //Set initial values
        extend2(this, {
            ready: true,
            headers: {},
            headCells: [],
            body: null,
            rows: [],
            indices: [],
            orders: []
        });
        //Store a reference to the tablemodify instance
        this.tm = tableModify;
        addClass(this.tm.container, 'tm-sorter');
        var _this = this,
            i = settings.initial[0],
            order = settings.initial[1];

        this.body = this.tm.body.tBodies[0];
        //this.rows = [].slice.call(this.body.rows);
        this.headers = settings.headers;
        this.headCells = this.tm.head ? [].slice.call(this.tm.head.firstElementChild.firstElementChild.cells) : [].slice.call(this.tm.body.tHead.firstElementChild.cells);

        iterate(settings.customParsers, function (name, func) {
            _this2.parsers[name] = func;
        });

        // iterate over header cells
        iterate(this.headCells, function (i, cell) {
            i = parseInt(i);

            if (_this2.getIsEnabled(i)) {
                addClass(cell, 'sortable');
                cell.addEventListener('click', function (e) {

                    if (e.shiftKey && settings.enableMultisort) {
                        _this2.manageMulti(i);
                    } else {
                        _this2.manage(i);
                    }
                });
            }
        });
        /*
        head.addEventListener('click', function(e) {
            var cell = e.target;
            var index = e.target.cellIndex;
            if (e.shiftKey && settings.enableMultisort) {
                // cell is a new sorting argument
                _this.manageMulti(index, cell);
            } else {
                _this.manage(index, cell);
            }
        });
        */
        // try to sort by initial sorting
        if (!this.getIsEnabled(i)) {
            // not enabled, choose another initial sorting
            var initialized = false;
            i = 0;
            while (i < this.headCells.length && !initialized) {
                if (this.getIsEnabled(i)) {
                    this.manage(i);
                    initialized = true;
                }
                i++;
            }
        } else if (order === 'desc') {
            // enabled, sort desc
            this.setOrderAsc(false).setIndex(i).sort().render().renderSortingArrows();
        } else {
            // enabled, sort asc
            this.setOrderAsc();
            this.manage(i);
        }

        // sort again in case it's needed.
        this.tm.body.addEventListener('tmSorterSortAgain', function () {
            _this2.sort();
        });
    }

    _createClass(Sorter, [{
        key: 'setRows',
        value: function setRows(rowArray) {
            this.tm.setRows(rowArray);
            return this;
        }
    }, {
        key: 'setIndex',
        value: function setIndex(i) {
            this.indices = [i];
            return this;
        }
    }, {
        key: 'setOrderAsc',
        value: function setOrderAsc(bool) {
            if (bool === undefined) bool = true;
            this.orders = [bool];
            return this;
        }
    }, {
        key: 'getRows',
        value: function getRows() {
            return this.tm.getRows();
        }
    }, {
        key: 'getParser',
        value: function getParser(i) {
            return this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('parser') ? this.parsers[this.headers[i].parser] : this.parsers[this.headers.all.parser];
        }
    }, {
        key: 'getIsEnabled',
        value: function getIsEnabled(i) {
            return this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('enabled') ? this.headers[i].enabled : this.headers.all.enabled;
        }
        /*
            single values
        */

    }, {
        key: 'getIndex',
        value: function getIndex() {
            return this.indices[0];
        }
    }, {
        key: 'getOrderAsc',
        value: function getOrderAsc() {
            return this.orders[0];
        }
        /*
            multiple values
        */

    }, {
        key: 'getIndices',
        value: function getIndices() {
            return this.indices;
        }
    }, {
        key: 'getOrders',
        value: function getOrders() {
            return this.orders;
        }
    }, {
        key: 'getParsers',
        value: function getParsers() {
            var _this3 = this;

            //var _this = this;
            return this.getIndices().map(function (i) {
                return _this3.getParser(i);
            });
        }
    }, {
        key: 'sort',
        value: function sort() {
            /*    var i = this.getIndex(),
                    o = this.getOrderAsc(),
                    p = this.getParser(i);
                  this.getRows().sort(function(a, b) {
                    return p(getValue(a, i), getValue(b, i));
                });
                  if (!o) this.reverse();
                  return this;*/
            //}
            //multiSort() {
            var _this = this,
                indices = this.getIndices(),
                orders = this.getOrders(),
                parsers = this.getParsers(),
                //indices.map(function(i) {return _this.getParser(i);}),
            maxDeph = indices.length - 1;

            this.tm.getRows().sort(function (a, b) {
                var comparator = 0,
                    deph = 0;

                while (comparator === 0 && deph <= maxDeph) {
                    var tmpIndex = indices[deph];
                    comparator = parsers[deph](getValue(a, tmpIndex), getValue(b, tmpIndex));
                    deph++;
                }

                deph--; // decrement again
                // invert result in case order of this columns is descending
                return orders[deph] || deph > maxDeph ? comparator : -1 * comparator;
            });

            return this;
        }
        /*
        reverse() {
            var array = this.tm.getRows(),
                left = null,
                right = null,
                length = array.length;
            for (left = 0; left < length / 2; left += 1) {
                right = length - 1 - left;
                var temporary = array[left];
                array[left] = array[right];
                array[right] = temporary;
            }
            //this.setRows(array);
            console.log('reversed');
            return this;
        }
        */

    }, {
        key: 'render',
        value: function render() {
            this.tm.render();

            return this;
        }
    }, {
        key: 'renderSortingArrows',
        value: function renderSortingArrows() {
            // remove current sorting classes
            iterate(this.tm.container.querySelectorAll('.sort-up, .sort-down'), function (i, cell) {
                removeClass(cell, 'sort-up');
                removeClass(cell, 'sort-down');
            });

            var length = this.indices.length;

            if (length > 0) {
                var l = length - 1;
                for (; l >= 0; l--) {
                    var index = this.indices[l];
                    var asc = this.orders[l];
                    var cell = this.headCells[index];

                    if (asc) {
                        // ascending
                        addClass(cell, 'sort-up');
                    } else {
                        // descending
                        addClass(cell, 'sort-down');
                    }
                }
            }
            return this;
        }
    }, {
        key: 'manage',
        value: function manage(i) {

            if (!this.ready) return;
            this.ready = false;

            if (this.getIndex() === i) {

                this.setOrderAsc(!this.getOrderAsc()); // invertiere aktuelle Sortierung
            } else if (this.getIsEnabled(i)) {

                this.setOrderAsc(); // sort ascending
            }

            this.setIndex(i).sort().render().renderSortingArrows();

            this.ready = true;
            return this;
        }
    }, {
        key: 'manageMulti',
        value: function manageMulti(i) {
            // add i to the multi indices
            if (!this.ready) return;
            this.ready = false;

            var indices = this.indices,
                exists = indices.indexOf(i);

            if (exists === -1) {
                // add new multisort index
                this.indices.push(i);
                this.orders.push(true);
            } else {
                // invert
                this.orders[exists] = !this.orders[exists];
            }
            // now sort
            this.sort().render().renderSortingArrows();

            this.ready = true;
            return this;
        }
    }]);

    return Sorter;
}();

Sorter.prototype.parsers = {
    string: function string(a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    },
    numeric: function numeric(a, b) {
        a = parseFloat(a);
        b = parseFloat(b);
        return a - b;
    },
    intelligent: function intelligent(a, b) {
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
    },
    /*
        parses these Date Formats:
         d.mm.YYYY
          d.m.YYYY
         dd.m.YYYY
        dd.mm.YYYY
    */
    germanDate: function germanDate(a, b) {
        try {
            var dateA = new Date(),
                dateB = new Date(),
                partsA = a.split('.'),
                partsB = b.split('.');

            if (partsA.length === 3) {
                dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]), parseInt(partsA[0]));
            } else if (partsA.length === 2) {
                dateA = new Date(parseInt(partsA[1]), parseInt(partsA[0]));
            }

            if (partsB.length === 3) {
                dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]), parseInt(partsB[0]));
            } else if (partsB.length === 2) {
                dateB = new Date(parseInt(partsB[1]), parseInt(partsB[0]));
            }

            if (dateA > dateB) return 1;
            if (dateA < dateB) return -1;
            return 0;
        } catch (e) {
            error(e);
            return -1;
        }
    },
    /*
        NOT IMPLEMENTED YET
        @TODO implement
    */
    americanDate: function americanDate(a, b) {
        return this.intelligent(a, b);
    },
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
        headers: {
            all: {
                enabled: true,
                parser: 'intelligent'
            }
        },
        initial: [0, 'asc'],
        enableMultisort: true,
        customParsers: {}
    },
    initializer: function initializer(settings) {
        var sorterInstance = new Sorter(this, settings);
        return {
            sortAsc: function sortAsc(i) {
                sorterInstance.setIndex(i).setOrderAsc().sort().render().renderSortingArrows();
            },
            sortDesc: function sortDesc(i) {
                sorterInstance.setIndex(i).setOrderAsc(false).sort().render().renderSortingArrows();
            },
            info: function info() {
                console.log(sorterInstance.getIndices());
                console.log(sorterInstance.getOrders());
            }
        };
    }
});

},{"../utils.js":9,"./module.js":5}],7:[function(require,module,exports){
'use strict';

var _require = require('../utils.js');

var addClass = _require.addClass;
var extend = _require.extend;
var info = _require.info;
var error = _require.error;

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

            var defaults = { even: '#f0f0f0', odd: 'white' };
            extend(defaults, settings);

            var text = 'table' + this.bodySelector + ' tr:nth-of-type(even){background-color:' + settings.even + '}' + 'table' + this.bodySelector + ' tr:nth-of-type(odd) {background-color:' + settings.odd + '}';
            this.appendStyles(text);

            info('module zebra loaded');
        } catch (e) {
            error(e);
        }
    }
});

},{"../utils.js":9,"./module.js":5}],8:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = require('./config.js');
var Module = require('./modules/module.js');

var _require = require('./utils.js');

var error = _require.error;
var warn = _require.warn;
var isNonEmptyString = _require.isNonEmptyString;
var getCss = _require.getCss;
var iterate = _require.iterate;
var extend = _require.extend;
var addClass = _require.addClass;
var getUniqueId = _require.getUniqueId;

var Tablemodify = function () {
    function Tablemodify(selector, coreSettings) {
        _classCallCheck(this, Tablemodify);

        var containerId,
            _this = this,
            body = document.querySelector(selector); // must be a table
        if (!body || body.nodeName !== 'TABLE') {
            error('there is no <table> with selector ' + selector);
            return null;
        }
        //this.body = body;
        this.bodySelector = selector;
        var oldBodyParent = body.parentElement;

        extend(config.coreDefaults, coreSettings);

        if (coreSettings.containerId && document.getElementById(coreSettings.containerId)) {
            throw 'the passed id ' + coreSettings.containerId + ' is not unique!';
        } else if (coreSettings.containerId) {
            containerId = coreSettings.containerId;
        } else {
            containerId = getUniqueId();
        }

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

        // initialize tbody rows as 2D-array
        this.rows = [].slice.call(this.body.tBodies[0].rows);

        //Default rendering mode: everything at once
        this.setRenderingMode(Tablemodify.RENDERING_MODE_AT_ONCE);
        this._chunkedRenderingTimeout = null;
        this.rowChunkSize = 50;
        // call all modules
        if (coreSettings.modules) {
            // interface for modules
            iterate(coreSettings.modules, function (moduleName, moduleSettings) {
                var module = Tablemodify.modules[moduleName];
                var moduleReturn;
                if (module) {
                    moduleReturn = module.getModule(_this, moduleSettings);
                } else {
                    warn('Module' + moduleName + ' not registered!');
                }
                if (moduleReturn !== undefined) {
                    if (_this[moduleName] === undefined) {
                        // define ret as a property of the Tablemodify instance.
                        // now you can access it later via tm.modulename
                        _this[moduleName] = moduleReturn;
                    } else {
                        error('module name ' + moduleName + ' causes a collision and is not allowed, please choose another one!');
                    }
                }
            });
        }
        this.coreSettings = coreSettings;
    }

    _createClass(Tablemodify, [{
        key: 'appendStyles',
        value: function appendStyles(text) {
            if (text.trim().length > 0) {
                this.stylesheet.appendChild(document.createTextNode(text.trim()));
            }
        }
    }, {
        key: 'getRows',
        value: function getRows() {
            return this.rows;
        }
    }, {
        key: 'setRows',
        value: function setRows(rowArray) {
            //If chunked rendering is running at the moment, cancel
            window.clearTimeout(this._chunkedRenderingTimeout);
            this.rows = rowArray;
            //this.body.dispatchEvent(new Event('tmRowsAdded'));
            //this.render();
            return this;
        }
    }, {
        key: 'addRows',
        value: function addRows(rowArray) {
            //If chunked rendering is running at the moment, cancel
            window.clearTimeout(this._chunkedRenderingTimeout);
            [].push.apply(this.rows, rowsArray);
            //this.body.dispatchEvent(new Event('tmRowsAdded'));
            //this.render();
            return this;
        }
    }, {
        key: 'setRenderingMode',
        value: function setRenderingMode(to) {
            if (to !== Tablemodify.RENDERING_MODE_CHUNKED && to !== Tablemodify.RENDERING_MODE_AT_ONCE) {
                var msg = "Tried to set unknown rendering mode";
                warn(msg);
                throw new Error(msg);
            }
            if (to === Tablemodify.RENDERING_MODE_CHUNKED && getCss(this.body, 'table-layout') !== 'fixed') {
                warn("Using chunked rendering with non-fixed table layout is discouraged!");
            }
            this.renderingMode = to;
            return this;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var tBody = this.body.tBodies[0],
                rows = this.getRows(),
                l = rows.length;
            tBody.innerHTML = ''; // clear table body

            (function () {
                switch (_this2.renderingMode) {
                    case Tablemodify.RENDERING_MODE_AT_ONCE:
                        for (var i = 0; i < l; i++) {
                            tBody.appendChild(rows[i]);
                        }
                        _this2.body.dispatchEvent(new Event('tmFixedForceRendering'));
                        break;
                    case Tablemodify.RENDERING_MODE_CHUNKED:
                        var chunkSize = _this2.rowChunkSize,
                            start = 0;
                        var renderPart = function renderPart() {
                            for (var z = 0; z < chunkSize; z++) {
                                if (start + z === l) {
                                    _this2.body.dispatchEvent(new Event('tmFixedForceRendering'));
                                    return;
                                }
                                tBody.appendChild(rows[start + z]);
                            }
                            start = start + z;
                            _this2._chunkedRenderingTimeout = window.setTimeout(renderPart, 0);
                        };
                        _this2._chunkedRenderingTimeout = window.setTimeout(renderPart, 0);
                        break;
                }
            })();

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
    }]);

    return Tablemodify;
}();

Tablemodify.RENDERING_MODE_CHUNKED = 1;
Tablemodify.RENDERING_MODE_AT_ONCE = 2;
Tablemodify.modules = {
    columnStyles: require('./modules/columnStyles.js'),
    filter: require('./modules/filter.js'),
    fixed: require('./modules/fixed.js'),
    sorter: require('./modules/sorter.js'),
    zebra: require('./modules/zebra.js')
};

//Store reference to the module class for user-defined modules
Tablemodify.Module = Module;

//make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;

},{"./config.js":1,"./modules/columnStyles.js":2,"./modules/filter.js":3,"./modules/fixed.js":4,"./modules/module.js":5,"./modules/sorter.js":6,"./modules/zebra.js":7,"./utils.js":9}],9:[function(require,module,exports){
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
    if (config.debug) console.error('tm-error: ' + text);
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
/*
exports.getValueIn = function(arr, i) {
  if (!Array.isArray(arr)) return arr;
  if (arr.length > i) {
    return arr[i];
  } else {
    return arr[arr.length-1];
  }
}
*/
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

},{"./config.js":1}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGNvbmZpZy5qcyIsInNyY1xcbW9kdWxlc1xcY29sdW1uU3R5bGVzLmpzIiwic3JjXFxtb2R1bGVzXFxmaWx0ZXIuanMiLCJzcmNcXG1vZHVsZXNcXGZpeGVkLmpzIiwic3JjXFxtb2R1bGVzXFxtb2R1bGUuanMiLCJzcmNcXG1vZHVsZXNcXHNvcnRlci5qcyIsInNyY1xcbW9kdWxlc1xcemVicmEuanMiLCJzcmNcXHRhYmxlbW9kaWZ5LmpzIiwic3JjXFx1dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSxLQUFSLEdBQWdCLElBQWhCO0FBQ0EsUUFBUSxZQUFSLEdBQXVCO0FBQ25CLFdBQU87QUFEWSxDQUF2Qjs7Ozs7QUNEQSxJQUFNLFNBQVMsUUFBUSxhQUFSLENBQWY7O2VBQ3lDLFFBQVEsYUFBUixDOztJQUFsQyxRLFlBQUEsUTtJQUFVLE8sWUFBQSxPO0lBQVMsSSxZQUFBLEk7SUFBTSxLLFlBQUEsSzs7O0FBRWhDLE9BQU8sT0FBUCxHQUFpQixJQUFJLE1BQUosQ0FBVztBQUN4QixVQUFNLGNBRGtCO0FBRXhCLHFCQUFpQjtBQUNiLGFBQUs7QUFDRCwwQkFBYSxRQURaO0FBRUQsdUJBQVc7QUFGVjtBQURRLEtBRk87QUFReEIsaUJBQWEscUJBQVMsUUFBVCxFQUFtQjtBQUM1QixZQUFJO0FBQ0EscUJBQVMsS0FBSyxTQUFkLEVBQXlCLGtCQUF6Qjs7QUFFQSxnQkFBSSxjQUFjLEtBQUssV0FBdkI7O0FBRUE7QUFDQSxnQkFBSSxPQUFPLFNBQVMsV0FBVCxHQUF1QixnQkFBbEM7QUFDQSxvQkFBUSxTQUFTLEdBQWpCLEVBQXNCLFVBQVMsSUFBVCxFQUFlLEtBQWYsRUFBc0I7QUFDeEMsd0JBQVEsT0FBTyxHQUFQLEdBQWEsS0FBYixHQUFxQixHQUE3QjtBQUNILGFBRkQ7QUFHQSxvQkFB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QUVBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxDQUFwQixFQUF1QixHQUF2QixFQUE0QjtBQUN4QjtBQUNBLGlCQUFLLEtBQUssQ0FBTCxDQUFMLEVBQWMsTUFBTSxLQUFLLENBQUwsQ0FBTixDQUFkO0FBQ0g7QUFDSixLQVBELE1BT087QUFDSCxZQUFJLElBQUksTUFBTSxNQUFkO0FBQ0EsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCO0FBQ3hCO0FBQ0EsaUJBQUssTUFBTSxDQUFOLENBQUwsRUFBZSxDQUFmO0FBQ0g7QUFDSjtBQUNGLENBZkQ7QUFnQkE7Ozs7Ozs7Ozs7QUFVQSxRQUFRLFdBQVIsR0FBdUIsWUFBVTtBQUM3QixRQUFJLFNBQVMsQ0FBYjs7QUFFQSxXQUFPLFlBQVc7QUFDZCxZQUFJLEtBQUssZUFBZSxNQUF4QjtBQUNBO0FBQ0EsZUFBTyxFQUFQO0FBQ0gsS0FKRDtBQUtILENBUnNCLEVBQXZCOztBQVVBLFFBQVEsZ0JBQVIsR0FBMkIsVUFBUyxHQUFULEVBQWM7QUFDckMsV0FBTyxPQUFPLEdBQVAsS0FBZSxRQUFmLElBQTJCLElBQUksSUFBSixHQUFXLE1BQVgsR0FBb0IsQ0FBdEQ7QUFDSCxDQUZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydHMuZGVidWcgPSB0cnVlO1xyXG5leHBvcnRzLmNvcmVEZWZhdWx0cyA9IHtcclxuICAgIHRoZW1lOiAnZGVmYXVsdCdcclxufTtcclxuIiwiY29uc3QgTW9kdWxlID0gcmVxdWlyZSgnLi9tb2R1bGUuanMnKTtcclxuY29uc3Qge2FkZENsYXNzLCBpdGVyYXRlLCBpbmZvLCBlcnJvcn0gPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kdWxlKHtcclxuICAgIG5hbWU6IFwiY29sdW1uU3R5bGVzXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICBhbGw6IHtcclxuICAgICAgICAgICAgJ3RleHQtYWxpZ24nOidjZW50ZXInLFxyXG4gICAgICAgICAgICAncGFkZGluZyc6ICczcHgnXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMuY29udGFpbmVyLCAndG0tY29sdW1uLXN0eWxlcycpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lcklkID0gdGhpcy5jb250YWluZXJJZDtcclxuXHJcbiAgICAgICAgICAgIC8vIHN0eWxlIGdlbmVyYWxcclxuICAgICAgICAgICAgdmFyIHRleHQgPSAnZGl2IycgKyBjb250YWluZXJJZCArICcgdGFibGUgdHIgPiAqeyc7XHJcbiAgICAgICAgICAgIGl0ZXJhdGUoc2V0dGluZ3MuYWxsLCBmdW5jdGlvbihwcm9wLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGV4dCArPSBwcm9wICsgJzonICsgdmFsdWUgKyAnOyc7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0ZXh0ICs9ICd9JztcclxuXHJcbiAgICAgICAgICAgIGRlbGV0ZSBzZXR0aW5ncy5hbGw7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgY3VzdG9tIHN0eWxlcyB0byB0aGUgc2luZ2xlIGNvbHVtbnNcclxuICAgICAgICAgICAgaXRlcmF0ZShzZXR0aW5ncywgZnVuY3Rpb24oaW5kZXgsIGNzc1N0eWxlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGkgPSBwYXJzZUludChpbmRleCkgKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHRleHQgKz0gJ2RpdiMnICsgY29udGFpbmVySWQgKyAnIHRhYmxlIHRyID4gKjpudGgtb2YtdHlwZSgnICsgaSArICcpeyc7XHJcbiAgICAgICAgICAgICAgICBpdGVyYXRlKGNzc1N0eWxlcywgZnVuY3Rpb24ocHJvcCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IHByb3AgKyAnOicgKyB2YWx1ZSArICc7JztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGV4dCArPSAnfSc7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZFN0eWxlcyh0ZXh0KTtcclxuICAgICAgICAgICAgaW5mbygnbW9kdWxlIGNvbHVtblN0eWxlcyBsb2FkZWQnKTtcclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIiwiY29uc3Qge2FkZENsYXNzLCBpdGVyYXRlLCBpbmZvLCBlcnJvcn0gPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5jb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5cclxuY29uc3QgbmV3Q2VsbCA9IChmdW5jdGlvbigpIHtcclxuICAgIGxldCBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcclxuICAgIGNlbGwuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9J3RtLWlucHV0LWRpdic+PGlucHV0IHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPSd0eXBlIGZpbHRlciBoZXJlJy8+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSd0bS1jdXN0b20tY2hlY2tib3gnIHRpdGxlPSdjYXNlLXNlbnNpdGl2ZSc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPSdjaGVja2JveCcgdmFsdWU9JzEnIG5hbWU9J2NoZWNrYm94JyAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdjaGVja2JveCc+PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPmA7XHJcblxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gY2VsbC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICB9XHJcbn0oKSk7XHJcblxyXG5mdW5jdGlvbiBnZXRDZWxsKGUpIHtcclxuICAgIGxldCBjZWxsID0gZS50YXJnZXQ7XHJcbiAgICB3aGlsZSAoY2VsbC5jZWxsSW5kZXggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNlbGwgPSBjZWxsLnBhcmVudE5vZGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2VsbDtcclxufVxyXG5cclxuLy8gcHJvdG90eXBlIGZvciBGaWx0ZXJcclxuY2xhc3MgRmlsdGVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0bSkge1xyXG4gICAgICAgIHRoaXMudG0gPSB0bTtcclxuICAgICAgICB0aGlzLnJvd3MgPSB0bS5nZXRSb3dzKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5kaWNlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucGF0dGVybnMgPSBbXTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzZXR0ZXJzXHJcbiAgICBzZXRQYXR0ZXJucyhwYXR0ZXJucykge1xyXG4gICAgICAgIHRoaXMucGF0dGVybnMgPSBwYXR0ZXJucztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldEluZGljZXMoaW5kaWNlcykge1xyXG4gICAgICAgIHRoaXMuaW5kaWNlcyA9IGluZGljZXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXRPcHRpb25zKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy8gZ2V0dGVyc1xyXG4gICAgZ2V0UGF0dGVybnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0dGVybnM7XHJcbiAgICB9XHJcbiAgICBnZXRJbmRpY2VzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGljZXM7XHJcbiAgICB9XHJcbiAgICBnZXRPcHRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgZmlsdGVyKCkge1xyXG4gICAgICAgIGxldCBpbmRpY2VzID0gdGhpcy5nZXRJbmRpY2VzKCksXHJcbiAgICAgICAgICAgIHBhdHRlcm5zID0gdGhpcy5nZXRQYXR0ZXJucygpLFxyXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG1heERlcGggPSBpbmRpY2VzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIC8vIGZpbHRlciByb3dzXHJcbiAgICAgICAgbGV0IGFyciA9IHRoaXMucm93cy5maWx0ZXIoZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgICAgIGxldCBkZXBoID0gMCwgbWF0Y2hlcyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAobWF0Y2hlcyAmJiBkZXBoIDw9IG1heERlcGgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gaW5kaWNlc1tkZXBoXTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXR0ZXJuID0gcGF0dGVybnNbZGVwaF07XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVzdGVyID0gcm93LmNlbGxzW2ldLmlubmVySFRNTDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnNbZGVwaF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3QgY2FzZS1zZW5zaXRpdmVcclxuICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3RlciA9IHRlc3Rlci50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSB0ZXN0ZXIuaW5kZXhPZihwYXR0ZXJuKSAhPT0gLTE7XHJcbiAgICAgICAgICAgICAgICBkZXBoKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXM7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnRtLnNldFJvd3MoYXJyKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufTtcclxuXHJcbmNsYXNzIEZpbHRlckRlZmF1bHQgZXh0ZW5kcyBGaWx0ZXIge1xyXG4gICAgY29uc3RydWN0b3IodG0sIHNldHRpbmdzKSB7XHJcbiAgICAgICAgc3VwZXIodG0pO1xyXG4gICAgICAgIHRoaXMudEhlYWQgPSB0bS5oZWFkID8gdG0uaGVhZC50SGVhZCA6IHRtLm9yaWdIZWFkO1xyXG5cclxuICAgICAgICAvLyBjcmVhdGUgdGhlIHRvb2xiYXIgcm93XHJcbiAgICAgICAgbGV0IG51bSA9IHRoaXMudEhlYWQuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMubGVuZ3RoIC0gMTtcclxuICAgICAgICBsZXQgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgICBmb3IgKDsgbnVtID49IDA7IG51bS0tKSB7XHJcbiAgICAgICAgICAgIHJvdy5hcHBlbmRDaGlsZChuZXdDZWxsKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhZGRDbGFzcyhyb3csICd0bS1maWx0ZXItcm93Jyk7XHJcblxyXG4gICAgICAgIGlmICghc2V0dGluZ3MuYXV0b0NvbGxhcHNlKSB7XHJcbiAgICAgICAgICAgICAgICByb3cuc3R5bGUuaGVpZ2h0ID0gJzMwcHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYmluZCBsaXN0ZW5lcnNcclxuICAgICAgICBsZXQgdGltZW91dDtcclxuICAgICAgICByb3cub25rZXl1cCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ydW4oKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm93Lm9uY2xpY2sgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjZWxsID0gZ2V0Q2VsbChlKSxcclxuICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZS50YXJnZXQ7XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdTUEFOJyB8fCB0YXJnZXQubm9kZU5hbWUgPT0gJ0xBQkVMJykge1xyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2tib3ggY2xpY2tcclxuICAgICAgICAgICAgICAgIGxldCBjaGVja2JveCA9IGNlbGwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1jaGVja2JveF0nKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrYm94LmNoZWNrZWQgPSAhY2hlY2tib3guY2hlY2tlZDtcclxuICAgICAgICAgICAgICAgIHRoaXMucnVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByb3cub25jaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucnVuKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpbnNlcnQgdG9vbGJhciByb3cgaW50byB0SGVhZFxyXG4gICAgICAgIHRoaXMudEhlYWQuYXBwZW5kQ2hpbGQocm93KTtcclxuICAgIH1cclxuXHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgY29uc3QgaW5wdXRzID0gW10uc2xpY2UuY2FsbCh0aGlzLnRIZWFkLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9dGV4dF0nKSk7XHJcbiAgICAgICAgY29uc3QgY2hlY2tib3hlcyA9IFtdLnNsaWNlLmNhbGwodGhpcy50SGVhZC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpKTtcclxuXHJcbiAgICAgICAgbGV0IHBhdHRlcm5zID0gW10sIGluZGljZXMgPSBbXSwgb3B0aW9ucyA9IFtdO1xyXG5cclxuICAgICAgICBpdGVyYXRlKGlucHV0cywgZnVuY3Rpb24oaSwgaW5wdXQpIHtcclxuICAgICAgICAgICAgaWYgKGlucHV0LnZhbHVlLnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChpKTtcclxuICAgICAgICAgICAgICAgIHBhdHRlcm5zLnB1c2goaW5wdXQudmFsdWUudHJpbSgpKTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMucHVzaChjaGVja2JveGVzW2ldLmNoZWNrZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGF0dGVybnMocGF0dGVybnMpXHJcbiAgICAgICAgICAgIC5zZXRJbmRpY2VzKGluZGljZXMpXHJcbiAgICAgICAgICAgIC5zZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKTtcclxuXHJcbiAgICAgICAgLy8gdHJpZ2dlciBzb3J0aW5nXHJcbiAgICAgICAgdGhpcy50bS5ib2R5LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCd0bVNvcnRlclNvcnRBZ2FpbicpKTtcclxuXHJcbiAgICAgICAgdGhpcy50bS5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuLypcclxuY2xhc3MgRmlsdGVyU3BlY2lhbCBleHRlbmRzIEZpbHRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLCB0aW1lb3V0O1xyXG4gICAgICAgIC8vIG1vZGlmeSBET01cclxuICAgICAgICB2YXIgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGFkZENsYXNzKHdyYXBwZXIsICd0bS1maWx0ZXItd3JhcCcpO1xyXG4gICAgICAgIGNvcmUuY29udGFpbmVyLmluc2VydEJlZm9yZSh3cmFwcGVyLCBjb3JlLmJvZHlXcmFwKTtcclxuXHJcbiAgICAgICAgd3JhcHBlci5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSd0bS1maWx0ZXItbG9hZGVkJz4mbmJzcDs8L3NwYW4+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiPHNwYW4gY2xhc3M9J3RtLWZpbHRlci1hZGQtYnV0dG9uJz4rPC9zcGFuPlwiO1xyXG5cclxuICAgICAgICB3cmFwcGVyLm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcclxuXHJcbiAgICAgICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICd0bS1maWx0ZXItaW5zdGFuY2UnKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ3RtLW9wZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNsb3NlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3ModGFyZ2V0LCAndG0tb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvcGVuIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWluQWxsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkQ2xhc3ModGFyZ2V0LCAndG0tb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ3RtLWZpbHRlci1hZGQtYnV0dG9uJykpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLm1pbkFsbCgpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuYWRkRmlsdGVyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAndG0tY3VzdG9tLWNoZWNrYm94JykpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5maXJzdEVsZW1lbnRDaGlsZC5jaGVja2VkID0gIXRhcmdldC5maXJzdEVsZW1lbnRDaGlsZC5jaGVja2VkO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMucnVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LnBhcmVudE5vZGUsICd0bS1jdXN0b20tY2hlY2tib3gnKSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnByZXZpb3VzU2libGluZy5jaGVja2VkID0gIXRhcmdldC5wcmV2aW91c1NpYmxpbmcuY2hlY2tlZDtcclxuXHJcbiAgICAgICAgICAgICAgICBfdGhpcy5ydW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICd0bS1maWx0ZXItd3JhcCcpKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5taW5BbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgd3JhcHBlci5vbmNoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgX3RoaXMucnVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdyYXBwZXIub25rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVOYW1lID09PSAnSU5QVVQnKSB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5ydW4oKTtcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlRmlsdGVycyA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcignLnRtLWZpbHRlci1sb2FkZWQnKTtcclxuICAgICAgICB0aGlzLmZpbHRlcldyYXAgPSB3cmFwcGVyO1xyXG4gICAgICAgIHRoaXMucm93cyA9IGNvcmUuZ2V0Um93cygpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEZpbHRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgbmV3RmlsdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICBhZGRDbGFzcyhuZXdGaWx0ZXIsICd0bS1maWx0ZXItaW5zdGFuY2UnKTtcclxuICAgICAgICAgICAgYWRkQ2xhc3MobmV3RmlsdGVyLCAndG0tb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgbmV3RmlsdGVyLmlubmVySFRNTCA9IFwiPHNlbGVjdD48L3NlbGVjdD5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCI8aW5wdXQgdHlwZT0ndGV4dCcgcGxhY2Vob2xkZXI9J3R5cGUgZmlsdGVyIGhlcmUnIC8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiPHNwYW4gY2xhc3M9J3RtLWN1c3RvbS1jaGVja2JveCcgdGl0bGU9J2Nhc2Utc2Vuc2l0aXZlJz5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiPGlucHV0IHR5cGU9J2NoZWNrYm94JyB2YWx1ZT0nMScgbmFtZT0nY2hlY2tib3gnIC8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIjxsYWJlbCBmb3I9J2NoZWNrYm94Jz48L2xhYmVsPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCI8L3NwYW4+XCI7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgb3B0aW9ucyB0byBzZWxlY3QgZmllbGRcclxuICAgICAgICAgICAgdmFyIHNlbGVjdCA9IG5ld0ZpbHRlci5maXJzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICAgICAgICAgIGl0ZXJhdGUoY29yZS5vcmlnSGVhZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscywgZnVuY3Rpb24oaSwgY2VsbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uLnRleHQgPSBjZWxsLmlubmVySFRNTDtcclxuICAgICAgICAgICAgICAgIG9wdGlvbi52YWx1ZSA9IGk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZWN0LmFkZChvcHRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIGRlZmluZSBnZXR0ZXJzXHJcbiAgICAgICAgICAgIG5ld0ZpbHRlci5nZXRJbmRleCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdCA9IHRoaXMuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld0ZpbHRlci5nZXRQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlblsxXS52YWx1ZS50cmltKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3RmlsdGVyLmdldE9wdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1jaGVja2JveF0nKS5jaGVja2VkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRmlsdGVycy5hcHBlbmRDaGlsZChuZXdGaWx0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1pbkFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpdGVyYXRlKHRoaXMuZmlsdGVyV3JhcC5xdWVyeVNlbGVjdG9yQWxsKCcudG0tZmlsdGVyLWluc3RhbmNlLnRtLW9wZW4nKSwgZnVuY3Rpb24oaSwgaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzKGluc3RhbmNlLCAndG0tb3BlbicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ydW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gY29sbGVjdCBhbGwgaW5mb3JtYXRpb25cclxuICAgICAgICAgICAgdmFyIGZpbHRlcnMgPSBbXS5zbGljZS5jYWxsKHRoaXMuYWN0aXZlRmlsdGVycy5jaGlsZHJlbiksXHJcbiAgICAgICAgICAgICAgICBwYXR0ZXJucyA9IFtdLCBpbmRpY2VzID0gW10sIG9wdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGl0ZXJhdGUoZmlsdGVycywgZnVuY3Rpb24oaSwgZmlsdGVyT2JqKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goZmlsdGVyT2JqLmdldEluZGV4KCkpO1xyXG4gICAgICAgICAgICAgICAgcGF0dGVybnMucHVzaChmaWx0ZXJPYmouZ2V0UGF0dGVybigpKTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMucHVzaChmaWx0ZXJPYmouZ2V0T3B0aW9uKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0SW5kaWNlcyhpbmRpY2VzKVxyXG4gICAgICAgICAgICAgICAgLnNldFBhdHRlcm5zKHBhdHRlcm5zKVxyXG4gICAgICAgICAgICAgICAgLnNldE9wdGlvbnMob3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuKi9cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kdWxlKHtcclxuICAgIG5hbWU6IFwiZmlsdGVyXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICAvL2ZpbHRlclN0eWxlOiAnZGVmYXVsdCdcclxuICAgICAgICBhdXRvQ29sbGFwc2U6IHRydWVcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplcjogZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAvLyB0aGlzIDo9IFRhYmxlbW9kaWZ5LWluc3RhbmNlXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5jb250YWluZXIsICd0bS1maWx0ZXInKTtcclxuXHJcbiAgICAgICAgICAgIC8qc3dpdGNoIChzZXR0aW5ncy5maWx0ZXJTdHlsZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwZWNpYWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBGaWx0ZXJCKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6Ki9cclxuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gbmV3IEZpbHRlckRlZmF1bHQodGhpcywgc2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgaW5mbygnbW9kdWxlIGZpbHRlciBsb2FkZWQnKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGVycm9yKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbiIsImNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcbmNvbnN0IHtpblB4LCBpdGVyYXRlLCBzZXRDc3MsIGFkZENsYXNzLFxyXG4gICAgICAgZ2V0Q3NzLCBnZXRTY3JvbGxiYXJXaWR0aCwgaW5mbywgZXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAgICBuYW1lOiBcImZpeGVkXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICBmaXhIZWFkZXI6ZmFsc2UsXHJcbiAgICAgICAgZml4Rm9vdGVyOmZhbHNlXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZXI6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgLy8gc2V0IHVwXHJcbiAgICAgICAgdmFyIGhlYWQsXHJcbiAgICAgICAgICAgIGZvb3QsXHJcbiAgICAgICAgICAgIGhlYWRXcmFwLFxyXG4gICAgICAgICAgICBmb290V3JhcCxcclxuICAgICAgICAgICAgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLmJvZHksXHJcbiAgICAgICAgICAgIGJvZHlXcmFwID0gdGhpcy5ib2R5V3JhcCxcclxuICAgICAgICAgICAgb3JpZ0hlYWQgPSB0aGlzLm9yaWdIZWFkLFxyXG4gICAgICAgICAgICBvcmlnRm9vdCA9IHRoaXMub3JpZ0Zvb3Q7XHJcblxyXG4gICAgICAgIHZhciBnZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG9yaWdIZWFkLmNsaWVudEhlaWdodDt9O1xyXG4gICAgICAgIHZhciBnZXRGb290ZXJIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG9yaWdGb290LmNsaWVudEhlaWdodDt9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW5kZXJIZWFkKCkge1xyXG4gICAgICAgICAgICBpZighaGVhZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgYWxsTmV3ID0gW10uc2xpY2UuY2FsbChoZWFkLmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzKSxcclxuICAgICAgICAgICAgICAgIGFsbE9sZCA9IFtdLnNsaWNlLmNhbGwob3JpZ0hlYWQuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMpO1xyXG4gICAgICAgICAgICBib2R5LnN0eWxlLm1hcmdpblRvcCA9IGluUHgoJy0nICsgZ2V0SGVhZGVySGVpZ2h0KCkpOyAvLyBpZiBoZWFkZXIgcmVzaXplcyBiZWNhdXNlIG9mIGEgdGV4dCB3cmFwXHJcblxyXG4gICAgICAgICAgICBpdGVyYXRlKGFsbE5ldywgZnVuY3Rpb24oaSwgbmV1KXtcclxuICAgICAgICAgICAgICAgIGxldCB3ID0gaW5QeChhbGxPbGRbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgbmV1LnN0eWxlLmNzc1RleHQgPSBgd2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4td2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6ICR7d31gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyRm9vdCgpIHtcclxuICAgICAgICAgICAgaWYgKCFmb290KSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBhbGxOZXcgPSBbXS5zbGljZS5jYWxsKGZvb3QuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMpLFxyXG4gICAgICAgICAgICAgICAgYWxsT2xkID0gW10uc2xpY2UuY2FsbChvcmlnRm9vdC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscyk7XHJcblxyXG4gICAgICAgICAgICBib2R5V3JhcC5zdHlsZS5tYXJnaW5Cb3R0b20gPSBpblB4KCctJyArIChzY3JvbGxiYXJXaWR0aCArIGdldEZvb3RlckhlaWdodCgpICsgMSkpOyAvLyBpZiBmb290ZXIgcmVzaXplcyBiZWNhdXNlIG9mIGEgdGV4dCB3cmFwXHJcblxyXG4gICAgICAgICAgICBpdGVyYXRlKGFsbE5ldywgZnVuY3Rpb24oaSwgbmV1KXtcclxuICAgICAgICAgICAgICAgIGxldCB3ID0gaW5QeChhbGxPbGRbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgbmV1LnN0eWxlLmNzc1RleHQgPSBgd2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4td2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6ICR7d31gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3MoY29udGFpbmVyLCAndG0tZml4ZWQnKTtcclxuICAgICAgICAgICAgdmFyIGJvcmRlckNvbGxhcHNlID0gZ2V0Q3NzKGJvZHksICdib3JkZXItY29sbGFwc2UnKSxcclxuICAgICAgICAgICAgICAgIHNjcm9sbGJhcldpZHRoID0gZ2V0U2Nyb2xsYmFyV2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcmlnSGVhZCAmJiBzZXR0aW5ncy5maXhIZWFkZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBoZWFkZXJIZWlnaHQgPSBnZXRIZWFkZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGhlYWQgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGhlYWRXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKG9yaWdIZWFkLmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICBoZWFkV3JhcC5hcHBlbmRDaGlsZChoZWFkKTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoaGVhZFdyYXAsIGJvZHlXcmFwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhoZWFkLCAgICAgJ3RtLWhlYWQnKTtcclxuICAgICAgICAgICAgICAgIGFkZENsYXNzKGhlYWRXcmFwLCAndG0taGVhZC13cmFwJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaGVhZC5zdHlsZS5ib3JkZXJDb2xsYXBzZSAgID0gYm9yZGVyQ29sbGFwc2U7XHJcbiAgICAgICAgICAgICAgICBvcmlnSGVhZC5zdHlsZS52aXNpYmlsaXR5ICAgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGJvZHkuc3R5bGUubWFyZ2luVG9wICAgICAgICA9IGluUHgoJy0nICsgaGVhZGVySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGhlYWRXcmFwLnN0eWxlLm1hcmdpblJpZ2h0ICA9IGluUHgoc2Nyb2xsYmFyV2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcmlnRm9vdCAmJiBzZXR0aW5ncy5maXhGb290ZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmb290ZXJIZWlnaHQgPSBnZXRGb290ZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGZvb3QgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICBmb290LmFwcGVuZENoaWxkKG9yaWdGb290LmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICBmb290V3JhcC5hcHBlbmRDaGlsZChmb290KTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb290V3JhcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoZm9vdCwgICAgICd0bS1mb290Jyk7XHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhmb290V3JhcCwgJ3RtLWZvb3Qtd3JhcCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFkZCBESVZzIHRvIG9yaWdGb290IGNlbGxzIHNvIGl0cyBoZWlnaHQgY2FuIGJlIHNldCB0byAwcHhcclxuICAgICAgICAgICAgICAgIGl0ZXJhdGUob3JpZ0Zvb3QuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMsIGZ1bmN0aW9uKGksIGNlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLmlubmVySFRNTCA9ICc8ZGl2PicgKyBjZWxsLmlubmVySFRNTCArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9vdC5zdHlsZS5ib3JkZXJDb2xsYXBzZSAgID0gYm9yZGVyQ29sbGFwc2U7XHJcbiAgICAgICAgICAgICAgICBvcmlnRm9vdC5zdHlsZS52aXNpYmlsaXR5ICAgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGJvZHlXcmFwLnN0eWxlLm92ZXJmbG93WCAgICA9ICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuc3R5bGUubWFyZ2luQm90dG9tID0gaW5QeCgnLScgKyAoc2Nyb2xsYmFyV2lkdGggKyBmb290ZXJIZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwLnN0eWxlLm1hcmdpblJpZ2h0ICA9IGluUHgoc2Nyb2xsYmFyV2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICAgICAgICAgIGlmIChoZWFkKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVuZGVySGVhZCk7XHJcbiAgICAgICAgICAgICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RtRml4ZWRGb3JjZVJlbmRlcmluZycsIHJlbmRlckhlYWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZm9vdCkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlbmRlckZvb3QpO1xyXG4gICAgICAgICAgICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCd0bUZpeGVkRm9yY2VSZW5kZXJpbmcnLCByZW5kZXJIZWFkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGhlYWQgJiYgZm9vdCkge1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtJytib2R5V3JhcC5zY3JvbGxMZWZ0KydweCknO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb290V3JhcC5zY3JvbGxMZWZ0ID0gYm9keVdyYXAuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLScrZm9vdFdyYXAuc2Nyb2xsTGVmdCsncHgpJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keVdyYXAuc2Nyb2xsTGVmdCA9IGZvb3RXcmFwLnNjcm9sbExlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhlYWQgJiYgIWZvb3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBib2R5V3JhcC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkLnN0eWxlLm1hcmdpbkxlZnQgPSBpblB4KCctJyArIGJvZHlXcmFwLnNjcm9sbExlZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFoZWFkICYmIGZvb3QpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZm9vdFdyYXAuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keVdyYXAuc2Nyb2xsTGVmdCA9IGZvb3RXcmFwLnNjcm9sbExlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJvZHlXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvb3RXcmFwLnNjcm9sbExlZnQgPSBib2R5V3JhcC5zY3JvbGxMZWZ0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIC8vIG7DtnRpZywgd2VpbCBkZXIgQnJvd3NlciB6dW0gcmVuZGVybiBtYW5jaG1hbCBlaW5lIGdld2lzc2UgWmVpdCBicmF1Y2h0XHJcbiAgICAgICAgICAgICAgICByZW5kZXJIZWFkKCk7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJGb290KCk7XHJcbiAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgLy8gbsO2dGlnLCB3ZWlsIGRlciBCcm93c2VyIHp1bSByZW5kZXJuIG1hbmNobWFsIGVpbmUgZ2V3aXNzZSBaZWl0IGJyYXVjaHRcclxuICAgICAgICAgICAgICAgIHJlbmRlckhlYWQoKTtcclxuICAgICAgICAgICAgICAgIHJlbmRlckZvb3QoKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGVhZCA9IGhlYWQ7XHJcbiAgICAgICAgICAgIHRoaXMuZm9vdCA9IGZvb3Q7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZFdyYXAgPSBoZWFkV3JhcDtcclxuICAgICAgICAgICAgdGhpcy5mb290V3JhcCA9IGZvb3RXcmFwO1xyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgZml4ZWQgbG9hZGVkJyk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCB7ZXJyb3IsIGV4dGVuZDIsIGlzTm9uRW1wdHlTdHJpbmd9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuY29uc3QgZGVmYXVsdFBhcmFtcyA9IHsgICAgICAgICAgIC8vZGVmYXVsdC1uYW1lXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHt9LCAgICAgICAgICAgICAgICAvL1wiZGVmYXVsdFwiLWRlZmF1bHQtc2V0dGluZ3M6IGVtcHR5XHJcbiAgICBzZXR0aW5nc1ZhbGlkYXRvcjogKCkgPT4gbnVsbCwgICAgICAvL2RlZmF1bHQ6IGFjY2VwdCBhbGwgZ2l2ZW4gc2V0dGluZ3Mgb2JqZWN0c1xyXG4gICAgaW5pdGlhbGl6ZXI6ICgpID0+IG51bGwgICAgICAgICAgICAgLy9kZWZhdWx0OiBlbXB0eSBtb2R1bGVcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBzaW5nbGUgVGFibGVtb2RpZnkgbW9kdWxlLlxyXG4gKiBJdCBwcm92aWRlcyBhIHN0YW5kYXJkIGludGVyZmFjZSBmb3IgZGVmaW5pbmcgbW9kdWxlcywgdGFrZXMgY2FyZSBvZiBzZXR0aW5nc1xyXG4gKiB2YWxpZGF0aW9uLCBzZXR0aW5ncy1jb21wbGV0aW9uIHdpdGggZGVmYXVsdCBzZXR0aW5ncyBhbmQgY2FuIGJlIGV4dGVuZGVkIHdpdGhcclxuICogZnVydGhlciBmdW5jdGlvbmFsaXR5IChlLmcuIG1vZHVsZSBkZXBlbmRlbmNpZXMpXHJcbiAqXHJcbiAqIFVzYWdlOlxyXG4gKiBtb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gKiAgICAgbmFtZTogPHRoZSBtb2R1bGUncyBuYW1lPixcclxuICogICAgIGRlZmF1bHRTZXR0aW5nczogPHRoZSBtb2R1bGUncyBkZWZhdWx0IHNldHRpbmdzPixcclxuICogICAgIHNldHRpbmdzVmFsaWRhdG9yOiA8ZnVuY3Rpb24sIGNhbGxlZCB3aXRoIHRoZSBzZXR0aW5ncyBvYmplY3QgYW5kIHRocm93c1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpbnZhbGlkIHBhcmFtZXRlcnMgYXJlIGRldGVjdGVkPixcclxuICogICAgIGluaXRpYWxpemVyOiA8ZnVuY3Rpb24gd2hlcmUgdGhlIG1vZHVsZSBjb2RlIGl0c2VsZiByZXNpZGVzLCB3aWxsIGJlIGNhbGxlZFxyXG4gKiAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBUYWJsZW1vZGlmeSBpbnN0YW5jZSBhcyB0aGlzLXZhbHVlIGFuZCB0aGUgcmV0dXJuXHJcbiAqICAgICAgICAgICAgICAgICAgIHZhbHVlIHdpbGwgYmUgc3RvcmVkIGluIHRtLWluc3RhbmNlLm1vZHVsZXMuPG1vZHVsZW5hbWU+XHJcbiAqIH0pO1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2R1bGUge1xyXG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XHJcbiAgICAgICAgLy9JZiBubyBuYW1lIGlzIGdpdmVuLCB0aHJvd1xyXG4gICAgICAgIGlmKCFpc05vbkVtcHR5U3RyaW5nKHBhcmFtcy5uYW1lKSkge1xyXG4gICAgICAgICAgICBsZXQgZXJyb3JNc2cgPSBcIk5hbWUgbXVzdCBiZSBnaXZlbiBmb3IgbW9kdWxlIVwiO1xyXG4gICAgICAgICAgICBlcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY29tcGxldGUgcGFyYW1ldGVycyB3aXRoIGRlZmF1bHQgcGFyYW1ldGVyc1xyXG4gICAgICAgIGV4dGVuZDIocGFyYW1zLCBkZWZhdWx0UGFyYW1zKTtcclxuICAgICAgICAvL3NldCBwYXJhbWV0ZXJzIGFzIHByb3BlcnRpZXMgb2YgdGhpc1xyXG4gICAgICAgIGV4dGVuZDIodGhpcywgcGFyYW1zKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRG9lcyBub3RoaW5nIG1vcmUgdGhhbiBleHRlbmQgdGhlIGdpdmVuIHNldHRpbmdzIG9iamVjdCB3aXRoIHRoZSBkZWZhdWx0XHJcbiAgICAgKiBzZXR0aW5ncyBhbmQgY2FsbCB0aGUgc2V0dGluZ3NWYWxpZGF0b3IgZnVuY3Rpb24gb24gdGhlIHJlc3VsdGluZyBvYmplY3RcclxuICAgICAqL1xyXG4gICAgZ2V0U2V0dGluZ3Moc2V0dGluZ3MpIHtcclxuICAgICAgICBleHRlbmQyKHNldHRpbmdzLCB0aGlzLmRlZmF1bHRTZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc1ZhbGlkYXRvcihzZXR0aW5ncyk7XHJcbiAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgYnkgdGhlIFRhYmxlbW9kaWZ5IGluc3RhbmNlLiBDYWxscyB0aGUgaW5pdGlhbGl6ZXItZnVuY3Rpb24gd2l0aFxyXG4gICAgICogdGhlIFRhYmxlbW9kaWZ5IGluc3RhbmNlIGFzIHRoaXMtVmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0TW9kdWxlKHRhYmxlTW9kaWZ5LCBzZXR0aW5ncykge1xyXG4gICAgICAgIHNldHRpbmdzID0gdGhpcy5nZXRTZXR0aW5ncyhzZXR0aW5ncyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZXIuY2FsbCh0YWJsZU1vZGlmeSwgc2V0dGluZ3MsIHRoaXMpO1xyXG4gICAgfVxyXG59O1xyXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5jb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIHJlbW92ZUNsYXNzLCBlcnJvciwgZXh0ZW5kMn0gPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxuZnVuY3Rpb24gZ2V0VmFsdWUodHIsIGkpIHtyZXR1cm4gdHIuY2VsbHNbaV0uaW5uZXJIVE1MLnRyaW0oKTt9XHJcblxyXG5jbGFzcyBTb3J0ZXIge1xyXG4gICAgY29uc3RydWN0b3IodGFibGVNb2RpZnksIHNldHRpbmdzKSB7XHJcbiAgICAgICAgLy9TZXQgaW5pdGlhbCB2YWx1ZXNcclxuICAgICAgICBleHRlbmQyKHRoaXMsIHtcclxuICAgICAgICAgICAgcmVhZHk6IHRydWUsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9LFxyXG4gICAgICAgICAgICBoZWFkQ2VsbHM6IFtdLFxyXG4gICAgICAgICAgICBib2R5OiBudWxsLFxyXG4gICAgICAgICAgICByb3dzOiBbXSxcclxuICAgICAgICAgICAgaW5kaWNlczogW10sXHJcbiAgICAgICAgICAgIG9yZGVyczogW10sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9TdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgdGFibGVtb2RpZnkgaW5zdGFuY2VcclxuICAgICAgICB0aGlzLnRtID0gdGFibGVNb2RpZnk7XHJcbiAgICAgICAgYWRkQ2xhc3ModGhpcy50bS5jb250YWluZXIsICd0bS1zb3J0ZXInKTtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICBpID0gc2V0dGluZ3MuaW5pdGlhbFswXSxcclxuICAgICAgICAgICAgb3JkZXIgPSBzZXR0aW5ncy5pbml0aWFsWzFdO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkgPSB0aGlzLnRtLmJvZHkudEJvZGllc1swXTtcclxuICAgICAgICAvL3RoaXMucm93cyA9IFtdLnNsaWNlLmNhbGwodGhpcy5ib2R5LnJvd3MpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVycyA9IHNldHRpbmdzLmhlYWRlcnM7XHJcbiAgICAgICAgdGhpcy5oZWFkQ2VsbHMgPSB0aGlzLnRtLmhlYWQgPyBbXS5zbGljZS5jYWxsKHRoaXMudG0uaGVhZC5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscykgOiBbXS5zbGljZS5jYWxsKHRoaXMudG0uYm9keS50SGVhZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscyk7XHJcblxyXG4gICAgICAgIGl0ZXJhdGUoc2V0dGluZ3MuY3VzdG9tUGFyc2VycywgKG5hbWUsIGZ1bmMpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYXJzZXJzW25hbWVdID0gZnVuYztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gaXRlcmF0ZSBvdmVyIGhlYWRlciBjZWxsc1xyXG4gICAgICAgIGl0ZXJhdGUodGhpcy5oZWFkQ2VsbHMsIChpLCBjZWxsKSA9PiB7XHJcbiAgICAgICAgICAgIGkgPSBwYXJzZUludChpKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdldElzRW5hYmxlZChpKSkge1xyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoY2VsbCwgJ3NvcnRhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuc2hpZnRLZXkgJiYgc2V0dGluZ3MuZW5hYmxlTXVsdGlzb3J0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFuYWdlTXVsdGkoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYW5hZ2UoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLypcclxuICAgICAgICBoZWFkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgY2VsbCA9IGUudGFyZ2V0O1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBlLnRhcmdldC5jZWxsSW5kZXg7XHJcbiAgICAgICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmIHNldHRpbmdzLmVuYWJsZU11bHRpc29ydCkge1xyXG4gICAgICAgICAgICAgICAgLy8gY2VsbCBpcyBhIG5ldyBzb3J0aW5nIGFyZ3VtZW50XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5tYW5hZ2VNdWx0aShpbmRleCwgY2VsbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5tYW5hZ2UoaW5kZXgsIGNlbGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgKi9cclxuICAgICAgICAvLyB0cnkgdG8gc29ydCBieSBpbml0aWFsIHNvcnRpbmdcclxuICAgICAgICBpZiAoIXRoaXMuZ2V0SXNFbmFibGVkKGkpKSB7XHJcbiAgICAgICAgICAgIC8vIG5vdCBlbmFibGVkLCBjaG9vc2UgYW5vdGhlciBpbml0aWFsIHNvcnRpbmdcclxuICAgICAgICAgICAgdmFyIGluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICB3aGlsZSAoaSA8IHRoaXMuaGVhZENlbGxzLmxlbmd0aCAmJiAhaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldElzRW5hYmxlZChpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFuYWdlKGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKG9yZGVyID09PSAnZGVzYycpIHtcclxuICAgICAgICAgICAgLy8gZW5hYmxlZCwgc29ydCBkZXNjXHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3JkZXJBc2MoZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAuc2V0SW5kZXgoaSlcclxuICAgICAgICAgICAgICAgIC5zb3J0KClcclxuICAgICAgICAgICAgICAgIC5yZW5kZXIoKVxyXG4gICAgICAgICAgICAgICAgLnJlbmRlclNvcnRpbmdBcnJvd3MoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZW5hYmxlZCwgc29ydCBhc2NcclxuICAgICAgICAgICAgdGhpcy5zZXRPcmRlckFzYygpO1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZShpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNvcnQgYWdhaW4gaW4gY2FzZSBpdCdzIG5lZWRlZC5cclxuICAgICAgICB0aGlzLnRtLmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG1Tb3J0ZXJTb3J0QWdhaW4nLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc29ydCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuICAgIHNldFJvd3Mocm93QXJyYXkpIHtcclxuICAgICAgICAgICAgdGhpcy50bS5zZXRSb3dzKHJvd0FycmF5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXRJbmRleChpKSB7XHJcbiAgICAgICAgdGhpcy5pbmRpY2VzID0gW2ldO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgc2V0T3JkZXJBc2MoYm9vbCkge1xyXG4gICAgICAgIGlmIChib29sID09PSB1bmRlZmluZWQpIGJvb2wgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub3JkZXJzID0gW2Jvb2xdO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZ2V0Um93cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50bS5nZXRSb3dzKCk7XHJcbiAgICB9XHJcbiAgICBnZXRQYXJzZXIoaSkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5oZWFkZXJzLmhhc093blByb3BlcnR5KGkpICYmIHRoaXMuaGVhZGVyc1tpXS5oYXNPd25Qcm9wZXJ0eSgncGFyc2VyJykpID8gdGhpcy5wYXJzZXJzW3RoaXMuaGVhZGVyc1tpXS5wYXJzZXJdIDogdGhpcy5wYXJzZXJzW3RoaXMuaGVhZGVycy5hbGwucGFyc2VyXTtcclxuICAgIH1cclxuICAgIGdldElzRW5hYmxlZChpKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmhlYWRlcnMuaGFzT3duUHJvcGVydHkoaSkgJiYgdGhpcy5oZWFkZXJzW2ldLmhhc093blByb3BlcnR5KCdlbmFibGVkJykpID8gdGhpcy5oZWFkZXJzW2ldLmVuYWJsZWQgOiB0aGlzLmhlYWRlcnMuYWxsLmVuYWJsZWQ7XHJcbiAgICB9XHJcbiAgICAvKlxyXG4gICAgICAgIHNpbmdsZSB2YWx1ZXNcclxuICAgICovXHJcbiAgICBnZXRJbmRleCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbmRpY2VzWzBdO1xyXG4gICAgfVxyXG4gICAgZ2V0T3JkZXJBc2MoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3JkZXJzWzBdO1xyXG4gICAgfVxyXG4gICAgLypcclxuICAgICAgICBtdWx0aXBsZSB2YWx1ZXNcclxuICAgICovXHJcbiAgICBnZXRJbmRpY2VzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGljZXM7XHJcbiAgICB9XHJcbiAgICBnZXRPcmRlcnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3JkZXJzO1xyXG4gICAgfVxyXG4gICAgZ2V0UGFyc2VycygpIHtcclxuICAgICAgICAvL3ZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5kaWNlcygpLm1hcCgoaSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQYXJzZXIoaSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzb3J0KCkge1xyXG4gICAgLyogICAgdmFyIGkgPSB0aGlzLmdldEluZGV4KCksXHJcbiAgICAgICAgICAgIG8gPSB0aGlzLmdldE9yZGVyQXNjKCksXHJcbiAgICAgICAgICAgIHAgPSB0aGlzLmdldFBhcnNlcihpKTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRSb3dzKCkuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwKGdldFZhbHVlKGEsIGkpLCBnZXRWYWx1ZShiLCBpKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICghbykgdGhpcy5yZXZlcnNlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzOyovXHJcbiAgICAvL31cclxuICAgIC8vbXVsdGlTb3J0KCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgIGluZGljZXMgPSB0aGlzLmdldEluZGljZXMoKSxcclxuICAgICAgICAgICAgb3JkZXJzID0gdGhpcy5nZXRPcmRlcnMoKSxcclxuICAgICAgICAgICAgcGFyc2VycyA9IHRoaXMuZ2V0UGFyc2VycygpLC8vaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkge3JldHVybiBfdGhpcy5nZXRQYXJzZXIoaSk7fSksXHJcbiAgICAgICAgICAgIG1heERlcGggPSBpbmRpY2VzLmxlbmd0aCAtIDE7XHJcblxyXG4gICAgICAgIHRoaXMudG0uZ2V0Um93cygpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICBsZXQgY29tcGFyYXRvciA9IDAsIGRlcGggPSAwO1xyXG5cclxuICAgICAgICAgICAgd2hpbGUgKGNvbXBhcmF0b3IgPT09IDAgJiYgZGVwaCA8PSBtYXhEZXBoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG1wSW5kZXggPSBpbmRpY2VzW2RlcGhdO1xyXG4gICAgICAgICAgICAgICAgY29tcGFyYXRvciA9IHBhcnNlcnNbZGVwaF0oZ2V0VmFsdWUoYSwgdG1wSW5kZXgpLCBnZXRWYWx1ZShiLCB0bXBJbmRleCkpO1xyXG4gICAgICAgICAgICAgICAgZGVwaCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZXBoLS07IC8vIGRlY3JlbWVudCBhZ2FpblxyXG4gICAgICAgICAgICAvLyBpbnZlcnQgcmVzdWx0IGluIGNhc2Ugb3JkZXIgb2YgdGhpcyBjb2x1bW5zIGlzIGRlc2NlbmRpbmdcclxuICAgICAgICAgICAgcmV0dXJuIChvcmRlcnNbZGVwaF0gfHwgZGVwaCA+IG1heERlcGgpID8gY29tcGFyYXRvciA6ICgtMSkgKiBjb21wYXJhdG9yO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8qXHJcbiAgICByZXZlcnNlKCkge1xyXG4gICAgICAgIHZhciBhcnJheSA9IHRoaXMudG0uZ2V0Um93cygpLFxyXG4gICAgICAgICAgICBsZWZ0ID0gbnVsbCxcclxuICAgICAgICAgICAgcmlnaHQgPSBudWxsLFxyXG4gICAgICAgICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgZm9yIChsZWZ0ID0gMDsgbGVmdCA8IGxlbmd0aCAvIDI7IGxlZnQgKz0gMSkge1xyXG4gICAgICAgICAgICByaWdodCA9IGxlbmd0aCAtIDEgLSBsZWZ0O1xyXG4gICAgICAgICAgICB2YXIgdGVtcG9yYXJ5ID0gYXJyYXlbbGVmdF07XHJcbiAgICAgICAgICAgIGFycmF5W2xlZnRdID0gYXJyYXlbcmlnaHRdO1xyXG4gICAgICAgICAgICBhcnJheVtyaWdodF0gPSB0ZW1wb3Jhcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vdGhpcy5zZXRSb3dzKGFycmF5KTtcclxuICAgICAgICBjb25zb2xlLmxvZygncmV2ZXJzZWQnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgICovXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgdGhpcy50bS5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICByZW5kZXJTb3J0aW5nQXJyb3dzKCkge1xyXG4gICAgICAgIC8vIHJlbW92ZSBjdXJyZW50IHNvcnRpbmcgY2xhc3Nlc1xyXG4gICAgICAgIGl0ZXJhdGUodGhpcy50bS5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLnNvcnQtdXAsIC5zb3J0LWRvd24nKSwgZnVuY3Rpb24oaSwgY2VsbCl7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGNlbGwsICdzb3J0LXVwJyk7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGNlbGwsICdzb3J0LWRvd24nKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuaW5kaWNlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmIChsZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBsID0gbGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgZm9yICg7IGwgPj0gMDsgbC0tKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmluZGljZXNbbF07XHJcbiAgICAgICAgICAgICAgICB2YXIgYXNjID0gdGhpcy5vcmRlcnNbbF07XHJcbiAgICAgICAgICAgICAgICB2YXIgY2VsbCA9IHRoaXMuaGVhZENlbGxzW2luZGV4XTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYXNjKSB7IC8vIGFzY2VuZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzKGNlbGwsICdzb3J0LXVwJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBkZXNjZW5kaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkQ2xhc3MoY2VsbCwgJ3NvcnQtZG93bicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgbWFuYWdlKGkpIHtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnJlYWR5KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5nZXRJbmRleCgpID09PSBpKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldE9yZGVyQXNjKCF0aGlzLmdldE9yZGVyQXNjKCkpOyAgLy8gaW52ZXJ0aWVyZSBha3R1ZWxsZSBTb3J0aWVydW5nXHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRJc0VuYWJsZWQoaSkpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3JkZXJBc2MoKTsgICAgICAgICAgICAgICAgICAgICAvLyBzb3J0IGFzY2VuZGluZ1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SW5kZXgoaSlcclxuICAgICAgICAgICAgLnNvcnQoKVxyXG4gICAgICAgICAgICAucmVuZGVyKClcclxuICAgICAgICAgICAgLnJlbmRlclNvcnRpbmdBcnJvd3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBtYW5hZ2VNdWx0aShpKSB7XHJcbiAgICAgICAgLy8gYWRkIGkgdG8gdGhlIG11bHRpIGluZGljZXNcclxuICAgICAgICBpZiAoIXRoaXMucmVhZHkpIHJldHVybjtcclxuICAgICAgICB0aGlzLnJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBpbmRpY2VzID0gdGhpcy5pbmRpY2VzLFxyXG4gICAgICAgICAgICBleGlzdHMgPSBpbmRpY2VzLmluZGV4T2YoaSk7XHJcblxyXG4gICAgICAgIGlmIChleGlzdHMgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIC8vIGFkZCBuZXcgbXVsdGlzb3J0IGluZGV4XHJcbiAgICAgICAgICAgIHRoaXMuaW5kaWNlcy5wdXNoKGkpO1xyXG4gICAgICAgICAgICB0aGlzLm9yZGVycy5wdXNoKHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGludmVydFxyXG4gICAgICAgICAgICB0aGlzLm9yZGVyc1tleGlzdHNdID0gIXRoaXMub3JkZXJzW2V4aXN0c107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyBzb3J0XHJcbiAgICAgICAgdGhpcy5zb3J0KClcclxuICAgICAgICAgICAgLnJlbmRlcigpXHJcbiAgICAgICAgICAgIC5yZW5kZXJTb3J0aW5nQXJyb3dzKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblNvcnRlci5wcm90b3R5cGUucGFyc2VycyA9IHtcclxuICAgIHN0cmluZzogZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGlmIChhID4gYikgcmV0dXJuIDE7XHJcbiAgICAgICAgaWYgKGEgPCBiKSByZXR1cm4gLTE7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9LFxyXG4gICAgbnVtZXJpYzogZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGEgPSBwYXJzZUZsb2F0KGEpO1xyXG4gICAgICAgIGIgPSBwYXJzZUZsb2F0KGIpO1xyXG4gICAgICAgIHJldHVybiBhIC0gYjtcclxuICAgIH0sXHJcbiAgICBpbnRlbGxpZ2VudDogZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIHZhciBpc051bWVyaWNBID0gIWlzTmFOKGEpLFxyXG4gICAgICAgICAgICBpc051bWVyaWNCID0gIWlzTmFOKGIpO1xyXG5cclxuICAgICAgICBpZiAoaXNOdW1lcmljQSAmJiBpc051bWVyaWNCKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGEpIC0gcGFyc2VGbG9hdChiKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzTnVtZXJpY0EpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljQikge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoYSA+IGIpIHJldHVybiAxO1xyXG4gICAgICAgICAgICBpZiAoYSA8IGIpIHJldHVybiAtMTtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgICAgcGFyc2VzIHRoZXNlIERhdGUgRm9ybWF0czpcclxuICAgICAgICAgZC5tbS5ZWVlZXHJcbiAgICAgICAgICBkLm0uWVlZWVxyXG4gICAgICAgICBkZC5tLllZWVlcclxuICAgICAgICBkZC5tbS5ZWVlZXHJcbiAgICAqL1xyXG4gICAgZ2VybWFuRGF0ZTogZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIHRyeXtcclxuICAgICAgICAgICAgdmFyIGRhdGVBID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgIGRhdGVCID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgIHBhcnRzQSA9IGEuc3BsaXQoJy4nKSxcclxuICAgICAgICAgICAgICAgIHBhcnRzQiA9IGIuc3BsaXQoJy4nKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJ0c0EubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlQSA9IG5ldyBEYXRlKHBhcnNlSW50KHBhcnRzQVsyXSksIHBhcnNlSW50KHBhcnRzQVsxXSksIHBhcnNlSW50KHBhcnRzQVswXSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzQS5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGRhdGVBID0gbmV3IERhdGUocGFyc2VJbnQocGFydHNBWzFdKSwgcGFyc2VJbnQocGFydHNBWzBdKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwYXJ0c0IubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlQiA9IG5ldyBEYXRlKHBhcnNlSW50KHBhcnRzQlsyXSksIHBhcnNlSW50KHBhcnRzQlsxXSksIHBhcnNlSW50KHBhcnRzQlswXSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzQi5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGRhdGVCID0gbmV3IERhdGUocGFyc2VJbnQocGFydHNCWzFdKSwgcGFyc2VJbnQocGFydHNCWzBdKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRlQSA+IGRhdGVCKSByZXR1cm4gMTtcclxuICAgICAgICAgICAgaWYgKGRhdGVBIDwgZGF0ZUIpIHJldHVybiAtMTtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgIGVycm9yKGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgICAgTk9UIElNUExFTUVOVEVEIFlFVFxyXG4gICAgICAgIEBUT0RPIGltcGxlbWVudFxyXG4gICAgKi9cclxuICAgIGFtZXJpY2FuRGF0ZTogZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmludGVsbGlnZW50KGEsIGIpO1xyXG4gICAgfSxcclxuICAgIC8qXHJcbiAgICAgICAgZ2VybWFuIGRheXMgb2YgdGhlIHdlZWtcclxuICAgICovXHJcbiAgICBkYXlzT2ZUaGVXZWVrOiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0SW5kZXgoc3RyKSB7XHJcbiAgICAgICAgICAgIHZhciBpID0gLTEsIGwgPSBkYXlzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIHdoaWxlIChsID4gLTEgJiYgaSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGkgPSBkYXlzW2xdLmluZGV4T2Yoc3RyKTtcclxuICAgICAgICAgICAgICAgIGwtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkYXlzID0gW1xyXG4gICAgICAgICAgICAvLyBnZXJtYW5cclxuICAgICAgICAgICAgWydtbycsICdkaScsICdtaScsICdkbycsICdmcicsICdzYScsICdzbyddLFxyXG4gICAgICAgICAgICBbJ21vbnRhZycsICdkaWVuc3RhZycsICdtaXR0d29jaCcsICdkb25uZXJzdGFnJywgJ2ZyZWl0YWcnLCAnc2Ftc3RhZycsICdzb25udGFnJ10sXHJcbiAgICAgICAgICAgIC8vIGVuZ2xpc2hcclxuICAgICAgICAgICAgWydtb24nLCAndHVlJywgJ3dlZCcsICd0aHUnLCAnZnJpJywgJ3NhdCcsICdzdW4nXSxcclxuICAgICAgICAgICAgWydtb25kYXknLCAndHVlc2RheScsICd3ZWRuZXNkYXknLCAndGh1cnNkYXknLCAnZnJpZGF5JywgJ3NhdHVyZGF5JywgJ3N1bmRheSddXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdldEluZGV4KGIudG9Mb3dlckNhc2UoKSkgLSBnZXRJbmRleChhLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW9kdWxlKHtcclxuICAgIG5hbWU6IFwic29ydGVyXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgIGFsbDoge1xyXG4gICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHBhcnNlcjogJ2ludGVsbGlnZW50J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0aWFsOiBbMCwgJ2FzYyddLFxyXG4gICAgICAgIGVuYWJsZU11bHRpc29ydDogdHJ1ZSxcclxuICAgICAgICBjdXN0b21QYXJzZXJzOiB7fVxyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIGxldCBzb3J0ZXJJbnN0YW5jZSA9IG5ldyBTb3J0ZXIodGhpcywgc2V0dGluZ3MpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNvcnRBc2M6IGZ1bmN0aW9uKGkpIHtcclxuICAgICAgICAgICAgICAgIHNvcnRlckluc3RhbmNlXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldEluZGV4KGkpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldE9yZGVyQXNjKClcclxuICAgICAgICAgICAgICAgICAgICAuc29ydCgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbmRlcigpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbmRlclNvcnRpbmdBcnJvd3MoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc29ydERlc2M6IGZ1bmN0aW9uKGkpIHtcclxuICAgICAgICAgICAgICAgIHNvcnRlckluc3RhbmNlXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldEluZGV4KGkpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNldE9yZGVyQXNjKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zb3J0KClcclxuICAgICAgICAgICAgICAgICAgICAucmVuZGVyKClcclxuICAgICAgICAgICAgICAgICAgICAucmVuZGVyU29ydGluZ0Fycm93cygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbmZvOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNvcnRlckluc3RhbmNlLmdldEluZGljZXMoKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzb3J0ZXJJbnN0YW5jZS5nZXRPcmRlcnMoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KTtcclxuIiwiY29uc3Qge2FkZENsYXNzLCBleHRlbmQsIGluZm8sIGVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcbmNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcbi8qXHJcblxyXG4gICAgREVQUkVDQVRFRCwgY2FuIGJlIHJlYWxpemVkIHZpYSBDU1MsIHNlZSBkZWZhdWx0IHRoZW1lXHJcblxyXG4qL1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gICAgbmFtZTogXCJ6ZWJyYVwiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgZXZlbjonI2YwZjBmMCcsXHJcbiAgICAgICAgb2RkOid3aGl0ZSdcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplcjogZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAvLyB0aGlzIDo9IFRhYmxlbW9kaWZ5LWluc3RhbmNlXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5jb250YWluZXIsICd0bS16ZWJyYScpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRlZmF1bHRzID0ge2V2ZW46JyNmMGYwZjAnLCBvZGQ6J3doaXRlJ307XHJcbiAgICAgICAgICAgIGV4dGVuZChkZWZhdWx0cywgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRleHQgPSAndGFibGUnICsgdGhpcy5ib2R5U2VsZWN0b3IgKyAnIHRyOm50aC1vZi10eXBlKGV2ZW4pe2JhY2tncm91bmQtY29sb3I6JyArIHNldHRpbmdzLmV2ZW4gKyAnfSdcclxuICAgICAgICAgICAgICAgICAgICAgKyAndGFibGUnICsgdGhpcy5ib2R5U2VsZWN0b3IgKyAnIHRyOm50aC1vZi10eXBlKG9kZCkge2JhY2tncm91bmQtY29sb3I6JyArIHNldHRpbmdzLm9kZCArICd9JztcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmRTdHlsZXModGV4dCk7XHJcblxyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgemVicmEgbG9hZGVkJyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xyXG5jb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbW9kdWxlLmpzJyk7XHJcbmNvbnN0IHtlcnJvciwgd2FybiwgaXNOb25FbXB0eVN0cmluZywgZ2V0Q3NzLFxyXG4gICAgICAgaXRlcmF0ZSwgZXh0ZW5kLCBhZGRDbGFzcywgZ2V0VW5pcXVlSWQvKiwgd3JhcCovfSA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcclxuXHJcbmNsYXNzIFRhYmxlbW9kaWZ5IHtcclxuICAgIGNvbnN0cnVjdG9yKHNlbGVjdG9yLCBjb3JlU2V0dGluZ3MpIHtcclxuICAgICAgICB2YXIgY29udGFpbmVySWQsXHJcbiAgICAgICAgICAgIF90aGlzID0gdGhpcyxcclxuICAgICAgICAgICAgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyAvLyBtdXN0IGJlIGEgdGFibGVcclxuICAgICAgICBpZiAoIWJvZHkgfHwgYm9keS5ub2RlTmFtZSAhPT0gJ1RBQkxFJykge1xyXG4gICAgICAgICAgZXJyb3IoJ3RoZXJlIGlzIG5vIDx0YWJsZT4gd2l0aCBzZWxlY3RvciAnICsgc2VsZWN0b3IpO1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vdGhpcy5ib2R5ID0gYm9keTtcclxuICAgICAgICB0aGlzLmJvZHlTZWxlY3RvciA9IHNlbGVjdG9yO1xyXG4gICAgICAgIGxldCBvbGRCb2R5UGFyZW50ID0gYm9keS5wYXJlbnRFbGVtZW50O1xyXG5cclxuICAgICAgICBleHRlbmQoY29uZmlnLmNvcmVEZWZhdWx0cywgY29yZVNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgaWYgKGNvcmVTZXR0aW5ncy5jb250YWluZXJJZCAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb3JlU2V0dGluZ3MuY29udGFpbmVySWQpKSB7XHJcbiAgICAgICAgICAgIHRocm93ICd0aGUgcGFzc2VkIGlkICcgKyBjb3JlU2V0dGluZ3MuY29udGFpbmVySWQgKyAnIGlzIG5vdCB1bmlxdWUhJztcclxuICAgICAgICB9IGVsc2UgaWYgKGNvcmVTZXR0aW5ncy5jb250YWluZXJJZCkge1xyXG4gICAgICAgICAgICBjb250YWluZXJJZCA9IGNvcmVTZXR0aW5ncy5jb250YWluZXJJZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb250YWluZXJJZCA9IGdldFVuaXF1ZUlkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBib2R5Lm91dGVySFRNTCA9XHJcbiAgICAgICAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9J3RtLWNvbnRhaW5lcic+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdHlsZSBjbGFzcz0ndG0tY3VzdG9tLXN0eWxlJz48L3N0eWxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSd0bS1ib2R5LXdyYXAnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtib2R5Lm91dGVySFRNTH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBvbGRCb2R5UGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy50bS1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgYm9keSA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3RhYmxlJyk7IC8vIGltcG9ydGFudCEgcmVsb2FkIGJvZHkgdmFyaWFibGVcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5ID0gYm9keTtcclxuICAgICAgICB0aGlzLmJvZHlXcmFwID0gYm9keS5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuc3R5bGVzaGVldCA9IHRoaXMuYm9keVdyYXAucHJldmlvdXNFbGVtZW50U2libGluZztcclxuXHJcbiAgICAgICAgdGhpcy5vcmlnSGVhZCA9IGJvZHkudEhlYWQ7XHJcbiAgICAgICAgdGhpcy5vcmlnRm9vdCA9IGJvZHkudEZvb3Q7XHJcblxyXG4gICAgICAgIC8vIGFkZCBvcHRpb25hbCBpZCB0byBjb250YWluZXJcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5pZCA9IGNvbnRhaW5lcklkO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVySWQgID0gY29udGFpbmVySWQ7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGVtZSBjbGFzcyB0byBjb250YWluZXJcclxuICAgICAgICBhZGRDbGFzcyh0aGlzLmNvbnRhaW5lciwgKCd0bS10aGVtZS0nICsgY29yZVNldHRpbmdzLnRoZW1lKSk7XHJcbiAgICAgICAgYWRkQ2xhc3MoYm9keSwgJ3RtLWJvZHknKTtcclxuXHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0Ym9keSByb3dzIGFzIDJELWFycmF5XHJcbiAgICAgICAgdGhpcy5yb3dzID0gW10uc2xpY2UuY2FsbCh0aGlzLmJvZHkudEJvZGllc1swXS5yb3dzKTtcclxuXHJcbiAgICAgICAgLy9EZWZhdWx0IHJlbmRlcmluZyBtb2RlOiBldmVyeXRoaW5nIGF0IG9uY2VcclxuICAgICAgICB0aGlzLnNldFJlbmRlcmluZ01vZGUoVGFibGVtb2RpZnkuUkVOREVSSU5HX01PREVfQVRfT05DRSk7XHJcbiAgICAgICAgdGhpcy5fY2h1bmtlZFJlbmRlcmluZ1RpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucm93Q2h1bmtTaXplID0gNTA7XHJcbiAgICAgICAgLy8gY2FsbCBhbGwgbW9kdWxlc1xyXG4gICAgICAgIGlmIChjb3JlU2V0dGluZ3MubW9kdWxlcykge1xyXG4gICAgICAgICAgICAvLyBpbnRlcmZhY2UgZm9yIG1vZHVsZXNcclxuICAgICAgICAgICAgaXRlcmF0ZShjb3JlU2V0dGluZ3MubW9kdWxlcywgZnVuY3Rpb24obW9kdWxlTmFtZSwgbW9kdWxlU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtb2R1bGUgPSBUYWJsZW1vZGlmeS5tb2R1bGVzW21vZHVsZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vZHVsZVJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmIChtb2R1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVSZXR1cm4gPSBtb2R1bGUuZ2V0TW9kdWxlKF90aGlzLCBtb2R1bGVTZXR0aW5ncyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHdhcm4oJ01vZHVsZScgKyBtb2R1bGVOYW1lICsgJyBub3QgcmVnaXN0ZXJlZCEnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVSZXR1cm4gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpc1ttb2R1bGVOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRlZmluZSByZXQgYXMgYSBwcm9wZXJ0eSBvZiB0aGUgVGFibGVtb2RpZnkgaW5zdGFuY2UuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdyB5b3UgY2FuIGFjY2VzcyBpdCBsYXRlciB2aWEgdG0ubW9kdWxlbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpc1ttb2R1bGVOYW1lXSA9IG1vZHVsZVJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcignbW9kdWxlIG5hbWUgJyArIG1vZHVsZU5hbWUgKyAnIGNhdXNlcyBhIGNvbGxpc2lvbiBhbmQgaXMgbm90IGFsbG93ZWQsIHBsZWFzZSBjaG9vc2UgYW5vdGhlciBvbmUhJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb3JlU2V0dGluZ3MgPSBjb3JlU2V0dGluZ3M7XHJcbiAgICB9XHJcbiAgICBhcHBlbmRTdHlsZXModGV4dCkge1xyXG4gICAgICAgIGlmICh0ZXh0LnRyaW0oKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0LnRyaW0oKSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFJvd3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93cztcclxuICAgIH1cclxuICAgIHNldFJvd3Mocm93QXJyYXkpIHtcclxuICAgICAgICAvL0lmIGNodW5rZWQgcmVuZGVyaW5nIGlzIHJ1bm5pbmcgYXQgdGhlIG1vbWVudCwgY2FuY2VsXHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9jaHVua2VkUmVuZGVyaW5nVGltZW91dCk7XHJcbiAgICAgICAgdGhpcy5yb3dzID0gcm93QXJyYXk7XHJcbiAgICAgICAgLy90aGlzLmJvZHkuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3RtUm93c0FkZGVkJykpO1xyXG4gICAgICAgIC8vdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGFkZFJvd3Mocm93QXJyYXkpIHtcclxuICAgICAgICAvL0lmIGNodW5rZWQgcmVuZGVyaW5nIGlzIHJ1bm5pbmcgYXQgdGhlIG1vbWVudCwgY2FuY2VsXHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9jaHVua2VkUmVuZGVyaW5nVGltZW91dCk7XHJcbiAgICAgICAgW10ucHVzaC5hcHBseSh0aGlzLnJvd3MsIHJvd3NBcnJheSk7XHJcbiAgICAgICAgLy90aGlzLmJvZHkuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3RtUm93c0FkZGVkJykpO1xyXG4gICAgICAgIC8vdGhpcy5yZW5kZXIoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldFJlbmRlcmluZ01vZGUodG8pIHtcclxuICAgICAgICBpZih0byAhPT0gVGFibGVtb2RpZnkuUkVOREVSSU5HX01PREVfQ0hVTktFRCAmJiB0byAhPT0gVGFibGVtb2RpZnkuUkVOREVSSU5HX01PREVfQVRfT05DRSkge1xyXG4gICAgICAgICAgIGxldCBtc2cgPSBcIlRyaWVkIHRvIHNldCB1bmtub3duIHJlbmRlcmluZyBtb2RlXCI7XHJcbiAgICAgICAgICAgd2Fybihtc2cpO1xyXG4gICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xyXG4gICAgICAgfVxyXG4gICAgICAgaWYodG8gPT09IFRhYmxlbW9kaWZ5LlJFTkRFUklOR19NT0RFX0NIVU5LRUQgJiYgZ2V0Q3NzKHRoaXMuYm9keSwgJ3RhYmxlLWxheW91dCcpICE9PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgd2FybihcIlVzaW5nIGNodW5rZWQgcmVuZGVyaW5nIHdpdGggbm9uLWZpeGVkIHRhYmxlIGxheW91dCBpcyBkaXNjb3VyYWdlZCFcIik7XHJcbiAgICAgICB9XHJcbiAgICAgICB0aGlzLnJlbmRlcmluZ01vZGUgPSB0bztcclxuICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICAgIGxldCB0Qm9keSA9IHRoaXMuYm9keS50Qm9kaWVzWzBdLFxyXG4gICAgICAgICAgICByb3dzID0gdGhpcy5nZXRSb3dzKCksXHJcbiAgICAgICAgICAgIGwgPSByb3dzLmxlbmd0aDtcclxuICAgICAgICB0Qm9keS5pbm5lckhUTUwgPSAnJzsgICAgICAgLy8gY2xlYXIgdGFibGUgYm9keVxyXG5cclxuICAgICAgICBzd2l0Y2godGhpcy5yZW5kZXJpbmdNb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGFibGVtb2RpZnkuUkVOREVSSU5HX01PREVfQVRfT05DRTpcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdEJvZHkuYXBwZW5kQ2hpbGQocm93c1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3RtRml4ZWRGb3JjZVJlbmRlcmluZycpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFRhYmxlbW9kaWZ5LlJFTkRFUklOR19NT0RFX0NIVU5LRUQ6XHJcbiAgICAgICAgICAgICAgICBsZXQgY2h1bmtTaXplID0gdGhpcy5yb3dDaHVua1NpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyUGFydCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB6ID0gMDsgeiA8IGNodW5rU2l6ZTsgeisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGFydCArIHogPT09IGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm9keS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgndG1GaXhlZEZvcmNlUmVuZGVyaW5nJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRCb2R5LmFwcGVuZENoaWxkKHJvd3Nbc3RhcnQgKyB6XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gc3RhcnQgKyB6O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NodW5rZWRSZW5kZXJpbmdUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQocmVuZGVyUGFydCwgMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jaHVua2VkUmVuZGVyaW5nVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KHJlbmRlclBhcnQsIDApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGF0aWMgbWV0aG9kIGZvciBhZGRpbmcgdXNlci1kZWZpbmVkIG1vZHVsZXNcclxuICAgICAqIHRoaXMtdmFsdWUgaW4gYSBzdGF0aWMgbWV0aG9kIGlzIHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBpdHNlbGYgKGhlcmVcclxuICAgICAqIFRhYmxlbW9kaWZ5KVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYWRkTW9kdWxlKG1vZHVsZSwgbmFtZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgLy9DcmVhdGUgYSBuZXcgbW9kdWxlIGJhc2VkIG9uIHRoZSBnaXZlbiBuYW1lIGFuZCBpbml0aWFsaXplciBmdW5jdGlvblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRNb2R1bGUobmV3IE1vZHVsZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZXI6IG1vZHVsZVxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIC8vQ2hlY2sgaWYgaXQgaXMgYSBNb2R1bGUgaW5zdGFuY2VcclxuICAgICAgICAgICAgaWYgKG1vZHVsZSBpbnN0YW5jZW9mIE1vZHVsZSkge1xyXG4gICAgICAgICAgICAgICAgLy9pZiB0aGUgbW9kdWxlIGFscmVhZHkgZXhpc3RzLCB0aHJvd1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2R1bGVzW21vZHVsZS5uYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlcnJvck1zZyA9IFwiTW9kdWxlIFwiICsgbW9kdWxlLm5hbWUgKyBcIiBkb2VzIGFscmVhZHkgZXhpc3QhXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZXJyb3JNc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZXNbbW9kdWxlLm5hbWVdID0gbW9kdWxlO1xyXG4gICAgICAgICAgICAvL1RyZWF0IHRoZSBvYmplY3RzIGFzIHBhcmFtZXRlcnMgZm9yIG5ldyBtb2R1bGUgaW5zdGFuY2VcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vSWYgYSBuYW1lIGlzIGdpdmVuIGFzIHBhcmFtZXRlciwgb3ZlcnJpZGUgYSBuYW1lIGluIHRoZSBwYXJhbWV0ZXJzIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgaWYoaXNOb25FbXB0eVN0cmluZyhuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZS5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kdWxlKG5ldyBNb2R1bGUobW9kdWxlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuVGFibGVtb2RpZnkuUkVOREVSSU5HX01PREVfQ0hVTktFRCA9IDE7XHJcblRhYmxlbW9kaWZ5LlJFTkRFUklOR19NT0RFX0FUX09OQ0UgPSAyO1xyXG5UYWJsZW1vZGlmeS5tb2R1bGVzID0ge1xyXG4gICAgY29sdW1uU3R5bGVzOiByZXF1aXJlKCcuL21vZHVsZXMvY29sdW1uU3R5bGVzLmpzJyksXHJcbiAgICBmaWx0ZXI6IHJlcXVpcmUoJy4vbW9kdWxlcy9maWx0ZXIuanMnKSxcclxuICAgIGZpeGVkOiByZXF1aXJlKCcuL21vZHVsZXMvZml4ZWQuanMnKSxcclxuICAgIHNvcnRlcjogcmVxdWlyZSgnLi9tb2R1bGVzL3NvcnRlci5qcycpLFxyXG4gICAgemVicmE6IHJlcXVpcmUoJy4vbW9kdWxlcy96ZWJyYS5qcycpXHJcbn07XHJcblxyXG4vL1N0b3JlIHJlZmVyZW5jZSB0byB0aGUgbW9kdWxlIGNsYXNzIGZvciB1c2VyLWRlZmluZWQgbW9kdWxlc1xyXG5UYWJsZW1vZGlmeS5Nb2R1bGUgPSBNb2R1bGU7XHJcblxyXG4vL21ha2UgdGhlIFRhYmxlbW9kaWZ5IG9iamVjdCBhY2Nlc3NpYmxlIGdsb2JhbGx5XHJcbndpbmRvdy5UYWJsZW1vZGlmeSA9IFRhYmxlbW9kaWZ5O1xyXG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xyXG4vLyBjdXN0b20gY29uc29sZSBsb2dnaW5nIGZ1bmN0aW9uc1xyXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS5sb2coJ3RtLWxvZzogJyArIHRleHQpO1xyXG59XHJcbmV4cG9ydHMuaW5mbyA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS5pbmZvKCd0bS1pbmZvOiAnICsgdGV4dCk7XHJcbn1cclxuZXhwb3J0cy53YXJuID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgaWYoY29uZmlnLmRlYnVnKSBjb25zb2xlLndhcm4oJ3RtLXdhcm46ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLnRyYWNlID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgaWYoY29uZmlnLmRlYnVnKSBjb25zb2xlLnRyYWNlKCd0bS10cmFjZTogJyArIHRleHQpO1xyXG59XHJcbmV4cG9ydHMuZXJyb3IgPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICBpZihjb25maWcuZGVidWcpIGNvbnNvbGUuZXJyb3IoJ3RtLWVycm9yOiAnICsgdGV4dCk7XHJcbn1cclxuLy8gdXRpbHNcclxuZXhwb3J0cy5oYXNDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcclxuICAgIHJldHVybiBlbC5jbGFzc0xpc3QgPyBlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSA6IG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicpLnRlc3QoZWwuY2xhc3NOYW1lKTtcclxufVxyXG5leHBvcnRzLmFkZENsYXNzID0gZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSkge1xyXG4gICAgaWYgKGVsLmNsYXNzTGlzdCkgZWwuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgZWxzZSBpZiAoIWhhc0NsYXNzKGVsLCBjbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG4gICAgcmV0dXJuIGVsO1xyXG59XHJcbmV4cG9ydHMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKSB7XHJcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcbiAgICBlbHNlIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicsICdnJyksICcnKTtcclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLndyYXAgPSBmdW5jdGlvbihlbCwgd3JhcHBlcikge1xyXG4gICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgZWwpO1xyXG4gICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxufVxyXG4vKipcclxuICogRXh0ZW5kZWQgdmVyc2lvbiBvZiB0aGUgXCJleHRlbmRcIi1GdW5jdGlvbi4gU3VwcG9ydHMgbXVsdGlwbGUgc291cmNlcyxcclxuICogZXh0ZW5kcyBkZWVwIHJlY3Vyc2l2ZWx5LlxyXG4gKi9cclxuZXhwb3J0cy5leHRlbmQyID0gZnVuY3Rpb24gZXh0ZW5kMihkZXN0aW5hdGlvbiwgLi4uc291cmNlcykge1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgc291cmNlID0gc291cmNlc1tpXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgaWYoe30uaGFzT3duUHJvcGVydHkuY2FsbChkZXN0aW5hdGlvbiwga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHREZXN0ID0gdHlwZW9mIGRlc3RpbmF0aW9uW2tleV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdFNyYyA9IHR5cGVvZiBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmKHREZXN0ID09PSB0U3JjICYmICh0RGVzdCA9PT0gJ29iamVjdCcgfHwgdERlc3QgPT09ICdmdW5jdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kMihkZXN0aW5hdGlvbltrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5leHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZChkLCBzKSB7XHJcbiAgICBPYmplY3Qua2V5cyhkKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIGlmKCFzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgc1trZXldID0gZFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNba2V5XSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgLy8gcmVjdXJzaXZlIGRlZXAtZXh0ZW5kXHJcbiAgICAgICAgICAgIHNba2V5XSA9IGV4dGVuZChkW2tleV0sIHNba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHM7XHJcbn1cclxuZXhwb3J0cy5nZXRTY3JvbGxiYXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgdmFyIGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMTAwcHhcIjtcclxuICBvdXRlci5zdHlsZS5tc092ZXJmbG93U3R5bGUgPSBcInNjcm9sbGJhclwiOyAvLyBuZWVkZWQgZm9yIFdpbkpTIGFwcHNcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcclxuICB2YXIgd2lkdGhOb1Njcm9sbCA9IG91dGVyLm9mZnNldFdpZHRoO1xyXG4gIC8vIGZvcmNlIHNjcm9sbGJhcnNcclxuICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwic2Nyb2xsXCI7XHJcbiAgLy8gYWRkIGlubmVyZGl2XHJcblxyXG4gIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xyXG4gIHZhciB3aWR0aFdpdGhTY3JvbGwgPSBpbm5lci5vZmZzZXRXaWR0aDtcclxuICAvLyByZW1vdmUgZGl2c1xyXG4gIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xyXG4gIHJldHVybiB3aWR0aE5vU2Nyb2xsIC0gd2lkdGhXaXRoU2Nyb2xsO1xyXG59XHJcbmV4cG9ydHMuc2V0Q3NzID0gZnVuY3Rpb24oZWwsIHN0eWxlcykge1xyXG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gc3R5bGVzKSB7XHJcbiAgICAgICAgZWwuc3R5bGVbcHJvcGVydHldID0gc3R5bGVzW3Byb3BlcnR5XTtcclxuICAgIH1cclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLmdldENzcyA9IGZ1bmN0aW9uKGVsLCBzdHlsZSkgeyByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpW3N0eWxlXTt9XHJcbmV4cG9ydHMuaW5QeCA9IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIGMgKyAncHgnO31cclxuLy8gaXRlcmF0ZSBvdmVyIGEgc2V0IG9mIGVsZW1lbnRzIGFuZCBjYWxsIGZ1bmN0aW9uIGZvciBlYWNoIG9uZVxyXG5leHBvcnRzLml0ZXJhdGUgPSBmdW5jdGlvbihlbGVtcywgZnVuYykge1xyXG4gIGlmICh0eXBlb2YgZWxlbXMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZWxlbXMpLFxyXG4gICAgICAgICAgbCA9IGtleXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgLy8gcHJvcGVydHksIHZhbHVlXHJcbiAgICAgICAgICBmdW5jKGtleXNbaV0sIGVsZW1zW2tleXNbaV1dKTtcclxuICAgICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICAgIHZhciBsID0gZWxlbXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgLy8gdmFsdWUsIGluZGV4IEBUT0RPIHVtZHJlaGVuIGbDvHIga29uc2lzdGVueiwgYW4gYWxsZW4gc3RlbGxlbiBhbnBhc3NlbiAtPiBpbmRleCwgdmFsdWVcclxuICAgICAgICAgIGZ1bmMoZWxlbXNbaV0sIGkpO1xyXG4gICAgICB9XHJcbiAgfVxyXG59XHJcbi8qXHJcbmV4cG9ydHMuZ2V0VmFsdWVJbiA9IGZ1bmN0aW9uKGFyciwgaSkge1xyXG4gIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xyXG4gIGlmIChhcnIubGVuZ3RoID4gaSkge1xyXG4gICAgcmV0dXJuIGFycltpXTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGFyclthcnIubGVuZ3RoLTFdO1xyXG4gIH1cclxufVxyXG4qL1xyXG5leHBvcnRzLmdldFVuaXF1ZUlkID0gKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgdW5pcXVlID0gMDtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGlkID0gJ3RtLXVuaXF1ZS0nICsgdW5pcXVlO1xyXG4gICAgICAgIHVuaXF1ZSsrO1xyXG4gICAgICAgIHJldHVybiBpZDtcclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG5leHBvcnRzLmlzTm9uRW1wdHlTdHJpbmcgPSBmdW5jdGlvbihzdHIpIHtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RyID09PSBcInN0cmluZ1wiICYmIHN0ci50cmltKCkubGVuZ3RoID4gMDtcclxufVxyXG4iXX0=
