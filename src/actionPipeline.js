const {error} = require('./utils.js');
/*
 findet eine Änderung statt, wird sie dem jeweils nächsten aktiven Modul in der Hierarchie gemeldet.
 */
const RELOAD = '__reload',
	  FILTER = 'filter',
	  SORTER = 'sorter',
	  PAGER  = 'pager',
	  RENDERER = '__renderer',
	  FIXED  = 'fixed';

// order is super important and must not be changed!!!
const hierarchy = [RELOAD, FILTER, SORTER, PAGER, RENDERER, FIXED];

/**
 * tm always holds exactly one ActionPipeline instance. 
 * When a Module in the Hierarchy changes data of the table in some way (like filtering, sorting, paging), the next active Module in the hierarchy
 * gets notified and can also perform changes (and trigger again afterwards).
 * for Example, after a filter-operation the table has to be resorted and the pager has to display different data.
 * 
 * In the end of each chain reaction, the built-in pseudoModule RENDERER is triggered to re-render the table so the effects will be shown.
 * the advantage is that it will always rerender once and not after each action 
 */
module.exports = class ActionPipeline {
	
	/** 
	 * only called once in tablemodify.js
	 */
	constructor(tm) {
		//this.queue = generateQueue(tm.activeModules);
		this.activeModules = tm.activeModules;
	}
	
	/**
	 * called by the modules. this will call the notify method of the next activated module in the hierarchy
	 * @param {string} sender: name of the module that has finished an operation
	 * @param {object} msg: optional, can be used to pass information to the successor
	 */
	notify(sender, msg) {
		try {			
			let receiver = this._getSuccessor(sender);

			if (receiver != null) receiver.notify(msg);				
		} catch(e) {
			error(e);
		}	
	}	
	
	_getSuccessor(sender) {
		let i = hierarchy.indexOf(sender) + 1;
		if (i === 0) {
			return null;
		}
		for (; i < hierarchy.length; i++) {
			let name = hierarchy[i];
			if (this.activeModules.hasOwnProperty(name)) {
				return this.activeModules[name];
			}
		}	
	}
};