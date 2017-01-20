const Module = require('./module.js');
const dateUtils = require('../dateUtils.js');
const {addClass, isFn, errorThrow, hasProp, log, warn, error,
       isBool, isNonEmptyString,
       iterate, removeClass, extend2, isObject} = require('../utils.js');

function getValue(tr, i) {return tr.cells[i].innerHTML.trim().toLowerCase();}

const FIRST_ENABLED_CELL = 'firstEnabled';
const SORT_ORDER_ASC = 'asc';
const SORT_ORDER_DESC = 'desc';

/**
 * The Parser class encapsulates compare functions for the sorting functionality
 * A Parser can either encapsulate two types of compare functions:
 * a) a simple compare function, taking 2 arguments and returning a value <0, 0 or >0
 * b) a parametric compare function, taking one argument (the parameters) and returning
 *    a compare function as described in a)
 */
class Parser {
    /**
     * Create a parser
     * @param {Function} getFn - Either a simple compare function or a parametric one
     * @param {Object} defaultSettings - The default settings for a parametric compare
     *                                   compare function, omit if it is not a parametric one
     */
    constructor(getFn, defaultSettings) {
        if (!isFn(getFn)) {
            errorThrow('First argument given to parser must be a function!');
        }
        this.getFn = getFn;
        this.defaultSettings = isObject(defaultSettings) ? defaultSettings : false;
    }

    /**
     * Get the actual compare function from the encapsulated one
     * @param {Object} providedSettings - Parameters given to a parametric compare function,
     *                                    omit if it's not a parametric one
     * @returns {Function} The actual compare function to be used in sorting algorithm
     * @throws {Error} If parameters are given for a non-parametric compare function
     */
    get(providedSettings) {
        let settingsGiven = isObject(providedSettings);

        if (settingsGiven && !this.defaultSettings) {
            errorThrow("This parser doesn't accept options!");
        }

        //The compare function to be returned
        let retFn = this.getFn;
        if (this.defaultSettings) {
            if(!settingsGiven) {
                providedSettings = {};
            }
            extend2(providedSettings, this.defaultSettings);
            retFn = this.getFn(providedSettings);
            if (!isFn(retFn)) {
                errorThrow("Parser didn't return a compare function!");
            }
        }
        return retFn;
    }
}

class Sorter {
    constructor(tableModify, settings) {
        //Set initial values
        extend2(this, {
            ready: true,
            headers: {},
            headCells: [],
            body: null,
            rows: [],
        });
        //Store a reference to the tablemodify instance
        this.tm = tableModify;
        addClass(this.tm.container, 'tm-sorter');
        this.body = this.tm.body.tBodies[0];

        this.sortColumns = settings.columns;
	//Array of structure [[col_index_1, true | false], [col_index_2, true | false], ...]
        this.currentOrders = [];
        this.headCells = this.tm.head ? [].slice.call(this.tm.head.firstElementChild.firstElementChild.cells) : [].slice.call(this.tm.body.tHead.firstElementChild.cells);

        iterate(settings.customParsers, (name, func) => {
            this.parsers[name] = new Parser(func);
        });

        // attach sorting event listeners
        iterate(this.headCells, (i, cell) => {
            i = parseInt(i);

            if (this.getIsEnabled(i)) {
                addClass(cell, 'sortable');
                cell.addEventListener('click', (e) => {
                    if (e.shiftKey && settings.enableMultisort) {
                        this.manageMulti(i);
                    } else {
                        this.manage(i);
                    }

                });
            }
        });

        // try to sort by initial sorting
        if (settings.initialColumn !== false) {
            let initIndex = settings.initialColumn;
            let initOrder = settings.initialOrder;
            initOrder = initOrder === SORT_ORDER_ASC;
            //if special value first_enabled is provided, search for first searchable column
            if (initIndex === FIRST_ENABLED_CELL) {
                let colCount = this.tm.getColumnCount();
                for (let i = 0; i < colCount; ++i) {
                    if (this.getIsEnabled(i)) {
                        initIndex = i;
                        break;
                    }
                }
            }
            if (this.getIsEnabled(initIndex)) {
                this.manage(initIndex, false, initOrder);
            }
        }

        // sort again in case it's needed.
        this.tm.body.addEventListener('tmSorterSortAgain', () => {
            this.sort();
        });

        this.tm.body.addEventListener('tmRowsAdded', () => {
            this.sort();
        });
    }

    /**
     * Sets the current order for a given column or adds a new order if an order
     * for this column did not exist
     * @param {Number} columnIndex - The index of the column
     * @param {Boolean} order - true for ascending, false for descending order
     * @returns this for method chaining
     */
    setOrAddOrder(columnIndex, order) {
        if (this.hasOrder(columnIndex)) {
            this.currentOrders.filter(e => e[0] === columnIndex)[0][1] = order;
        } else {
            this.currentOrders.push([columnIndex, order]);
        }
        return this;
    }

    /**
     * Check if there exists a current order for the column specified by columnIndex
     * @returns {Boolean}
    */
    hasOrder(columnIndex) {
        return this.currentOrders.filter(e => e[0] === columnIndex).length > 0;
    }

    /**
     * Gets the current order for the column specified by columIndex
     * @returns {Boolean} true for ascending, false for descending, undefined if no order exists
     */
    getOrder(columnIndex) {
        if (!this.hasOrder(columnIndex)) return;
        let order = this.currentOrders.filter(e => e[0] === columnIndex)[0];
        return order[1];
    }

    /**
     * Removes all current orders
     * @returns this for method chaining
     */
    removeAllOrders() {
        this.currentOrders = [];
        return this;
    }

    /**
     * Gets the compare function for a given column
     * @param {Number} i - The column index
     * @returns {Function} The compare function
     * @throws {Error} If the parser for the given column cannot be found
     */
    getParser(i) {
        let parserObj;
        //Find out if we have to use the parser given for all columns or there is an individual parser
        if (hasProp(this.sortColumns, i, 'parser')) {
            parserObj = this.sortColumns[i];
        } else {
            parserObj = this.sortColumns.all;
        }

        if(!this.parsers.hasOwnProperty(parserObj.parser)) {
            errorThrow(`The given parser ${parserObj.parser} does not exist!`);
        }

        return this.parsers[parserObj.parser].get(parserObj.parserOptions);
    }

    /**
     * Checks whether sorting by a given column is enabled
     * @param {Number} i - The column index
     * @returns {Boolean}
     */
    getIsEnabled(i) {
        return hasProp(this.sortColumns, i, 'enabled')
               ? this.sortColumns[i].enabled
               : this.sortColumns.all.enabled;
    }

    /**
     * Gets all compare functions needed to sort by the currently active sort columns
     * @returns {Array} Array of compare functions
     * @throws {Error} If the parser for one of the current columns cannot be found
     */
    getParsers() {
        return this.currentOrders.map(order => this.getParser(order[0]));
    }

    /**
     * Does the actual sorting work by all given sort orders, does no DOM manipulation
     * @returns this for method chaining
     */
    sort() {
        let orders = this.currentOrders;
        let maxDepth = orders.length - 1;
        let parsers = this.getParsers();

        let sorted = this.tm.getVisibleRows().sort((a, b) => {
            let compareResult = 0, curDepth = 0;
            while (compareResult === 0 && curDepth <= maxDepth) {
                let index = orders[curDepth][0];
                compareResult = parsers[curDepth](getValue(a, index), getValue(b, index));
                ++curDepth;
            }
            --curDepth;
            return orders[curDepth][1] ? compareResult : -compareResult;
        });

        this.tm.showRows(sorted);
        return this;
    }

    /**
     * Adds the corresponding css classes for ascending/descending sort order to the headers
     * of currently active sort columns to provide a visual feedback to the user
     * @returns this for method chaining
     */
    renderSortingArrows() {
        // remove current sorting classes
        iterate(this.tm.container.querySelectorAll('.sort-up, .sort-down'), (i, cell) => {
            removeClass(cell, 'sort-up');
            removeClass(cell, 'sort-down');
        });

        for(let i = this.currentOrders.length - 1; i >= 0; --i) {
            let [index, order] = this.currentOrders[i];
            let cell = this.headCells[index];
            addClass(cell, order ? 'sort-up' : 'sort-down');
        }
        return this;
    }

    /**
     * Handles a sorting action for a specific column
     * @param {Number} colIndex - The column index
     * @param {Boolean} multiSort - if true and sorting by given column was already enabled, just
     *                              change the sorting order, otherwise append to the sorting orders
     *                              if false, all current sorting orders are removed and sorting by
     *                              the given column will be enabled
     * @param {Boolean} order - true for ascending, false for descending, omit for inverting of the
     *                          current order (if none existed, ascending is used)
     * @returns this for method chaining
     */
    manage(colIndex, multiSort, order) {
        if (!this.getIsEnabled(colIndex)) {
            warn(`Tried to sort by non-sortable column index ${colIndex}`);
            return this;
        }
        if (!isBool(order)) {
            if (this.hasOrder(colIndex)) {
                order = !this.getOrder(colIndex);
            } else {
                order = true;
            }
        }
        if (multiSort !== true) this.removeAllOrders();
        this.setOrAddOrder(colIndex, order);

        this.sort().renderSortingArrows();

        return this;
    }
    /**
     * Shortcut for the manage method with multiSort set to true
     * @returns this for method chaining
     */
    manageMulti(colIndex, order) {
        this.manage(colIndex, true, order);
        return this;
    }
}
Sorter.prototype.parsers = {
    string: new Parser((a, b) => {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    }),
    numeric: new Parser((a, b) => {
        a = parseFloat(a);
        b = parseFloat(b);
        return a - b;
    }),
    intelligent: new Parser((a, b) => {
        var isNumericA = !isNaN(a),
            isNumericB = !isNaN(b);

        if (isNumericA && isNumericB) {
            return parseFloat(a) - parseFloat(b);
        } else if (isNumericA) {
            return -1;
        } else if (isNumericB) {
            return 1;
        } else {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        }
    }),
    /**
     * A parametric parser which takes two arguments, 'preset' and 'format'.
     * If format is given, it overrides a potential preset, format should be a
     * format string (tokens described in https://github.com/taylorhakes/fecha#formatting-tokens)
     * preset is either 'english' or 'german' and will parse the common forms of english/german
     * date formats
     */
    date: new Parser(settings => {

        let {fecha, DATE_I18N, DATE_FORMATS} = dateUtils;

        if (settings.format) {
            if (!isNonEmptyString(settings.format)) {
                errorThrow(`Invalid date parsing format ${settings.format} given`);
            }
            return (a, b) => {
                try {
                    let aDate = fecha.parse(a, settings.format);
                    let bDate = fecha.parse(b, settings.format);
                    if (!aDate || !bDate) throw new Error("couldn't parse date!");
                    return aDate - bDate;
                } catch (e) {
                    errorThrow(`Error while comparing dates: ${e}`);
                }
            }
        } else if (settings.preset) {
            let i18n = DATE_I18N[settings.preset];
            if (!i18n) errorThrow(`Invalid preset name ${settings.preset} given!`);
            let formats = DATE_FORMATS[settings.preset];
            return (a, b) => {
                try {
                    let aDate = false, bDate;
                    let index = 0;
                    while (!aDate && index < formats.length) {
                        aDate = fecha.parse(a, formats[index]);
                        bDate = fecha.parse(b, formats[index]);
                        ++index;
                    }
                    if (!aDate) throw new Error("None of the given parsers matched!");
                    return aDate - bDate;
                } catch (e) {
                    errorThrow(`Couldn't compare dates: ${e}`);
                }
            }
        } else {
            errorThrow("Neither a preset nor a date format has been given!");
        }
    }, {
        preset: dateUtils.DATE_GERMAN
    }),
    /*
        german days of the week
    */
    daysOfTheWeek: function(a, b) {
        function getIndex(str) {
            var i = -1, l = days.length - 1;
            while (l > -1 && i === -1) {
                i = days[l].indexOf(str);
                l--;
            }
            return i;
        }

        var days = [
            // german
            ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'],
            ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'],
            // english
            ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        ];

        return getIndex(b.toLowerCase()) - getIndex(a.toLowerCase());
    }
}

module.exports = new Module({
    name: "sorter",
    defaultSettings: {
        columns: {
            all: {
                enabled: true,
                parser: 'intelligent'
            }
        },
        initialColumn: FIRST_ENABLED_CELL,
        initialOrder: SORT_ORDER_ASC,
        enableMultisort: true,
        customParsers: {}
    },
    initializer: function(settings) {
        let sorterInstance = new Sorter(this, settings);
        return {
            sortAsc: index => sorterInstance.manage(index, false, true),
            sortDesc: index => sorterInstance.manage(index, false, false),
            info: function() {
                console.log(sorterInstance.currentOrders);
            },
            unset: () => {
                log('unsetting sorter... not implemented yet');
                /*
                    @Todo set order to initial ... don't know how to do it yet
                */
            }
        };
    }
});
