const {isNumber, hasClass, addClass, removeClass} = require('../utils.js');
const EvaluatorFactory = require('./filterEvaluators.js');

let tm, filterController, handlerList
let evaluatorFactory = new EvaluatorFactory()
let unique = (function() {
	let c = 0
	return function() {
		c++
		return c
	}
}())

class Handler {
    constructor(settings, index, cell) {
		let _this = this
		this.index = index
        this.cell = cell
		this.evaluator = null
		this.isVisible = false

        this.cell.innerHTML = `
            <div class='tm-filter-div'></div>
            <div class='tm-filter-icon'></div>
            <div class='tm-filter-panel'>
				<div class='tm-filter-panel-triangle'></div>
                <div class='tm-filter-panel-title'></div>
                <div class='tm-filter-panel-content'></div>
				<div class='tm-filter-panel-discard'></div>
            </div>`
		this.div = this.cell.querySelector('tm-filter-div')
		this.icon = this.cell.querySelector('.tm-filter-icon')
		this.discardIcon = this.cell.querySelector('.tm-filter-panel-discard')
		this.discardIcon.title = tm.getTerm('FILTER_DISCARD')
        this.panel = this.cell.querySelector('.tm-filter-panel')
		this.content = this.cell.querySelector('.tm-filter-panel-content')

		if (settings.beautify && typeof settings.beautify == 'function') {
			this.beautify = (val) => {
				try {
					return settings.beautify(val)
				} catch(e) {
					return false
				}
			}
		} else {
			this.beautify = (val) => val
		}


        // add event Listeners
		this.icon.addEventListener('click', (e) => {
			if (this.isVisible) {
				handlerList.setInActive(this)
			} else {
				handlerList.setActive(this)
			}
		})
		this.discardIcon.addEventListener('click', (e) => {
			[].slice.call(this.panel.querySelectorAll('input[type="text"]')).forEach((input) => {
				input.value = ''
			})
			this.evaluator.update(this)
			// force reload
			this.notifyController('manuell')
			handlerList.setInActive(this)
			e.stopPropagation()
		})

		this.panel.addEventListener('click', (e) => {
			handlerList.setActive(this)
		})

		this.panel.addEventListener('change', (e) => {
			this.evaluator.update(this)
			this.notifyController(e)
		}, false)

		this.panel.addEventListener('keyup', (e) => {
			this.evaluator.update(this)
			this.notifyController(e)
		}, false)
    }

    hide() {
		if (this.isVisible) {
			removeClass(this.icon, 'tm-filter-icon-open')
			this.panel.style.display = 'none'
			this.isVisible = false
		}
    }

    show() {
		if (!this.isVisible) {
			addClass(this.icon, 'tm-filter-icon-open')
			this.panel.style.display = 'block'

			let td = this.panel.parentElement,
				tr = td.parentElement,
				rowWidth = tr.clientWidth,
				panelWidth = this.panel.clientWidth,
				cellOffset = td.offsetLeft

			if (cellOffset + panelWidth + 20 > rowWidth) {
				addClass(this.panel, 'tm-filter-panel-rightaligned')
			}

			this.isVisible = true
		}
    }

	checkIfActive() {
		if (this.evaluator.isActive()) {
			addClass(this.cell, 'tm-filter-active')
			this.discardIcon.style.display = 'block'
			return true
		} else {
			removeClass(this.cell, 'tm-filter-active')
			this.discardIcon.style.display = 'none'
			return false
		}
	}

    setTitle(str) {
        this.panel.querySelector('.tm-filter-panel-title').innerHTML = str
    }

	setZIndex(val) {
		this.panel.style.zIndex = val
		return this
	}

    setContent(str, replace = true) {
		let content = this.panel.querySelector('.tm-filter-panel-content')

		if (replace) {
			while(content.firstChild) {
				content.removeChild(content.firstChild)
			}
		}

		if (typeof str == 'object') {
			content.appendChild(str)
		} else if (typeof str == 'string') {
			content.innerHTML += str
		}
		return this
    }

    getEvaluator() {
        return this.evaluator
    }

	notifyController(param) {
		tm.trigger('handlerChange', param)
	}
}

class StringHandler extends Handler {
    constructor(settings, index, cell) {
        super(settings, index, cell)
		let _this = this,
			options = settings.options

        this.evaluator = evaluatorFactory.create('string', index)
        this.setTitle(tm.getTerm('FILTER_TITLE_STRING'))
		addClass(this.panel, 'tm-filter-stringpanel')
		let fragment = document.createDocumentFragment()
		let div = document.createElement('div')
		let input = document.createElement('input')
		input.type = 'text'
		this.patternInput = input
		div.appendChild(input)
		fragment.appendChild(div)

        if (options.cs) {
			div = document.createElement('div')
			input = document.createElement('input')
			input.type = 'checkbox'
			input.value = 'cs'
			div.appendChild(input)
			div.innerHTML += tm.getTerm('FILTER_CASESENSITIVE')
			this.csCheckbox = input
			fragment.appendChild(div)
        }
        if (options.matching) {
			div = document.createElement('div')
			input = document.createElement('input')
			input.type = 'checkbox'
			input.value = 'matching'
			div.appendChild(input)
			div.innerHTML += tm.getTerm('FILTER_MATCHING')
			this.matchingCheckbox = input
			fragment.appendChild(div)
        }
		this.setContent(fragment)

		this.panel.addEventListener('change', (e) => {
			let el = e.target
			if (el.nodeName === 'INPUT' && el.type === 'checkbox' && this.patternInput.value == '') {
				e.stopPropagation()
			}
		}, true)

    }

	getPattern() {
		let pattern = this.patternInput.value
		if (pattern === '') {
			return null
		} else {
			return this.beautify(pattern)
		}
	}

	getCS() {
		if (this.hasOwnProperty('csCheckbox')) {
			return this.csCheckbox.checked
		} else {
			return false
		}
	}

	getMatching() {
		if (this.hasOwnProperty('matchingCheckbox')) {
			return this.matchingCheckbox.checked
		} else {
			return false
		}
	}
}

class NumericHandler extends Handler {
    constructor(settings, index, cell) {
        super(settings, index, cell)
		let options = settings.options

		if (!settings.beautify) {
			this.beautify = (val) => parseFloat(val)
		}

        this.evaluator = evaluatorFactory.create('numeric', index)
        this.setTitle(tm.getTerm('FILTER_TITLE_NUMERIC'))
		addClass(this.panel, 'tm-filter-numericpanel')

		this.comparatorElement = document.createElement('div')
		this.rangeElement = document.createElement('div')
		this.controllerElement = document.createElement('div')
		addClass(this.comparatorElement, 'tm-filter-comparator-input')
		addClass(this.rangeElement, 'tm-filter-range-input')

		// comparator element
		let fragment = document.createDocumentFragment()
		let select = document.createElement('select')
		select.innerHTML = `
			<option selected>=</option>
			<option>&lt;</option>
			<option>&gt;</option>
			<option>&lt;=</option>
			<option>&gt;=</option>`
		addClass(select, 'tm-filter-option-comparator')
		fragment.appendChild(select)
		this.comparatorSelect = select
		let input = document.createElement('input')
		addClass(input, 'tm-filter-pattern')
		input.type = 'text'
		input.placeholder = tm.getTerm('FILTER_PLACEHOLDER')
		fragment.appendChild(input)
		this.patternInput = input
		this.comparatorElement.appendChild(fragment)

		// range element
		input = document.createElement('input')
		input.type = 'text'
		input.placeholder = 'von'
		addClass(input, 'tm-filter-minVal')
		fragment.appendChild(input)
		this.minValInput = input
		let span = document.createElement('span')
		span.innerHTML = '-'
		fragment.appendChild(span)
		input = document.createElement('input')
		input.type = 'text'
		input.placeholder = 'bis'
		addClass(input, 'tm-filter-maxVal')
		fragment.appendChild(input)
		this.maxValInput = input
		this.rangeElement.appendChild(fragment)

		// controller element
		let id = 'handler-' + unique()

		this.controllerElement.innerHTML =
		`<div><input type='radio' name='${id}' value='comparator' checked />Vergleichsoperator</div>
		 <div><input type='radio' name='${id}' value='range' />Wertebereich</div>`

        if (!options.range) {
            // only enable comparator -> at least one must be set
            this.setContent(this.comparatorElement)
			this._mode = 'comparator'
        } else if (!options.comparator) {
            // only enable range
            this.setContent(this.rangeElement)
			this._mode = 'range'
        } else {
			// enable both
            this.setContent(this.comparatorElement)
				.setContent(this.controllerElement, false)
			this._mode = 'comparator'
        }

		this.panel.addEventListener('change', (e) => {
			let el = e.target
			if (el.tagName === 'SELECT' && this.patternInput.value === '') {
				e.stopPropagation()
			} else if (el.tagName === 'INPUT' && el.type === 'radio') {
				this.setMode(el.value)
				if (this.isAllEmpty()) e.stopPropagation()
			}
		}, true)
    }

	getMode() {
		return this._mode
	}

	getComparator() {
		if (this.comparatorSelect) {
			return this.comparatorSelect.value
		} else {
			return '='
		}
	}

	_getAnyInputValue(type) {
		let val = this[type].value
		val = this.beautify(val)
		if (!isNumber(val)) {
			return null
		} else {
			return val
		}
	}

	getPattern() {
		return this._getAnyInputValue('patternInput')
	}

	getMinVal() {
		return this._getAnyInputValue('minValInput')
	}

	getMaxVal() {
		return this._getAnyInputValue('maxValInput')
	}

	isAllEmpty() {
		return (this.getPattern() === null)
			&& (this.getMinVal() === null)
			&& (this.getMaxVal() === null)
	}

    setMode(mode) {
		let panel = this.panel
        if (mode == 'comparator') {
			this.content.replaceChild(this.comparatorElement, panel.querySelector('div.tm-filter-range-input'))
			this._mode = mode
			//this.evaluator.setMode(mode)
        } else if (mode == 'range') {
			this.content.replaceChild(this.rangeElement, panel.querySelector('div.tm-filter-comparator-input'))
			this._mode = mode
			//this.evaluator.setMode(mode)
        } else {
			throw new Exception('invalid mode value passed')
		}
    }
}

/**
 *    export class Factory, handlers itself are not directly accessible
 */
module.exports = class Factory {
    constructor(tmInstance, fc, hl) {
        tm = tmInstance
		filterController = fc
		handlerList = hl
    }

    create(settings, index, cell) {
        switch(settings.type) {
            case 'numeric':
                return new NumericHandler(settings, index, cell)
            default:
                return new StringHandler(settings, index, cell)
        }
    }
}
