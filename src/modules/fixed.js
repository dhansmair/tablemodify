const Module = require('./module.js');
const {inPx, iterate, setCss, addClass, removeClass,
       getCss, getScrollbarWidth, info, error} = require('../utils.js');

module.exports = new Module({
    name: "fixed",
    defaultSettings: {
        fixHeader:false,
        fixFooter:false
    },
    initializer: function(settings) {
        // set up
        let head,
            foot,
            headWrap,
            footWrap,
            container = this.container,
            body = this.body,
            bodyWrap = this.bodyWrap,
            origHead = this.origHead,
            origFoot = this.origFoot,
            scrollbarWidth = getScrollbarWidth();

        function getHeaderHeight() { return origHead.clientHeight;};
        function getFooterHeight() { return origFoot.clientHeight;};

        function renderHead() {
            if(!head) return;
            var allNew = [].slice.call(head.firstElementChild.firstElementChild.cells),
                allOld = [].slice.call(origHead.firstElementChild.cells);
            body.style.marginTop = inPx('-' + getHeaderHeight()); // if header resizes because of a text wrap

            iterate(allNew, function(i, neu){
                let w = inPx(allOld[i].getBoundingClientRect().width);
                neu.style.cssText = `width: ${w};
                                     min-width: ${w};
                                     max-width: ${w}`;
            });
        }
        function renderFoot() {
            if (!foot) return;
            var allNew = [].slice.call(foot.firstElementChild.firstElementChild.cells),
                allOld = [].slice.call(origFoot.firstElementChild.cells);

            bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + getFooterHeight() + 1)); // if footer resizes because of a text wrap

            iterate(allNew, function(i, neu){
                let w = inPx(allOld[i].getBoundingClientRect().width);
                neu.style.cssText = `width: ${w};
                                     min-width: ${w};
                                     max-width: ${w}`;
            });
        }
        try {
            addClass(container, 'tm-fixed');
            let borderCollapse = getCss(body, 'border-collapse');

            if (origHead && settings.fixHeader) {
                let headerHeight = getHeaderHeight();
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
                let footerHeight = getFooterHeight();
                foot     = document.createElement('table');
                footWrap = document.createElement('div');
                foot.appendChild(origFoot.cloneNode(true));
                footWrap.appendChild(foot);
                container.appendChild(footWrap);

                addClass(foot,     'tm-foot');
                addClass(footWrap, 'tm-foot-wrap');

                // add DIVs to origFoot cells so its height can be set to 0px
                iterate(origFoot.firstElementChild.cells, (i, cell) => {
                    cell.innerHTML = '<div class="tm-fixed-helper-wrapper">' + cell.innerHTML + '</div>';
                });

                foot.style.borderCollapse   = borderCollapse;
                origFoot.style.visibility   = 'hidden';
                bodyWrap.style.overflowX    = 'scroll';
                bodyWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight));
                footWrap.style.marginRight  = inPx(scrollbarWidth);
            }

            // add event listeners
            if (head) {
                window.addEventListener('resize', renderHead);
            }

            if (foot) {
                window.addEventListener('resize', renderFoot);
            }

            body.addEventListener('tmRowsAdded', () => {
                renderHead();
                renderFoot();
            });
            /*
            body.addEventListener('tmFixedForceRendering', () => {
                renderHead();
                renderFoot();
            });*/

            if (head && foot) {
                bodyWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        head.style.transform = 'translateX(-'+bodyWrap.scrollLeft+'px)';
                        footWrap.scrollLeft = bodyWrap.scrollLeft;
                    }, false);
                });
                footWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        head.style.transform = 'translateX(-'+footWrap.scrollLeft+'px)';
                        bodyWrap.scrollLeft = footWrap.scrollLeft;
                    });
                }, false);

            } else if (head && !foot) {

                bodyWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        head.style.marginLeft = inPx('-' + bodyWrap.scrollLeft);
                    });
                });

            } else if (!head && foot) {

                footWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        bodyWrap.scrollLeft = footWrap.scrollLeft;
                    });
                });
                bodyWrap.addEventListener('scroll', function() {
                    window.requestAnimationFrame(function() {
                        footWrap.scrollLeft = bodyWrap.scrollLeft;
                    });
                });
            }

            setTimeout(() => {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                renderHead();
                renderFoot();
            }, 50);
            setTimeout(() => {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                renderHead();
                renderFoot();
            }, 500);

            this.head = head;
            this.foot = foot;
            this.headWrap = headWrap;
            this.footWrap = footWrap;
            info('module fixed loaded');

            return {
            	
            	notify: () => {	
            		renderHead();
            		renderFoot();
            	},
            	
                /**
                 * revert all changes performed by this module
                 * implementation might not be 100% correct yet
                 */
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
                            bodyWrap.style.overflowX = INITIAL;
                            bodyWrap.style.marginBottom = INITIAL;

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
                }
            };

        } catch(e) {
            error(e);
        }
    }
});
