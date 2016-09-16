/*
    Tablemodify v0.3

    written by David Hansmair

*/
var Tablemodify = (function(window, document) {
    "use strict";
    // custom console logging functions
    function log (text) {if(coreSettings.debug) console.log(text);}
    function info (text) {if(coreSettings.debug) console.info(text);}
    function warn (text) {if(coreSettings.debug) console.warn(text);}
    function trace (text) {if(coreSettings.debug) console.trace(text);}
    function error (text) {if(coreSettings.debug) console.error(text);}
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
        Object.keys(d).forEach(function(key) { if (!s[key]) s[key] = d[key]; });
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
          var keys = Object.keys(elems);
          var l = keys.length;
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
        zebra: function(settings) {
            try {
                var defaults = {even:'#f6f6f6', odd:'white'};
                extend(defaults, settings);

                var text = 'table.tm-body tr:nth-of-type(even){background-color:' + settings.even + '}' +
                           'table.tm-body tr:nth-of-type(odd) {background-color:' + settings.odd + '}';
                appendStyles(text);
            } catch (e) {
                error(e);
            }
            return this; // chaining
        },
        fixed: function(settings) {
            try {
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
                    fixFooter:false,
                    minWidths:'100px'
                };
                extend(defaults, settings);

                var borderCollapse = getCss(body, 'border-collapse'),
                    headerHeight = getHeaderHeight(),
                    footerHeight = getFooterHeight(),
                    scrollbarWidth = getScrollbarWidth();

                if (origHead && settings.fixHeader) {
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
                    foot     = document.createElement('table');
                    footWrap = document.createElement('div');
                    foot.appendChild(origFoot.cloneNode(true));
                    footWrap.appendChild(foot);
                    container.appendChild(footWrap);

                    addClass(foot,     'tm-foot');
                    addClass(footWrap, 'tm-foot-wrap');

                    foot.style.borderCollapse   = borderCollapse;
                    origFoot.style.visibility   = 'hidden';
                    bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight));
                    footWrap.style.marginRight  = inPx(scrollbarWidth);
                }

                // set min-widths for the columns
                var colgroup = body.querySelector('colgroup');
                if (colgroup && colgroup.hasChildNodes()) {
                  iterate(colgroup.children, function(i, col) {
                    col.style.minWidth = getValueIn(settings.minWidths, i);
                  });
                }

                // add event listeners
                if (head) {
                    window.addEventListener('resize', renderHead);
                    renderHead(); // initial call
                }
                if (foot) {
                    window.addEventListener('resize', renderFoot);
                    footWrap.addEventListener('scroll', function(){
                        // works better than setting scrollLeft property
                        head.style.marginLeft = inPx((-1)*footWrap.scrollLeft);
                        bodyWrap.scrollLeft = footWrap.scrollLeft;
                    });
                    renderFoot(); // initial call
                }
                if (head || foot) {
                    bodyWrap.addEventListener('scroll', function(){
                        head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);
                        footWrap.scrollLeft = bodyWrap.scrollLeft;
                    });
                }
            } catch(e) {
                error(e);
            }

            return this; // chaining
        },
        /*
            MODULE sorter

        */
        sorter: function(settings) {
            try {
                function getValue (tr, i) {return tr.cells[i].innerHTML;}
                function choosePath (i) {
                    var choice = (settings[i]) ? settings[i] : settings.default;
                    var ordering = defaults.default[0];
                    var parserName = defaults.default[1];

                    if (typeof choice == 'string') { // asc || desc || both
                        ordering = choice;
                    } else if (Array.isArray(choice) && choice.length == 2) {
                        // [ordering, parsername]
                        ordering = choice[0];
                        parserName = choice[1];
                    } else if (Array.isArray(choice) && choice.length == 1) {
                        // [ordering]
                        ordering = choice[0];
                    } else {
                        ordering = false;
                    }

                    if (!parsers[parserName]) throw 'parser not defined!';

                    if (ordering) {
                        // i, ordering = asc || desc || auto, parserName
                        if (sorting[0] == i) {
                            if (sorting[1] && ordering !== 'asc') {
                                // asc sorted -> reverse if allowed
                                //if (ordering == 'both' || ordering == 'desc') {
                                    reverse();
                                    // set sorting to [i, false]
                                    addClass(tHead.firstElementChild.cells[i].lastElementChild, 'sort-down');
                                //}
                            } else if (ordering == 'both' || ordering == 'asc') {
                                reverse();
                                // set sorting to [i, true]
                                addClass(tHead.firstElementChild.cells[i].lastElementChild, 'sort-up');
                            }
                        } else if (ordering == 'both' || ordering == 'asc') {
                            sortAsc(i, parsers[parserName]);
                            // set sorting to [i, true]
                            addClass(tHead.firstElementChild.cells[i].lastElementChild, 'sort-up');
                        }
                    }
                }

                function sortAsc(i, parse) {
                    // hier liegt irgendwo ein Feher
                    var arr = bodyRows.sort(function(a, b){
                        return (parse(getValue(a, i)) > parse(getValue(b, i)));
                    });
                    arr.forEach(function(tr){
                        tBody.appendChild(tr);
                    });
                    sorting = [i, true];
                    return arr;
                }
                function sortDesc(i, parse) {
                    var arr = bodyRows.sort(function(a, b){
                        return (parse(getValue(a, i)) > parse(getValue(b, i)));
                    });
                    arr.forEach(function(tr){
                        tBody.appendChild(tr);
                    });
                    sorting = [i, false];
                    return arr;
                }
                function reverse() {
                    var arr = bodyRows.reverse();
                    arr.forEach(function(tr){
                        tBody.appendChild(tr);
                    });
                    sorting[1] = !sorting[1];
                    return arr;
                }

                var parsers = {
                    string: function(val) {
                        return val.trim();
                    },
                    number: function(val) {
                        var numeric = parseFloat(val);
                        if (!isNaN(numeric)){
                            return numeric;
                        } else {
                            return val;
                        }
                    }
                };
                var defaults = {
                    default: ['both', 'string']
                };
                extend(defaults, settings);

                // add Icons
                var icon = '<span class="tm-sorter-icon"><span>&#128897;</span><span>&#128899;</span></span>';
                var tHead = head.tHead || origHead;
                var tBody = body.tBodies[0];
                var bodyRows = Array.prototype.slice.call(tBody.querySelectorAll('tr'));
                var headCells = tHead.firstElementChild.children;
                var sorting = [0, true];

                // init structure
                iterate(headCells, function(i, cell){
                    if (typeof settings[i] != undefined) {
                        // custom settings for this cell
                        var customSettings = settings[i];
                        if (!Array.isArray(customSettings)) { // no array
                            if (customSettings != false) cell.innerHTML = cell.innerHTML + icon;
                        } else {
                            if (customSettings[0] != false) cell.innerHTML = cell.innerHTML + icon;
                        }
                    } else {
                        // default settings: sort up/down, parse automatic
                        cell.innerHTML = cell.innerHTML + icon;
                    }
                });

                // ADD CLICK EVENTS
                iterate(tHead.firstElementChild.cells, function(i, cell){
                    cell.addEventListener('click', function(e){
                        var icons = tHead.firstElementChild.querySelectorAll('span.tm-sorter-icon.sort-up, span.tm-sorter-icon.sort-down');
                        iterate(icons, function(j, icon){
                            removeClass(icon, 'sort-up');
                            removeClass(icon, 'sort-down');
                        });
                        choosePath(i);
                    })
                });

                sortAsc(0, parsers[defaults.default[1]]);
                addClass(tHead.firstElementChild.cells[0].lastElementChild, 'sort-up');

                this.sorter = {

                };
            } catch(e) {
                error(e);
            }
            return this; // chaining
        }
    };

    return Tablemodify;
})(window, document);
