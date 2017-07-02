const {addClass, removeClass, hasClass, iterate, info, error, replaceIdsWithIndices, extend2, cloneArray, isNonEmptyString, debounce} = require('../utils.js');
const Module = require('./module.js');
const HandlerFactory = require('./filterHandlers.js');

const FILTER_HEIGHT = '30px';

let tm;

/*
    @TODO:
    implemented shortcuts like <,>, = etc for numerics. Filter with regex.
    now test it for correct behaviour.

    comparator:
    /^(\s)*(<|>|=|<=|>=)(\s)*[+-]?[0-9]+(\s)*$/.test(" >= -500")

    range:
    /^(\s)*[+-]?[0-9]+(\s)*-(\s)*[+-]?[0-9]+(\s)*$/.test("-1 - -5")
*/

// for call-by-reference passing to the filterHandler.js file.
// this has to be accessible from filterHandler AND this file.
let semaphor = {
    val: 0,
    up() {this.val++},
    down() {this.val--}
};

function isPatternInput(el) {
    return hasClass(el.parentElement, 'tm-input-div')
}

/**
 *   Factory class to produce filter cells
 */
class CellFactory {
    constructor() {
        let placeholder = tm.getTerm('FILTER_PLACEHOLDER'),
            caseSensitive = tm.getTerm('FILTER_CASESENSITIVE')

        this.handlerFactory = new HandlerFactory(tm, semaphor)
        // option icon
        this.optionIcon = document.createElement('div')
        this.cell = document.createElement('td')
        this.cell.innerHTML = `<div class='tm-input-div'><input type='text' placeholder='${placeholder}' /></div>`

        addClass(this.optionIcon, 'tm-filter-option-icon')
    }

    /**
     * decide if the cell should have an option dropdown
     * @param {object} options -
     * @return {boolean} - options visible or not?
     */
    _optionsVisible(options) {
    	if (!options) return false
    	let keys = Object.keys(options)
    	for (let i = 0; i < keys.length; i++) {
    		if (options[keys[i]]) return true
    	}
    	return false
    }
    /**
     *  create a pair of cell and handler
     *  @param {object} colSettings - information about which features the panel should provide
     *  @param {number} i - index of the cell
     *  @return {object} - looks like: {cell: <cell HTML-element>, handler: <handler object>}
     */
    create(colSettings, i) {
        if (!colSettings.enabled) return document.createElement('td')

        let ret = {},
            cell = this.cell.cloneNode(true)
        ret.cell = cell

        // attach option pane to the cell
        if (this._optionsVisible(colSettings.options)) {
            let optionIcon = this.optionIcon.cloneNode('true')
            cell.appendChild(optionIcon)

        	let handler = this.handlerFactory.create(colSettings.type, colSettings.options)
            handler.index = i
            // append handler HTML-elements to the cell
            handler.setRelatingCell(cell);
            ret.handler = handler
        }

        return ret;
    }
}

class Model {
    constructor(controller, settings) {
        this.controller = controller
        this.handlers = []
    }

    /**
     *  setter for handlers. called by the controller, only once
     *  @param {array} handlers
     *  @return {Model} this - for chaining
     */
    setHandlers(handlers) {
        this.handlers = handlers
        return this
    }

    /**
     *  divide and conquer - tell all handlers to update it's settings from the view.
     *  @return {Model} this - for chaining
     */
    updateHandlers() {
        this.handlers.forEach((handler) => {
            if (handler != null) handler.update()
        })
        return this
    }

    /**
     * only needed when beforeUpdate-function exists. It collects all necessary information from the handlers.
     * @return {array} stats - collection of all options of the active handlers
     */
    getStats() {
        let ret = []
        this.handlers.forEach((handler) => {
            let stats = handler.getOptions()
            if (handler.isActive()) ret.push(stats)
        })
        return ret
    }

    /**
     * MAIN METHOD OF THIS CLASS.
     * Executes the filtering operation, works directly on the data of the Tablemodify-instance (imperative style).
     * @return {Model} this - for chaining
     */
    filter() {
        if (tm.beforeUpdate('filter')) {
            this.updateHandlers()
            let all = tm.getAllRows(),
                matching,
                activeHandlers = this.handlers.filter((handler) => {return handler.isActive()})

            if (activeHandlers.length === 0) {
                // no filtering at all
                tm.setAvailableRows(all)
            } else {
                const maxDeph = activeHandlers.length;

                matching = all.filter((row) => {
                    let deph = 0, matches = true;

                    while (matches && deph < maxDeph) {
                        let handler = activeHandlers[deph],
                            j = handler.index,
    	            		cellContent = row.cells[j].textContent
                        matches = handler.matches(cellContent)
    	            	deph++
    	            }
                    return matches
                })

                tm.setAvailableRows(matching)
            }

	        tm.actionPipeline.notify('filter') // tell successor that an action took place
            return this
        }
    }
}

class Controller {
    constructor(settings) {
        // create cells and cellHandlers
        let cellFactory = new CellFactory(),
            _this = this,
            tHead = tm.domElements.head,
            count = tHead.firstElementChild.children.length,
            row = document.createElement('tr'),
            handlers = [],
            timeout

        this.settings = settings
        this.latestPanelZIndex = 1000

        this.headerHovered = false
        this.inputFocused = false
        this.tHead = tHead
        this.row = row
        
        for (let i = 0; i < count; i++) {
            let bundle = cellFactory.create(this.getColumnSettings(i), i)
            row.appendChild(bundle.cell)

            if (bundle.handler) {
                // this listener has to be added from outside the handlerFactory to be able to call run()
                bundle.handler.actionButton.addEventListener('click', () => {this.run()})
                bundle.cell.querySelector('div.tm-filter-option-icon').addEventListener('click', () => {
                    bundle.handler.clicked()
                })
            }

            handlers.push(bundle.handler || null)
        }

        this.model = new Model(this, settings)
        this.model.setHandlers(handlers)

        addClass(row, 'tm-filter-row')

        tHead.appendChild(row)

        if (settings.autoCollapse){
            // keep filter row opened if an input is focused
            tHead.addEventListener('focusin', (e) => {
                if (isPatternInput(e.originalTarget || e.target)) {
                    this.inputFocused = true
                    this.openRow()
                }
            })

            // release forced open row
            tHead.addEventListener('focusout', (e) => {
                if (isPatternInput(e.originalTarget || e.target)) {
                    this.inputFocused = false
                    this.closeRow()
                }
            })

            // slide-up and slide-down on hover and blur
            this.tHead.addEventListener('mouseenter', () => {
                this.headerHovered = true
                this.openRow()
            })

            this.tHead.addEventListener('mouseleave', () => {
                this.headerHovered = false
                this.closeRow()
            })

            // if header is fixed, also change the overflow-property of headWrap.
            // perform this change after the slide-up transition
            if (tm.domElements.headWrap) {
                row.addEventListener('transitionend', () => {
        			if (row.clientHeight > 5) {
        				tm.domElements.headWrap.style.overflow = 'visible'
        			} else {
        				tm.domElements.headWrap.style.overflow = 'hidden'
        			}
        		})
            }

        } else {
            // keep filter row always open
            row.style.height = FILTER_HEIGHT
            if (tm.domElements.headWrap) tm.domElements.headWrap.style.overflow = 'visible'
            this.openRow()
        }

        // bind listeners for typing to start the filter operation, after timeout or just on enter
        if (settings.filterAfterTimeout && !isNaN(settings.filterAfterTimeout)) {
            row.addEventListener('keyup', (e) => {
                clearTimeout(timeout)
                timeout = setTimeout(() => {
                    _this.run()
                }, settings.filterAfterTimeout)
            })
        } else {
            row.addEventListener('keyup', (e) => {
                if (e.keyCode == 13) this.run() // enter
            })
        }

        // insert toolbar row into tHead
        this.tHead.appendChild(row)

        addClass(row, 'tm-filter-row')
	}

	openRow() {
		addClass(tm.domElements.container, 'tm-filter-open')
        this.row.style.height = FILTER_HEIGHT
		return this
	}

	closeRow() {
		if (semaphor.val === 0 && !this.headerHovered && !this.inputFocused) {
			removeClass(tm.domElements.container, 'tm-filter-open')
            this.row.style.removeProperty('height')
    	}
		return this
	}

    /**
     * returns specific settings for one column
     * @TODO improve!!
     */
    getColumnSettings(i) {
    	let cols = this.settings.columns

    	if (cols.hasOwnProperty(i)) {
    		let ret = extend2(cols[i], cols.all)

    		if (ret.options && ret.type == 'string') {
        		delete ret.options.range
        		delete ret.options.comparator
        	} else if (ret.options && (ret.type == 'numeric' || ret.type == 'date')) {
        		delete ret.options.cs
        		delete ret.options.matching
        	}

    		return ret
    	}

    	return cols.all
    }

    getStats() {
        return this.model.getStats()
    }

    run() {
        this.model.filter()
    }
}

module.exports = new Module({
    name: "filter",
    defaultSettings: {
        autoCollapse: true,
        filterAfterTimeout: 500,
        columns: {
            all: {
                enabled: true,
                type: 'string'
            }
        }
    },
    initializer: function(settings) {
        // this := Tablemodify-instance
        try {
            tm = this;
            addClass(tm.domElements.container, 'tm-filter')
            let instance = new Controller(settings)
            info('module filter loaded')

            return {
                instance: instance,
                getStats: () => {
                	return instance.getStats()
                },
                notify: () => {
                	instance.run()
                },
                unset: () => {
                    console.info('unsetting filter, not implemented yet')
                }
            }
        } catch (e) {
            error(e)
        }
    }
})
