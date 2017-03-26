/**
 * this class is a simple event system for a tablemodify instance.
 *
 */
module.exports = class EventSystem {
    constructor(tm) {
        this.tm = tm;
        this.events = {};
    }

    on(eventName, func) {
        if (typeof func !== 'function') {
            throw new Error('not a function!');
        }
        if (!this.events.hasOwnProperty(eventName)) this.events[eventName] = [];

        this.events[eventName].push(func);
    }

    trigger(eventName, ...params) {
        if (this.events.hasOwnProperty(eventName)) {
            this.events[eventName].forEach((func) => {
                func.apply(this.tm, params);
            });
        }
    }
}
