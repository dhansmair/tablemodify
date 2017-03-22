const {extend, warn} = require('./utils.js');

/*
 *    List of all values that can be set
 */
let defaults = {
    FILTER_PLACEHOLDER: 'type filter here',
    FILTER_CASESENSITIVE: 'case-sensitive'
};

module.exports = class Language {

    constructor(identifier, languagePack) {
        this.identifier = identifier;
        this.terms = extend(defaults, languagePack);
    }

    get(term) {
        if (this.terms.hasOwnProperty(term)) {
            return this.terms[term];
        }
        warn('term ' + term + ' not defined');
        return null;
    }
};
