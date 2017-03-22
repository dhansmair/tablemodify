const Module = require('./module.js');
const {addClass, error, extend2} = require('../utils.js');

class Controller {
	constructor(sets, pager) {
		let _this = this;
		extend2(this, sets);
		
		Object.keys(this).forEach((key) => {
			if (this[key] == null) {
				throw new Exception(key + ' setting must be set!');
			} else {
				this[key] = document.querySelector(this[key]);
			}
		});
		
		this.pager = pager;
		
		this.left.addEventListener('click', () => {
			let val = parseInt(_this.number.value) - 1;
			
			if (val > 0) {
				_this.number.value = val;
				_this.pager.update();
			}			
		});
		
		this.right.addEventListener('click', () => {			
			let val = parseInt(_this.number.value) + 1;
			
			if (val <= _this.getTotal()) {
				_this.number.value = val;
				_this.pager.update();
			}		
		});		
	
		this.number.addEventListener('change', () => {
			let val = _this.number.value;
			
			if (isNaN(val) || val < 1) {
				_this.number.value = 1;
			} else if (val > _this.getTotal()) {
				_this.number.value = _this.getTotal();
			}
			
			_this.pager.update();
		});
	
		this.limit.addEventListener('change', () => {
			let val = _this.limit.value;
			
			if (isNaN(val) || val < 1) {
				_this.limit.value = 1;
			}
			_this.updateTotal();
			_this.pager.update();
		});
		
		this.updateTotal();
	}	
	
	getOffset() {
		let val = this.number.value;
		
		if (isNaN(val) || val < 1) {
			this.number.value = 1;
		} else if (val > this.getTotal()) {
			this.number.value = this.getTotal();
		}
		return parseInt(this.number.value - 1) * this.getLimit();
	}
	
	getLimit() {
		return parseInt(this.limit.value);
	}
	
	getTotal() {
		return Math.ceil(this.pager.tm.countAvailableRows() / this.getLimit());
	}
	
	updateTotal() {
		if (this.total != null) {
			this.total.innerHTML = '/' + this.getTotal();
		}
		return this;
	}
}

class Pager {
	constructor(tm, settings) {
		this.tm = tm;
		this.offset = settings.offset;
		this.limit = settings.limit;
		
		this.controller = new Controller(settings.controller, this);	
	}
	
	/**
	 * main method run(): performs change
	 */
	run() {
		console.info('Es wird angezeigt: ' + (this.offset+1) + ' bis ' + (this.offset + this.limit));
		this.tm.actionPipeline.notify('pager', {
			offset: this.offset,
			limit: this.limit
		});
		return this;
	}
	
	update() {
		this.setOffset(this.controller.getOffset())
		    .setLimit(this.controller.getLimit())
		    .run();
	}
	
	// setters
	setOffset(offset) {
		if (offset != null && !isNaN(offset)) this.offset = offset;
		return this;
	}
	setLimit(limit) {
		if (limit != null && !isNaN(limit)) this.limit = limit;
		return this;
	}
	/*
	getOffset() {
		return this.offset;
	}
	getLimit() { 
		return this.limit;
	}*/
}     
             
module.exports = new Module({
	name: 'pager',
	defaultSettings: {
		offset: 0,
		limit: Infinity,
		controller: {
			left: null,
			right: null,
			number: null,
			total: null,
			limit: null
		}
	},
	initializer: function(settings) {
		try {
			let pagerInstance = new Pager(this, settings); // this = tablemodify
			addClass(this.container, 'tm-pager');
			
			pagerInstance.update();
			
			return {
				instance: pagerInstance,
				show: (limit, offset) => {
					pagerInstance
						.setOffset(offset)
						.setLimit(limit)
						.run();
				},
				notify: () => {
					// force pager to run again
					pagerInstance.run();			
				},
				info: () => {},
				unset: () => {}
			};
		} catch(e) {
			error(e);
		}		
	}
});