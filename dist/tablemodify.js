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

    // new version setters


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
        // new version getters

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

            this.tm.setRows(arr).render();
            return this;
        }
    }]);

    return Filter;
}();

;

var FilterDefault = function (_Filter) {
    _inherits(FilterDefault, _Filter);

    function FilterDefault(tm) {
        _classCallCheck(this, FilterDefault);

        var _this2 = _possibleConstructorReturn(this, (FilterDefault.__proto__ || Object.getPrototypeOf(FilterDefault)).call(this, tm));

        _this2.tHead = tm.head ? tm.head.tHead : tm.origHead;

        // create the toolbar row
        var num = _this2.tHead.firstElementChild.cells.length - 1;
        var row = document.createElement('tr');
        for (; num >= 0; num--) {
            row.appendChild(newCell());
        }
        addClass(row, 'tm-filter-row');

        // bind listeners
        var _this = _this2,
            timeout = void 0;
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
        row.onchange = function (e) {
            _this.run();
        };

        // insert toolbar row into tHead
        _this2.tHead.appendChild(row);
        return _this2;
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

            return this;
        }
    }]);

    return FilterDefault;
}(Filter);

// constructor for special filter template
/*
function FilterB() {
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
*/

module.exports = new Module({
    name: "filter",
    defaultSettings: {
        filterStyle: 'default'
    },
    initializer: function initializer(settings) {
        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-filter');

            switch (settings.filterStyle) {
                /*
                case 'special':
                    new FilterB();
                break;*/
                default:
                    new FilterDefault(this);
            }

            info('module filter loaded');
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
                    head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);
                    footWrap.scrollLeft = bodyWrap.scrollLeft;
                });
                footWrap.addEventListener('scroll', function () {
                    // works better than setting scrollLeft property
                    head.style.marginLeft = inPx(-1 * footWrap.scrollLeft);
                    bodyWrap.scrollLeft = footWrap.scrollLeft;
                });
            } else if (head && !foot) {

                bodyWrap.addEventListener('scroll', function () {
                    head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);
                });
            } else if (!head && foot) {

                footWrap.addEventListener('scroll', function () {
                    bodyWrap.scrollLeft = footWrap.scrollLeft;
                });
                bodyWrap.addEventListener('scroll', function () {
                    footWrap.scrollLeft = bodyWrap.scrollLeft;
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
        _classCallCheck(this, Sorter);

        //Set initial values
        extend2(this, {
            ready: true,
            headers: {},
            headCells: [],
            body: null,
            rows: [],
            indices: [Infinity],
            orders: [true]
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
            _this.parsers[name] = func;
        });

        // iterate over header cells
        iterate(this.headCells, function (i, cell) {

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
    }, {
        key: 'sort',
        value: function sort() {
            var i = this.getIndex(),
                o = this.getOrderAsc(),
                p = this.getParser(i);

            this.getRows().sort(function (a, b) {
                return p(getValue(a, i), getValue(b, i));
            });

            if (!o) this.reverse();

            return this;
        }
    }, {
        key: 'multiSort',
        value: function multiSort() {
            var _this = this,
                indices = this.indices,
                orders = this.orders,
                parsers = indices.map(function (i) {
                return _this.getParser(i);
            }),
                maxDeph = indices.length - 1;

            this.getRows().sort(function (a, b) {
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
    }, {
        key: 'reverse',
        value: function reverse() {
            var array = this.getRows(),
                left = null,
                right = null,
                length = array.length;
            for (left = 0; left < length / 2; left += 1) {
                right = length - 1 - left;
                var temporary = array[left];
                array[left] = array[right];
                array[right] = temporary;
            }
            this.setRows(array);
            return this;
        }
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
            this.multiSort().render().renderSortingArrows();

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
            this.rows = rowArray;
            //this.body.dispatchEvent(new Event('tmRowsAdded'));
            return this;
        }
    }, {
        key: 'addRows',
        value: function addRows(rowArray) {
            [].push.apply(this.rows, rowsArray);
            //this.body.dispatchEvent(new Event('tmRowsAdded'));
            return this;
        }
    }, {
        key: 'render',
        value: function render() {
            var tBody = this.body.tBodies[0],
                rows = this.getRows(),

            //l = rows.length,
            rowChunkSize = 50,
                start = 0;
            tBody.innerHTML = null;
            /*
            for (var i = 0; i < l; i++) {
                tBody.appendChild(rows[i]);
            }
            */

            var renderPart = function renderPart() {
                for (var z = 0; z < rowChunkSize; z++) {
                    if (start + z === l) return;
                    tBody.appendChild(rows[start + z]);
                }
                start = start + z;
                //console.log(start);
                window.setTimeout(renderPart, 0);
            };
            window.setTimeout(renderPart, 0);

            // @TODO am ende ausführen: this.body.dispatchEvent(new Event('tmFixedForceRendering'));
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

Tablemodify.modules = {
    sorter: require('./modules/sorter.js'),
    fixed: require('./modules/fixed.js'),
    columnStyles: require('./modules/columnStyles.js'),
    zebra: require('./modules/zebra.js'),
    filter: require('./modules/filter.js')
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGNvbmZpZy5qcyIsInNyY1xcbW9kdWxlc1xcY29sdW1uU3R5bGVzLmpzIiwic3JjXFxtb2R1bGVzXFxmaWx0ZXIuanMiLCJzcmNcXG1vZHVsZXNcXGZpeGVkLmpzIiwic3JjXFxtb2R1bGVzXFxtb2R1bGUuanMiLCJzcmNcXG1vZHVsZXNcXHNvcnRlci5qcyIsInNyY1xcbW9kdWxlc1xcemVicmEuanMiLCJzcmNcXHRhYmxlbW9kaWZ5LmpzIiwic3JjXFx1dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSxLQUFSLEdBQWdCLElBQWhCO0FBQ0EsUUFBUSxZQUFSLEdBQXVCO0FBQ25CLFdBQU87QUFEWSxDQUF2Qjs7Ozs7QUNEQSxJQUFNLFNBQVMsUUFBUSxhQUFSLENBQWY7O2VBQ3lDLFFBQVEsYUFBUixDOztJQUFsQyxRLFlBQUEsUTtJQUFVLE8sWUFBQSxPO0lBQVMsSSxZQUFBLEk7SUFBTSxLLFlBQUEsSzs7O0FBRWhDLE9BQU8sT0FBUCxHQUFpQixJQUFJLE1BQUosQ0FBVztBQUN4QixVQUFNLGNBRGtCO0FBRXhCLHFCQUFpQjtBQUNiLGFBQUs7QUFDRCwwQkFBYSxRQURaO0FBRUQsdUJBQVc7QUFGVjtBQURRLEtBRk87QUFReEIsaUJBQWEscUJBQVMsUUFBVCxFQUFtQjtBQUM1QixZQUFJO0FBQ0EscUJBQVMsS0FBSyxTQUFkLEVBQXlCLGtCQUF6Qjs7QUFFQSxnQkFBSSxjQUFjLEtBQUssV0FBdkI7O0FBRUE7QUFDQSxnQkFBSSxPQUFPLFNBQVMsV0FBVCxHQUF1QixnQkFBbEM7QUFDQSxvQkFBUSxTQUFTLEdBQWpCLEVBQXNCLFVBQVMsSUFBVCxFQUFlLEtBQWYsRUFBc0I7QUFDeEMsd0JBQVEs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QUNILFlBQUksSUFBSSxNQUFNLE1BQWQ7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEI7QUFDeEI7QUFDQSxpQkFBSyxNQUFNLENBQU4sQ0FBTCxFQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0YsQ0FmRDtBQWdCQTs7Ozs7Ozs7OztBQVVBLFFBQVEsV0FBUixHQUF1QixZQUFVO0FBQzdCLFFBQUksU0FBUyxDQUFiOztBQUVBLFdBQU8sWUFBVztBQUNkLFlBQUksS0FBSyxlQUFlLE1BQXhCO0FBQ0E7QUFDQSxlQUFPLEVBQVA7QUFDSCxLQUpEO0FBS0gsQ0FSc0IsRUFBdkI7O0FBVUEsUUFBUSxnQkFBUixHQUEyQixVQUFTLEdBQVQsRUFBYztBQUNyQyxXQUFPLE9BQU8sR0FBUCxLQUFlLFFBQWYsSUFBMkIsSUFBSSxJQUFKLEdBQVcsTUFBWCxHQUFvQixDQUF0RDtBQUNILENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cy5kZWJ1ZyA9IHRydWU7XHJcbmV4cG9ydHMuY29yZURlZmF1bHRzID0ge1xyXG4gICAgdGhlbWU6ICdkZWZhdWx0J1xyXG59O1xyXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5jb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIGluZm8sIGVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gICAgbmFtZTogXCJjb2x1bW5TdHlsZXNcIixcclxuICAgIGRlZmF1bHRTZXR0aW5nczoge1xyXG4gICAgICAgIGFsbDoge1xyXG4gICAgICAgICAgICAndGV4dC1hbGlnbic6J2NlbnRlcicsXHJcbiAgICAgICAgICAgICdwYWRkaW5nJzogJzNweCdcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZXI6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5jb250YWluZXIsICd0bS1jb2x1bW4tc3R5bGVzJyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29udGFpbmVySWQgPSB0aGlzLmNvbnRhaW5lcklkO1xyXG5cclxuICAgICAgICAgICAgLy8gc3R5bGUgZ2VuZXJhbFxyXG4gICAgICAgICAgICB2YXIgdGV4dCA9ICdkaXYjJyArIGNvbnRhaW5lcklkICsgJyB0YWJsZSB0ciA+ICp7JztcclxuICAgICAgICAgICAgaXRlcmF0ZShzZXR0aW5ncy5hbGwsIGZ1bmN0aW9uKHByb3AsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0ICs9IHByb3AgKyAnOicgKyB2YWx1ZSArICc7JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRleHQgKz0gJ30nO1xyXG5cclxuICAgICAgICAgICAgZGVsZXRlIHNldHRpbmdzLmFsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBjdXN0b20gc3R5bGVzIHRvIHRoZSBzaW5nbGUgY29sdW1uc1xyXG4gICAgICAgICAgICBpdGVyYXRlKHNldHRpbmdzLCBmdW5jdGlvbihpbmRleCwgY3NzU3R5bGVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaSA9IHBhcnNlSW50KGluZGV4KSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdGV4dCArPSAnZGl2IycgKyBjb250YWluZXJJZCArICcgdGFibGUgdHIgPiAqOm50aC1vZi10eXBlKCcgKyBpICsgJyl7JztcclxuICAgICAgICAgICAgICAgIGl0ZXJhdGUoY3NzU3R5bGVzLCBmdW5jdGlvbihwcm9wLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gcHJvcCArICc6JyArIHZhbHVlICsgJzsnO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0ZXh0ICs9ICd9JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kU3R5bGVzKHRleHQpO1xyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgY29sdW1uU3R5bGVzIGxvYWRlZCcpO1xyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIGluZm8sIGVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcbmNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcblxyXG5jb25zdCBuZXdDZWxsID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgbGV0IGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xyXG4gICAgY2VsbC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz0ndG0taW5wdXQtZGl2Jz48aW5wdXQgdHlwZT0ndGV4dCcgcGxhY2Vob2xkZXI9J3R5cGUgZmlsdGVyIGhlcmUnLz48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9J3RtLWN1c3RvbS1jaGVja2JveCcgdGl0bGU9J2Nhc2Utc2Vuc2l0aXZlJz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9J2NoZWNrYm94JyB2YWx1ZT0nMScgbmFtZT0nY2hlY2tib3gnIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9J2NoZWNrYm94Jz48L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+YDtcclxuXHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBjZWxsLmNsb25lTm9kZSh0cnVlKTtcclxuICAgIH1cclxufSgpKTtcclxuXHJcbmZ1bmN0aW9uIGdldENlbGwoZSkge1xyXG4gICAgbGV0IGNlbGwgPSBlLnRhcmdldDtcclxuICAgIHdoaWxlIChjZWxsLmNlbGxJbmRleCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY2VsbCA9IGNlbGwucGFyZW50Tm9kZTtcclxuICAgIH1cclxuICAgIHJldHVybiBjZWxsO1xyXG59XHJcblxyXG4vLyBwcm90b3R5cGUgZm9yIEZpbHRlclxyXG5jbGFzcyBGaWx0ZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHRtKSB7XHJcbiAgICAgICAgdGhpcy50bSA9IHRtO1xyXG4gICAgICAgIHRoaXMucm93cyA9IHRtLmdldFJvd3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbmRpY2VzID0gW107XHJcbiAgICAgICAgdGhpcy5wYXR0ZXJucyA9IFtdO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5ldyB2ZXJzaW9uIHNldHRlcnNcclxuICAgIHNldFBhdHRlcm5zKHBhdHRlcm5zKSB7XHJcbiAgICAgICAgdGhpcy5wYXR0ZXJucyA9IHBhdHRlcm5zO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgc2V0SW5kaWNlcyhpbmRpY2VzKSB7XHJcbiAgICAgICAgdGhpcy5pbmRpY2VzID0gaW5kaWNlcztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldE9wdGlvbnMob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvLyBuZXcgdmVyc2lvbiBnZXR0ZXJzXHJcbiAgICBnZXRQYXR0ZXJucygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXR0ZXJucztcclxuICAgIH1cclxuICAgIGdldEluZGljZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kaWNlcztcclxuICAgIH1cclxuICAgIGdldE9wdGlvbnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBmaWx0ZXIoKSB7XHJcbiAgICAgICAgbGV0IGluZGljZXMgPSB0aGlzLmdldEluZGljZXMoKSxcclxuICAgICAgICAgICAgcGF0dGVybnMgPSB0aGlzLmdldFBhdHRlcm5zKCksXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcclxuXHJcbiAgICAgICAgY29uc3QgbWF4RGVwaCA9IGluZGljZXMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgLy8gZmlsdGVyIHJvd3NcclxuICAgICAgICBsZXQgYXJyID0gdGhpcy5yb3dzLmZpbHRlcihmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgbGV0IGRlcGggPSAwLCBtYXRjaGVzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChtYXRjaGVzICYmIGRlcGggPD0gbWF4RGVwaCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGkgPSBpbmRpY2VzW2RlcGhdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhdHRlcm4gPSBwYXR0ZXJuc1tkZXBoXTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZXN0ZXIgPSByb3cuY2VsbHNbaV0uaW5uZXJIVE1MO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9uc1tkZXBoXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCBjYXNlLXNlbnNpdGl2ZVxyXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVzdGVyID0gdGVzdGVyLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHRlc3Rlci5pbmRleE9mKHBhdHRlcm4pICE9PSAtMTtcclxuICAgICAgICAgICAgICAgIGRlcGgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlcztcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudG0uc2V0Um93cyhhcnIpLnJlbmRlcigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59O1xyXG5cclxuY2xhc3MgRmlsdGVyRGVmYXVsdCBleHRlbmRzIEZpbHRlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0bSkge1xyXG4gICAgICAgIHN1cGVyKHRtKTtcclxuICAgICAgICB0aGlzLnRIZWFkID0gdG0uaGVhZCA/IHRtLmhlYWQudEhlYWQgOiB0bS5vcmlnSGVhZDtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIHRoZSB0b29sYmFyIHJvd1xyXG4gICAgICAgIGxldCBudW0gPSB0aGlzLnRIZWFkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgbGV0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgICAgZm9yICg7IG51bSA+PSAwOyBudW0tLSkge1xyXG4gICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQobmV3Q2VsbCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYWRkQ2xhc3Mocm93LCAndG0tZmlsdGVyLXJvdycpO1xyXG5cclxuICAgICAgICAvLyBiaW5kIGxpc3RlbmVyc1xyXG4gICAgICAgIGxldCBfdGhpcyA9IHRoaXMsIHRpbWVvdXQ7XHJcbiAgICAgICAgcm93Lm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5ydW4oKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm93Lm9uY2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSBnZXRDZWxsKGUpLFxyXG4gICAgICAgICAgICAgICAgICB0YXJnZXQgPSBlLnRhcmdldDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQubm9kZU5hbWUgPT0gJ1NQQU4nIHx8IHRhcmdldC5ub2RlTmFtZSA9PSAnTEFCRUwnKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVja2JveCBjbGlja1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrYm94ID0gY2VsbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9ICFjaGVja2JveC5jaGVja2VkO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMucnVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdJTlBVVCcpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByb3cub25jaGFuZ2UgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIF90aGlzLnJ1bigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaW5zZXJ0IHRvb2xiYXIgcm93IGludG8gdEhlYWRcclxuICAgICAgICB0aGlzLnRIZWFkLmFwcGVuZENoaWxkKHJvdyk7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuKCkge1xyXG4gICAgICAgIGNvbnN0IGlucHV0cyA9IFtdLnNsaWNlLmNhbGwodGhpcy50SGVhZC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPXRleHRdJykpO1xyXG4gICAgICAgIGNvbnN0IGNoZWNrYm94ZXMgPSBbXS5zbGljZS5jYWxsKHRoaXMudEhlYWQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1jaGVja2JveF0nKSk7XHJcblxyXG4gICAgICAgIGxldCBwYXR0ZXJucyA9IFtdLCBpbmRpY2VzID0gW10sIG9wdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgaXRlcmF0ZShpbnB1dHMsIGZ1bmN0aW9uKGksIGlucHV0KSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC52YWx1ZS50cmltKCkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goaSk7XHJcbiAgICAgICAgICAgICAgICBwYXR0ZXJucy5wdXNoKGlucHV0LnZhbHVlLnRyaW0oKSk7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2goY2hlY2tib3hlc1tpXS5jaGVja2VkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNldFBhdHRlcm5zKHBhdHRlcm5zKVxyXG4gICAgICAgICAgICAuc2V0SW5kaWNlcyhpbmRpY2VzKVxyXG4gICAgICAgICAgICAuc2V0T3B0aW9ucyhvcHRpb25zKVxyXG4gICAgICAgICAgICAuZmlsdGVyKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyBjb25zdHJ1Y3RvciBmb3Igc3BlY2lhbCBmaWx0ZXIgdGVtcGxhdGVcclxuLypcclxuZnVuY3Rpb24gRmlsdGVyQigpIHtcclxuICAgIHZhciBfdGhpcyA9IHRoaXMsIHRpbWVvdXQ7XHJcbiAgICAvLyBtb2RpZnkgRE9NXHJcbiAgICB2YXIgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgYWRkQ2xhc3Mod3JhcHBlciwgJ3RtLWZpbHRlci13cmFwJyk7XHJcbiAgICBjb3JlLmNvbnRhaW5lci5pbnNlcnRCZWZvcmUod3JhcHBlciwgY29yZS5ib2R5V3JhcCk7XHJcblxyXG4gICAgd3JhcHBlci5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSd0bS1maWx0ZXItbG9hZGVkJz4mbmJzcDs8L3NwYW4+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICsgXCI8c3BhbiBjbGFzcz0ndG0tZmlsdGVyLWFkZC1idXR0b24nPis8L3NwYW4+XCI7XHJcblxyXG4gICAgd3JhcHBlci5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcclxuXHJcbiAgICAgICAgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ3RtLWZpbHRlci1pbnN0YW5jZScpKSB7XHJcbiAgICAgICAgICAgIGlmIChoYXNDbGFzcyh0YXJnZXQsICd0bS1vcGVuJykpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNsb3NlIGl0XHJcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyh0YXJnZXQsICd0bS1vcGVuJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBvcGVuIGl0XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5taW5BbGwoKTtcclxuICAgICAgICAgICAgICAgIGFkZENsYXNzKHRhcmdldCwgJ3RtLW9wZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3ModGFyZ2V0LCAndG0tZmlsdGVyLWFkZC1idXR0b24nKSkge1xyXG4gICAgICAgICAgICBfdGhpcy5taW5BbGwoKTtcclxuICAgICAgICAgICAgX3RoaXMuYWRkRmlsdGVyKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQsICd0bS1jdXN0b20tY2hlY2tib3gnKSkge1xyXG4gICAgICAgICAgICB0YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQuY2hlY2tlZCA9ICF0YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQuY2hlY2tlZDtcclxuICAgICAgICAgICAgX3RoaXMucnVuKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChoYXNDbGFzcyh0YXJnZXQucGFyZW50Tm9kZSwgJ3RtLWN1c3RvbS1jaGVja2JveCcpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldC5wcmV2aW91c1NpYmxpbmcuY2hlY2tlZCA9ICF0YXJnZXQucHJldmlvdXNTaWJsaW5nLmNoZWNrZWQ7XHJcblxyXG4gICAgICAgICAgICBfdGhpcy5ydW4oKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzKHRhcmdldCwgJ3RtLWZpbHRlci13cmFwJykpIHtcclxuICAgICAgICAgICAgX3RoaXMubWluQWxsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHdyYXBwZXIub25jaGFuZ2UgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgX3RoaXMucnVuKCk7XHJcbiAgICB9XHJcbiAgICB3cmFwcGVyLm9ua2V5dXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVOYW1lID09PSAnSU5QVVQnKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5ydW4oKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hY3RpdmVGaWx0ZXJzID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKCcudG0tZmlsdGVyLWxvYWRlZCcpO1xyXG4gICAgdGhpcy5maWx0ZXJXcmFwID0gd3JhcHBlcjtcclxuICAgIHRoaXMucm93cyA9IGNvcmUuZ2V0Um93cygpO1xyXG5cclxuICAgIHRoaXMuYWRkRmlsdGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5ld0ZpbHRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBhZGRDbGFzcyhuZXdGaWx0ZXIsICd0bS1maWx0ZXItaW5zdGFuY2UnKTtcclxuICAgICAgICBhZGRDbGFzcyhuZXdGaWx0ZXIsICd0bS1vcGVuJyk7XHJcblxyXG4gICAgICAgIG5ld0ZpbHRlci5pbm5lckhUTUwgPSBcIjxzZWxlY3Q+PC9zZWxlY3Q+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCI8aW5wdXQgdHlwZT0ndGV4dCcgcGxhY2Vob2xkZXI9J3R5cGUgZmlsdGVyIGhlcmUnIC8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCI8c3BhbiBjbGFzcz0ndG0tY3VzdG9tLWNoZWNrYm94JyB0aXRsZT0nY2FzZS1zZW5zaXRpdmUnPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIjxpbnB1dCB0eXBlPSdjaGVja2JveCcgdmFsdWU9JzEnIG5hbWU9J2NoZWNrYm94JyAvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIjxsYWJlbCBmb3I9J2NoZWNrYm94Jz48L2xhYmVsPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIjwvc3Bhbj5cIjtcclxuXHJcbiAgICAgICAgLy8gYWRkIG9wdGlvbnMgdG8gc2VsZWN0IGZpZWxkXHJcbiAgICAgICAgdmFyIHNlbGVjdCA9IG5ld0ZpbHRlci5maXJzdEVsZW1lbnRDaGlsZDtcclxuXHJcbiAgICAgICAgaXRlcmF0ZShjb3JlLm9yaWdIZWFkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzLCBmdW5jdGlvbihpLCBjZWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuICAgICAgICAgICAgb3B0aW9uLnRleHQgPSBjZWxsLmlubmVySFRNTDtcclxuICAgICAgICAgICAgb3B0aW9uLnZhbHVlID0gaTtcclxuXHJcbiAgICAgICAgICAgIHNlbGVjdC5hZGQob3B0aW9uKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZGVmaW5lIGdldHRlcnNcclxuICAgICAgICBuZXdGaWx0ZXIuZ2V0SW5kZXggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGVjdCA9IHRoaXMuZmlyc3RFbGVtZW50Q2hpbGQ7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5ld0ZpbHRlci5nZXRQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuWzFdLnZhbHVlLnRyaW0oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV3RmlsdGVyLmdldE9wdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpLmNoZWNrZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFjdGl2ZUZpbHRlcnMuYXBwZW5kQ2hpbGQobmV3RmlsdGVyKTtcclxuICAgIH1cclxuICAgIHRoaXMubWluQWxsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaXRlcmF0ZSh0aGlzLmZpbHRlcldyYXAucXVlcnlTZWxlY3RvckFsbCgnLnRtLWZpbHRlci1pbnN0YW5jZS50bS1vcGVuJyksIGZ1bmN0aW9uKGksIGluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGluc3RhbmNlLCAndG0tb3BlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ydW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyBjb2xsZWN0IGFsbCBpbmZvcm1hdGlvblxyXG4gICAgICAgIHZhciBmaWx0ZXJzID0gW10uc2xpY2UuY2FsbCh0aGlzLmFjdGl2ZUZpbHRlcnMuY2hpbGRyZW4pLFxyXG4gICAgICAgICAgICBwYXR0ZXJucyA9IFtdLCBpbmRpY2VzID0gW10sIG9wdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgaXRlcmF0ZShmaWx0ZXJzLCBmdW5jdGlvbihpLCBmaWx0ZXJPYmopIHtcclxuICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGZpbHRlck9iai5nZXRJbmRleCgpKTtcclxuICAgICAgICAgICAgcGF0dGVybnMucHVzaChmaWx0ZXJPYmouZ2V0UGF0dGVybigpKTtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKGZpbHRlck9iai5nZXRPcHRpb24oKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SW5kaWNlcyhpbmRpY2VzKVxyXG4gICAgICAgICAgICAuc2V0UGF0dGVybnMocGF0dGVybnMpXHJcbiAgICAgICAgICAgIC5zZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKTtcclxuICAgIH1cclxuXHJcbn1cclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAgICBuYW1lOiBcImZpbHRlclwiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgZmlsdGVyU3R5bGU6ICdkZWZhdWx0J1xyXG4gICAgfSxcclxuICAgIGluaXRpYWxpemVyOiBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gICAgICAgIC8vIHRoaXMgOj0gVGFibGVtb2RpZnktaW5zdGFuY2VcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhZGRDbGFzcyh0aGlzLmNvbnRhaW5lciwgJ3RtLWZpbHRlcicpO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChzZXR0aW5ncy5maWx0ZXJTdHlsZSkge1xyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwZWNpYWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBGaWx0ZXJCKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhazsqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRmlsdGVyRGVmYXVsdCh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW5mbygnbW9kdWxlIGZpbHRlciBsb2FkZWQnKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGVycm9yKGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbiIsImNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcbmNvbnN0IHtpblB4LCBpdGVyYXRlLCBzZXRDc3MsIGFkZENsYXNzLFxyXG4gICAgICAgZ2V0Q3NzLCBnZXRTY3JvbGxiYXJXaWR0aCwgaW5mbywgZXJyb3J9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vZHVsZSh7XHJcbiAgICBuYW1lOiBcImZpeGVkXCIsXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHtcclxuICAgICAgICBmaXhIZWFkZXI6ZmFsc2UsXHJcbiAgICAgICAgZml4Rm9vdGVyOmZhbHNlXHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZXI6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgLy8gc2V0IHVwXHJcbiAgICAgICAgdmFyIGhlYWQsXHJcbiAgICAgICAgICAgIGZvb3QsXHJcbiAgICAgICAgICAgIGhlYWRXcmFwLFxyXG4gICAgICAgICAgICBmb290V3JhcCxcclxuICAgICAgICAgICAgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXHJcbiAgICAgICAgICAgIGJvZHkgPSB0aGlzLmJvZHksXHJcbiAgICAgICAgICAgIGJvZHlXcmFwID0gdGhpcy5ib2R5V3JhcCxcclxuICAgICAgICAgICAgb3JpZ0hlYWQgPSB0aGlzLm9yaWdIZWFkLFxyXG4gICAgICAgICAgICBvcmlnRm9vdCA9IHRoaXMub3JpZ0Zvb3Q7XHJcblxyXG4gICAgICAgIHZhciBnZXRIZWFkZXJIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG9yaWdIZWFkLmNsaWVudEhlaWdodDt9O1xyXG4gICAgICAgIHZhciBnZXRGb290ZXJIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG9yaWdGb290LmNsaWVudEhlaWdodDt9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW5kZXJIZWFkKCkge1xyXG4gICAgICAgICAgICBpZighaGVhZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB2YXIgYWxsTmV3ID0gW10uc2xpY2UuY2FsbChoZWFkLmZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkLmNlbGxzKSxcclxuICAgICAgICAgICAgICAgIGFsbE9sZCA9IFtdLnNsaWNlLmNhbGwob3JpZ0hlYWQuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMpO1xyXG4gICAgICAgICAgICBib2R5LnN0eWxlLm1hcmdpblRvcCA9IGluUHgoJy0nICsgZ2V0SGVhZGVySGVpZ2h0KCkpOyAvLyBpZiBoZWFkZXIgcmVzaXplcyBiZWNhdXNlIG9mIGEgdGV4dCB3cmFwXHJcblxyXG4gICAgICAgICAgICBpdGVyYXRlKGFsbE5ldywgZnVuY3Rpb24oaSwgbmV1KXtcclxuICAgICAgICAgICAgICAgIGxldCB3ID0gaW5QeChhbGxPbGRbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgbmV1LnN0eWxlLmNzc1RleHQgPSBgd2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4td2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6ICR7d31gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyRm9vdCgpIHtcclxuICAgICAgICAgICAgaWYgKCFmb290KSByZXR1cm47XHJcbiAgICAgICAgICAgIHZhciBhbGxOZXcgPSBbXS5zbGljZS5jYWxsKGZvb3QuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMpLFxyXG4gICAgICAgICAgICAgICAgYWxsT2xkID0gW10uc2xpY2UuY2FsbChvcmlnRm9vdC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscyk7XHJcblxyXG4gICAgICAgICAgICBib2R5V3JhcC5zdHlsZS5tYXJnaW5Cb3R0b20gPSBpblB4KCctJyArIChzY3JvbGxiYXJXaWR0aCArIGdldEZvb3RlckhlaWdodCgpICsgMSkpOyAvLyBpZiBmb290ZXIgcmVzaXplcyBiZWNhdXNlIG9mIGEgdGV4dCB3cmFwXHJcblxyXG4gICAgICAgICAgICBpdGVyYXRlKGFsbE5ldywgZnVuY3Rpb24oaSwgbmV1KXtcclxuICAgICAgICAgICAgICAgIGxldCB3ID0gaW5QeChhbGxPbGRbaV0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgbmV1LnN0eWxlLmNzc1RleHQgPSBgd2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW4td2lkdGg6ICR7d307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6ICR7d31gO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3MoY29udGFpbmVyLCAndG0tZml4ZWQnKTtcclxuICAgICAgICAgICAgdmFyIGJvcmRlckNvbGxhcHNlID0gZ2V0Q3NzKGJvZHksICdib3JkZXItY29sbGFwc2UnKSxcclxuICAgICAgICAgICAgICAgIHNjcm9sbGJhcldpZHRoID0gZ2V0U2Nyb2xsYmFyV2lkdGgoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvcmlnSGVhZCAmJiBzZXR0aW5ncy5maXhIZWFkZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBoZWFkZXJIZWlnaHQgPSBnZXRIZWFkZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGhlYWQgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGhlYWRXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKG9yaWdIZWFkLmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICBoZWFkV3JhcC5hcHBlbmRDaGlsZChoZWFkKTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoaGVhZFdyYXAsIGJvZHlXcmFwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhoZWFkLCAgICAgJ3RtLWhlYWQnKTtcclxuICAgICAgICAgICAgICAgIGFkZENsYXNzKGhlYWRXcmFwLCAndG0taGVhZC13cmFwJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaGVhZC5zdHlsZS5ib3JkZXJDb2xsYXBzZSAgID0gYm9yZGVyQ29sbGFwc2U7XHJcbiAgICAgICAgICAgICAgICBvcmlnSGVhZC5zdHlsZS52aXNpYmlsaXR5ICAgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGJvZHkuc3R5bGUubWFyZ2luVG9wICAgICAgICA9IGluUHgoJy0nICsgaGVhZGVySGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGhlYWRXcmFwLnN0eWxlLm1hcmdpblJpZ2h0ICA9IGluUHgoc2Nyb2xsYmFyV2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcmlnRm9vdCAmJiBzZXR0aW5ncy5maXhGb290ZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmb290ZXJIZWlnaHQgPSBnZXRGb290ZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIGZvb3QgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgICAgICBmb290LmFwcGVuZENoaWxkKG9yaWdGb290LmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgICAgICAgICAgICBmb290V3JhcC5hcHBlbmRDaGlsZChmb290KTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb290V3JhcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoZm9vdCwgICAgICd0bS1mb290Jyk7XHJcbiAgICAgICAgICAgICAgICBhZGRDbGFzcyhmb290V3JhcCwgJ3RtLWZvb3Qtd3JhcCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFkZCBESVZzIHRvIG9yaWdGb290IGNlbGxzIHNvIGl0cyBoZWlnaHQgY2FuIGJlIHNldCB0byAwcHhcclxuICAgICAgICAgICAgICAgIGl0ZXJhdGUob3JpZ0Zvb3QuZmlyc3RFbGVtZW50Q2hpbGQuY2VsbHMsIGZ1bmN0aW9uKGksIGNlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLmlubmVySFRNTCA9ICc8ZGl2PicgKyBjZWxsLmlubmVySFRNTCArICc8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9vdC5zdHlsZS5ib3JkZXJDb2xsYXBzZSAgID0gYm9yZGVyQ29sbGFwc2U7XHJcbiAgICAgICAgICAgICAgICBvcmlnRm9vdC5zdHlsZS52aXNpYmlsaXR5ICAgPSAnaGlkZGVuJztcclxuICAgICAgICAgICAgICAgIGJvZHlXcmFwLnN0eWxlLm92ZXJmbG93WCAgICA9ICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuc3R5bGUubWFyZ2luQm90dG9tID0gaW5QeCgnLScgKyAoc2Nyb2xsYmFyV2lkdGggKyBmb290ZXJIZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgIGZvb3RXcmFwLnN0eWxlLm1hcmdpblJpZ2h0ICA9IGluUHgoc2Nyb2xsYmFyV2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICAgICAgICAgIGlmIChoZWFkKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVuZGVySGVhZCk7XHJcbiAgICAgICAgICAgICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RtRml4ZWRGb3JjZVJlbmRlcmluZycsIHJlbmRlckhlYWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZm9vdCkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlbmRlckZvb3QpO1xyXG4gICAgICAgICAgICAgICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCd0bUZpeGVkRm9yY2VSZW5kZXJpbmcnLCByZW5kZXJIZWFkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGhlYWQgJiYgZm9vdCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGJvZHlXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZC5zdHlsZS5tYXJnaW5MZWZ0ID0gaW5QeCgnLScgKyBib2R5V3JhcC5zY3JvbGxMZWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICBmb290V3JhcC5zY3JvbGxMZWZ0ID0gYm9keVdyYXAuc2Nyb2xsTGVmdDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9vdFdyYXAuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyB3b3JrcyBiZXR0ZXIgdGhhbiBzZXR0aW5nIHNjcm9sbExlZnQgcHJvcGVydHlcclxuICAgICAgICAgICAgICAgICAgICBoZWFkLnN0eWxlLm1hcmdpbkxlZnQgPSBpblB4KCgtMSkqZm9vdFdyYXAuc2Nyb2xsTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9keVdyYXAuc2Nyb2xsTGVmdCA9IGZvb3RXcmFwLnNjcm9sbExlZnQ7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGVhZCAmJiAhZm9vdCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGJvZHlXcmFwLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge2hlYWQuc3R5bGUubWFyZ2luTGVmdCA9IGluUHgoJy0nICsgYm9keVdyYXAuc2Nyb2xsTGVmdCk7fSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFoZWFkICYmIGZvb3QpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb290V3JhcC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbigpe2JvZHlXcmFwLnNjcm9sbExlZnQgPSBmb290V3JhcC5zY3JvbGxMZWZ0O30pO1xyXG4gICAgICAgICAgICAgICAgYm9keVdyYXAuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKXtmb290V3JhcC5zY3JvbGxMZWZ0ID0gYm9keVdyYXAuc2Nyb2xsTGVmdDt9KTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIC8vIG7DtnRpZywgd2VpbCBkZXIgQnJvd3NlciB6dW0gcmVuZGVybiBtYW5jaG1hbCBlaW5lIGdld2lzc2UgWmVpdCBicmF1Y2h0XHJcbiAgICAgICAgICAgICAgICByZW5kZXJIZWFkKCk7XHJcbiAgICAgICAgICAgICAgICByZW5kZXJGb290KCk7XHJcbiAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgLy8gbsO2dGlnLCB3ZWlsIGRlciBCcm93c2VyIHp1bSByZW5kZXJuIG1hbmNobWFsIGVpbmUgZ2V3aXNzZSBaZWl0IGJyYXVjaHRcclxuICAgICAgICAgICAgICAgIHJlbmRlckhlYWQoKTtcclxuICAgICAgICAgICAgICAgIHJlbmRlckZvb3QoKTtcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGVhZCA9IGhlYWQ7XHJcbiAgICAgICAgICAgIHRoaXMuZm9vdCA9IGZvb3Q7XHJcbiAgICAgICAgICAgIHRoaXMuaGVhZFdyYXAgPSBoZWFkV3JhcDtcclxuICAgICAgICAgICAgdGhpcy5mb290V3JhcCA9IGZvb3RXcmFwO1xyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgZml4ZWQgbG9hZGVkJyk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCB7ZXJyb3IsIGV4dGVuZDIsIGlzTm9uRW1wdHlTdHJpbmd9ID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuY29uc3QgZGVmYXVsdFBhcmFtcyA9IHsgICAgICAgICAgIC8vZGVmYXVsdC1uYW1lXHJcbiAgICBkZWZhdWx0U2V0dGluZ3M6IHt9LCAgICAgICAgICAgICAgICAvL1wiZGVmYXVsdFwiLWRlZmF1bHQtc2V0dGluZ3M6IGVtcHR5XHJcbiAgICBzZXR0aW5nc1ZhbGlkYXRvcjogKCkgPT4gbnVsbCwgICAgICAvL2RlZmF1bHQ6IGFjY2VwdCBhbGwgZ2l2ZW4gc2V0dGluZ3Mgb2JqZWN0c1xyXG4gICAgaW5pdGlhbGl6ZXI6ICgpID0+IG51bGwgICAgICAgICAgICAgLy9kZWZhdWx0OiBlbXB0eSBtb2R1bGVcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBzaW5nbGUgVGFibGVtb2RpZnkgbW9kdWxlLlxyXG4gKiBJdCBwcm92aWRlcyBhIHN0YW5kYXJkIGludGVyZmFjZSBmb3IgZGVmaW5pbmcgbW9kdWxlcywgdGFrZXMgY2FyZSBvZiBzZXR0aW5nc1xyXG4gKiB2YWxpZGF0aW9uLCBzZXR0aW5ncy1jb21wbGV0aW9uIHdpdGggZGVmYXVsdCBzZXR0aW5ncyBhbmQgY2FuIGJlIGV4dGVuZGVkIHdpdGhcclxuICogZnVydGhlciBmdW5jdGlvbmFsaXR5IChlLmcuIG1vZHVsZSBkZXBlbmRlbmNpZXMpXHJcbiAqXHJcbiAqIFVzYWdlOlxyXG4gKiBtb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gKiAgICAgbmFtZTogPHRoZSBtb2R1bGUncyBuYW1lPixcclxuICogICAgIGRlZmF1bHRTZXR0aW5nczogPHRoZSBtb2R1bGUncyBkZWZhdWx0IHNldHRpbmdzPixcclxuICogICAgIHNldHRpbmdzVmFsaWRhdG9yOiA8ZnVuY3Rpb24sIGNhbGxlZCB3aXRoIHRoZSBzZXR0aW5ncyBvYmplY3QgYW5kIHRocm93c1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpbnZhbGlkIHBhcmFtZXRlcnMgYXJlIGRldGVjdGVkPixcclxuICogICAgIGluaXRpYWxpemVyOiA8ZnVuY3Rpb24gd2hlcmUgdGhlIG1vZHVsZSBjb2RlIGl0c2VsZiByZXNpZGVzLCB3aWxsIGJlIGNhbGxlZFxyXG4gKiAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSBUYWJsZW1vZGlmeSBpbnN0YW5jZSBhcyB0aGlzLXZhbHVlIGFuZCB0aGUgcmV0dXJuXHJcbiAqICAgICAgICAgICAgICAgICAgIHZhbHVlIHdpbGwgYmUgc3RvcmVkIGluIHRtLWluc3RhbmNlLm1vZHVsZXMuPG1vZHVsZW5hbWU+XHJcbiAqIH0pO1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBNb2R1bGUge1xyXG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XHJcbiAgICAgICAgLy9JZiBubyBuYW1lIGlzIGdpdmVuLCB0aHJvd1xyXG4gICAgICAgIGlmKCFpc05vbkVtcHR5U3RyaW5nKHBhcmFtcy5uYW1lKSkge1xyXG4gICAgICAgICAgICBsZXQgZXJyb3JNc2cgPSBcIk5hbWUgbXVzdCBiZSBnaXZlbiBmb3IgbW9kdWxlIVwiO1xyXG4gICAgICAgICAgICBlcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY29tcGxldGUgcGFyYW1ldGVycyB3aXRoIGRlZmF1bHQgcGFyYW1ldGVyc1xyXG4gICAgICAgIGV4dGVuZDIocGFyYW1zLCBkZWZhdWx0UGFyYW1zKTtcclxuICAgICAgICAvL3NldCBwYXJhbWV0ZXJzIGFzIHByb3BlcnRpZXMgb2YgdGhpc1xyXG4gICAgICAgIGV4dGVuZDIodGhpcywgcGFyYW1zKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRG9lcyBub3RoaW5nIG1vcmUgdGhhbiBleHRlbmQgdGhlIGdpdmVuIHNldHRpbmdzIG9iamVjdCB3aXRoIHRoZSBkZWZhdWx0XHJcbiAgICAgKiBzZXR0aW5ncyBhbmQgY2FsbCB0aGUgc2V0dGluZ3NWYWxpZGF0b3IgZnVuY3Rpb24gb24gdGhlIHJlc3VsdGluZyBvYmplY3RcclxuICAgICAqL1xyXG4gICAgZ2V0U2V0dGluZ3Moc2V0dGluZ3MpIHtcclxuICAgICAgICBleHRlbmQyKHNldHRpbmdzLCB0aGlzLmRlZmF1bHRTZXR0aW5ncyk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc1ZhbGlkYXRvcihzZXR0aW5ncyk7XHJcbiAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgYnkgdGhlIFRhYmxlbW9kaWZ5IGluc3RhbmNlLiBDYWxscyB0aGUgaW5pdGlhbGl6ZXItZnVuY3Rpb24gd2l0aFxyXG4gICAgICogdGhlIFRhYmxlbW9kaWZ5IGluc3RhbmNlIGFzIHRoaXMtVmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0TW9kdWxlKHRhYmxlTW9kaWZ5LCBzZXR0aW5ncykge1xyXG4gICAgICAgIHNldHRpbmdzID0gdGhpcy5nZXRTZXR0aW5ncyhzZXR0aW5ncyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZXIuY2FsbCh0YWJsZU1vZGlmeSwgc2V0dGluZ3MsIHRoaXMpO1xyXG4gICAgfVxyXG59O1xyXG4iLCJjb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZS5qcycpO1xyXG5jb25zdCB7YWRkQ2xhc3MsIGl0ZXJhdGUsIHJlbW92ZUNsYXNzLCBlcnJvciwgZXh0ZW5kMn0gPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxuZnVuY3Rpb24gZ2V0VmFsdWUodHIsIGkpIHtyZXR1cm4gdHIuY2VsbHNbaV0uaW5uZXJIVE1MLnRyaW0oKTt9XHJcblxyXG5jbGFzcyBTb3J0ZXIge1xyXG4gICAgY29uc3RydWN0b3IodGFibGVNb2RpZnksIHNldHRpbmdzKSB7XHJcbiAgICAgICAgLy9TZXQgaW5pdGlhbCB2YWx1ZXNcclxuICAgICAgICBleHRlbmQyKHRoaXMsIHtcclxuICAgICAgICAgICAgcmVhZHk6IHRydWUsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHt9LFxyXG4gICAgICAgICAgICBoZWFkQ2VsbHM6IFtdLFxyXG4gICAgICAgICAgICBib2R5OiBudWxsLFxyXG4gICAgICAgICAgICByb3dzOiBbXSxcclxuICAgICAgICAgICAgaW5kaWNlczogW0luZmluaXR5XSxcclxuICAgICAgICAgICAgb3JkZXJzOiBbdHJ1ZV0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9TdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgdGFibGVtb2RpZnkgaW5zdGFuY2VcclxuICAgICAgICB0aGlzLnRtID0gdGFibGVNb2RpZnk7XHJcbiAgICAgICAgYWRkQ2xhc3ModGhpcy50bS5jb250YWluZXIsICd0bS1zb3J0ZXInKTtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICBpID0gc2V0dGluZ3MuaW5pdGlhbFswXSxcclxuICAgICAgICAgICAgb3JkZXIgPSBzZXR0aW5ncy5pbml0aWFsWzFdO1xyXG5cclxuICAgICAgICB0aGlzLmJvZHkgPSB0aGlzLnRtLmJvZHkudEJvZGllc1swXTtcclxuICAgICAgICAvL3RoaXMucm93cyA9IFtdLnNsaWNlLmNhbGwodGhpcy5ib2R5LnJvd3MpO1xyXG4gICAgICAgIHRoaXMuaGVhZGVycyA9IHNldHRpbmdzLmhlYWRlcnM7XHJcbiAgICAgICAgdGhpcy5oZWFkQ2VsbHMgPSB0aGlzLnRtLmhlYWQgPyBbXS5zbGljZS5jYWxsKHRoaXMudG0uaGVhZC5maXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscykgOiBbXS5zbGljZS5jYWxsKHRoaXMudG0uYm9keS50SGVhZC5maXJzdEVsZW1lbnRDaGlsZC5jZWxscyk7XHJcblxyXG4gICAgICAgIGl0ZXJhdGUoc2V0dGluZ3MuY3VzdG9tUGFyc2VycywgZnVuY3Rpb24obmFtZSwgZnVuYyl7XHJcbiAgICAgICAgICAgIF90aGlzLnBhcnNlcnNbbmFtZV0gPSBmdW5jO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBpdGVyYXRlIG92ZXIgaGVhZGVyIGNlbGxzXHJcbiAgICAgICAgaXRlcmF0ZSh0aGlzLmhlYWRDZWxscywgZnVuY3Rpb24oaSwgY2VsbCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKF90aGlzLmdldElzRW5hYmxlZChpKSkge1xyXG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoY2VsbCwgJ3NvcnRhYmxlJyk7XHJcbiAgICAgICAgICAgICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBzZXR0aW5ncy5lbmFibGVNdWx0aXNvcnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWFuYWdlTXVsdGkoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubWFuYWdlKGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8qXHJcbiAgICAgICAgaGVhZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyIGNlbGwgPSBlLnRhcmdldDtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gZS50YXJnZXQuY2VsbEluZGV4O1xyXG4gICAgICAgICAgICBpZiAoZS5zaGlmdEtleSAmJiBzZXR0aW5ncy5lbmFibGVNdWx0aXNvcnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNlbGwgaXMgYSBuZXcgc29ydGluZyBhcmd1bWVudFxyXG4gICAgICAgICAgICAgICAgX3RoaXMubWFuYWdlTXVsdGkoaW5kZXgsIGNlbGwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMubWFuYWdlKGluZGV4LCBjZWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICovXHJcbiAgICAgICAgLy8gdHJ5IHRvIHNvcnQgYnkgaW5pdGlhbCBzb3J0aW5nXHJcbiAgICAgICAgaWYgKCF0aGlzLmdldElzRW5hYmxlZChpKSkge1xyXG4gICAgICAgICAgICAvLyBub3QgZW5hYmxlZCwgY2hvb3NlIGFub3RoZXIgaW5pdGlhbCBzb3J0aW5nXHJcbiAgICAgICAgICAgIHZhciBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGkgPCB0aGlzLmhlYWRDZWxscy5sZW5ndGggJiYgIWluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRJc0VuYWJsZWQoaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hbmFnZShpKTtcclxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChvcmRlciA9PT0gJ2Rlc2MnKSB7XHJcbiAgICAgICAgICAgIC8vIGVuYWJsZWQsIHNvcnQgZGVzY1xyXG4gICAgICAgICAgICB0aGlzLnNldE9yZGVyQXNjKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLnNldEluZGV4KGkpXHJcbiAgICAgICAgICAgICAgICAuc29ydCgpXHJcbiAgICAgICAgICAgICAgICAucmVuZGVyKClcclxuICAgICAgICAgICAgICAgIC5yZW5kZXJTb3J0aW5nQXJyb3dzKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGVuYWJsZWQsIHNvcnQgYXNjXHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3JkZXJBc2MoKTtcclxuICAgICAgICAgICAgdGhpcy5tYW5hZ2UoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0Um93cyhyb3dBcnJheSkge1xyXG4gICAgICAgICAgICB0aGlzLnRtLnNldFJvd3Mocm93QXJyYXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHNldEluZGV4KGkpIHtcclxuICAgICAgICB0aGlzLmluZGljZXMgPSBbaV07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXRPcmRlckFzYyhib29sKSB7XHJcbiAgICAgICAgaWYgKGJvb2wgPT09IHVuZGVmaW5lZCkgYm9vbCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vcmRlcnMgPSBbYm9vbF07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBnZXRSb3dzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRtLmdldFJvd3MoKTtcclxuICAgIH1cclxuICAgIGdldFBhcnNlcihpKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmhlYWRlcnMuaGFzT3duUHJvcGVydHkoaSkgJiYgdGhpcy5oZWFkZXJzW2ldLmhhc093blByb3BlcnR5KCdwYXJzZXInKSkgPyB0aGlzLnBhcnNlcnNbdGhpcy5oZWFkZXJzW2ldLnBhcnNlcl0gOiB0aGlzLnBhcnNlcnNbdGhpcy5oZWFkZXJzLmFsbC5wYXJzZXJdO1xyXG4gICAgfVxyXG4gICAgZ2V0SXNFbmFibGVkKGkpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuaGVhZGVycy5oYXNPd25Qcm9wZXJ0eShpKSAmJiB0aGlzLmhlYWRlcnNbaV0uaGFzT3duUHJvcGVydHkoJ2VuYWJsZWQnKSkgPyB0aGlzLmhlYWRlcnNbaV0uZW5hYmxlZCA6IHRoaXMuaGVhZGVycy5hbGwuZW5hYmxlZDtcclxuICAgIH1cclxuICAgIGdldEluZGV4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmluZGljZXNbMF07XHJcbiAgICB9XHJcbiAgICBnZXRPcmRlckFzYygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcmRlcnNbMF07XHJcbiAgICB9XHJcbiAgICBzb3J0KCkge1xyXG4gICAgICAgIHZhciBpID0gdGhpcy5nZXRJbmRleCgpLFxyXG4gICAgICAgICAgICBvID0gdGhpcy5nZXRPcmRlckFzYygpLFxyXG4gICAgICAgICAgICBwID0gdGhpcy5nZXRQYXJzZXIoaSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0Um93cygpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gcChnZXRWYWx1ZShhLCBpKSwgZ2V0VmFsdWUoYiwgaSkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIW8pIHRoaXMucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIG11bHRpU29ydCgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICBpbmRpY2VzID0gdGhpcy5pbmRpY2VzLFxyXG4gICAgICAgICAgICBvcmRlcnMgPSB0aGlzLm9yZGVycyxcclxuICAgICAgICAgICAgcGFyc2VycyA9IGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHtyZXR1cm4gX3RoaXMuZ2V0UGFyc2VyKGkpO30pLFxyXG4gICAgICAgICAgICBtYXhEZXBoID0gaW5kaWNlcy5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICB0aGlzLmdldFJvd3MoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgdmFyIGNvbXBhcmF0b3IgPSAwLCBkZXBoID0gMDtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlIChjb21wYXJhdG9yID09PSAwICYmIGRlcGggPD0gbWF4RGVwaCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcEluZGV4ID0gaW5kaWNlc1tkZXBoXTtcclxuICAgICAgICAgICAgICAgIGNvbXBhcmF0b3IgPSBwYXJzZXJzW2RlcGhdKGdldFZhbHVlKGEsIHRtcEluZGV4KSwgZ2V0VmFsdWUoYiwgdG1wSW5kZXgpKTtcclxuICAgICAgICAgICAgICAgIGRlcGgrKztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGVwaC0tOyAvLyBkZWNyZW1lbnQgYWdhaW5cclxuICAgICAgICAgICAgLy8gaW52ZXJ0IHJlc3VsdCBpbiBjYXNlIG9yZGVyIG9mIHRoaXMgY29sdW1ucyBpcyBkZXNjZW5kaW5nXHJcbiAgICAgICAgICAgIHJldHVybiAob3JkZXJzW2RlcGhdIHx8IGRlcGggPiBtYXhEZXBoKSA/IGNvbXBhcmF0b3IgOiAoLTEpICogY29tcGFyYXRvcjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICByZXZlcnNlKCkge1xyXG4gICAgICAgIHZhciBhcnJheSA9IHRoaXMuZ2V0Um93cygpLFxyXG4gICAgICAgICAgICBsZWZ0ID0gbnVsbCxcclxuICAgICAgICAgICAgcmlnaHQgPSBudWxsLFxyXG4gICAgICAgICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XHJcbiAgICAgICAgZm9yIChsZWZ0ID0gMDsgbGVmdCA8IGxlbmd0aCAvIDI7IGxlZnQgKz0gMSkge1xyXG4gICAgICAgICAgICByaWdodCA9IGxlbmd0aCAtIDEgLSBsZWZ0O1xyXG4gICAgICAgICAgICB2YXIgdGVtcG9yYXJ5ID0gYXJyYXlbbGVmdF07XHJcbiAgICAgICAgICAgIGFycmF5W2xlZnRdID0gYXJyYXlbcmlnaHRdO1xyXG4gICAgICAgICAgICBhcnJheVtyaWdodF0gPSB0ZW1wb3Jhcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0Um93cyhhcnJheSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgdGhpcy50bS5yZW5kZXIoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICByZW5kZXJTb3J0aW5nQXJyb3dzKCkge1xyXG4gICAgICAgIC8vIHJlbW92ZSBjdXJyZW50IHNvcnRpbmcgY2xhc3Nlc1xyXG4gICAgICAgIGl0ZXJhdGUodGhpcy50bS5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLnNvcnQtdXAsIC5zb3J0LWRvd24nKSwgZnVuY3Rpb24oaSwgY2VsbCl7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGNlbGwsICdzb3J0LXVwJyk7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGNlbGwsICdzb3J0LWRvd24nKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMuaW5kaWNlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmIChsZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBsID0gbGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgZm9yICg7IGwgPj0gMDsgbC0tKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmluZGljZXNbbF07XHJcbiAgICAgICAgICAgICAgICB2YXIgYXNjID0gdGhpcy5vcmRlcnNbbF07XHJcbiAgICAgICAgICAgICAgICB2YXIgY2VsbCA9IHRoaXMuaGVhZENlbGxzW2luZGV4XTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYXNjKSB7IC8vIGFzY2VuZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzKGNlbGwsICdzb3J0LXVwJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBkZXNjZW5kaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkQ2xhc3MoY2VsbCwgJ3NvcnQtZG93bicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgbWFuYWdlKGkpIHtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnJlYWR5KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5nZXRJbmRleCgpID09PSBpKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldE9yZGVyQXNjKCF0aGlzLmdldE9yZGVyQXNjKCkpOyAgLy8gaW52ZXJ0aWVyZSBha3R1ZWxsZSBTb3J0aWVydW5nXHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRJc0VuYWJsZWQoaSkpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0T3JkZXJBc2MoKTsgICAgICAgICAgICAgICAgICAgICAvLyBzb3J0IGFzY2VuZGluZ1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SW5kZXgoaSlcclxuICAgICAgICAgICAgLnNvcnQoKVxyXG4gICAgICAgICAgICAucmVuZGVyKClcclxuICAgICAgICAgICAgLnJlbmRlclNvcnRpbmdBcnJvd3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBtYW5hZ2VNdWx0aShpKSB7XHJcbiAgICAgICAgLy8gYWRkIGkgdG8gdGhlIG11bHRpIGluZGljZXNcclxuICAgICAgICBpZiAoIXRoaXMucmVhZHkpIHJldHVybjtcclxuICAgICAgICB0aGlzLnJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBpbmRpY2VzID0gdGhpcy5pbmRpY2VzLFxyXG4gICAgICAgICAgICBleGlzdHMgPSBpbmRpY2VzLmluZGV4T2YoaSk7XHJcblxyXG4gICAgICAgIGlmIChleGlzdHMgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIC8vIGFkZCBuZXcgbXVsdGlzb3J0IGluZGV4XHJcbiAgICAgICAgICAgIHRoaXMuaW5kaWNlcy5wdXNoKGkpO1xyXG4gICAgICAgICAgICB0aGlzLm9yZGVycy5wdXNoKHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGludmVydFxyXG4gICAgICAgICAgICB0aGlzLm9yZGVyc1tleGlzdHNdID0gIXRoaXMub3JkZXJzW2V4aXN0c107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vdyBzb3J0XHJcbiAgICAgICAgdGhpcy5tdWx0aVNvcnQoKVxyXG4gICAgICAgICAgICAucmVuZGVyKClcclxuICAgICAgICAgICAgLnJlbmRlclNvcnRpbmdBcnJvd3MoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuU29ydGVyLnByb3RvdHlwZS5wYXJzZXJzID0ge1xyXG4gICAgc3RyaW5nOiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPiBiKSByZXR1cm4gMTtcclxuICAgICAgICBpZiAoYSA8IGIpIHJldHVybiAtMTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH0sXHJcbiAgICBudW1lcmljOiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgYSA9IHBhcnNlRmxvYXQoYSk7XHJcbiAgICAgICAgYiA9IHBhcnNlRmxvYXQoYik7XHJcbiAgICAgICAgcmV0dXJuIGEgLSBiO1xyXG4gICAgfSxcclxuICAgIGludGVsbGlnZW50OiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgdmFyIGlzTnVtZXJpY0EgPSAhaXNOYU4oYSksXHJcbiAgICAgICAgICAgIGlzTnVtZXJpY0IgPSAhaXNOYU4oYik7XHJcblxyXG4gICAgICAgIGlmIChpc051bWVyaWNBICYmIGlzTnVtZXJpY0IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYSkgLSBwYXJzZUZsb2F0KGIpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljQSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpc051bWVyaWNCKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChhID4gYikgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIGlmIChhIDwgYikgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAgICBwYXJzZXMgdGhlc2UgRGF0ZSBGb3JtYXRzOlxyXG4gICAgICAgICBkLm1tLllZWVlcclxuICAgICAgICAgIGQubS5ZWVlZXHJcbiAgICAgICAgIGRkLm0uWVlZWVxyXG4gICAgICAgIGRkLm1tLllZWVlcclxuICAgICovXHJcbiAgICBnZXJtYW5EYXRlOiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICB2YXIgZGF0ZUEgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgZGF0ZUIgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgcGFydHNBID0gYS5zcGxpdCgnLicpLFxyXG4gICAgICAgICAgICAgICAgcGFydHNCID0gYi5zcGxpdCgnLicpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcnRzQS5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgIGRhdGVBID0gbmV3IERhdGUocGFyc2VJbnQocGFydHNBWzJdKSwgcGFyc2VJbnQocGFydHNBWzFdKSwgcGFyc2VJbnQocGFydHNBWzBdKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFydHNBLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgZGF0ZUEgPSBuZXcgRGF0ZShwYXJzZUludChwYXJ0c0FbMV0pLCBwYXJzZUludChwYXJ0c0FbMF0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHBhcnRzQi5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgIGRhdGVCID0gbmV3IERhdGUocGFyc2VJbnQocGFydHNCWzJdKSwgcGFyc2VJbnQocGFydHNCWzFdKSwgcGFyc2VJbnQocGFydHNCWzBdKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFydHNCLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgZGF0ZUIgPSBuZXcgRGF0ZShwYXJzZUludChwYXJ0c0JbMV0pLCBwYXJzZUludChwYXJ0c0JbMF0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGVBID4gZGF0ZUIpIHJldHVybiAxO1xyXG4gICAgICAgICAgICBpZiAoZGF0ZUEgPCBkYXRlQikgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgZXJyb3IoZSk7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAgICBOT1QgSU1QTEVNRU5URUQgWUVUXHJcbiAgICAgICAgQFRPRE8gaW1wbGVtZW50XHJcbiAgICAqL1xyXG4gICAgYW1lcmljYW5EYXRlOiBmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZWxsaWdlbnQoYSwgYik7XHJcbiAgICB9LFxyXG4gICAgLypcclxuICAgICAgICBnZXJtYW4gZGF5cyBvZiB0aGUgd2Vla1xyXG4gICAgKi9cclxuICAgIGRheXNPZlRoZVdlZWs6IGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICBmdW5jdGlvbiBnZXRJbmRleChzdHIpIHtcclxuICAgICAgICAgICAgdmFyIGkgPSAtMSwgbCA9IGRheXMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgd2hpbGUgKGwgPiAtMSAmJiBpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaSA9IGRheXNbbF0uaW5kZXhPZihzdHIpO1xyXG4gICAgICAgICAgICAgICAgbC0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGRheXMgPSBbXHJcbiAgICAgICAgICAgIC8vIGdlcm1hblxyXG4gICAgICAgICAgICBbJ21vJywgJ2RpJywgJ21pJywgJ2RvJywgJ2ZyJywgJ3NhJywgJ3NvJ10sXHJcbiAgICAgICAgICAgIFsnbW9udGFnJywgJ2RpZW5zdGFnJywgJ21pdHR3b2NoJywgJ2Rvbm5lcnN0YWcnLCAnZnJlaXRhZycsICdzYW1zdGFnJywgJ3Nvbm50YWcnXSxcclxuICAgICAgICAgICAgLy8gZW5nbGlzaFxyXG4gICAgICAgICAgICBbJ21vbicsICd0dWUnLCAnd2VkJywgJ3RodScsICdmcmknLCAnc2F0JywgJ3N1biddLFxyXG4gICAgICAgICAgICBbJ21vbmRheScsICd0dWVzZGF5JywgJ3dlZG5lc2RheScsICd0aHVyc2RheScsICdmcmlkYXknLCAnc2F0dXJkYXknLCAnc3VuZGF5J11cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICByZXR1cm4gZ2V0SW5kZXgoYi50b0xvd2VyQ2FzZSgpKSAtIGdldEluZGV4KGEudG9Mb3dlckNhc2UoKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gICAgbmFtZTogXCJzb3J0ZXJcIixcclxuICAgIGRlZmF1bHRTZXR0aW5nczoge1xyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgYWxsOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyOiAnaW50ZWxsaWdlbnQnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXRpYWw6IFswLCAnYXNjJ10sXHJcbiAgICAgICAgZW5hYmxlTXVsdGlzb3J0OiB0cnVlLFxyXG4gICAgICAgIGN1c3RvbVBhcnNlcnM6IHt9XHJcbiAgICB9LFxyXG4gICAgaW5pdGlhbGl6ZXI6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICAgICAgbGV0IHNvcnRlckluc3RhbmNlID0gbmV3IFNvcnRlcih0aGlzLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc29ydEFzYzogZnVuY3Rpb24oaSkge1xyXG4gICAgICAgICAgICAgICAgc29ydGVySW5zdGFuY2VcclxuICAgICAgICAgICAgICAgICAgICAuc2V0SW5kZXgoaSlcclxuICAgICAgICAgICAgICAgICAgICAuc2V0T3JkZXJBc2MoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zb3J0KClcclxuICAgICAgICAgICAgICAgICAgICAucmVuZGVyKClcclxuICAgICAgICAgICAgICAgICAgICAucmVuZGVyU29ydGluZ0Fycm93cygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzb3J0RGVzYzogZnVuY3Rpb24oaSkge1xyXG4gICAgICAgICAgICAgICAgc29ydGVySW5zdGFuY2VcclxuICAgICAgICAgICAgICAgICAgICAuc2V0SW5kZXgoaSlcclxuICAgICAgICAgICAgICAgICAgICAuc2V0T3JkZXJBc2MoZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgLnNvcnQoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZW5kZXIoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZW5kZXJTb3J0aW5nQXJyb3dzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KTtcclxuIiwiY29uc3Qge2FkZENsYXNzLCBleHRlbmQsIGluZm8sIGVycm9yfSA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcbmNvbnN0IE1vZHVsZSA9IHJlcXVpcmUoJy4vbW9kdWxlLmpzJyk7XHJcbi8qXHJcblxyXG4gICAgREVQUkVDQVRFRCwgY2FuIGJlIHJlYWxpemVkIHZpYSBDU1MsIHNlZSBkZWZhdWx0IHRoZW1lXHJcblxyXG4qL1xyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb2R1bGUoe1xyXG4gICAgbmFtZTogXCJ6ZWJyYVwiLFxyXG4gICAgZGVmYXVsdFNldHRpbmdzOiB7XHJcbiAgICAgICAgZXZlbjonI2YwZjBmMCcsXHJcbiAgICAgICAgb2RkOid3aGl0ZSdcclxuICAgIH0sXHJcbiAgICBpbml0aWFsaXplcjogZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgICAgICAvLyB0aGlzIDo9IFRhYmxlbW9kaWZ5LWluc3RhbmNlXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5jb250YWluZXIsICd0bS16ZWJyYScpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRlZmF1bHRzID0ge2V2ZW46JyNmMGYwZjAnLCBvZGQ6J3doaXRlJ307XHJcbiAgICAgICAgICAgIGV4dGVuZChkZWZhdWx0cywgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRleHQgPSAndGFibGUnICsgdGhpcy5ib2R5U2VsZWN0b3IgKyAnIHRyOm50aC1vZi10eXBlKGV2ZW4pe2JhY2tncm91bmQtY29sb3I6JyArIHNldHRpbmdzLmV2ZW4gKyAnfSdcclxuICAgICAgICAgICAgICAgICAgICAgKyAndGFibGUnICsgdGhpcy5ib2R5U2VsZWN0b3IgKyAnIHRyOm50aC1vZi10eXBlKG9kZCkge2JhY2tncm91bmQtY29sb3I6JyArIHNldHRpbmdzLm9kZCArICd9JztcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmRTdHlsZXModGV4dCk7XHJcblxyXG4gICAgICAgICAgICBpbmZvKCdtb2R1bGUgemVicmEgbG9hZGVkJyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBlcnJvcihlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xyXG5jb25zdCBNb2R1bGUgPSByZXF1aXJlKCcuL21vZHVsZXMvbW9kdWxlLmpzJyk7XHJcbmNvbnN0IHtlcnJvciwgd2FybiwgaXNOb25FbXB0eVN0cmluZyxcclxuICAgICAgIGl0ZXJhdGUsIGV4dGVuZCwgYWRkQ2xhc3MsIGdldFVuaXF1ZUlkLyosIHdyYXAqL30gPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XHJcblxyXG5jbGFzcyBUYWJsZW1vZGlmeSB7XHJcbiAgICBjb25zdHJ1Y3RvcihzZWxlY3RvciwgY29yZVNldHRpbmdzKSB7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lcklkLFxyXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXMsXHJcbiAgICAgICAgICAgIGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgLy8gbXVzdCBiZSBhIHRhYmxlXHJcbiAgICAgICAgaWYgKCFib2R5IHx8IGJvZHkubm9kZU5hbWUgIT09ICdUQUJMRScpe1xyXG4gICAgICAgICAgZXJyb3IoJ3RoZXJlIGlzIG5vIDx0YWJsZT4gd2l0aCBzZWxlY3RvciAnICsgc2VsZWN0b3IpO1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vdGhpcy5ib2R5ID0gYm9keTtcclxuICAgICAgICB0aGlzLmJvZHlTZWxlY3RvciA9IHNlbGVjdG9yO1xyXG4gICAgICAgIGxldCBvbGRCb2R5UGFyZW50ID0gYm9keS5wYXJlbnRFbGVtZW50O1xyXG5cclxuICAgICAgICBleHRlbmQoY29uZmlnLmNvcmVEZWZhdWx0cywgY29yZVNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgaWYgKGNvcmVTZXR0aW5ncy5jb250YWluZXJJZCAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb3JlU2V0dGluZ3MuY29udGFpbmVySWQpKSB7XHJcbiAgICAgICAgICAgIHRocm93ICd0aGUgcGFzc2VkIGlkICcgKyBjb3JlU2V0dGluZ3MuY29udGFpbmVySWQgKyAnIGlzIG5vdCB1bmlxdWUhJztcclxuICAgICAgICB9IGVsc2UgaWYgKGNvcmVTZXR0aW5ncy5jb250YWluZXJJZCkge1xyXG4gICAgICAgICAgICBjb250YWluZXJJZCA9IGNvcmVTZXR0aW5ncy5jb250YWluZXJJZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb250YWluZXJJZCA9IGdldFVuaXF1ZUlkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBib2R5Lm91dGVySFRNTCA9XHJcbiAgICAgICAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9J3RtLWNvbnRhaW5lcic+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdHlsZSBjbGFzcz0ndG0tY3VzdG9tLXN0eWxlJz48L3N0eWxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSd0bS1ib2R5LXdyYXAnPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtib2R5Lm91dGVySFRNTH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBvbGRCb2R5UGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy50bS1jb250YWluZXInKTtcclxuXHJcbiAgICAgICAgYm9keSA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3RhYmxlJyk7IC8vIGltcG9ydGFudCEgcmVsb2FkIGJvZHkgdmFyaWFibGVcclxuXHJcbiAgICAgICAgdGhpcy5ib2R5ID0gYm9keTtcclxuICAgICAgICB0aGlzLmJvZHlXcmFwID0gYm9keS5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuc3R5bGVzaGVldCA9IHRoaXMuYm9keVdyYXAucHJldmlvdXNFbGVtZW50U2libGluZztcclxuXHJcbiAgICAgICAgdGhpcy5vcmlnSGVhZCA9IGJvZHkudEhlYWQ7XHJcbiAgICAgICAgdGhpcy5vcmlnRm9vdCA9IGJvZHkudEZvb3Q7XHJcblxyXG4gICAgICAgIC8vIGFkZCBvcHRpb25hbCBpZCB0byBjb250YWluZXJcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5pZCA9IGNvbnRhaW5lcklkO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVySWQgID0gY29udGFpbmVySWQ7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGVtZSBjbGFzcyB0byBjb250YWluZXJcclxuICAgICAgICBhZGRDbGFzcyh0aGlzLmNvbnRhaW5lciwgKCd0bS10aGVtZS0nICsgY29yZVNldHRpbmdzLnRoZW1lKSk7XHJcbiAgICAgICAgYWRkQ2xhc3MoYm9keSwgJ3RtLWJvZHknKTtcclxuXHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSB0Ym9keSByb3dzIGFzIDJELWFycmF5XHJcbiAgICAgICAgdGhpcy5yb3dzID0gW10uc2xpY2UuY2FsbCh0aGlzLmJvZHkudEJvZGllc1swXS5yb3dzKTtcclxuXHJcbiAgICAgICAgLy8gY2FsbCBhbGwgbW9kdWxlc1xyXG4gICAgICAgIGlmIChjb3JlU2V0dGluZ3MubW9kdWxlcykge1xyXG4gICAgICAgICAgICAvLyBpbnRlcmZhY2UgZm9yIG1vZHVsZXNcclxuICAgICAgICAgICAgaXRlcmF0ZShjb3JlU2V0dGluZ3MubW9kdWxlcywgZnVuY3Rpb24obW9kdWxlTmFtZSwgbW9kdWxlU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtb2R1bGUgPSBUYWJsZW1vZGlmeS5tb2R1bGVzW21vZHVsZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vZHVsZVJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmKG1vZHVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZVJldHVybiA9IG1vZHVsZS5nZXRNb2R1bGUoX3RoaXMsIG1vZHVsZVNldHRpbmdzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2FybignTW9kdWxlJyArIG1vZHVsZU5hbWUgKyAnIG5vdCByZWdpc3RlcmVkIScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZVJldHVybiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzW21vZHVsZU5hbWVdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGVmaW5lIHJldCBhcyBhIHByb3BlcnR5IG9mIHRoZSBUYWJsZW1vZGlmeSBpbnN0YW5jZS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm93IHlvdSBjYW4gYWNjZXNzIGl0IGxhdGVyIHZpYSB0bS5tb2R1bGVuYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzW21vZHVsZU5hbWVdID0gbW9kdWxlUmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKCdtb2R1bGUgbmFtZSAnICsgbW9kdWxlTmFtZSArICcgY2F1c2VzIGEgY29sbGlzaW9uIGFuZCBpcyBub3QgYWxsb3dlZCwgcGxlYXNlIGNob29zZSBhbm90aGVyIG9uZSEnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb3JlU2V0dGluZ3MgPSBjb3JlU2V0dGluZ3M7XHJcbiAgICB9XHJcbiAgICBhcHBlbmRTdHlsZXModGV4dCkge1xyXG4gICAgICAgIGlmICh0ZXh0LnRyaW0oKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzaGVldC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0LnRyaW0oKSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFJvd3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm93cztcclxuICAgIH1cclxuICAgIHNldFJvd3Mocm93QXJyYXkpIHtcclxuICAgICAgICB0aGlzLnJvd3MgPSByb3dBcnJheTtcclxuICAgICAgICAvL3RoaXMuYm9keS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgndG1Sb3dzQWRkZWQnKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBhZGRSb3dzKHJvd0FycmF5KSB7XHJcbiAgICAgICAgW10ucHVzaC5hcHBseSh0aGlzLnJvd3MsIHJvd3NBcnJheSk7XHJcbiAgICAgICAgLy90aGlzLmJvZHkuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3RtUm93c0FkZGVkJykpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyKCkge1xyXG4gICAgICAgIGxldCB0Qm9keSA9IHRoaXMuYm9keS50Qm9kaWVzWzBdLFxyXG4gICAgICAgICAgICByb3dzID0gdGhpcy5nZXRSb3dzKCksXHJcbiAgICAgICAgICAgIC8vbCA9IHJvd3MubGVuZ3RoLFxyXG4gICAgICAgICAgICByb3dDaHVua1NpemUgPSA1MCxcclxuICAgICAgICAgICAgc3RhcnQgPSAwO1xyXG4gICAgICAgIHRCb2R5LmlubmVySFRNTCA9IG51bGw7XHJcbiAgICAgICAgLypcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICB0Qm9keS5hcHBlbmRDaGlsZChyb3dzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuXHJcbiAgICAgICAgY29uc3QgcmVuZGVyUGFydCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciB6ID0gMDsgeiA8IHJvd0NodW5rU2l6ZTsgeisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZihzdGFydCArIHogPT09IGwpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIHRCb2R5LmFwcGVuZENoaWxkKHJvd3Nbc3RhcnQgKyB6XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RhcnQgPSBzdGFydCArIHo7XHJcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coc3RhcnQpO1xyXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChyZW5kZXJQYXJ0LCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQocmVuZGVyUGFydCwgMCk7XHJcblxyXG4gICAgICAgIC8vIEBUT0RPIGFtIGVuZGUgYXVzZsO8aHJlbjogdGhpcy5ib2R5LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCd0bUZpeGVkRm9yY2VSZW5kZXJpbmcnKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFN0YXRpYyBtZXRob2QgZm9yIGFkZGluZyB1c2VyLWRlZmluZWQgbW9kdWxlc1xyXG4gICAgICogdGhpcy12YWx1ZSBpbiBhIHN0YXRpYyBtZXRob2QgaXMgdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGl0c2VsZiAoaGVyZVxyXG4gICAgICogVGFibGVtb2RpZnkpXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhZGRNb2R1bGUobW9kdWxlLCBuYW1lKSB7XHJcbiAgICAgICAgaWYodHlwZW9mIG1vZHVsZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIC8vQ3JlYXRlIGEgbmV3IG1vZHVsZSBiYXNlZCBvbiB0aGUgZ2l2ZW4gbmFtZSBhbmQgaW5pdGlhbGl6ZXIgZnVuY3Rpb25cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTW9kdWxlKG5ldyBNb2R1bGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVyOiBtb2R1bGVcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIC8vQ2hlY2sgaWYgaXQgaXMgYSBNb2R1bGUgaW5zdGFuY2VcclxuICAgICAgICAgICAgaWYobW9kdWxlIGluc3RhbmNlb2YgTW9kdWxlKSB7XHJcbiAgICAgICAgICAgICAgICAvL2lmIHRoZSBtb2R1bGUgYWxyZWFkeSBleGlzdHMsIHRocm93XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZHVsZXNbbW9kdWxlLm5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVycm9yTXNnID0gXCJNb2R1bGUgXCIgKyBtb2R1bGUubmFtZSArIFwiIGRvZXMgYWxyZWFkeSBleGlzdCFcIjtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcihlcnJvck1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlc1ttb2R1bGUubmFtZV0gPSBtb2R1bGU7XHJcbiAgICAgICAgICAgIC8vVHJlYXQgdGhlIG9iamVjdHMgYXMgcGFyYW1ldGVycyBmb3IgbmV3IG1vZHVsZSBpbnN0YW5jZVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9JZiBhIG5hbWUgaXMgZ2l2ZW4gYXMgcGFyYW1ldGVyLCBvdmVycmlkZSBhIG5hbWUgaW4gdGhlIHBhcmFtZXRlcnMgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICBpZihpc05vbkVtcHR5U3RyaW5nKG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRNb2R1bGUobmV3IE1vZHVsZShtb2R1bGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5UYWJsZW1vZGlmeS5tb2R1bGVzID0ge1xyXG4gICAgc29ydGVyOiByZXF1aXJlKCcuL21vZHVsZXMvc29ydGVyLmpzJyksXHJcbiAgICBmaXhlZDogcmVxdWlyZSgnLi9tb2R1bGVzL2ZpeGVkLmpzJyksXHJcbiAgICBjb2x1bW5TdHlsZXM6IHJlcXVpcmUoJy4vbW9kdWxlcy9jb2x1bW5TdHlsZXMuanMnKSxcclxuICAgIHplYnJhOiByZXF1aXJlKCcuL21vZHVsZXMvemVicmEuanMnKSxcclxuICAgIGZpbHRlcjogcmVxdWlyZSgnLi9tb2R1bGVzL2ZpbHRlci5qcycpXHJcbn07XHJcblxyXG4vL1N0b3JlIHJlZmVyZW5jZSB0byB0aGUgbW9kdWxlIGNsYXNzIGZvciB1c2VyLWRlZmluZWQgbW9kdWxlc1xyXG5UYWJsZW1vZGlmeS5Nb2R1bGUgPSBNb2R1bGU7XHJcblxyXG4vL21ha2UgdGhlIFRhYmxlbW9kaWZ5IG9iamVjdCBhY2Nlc3NpYmxlIGdsb2JhbGx5XHJcbndpbmRvdy5UYWJsZW1vZGlmeSA9IFRhYmxlbW9kaWZ5O1xyXG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xyXG4vLyBjdXN0b20gY29uc29sZSBsb2dnaW5nIGZ1bmN0aW9uc1xyXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS5sb2coJ3RtLWxvZzogJyArIHRleHQpO1xyXG59XHJcbmV4cG9ydHMuaW5mbyA9IGZ1bmN0aW9uKHRleHQpIHtcclxuICAgIGlmKGNvbmZpZy5kZWJ1ZykgY29uc29sZS5pbmZvKCd0bS1pbmZvOiAnICsgdGV4dCk7XHJcbn1cclxuZXhwb3J0cy53YXJuID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgaWYoY29uZmlnLmRlYnVnKSBjb25zb2xlLndhcm4oJ3RtLXdhcm46ICcgKyB0ZXh0KTtcclxufVxyXG5leHBvcnRzLnRyYWNlID0gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgaWYoY29uZmlnLmRlYnVnKSBjb25zb2xlLnRyYWNlKCd0bS10cmFjZTogJyArIHRleHQpO1xyXG59XHJcbmV4cG9ydHMuZXJyb3IgPSBmdW5jdGlvbih0ZXh0KSB7XHJcbiAgICBpZihjb25maWcuZGVidWcpIGNvbnNvbGUuZXJyb3IoJ3RtLWVycm9yOiAnICsgdGV4dCk7XHJcbn1cclxuLy8gdXRpbHNcclxuZXhwb3J0cy5oYXNDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcclxuICAgIHJldHVybiBlbC5jbGFzc0xpc3QgPyBlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSA6IG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicpLnRlc3QoZWwuY2xhc3NOYW1lKTtcclxufVxyXG5leHBvcnRzLmFkZENsYXNzID0gZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSkge1xyXG4gICAgaWYgKGVsLmNsYXNzTGlzdCkgZWwuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgZWxzZSBpZiAoIWhhc0NsYXNzKGVsLCBjbGFzc05hbWUpKSBlbC5jbGFzc05hbWUgKz0gJyAnICsgY2xhc3NOYW1lO1xyXG4gICAgcmV0dXJuIGVsO1xyXG59XHJcbmV4cG9ydHMucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKSB7XHJcbiAgICBpZiAoZWwuY2xhc3NMaXN0KSBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcbiAgICBlbHNlIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxiJysgY2xhc3NOYW1lKydcXFxcYicsICdnJyksICcnKTtcclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLndyYXAgPSBmdW5jdGlvbihlbCwgd3JhcHBlcikge1xyXG4gICAgZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcHBlciwgZWwpO1xyXG4gICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbCk7XHJcbiAgICByZXR1cm4gd3JhcHBlcjtcclxufVxyXG4vKipcclxuICogRXh0ZW5kZWQgdmVyc2lvbiBvZiB0aGUgXCJleHRlbmRcIi1GdW5jdGlvbi4gU3VwcG9ydHMgbXVsdGlwbGUgc291cmNlcyxcclxuICogZXh0ZW5kcyBkZWVwIHJlY3Vyc2l2ZWx5LlxyXG4gKi9cclxuZXhwb3J0cy5leHRlbmQyID0gZnVuY3Rpb24gZXh0ZW5kMihkZXN0aW5hdGlvbiwgLi4uc291cmNlcykge1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgc291cmNlID0gc291cmNlc1tpXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgaWYoe30uaGFzT3duUHJvcGVydHkuY2FsbChkZXN0aW5hdGlvbiwga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHREZXN0ID0gdHlwZW9mIGRlc3RpbmF0aW9uW2tleV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdFNyYyA9IHR5cGVvZiBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmKHREZXN0ID09PSB0U3JjICYmICh0RGVzdCA9PT0gJ29iamVjdCcgfHwgdERlc3QgPT09ICdmdW5jdGlvbicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kMihkZXN0aW5hdGlvbltrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcclxufVxyXG5leHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZChkLCBzKSB7XHJcbiAgICBPYmplY3Qua2V5cyhkKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIGlmKCFzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgc1trZXldID0gZFtrZXldO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNba2V5XSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgLy8gcmVjdXJzaXZlIGRlZXAtZXh0ZW5kXHJcbiAgICAgICAgICAgIHNba2V5XSA9IGV4dGVuZChkW2tleV0sIHNba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHM7XHJcbn1cclxuZXhwb3J0cy5nZXRTY3JvbGxiYXJXaWR0aCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgdmFyIGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBvdXRlci5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICBvdXRlci5zdHlsZS53aWR0aCA9IFwiMTAwcHhcIjtcclxuICBvdXRlci5zdHlsZS5tc092ZXJmbG93U3R5bGUgPSBcInNjcm9sbGJhclwiOyAvLyBuZWVkZWQgZm9yIFdpbkpTIGFwcHNcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG91dGVyKTtcclxuICB2YXIgd2lkdGhOb1Njcm9sbCA9IG91dGVyLm9mZnNldFdpZHRoO1xyXG4gIC8vIGZvcmNlIHNjcm9sbGJhcnNcclxuICBvdXRlci5zdHlsZS5vdmVyZmxvdyA9IFwic2Nyb2xsXCI7XHJcbiAgLy8gYWRkIGlubmVyZGl2XHJcblxyXG4gIGlubmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcbiAgb3V0ZXIuYXBwZW5kQ2hpbGQoaW5uZXIpO1xyXG4gIHZhciB3aWR0aFdpdGhTY3JvbGwgPSBpbm5lci5vZmZzZXRXaWR0aDtcclxuICAvLyByZW1vdmUgZGl2c1xyXG4gIG91dGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob3V0ZXIpO1xyXG4gIHJldHVybiB3aWR0aE5vU2Nyb2xsIC0gd2lkdGhXaXRoU2Nyb2xsO1xyXG59XHJcbmV4cG9ydHMuc2V0Q3NzID0gZnVuY3Rpb24oZWwsIHN0eWxlcykge1xyXG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gc3R5bGVzKSB7XHJcbiAgICAgICAgZWwuc3R5bGVbcHJvcGVydHldID0gc3R5bGVzW3Byb3BlcnR5XTtcclxuICAgIH1cclxuICAgIHJldHVybiBlbDtcclxufVxyXG5leHBvcnRzLmdldENzcyA9IGZ1bmN0aW9uKGVsLCBzdHlsZSkgeyByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpW3N0eWxlXTt9XHJcbmV4cG9ydHMuaW5QeCA9IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIGMgKyAncHgnO31cclxuLy8gaXRlcmF0ZSBvdmVyIGEgc2V0IG9mIGVsZW1lbnRzIGFuZCBjYWxsIGZ1bmN0aW9uIGZvciBlYWNoIG9uZVxyXG5leHBvcnRzLml0ZXJhdGUgPSBmdW5jdGlvbihlbGVtcywgZnVuYykge1xyXG4gIGlmICh0eXBlb2YgZWxlbXMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZWxlbXMpLFxyXG4gICAgICAgICAgbCA9IGtleXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgLy8gcHJvcGVydHksIHZhbHVlXHJcbiAgICAgICAgICBmdW5jKGtleXNbaV0sIGVsZW1zW2tleXNbaV1dKTtcclxuICAgICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICAgIHZhciBsID0gZWxlbXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgLy8gdmFsdWUsIGluZGV4IEBUT0RPIHVtZHJlaGVuIGbDvHIga29uc2lzdGVueiwgYW4gYWxsZW4gc3RlbGxlbiBhbnBhc3NlbiAtPiBpbmRleCwgdmFsdWVcclxuICAgICAgICAgIGZ1bmMoZWxlbXNbaV0sIGkpO1xyXG4gICAgICB9XHJcbiAgfVxyXG59XHJcbi8qXHJcbmV4cG9ydHMuZ2V0VmFsdWVJbiA9IGZ1bmN0aW9uKGFyciwgaSkge1xyXG4gIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xyXG4gIGlmIChhcnIubGVuZ3RoID4gaSkge1xyXG4gICAgcmV0dXJuIGFycltpXTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGFyclthcnIubGVuZ3RoLTFdO1xyXG4gIH1cclxufVxyXG4qL1xyXG5leHBvcnRzLmdldFVuaXF1ZUlkID0gKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgdW5pcXVlID0gMDtcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGlkID0gJ3RtLXVuaXF1ZS0nICsgdW5pcXVlO1xyXG4gICAgICAgIHVuaXF1ZSsrO1xyXG4gICAgICAgIHJldHVybiBpZDtcclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG5leHBvcnRzLmlzTm9uRW1wdHlTdHJpbmcgPSBmdW5jdGlvbihzdHIpIHtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RyID09PSBcInN0cmluZ1wiICYmIHN0ci50cmltKCkubGVuZ3RoID4gMDtcclxufVxyXG4iXX0=
