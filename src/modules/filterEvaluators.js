const {isNumber} = require('../utils.js')
/**
 *
 *
 */

class Evaluator {
  contructor () {}
    // required functions
  update (handler) {
    throw new Error('function update() has to be overwritten')
  }

  evaluate () {
    throw new Error('function evaluate() has to be overwritten')
  }

  getStats () {
    throw new Error('function getStats() has to be overwritten')
  }

  isActive () {
    throw new Error('function isActive() has to be overwritten')
  }
}

class StringEvaluator extends Evaluator {
  constructor (index) {
    super()
    this.index = index
    this.pattern = null
    this.cs = false
    this.matching = false
  }

  setPattern (val) {
    if (typeof val === 'string' || val === null) {
      this.pattern = val
    } else {
      throw new Error('parameter is not a string')
    }
    return this
  }

  setCS (bool) {
    if (typeof bool === 'boolean') {
      this.cs = bool
    } else {
      throw new Error('parameter is not a boolean')
    }
    return this
  }

  setMatching (bool) {
    if (typeof bool === 'boolean') {
      this.matching = bool
    } else {
      throw new Error('parameter is not a boolean')
    }
    return this
  }

  update (handler) {
    this.setPattern(handler.getPattern())
            .setCS(handler.getCS())
            .setMatching(handler.getMatching())
    return this
  }

  evaluate (val) {
    let pattern = this.pattern

    if (!this.cs) {
      val = val.toLowerCase()
      pattern = pattern.toLowerCase()
    }

    if (this.matching) {
      return val === pattern
    } else {
      return val.indexOf(pattern) !== -1
    }
  }

  getStats () {
    return {
      type: 'string',
      index: this.index,
      pattern: this.pattern,
      cs: this.cs,
      matching: this.matching
    }
  }

  isActive () {
    return (this.pattern != null && this.pattern.length > 0)
  }
}

/**
 *
 *
 */
class NumericEvaluator extends Evaluator {
  constructor (index) {
    super()

    this.index = index
    this.mode = 'comparator' // comparator or range
    this.comparator = '='
    this.pattern = null
    this.minVal = null
    this.maxVal = null

    this.evaluate = this._evaluateComparator
    this._comparatorFunction = NumericEvaluator.operatorString2Function(this.operator)
  }

  setMode (mode) {
    if (mode === 'comparator') {
      this.mode = mode
      this.evaluate = this._evaluateComparator
    } else if (mode === 'range') {
      this.mode = mode
      this.evaluate = this._evaluateRange
    } else {
      throw new Error('wrong mode specified')
    }
    return this
  }

  setComparator (op) {
    this.comparator = op
    this._comparatorFunction = NumericEvaluator.operatorString2Function(op)
    return this
  }

  setPattern (val) {
    if (val === null || val === '') {
      this.pattern = null
    } else {
      val = parseFloat(val)
      if (isNumber(val)) {
        this.pattern = val
      } else {
        throw new Error('no number passed for pattern')
      }
    }
    return this
  }

  setMinVal (val) {
    if (val === null || val === '') {
      this.minVal = null
    } else {
      val = parseFloat(val)
      if (isNumber(val)) {
        this.minVal = val
      } else {
        throw new Error('no number passed for minVal')
      }
    }
    return this
  }

  setMaxVal (val) {
    if (val === null || val === '') {
      this.maxVal = null
    } else {
      val = parseFloat(val)
      if (isNumber(val)) {
        this.maxVal = val
      } else {
        throw new Error('no number passed for minVal')
      }
    }
    return this
  }

  update (handler) {
    this.setMode(handler.getMode())
            .setComparator(handler.getComparator())
            .setPattern(handler.getPattern())
            .setMinVal(handler.getMinVal())
            .setMaxVal(handler.getMaxVal())
    return this
  }

  evaluate (val) {
    throw new Error('an error occured. this function must never be called')
  }

  _evaluateRange (val) {
    return (this.minVal === null || val >= this.minVal) &&
             (this.maxVal === null || val <= this.maxVal)
  }

  _evaluateComparator (val) {
    return this._comparatorFunction(val, this.pattern)
  }

  getStats () {
    if (this.mode === 'comparator') {
      return {
        type: 'numeric',
        index: this.index,
        mode: 'comparator',
        comparator: this.comparator,
        pattern: this.pattern
      }
    } else {
      return {
        type: 'numeric',
        index: this.index,
        mode: 'range',
        minVal: this.minVal,
        maxVal: this.maxVal
      }
    }
  }

  isActive () {
    if (this.mode === 'comparator') {
      return (this.pattern != null)
    } else {
      return (this.minVal != null || this.maxVal != null)
    }
  }

    /**
     * used to transform an operator-String into a function
     */
  static operatorString2Function (operatorString) {
    switch (operatorString) {
      case '<': return function (a, b) { return a < b }
      case '>': return function (a, b) { return a > b }
      case '<=': return function (a, b) { return a <= b }
      case '>=': return function (a, b) { return a >= b }
      default: return function (a, b) { return a === b }
    }
  }
}

module.exports = class Factory {
  create (type, index) {
    switch (type) {
      case 'numeric':
        return new NumericEvaluator(index)
      case 'string':
        return new StringEvaluator(index)
    }
  }
}
