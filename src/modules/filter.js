const {addClass, removeClass, iterate, info, error, replaceIdsWithIndices, extend2} = require('../utils.js');
const Module = require('./module.js');
const FILTER_HEIGHT = '30px';

let countOpen = 0;

var unique = (function(){
	var c = 0;
	
	return function() {
		c++;
		return c;
	}
	
}());


/**
    Factory class to produce filter cells
*/
class CellFactory {
    constructor(tm) {
    	this.tm = tm;
        let placeholder = tm.getTerm('FILTER_PLACEHOLDER'),
            caseSensitive = tm.getTerm('FILTER_CASESENSITIVE');

        this.optionHandlerFactory = new OptionHandlerFactory(tm);
        
        this.div = document.createElement('div');
        addClass(this.div, 'tm-filter-option-icon');
        this.cell = document.createElement('td');
        this.cell.innerHTML = `<div class='tm-input-div'><input type='text' placeholder='${placeholder}' /></div>`;
    }
    
    /**
     * decide if the cell should have an option dropdown
     */
    _optionsVisible(options) {
    	if (!options) return false;
    	let keys = Object.keys(options);
    	for (let i = 0; i < keys.length; i++) {
    		if (options[keys[i]]) return true;
    	}
    	return false;
    }

    produce(colSettings) {
    	let tm = this.tm;
        if (!colSettings.enabled) return document.createElement('td');
        
        let ret = this.cell.cloneNode(true);
        
        // zelle mit optionen ausstatten
        if (this._optionsVisible(colSettings.options)) {
        	let optionHandler = this.optionHandlerFactory.create(colSettings.type, colSettings.options, ret),//new OptionHandler(colSettings.options),
        		div = this.div.cloneNode('true');
        	
        	optionHandler.appendToDOM(ret);
        	optionHandler.setRelatingCell(ret);
        	ret.tmFilterOptionHandler = optionHandler;
        	
            div.addEventListener('click', () => {
            	optionHandler.clicked();
            });
            ret.appendChild(div);
        }
      
        return ret;
    }
}

function getCell(e) {
    let cell = e.target;
    while (cell.cellIndex === undefined) {
        cell = cell.parentNode;
    }
    return cell;
}

class OptionHandler {
	constructor(options, tm, cell) {
		this.tm = tm;
		this.relatingCell = cell;
		this.options = options;
		this.isVisible = false;
		this.panel = document.createElement('div');
		
		var titlePanel = document.createElement('div');
		var contentPanel = document.createElement('div');
		var closeButton = document.createElement('div');
		
		
		this.titlePanel = titlePanel;
		this.contentPanel = contentPanel;
		this.closeButton = closeButton;
		
		
		this.panel.appendChild(titlePanel);
		this.panel.appendChild(closeButton);
		this.panel.appendChild(contentPanel);
		
		addClass(titlePanel, 'tm-filter-optionpanel-title');
		addClass(closeButton, 'tm-filter-optionpanel-closeButton');
		addClass(contentPanel, 'tm-filter-optionpanel-content');
		addClass(this.panel, 'tm-filter-optionpanel');
		
		closeButton.onclick = () => {
			this.close();
		};
		
	}
	
	setRelatingCell(el) {
		if (el) {
			this.relatingCell = el;
		} else {
			throw new Exception('cell not found');
		}
		return this;
	}
	
	
	clicked() {
		if (this.isVisible) {
			this.close();
		} else {
			this.open();
		}
	}
	
	open() {
		this.panel.style.display = 'block';
		this.isVisible = true;	
		countOpen++;
	}
	
	close() {
		this.panel.style.display = 'none';
		this.isVisible = false;
		countOpen--;
	}
	
	appendToDOM(parent) {
		parent.appendChild(this.panel);
	}
	
	setTitle(string) {
		this.panel.children[0].innerHTML = string;
	}
	
}

class OptionHandlerString extends OptionHandler {
	constructor(options, tm, cell) {
		super(options, tm, cell);
		
		this.setTitle('Filter nach Zeichenketten');
		
		if (options.cs) {
			this.contentPanel.innerHTML += `<div><input type='checkbox' class='tm-cs'/><span>Gro&szlig; - und Kleinschreibung unterscheiden</span></div>`;
		}
		
		if (options.matching) {
			this.contentPanel.innerHTML += `<div><input type='checkbox' class='tm-matching'/><span>genaue &Uuml;bereinstimmung</span></div>`;
		}
		
	}
	
	getOptions() {
		return {
			type: 'string',
			matching: this.contentPanel.querySelector('input.tm-matching').checked,
			cs: this.contentPanel.querySelector('input.tm-cs').checked
		};
	}
}

class OptionHandlerNumeric extends OptionHandler {
	constructor(options, tm, cell) {
		super(options, tm, cell);
		
		this.setTitle('Numerischer Filter');
		
		let id = 'handler-' + unique();
		
		if (options.comparator) {
			this.contentPanel.innerHTML += `<div><input type='radio' name='${id}' value='comparator' checked/><span>Vergleichsoperation:
			<select class='tm-filter-option-comparator'>
				<option selected>=</option>
				<option>&lt;</option>
				<option>&gt;</option>
				<option>&lt;=</option>
				<option>&gt;=</option>
			</select></span>
			</div>`;
		}
		
		if (options.range) {
			this.contentPanel.innerHTML += `<div><input type='radio' name='${id}' value='range'/>Zahlenbereich:
			<input type='text' placeholder='obere Grenze' class='tm-filter-range-value' />
			
			</span>
			</div>`;
		}
		
	}
	
	getOptions() {
		let radio = this.contentPanel.querySelector('input[type=radio]:checked');
		let val;
		if (radio.value == 'comparator') {
			let select = this.contentPanel.querySelector('select');
			val = select.options[select.selectedIndex].textContent; 
		} else {
			val = parseFloat(this.contentPanel.querySelector('input.tm-filter-range-value').value);
		}
		
		return {
			
			type: 'numeric',
			option: radio.value,
			value: val
		};
		
	}
}
class OptionHandlerDate extends OptionHandler {
	constructor(options, tm, cell) {
		super(options, tm, cell);
		
		this.setTitle('Datumsfilter');
		
		let id = 'handler-' + unique();
		
		if (options.comparator) {
			this.contentPanel.innerHTML += `<div><input type='radio' name='${id}' value='comparator' checked/><span>Vergleichsoperation:
			<select class='tm-filter-option-comparator'>
				<option selected>=</option>
				<option>&lt;</option>
				<option>&gt;</option>
				<option>&lt;=</option>
				<option>&gt;=</option>
			</select></span>
			</div>`;
		}
		
		if (options.range) {
			this.contentPanel.innerHTML += `<div><input type='radio' name='${id}' value='range'/>Datumsbereich:
			<input type='text' placeholder='obere Grenze' class='tm-filter-range-value' />
			
			</span>
			</div>`;
		}
		
	}
	
	getOptions() {
		let radio = this.contentPanel.querySelector('input[type=radio]:checked');
		let val;
		if (radio.value == 'comparator') {
			let select = this.contentPanel.querySelector('select');
			val = select.options[select.selectedIndex].textContent; 
		} else {
			val = parseFloat(this.contentPanel.querySelector('input.tm-filter-range-value').value);
		}
		
		return {
			
			type: 'date',
			option: radio.value,
			value: val
		};
		
	}
}


class OptionHandlerFactory {
	constructor(tm) {
		this.tm = tm;
	}
	create(type, options, cell) {
		switch(type) {
		case 'string':
			return new OptionHandlerString(options, this.tm, cell);
		case 'numeric':
			return new OptionHandlerNumeric(options, this.tm, cell);
		case 'date':
			return new OptionHandlerDate(options, this.tm, cell);
		default:
			console.warn('filter ' + type + ' is not existing!');
			return new OptionHandlerString(options, this.tm, cell);
	}
	}
}



class Filter {
	constructor() {}
	matches(tester) {}
	setOptions(options) {}
	_operatorString2Function(operatorString) {
		switch(operatorString) {
			case '<': return function(a, b) {return a < b};
			case '>': return function(a, b) {return a > b};
			case '<=': return function(a, b) {return a <= b};
			case '>=': return function(a, b) {return a >= b};
			default: return function(a, b) {return a == b};
		}
	}	
}

/**
 * 
 */
class FilterString extends Filter {
	constructor() {
		super();
		this.cs = true;
		this.matching = false;
		this.pattern = '';
	}
	
	setOptions(options) {
		this.pattern = options.pattern;
		this.matching = options.matching;
		this.cs = options.cs;
		
		if (!options.cs) {
			this.pattern = this.pattern.toLowerCase();
		}
	}
	
	matches(tester) {
		let pattern = this.pattern;
		
		if (!this.cs) {
			tester = tester.toLowerCase();
		}
		
		if (this.matching) {
			return tester === pattern;
		} else {
			return tester.indexOf(pattern) !== -1;
		}
	}
}

/**
 * 
 */
class FilterNumeric extends Filter {
	constructor() {
		super();
		this.option = 'comparator';
		this.value = '=';
		this.pattern = 0;	
	}
	
	setOptions(options) {
		
		this.option = options.option;
		this.value = options.value;
		this.pattern = parseFloat(options.pattern);
				
		if (this.option === 'comparator') {
			
			let c = this._operatorString2Function(options.value);
			this._comparator = (num) => {
				return c(num, this.pattern);
			};
			
		} else if (this.option === 'range') {
			
			this.value = parseFloat(options.value);
			this._comparator = (num) => {
				return (num <= this.pattern && num >= this.value) || (num >= this.pattern && num <= this.value);
			};
		}		
	}
	
	matches(tester) {
		tester = parseFloat(tester);
		return this._comparator(tester);
	}
	
	// wird in setOptions überschrieben
	_comparator(num) {}
}

/**
 * 
 */
class FilterDate extends Filter {
	constructor() {
		super();
	}
	
	setOptions(options) {}
	
	matches(tester) {
		return true;
	}
}

class FilterFactory {
	constructor() {}
	
	create(type) {
		switch(type) {
			case 'string':
				return new FilterString();
			case 'numeric':
				return new FilterNumeric();
			case 'date':
				return new FilterDate();
			default:
				console.warn('filter ' + type + ' is not existing!');
				return new FilterString();
		}
	}
}


// prototype for Filter
class Model {

    constructor(tm, controller, settings) {
        this.tm = tm;
        this.controller = controller;
        this.filters = [];
        
        settings.columns = replaceIdsWithIndices(settings.columns);
        this.settings = settings;
        this.factory = new FilterFactory();      
    }

    // setters
    setFilters(arr) {
    	this.filters = arr;
    	return this;
    }
    
    // getters
    getFilters() {
    	return this.filters;
    }
    
    filter() {
    	if (this.tm.beforeUpdate('filter')) {
    		
    		let filters = this.getFilters(),
                all = this.tm.getAllRows(),
                matching = [], notMatching = [];
    		const maxDeph = filters.length;
	        
	        let matchingTesters = {};
	        filters.forEach((filter) => {
	        	let index = filter.index.toString();
	        	let tester = this.factory.create(filter.type);
	        	tester.setOptions(filter);
	        	matchingTesters[index] = tester;
	        });
	        
	        // filter rows
	        for (let i = 0; i < all.length; i++) {
	        	let row = all[i], deph = 0, matches = true;

	            while (matches && deph < maxDeph) {
	            	let filter = filters[deph];
	            	
	            	let j = filter.index,
	            		cellContent = row.cells[j].textContent;

	            	matches = matchingTesters[j].matches(cellContent);
	            	deph++;
	            }

				if (matches) {
					matching.push(row);
				} else {
					notMatching.push(row);
				}
	    	}

	        this.tm.setAvailableRows(matching)
	           .setHiddenRows(notMatching)
               .actionPipeline.notify('filter');
    	}
        return this;
    }
};


class Controller {
	constructor(tm, settings) {
		this.tm = tm;
		this.settings = settings;
		this.model = new Model(tm, this, settings);
		this.tHead = tm.head ? tm.head.tHead : tm.origHead;
		
		let _this = this;
		// create the toolbar row
        let num = this.tHead.firstElementChild.cells.length,
            row = document.createElement('tr'),
            cellFactory = new CellFactory(tm),
            
            timeout;

        for (let i = 0; i < num; i++) {
            let enabled = this.getIsEnabled(i);
            let cs = this.getIsCaseSensitive(i);

            let colSettings = this.getColumnSettings(i);
           
            row.appendChild(cellFactory.produce(colSettings));
        }
        addClass(row, 'tm-filter-row');

        if (settings.autoCollapse){
            // keep filter row visible if an input is focused
        	
            [].slice.call(row.querySelectorAll('input')).forEach((input) => { // it seems like in IE11 .forEach only works on real arrays
                input.onfocus = (e) => {
                    row.style.height = FILTER_HEIGHT;
                };
                input.onblur = (e) => {
                    row.style.removeProperty('height');
                };
            });
        } else {
            row.style.height = FILTER_HEIGHT;
        }

        // bind listeners
        if (settings.filterAfterTimeout && !isNaN(settings.filterAfterTimeout)) {
        	row.onkeyup = (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.run();
                }, settings.filterAfterTimeout);
            }
        } else {
        	row.onkeyup = (e) => {
        		// enter
        		if (e.keyCode == 13) this.run();
        	}
        }
        
        row.onclick = (e) => {
        	
            const cell = getCell(e),
                  target = e.target;

            if (target.nodeName == 'SPAN' || target.nodeName == 'LABEL') {
                // checkbox click
                let checkbox = cell.querySelector('input[type=checkbox]');
                checkbox.checked = !checkbox.checked;
                this.run();
            } else if (target.nodeName == 'INPUT') {
                target.select();
            }
        }
        
        this.tHead.onmouseenter = (e) => {
        	this.openRow();
        };
        
        this.tHead.onmouseleave = (e) => {
        	if (countOpen === 0) {
        		this.closeRow();    	
        	}
        };
        
     
        // insert toolbar row into tHead
        this.tHead.appendChild(row);
        this.row = row;
	}
	
	openRow() {
		let _this = this, t;
		addClass(this.tm.container, 'tm-filter-open');
		clearTimeout(t);
		t = window.setTimeout(() => {
			_this.tm.headWrap.style.overflow = 'visible';
		}, 500);
		return this;
	}
	
	closeRow() {
		this.tm.headWrap.style.overflow = 'hidden';
		removeClass(this.tm.container, 'tm-filter-open');
		return this;
	}
	
	
	anyFilterActive() {
        return this.model.getFilters().length !== 0;
    }

	getFilters() {
		return this.model.getFilters();
	}
	
    getIsEnabled(i) {return this.getColumnSetting(i, 'enabled');}
    getIsCaseSensitive(i) {return this.getColumnSetting(i, 'caseSensitive');}

    getColumnSetting(i, setting) {
        let cols = this.settings.columns;
        if (cols.hasOwnProperty(i) && cols[i].hasOwnProperty(setting)) {
            // a custom value was set
            return cols[i][setting];
        }
        return cols.all[setting];
    }
    
    /**
     * returns specific settings for one column
     */
    getColumnSettings(i) {
    	let cols = this.settings.columns;
    	
    	if (cols.hasOwnProperty(i)) {
    		return extend2(cols[i], cols.all);
    	}
    	return cols.all;
    }
    
    getOptions(i) {
    	let opts = {};
    	let cell = ([].slice.call(this.row.cells))[i];
    	
    	if (cell.hasOwnProperty('tmFilterOptionHandler')) {
    		opts = cell.tmFilterOptionHandler.getOptions();
    	}
    	return opts;
    }
	
	run() {
    	let _this = this;
        const filterCells = [].slice.call(this.row.cells);
        
        let filters = [];
        
        iterate(filterCells, function(i, cell) {
            let input = cell.querySelector('input[type=text]');
            let checkbox = cell.querySelector('input[type=checkbox]');

            if (input && input.value.trim() !== '') {
            	
            	let filter = extend2({
            		index: i,
            		pattern: input.value.trim()
            	}, _this.getOptions(i));
            	console.log(filter);
            	filters.push(filter);
            }
        });

        this.model.setFilters(filters).filter();
        return this;
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
                caseSensitive: true,
                type: 'string'
            }
        }
    },
    initializer: function(settings) {
        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-filter');
            let instance = new Controller(this, settings); 
            info('module filter loaded');

            return {
                instance: instance,
                getStats: () => {
                	return instance.getFilters();               	
                },
                notify: () => {
                	instance.run();
                },
                unset: () => {
                    info('unsetting filter');
                    // remove all filters;
                    //this.showAllRows();
                }
            };
        } catch (e) {
            error(e);
        }
    }
});
