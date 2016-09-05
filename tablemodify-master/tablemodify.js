var Tablemodify = (function(){
  "use strict";
  /*
     Utils
  */
  function el(sel){return document.querySelector(sel);}

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

  function wrapWithDiv(el, classname){
      return wrap(el, addClass(document.createElement('div'), classname));
  }

  function extend(obj, src) {
	    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
	    return obj;
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

  function find(selector, haystack) {
    var l = haystack.querySelector(selector);
    if (l) return l;
    return false;
  }

  function getValueIn(arr, i) {
    if (!Array.isArray(arr)) return arr;
    if (arr.length > i) {
      return arr[i];
    } else {
      return arr[arr.length-1];
    }
  }

  var settings = {
    fixHeader: true,
    fixFooter: false,
    widths: false,
    scrollbarWidth: '17px',
    minWidths: '100px'
  };

  /*
    - add .tablemodify class to table
    - wrap .tablemodify-body
    - wrap .tablemodify-container

    - falls fixHeader:true, prepend .tablemodify-head
    - falls fixFooter:true,  append .tablemodify-foot
  */
  function domStructure(table, settings){

     var ret = {
       head: false,
       body: table,
       foot: false,
       headWrap: false,
       bodyWrap: wrap(table, document.createElement('div')),
       footWrap: false
     };
     ret.container = wrap(ret.bodyWrap, document.createElement('div'));

     addClass(ret.body,      'tablemodify-body');
     addClass(ret.bodyWrap,  'tablemodify-body-wrap');
     addClass(ret.container, 'tablemodify-container');

     // cover corners
     var corner = document.createElement('div');
     addClass(corner, 'tablemodify-corner');


     if (settings.fixHeader) {
       var origHead = el('table.tablemodify-body > thead');

       if (origHead) {
          ret.originalHead = origHead;
          ret.head = document.createElement('table');
          ret.head.appendChild(origHead.cloneNode(true));
          ret.headWrap = document.createElement('div');
          ret.headWrap.appendChild(ret.head);
          ret.container.insertBefore(ret.headWrap, ret.bodyWrap);

          // add gray corner
          var topRightCorner = ret.container.appendChild(corner.cloneNode(true));
          addClass(topRightCorner, 'top-right');

          // add missing classes
          addClass(ret.head,     'tablemodify-head');
          addClass(ret.headWrap, 'tablemodify-head-wrap');
       }
     }

     if (settings.fixFooter) {
       var origFoot = el('table.tablemodify-body > tfoot');

       if (origFoot) {
          ret.originalFoot = origFoot;
          ret.foot = document.createElement('table');
          ret.foot.appendChild(origFoot.cloneNode(true));
          ret.footWrap = document.createElement('div');
          ret.footWrap.appendChild(ret.foot);
          ret.container.appendChild(ret.footWrap);

          // add gray corner
          var bottomRightCorner = ret.container.appendChild(corner);
          addClass(bottomRightCorner, 'bottom-right');

          // add missing classes
          addClass(ret.foot,     'tablemodify-foot');
          addClass(ret.footWrap, 'tablemodify-foot-wrap');
       }
     }

     return ret;
  }

  /*

  */
  function setStyles (dom, settings) {
    /*
      headerhöhe
      footerhöhe
      table-layout
      corners
      border-collapse
    */
    var bc = getCss(dom.body, 'border-collapse');

    var colgroup = find('colgroup', dom.body);
    if (colgroup && colgroup.hasChildNodes()) {
      var cols = colgroup.children;
      for (var i=0; i<cols.length; i++) {
        console.log(i);
        setCss(cols[i], {
          'min-width': getValueIn(settings.minWidths, i)
        });
      }
    }

    if (dom.head) {
      // headerheight
      var hh = dom.originalHead.getBoundingClientRect().height;

      // style of head table
      setCss(dom.head, {
        'height': inPx(hh),
        'border-collapse': bc
      });

      setCss(dom.headWrap, {
        'height': inPx(hh)
      });
      // body nach oben rutschen
      setCss(dom.body, {'margin-top': inPx('-'+hh)});

      setCss(dom.bodyWrap, {
        'top': inPx(hh)
      });

      // style corner
      setCss(document.querySelector('.tablemodify-corner.top-right'), {'height':inPx(hh), width:settings.scrollbarWidth});

    }
    if (dom.foot) {
      // footerheight
      var fh = dom.originalFoot.getBoundingClientRect().height;

      // style of foot table
      setCss(dom.foot, {
        'height': inPx(fh),
        'border-collapse': bc
      });

      setCss(dom.bodyWrap, {
        'bottom': inPx(fh)
      });

      // style corner
      setCss(document.querySelector('.tablemodify-corner.bottom-right'), {'height':inPx(fh), width:settings.scrollbarWidth});
    }
  }

  /*
    - resize event
  */
  function setEvents (dom, settings) {
      window.addEventListener('resize', function(e){

        renderHead(dom);
        renderFoot(dom);
      });
      dom.bodyWrap.addEventListener('scroll', function(e){
        setCss(dom.head, {
          'margin-left': ((-1)*dom.bodyWrap.scrollLeft + 'px'),
        });
        setCss(dom.foot, {
          'margin-left': ((-1)*dom.bodyWrap.scrollLeft + 'px'),
        });
      });
  }

  /*

  */
  function renderHead (dom) {
    if (dom.head && dom.originalHead) {
      var allNew = dom.head.firstElementChild.firstElementChild.cells,
          allOld = dom.originalHead.firstElementChild.cells;

      for (var i = 0; i < allNew.length; i++) {
        var w = inPx(allOld[i].getBoundingClientRect().width);
        setCss(allNew[i], {
          'width': w,
          'min-width': w,
          'max-width': w
        });
      }
    }
  }

  /*

  */
  function renderFoot (dom) {
    if (dom.foot && dom.originalFoot) {
      var allNew = dom.foot.firstElementChild.firstElementChild.cells,
          allOld = dom.originalFoot.firstElementChild.cells;

      for (var i = 0; i < allNew.length; i++) {
        var w = inPx(allOld[i].getBoundingClientRect().width);
        setCss(allNew[i], {
          'width': w,
          'min-width': w,
          'max-width': w
        });
      }
    }
  }

  return function Tablemodify(selector, options){
    var table = el(selector);

    extend(settings, options);

    var structure = domStructure(table, settings);

    setStyles(structure, settings);

    renderHead(structure);
    renderFoot(structure);

    setEvents(structure, settings);
  };
}());
