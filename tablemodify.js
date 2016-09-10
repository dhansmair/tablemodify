/*
    tablemodify v0.2
    tablemodify-plugin for fixed table headers.
    written by David Hansmair, sept 2016.

    feel free to contribute, change the code, whatever.
    But please send me a message when you have ideas to make the plugin better.

*/
var Tablemodify = (function () {
  "use strict";
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
  function extend(obj, src) {
      Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
      return obj;
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
  function getCss(el, style) {
      return window.getComputedStyle(el, null)[style];
  }
  function inPx(c) {
    return c + 'px';
  }
  // iterate over a set of elements and call function for each one
  function iterate(elems, func) {
    for (var i=0; i<elems.length; i++) {
      func.call(elems[i], i);
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


  // private vars
  var container, head, body, foot, headWrap, bodyWrap, footWrap, origHead, origFoot,
      headArr, footArr, containerId;
  var isFirefox = (navigator.userAgent.indexOf("Firefox") > 0); // in Firefox box-sizing:border-box doesn't go together with display:flex;

  if (!document.doctype)
    console.warn('in Firefox, tablemodify requires the <!DOCTYPE html> tag, otherwise the CSS3-property "box-sizing:border-box;" won\'t go together with "display:flex;".');

  // defaults
  var settings = {
          fixHeader:      true,
          fixFooter:      false,
          widths:         false,
          minWidths:      '100px'
  };

  // important functions
  function buildDOM () {
    bodyWrap  = wrap(body,     document.createElement('div'));
    container = wrap(bodyWrap, document.createElement('div'));

    addClass(body,      'tm-body');
    addClass(bodyWrap,  'tm-body-wrap');
    addClass(container, 'tm-container');

    if (containerId) container.id = containerId;

    if (settings.fixHeader && body.tHead) {
      origHead = body.tHead;
      head     = document.createElement('table');
      headWrap = document.createElement('div');
      head.appendChild(body.tHead.cloneNode(true));
      headWrap.appendChild(head);
      container.insertBefore(headWrap, bodyWrap);

      addClass(head,     'tm-head');
      addClass(headWrap, 'tm-head-wrap');
    }
    if (settings.fixFooter && body.tFoot) {
      origFoot = body.tFoot;
      foot     = document.createElement('table');
      footWrap = document.createElement('div');
      foot.appendChild(body.tFoot.cloneNode(true));
      footWrap.appendChild(foot);
      container.appendChild(footWrap);

      addClass(foot,     'tm-foot');
      addClass(footWrap, 'tm-foot-wrap');
    }
  }

  function addStyles () {
    // set min-widths for the columns
    var colgroup = body.querySelector('colgroup');
    if (colgroup && colgroup.hasChildNodes()) {
      iterate(colgroup.children, function(i){
        this.style['min-width'] = getValueIn(settings.minWidths, i);
      });
    }

    var borderCollapse = getCss(body, 'border-collapse'),
        scrollbarWidth = getScrollbarWidth(),
        headerHeight = origHead.getBoundingClientRect().height,
        footerHeight = origFoot.getBoundingClientRect().height;

    if (head) {
      head.style.borderCollapse   = borderCollapse;
      origHead.style.visibility   = 'hidden';
      body.style.marginTop        = inPx('-' + headerHeight);
      headWrap.style.marginRight  = inPx(scrollbarWidth);
    }
    if (foot) {
      foot.style.borderCollapse   = borderCollapse;
      origFoot.style.visibility   = 'hidden';
      bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight));
      footWrap.style.marginRight  = inPx(scrollbarWidth);
    }
  }

  function addEventListeners () {
    window.addEventListener('resize', function(e){
      renderHead();
      renderFoot();
    });

    bodyWrap.addEventListener('scroll', function(){
      head.style['margin-left'] = inPx((-1)*bodyWrap.scrollLeft);
      footWrap.scrollLeft = bodyWrap.scrollLeft;
    });

    if (foot) {
      footWrap.addEventListener('scroll', function(){
        // works better than setting scrollLeft property
        head.style['margin-left'] = inPx((-1)*footWrap.scrollLeft);
        bodyWrap.scrollLeft = footWrap.scrollLeft;
      });
    }
  }
  function renderHead () {
    if (head && origHead) {
      var allNew = head.firstElementChild.firstElementChild.cells,
          allOld = origHead.firstElementChild.cells;

      iterate(allNew, function(i){
        var w = inPx(allOld[i].getBoundingClientRect().width);
        setCss(this, {
          'width': w,
          'min-width': w,
          'max-width': w
        });
      });
    }
  }
  function renderFoot () {
    if (foot && origFoot) {
      var allNew = foot.firstElementChild.firstElementChild.cells,
          allOld = origFoot.firstElementChild.cells;

      iterate(allNew, function(i){
        var w = inPx(allOld[i].getBoundingClientRect().width);
        setCss(this, {
          'width': w,
          'min-width': w,
          'max-width': w
        });
      });
    }
  }

  return function Tablemodify (selector, options, id) {
    if (options) extend(settings, options);
    if (id) {
      (id.charAt(0) == '#') ? containerId = id.slice(1) : containerId = id;
    }
    // must be a table
    body = document.querySelector(selector);
    if (body.nodeName !== 'TABLE') return null;

    buildDOM();

    addStyles();

    addEventListeners();

    renderHead();
    renderFoot();

    this.version = 'v0.2';
  }
}());
