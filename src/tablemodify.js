const config = require('./config.js');
const Module = require('./modules/module.js');
const {error, warn, isNonEmptyString,
       iterate, extend, addClass, getUniqueId, wrap} = require('./utils.js');

class Tablemodify {
    constructor(selector, coreSettings) {
        var containerId,
            _this = this,
            body = document.querySelector(selector); // must be a table
        if (!body || body.nodeName !== 'TABLE'){
          error('there is no <table> with selector ' + selector);
          return null;
        }
        this.body = body;
        this.bodySelector = selector;

        extend(config.coreDefaults, coreSettings);

        if (coreSettings.containerId && document.getElementById(coreSettings.containerId)) {
            throw 'the passed id ' + coreSettings.containerId + ' is not unique!';
        } else if (coreSettings.containerId) {
            containerId = coreSettings.containerId;
        } else {
            containerId = getUniqueId();
        }

        this.bodyWrap  = wrap(body, document.createElement('div'));
        this.container = wrap(this.bodyWrap, document.createElement('div'));
        this.origHead = body.tHead;
        this.origFoot = body.tFoot;
        // add css area
        this.stylesheet = document.createElement('style');
        this.container.insertBefore(this.stylesheet, this.container.firstElementChild);

        addClass(body, 'tm-body');
        addClass(this.bodyWrap,  'tm-body-wrap');
        addClass(this.container, 'tm-container');
        addClass(this.stylesheet, 'tm-custom-style');

        // add optional id to container
        this.container.id = containerId;
        this.containerId  = containerId;

        // initialize tbody rows as 2D-array
        this.rows = [].slice.call(this.body.tBodies[0].rows);

        // call all modules
        if (coreSettings.modules) {
            // interface for modules
            iterate(coreSettings.modules, function(moduleName, moduleSettings) {
                var module = Tablemodify.modules[moduleName];
                var moduleReturn;
                if(module) {
                    moduleReturn = module.getModule(_this, moduleSettings);
                } else {
                    warn('Module' + moduleName + ' not registered!');
                }
                if (moduleReturn !== undefined) {
                    if (_this[moduleName] === undefined) {
                        // define ret as a property of the Tablemodify instance.
                        // now you can access it later via tm.modulename
                        _this[moduleName] = moduleReturn;
                    } else {
                        error('module name ' + moduleName + ' causes a collision and is not allowed, please choose another one!');
                    }
                }
            });
        }

        this.coreSettings = coreSettings;
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
        this.rows = rowArray;
        //this.body.dispatchEvent(new Event('tmRowsAdded'));
        return this;
    }
    addRows(rowArray) {
        [].push.apply(this.rows, rowsArray);
        //this.body.dispatchEvent(new Event('tmRowsAdded'));
        return this;
    }
    render() {
        var tBody = this.body.tBodies[0],
            rows = this.getRows(),
            l = rows.length;

        tBody.innerHTML = '';

        for (var i = 0; i < l; i++) {
            tBody.appendChild(rows[i]);
        }
        return this;
    }
    /**
     * Static method for adding user-defined modules
     * this-value in a static method is the constructor function itself (here
     * Tablemodify)
     */
    static addModule(module, name) {
        if(typeof module === "function") {
            //Create a new module based on the given name and initializer function
            return this.addModule(new Module({
                name: name,
                initializer: module
            }));
        } else if(typeof module === "object") {
            //Check if it is a Module instance
            if(module instanceof Module) {
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
}
Tablemodify.modules = {
    sorter: require('./modules/sorter.js'),
    fixed: require('./modules/fixed.js'),
    columnStyles: require('./modules/columnStyles.js'),
    zebra: require('./modules/zebra.js'),
    filter: require('./modules/filter.js')
};

//Store reference to the module class for user-defined modules
Tablemodify.Module = Module;

//make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify;
