const {elementIndex, isNonEmptyString, addClass, removeClass} = require('../utils.js');
let tm, semaphor;

let unique = (function() {
	let c = 0
	return function() {
		c++
		return c
	}
}())

// this value gets incremented when a panel is clicked and the panels z-Index is set to it.
// this guarantees that the latest interesting panel is always on top layer
let latestZIndex = 5000

/**
 * general Handler class
 */
class Handler {
    constructor(settings = null) {

        this.pattern = ''
        this.index = null

		if (settings != null) {
			// create Panel
	        this.panel = document.createElement('div')

			let _this = this,
				titlePanel = document.createElement('div'),
				contentPanel = document.createElement('div'),
				actionButton = document.createElement('div')

			this.titlePanel = titlePanel
			this.contentPanel = contentPanel
			this.actionButton = actionButton

			this.panel.appendChild(titlePanel)
			this.panel.appendChild(contentPanel)
			this.panel.appendChild(actionButton)

			addClass(titlePanel, 'tm-filter-optionpanel-title')
			addClass(contentPanel, 'tm-filter-optionpanel-content')
			addClass(this.panel, 'tm-filter-optionpanel')
			addClass(actionButton, 'tm-filter-optionpanel-actionButton')

			actionButton.setAttribute('title', 'anwenden')

			// this event is just for the look and therefore the listener is added here
			this.panel.addEventListener('click', () => {
				this.movePanelToTheTop()
			})
		}
    }

	movePanelToTheTop() {
		this.panel.style.zIndex = latestZIndex++
		return this
	}

    setRelatingCell(cell) {
        this.relatingCell = cell
        if (this.hasPanel()) {
			cell.appendChild(this.panel)
		}
		return this
    }

    setTitle(string) {
		if (!this.hasPanel()) return this;

        this.panel.children[0].innerHTML = string
		return this
    }

    appendContent(string) {
        this.contentPanel.innerHTML += string
		return this
    }

    clicked() {
        if (this.isVisible) {
            this.close()
        } else {
            this.open()
        }
    }

    open() {
		if (!this.hasPanel()) {
			console.log('no options available')
			return;
		}

        this.isVisible = true
        semaphor.up()

        let cellOffset = this.relatingCell.offsetLeft,
	        rowWidth = this.relatingCell.parentElement.clientWidth,
        	panelWidth = this.panel.clientWidth

        if (cellOffset + panelWidth > rowWidth) {
            this.panel.style.left = (rowWidth - cellOffset - panelWidth - 20) + 'px'
        }

		addClass(this.relatingCell, 'tm-filter-optionpanel-open')
		this.movePanelToTheTop()
    }

    close() {
		if (!this.hasPanel()) {
			console.log('no options available')
			return;
		}
        this.isVisible = false
        semaphor.down()
		removeClass(this.relatingCell, 'tm-filter-optionpanel-open')
		this.panel.style.removeProperty('zIndex')
    }

	hasPanel() {
		return this.hasOwnProperty('panel')
	}

    /**
     * used to transform an operator-String into a function
     */
    static operatorString2Function(operatorString) {
		switch(operatorString) {
			case '<': return function(a, b) {return a < b}
			case '>': return function(a, b) {return a > b}
			case '<=': return function(a, b) {return a <= b}
			case '>=': return function(a, b) {return a >= b}
			default: return function(a, b) {return a == b}
		}
	}

    // these are overwritten:
    getOptions() {}
    matches(value) {}
    update() {}

    isActive() {
        return true
    }
}

/**
* Handler class for Strings
*   OPTIONS:
*   cs
*   matching
*/
class StringHandler extends Handler {
    constructor(settings) {
        super(settings);

        // create View for stringHandler
        let titleString = tm.getTerm('FILTER_TITLE_STRING'),
        	csString = tm.getTerm('FILTER_CASESENSITIVE'),
        	matchingString = tm.getTerm('FILTER_MATCHING')

		if (settings != null) {
			this.setTitle(titleString)

	        if (settings.cs) {
	            this.appendContent(`<div><input type='checkbox' class='tm-cs'/><span>${csString}</span></div>`)
	        }

	        if (settings.matching) {
	            this.appendContent(`<div><input type='checkbox' class='tm-matching'/><span>${matchingString}</span></div>`)
	        }
		}

        // options for this handler
        this.pattern = ''
        this.cs = false
        this.matching = false
    }

    // get current settings of this handler
    getOptions() {
        this.update()
		return {
			type: 'string',
            index: this.index,
            pattern: this.pattern,
			matching: this.matching,
			cs: this.cs
		}
	}

    update() {
		let pattern = this.relatingCell.querySelector('.tm-input-div > input').value.trim() || null

		if (this.hasPanel()) {
			this.cs = this.contentPanel.querySelector('input.tm-cs').checked
	        this.matching = this.contentPanel.querySelector('input.tm-matching').checked
		} else {
			this.cs = false
			this.matching = false
		}

		this.pattern = (pattern == null || this.cs) ? pattern : pattern.toLowerCase()
    }

    matches(tester) {
		let pattern = this.pattern

		if (!this.cs) {
			tester = tester.toLowerCase()
		}

		if (this.matching) {
			return tester === pattern
		} else {
			return tester.indexOf(pattern) !== -1
		}
	}

    isActive() {
        return isNonEmptyString(this.pattern)
    }
}

/**
 * Handler class for numerics
 */
class NumericHandler extends Handler {
    constructor(settings) {
        super(settings);

        let titleString = tm.getTerm('FILTER_TITLE_NUMERIC'),
	        comparatorString = tm.getTerm('FILTER_COMPARATOR'),
			comparatorPlaceholder = tm.getTerm('FILTER_PLACEHOLDER'),
	        rangeString = tm.getTerm('FILTER_RANGE'),
	        rangeLimitString = tm.getTerm('FILTER_RANGE_LIMIT')

		if (this.hasPanel()) {
			this.setTitle(titleString)

			this.rangeModeInput = document.createElement('div')
			addClass(this.rangeModeInput, 'tm-input-div')
			addClass(this.rangeModeInput, 'tm-input-mode-range')
			this.rangeModeInput.innerHTML = `<input type='text' placeholder='von' /> - <input type='text' placeholder='bis'/>`

			this.comparatorModeInput = document.createElement('div')
			addClass(this.comparatorModeInput, 'tm-input-div')
			addClass(this.comparatorModeInput, 'tm-input-mode-comparator')
			this.comparatorModeInput.innerHTML = `<select class='tm-filter-option-comparator'>
				<option selected>=</option>
				<option>&lt;</option>
				<option>&gt;</option>
				<option>&lt;=</option>
				<option>&gt;=</option>
			</select><input type='text' placeholder='${comparatorPlaceholder}'/>`

			let id = 'handler-' + unique()

			if (settings.comparator) {
				this.appendContent(`<div><span><input type='radio' name='${id}' value='comparator' checked/></span>
				<span>${comparatorString}</span>
				</div>`)
			}

			if (settings.range) {
				this.appendContent(`<div><span><input type='radio' name='${id}' value='range'/></span>
				<span>${rangeString}</span>
				<!--<span><input type='text' placeholder='${rangeLimitString}' class='tm-filter-range-value' /></span>-->
				</div>`)
			}

			// register event
			this.panel.addEventListener('change', (e) => {
				if (e.target.type == 'radio') {
					let val = e.target.value;
					if (val == 'comparator' || val == 'range') {
						this.setMode(val)
					}
				}
			})

			//this.setMode('comparator')
		}

        // default options for this handler, will be overwritten
        this.option = 'comparator'
		this.mode = 'comparator'
		this.value = '='
		this.pattern = 0

        // default internal comparator function, gets overwritten when update is called
        this._internalComparatorFunction = () => {throw new Exception("this must never be called")}
    }

	// overwrite
	setRelatingCell(cell) {
        this.relatingCell = cell
        if (this.hasPanel()) {
			cell.appendChild(this.panel)
		}
		this.mode = ''
		this.setMode('comparator')
		return this
    }

	setMode(mode = 'comparator') {
		if (!this.hasPanel()) {
			return;
		}

		if (this.mode == mode) return;
		let cell = this.relatingCell
		if (mode == 'comparator') {
			// switch mode to comparator
			let newChild = this.comparatorModeInput
			cell.replaceChild(newChild, cell.firstElementChild)

		} else {
			// switch mode to range
			let newChild = this.rangeModeInput
			cell.replaceChild(newChild, cell.firstElementChild)
		}
		this.mode = mode
		return this
	}

    getOptions() {
        this.update()

		let ret = {
			type: 'numeric',
			index: this.index,
			option: this.option
		}

		if (this.mode == 'comparator') {
			ret.pattern = this.pattern
			ret.value = this.value
		} else if (this.mode == 'range') {
			ret.minVal = this.minVal
			ret.maxVal = this.maxVal
		}

		return ret
    }

    update() {
		if (this.mode == 'comparator') {
			// in comparator mode, also regular expressions are allowed
			let pattern = this.relatingCell.querySelector('.tm-input-div > input').value.trim(),
				comparatorRegex = /^(\s)*(<|>|=|<=|>=)(\s)*[+-]?[0-9]+(\s)*$/,
				rangeRegex = /^(\s)*[+-]?[0-9]+(\s)*((bis)|-)(\s)*[+-]?[0-9]+(\s)*$/

				if (comparatorRegex.test(pattern)) {
					console.info('comparator pattern detected!');

					// split pattern and fill values
					let arr = pattern.match(/(<=|>=|<|>|=|[+-]?[0-9]+)/g);

					if (arr.length == 2) {
						this.option = "comparator"
						this.value = arr[0]
						this.pattern = arr[1]
					} else {
						throw new Exception("regex went wrong!");
					}

				} else if (rangeRegex.test(pattern)) {
					console.info("range pattern detected!")
					let arr = pattern.match(/[+-]?[0-9]+/g)

					if (arr.length == 2) {
						this.option = "range"
						this.minVal = arr[0]
						this.maxVal = arr[1]
					} else {
						throw new Exception("regex went wrong!");
					}
				} else {
					// default comparator test
					let select = this.relatingCell.querySelector('select'),
						val = select.options[select.selectedIndex].textContent

					if (pattern.length > 0) {
						pattern = parseFloat(pattern)
					} else {
						pattern = null
					}

					this.option = 'comparator'
					this.value = val// the comparator
					this.pattern = pattern// the number
				}
		} else if (this.mode == 'range') {
			let minVal = this.relatingCell.querySelector('div.tm-input-div input:nth-child(1)').value.trim(),
				maxVal = this.relatingCell.querySelector('div.tm-input-div input:nth-child(2)').value.trim()

			if (minVal.length > 0) {
				minVal = parseFloat(minVal)
			} else {
				minVal = null
			}

			if (maxVal.length > 0) {
				maxVal = parseFloat(maxVal)
			} else {
				maxVal = null
			}

			this.option = 'range'
			this.minVal = minVal
			this.maxVal = maxVal
		} else {
			// error
		}

        // update comparator function
        if (this.option === 'comparator') {
			let c = Handler.operatorString2Function(this.value)
			this._internalComparatorFunction = (num) => {
				return c(num, this.pattern)
			}
		} else if (this.option === 'range') {
			this._internalComparatorFunction = (num) => {
				if ((minVal !== null && num < minVal)
				||  (maxVal !== null && num > maxVal)) {
					return false
				}
				return true
			}
		}
    }

    matches(value) {
        return this._internalComparatorFunction(parseFloat(value))
    }

    isActive() {
        //return this.pattern !== null && !isNaN(this.pattern)
		if (this.mode == 'comparator') {
			return this.pattern !== null && !isNaN(this.pattern)
		} else if (this.mode == 'range') {
			return this.minVal === null && this.maxVal === null
		} else {
			// error
			throw new Error('no filter mode declarated')
		}
    }
}

/**
 * Handler class for dates
 * NOT COMPLETELY IMPLEMENTED YET
 + @TODO IMPLEMENT
 */
/*
class DateHandler extends StringHandler {
    constructor(settings) {
        super(settings)

        let titleString = tm.getTerm('FILTER_TITLE_DATE')

        this.setTitle(titleString)
		console.info("DateHandlers are not fully implemented yet! using StringHandler instead...");
    }

	//getOptions() {}
	//update() {}


    //matches(value) {}

	//isActive() {
	//	return this.pattern !== null
	//}
}
*/
/**
 *    export class Factory, handlers itself are not directly accessible
 */
module.exports = class Factory {
    constructor(tmInstance, s) {
        tm = tmInstance
        semaphor = s
    }

    create(type, settings = null) {
        switch(type) {
            /*case 'date':
                return new DateHandler(settings)*/
            case 'numeric':
                return new NumericHandler(settings)
            default:
                return new StringHandler(settings)
        }
    }
}
