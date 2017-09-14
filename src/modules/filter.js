const {hasClass, addClass, removeClass, extend2, isNumber, log, info, error} = require('../utils.js');
const Module = require('./module.js');
const HandlerFactory = require('./filterHandlers.js');

let tm

class HandlerList {
    constructor() {
        this.list = []
        this.limit = 1
    }

    setLimit(val) {
        this.limit = val
    }

    countShown() {
        return this.list.length
    }

    hideAll() {
        while (this.list.length > 0)
            this.setInActive(this.list[0])
    }

    setActive(handler) {
        if (this.list.length === 0) {
            addClass(tm.domElements.container, 'tm-filter-open')
        }

        let index = this.list.indexOf(handler)
        if (index !== -1) this.list.splice(index, 1)
        if (this.list.length == this.limit) {
            let odd = this.list.shift()
            odd.hide()
        }
        this.list.push(handler)
        handler.show()
        this._setZIndices()
    }

    setInActive(handler) {
        let index = this.list.indexOf(handler)
        if (index !== -1) {
            this.list.splice(index, 1)
            handler.hide()
            this._setZIndices()
        }

        if (this.list.length === 0) {
            removeClass(tm.domElements.container, 'tm-filter-open')
        }
    }

    _setZIndices() {
        let offset = 10
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].setZIndex(offset+i)
        }
    }
}
let handlerList = new HandlerList()

let defaultStringSettings = {
    enabled: true,
    type: 'string',
    options: {
        cs: false,
        matching: false
    }
},
defaultNumericSettings = {
    enabled: true,
    type: 'numeric',
    options: {
        comparator: true,
        range: true
    }
}

class Model {
    constructor() {
        this.evaluators = null
    }

    setEvaluators(evaluators) {
        this.evaluators = evaluators
    }

    getStats() {
        let ret = []
        for (let i = 0; i < this.evaluators.length; i++) {
            let evaluator = this.evaluators[i]
            if (evaluator.isActive()) {
                let stats = evaluator.getStats()
                ret.push(stats)
            }
        }
        return ret
    }

    filter() {
        if (tm.beforeUpdate('filter')) {
            let all = tm.getAllRows(),
                matching,
                activeEvaluators = this.evaluators.filter((evaluator) => {return evaluator.isActive()})

            if (activeEvaluators.length === 0) {
                tm.setAvailableRows(all)
            } else {
                const maxDeph = activeEvaluators.length

                matching = all.filter((row) => {
                    let deph = 0, matches = true

                    while (matches && deph < maxDeph) {
                        let evaluator = activeEvaluators[deph],
                            i = evaluator.index,
    	            		cellContent = row.cells[i].textContent
                        matches = evaluator.evaluate(cellContent)
    	            	deph++
    	            }
                    return matches
                })
                tm.setAvailableRows(matching)
            }
            tm.actionPipeline.notify('filter') // tell successor that an action took place
        }
        return this
    }
}


class Controller {
    constructor(settings) {
        // attribute
        this.settings = settings
        this.handlers = []
        this.model = new Model()
        handlerList.setLimit(settings.maxPanelsOpen)

        // basic setup
        let _this = this,
            timeout,
            tHead = tm.domElements.head,
            count = tHead.firstElementChild.children.length,
            row = document.createElement('tr'),
            handlerFactory = new HandlerFactory(tm, this, handlerList)
        tHead.appendChild(row)
        addClass(row, 'tm-filter-row')

        if (!settings.autoCollapse) {
            addClass(tm.domElements.container, 'tm-filter-keep-open')
        }

        // settings aufbereiten
        let colSettings = settings.columns
        Object.keys(colSettings).forEach((key) => {
            if (key == 'all') return;
            if (colSettings.hasOwnProperty(key) && isNaN(key)) {
                let index = tm.id2index(key)

                if (index != null) {
                    index = index.toString()
                    colSettings[index] = colSettings[key]
                    delete colSettings[key]
                }
            }
        })
        this.columnSettings = colSettings
        // zellen generieren
        let fragment = document.createDocumentFragment()
        for (let i = 0; i < count; i++) {
            fragment.appendChild(document.createElement('td'))
        }
        row.appendChild(fragment)
        this.row = row
        // zellen mit funktionalität ausstatten
        let cells = [].slice.call(row.children)
        let evaluators = []
        for (let i = 0; i < cells.length; i++) {
            let cell = cells[i],
                settings = this.getColumnSettings(i),
                handler = null

            if (settings.enabled) {
                handler = handlerFactory.create(settings, i, cell)
                evaluators.push(handler.getEvaluator())
            }
            this.handlers.push(handler)
        }

        this.model.setEvaluators(evaluators)

        tm.on('handlerChange', (e) => {
            if (e === 'manuell') {
                this.run()
            } else if (e.type == 'keyup' && e.key == 'Enter') {
                this.run()
            } else if (e.type == 'keyup' && isNumber(settings.filterAfterTimeout)) {
                clearTimeout(timeout)
    			timeout = window.setTimeout(() => {
    				this.run()
    			}, settings.filterAfterTimeout)
            } else if (e.type === 'change' && !(e.target.nodeName === 'INPUT' && e.target.type === 'text')) {
                this.run()
            }
        })
    }

    setOpen() {
        addClass(tm.domElements.container, 'tm-filter-open')
    }

    setClosed() {
        if (semaphor.val === 0) {
            removeClass(tm.domElements.container, 'tm-filter-open')
        }
    }

    /**
     *  method MUST return correct setting for a passed index!
     * @return {object} settings
     */
    getColumnSettings(i) {
        i = i.toString()
        let settings

        if (this.columnSettings.hasOwnProperty(i)) {
            settings = extend2(this.columnSettings[i], this.columnSettings.all)
        } else {
            settings = this.columnSettings.all
        }

        switch(settings.type) {
            case 'numeric':
                extend2(settings, defaultNumericSettings)
                delete settings.options.cs
                delete settings.options.matching
                break;
            default: // string is default
                extend2(settings, defaultStringSettings)
                delete settings.options.comparator
                delete settings.options.range
        }
        return settings
    }

    /**
     * only needed when beforeUpdate-function exists. It collects all necessary information from the handlers.
     * @return {array} stats - collection of all options of the active handlers
     */
    getStats() {
        return this.model.getStats()
    }

    /**
     * MAIN METHOD OF THIS CLASS.
     * Executes the filtering operation, works directly on the data of the Tablemodify-instance (imperative style).
     * @return {Model} this - for chaining
     */
    run() {
        this.model.filter()
        // highlight all active handlers
        let oneOpen = false
        this.handlers.forEach((handler) => {
            if (handler !== null && handler.checkIfActive()) {
                oneOpen = true
            }
        })

        if (!oneOpen && this.settings.autoCollapse) {
            removeClass(tm.domElements.container, 'tm-filter-keep-open')
        } else {
            addClass(tm.domElements.container, 'tm-filter-keep-open')
        }
        return this
    }
}


module.exports = new Module({
    name: "filter",
    defaultSettings: {
        autoCollapse: true,
        maxPanelsOpen: 3,
        filterAfterTimeout: 500,
        columns: {
            all: {
                enabled: true,
                type: 'string',
                options: {}
            }
        }
    },
    initializer: function(settings) {
        // this := Tablemodify-instance
        try {
            tm = this
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
