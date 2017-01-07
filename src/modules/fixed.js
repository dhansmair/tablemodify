const Module = require('./module.js');
const {inPx, iterate, setCss, addClass,
       getCss, getScrollbarWidth, info, error} = require('../utils.js');

module.exports = new Module({
    name: "fixed",
    defaultSettings: {
        fixHeader:false,
        fixFooter:false
    },
    initializer: function(settings) {
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

        var getHeaderHeight = function() { return origHead.clientHeight;};
        var getFooterHeight = function() { return origFoot.clientHeight;};

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

                // add DIVs to origFoot cells so its height can be set to 0px
                iterate(origFoot.firstElementChild.cells, function(i, cell) {
                    cell.innerHTML = '<div>' + cell.innerHTML + '</div>';
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
                body.addEventListener('tmFixedForceRendering', (e) => {
                    renderHead();
                });
            }

            if (foot) {
                window.addEventListener('resize', renderFoot);
                body.addEventListener('tmFixedForceRendering', renderHead);
            }

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

            setTimeout(function(){
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                renderHead();
                renderFoot();
            }, 50);
            setTimeout(function(){
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
                renderHead();
                renderFoot();
            }, 500);

            this.head = head;
            this.foot = foot;
            this.headWrap = headWrap;
            this.footWrap = footWrap;
            info('module fixed loaded');

        } catch(e) {
            error(e);
        }
    }
});
