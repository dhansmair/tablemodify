/*
    Tablemodify v0.3

    written by David Hansmair

*/
var Tablemodify = (function(window, document) {
    "use strict";
    // custom console logging functions
    function log(text) {if(coreSettings.debug) console.log(text);}
    function info(text) {if(coreSettings.debug) console.info(text);}
    function warn(text) {if(coreSettings.debug) console.warn(text);}
    function trace(text) {if(coreSettings.debug) console.trace(text);}
    function error(text) {if(coreSettings.debug) console.error(text);}
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
            // deep-extend
            if (typeof s[key] === 'object') {
                s[key] = extend(d[key], s[key]);
            }
        });

        return s;
    }
    function getScrollbarWidth() {
      var outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.width = "100px";
      outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
      document.body.appendChild(outer);
      var widthNoScroll = outer.offsetWidth;
      // force scrollbars
      outer.style.overflow = "scroll";
      // add innerdiv
      var inner = document.createElement("div");
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
              func.call(undefined, keys[i], elems[keys[i]]);
          }
      } else {
          var l = elems.length;
          for (var i = 0; i < l; i++) {
            func.call(undefined, elems[i], i);
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

    function getHeaderHeight() { return origHead.getBoundingClientRect().height;}
    function getFooterHeight() { return origFoot.getBoundingClientRect().height;}

    function appendStyles(text) {
      if (text.trim().length > 0) {stylesheet.appendChild(document.createTextNode(text.trim()));}
    }

    /*

    */
    var coreSettings = {};
    var container, stylesheet,          // div, style
        head, body, foot,               // tables
        headWrap, bodyWrap, footWrap,   // divs
        origHead, origFoot,             // thead, tfoot
        scrollbarWidth,                  // Integer
        containerId,
        coreSettings;

    function getApi () {
        return {
            container: container,
            stylesheet: stylesheet,
            head: head,
            body: body,
            foot: foot,
            headWrap: headWrap,
            bodyWrap: bodyWrap,
            footWrap: footWrap,
            origHead: origHead,
            origFoot: origFoot,
            coreSettings: coreSettings,
            // methods
            appendStyles: appendStyles,
            getScrollbarWidth: getScrollbarWidth
        };
    }

    var coreDefaults = {
        containerId: 'tm-container',
        debug: true
    };

    /*

    */
    function buildDOM() {
        bodyWrap  = wrap(body,     document.createElement('div'));
        container = wrap(bodyWrap, document.createElement('div'));
        origHead = body.tHead;
        origFoot = body.tFoot;
        // add css area
        stylesheet = document.createElement('style');
        container.insertBefore(stylesheet, container.firstElementChild);
        container.id = containerId;

        addClass(body,      'tm-body');
        addClass(bodyWrap,  'tm-body-wrap');
        addClass(container, 'tm-container');
        addClass(stylesheet, 'tm-custom-style');
    }

    var Tablemodify = function(selector, coreSettings) {
        // must be a table
        body = document.querySelector(selector);
        if (!body || body.nodeName !== 'TABLE'){
          error('there is no <table> with selector ' + selector);
          return null;
        }
        var _this = this;

        extend(coreDefaults, coreSettings);

        if (coreSettings.containerId.charAt(0) == '#') {
            containerId = coreSettings.containerId.slice(1)
        } else {
            containerId = coreSettings.containerId;
        }

        buildDOM();

        // call all modules
        if (coreSettings.modules) {
            // interface for modules
            iterate(coreSettings.modules, function(moduleName, moduleSettings) {
                if (!Tablemodify.modules[moduleName]) {
                    warn('module ' + moduleName + ' not registered!');
                    return;
                }
                //var moduleSettings = coreSettings.modules[this];
                Tablemodify.modules[moduleName].call(_this, moduleSettings);
            });
        }

        return this; // chaining
    };

    Tablemodify.prototype = {

    };

    Tablemodify.modules = {

        columnStyles: function(settings) {
                try {
                    addClass(container, 'tm-column-styles');

                    var defaults = {
                            all: {
                                'text-align':'center',
                                'padding': '3px'
                            }
                            // 0: {},
                            // 1: {}
                    };
                    extend(defaults, settings);

                    // style general
                    var text = 'div.tm-column-styles table tr > *{';
                    iterate(settings.all, function(prop, value) {
                        text += prop + ':' + value + ';';
                    });
                    text += '}';

                    delete settings.all;

                    // add custom styles to the single columns
                    iterate(settings, function(index, cssStyles) {
                        var i = parseInt(index) + 1;

                        text += 'div.tm-container table tr > *:nth-of-type(' + i + '){';
                        iterate(cssStyles, function(prop, value) {
                            text += prop + ':' + value + ';';
                        });
                        text += '}';
                    });
                    appendStyles(text);
                } catch(e) {
                    error(e);
                }
        },

        /*
            MODULE zebra: adding zebra style to the table
        */
        zebra: function(settings) {
            try {
                addClass(container, 'tm-zebra');

                var defaults = {even:'#f6f6f6', odd:'white'};
                extend(defaults, settings);

                var text = 'table.tm-body tr:nth-of-type(even){background-color:' + settings.even + '}'
                         + 'table.tm-body tr:nth-of-type(odd) {background-color:' + settings.odd + '}';
                appendStyles(text);
            } catch (e) {
                error(e);
            }
        },
        /*
            MODULE fixed: fixed header and/or footer
        */
        fixed: function(settings) {
            try {
                addClass(container, 'tm-fixed');

                function renderHead () {
                    var allNew = head.firstElementChild.firstElementChild.cells,
                        allOld = origHead.firstElementChild.cells;

                    body.style.marginTop = inPx('-' + getHeaderHeight()) // if header resizes because of a text wrap

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
                    var allNew = foot.firstElementChild.firstElementChild.cells,
                        allOld = origFoot.firstElementChild.cells;

                    bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + getFooterHeight())); // if footer resizes because of a text wrap

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
                    fixHeader:true,
                    fixFooter:false
                };
                extend(defaults, settings);


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
                    var footerHeight = getFooterHeight();
                    foot     = document.createElement('table');
                    footWrap = document.createElement('div');
                    foot.appendChild(origFoot.cloneNode(true));
                    footWrap.appendChild(foot);
                    container.appendChild(footWrap);

                    addClass(foot,     'tm-foot');
                    addClass(footWrap, 'tm-foot-wrap');

                    foot.style.borderCollapse   = borderCollapse;
                    origFoot.style.visibility   = 'hidden';
                    bodyWrap.style.overflowX    = 'scroll';
                    bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight));
                    footWrap.style.marginRight  = inPx(scrollbarWidth);
                }

                // add event listeners
                if (head) {window.addEventListener('resize', renderHead);}
                if (foot) {window.addEventListener('resize', renderFoot);}

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

                    bodyWrap.addEventListener('scroll', function(){head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);});

                } else if (!head && foot) {

                    footWrap.addEventListener('scroll', function(){bodyWrap.scrollLeft = footWrap.scrollLeft;});
                    bodyWrap.addEventListener('scroll', function(){footWrap.scrollLeft = bodyWrap.scrollLeft;});

                }  else if (!head && !foot) {
                    // do nothing
                }

                setTimeout(function(){
                    // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                    if (head) renderHead();
                    if (foot) renderFoot();
                }, 50);
            } catch(e) {
                error(e);
            }
        },
        /*
            MODULE sorter
            @TODO parser implementieren
        */
        sorter: function(settings) {
            addClass(container, 'tm-sorter');

            function getValue(tr, i) {return tr.cells[i].innerHTML.trim();}
            function removeActiveSorting() {
                if (container.querySelector('tr > *.sort-up')) {
                    removeClass(container.querySelector('tr > *.sort-up'), 'sort-up');
                }
                if (container.querySelector('tr > *.sort-down')) {
                    removeClass(container.querySelector('tr > *.sort-down'), 'sort-down');
                }
            }

            var defaults = {
                headers: {
                    all: {
                        enabled: true,
                        parser: 'intelligent'
                    }
                },
                initial: [0, 'asc']
            };

            extend(defaults, settings);
            /*
                constructor
            */
            function Sorter() {
                var i = settings.initial[0],
                    order = settings.initial[1],
                    headCellsArr = head ? [].slice.call(head.firstElementChild.firstElementChild.cells) : [].slice.call(body.tHead.firstElementChild.cells),
                    _this = this;

                this.body = body.tBodies[0];
                this.rows = [].slice.call(this.body.rows);
                this.headers = settings.headers;

                // iterate over header cells
                iterate(headCellsArr, function(i, cell) {
                    if (_this.getIsEnabled(i)) {
                        addClass(cell, 'sortable');
                        cell.addEventListener('click', function(e) { _this.manage(i, cell);});
                    }
                });

                // try to sort by initial sorting
                if (!this.getIsEnabled(i)) {
                    // not enabled
                    var initialized = false;
                    i = 0;
                    while (i < headCellsArr.length && !initialized) {
                        if (this.getIsEnabled(i)) {
                            this.manage(i, headCellsArr[i]);
                            initialized = true;
                        }
                        i++;
                    }

                } else if (order === 'desc') {
                    // enabled, sort desc
                    this.sortDesc(i)
                        .render()
                        .setOrderAsc(false)
                        .setIndex(i);

                    removeActiveSorting();
                    addClass(cell, 'sort-down');
                } else {
                    // enabled, sort asc
                    this.manage(i, headCellsArr[i]);
                }
            }

            Sorter.prototype = {
                body: null,
                rows: [],
                index: Infinity,
                orderAsc: true,
                headers: {},
                parsers: {
                    string: function(a, b) {
                        return a > b ? 1 : -1;
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
                            return a > b ? 1 : -1;
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

                            return dateA > dateB ? 1 : -1;

                        } catch(e) {
                            console.error(e);
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
                setIndex: function(value) {
                    this.index = value;
                    return this;
                },
                setOrderAsc: function(bool) {
                    if (bool === undefined) bool = true;
                    this.orderAsc = bool;
                    return this;
                },
                getParser: function(i) {
                    return (this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('parser')) ? this.parsers[this.headers[i].parser] : this.parsers[this.headers.all.parser];
                },
                getIsEnabled: function(i) {
                    return (this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('enabled')) ? this.headers[i].enabled : this.headers.all.enabled;
                },
                getIndex: function() {
                    return this.index;
                },
                getOrderAsc: function() {
                    return this.orderAsc;
                },

                sortAsc: function(i) {
                    var parse = this.getParser(i); // it's a function!
                    this.rows.sort(function(a, b) {
                        //return parse(getValue(a, i)) > parse(getValue(b, i)) ? 1 : -1;
                        return parse(getValue(a, i), getValue(b, i));
                    });
                    return this;
                },
                sortDesc: function(i) {
                    return this.sortAsc(i).reverse();
                },
                reverse: function() {
                    var array = this.rows,
                        left = null,
                        right = null,
                        length = array.length;
                    for (left = 0; left < length / 2; left += 1) {
                        right = length - 1 - left;
                        var temporary = array[left];
                        array[left] = array[right];
                        array[right] = temporary;
                    }
                    this.rows = array;
                    return this;
                },
                render: function() {
                    var tBody = this.body;
                    this.rows.forEach(function(tr) {
                        tBody.appendChild(tr);
                    });
                    return this;
                },
                manage: function(i, cell) {

                    if (this.index == i) {
                        // invertiere aktuelle Sortierung
                        this.reverse().render();

                        if (!this.getOrderAsc()) {
                            this.setOrderAsc();
                            removeClass(cell, 'sort-down');
                            addClass(cell, 'sort-up');
                        } else {
                            this.setOrderAsc(false);
                            removeClass(cell, 'sort-up');
                            addClass(cell, 'sort-down');
                        }

                    } else if (this.getIsEnabled(i)) {
                        // sort ascending
                        this.sortAsc(i)
                            .render()
                            .setOrderAsc()
                            .setIndex(i);

                        removeActiveSorting();
                        addClass(cell, 'sort-up');
                    } else {
                        // do nothing
                    }
                    return this;
                }
            }

            return new Sorter();
        }
    };

    return Tablemodify;
})(window, document);
