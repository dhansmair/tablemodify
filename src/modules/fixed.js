const Module = require('./module.js');
const {inPx, iterate, setCss, addClass, removeClass,
       getCss, getScrollbarWidth, info, error} = require('../utils.js');

let tm, scrollbarWidth;

class Fixed {
    constructor(settings) {
        try {
            // set up
            let headTable,
                bodyTable = tm.domElements.table,
                footTable,

                headWrap,
                tableWrap =  tm.domElements.tableWrap,
                footWrap,

                origHead =  tm.domElements.origHead,
                origFoot =  tm.domElements.origFoot,
                _this = this,

                container = tm.domElements.container,
                borderCollapse = getCss(tm.domElements.table, 'border-collapse');
                scrollbarWidth = getScrollbarWidth();

            if (origHead && settings.fixHeader) {
                let headerHeight = this.getHeaderHeight();
                headTable = document.createElement('table');
                headWrap  = document.createElement('div');
                let rightUpperCorner = document.createElement('div');
                headTable.appendChild(origHead.cloneNode(true));
                headWrap.appendChild(headTable);
                container.insertBefore(headWrap, tableWrap);
                headWrap.appendChild(rightUpperCorner);

                addClass(headTable, 'tm-head');
                addClass(headWrap, 'tm-head-wrap');
                addClass(rightUpperCorner, 'tm-head-rightCorner');

                headTable.style.borderCollapse = borderCollapse;
                origHead.style.visibility = 'hidden';
                bodyTable.style.marginTop = inPx('-' + headerHeight);
                headWrap.style.marginRight  = inPx(scrollbarWidth);
                rightUpperCorner.style.width = inPx(scrollbarWidth);
                rightUpperCorner.style.right = inPx(-scrollbarWidth);

                tm.domElements.headWrap = headWrap;
                tm.domElements.head = headTable.tHead;
            }
            if (origFoot && settings.fixFooter) {
                let footerHeight = this.getFooterHeight();
                footTable = document.createElement('table');
                footWrap  = document.createElement('div');
                footTable.appendChild(origFoot.cloneNode(true));
                footWrap.appendChild(foot);
                container.appendChild(footWrap);

                addClass(footTable, 'tm-foot');
                addClass(footWrap, 'tm-foot-wrap');

                // add DIVs to origFoot cells so its height can be set to 0px
                iterate(origFoot.firstElementChild.cells, (i, cell) => {
                    cell.innerHTML = '<div class="tm-fixed-helper-wrapper">' + cell.innerHTML + '</div>';
                });

                footTable.style.borderCollapse   = borderCollapse;
                origFoot.style.visibility   = 'hidden';
                tableWrap.style.overflowX    = 'scroll';
                tableWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight));
                footWrap.style.marginRight  = inPx(scrollbarWidth);

                tm.domElements.footWrap = footWrap;
                tm.domElements.foot = foot.tFoot;
            }

            // add event listeners
            if (headTable) {
                window.addEventListener('resize', () => {
                    _this.renderHead();
                });
            }

            if (footTable) {
                window.addEventListener('resize', () => {
                    _this.renderFoot();
                });
            }

            if (headTable && footTable) {
                tableWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        headTable.style.transform = 'translateX(-'+tableWrap.scrollLeft+'px)';
                        footWrap.scrollLeft = tableWrap.scrollLeft;
                    }, false);
                });
                footWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        headTable.style.transform = 'translateX(-'+footWrap.scrollLeft+'px)';
                        tableWrap.scrollLeft = footWrap.scrollLeft;
                    });
                }, false);

            } else if (headTable && !footTable) {

                tableWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        headTable.style.marginLeft = inPx('-' + tableWrap.scrollLeft);
                    });
                });

            } else if (!headTable && footTable) {

                footWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        tableWrap.scrollLeft = footWrap.scrollLeft;
                    });
                });
                tableWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        footWrap.scrollLeft = tableWrap.scrollLeft;
                    });
                });
            }

            setTimeout(() => {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                this.renderHead();
                this.renderFoot();
            }, 50);
            setTimeout(() => {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                this.renderHead();
                this.renderFoot();
            }, 500);

            this.headTable = headTable;
            this.footTable = footTable;
            this.headWrap = headWrap;
            this.footWrap = footWrap;

            info('module fixed loaded');
        } catch(e) {
            console.warn(e)
        }
    }

    getHeaderHeight() {
        return tm.domElements.origHead.clientHeight;
    }

    getFooterHeight() {
        return tm.domElements.origFoot.clientHeight;
    }

    renderHead() {
        if(!this.headTable) return;

        var allNew = [].slice.call(this.headTable.firstElementChild.firstElementChild.cells),
            allOld = [].slice.call(tm.domElements.origHead.firstElementChild.cells);
        tm.domElements.table.style.marginTop = inPx('-' + this.getHeaderHeight()); // if header resizes because of a text wrap

        iterate(allNew, function(i, neu){
            let w = inPx(allOld[i].getBoundingClientRect().width);

            neu.style.width = w;
            neu.style['minWidth'] = w;
            neu.style['maxWidth'] = w;
        });
    }

    renderFoot() {
        if (!this.footTable) return;
        var allNew = [].slice.call(this.footTable.firstElementChild.firstElementChild.cells),
            allOld = [].slice.call(tm.domElements.origFoot.firstElementChild.cells);

        tm.domElements.tableWrap.style.marginBottom = inPx('-' + (scrollbarWidth + this.getFooterHeight() + 1)); // if footer resizes because of a text wrap

        iterate(allNew, function(i, neu){
            let w = inPx(allOld[i].getBoundingClientRect().width);

            neu.style.width = w;
            neu.style['minWidth'] = w;
            neu.style['maxWidth'] = w;
        });
    }
}

module.exports = new Module({
    name: "fixed",
    defaultSettings: {
        fixHeader:false,
        fixFooter:false
    },
    initializer: function(settings) {
        tm = this;

        addClass(tm.domElements.container, 'tm-fixed');

        scrollbarWidth = getScrollbarWidth();
        let instance = new Fixed(settings);

        return {

        	notify: () => {
        		instance.renderHead();
        		instance.renderFoot();
        	},

        	renderHead: instance.renderHead,
        	renderFoot: instance.renderFoot,

            /**
             * revert all changes performed by this module
             * implementation might not be 100% correct yet
             */
             /*
            unset: () => {
                const INITIAL = 'initial';
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
                        tableWrap.style.overflowX = INITIAL;
                        tableWrap.style.marginBottom = INITIAL;

                        // remove footer helper wrappers
                        let wrappers = origFoot.querySelectorAll('div.tm-fixed-helper-wrapper');

                        [].slice.call(wrappers).forEach((wrapper) => {
                            wrapper.outerHTML = wrapper.innerHTML;
                        });
                    }

                    window.removeEventListener('resize', renderHead);
                    window.removeEventListener('resize', renderFoot);
                    body.removeEventListener('tmFixedForceRendering', renderHead);
                } catch(e) {
                    error(e);
                }
            }*/
        };
    }
});
