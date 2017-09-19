const {extend, warn} = require('./utils.js')

/*
 *    List of all values that can be set
 */
let defaults = {
  FILTER_DISCARD: 'discard filter',
  FILTER_PLACEHOLDER: 'type filter here',
  FILTER_CASESENSITIVE: 'case-sensitive',
  FILTER_MATCHING: 'matching',
  FILTER_COMPARATOR: 'comparator',
  FILTER_RANGE: 'range',
  FILTER_RANGE_LIMIT: 'upper limit',
  FILTER_TITLE_STRING: 'string search',
  FILTER_TITLE_NUMERIC: 'numeric search',
  FILTER_TITLE_DATE: 'date search',
  PAGER_PAGENUMBER_SEPARATOR: ' / '
}

module.exports = class Language {
  constructor (identifier, languagePack) {
    this.identifier = identifier
    this.terms = extend(languagePack, defaults)
  }

  get (term) {
    if (this.terms.hasOwnProperty(term)) {
      return this.terms[term]
    }
    warn('term ' + term + ' not defined')
    return ''
  }
}
