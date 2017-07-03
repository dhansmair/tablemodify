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
    constructor() {

        this.pattern = ''
        this.index = null

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

	movePanelToTheTop() {
		this.panel.style.zIndex = latestZIndex++
		return this
	}

    setRelatingCell(cell) {
        this.relatingCell = cell
        cell.appendChild(this.panel)
		return this
    }

    setTitle(string) {
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
        this.isVisible = false
        semaphor.down()
		removeClass(this.relatingCell, 'tm-filter-optionpanel-open')
		this.panel.style.removeProperty('zIndex')
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
        super();

        // create View for stringHandler
        let titleString = tm.getTerm('FILTER_TITLE_STRING'),
        	csString = tm.getTerm('FILTER_CASESENSITIVE'),
        	matchingString = tm.getTerm('FILTER_MATCHING')

        this.setTitle(titleString)

        if (settings.cs) {
            this.appendContent(`<div><input type='checkbox' class='tm-cs'/><span>${csString}</span></div>`)
        }

        if (settings.matching) {
            this.appendContent(`<div><input type='checkbox' class='tm-matching'/><span>${matchingString}</span></div>`)
        }

        // options for this handler
        this.pattern = ''
        this.cs = true
        this.matching = true
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

        this.cs = this.contentPanel.querySelector('input.tm-cs').checked
        this.matching = this.contentPanel.querySelector('input.tm-matching').checked
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
        super();

        let titleString = tm.getTerm('FILTER_TITLE_NUMERIC'),
	        comparatorString = tm.getTerm('FILTER_COMPARATOR'),
	        rangeString = tm.getTerm('FILTER_RANGE'),
	        rangeLimitString = tm.getTerm('FILTER_RANGE_LIMIT')

        // DOM
        this.setTitle(titleString)

		let id = 'handler-' + unique()

		if (settings.comparator) {
			this.appendContent(`<div><span><input type='radio' name='${id}' value='comparator' checked/></span>
			<span>${comparatorString}:</span><span>
			<select class='tm-filter-option-comparator'>
				<option selected>=</option>
				<option>&lt;</option>
				<option>&gt;</option>
				<option>&lt;=</option>
				<option>&gt;=</option>
			</select></span>
			</div>`)
		}

		if (settings.range) {
			this.appendContent(`<div><span><input type='radio' name='${id}' value='range'/></span>
			<span>${rangeString}:</span>
			<span><input type='text' placeholder='${rangeLimitString}' class='tm-filter-range-value' /></span>
			</div>`)
		}

        // default options for this handler, will be overwritten
        this.option = 'comparator'
		this.value = '='
		this.pattern = 0

        // default internal comparator function, gets overwritten when update is called
        this._internalComparatorFunction = () => {throw new Exception("this must never be called")}
    }

    getOptions() {
        this.update()
        return {
            type: 'numeric',
            index: this.index,
            pattern: this.pattern, // numeric value
            option: this.option, // range or comparator
            value: this.value // =, <, >, <=, >= (comparator) or numeric value
        };
    }

    update() {
		let pattern = this.relatingCell.querySelector('.tm-input-div > input').value.trim(),
			comparatorRegex = /^(\s)*(<|>|=|<=|>=)(\s)*[+-]?[0-9]+(\s)*$/,
			rangeRegex = /^(\s)*[+-]?[0-9]+(\s)*((bis)|-)(\s)*[+-]?[0-9]+(\s)*$/

		// check for pattern
		if (comparatorRegex.test(pattern)) {
			console.info('comparator pattern detected! (But this feature is not implemented yed...)');

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
				this.value = arr[0]
				this.pattern = arr[1]
			} else {
				throw new Exception("regex went wrong!");
			}

		} else {
			// update option, value, pattern
	        let radio = this.contentPanel.querySelector('input[type=radio]:checked'),
				val
			if (radio.value == 'comparator') {
				let select = this.contentPanel.querySelector('select')
				val = select.options[select.selectedIndex].textContent
			} else {
				val = parseFloat(this.contentPanel.querySelector('input.tm-filter-range-value').value)
			}

	        this.option = radio.value
	        this.value = val
	        this.pattern = (pattern.length > 0) ? parseFloat(pattern) : null
		}


        // update comparator function
        if (this.option === 'comparator') {

			let c = Handler.operatorString2Function(this.value)
			this._internalComparatorFunction = (num) => {
				return c(num, this.pattern)
			}

		} else if (this.option === 'range') {
			this._internalComparatorFunction = (num) => {
				return (num <= this.pattern && num >= this.value) || (num >= this.pattern && num <= this.value)
			}
		}

    }

    matches(value) {
        return this._internalComparatorFunction(parseFloat(value))
    }

    isActive() {
        return this.pattern !== null && !isNaN(this.pattern)
    }
}

/**
 * Handler class for dates
 * NOT COMPLETELY IMPLEMENTED YET
 + @TODO IMPLEMENT
 */
class DateHandler extends StringHandler {
    constructor(settings) {
        super(settings)

        let titleString = tm.getTerm('FILTER_TITLE_DATE')

        this.setTitle(titleString)
		console.info("DateHandlers are not fully implemented yet! using StringHandler instead...");
    }

	//getOptions() {}
	//update() {}

    /**
     * method matches
     * only this method differs from NumericHandler
     */
    //matches(value) {}

	//isActive() {
	//	return this.pattern !== null
	//}
}

/**
 *    export class Factory, handlers itself are not directly accessible
 */
module.exports = class Factory {
    constructor(tmInstance, s) {
        tm = tmInstance
        semaphor = s
    }

    create(type, settings) {
        switch(type) {
            case 'date':
                return new DateHandler(settings)
            case 'numeric':
                return new NumericHandler(settings)
            default:
                return new StringHandler(settings)
        }
    }
}
