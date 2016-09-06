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

  var settings = {
          fixHeader:      true,
          fixFooter:      false,
          widths:         false,
          scrollbarWidth: '17px',
          minWidths:      '100px'
  };

  var hhWatch = 0;
  // privates
  var container, head, body, foot, headWrap, bodyWrap, footWrap, origHead, origFoot, topRight, bottomRight;
  // head = undefined
  // !!head = false

  /*
    - add .tablemodify class to table
    - wrap .tablemodify-body
    - wrap .tablemodify-container

    - falls fixHeader:true, prepend .tablemodify-head
    - falls fixFooter:true,  append .tablemodify-foot
  */
  function domStructure(settings) {
     head = false;
     foot = false;
     headWrap = false;
     bodyWrap = wrap(body, document.createElement('div'));
     footWrap = false;
     container = wrap(bodyWrap, document.createElement('div'));

     addClass(body,      'tablemodify-body');
     addClass(bodyWrap,  'tablemodify-body-wrap');
     addClass(container, 'tablemodify-container');

     // cover corners
     var corner = document.createElement('div');
     addClass(corner, 'tablemodify-corner');


     if (settings.fixHeader) {
       origHead = document.querySelector('table.tablemodify-body > thead');

       if (origHead) {
          //ret.originalHead = origHead;
          head = document.createElement('table');
          head.appendChild(origHead.cloneNode(true));
          headWrap = document.createElement('div');
          headWrap.appendChild(head);
          container.insertBefore(headWrap, bodyWrap);

          // add gray corner
          topRight = container.appendChild(corner.cloneNode(true));

          addClass(topRight, 'top-right');
          addClass(head,     'tablemodify-head');
          addClass(headWrap, 'tablemodify-head-wrap');
       }
     }

     if (settings.fixFooter) {
       origFoot = el('table.tablemodify-body > tfoot');

       if (origFoot) {
          foot = document.createElement('table');
          foot.appendChild(origFoot.cloneNode(true));
          footWrap = document.createElement('div');
          footWrap.appendChild(foot);
          container.appendChild(footWrap);

          // add gray corner
          bottomRight = container.appendChild(corner);
          addClass(bottomRight, 'bottom-right');
          addClass(foot,     'tablemodify-foot');
          addClass(footWrap, 'tablemodify-foot-wrap');
       }
     }
  }

  /*

  */
  function setStyles (settings) {
    var borderCollapse = getCss(body, 'border-collapse');

    // set min-widths for the columns
    var colgroup = find('colgroup', body);
    if (colgroup && colgroup.hasChildNodes()) {
      iterate(colgroup.children, function(i){
        setCss(this, {
          'min-width': getValueIn(settings.minWidths, i)
        });
      });
    }

    if (head) {
      // headerheight
      var hh = origHead.getBoundingClientRect().height;
      /*
      var essentials = [
        'color',
        'font-size',
        'font-family',
        'line-height',
        'text-align',
        'vertical-align',
        'padding',
        'background-color',
        'background-image',
        'background-position',
        'background-attachment',
        'background-repeat',
        'border',
        'border-radius'
      ];
      */
      // style of head table
      setCss(head, {
        'height': inPx(hh),
        'border-collapse': borderCollapse
      });
      // style of the head table wrapper
      setCss(headWrap, {'height': inPx(hh)});
      // body nach oben rutschen
      setCss(body, {'margin-top': inPx((-1)*hh)});
      // Abstand des body von oben
      setCss(bodyWrap, {'top': inPx(hh)});
      // style corner
      setCss(document.querySelector('.tablemodify-corner.top-right'), {'height':inPx(hh), width:settings.scrollbarWidth});
    }
    if (foot) {
      // footerheight
      var fh = origFoot.getBoundingClientRect().height;
      // style of foot table
      setCss(foot, {
        'height': inPx(fh),
        'border-collapse': borderCollapse
      });
      setCss(bodyWrap, {'bottom': inPx(fh)});
      // style corner
      setCss(document.querySelector('.tablemodify-corner.bottom-right'), {'height':inPx(fh), width:settings.scrollbarWidth});
    }
  }

  /*
    - resize event
  */
  function setEvents (settings) {
      window.addEventListener('resize', function(e){
        renderHead();
        renderFoot();
      });
      bodyWrap.addEventListener('scroll', function(e){
        setCss(head, {'margin-left': ((-1)*bodyWrap.scrollLeft + 'px')});
        setCss(foot, {'margin-left': ((-1)*bodyWrap.scrollLeft + 'px')});
      });
  }

  /*

  */
  function renderHead () {
    if (head && origHead) {
      var allNew = head.firstElementChild.firstElementChild.cells,
          allOld = origHead.firstElementChild.cells;
      var hh = allOld[0].clientHeight;

      // bei zeilenumbruch in th zelle wird die höhe des headers angepasst
      if (hh !== hhWatch) {
        setCss(headWrap, {'height':inPx(hh)});
        setCss(topRight, {'height':inPx(hh)});
        setCss(bodyWrap, {'top':inPx(hh)});
        hhWatch = hh;
      }

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

  /*

  */
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

  return function Tablemodify(selector, options){
    extend(settings, options);

    body = document.querySelector(selector);
    // modify DOM
    domStructure(settings);
    // basic styles that are necessary
    setStyles(settings);
    // render head and foot if they are existing
    renderHead();
    renderFoot();
    // bind event listeners
    setEvents(settings);

    // define public properties
    this.version   = 'v0.1';
    this.structure = null;
  };
}());
