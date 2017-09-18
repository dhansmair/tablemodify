const {addClass, extend, elementIndex, info, error, debounce} = require('../utils.js');
const Module = require('./module.js');

let tm,
    startVal,
    originalSubject,
    isDragging = false;

function isHeadCell(el) {
    // this is necessary in order not to break same-origin-policy.
    // otherwise an error will be thrown after clicking an input tag. (strange...)
    // see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Fehler/Property_access_denied
    try {
        return el.parentElement.parentElement.tagName === 'THEAD'
    } catch(error) {
        return false
    }
}

class Resizer {
    constructor(settings) {
        let move = this.move,
            styles = `
            #${tm.containerId} thead:first-of-type tr > * {
                position:relative;
            }
            #${tm.containerId} thead:first-of-type tr > *:before {
                width:2px;
                height:20px;
                cursor:e-resize;
                content:'';
                position:absolute;
                left:0px;
            }
            #${tm.containerId} thead:first-of-type tr > *:after {
                width:3px;
                height:20px;
                cursor:e-resize;
                content:'';
                position:absolute;
                right:-1px;
            }`;
        tm.appendStyles(styles);

        // drag start
        tm.domElements.head.addEventListener('mousedown', (e) => {
            let cell = e.originalTarget || e.target;
            if (isHeadCell(cell) && (e.layerX < 4 || e.clientX - e.layerX < 4)) {
                isDragging = true;

                // decide whether to choose the left or the right column
                if (e.layerX < 4 && cell.previousElementSibling != null) {
                    cell = cell.previousElementSibling;
                }

                let index = elementIndex(cell) + 1;
                originalSubject = tm.domElements.origHead.querySelector('tr > *:nth-of-type('+index+')')
                startVal = parseInt(cell.clientWidth) - e.clientX;
                document.addEventListener('mousemove', move);
            }
        });

        // end of dragging
        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                document.removeEventListener('mousemove', move);
            }
        });
    }

    move(e) {
        window.requestAnimationFrame(() => {
            originalSubject.style.width =
            originalSubject.style.minWidth =
            originalSubject.style.maxWidth = startVal + e.clientX + 'px';
            tm.actionPipeline.notify('resizer');
        });
    }
}

module.exports = new Module({
    name: "resizer",
    defaultSettings: {},
    initializer: function(settings) {
        // this := Tablemodify-instance
        try {
            tm = this;

            addClass(tm.domElements.container, 'tm-resizer');
            let resizer = new Resizer(settings);

            return {

                notify: () => {
                    // weiterleiten
                    tm.actionPipeline.notify('resizer');
                },

                unset: () => {
                    // no implementation needed
                    info('unsetting resizer');
                }
            };
        } catch (e) {
            error(e);
        }
    }
});
