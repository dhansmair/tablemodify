"use strict";
const config = require('./config.js');
const Module = require('./modules/module.js');
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
        this.activeModules = {};

        this.bodySelector = selector;
        oldBodyParent = body.parentElement;

        this.columnCount = 0;
        this.calculateColumnCount(body);

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
        this.visibleRows = this.body.tBodies[0];
        // contains all tr-nodes that are not displayed at the moment
        this.hiddenRows = document.createDocumentFragment();

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
     *  get array of references to the visible rows
     */
    getVisibleRows() {
        return [].slice.call(this.visibleRows.rows);
    }

    /**
     *  get array of references to the hidden rows
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

    /**
     * May be used from outside the plugin to add rows to the table.
     * This will automatically rerun the filter & sorter module.
     */
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


    /**
     * add a single row
     */
    addRow(row) {
        return this.addRows([row]);
    }

    /**
     * this method cleares the tablebody, without the table rows being lost. Instead, they are stored in the DocumentFragment.
     * References to the table rows (laying in the array this.rows) now point on the elements in the fragment.
     * The References can be used to insert the rows in the original DOM again.
     * This is necessary because IE11 had several issues with references to deleted table rows
     */
    hideAllRows() {
        let rows = this.visibleRows.rows, next;

        while (next = rows[0]) {
            this.hiddenRows.appendChild(next);
        }
        return this;
    }

    /**
     * display all hidden rows again
     * this is correct usage of documentFragment! appending the fragment itself appends all children instead
     */
    showAllRows() {
        this.visibleRows.appendChild(this.hiddenRows);
        return this.signal('tmRowsAdded');
    }

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
//Tablemodify.RENDERING_MODE_CHUNKED = 1;
//Tablemodify.RENDERING_MODE_AT_ONCE = 2;
Tablemodify.modules = {
    columnStyles: require('./modules/columnStyles.js'),
    filter: require('./modules/filter.js'),
    fixed: require('./modules/fixed.js'),
    sorter: require('./modules/sorter.js'),
    zebra: require('./modules/zebra.js')
};

//Store reference to the module class for user-defined modules
Tablemodify.Module = Module;
// set version of Tablemodify
Tablemodify.version = 'v0.9.2';
//make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;
