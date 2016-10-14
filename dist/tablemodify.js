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
            return this;
        }
    }, {
        key: 'addRows',
        value: function addRows(rowArray) {
            //If chunked rendering is running at the moment, cancel
            window.clearTimeout(this._chunkedRenderingTimeout);
            [].push.apply(this.rows, rowsArray);
            //this.body.dispatchEvent(new Event('tmRowsAdded'));
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
            tBody.innerHTML = '';

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

},{"./config.js":1}]},{},[8]);
