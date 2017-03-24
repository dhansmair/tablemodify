const {extend2} = require('../utils.js');

const defaultSettings = {
	instance: {},
	unset: () => {},
	getStats: () => {},
	info: () => {},
	notify: () => {}
};

module.exports = class ModuleReturn {
	constructor(params) {
		extend2(params, defaultSettings);
		extend2(this, params);
	}
}