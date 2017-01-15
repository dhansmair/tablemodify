"use strict";
const config = require('./config.js');
const Module = require('./modules/module.js');
const {error, warn, isNonEmptyString, getCss,
       iterate, extend, hasClass, addClass, removeClass, getUniqueId, trigger} = require('./utils.js');

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
            throw 'the passed id ' + coreSettings.containerId + ' is not unique!';
        } else if (coreSettings.containerId) {
            containerId = coreSettings.containerId;
        } else {
            containerId = getUniqueId();
        }

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

        // initialize tbody rows as 2D-array
        this.rows = [].slice.call(this.body.tBodies[0].rows);

        // contains all tr-nodes that are not displayed at the moment
        this.fragment = document.createDocumentFragment();

        //Default rendering mode: everything at once
        this.setRenderingMode(Tablemodify.RENDERING_MODE_AT_ONCE);
        this._chunkedRenderingTimeout = null;
        this.rowChunkSize = 50;
        // call all modules
        if (coreSettings.modules) {
            // interface for modules
            iterate(coreSettings.modules, function(moduleName, moduleSettings) {
                var module = Tablemodify.modules[moduleName];
                var moduleReturn;
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
    calculateColumnCount(element) {
        let maxCols = 0;
        [].forEach.call(element.rows, row => {
            if (row.cells.length > maxCols) maxCols = row.cells.length;
        });
        this.columnCount = maxCols;
    }
    getColumnCount() {
        return this.columnCount;
    }
    appendStyles(text) {
        if (text.trim().length > 0) {
            this.stylesheet.appendChild(document.createTextNode(text.trim()));
        }
    }
    getRows() {
        return this.rows;
    }
    setRows(rowArray) {
        //If chunked rendering is running at the moment, cancel
        window.clearTimeout(this._chunkedRenderingTimeout);
        this.rows = rowArray;
        return this;
    }
    addRows(rowArray) {
        //If chunked rendering is running at the moment, cancel
        window.clearTimeout(this._chunkedRenderingTimeout);
        [].push.apply(this.rows, rowsArray);

        return this;
    }
    setRenderingMode(to) {
        if(to !== Tablemodify.RENDERING_MODE_CHUNKED && to !== Tablemodify.RENDERING_MODE_AT_ONCE) {
           let msg = "Tried to set unknown rendering mode";
           warn(msg);
           throw new Error(msg);
       }
       if(to === Tablemodify.RENDERING_MODE_CHUNKED && getCss(this.body, 'table-layout') !== 'fixed') {
           warn("Using chunked rendering with non-fixed table layout is discouraged!");
       }
       this.renderingMode = to;
       return this;
    }
    render() {
        let tBody = this.body.tBodies[0],
            rows = this.getRows(),
            l = rows.length;

        // clear tBody
        this.moveAllRowsToFragment();

        switch(this.renderingMode) {
            case Tablemodify.RENDERING_MODE_AT_ONCE:
                for (let i = 0; i < l; i++) {
                    tBody.appendChild(rows[i]);
                }

                trigger(this.body, 'tmFixedForceRendering');
                break;
            case Tablemodify.RENDERING_MODE_CHUNKED:
                let chunkSize = this.rowChunkSize,
                    start = 0;
                const renderPart = () => {
                    for (var z = 0; z < chunkSize; z++) {
                        if (start + z === l) {
                            trigger(this.body, 'tmFixedForceRendering');
                            return;
                        }
                        tBody.appendChild(rows[start + z]);
                    }
                    start = start + z;
                    this._chunkedRenderingTimeout = window.setTimeout(renderPart, 0);
                }
                this._chunkedRenderingTimeout = window.setTimeout(renderPart, 0);
                break;
        }
        return this;
    }

    /**
     * this method cleares the tablebody, without the table rows being lost. Instead, they are stored in the DocumentFragment.
     * References to the table rows (laying in the array this.rows) now point on the elements in the fragment.
     * The References can be used to insert the rows in the original DOM again.
     * This is necessary because IE11 had several issues with references to deleted table rows
     */
    moveAllRowsToFragment() {
        let rows = this.body.tBodies[0].rows,
            l = rows.length,
            next;

        while (next = rows[0]) {
            this.fragment.appendChild(next);
        }
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
Tablemodify.RENDERING_MODE_CHUNKED = 1;
Tablemodify.RENDERING_MODE_AT_ONCE = 2;
Tablemodify.modules = {
    columnStyles: require('./modules/columnStyles.js'),
    filter: require('./modules/filter.js'),
    fixed: require('./modules/fixed.js'),
    sorter: require('./modules/sorter.js'),
    zebra: require('./modules/zebra.js')
};

/**
 * ######### DO NOT USE! METHOD NOT CORRECT YET #######################
 * @todo: implement method with correct behaviour
 * reset instance completely
 * - remove all wrappers
 * - remove all inline style settings
 * - remove all classnames starting with 'tm-'
 * set this instance to null (possible?)
 */
/*
Tablemodify._destroy = (instance) => {
    try {
        if (!instance || !instance instanceof Tablemodify) throw new Error('not a Tablemodify-object');

        console.log(instance);

        let container = instance.container;
        let table = instance.body;

        // remove all wrappers
        container.parentElement.replaceChild(table, container);

        // undo all performed changes ...
        removeClass(table, 'tm-body');

        instance.body.style.marginTop = 0;
        instance.origHead.style.visibility = 'initial';
        instance.origFoot.style.visibility = 'initial';

        // remove footer helper wrappers
        let wrappers = instance.origFoot.querySelectorAll('div.tm-fixed-helper-wrapper');

        [].slice.call(wrappers).forEach((wrapper) => {
            let content = wrapper.innerHTML;
            wrapper.outerHTML = content;
        });


        // do other necessary stuff ...
        instance = {};

    } catch(e) {
        console.warn(e);
    }
}
*/

//Store reference to the module class for user-defined modules
Tablemodify.Module = Module;

//make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;
