"use strict";
const config = require('./config.js');
const Module = require('./modules/module.js');
const Language = require('./language.js');
<<<<<<< HEAD
const ActionPipeline = require('./actionPipeline.js');
=======
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
const {error, warn, isNonEmptyString, getCss,
       iterate, extend, hasClass, addClass, removeClass, getUniqueId, trigger, tableFactory} = require('./utils.js');

class Tablemodify {
    constructor(selector, coreSettings) {
        extend(config.coreDefaults, coreSettings);
        let containerId, oldBodyParent, _this = this, body = document.querySelector(selector); // must be a table

        // ------------- ERROR PREVENTION ---------------------------
        // check if table is valid
        if (!body || body.nodeName !== 'TABLE') {
            error('there is no <table> with selector ' + selector);
            return null;
        }

        // check if Tm hasn't already been called for this table
        if (hasClass(body, 'tm-body')) {
            warn('the table ' + selector + ' is already initialized.');
            return null;
        }

        // check if containerId is valid or produce a unique id
        if (coreSettings.containerId && document.getElementById(coreSettings.containerId)) {
            error('the passed id ' + coreSettings.containerId + ' is not unique!');
            return null;
        } else if (coreSettings.containerId) {
            containerId = coreSettings.containerId;
        } else {
            containerId = getUniqueId();
        }

        // references to all active modules stored in here
<<<<<<< HEAD
        this.activeModules = {
        	 /**
        	  * a special module which is always notified after sth. happened on the table data
        	  * it only performs a re-rendering on the data
        	  */
        	__renderer: {
        		notify: (msg = {}) => {
        			let offset = msg.offset || 0,
        				limit = msg.limit || Infinity;
            		_this.render(limit, offset).actionPipeline.notify();
        		}
        	}
        };
=======
        this.activeModules = {};
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2

        this.bodySelector = selector;
        oldBodyParent = body.parentElement;

        this.columnCount = 0;
        this.calculateColumnCount(body);

        this.currentLanguage = coreSettings.language;

        body.outerHTML =
                    `<div class='tm-container'>
                        <style class='tm-custom-style'></style>
                        <div class='tm-body-wrap'>
                            ${body.outerHTML}
                        </div>
                    </div>`;

        this.container = oldBodyParent.querySelector('.tm-container');

        body = this.container.querySelector('table'); // important! reload body variable

        this.body = body;
        this.bodyWrap = body.parentElement;
        this.stylesheet = this.bodyWrap.previousElementSibling;

        this.origHead = body.tHead;
        this.origFoot = body.tFoot;

        // add optional id to container
        this.container.id = containerId;
        this.containerId  = containerId;

        // add theme class to container
        addClass(this.container, ('tm-theme-' + coreSettings.theme));
        addClass(body, 'tm-body');

        // the tBody, contains all visible rows in the table
<<<<<<< HEAD
        //this.visibleRows = this.body.tBodies[0];
        this.DOM = this.body.tBodies[0];
        // contains all tr-nodes that are not displayed at the moment
        //this.hiddenRows = document.createDocumentFragment();
        this.hiddenRows = [];
        this.availableRows = [].slice.call(this.DOM.rows);//document.createDocumentFragment();
        
        this.actionPipeline = new ActionPipeline(this);
        
=======
        this.visibleRows = this.body.tBodies[0];
        // contains all tr-nodes that are not displayed at the moment
        this.hiddenRows = document.createDocumentFragment();

>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
        // call all modules
        if (coreSettings.modules) {
            // interface for modules
            iterate(coreSettings.modules, function(moduleName, moduleSettings) {
                let module = Tablemodify.modules[moduleName],
                    moduleReturn;
                if (module) {
                    moduleReturn = module.getModule(_this, moduleSettings);
                } else {
                    warn('Module' + moduleName + ' not registered!');
                }
                if (moduleReturn !== undefined) {
                    if (_this.activeModules[moduleName] === undefined) {
                        // define ret as a property of the Tablemodify instance.
                        // now you can access it later via tm.modulename
                        _this.activeModules[moduleName] = moduleReturn;
                    } else {
                        error('module name ' + moduleName + ' causes a collision and is not allowed, please choose another one!');
                    }
                }
            });
        }
        this.coreSettings = coreSettings;
    }
<<<<<<< HEAD
=======

>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    /**
     * calculate number of columns. Usually only called at the initialisation
     */
    calculateColumnCount(element) {
        let maxCols = 0;
        [].forEach.call(element.rows, row => {
            if (row.cells.length > maxCols) maxCols = row.cells.length;
        });
        this.columnCount = maxCols;
    }

    /**
     * getter for number of columns
     */
    getColumnCount() {
        return this.columnCount;
    }

    /**
     * add css text to the internal style-tag each tm-container contains
     */
    appendStyles(text) {
        if (text.trim().length > 0) {
            this.stylesheet.appendChild(document.createTextNode(text.trim()));
        }
        return this;
    }

    /**
     * get a term out of the current language pack
     */
    getTerm(term) {
        return Tablemodify.languages[this.currentLanguage].get(term);
    }

    /**
     *  get array of references to the visible rows
     */
<<<<<<< HEAD
    getAvailableRows() {
    	return this.availableRows;
=======
    getVisibleRows() {
        return [].slice.call(this.visibleRows.rows);
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    }

    /**
     *  get array of references to the hidden rows
<<<<<<< HEAD
     */ 
    getHiddenRows() {
    	return this.hiddenRows;
    }
    
    /**
     *  get array of references to all rows, both hidden and visible
     */   
    getAllRows() {
    	return this.availableRows.concat(this.hiddenRows);
    }
    
    /**
     * setter
     */
    setAvailableRows(arr) {
    	this.availableRows = arr;
    }
    
    /**
     * setter
     */
    setHiddenRows(arr) {
    	this.hiddenRows = arr
    }
    
    
    countAvailableRows() {
    	return this.availableRows.length;
    }
    
    countHiddenRows() {
    	return this.hiddenRows.length;
    }
 
    /**
     * show all the rows that the param rowArray contains (as references).
     * used by filter module
     */   
    render(limit = Infinity, offset = 0) {
    	this.clearDOM();
    	let fragment = document.createDocumentFragment();
    	
    	if (limit === Infinity || limit+offset > this.availableRows.length) {
    		limit = this.availableRows.length;
    	} else {
    		limit += offset;
    	}
    
    	for (; offset < limit; offset++) {
    		fragment.appendChild(this.availableRows[offset]);
    	}
    	
    	this.DOM.appendChild(fragment);
    	return this;
    }   

    clearDOM() {
    	while (this.DOM.firstChild) {
    		this.DOM.removeChild(this.DOM.firstChild);
    	}
    }
    
=======
     */
    getHiddenRows() {
        return [].slice.call(this.hiddenRows.childNodes);
    }

    /**
     *  get array of references to all rows, both hidden and visible
     */
    getAllRows() {
        return this.getVisibleRows().concat(this.getHiddenRows());
    }

    /**
     * show all the rows that the param rowArray contains (as references).
     * used by filter module
     */
    showRows(rowArray) {
        let fragment = document.createDocumentFragment();
        this.hideAllRows();

        for (let i = 0; i < rowArray.length; i++) {
            fragment.appendChild(rowArray[i]);
        }

        this.visibleRows.appendChild(fragment);
        return this;
    }

>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    /**
     * May be used from outside the plugin to add rows to the table.
     * This will automatically rerun the filter & sorter module.
     */
<<<<<<< HEAD
    /*
=======
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    addRows(arr) {
        if (arr.length === 0) return this;

        if (Array.isArray(arr[0])) {
            return this._addJSONRows(arr);
        } else if (arr[0].tagName === 'TR') {
            return this._addHTMLRows(arr);
        } else {
            error('wrong parameter for addRows()');
            return this;
        }
    }

    _addHTMLRows(rowArray) {
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < rowArray.length; i++) {
            fragment.appendChild(rowArray[i]);
        }
        this.visibleRows.appendChild(fragment);
        return this.signal('tmRowsAdded');
    }

    _addJSONRows(rowArray) {
        let tr = document.createElement('tr'),
            td = document.createElement('td'),
            newTr, newTd,
            fragment = document.createDocumentFragment();

        for (let i = 0; i < rowArray.length; i++) {
            newTr = tr.cloneNode();
            for (let j = 0; j < rowArray[i].length; j++) {
                newTd = td.cloneNode();
                newTd.innerHTML = rowArray[i][j];
                newTr.appendChild(newTd);
            }
            fragment.appendChild(newTr);
        }

        this.visibleRows.appendChild(fragment);
        return this.signal('tmRowsAdded');
    }

<<<<<<< HEAD
*/
    /**
     * add a single row
     */
    /*
    addRow(row) {
        return this.addRows([row]);
    }*/
=======

    /**
     * add a single row
     */
    addRow(row) {
        return this.addRows([row]);
    }
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2

    /**
     * this method cleares the tablebody, without the table rows being lost. Instead, they are stored in the DocumentFragment.
     * References to the table rows (laying in the array this.rows) now point on the elements in the fragment.
     * The References can be used to insert the rows in the original DOM again.
     * This is necessary because IE11 had several issues with references to deleted table rows
     */
<<<<<<< HEAD
    /*
=======
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    hideAllRows() {
        let rows = this.visibleRows.rows, next;

        while (next = rows[0]) {
            this.hiddenRows.appendChild(next);
        }
        return this;
<<<<<<< HEAD
    }*/
=======
    }
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2

    /**
     * display all hidden rows again
     * this is correct usage of documentFragment! appending the fragment itself appends all children instead
     */
<<<<<<< HEAD
    /*
    showAllRows() {
        this.visibleRows.appendChild(this.hiddenRows);
        return this.signal('tmRowsAdded');
    }*/
=======
    showAllRows() {
        this.visibleRows.appendChild(this.hiddenRows);
        return this.signal('tmRowsAdded');
    }
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2

    /**
     * deletes all rows in the table (hidden AND visible).
     * Faster implementation than setting innerHTMl = ''
     */
<<<<<<< HEAD
    /*
=======
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    deleteAllRows() {
        [this.visibleRows, this.hiddenRows].forEach((p) => {
            while (p.firstChild) {
                p.removeChild(p.firstChild);
            }
        });
        return this;
<<<<<<< HEAD
    }*/
=======
    }
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2

    /**
     * used to fire events on the original table. Modules may react to this events.
     * Its a convention that all events are fired on this element and the modules listen to the same.
     */
    signal(...events) {
        events.forEach((e) => {
            trigger(this.body, e);
        });
        return this;
    }

    /**
     * Static method for adding user-defined modules
     * this-value in a static method is the constructor function itself (here
     * Tablemodify)
     */
    static addModule(module, name) {
        if (typeof module === "function") {
            //Create a new module based on the given name and initializer function
            return this.addModule(new Module({
                name: name,
                initializer: module
            }));
        } else if (typeof module === "object") {
            //Check if it is a Module instance
            if (module instanceof Module) {
                //if the module already exists, throw
                if(this.modules[module.name]) {
                    let errorMsg = "Module " + module.name + " does already exist!";
                    error(errorMsg);
                    throw new Error(errorMsg);
                }
                this.modules[module.name] = module;
            //Treat the objects as parameters for new module instance
            } else {
                //If a name is given as parameter, override a name in the parameters object
                if(isNonEmptyString(name)) {
                    module.name = name;
                }
                this.addModule(new Module(module));
            }
        }
    }

    /**
        add a language pack to the collection of Languages.
        param name: identifier of the language. May overwrite older ones
        param term: object containing the terms. see full list in language.js
    */
    static addLanguage(name, terms) {
        Tablemodify.languages[name] = new Language(name, terms);
    }

    /**
        reset all loaded modules of instance
        and unset instance afterwards
    */
    static _destroy(instance) {
        try {
            if (!instance || !instance instanceof Tablemodify) throw new Error('not a Tablemodify-object');
            if (!instance.activeModules) throw new Error('instance has no property activeModules');

            let container = instance.container;
            let table = instance.body;

            iterate(instance.activeModules, (moduleName, module) => {
                // revert all changes performed by this module. Module itself is responsible for correct reversion
                if (module.unset) module.unset();
            });

            removeClass(table, 'tm-body');
            // remove all wrappers
            container.parentElement.replaceChild(table, container);

            // delete instance
            iterate(instance, (prop, val) => {
                delete instance[prop];
            });

        } catch(e) {
            console.warn(e);
        }
    }
}

Tablemodify.modules = {
    columnStyles: require('./modules/columnStyles.js'),
    filter: require('./modules/filter.js'),
    fixed: require('./modules/fixed.js'),
    sorter: require('./modules/sorter.js'),
<<<<<<< HEAD
    pager: require('./modules/pager.js'),
=======
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    zebra: require('./modules/zebra.js')
};

Tablemodify.languages = {
    en: new Language('en', {
        FILTER_PLACEHOLDER: 'type filter here',
        FILTER_CASESENSITIVE: 'case-sensitive'
    }),
    de: new Language('de', {
        FILTER_PLACEHOLDER: 'Filter eingeben',
<<<<<<< HEAD
        FILTER_CASESENSITIVE: 'Groß- und Kleinschreibung unterscheiden'
=======
        FILTER_CASESENSITIVE: 'GroÃŸ- und Kleinschreibung unterscheiden'
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
    })
};

Tablemodify.Language = Language;
//Store reference to the module class for user-defined modules
Tablemodify.Module = Module;
// set version of Tablemodify
<<<<<<< HEAD
Tablemodify.version = 'v0.9.5';
=======
Tablemodify.version = 'v0.9.4';
>>>>>>> ffd86d16082a52ecbdcd2018d80598698e2bcbe2
//make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;
