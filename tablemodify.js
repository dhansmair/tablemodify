/*
    Tablemodify v0.5

    written by David Hansmair

*/
var Tablemodify = (function(window, document) {

    // custom console logging functions
    function log(text) {if(Tablemodify.debug) console.log('tm-log: ' + text);}
    function info(text) {if(Tablemodify.debug) console.info('tm-info: ' + text);}
    function warn(text) {if(Tablemodify.debug) console.warn('tm-warn: ' + text);}
    function trace(text) {if(Tablemodify.debug) console.trace('tm-trace: ' + text);}
    function error(text) {if(Tablemodify.debug) console.error('tm-error: ' + text);}
    // utils
    function hasClass(el, className) {
        return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
    }
    function addClass(el, className) {
        if (el.classList) el.classList.add(className);
        else if (!hasClass(el, className)) el.className += ' ' + className;
        return el;
    }
    function removeClass(el, className) {
        if (el.classList) el.classList.remove(className);
        else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
        return el;
    }
    function wrap(el, wrapper) {
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
        return wrapper;
    }
    function extend(d, s) {
        Object.keys(d).forEach(function(key) {
            if(!s.hasOwnProperty(key)) s[key] = d[key];
            // recursive deep-extend
            if (typeof s[key] === 'object') {
                s[key] = extend(d[key], s[key]);
            }
        });

        return s;
    }
    function getScrollbarWidth() {
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
    function setCss(el, styles) {
        for (var property in styles) { el.style[property] = styles[property]; }
        return el;
    }
    function getCss(el, style) { return window.getComputedStyle(el, null)[style];}
    function inPx(c) { return c + 'px';}
    // iterate over a set of elements and call function for each one
    function iterate(elems, func) {
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
    function getValueIn(arr, i) {
      if (!Array.isArray(arr)) return arr;
      if (arr.length > i) {
        return arr[i];
      } else {
        return arr[arr.length-1];
      }
    }

    var coreDefaults = {};

    /*
        function that gives a unique id on each call.
        This is necessary because multiple containers are possible.
    */
    var getUniqueId = (function(){
        var unique = 0;

        return function() {
            var id = 'tm-unique-' + unique;
            unique++;
            return id;
        };
    }());

    /*
        CONSTRUCTOR
    */
    var Tablemodify = function(selector, coreSettings) {

        var containerId,
            _this = this,
            body = document.querySelector(selector); // must be a table
        if (!body || body.nodeName !== 'TABLE'){
          error('there is no <table> with selector ' + selector);
          return null;
        }
        this.body = body;
        this.bodySelector = selector;

        extend(coreDefaults, coreSettings);

        if (coreSettings.containerId && document.getElementById(coreSettings.containerId)) {
            throw 'the passed id ' + coreSettings.containerId + ' is not unique!';
        } else if (coreSettings.containerId) {
            containerId = coreSettings.containerId;
        } else {
            containerId = getUniqueId();
        }

        this.bodyWrap  = wrap(body, document.createElement('div'));
        this.container = wrap(this.bodyWrap, document.createElement('div'));
        this.origHead = body.tHead;
        this.origFoot = body.tFoot;
        // add css area
        this.stylesheet = document.createElement('style');
        this.container.insertBefore(this.stylesheet, this.container.firstElementChild);

        addClass(body, 'tm-body');
        addClass(this.bodyWrap,  'tm-body-wrap');
        addClass(this.container, 'tm-container');
        addClass(this.stylesheet, 'tm-custom-style');

        // add optional id to container
        this.container.id = containerId;
        this.containerId  = containerId;

        // initialize tbody rows as 2D-array
        this.rows = [].slice.call(this.body.tBodies[0].rows);

        // call all modules
        if (coreSettings.modules) {
            // interface for modules
            iterate(coreSettings.modules, function(moduleName, moduleSettings) {

                if (!Tablemodify.modules[moduleName]) {
                    warn('module ' + moduleName + ' not registered!');
                    return;
                }

                var ret = Tablemodify.modules[moduleName].call(_this, moduleSettings);

                if (ret !== undefined) {
                    if (_this[moduleName] === undefined) {
                        // define ret as a property of the Tablemodify instance.
                        // now you can access it later via tm.modulename
                        _this[moduleName] = ret;
                    } else {
                        error('module name ' + moduleName + ' causes a collision and is not allowed, please choose another one!');
                    }
                }
            });
        }

        this.coreSettings = coreSettings;
        return this; // chaining
    };

    Tablemodify.prototype = {
        rows: [],
        head: null,
        body: null,
        foot: null,

        headWrap: null,
        bodyWrap: null,
        footWrap: null,

        origHead: null,
        origFoot: null,

        bodySelector: null,
        containerId: null,

        stylesheet: null,
        coreSettings: null,

        // adding CSS text to the stylesheet of this instance
        appendStyles: function(text) {if (text.trim().length > 0) {this.stylesheet.appendChild(document.createTextNode(text.trim()));}},

        // row getters + setters
        getRows: function() {
            return this.rows;
        },
        setRows: function(rowArray) {
            this.rows = rowArray;
            return this;
        },
        addRows: function(rowArray) {
            [].push.apply(this.rows, rowsArray);
            return this;
        },
        render: function() {
            var tBody = this.body.tBodies[0],
                rows = this.getRows(),
                l = rows.length;

            tBody.innerHTML = '';

            for (var i = 0; i < l; i++) {
                tBody.appendChild(rows[i]);
            }
            return this;
        },

        version: 'v0.5'
    };

    Tablemodify.modules = {

        filter: function(settings) {
            // this := Tablemodify-instance
            try {
                addClass(this.container, 'tm-filter');

                var newCell = (function() {
                    var cell = document.createElement('td');
                    cell.innerHTML = "<div class='tm-filter-text'><input type='text' placeholder='type filter here'/></div>"
                                   + "<div class='tm-filter-options'><div>"
                                   + "<span><input type='checkbox' title='case-sensitive' /> case-sensitive</span>"
                                //   + "<input type='checkbox' title='whole word'/> whole word"
                                   + "<span>&#9881;</span>"
                                   + "</div></div></div>";

                    return function() {
                        return cell.cloneNode(true);
                    }
                }());

                function getCell(e) {
                    var cell = e.target;
                    while (cell.cellIndex === undefined) {
                        cell = cell.parentNode;
                    }
                    return cell;
                }

                var defaults = {};
                extend(defaults, settings);

                var core = this;

                // constructor
                function Filter() {
                    var _this = this, timeout;

                    // modify DOM
                    var tHead = core.head ? core.head.tHead : core.origHead,
                        num = tHead.firstElementChild.cells.length - 1,
                        row = document.createElement('tr');

                    for (; num >= 0; num--) {
                        row.appendChild(newCell());
                    }

                    row.onkeyup = function(e) {
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            var i = getCell(e).cellIndex;

                            _this.manage(i);
                        }, 500);
                    }
                    row.onclick = function(e) {
                        var i = getCell(e).cellIndex;

                        if (e.target.nodeName == 'SPAN' && e.target.firstElementChild.type == 'checkbox') {
                            e.target.firstElementChild.checked = !e.target.firstElementChild.checked;

                            _this.manage();
                        } else {
                            switch (e.target.type) {
                                case 'checkbox':
                                    _this.manage();

                                    break;
                                case 'text':
                                    e.target.select();

                                    break;
                            }
                        }
                    }

                    // append new row to tHead
                    tHead.appendChild(row);
                    this.tHead = tHead;
                    this.headCells = row.cells;
                    this.rows = core.getRows();
                }
                Filter.prototype = {
                    rows: [],
                    headCells: [],
                    tHead: null,
                    indices: [Infinity],
                    patterns: [],
                    options: [], // contains || matches || case-sensitive
                    /*
                    caseSensitive: [false],
                    setIndex: function(i) {
                        this.indices = [i];
                        return this;
                    },
                    setPattern: function(patterns) {
                        this.patterns = [patterns.trim()];
                        return this;
                    },
                    setOption: function(options) {
                        this.options = [options];

                        return this;
                    },
                    */
                    // new version setters
                    setPatterns: function(patterns) {
                        this.patterns = patterns;
                        return this;
                    },
                    setIndices: function(indices) {
                        this.indices = indices;
                        return this;
                    },
                    setOptions: function(options) {
                        this.options = options;
                        return this;
                    },
                    // new version getters
                    getPatterns: function() {
                        return this.patterns;
                    },
                    getIndices: function() {
                        return this.indices;
                    },
                    getOptions: function() {
                        return this.options;
                    },
                    /*
                    setCaseSensitive: function(bool) {
                        if (bool === undefined) bool = true;
                        this.caseSensitive = [bool];
                        return this;
                    },
                    getIndex: function(i) {
                        return i ? this.indices[i] : this.indices[0];
                    },
                    getPattern: function(i) {
                        return i ? this.patterns[i] : this.patterns[0];
                    },
                    getOption: function(i) {
                        return i ? this.options[i] : this.options[0];
                    },
                    getCaseSensitive: function() {
                        return this.caseSensitive[0];
                    },
                    */
                    filter: function() {
                        var indices = this.getIndices(),
                            patterns = this.getPatterns(),
                            options = this.getOptions();

                        var maxDeph = indices.length - 1;

                        // filter rows
                        var arr = this.rows.filter(function(row) {
                            var deph = 0, matches = true;

                            while (matches && deph <= maxDeph) {
                                var i = indices[deph];

                                if (options[deph]) {
                                    // case-sensitive
                                    var pattern = patterns[deph];
                                    var tester = row.cells[i].innerHTML;
                                } else {
                                    // not case-sensitive
                                    var pattern = patterns[deph].toLowerCase();
                                    var tester = row.cells[i].innerHTML.toLowerCase();
                                }

                                matches = tester.indexOf(pattern) !== -1;
                                deph++;
                            }
                            return matches;

                        });

                        core.setRows(arr).render();
                        return this;
                    },
                    manage: function() {
                        var inputs = [].slice.call(this.tHead.querySelectorAll('input[type=text]'));
                        var checkboxes = [].slice.call(this.tHead.querySelectorAll('input[type=checkbox]'));

                        var patterns = [], indices = [], options = [];

                        iterate(inputs, function(i, input) {
                            if (input.value.trim() !== '') {
                                indices.push(i);
                                patterns.push(input.value.trim());
                                options.push(checkboxes[i].checked);
                            }
                        });

                        this.setPatterns(patterns)
                            .setIndices(indices)
                            .setOptions(options)
                            .filter();

                        return this;
                    }
                };

                new Filter();
                info('module filter loaded');

                return {};
            } catch (e) {
                error(e);
            }
        },
        /*
            MODULE fixed: fixed header and/or footer
        */
        fixed: function(settings) {
            try {
                addClass(this.container, 'tm-fixed');

                function getHeaderHeight() { return origHead.clientHeight;};
                function getFooterHeight() { return origFoot.clientHeight;};
                function renderHead () {

                    var allNew = [].slice.call(head.firstElementChild.firstElementChild.cells),
                        allOld = [].slice.call(origHead.firstElementChild.cells);

                    body.style.marginTop = inPx('-' + getHeaderHeight()); // if header resizes because of a text wrap

                    iterate(allNew, function(i, neu){
                        var w = inPx(allOld[i].getBoundingClientRect().width);
                        setCss(neu, {
                            'width': w,
                            'min-width': w,
                            'max-width': w
                        });
                    });
                }
                function renderFoot() {
                    var allNew = [].slice.call(foot.firstElementChild.firstElementChild.cells),
                        allOld = [].slice.call(origFoot.firstElementChild.cells);

                    //bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + getFooterHeight() + 1)); // if footer resizes because of a text wrap

                    iterate(allNew, function(i, neu){
                        var w = inPx(allOld[i].getBoundingClientRect().width);
                        setCss(neu, {
                            'width': w,
                            'min-width': w,
                            'max-width': w
                        });
                    });
                }

                var defaults = {
                    fixHeader:false,
                    fixFooter:false
                };
                extend(defaults, settings);

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

                var borderCollapse = getCss(body, 'border-collapse'),
                    scrollbarWidth = getScrollbarWidth();

                if (origHead && settings.fixHeader) {
                    var headerHeight = getHeaderHeight();
                    head     = document.createElement('table');
                    headWrap = document.createElement('div');
                    head.appendChild(origHead.cloneNode(true));
                    headWrap.appendChild(head);
                    container.insertBefore(headWrap, bodyWrap);

                    addClass(head,     'tm-head');
                    addClass(headWrap, 'tm-head-wrap');

                    head.style.borderCollapse   = borderCollapse;
                    origHead.style.visibility   = 'hidden';
                    body.style.marginTop        = inPx('-' + headerHeight);
                    headWrap.style.marginRight  = inPx(scrollbarWidth);
                }
                if (origFoot && settings.fixFooter) {
                    //var footerHeight = getFooterHeight();
                    foot     = document.createElement('table');
                    footWrap = document.createElement('div');
                    foot.appendChild(origFoot.cloneNode(true));
                    footWrap.appendChild(foot);
                    container.appendChild(footWrap);

                    addClass(foot,     'tm-foot');
                    addClass(footWrap, 'tm-foot-wrap');

                    // add DIVs to origFoot cells so its height can be set to 0px
                    iterate(origFoot.firstElementChild.cells, function(i, cell) {
                        cell.innerHTML = '<div>' + cell.innerHTML + '</div>';
                    });

                    foot.style.borderCollapse   = borderCollapse;
                    origFoot.style.visibility   = 'hidden';
                    bodyWrap.style.overflowX    = 'scroll';
                    bodyWrap.style.marginBottom = inPx('-' + scrollbarWidth);
                    footWrap.style.marginRight  = inPx(scrollbarWidth);
                }

                // add event listeners
                if (head) window.addEventListener('resize', renderHead);
                if (foot) window.addEventListener('resize', renderFoot);

                if (head && foot) {

                    bodyWrap.addEventListener('scroll', function(){
                        head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);
                        footWrap.scrollLeft = bodyWrap.scrollLeft;
                    });
                    footWrap.addEventListener('scroll', function(){
                        // works better than setting scrollLeft property
                        head.style.marginLeft = inPx((-1)*footWrap.scrollLeft);
                        bodyWrap.scrollLeft = footWrap.scrollLeft;
                    });

                } else if (head && !foot) {

                    bodyWrap.addEventListener('scroll', function() {head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);});

                } else if (!head && foot) {

                    footWrap.addEventListener('scroll', function(){bodyWrap.scrollLeft = footWrap.scrollLeft;});
                    bodyWrap.addEventListener('scroll', function(){footWrap.scrollLeft = bodyWrap.scrollLeft;});

                }

                setTimeout(function(){
                    // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                    if (head) renderHead();
                    if (foot) renderFoot();
                }, 50);
                setTimeout(function(){
                    // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                    if (head) renderHead();
                    if (foot) renderFoot();
                }, 500);

                this.head = head;
                this.foot = foot;
                this.headWrap = headWrap;
                this.footWrap = footWrap;
                info('module fixed loaded');

                return function() {

                    return this; // chaining
                }

            } catch(e) {
                error(e);
            }
        },
        /*
            MODULE sorter
            @TODO parser implementieren
        */
        sorter: function(settings) {
            addClass(this.container, 'tm-sorter');

            function getValue(tr, i) {return tr.cells[i].innerHTML.trim();}

            // set up
            var core = this,
                head = this.head,
                foot = this.foot,
                //headWrap,
                //footWrap,
                container = this.container,
                body = this.body,
                bodyWrap = this.bodyWrap,
                origHead = this.origHead,
                origFoot = this.origFoot;


            var defaults = {
                headers: {
                    all: {
                        enabled: true,
                        parser: 'intelligent'
                    }
                },
                initial: [0, 'asc'],
                enableMultisort: true,
                customParsers: {}
            };

            extend(defaults, settings);
            /*
                constructor
            */
            function Sorter() {
                var _this = this,
                    i = settings.initial[0],
                    order = settings.initial[1];

                this.body = body.tBodies[0];
                //this.rows = [].slice.call(this.body.rows);
                this.headers = settings.headers;
                this.headCells = head ? [].slice.call(head.firstElementChild.firstElementChild.cells) : [].slice.call(body.tHead.firstElementChild.cells);

                iterate(settings.customParsers, function(name, func){
                    _this.parsers[name] = func;
                });

                // iterate over header cells
                iterate(this.headCells, function(i, cell) {

                    if (_this.getIsEnabled(i)) {
                        addClass(cell, 'sortable');
                        cell.addEventListener('click', function(e) {

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
                    this.setOrderAsc(false)
                        .setIndex(i)
                        .sort()
                        .render()
                        .renderSortingArrows();

                } else {
                    // enabled, sort asc
                    this.setOrderAsc();
                    this.manage(i);
                }
            }

            Sorter.prototype = {
                ready: true,
                headers: {},
                headCells: [],
                body: null,
                rows: [],

                indices: [Infinity],
                orders: [true],

                parsers: {
                    string: function(a, b) {
                        if (a > b) return 1;
                        if (a < b) return -1;
                        return 0;
                    },
                    numeric: function(a, b) {
                        a = parseFloat(a);
                        b = parseFloat(b);
                        return a - b;
                    },
                    intelligent: function(a, b) {
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
                    germanDate: function(a, b) {
                        try{
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
                        } catch(e) {
                            error(e);
                            return -1;
                        }
                    },
                    /*
                        NOT IMPLEMENTED YET
                        @TODO implement
                    */
                    americanDate: function(a, b) {
                        return this.intelligent(a, b);
                    },
                    /*
                        german days of the week
                    */
                    daysOfTheWeek: function(a, b) {
                        function getIndex(str) {
                            var i = -1, l = days.length - 1;
                            while (l > -1 && i === -1) {
                                i = days[l].indexOf(str);
                                l--;
                            }
                            return i;
                        }

                        var days = [
                            // german
                            ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'],
                            ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'],
                            // english
                            ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
                            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                        ];

                        return getIndex(b.toLowerCase()) - getIndex(a.toLowerCase());
                    }
                },
                setRows: function(rowArray) {
                        core.setRows(rowArray);
                        return this;
                },
                setIndex: function(i) {
                    this.indices = [i];
                    return this;
                },

                setOrderAsc: function(bool) {
                    if (bool === undefined) bool = true;
                    this.orders = [bool];
                    return this;
                },
                getRows: function() {
                    return core.getRows();
                },
                getParser: function(i) {
                    return (this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('parser')) ? this.parsers[this.headers[i].parser] : this.parsers[this.headers.all.parser];
                },
                getIsEnabled: function(i) {
                    return (this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('enabled')) ? this.headers[i].enabled : this.headers.all.enabled;
                },
                getIndex: function() {return this.indices[0];},
                getOrderAsc: function() {return this.orders[0];},

                sort: function() {
                    var i = this.getIndex(),
                        o = this.getOrderAsc(),
                        p = this.getParser(i);

                    this.getRows().sort(function(a, b) {
                        return p(getValue(a, i), getValue(b, i));
                    });

                    if (!o) this.reverse();

                    return this;
                },
                multiSort: function() {
                    var _this = this,
                        indices = this.indices,
                        orders = this.orders,
                        parsers = indices.map(function(i) {return _this.getParser(i);}),
                        maxDeph = indices.length - 1;

                    this.getRows().sort(function(a, b) {
                        var comparator = 0, deph = 0;

                        while (comparator === 0 && deph <= maxDeph) {
                            var tmpIndex = indices[deph];
                            comparator = parsers[deph](getValue(a, tmpIndex), getValue(b, tmpIndex));
                            deph++;
                        }

                        deph--; // decrement again
                        // invert result in case order of this columns is descending
                        return (orders[deph] || deph > maxDeph) ? comparator : (-1) * comparator;
                    });

                    return this;
                },
                reverse: function() {
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
                },
                render: function() {
                    core.render();

                    return this;
                },
                renderSortingArrows: function() {
                    // remove current sorting classes
                    iterate(container.querySelectorAll('.sort-up, .sort-down'), function(i, cell){
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

                            if (asc) { // ascending
                                addClass(cell, 'sort-up');
                            } else { // descending
                                addClass(cell, 'sort-down');
                            }
                        }
                    }
                    return this;
                },

                manage: function(i) {

                    if (!this.ready) return;
                    this.ready = false;

                    if (this.getIndex() === i) {

                        this.setOrderAsc(!this.getOrderAsc());  // invertiere aktuelle Sortierung

                    } else if (this.getIsEnabled(i)) {

                        this.setOrderAsc();                     // sort ascending

                    }

                    this.setIndex(i)
                        .sort()
                        .render()
                        .renderSortingArrows();

                    this.ready = true;
                    return this;
                },
                manageMulti: function(i) {
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
                    this.multiSort()
                        .render()
                        .renderSortingArrows();

                    this.ready = true;
                    return this;
                }
            }
            var sorterInstance = new Sorter();

            return {
                    sortAsc: function(i) {
                        sorterInstance
                            .setIndex(i)
                            .setOrderAsc()
                            .sort()
                            .render()
                            .renderSortingArrows();
                    },
                    sortDesc: function(i) {
                        sorterInstance
                            .setIndex(i)
                            .setOrderAsc(false)
                            .sort()
                            .render()
                            .renderSortingArrows();
                    }
            };
        },
        columnStyles: function(settings) {
                try {
                    addClass(this.container, 'tm-column-styles');

                    var defaults = {
                            all: {
                                'text-align':'center',
                                'padding': '3px'
                            }
                    },
                    containerId = this.containerId;

                    extend(defaults, settings);

                    // style general
                    var text = 'div#' + containerId + ' table tr > *{';
                    iterate(settings.all, function(prop, value) {
                        text += prop + ':' + value + ';';
                    });
                    text += '}';

                    delete settings.all;

                    // add custom styles to the single columns
                    iterate(settings, function(index, cssStyles) {
                        var i = parseInt(index) + 1;

                        text += 'div#' + containerId + ' table tr > *:nth-of-type(' + i + '){';
                        iterate(cssStyles, function(prop, value) {
                            text += prop + ':' + value + ';';
                        });
                        text += '}';
                    });
                    this.appendStyles(text);
                    info('module columnStyles loaded');
                } catch(e) {
                    error(e);
                }
        },

        /*
            MODULE zebra: adding zebra style to the table
        */
        zebra: function(settings) {
            // this := Tablemodify-instance
            try {
                addClass(this.container, 'tm-zebra');

                var defaults = {even:'#f0f0f0', odd:'white'};
                extend(defaults, settings);

                var text = 'table' + this.bodySelector + ' tr:nth-of-type(even){background-color:' + settings.even + '}'
                         + 'table' + this.bodySelector + ' tr:nth-of-type(odd) {background-color:' + settings.odd + '}';
                this.appendStyles(text);

                info('module zebra loaded');
            } catch (e) {
                error(e);
            }
        }
    };

    Tablemodify.addModule = function(moduleName, func) {

        // ceck is moduleName is valid
        if (this.modules[moduleName] !== undefined ||
            this.prototype[moduleName] !== undefined ||
            this[moduleName] !== undefined) {
            throw 'module name "' + moduleName + '" is not valid!';
        }

        this.modules[moduleName] = func;

    };

    Tablemodify.debug = true;

    return Tablemodify;
})(window, document);
