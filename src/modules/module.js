const {error, extend2, isNonEmptyString} = require('../utils.js');
const defaultParams = {           //default-name
    defaultSettings: {},                //"default"-default-settings: empty
    settingsValidator: () => null,      //default: accept all given settings objects
    initializer: () => null             //default: empty module
};

/**
 *  these is the default return object of every Module
 */
const defaultReturns = {
    instance: {},
	unset: () => {},
	getStats: () => {},
	info: () => {},
	notify: () => {}
};

/**
 * This class represents a single Tablemodify module.
 * It provides a standard interface for defining modules, takes care of settings
 * validation, settings-completion with default settings and can be extended with
 * further functionality (e.g. module dependencies)
 *
 * Usage:
 * module.exports = new Module({
 *     name: <the module's name>,
 *     defaultSettings: <the module's default settings>,
 *     settingsValidator: <function, called with the settings object and throws
 *                         if invalid parameters are detected>,
 *     initializer: <function where the module code itself resides, will be called
 *                   with the Tablemodify instance as this-value and the return
 *                   value will be stored in tm-instance.modules.<modulename>
 * });
 */
module.exports = class Module {
    constructor(params) {
        //If no name is given, throw
        if(!isNonEmptyString(params.name)) {
            let errorMsg = "Name must be given for module!";
            error(errorMsg);
            throw new Error(errorMsg);
        }
        //complete parameters with default parameters
        extend2(params, defaultParams);
        //set parameters as properties of this
        extend2(this, params);
    }
    /**
     * Does nothing more than extend the given settings object with the default
     * settings and call the settingsValidator function on the resulting object
     */
    getSettings(settings) {
        extend2(settings, this.defaultSettings);
        this.settingsValidator(settings);
        return settings;
    }
    /**
     * Called by the Tablemodify instance. Calls the initializer-function with
     * the Tablemodify instance as this-Value
     */
    getModule(tableModify, settings) {
        settings = this.getSettings(settings);
        return extend2(this.initializer.call(tableModify, settings, this), defaultReturns);
    }
};
