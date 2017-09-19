'use strict'
const config = require('./config.js')
const Module = require('./modules/module.js')
const Language = require('./language.js')
const ActionPipeline = require('./actionPipeline.js')
const EventSystem = require('./eventSystem.js')
const {error, warn, isNonEmptyString, extend, hasClass, addClass, cloneArray} = require('./utils.js')

// used to create a unique id for each Tablemodify-instance
const getUniqueId = (function () {
  var unique = 0

  return function () {
    var id = 'tm-unique-' + unique
    unique++
    return id
  }
}())

class Tablemodify {
  constructor (selector, coreSettings) {
    extend(coreSettings, config.coreDefaults)
    let containerId, oldTableParent, _this = this, table = document.querySelector(selector) // must be a table

        // ------------- ERROR PREVENTION ---------------------------
        // check if table is valid
    if (!table || table.nodeName !== 'TABLE') {
      error('there is no <table> with selector ' + selector)
      return null
    }

        // check if Tm hasn't already been called for this table
    if (hasClass(table, 'tm-body')) {
      warn('the table ' + selector + ' is already initialized.')
      return null
    }

        // check if containerId is valid or produce a unique id
    if (coreSettings.containerId && document.getElementById(coreSettings.containerId)) {
      error('the passed id ' + coreSettings.containerId + ' is not unique!')
      return null
    } else if (coreSettings.containerId) {
      containerId = coreSettings.containerId
    } else {
      containerId = getUniqueId()
    }

    // references to all active modules stored in here
    this.activeModules = {
        /**
        * a special module which is always notified after sth. happened on the table data
        * it only performs a re-rendering on the data
        */
      __renderer: {
        notify: (msg = {}) => {
          let offset = msg.offset || 0,
            limit = msg.limit || Infinity
          _this.render(limit, offset)
        }
      }
    }

    if (coreSettings.transition === 'fade') {
      this.render = this._transitionedRender
    } else {
      this.render = this._standardRender
    }

    this.tableSelector = selector
    oldTableParent = table.parentElement

    this.columnCount = 0
    this.calculateColumnCount(table)

    this.currentLanguage = coreSettings.language

    table.outerHTML =
                    `<div class='tm-container'>
                        <style class='tm-custom-style'></style>
                        <div class='tm-body-wrap'>
                            ${table.outerHTML}
                        </div>
                    </div>`

    this.domElements = {
      container: oldTableParent.querySelector('.tm-container'),
      stylesheet: null,
      table: null,

      head: null,
      body: null,
      foot: null,

      headWrap: null,
      tableWrap: null,
      footWrap: null,

      origHead: null,
      origFoot: null
    }

    table = this.domElements.container.querySelector('table') // important! reload body variable
    this.domElements.table = table
    this.domElements.tableWrap = table.parentElement
    this.domElements.stylesheet = this.domElements.tableWrap.previousElementSibling
    this.domElements.head = table.tHead
    this.domElements.body = table.tBodies[0]
    this.domElements.foot = table.tFoot
    this.domElements.origHead = table.tHead
    this.domElements.origFoot = table.tFoot

        // add optional id to container
    this.domElements.container.id = containerId
    this.containerId = containerId

        // add theme class to container
    addClass(this.domElements.container, ('tm-theme-' + coreSettings.theme))
    addClass(table, 'tm-body')

    this.allRows = [].slice.call(this.domElements.body.rows)
        // an array containing references to all available tr elements. They are not necessarily displayed in the DOM
    this.availableRows = cloneArray(this.allRows)

    this.actionPipeline = new ActionPipeline(this)
    this.eventSystem = new EventSystem(this)
    this.coreSettings = coreSettings

        // call all modules
    if (coreSettings.modules) {
      Object.keys(Tablemodify.modules).forEach((moduleName) => {
        if (coreSettings.modules.hasOwnProperty(moduleName)) { // activate module?
          let module = Tablemodify.modules[moduleName],
            moduleSettings = coreSettings.modules[moduleName],
            moduleReturn
          moduleReturn = module.getModule(_this, moduleSettings)

          if (moduleReturn !== undefined) {
            if (_this.activeModules[moduleName] === undefined) {
                            // define ret as a property of the Tablemodify instance.
                            // now you can access it later via tm.modulename
              _this.activeModules[moduleName] = moduleReturn
            } else {
              error('module name ' + moduleName + ' causes a collision and is not allowed, please choose another one!')
            }
          }
        }
      })
    }

        // initialisation completed, now start first reload
    this.actionPipeline.notify('__reload')
  }
    /**
     * calculate number of columns. Usually only called at the initialisation
     */
  calculateColumnCount (element) {
    let maxCols = 0;
    [].forEach.call(element.rows, row => {
      if (row.cells.length > maxCols) maxCols = row.cells.length
    })
    this.columnCount = maxCols
  }

    /**
     * getter for number of columns
     */
  getColumnCount () {
    return this.columnCount
  }

    /**
     * add css text to the internal style-tag each tm-container contains
     */
  appendStyles (text) {
    if (text.trim().length > 0) {
      this.domElements.stylesheet.appendChild(document.createTextNode(text.trim()))
    }
    return this
  }

    /**
     * get a term out of the current language pack
     */
  getTerm (term) {
    return Tablemodify.languages[this.currentLanguage].get(term)
  }

    /**
     *  get array of references to the visible rows
     */
  getAvailableRows () {
    return this.availableRows
  }

    /**
     *  get array of references to all rows, both hidden and visible
     */
  getAllRows () {
    return this.allRows
  }

    /**
     * setter
     */
  setAvailableRows (arr) {
    this.availableRows = arr
    return this
  }

    /**
     * setter
     */
  setAllRows (arr) {
    this.allRows = arr
    return this
  }
    /**
     * returns number of available rows
     */
  countAvailableRows () {
    return this.availableRows.length
  }

    /**
     * returns number of hidden rows
     */
  countHiddenRows () {
    return this.allRows.length - this.availableRows.length
  }

    /*
     * returns number of all rows
     */
  countAllRows () {
    return this.allRows.length
  }

  render () {
    throw new Error('an error occured! tablemodify is not able to render the table')
  }

    /**
     * show all the rows that the param rowArray contains (as references).
     * used by filter module
     */
  _standardRender (limit = Infinity, offset = 0) {
    this.clearDOM()
    let fragment = document.createDocumentFragment()

    if (limit === Infinity || limit + offset > this.availableRows.length) {
      limit = this.availableRows.length
    } else {
      limit += offset
    }

    while (offset < this.availableRows.length && offset < limit) {
      fragment.appendChild(this.availableRows[offset])
      offset++
    }

    this.domElements.body.appendChild(fragment)
    this.actionPipeline.notify('__renderer')
    return this
  }

  _transitionedRender (limit = Infinity, offset = 0) {
    let func = () => {
      this.domElements.body.removeEventListener('transitionend', func)
      this._standardRender(limit, offset)
      this.domElements.body.style.opacity = 1
    }
    this.domElements.body.addEventListener('transitionend', func)
    this.domElements.body.style.opacity = 0.3

    setTimeout(() => {
      this.domElements.body.style.opacity = 1
    }, 2000)

    return this
  }

    /**
     * efficient way to empty the visible table rows
     * @return this for chaining
     */
  clearDOM () {
    let body = this.domElements.body
    while (body.firstChild) {
      body.removeChild(body.firstChild)
    }
    return this
  }

    /**
     * clears the body and appends new rows
     * @param data: array or string
     * @return this for chaining
     */
  insertRows (data) {
    return this.clearDOM()
        .setAllRows([])
        .appendRows(data)
  }

    /**
     * appends rows to the table and updates the internal availableRows & hiddenRows arrays
     * @param data: array or string
     * @return this for chaining
     */
  appendRows (data) {
    if (typeof data === 'string') {
      this.domElements.body.innerHTML = data
      data = [].slice.call(this.domElements.body.children)
    }

    if (Array.isArray(data)) {
      let all = this.getAllRows().concat(data)

      this.setAllRows(all)

      if (this.coreSettings.usesExternalData) {
        this.actionPipeline.notify('__renderer')
      } else {
        this.reload()
      }
    }
    return this
  }

  removeRows () {
    this.clearDOM()
            .setAllRows([])
            .reload()
  }

    /**
     * clears DOM and then does appendRaw(). See it for more information
     * @param {array} data
     * @return this for chaining
     */
  insertRaw (data) {
    return this.clearDOM().appendRaw(data)
  }

    /**
     * appends data of a special raw data type:
     * @param {array} data: 2D-array of objects like this: {c: "content", a: {attribute1: value, attribute2: value}}
     * @return this for chaining
     */
  appendRaw (data) {
    let trPattern = document.createElement('tr'),
      tdPattern = document.createElement('td')

    for (let i = 0; i < data.length; i++) {
      let tr = trPattern.cloneNode(), row = data[i]

      for (let j = 0; j < row.length; j++) {
        let td = tdPattern.cloneNode(), cell = row[j]
        td.innerHTML = cell.c
        if (cell.hasOwnProperty('a')) {
          Object.keys(cell.a).forEach((prop) => {
            td.addAttribute(prop, cell.a[prop])
          })
        }
        tr.appendChild(td)
      }
      this.allRows.push(tr)
    }
    this.reload()
    return this
  }

    /**
     * called when any module detects a change and before it performs its actions.
     * if a "beforeUpdate" function is passed at the tablemodiy initialisation, it will be called.
     * the module only does something if this method doesn't return false
     * @param {string} moduleName: which module calls this method
     */
  beforeUpdate (moduleName) {
    // beforeUpdate method passed? Just go on if not.
    if (!this.coreSettings.hasOwnProperty('beforeUpdate')) return true

    // collect all necessary data
    let infos = {};
    ['sorter', 'filter', 'pager'].forEach((name) => {
      if (this.isActive(name)) {
        infos[name] = this.getModule(name).getStats()
      }
    })

    let ret = this.coreSettings.beforeUpdate(infos, moduleName)
    return (ret === null || ret === undefined || ret === true)
  }

    /**
     * check if a module is acitve
     * @param {string} name: name of modules
     * @return {boolean}
*/
  isActive (name) {
    return this.activeModules.hasOwnProperty(name)
  }

    /**
     * returns the module if it is active
     * @param {string} name: name of the module
     * @return {object} module return of null if module is not active
     */
  getModule (name) {
    if (this.isActive(name)) {
      return this.activeModules[name]
    }
    return null
  }

    /**
     * get the index of the table header cell with the passed tm-id attribute
     * @param {string} tmId
     * @return {number} index if it exists, null otherwise
     */
  id2index (tmId) {
    let cell = this.domElements.container.querySelector('thead > tr > *[tm-id=' + tmId + ']')
    if (!cell) return null
    return [].indexOf.call(cell.parentNode.children, cell)
  }

    /**
     * returns the tm-id of a table header cell with the passed index
     * @param {number} index
     * @return {string} tm-id
     */
  index2id (index) {
    index++
    let cell = this.domElements.container.querySelector('thead > tr:first-of-type > *:nth-of-type(' + index + ')')
    if (!cell) return null
    return cell.getAttribute('tm-id')
  }

    /**
     * initiates reloading through the action pipeline
     * @return this for chaining
     */
  reload () {
    this.actionPipeline.notify('__reload')
    return this
  }

    /**
     * register an event listener to this tm instance.
     * multiple listeners can listen to the same event and will be fired in the same order as they are applied.
     * (!) not a normal js Event
     * @param {string} eventName
     * @param {function} func
     * @return this for chaining
     */
  on (eventName, func) {
    this.eventSystem.on(eventName, func)
    return this
  }

    /**
     * trigger an event on this tm instance
     * (!) tm event, not a normal js event
     * @param {string} eventName
     * @return this for chaining
     */
  trigger (eventName, ...params) {
    this.eventSystem.trigger(eventName, ...params)
    return this
  }

    /**
     * Static method for adding user-defined modules
     * this-value in a static method is the constructor function itself (here
     * Tablemodify)
     */
  static addModule (module, name) {
    if (typeof module === 'function') {
            // Create a new module based on the given name and initializer function
      return this.addModule(new Module({
        name: name,
        initializer: module
      }))
    } else if (typeof module === 'object') {
            // Check if it is a Module instance
      if (module instanceof Module) {
                // if the module already exists, throw
        if (this.modules[module.name]) {
          let errorMsg = 'Module ' + module.name + ' does already exist!'
          error(errorMsg)
          throw new Error(errorMsg)
        }
        this.modules[module.name] = module
            // Treat the objects as parameters for new module instance
      } else {
                // If a name is given as parameter, override a name in the parameters object
        if (isNonEmptyString(name)) {
          module.name = name
        }
        this.addModule(new Module(module))
      }
    }
  }

    /**
        add a language pack to the collection of Languages.
        param name: identifier of the language. May overwrite older ones
        param term: object containing the terms. see full list in language.js
    */
  static addLanguage (name, terms) {
    Tablemodify.languages[name] = new Language(name, terms)
  }
}

// order is important! modules will be initialized in this order
Tablemodify.modules = {
  columnStyles: require('./modules/columnStyles.js'),
  fixed: require('./modules/fixed.js'),
  filter: require('./modules/filter.js'),
  sorter: require('./modules/sorter.js'),
  pager: require('./modules/pager.js')//,
    // resizer: require('./modules/resizer.js')
}

Tablemodify.languages = {
  en: new Language('en', {
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
  }),
  de: new Language('de', {
    FILTER_DISCARD: 'Eingabe verwerfen',
    FILTER_PLACEHOLDER: 'Filter eingeben',
    FILTER_CASESENSITIVE: 'Gro&szlig; - und Kleinschreibung unterscheiden',
    FILTER_MATCHING: 'Exakte Suche',
    FILTER_COMPARATOR: 'Vergleichsoperator',
    FILTER_RANGE: 'Zahlenbereich',
    FILTER_RANGE_LIMIT: 'obere Grenze',
    FILTER_TITLE_STRING: 'Filter nach Zeichenketten',
    FILTER_TITLE_NUMERIC: 'Numerischer Filter',
    FILTER_TITLE_DATE: 'Datumsfilter',
    PAGER_PAGENUMBER_SEPARATOR: ' / '
  })
}

Tablemodify.Language = Language
// Store reference to the module class for user-defined modules
Tablemodify.Module = Module
// set version of Tablemodify
Tablemodify.version = 'v0.9.6'
// make the Tablemodify object accessible globally
window.Tablemodify = Tablemodify
