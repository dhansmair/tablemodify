let utils = require('../utils.js');
let Module = require('./module.js');

module.exports = function(settings) {
    utils.addClass(this.container, 'tm-sorter');

    function getValue(tr, i) {return tr.cells[i].innerHTML.trim();}

    // set up
    var core = this,
        head = this.head,
        foot = this.foot,
        //headWrap,
        //footWrap,
        container = this.container,
        body = this.body,
        bodyWrap = this.bodyWrap,
        origHead = this.origHead,
        origFoot = this.origFoot;


    var defaults = {
        headers: {
            all: {
                enabled: true,
                parser: 'intelligent'
            }
        },
        initial: [0, 'asc'],
        enableMultisort: true,
        customParsers: {}
    };

    utils.extend(defaults, settings);
    /*
        constructor
    */
    function Sorter() {
        var _this = this,
            i = settings.initial[0],
            order = settings.initial[1];

        this.body = body.tBodies[0];
        //this.rows = [].slice.call(this.body.rows);
        this.headers = settings.headers;
        this.headCells = head ? [].slice.call(head.firstElementChild.firstElementChild.cells) : [].slice.call(body.tHead.firstElementChild.cells);

        utils.iterate(settings.customParsers, function(name, func){
            _this.parsers[name] = func;
        });

        // iterate over header cells
        utils.iterate(this.headCells, function(i, cell) {

            if (_this.getIsEnabled(i)) {
                utils.addClass(cell, 'sortable');
                cell.addEventListener('click', function(e) {

                    if (e.shiftKey && settings.enableMultisort) {
                        _this.manageMulti(i);
                    } else {
                        _this.manage(i);
                    }

                });
            }
        });
        /*
        head.addEventListener('click', function(e) {
            var cell = e.target;
            var index = e.target.cellIndex;
            if (e.shiftKey && settings.enableMultisort) {
                // cell is a new sorting argument
                _this.manageMulti(index, cell);
            } else {
                _this.manage(index, cell);
            }
        });
        */
        // try to sort by initial sorting
        if (!this.getIsEnabled(i)) {
            // not enabled, choose another initial sorting
            var initialized = false;
            i = 0;
            while (i < this.headCells.length && !initialized) {
                if (this.getIsEnabled(i)) {
                    this.manage(i);
                    initialized = true;
                }
                i++;
            }

        } else if (order === 'desc') {
            // enabled, sort desc
            this.setOrderAsc(false)
                .setIndex(i)
                .sort()
                .render()
                .renderSortingArrows();

        } else {
            // enabled, sort asc
            this.setOrderAsc();
            this.manage(i);
        }
    }

    Sorter.prototype = {
        ready: true,
        headers: {},
        headCells: [],
        body: null,
        rows: [],

        indices: [Infinity],
        orders: [true],

        parsers: {
            string: function(a, b) {
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            },
            numeric: function(a, b) {
                a = parseFloat(a);
                b = parseFloat(b);
                return a - b;
            },
            intelligent: function(a, b) {
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
            },
            /*
                parses these Date Formats:
                 d.mm.YYYY
                  d.m.YYYY
                 dd.m.YYYY
                dd.mm.YYYY
            */
            germanDate: function(a, b) {
                try{
                    var dateA = new Date(),
                        dateB = new Date(),
                        partsA = a.split('.'),
                        partsB = b.split('.');

                    if (partsA.length === 3) {
                        dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]), parseInt(partsA[0]));
                    } else if (partsA.length === 2) {
                        dateA = new Date(parseInt(partsA[1]), parseInt(partsA[0]));
                    }

                    if (partsB.length === 3) {
                        dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]), parseInt(partsB[0]));
                    } else if (partsB.length === 2) {
                        dateB = new Date(parseInt(partsB[1]), parseInt(partsB[0]));
                    }

                    if (dateA > dateB) return 1;
                    if (dateA < dateB) return -1;
                    return 0;
                } catch(e) {
                    utils.error(e);
                    return -1;
                }
            },
            /*
                NOT IMPLEMENTED YET
                @TODO implement
            */
            americanDate: function(a, b) {
                return this.intelligent(a, b);
            },
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
        },
        setRows: function(rowArray) {
                core.setRows(rowArray);
                return this;
        },
        setIndex: function(i) {
            this.indices = [i];
            return this;
        },

        setOrderAsc: function(bool) {
            if (bool === undefined) bool = true;
            this.orders = [bool];
            return this;
        },
        getRows: function() {
            return core.getRows();
        },
        getParser: function(i) {
            return (this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('parser')) ? this.parsers[this.headers[i].parser] : this.parsers[this.headers.all.parser];
        },
        getIsEnabled: function(i) {
            return (this.headers.hasOwnProperty(i) && this.headers[i].hasOwnProperty('enabled')) ? this.headers[i].enabled : this.headers.all.enabled;
        },
        getIndex: function() {return this.indices[0];},
        getOrderAsc: function() {return this.orders[0];},

        sort: function() {
            var i = this.getIndex(),
                o = this.getOrderAsc(),
                p = this.getParser(i);

            this.getRows().sort(function(a, b) {
                return p(getValue(a, i), getValue(b, i));
            });

            if (!o) this.reverse();

            return this;
        },
        multiSort: function() {
            var _this = this,
                indices = this.indices,
                orders = this.orders,
                parsers = indices.map(function(i) {return _this.getParser(i);}),
                maxDeph = indices.length - 1;

            this.getRows().sort(function(a, b) {
                var comparator = 0, deph = 0;

                while (comparator === 0 && deph <= maxDeph) {
                    var tmpIndex = indices[deph];
                    comparator = parsers[deph](getValue(a, tmpIndex), getValue(b, tmpIndex));
                    deph++;
                }

                deph--; // decrement again
                // invert result in case order of this columns is descending
                return (orders[deph] || deph > maxDeph) ? comparator : (-1) * comparator;
            });

            return this;
        },
        reverse: function() {
            var array = this.getRows(),
                left = null,
                right = null,
                length = array.length;
            for (left = 0; left < length / 2; left += 1) {
                right = length - 1 - left;
                var temporary = array[left];
                array[left] = array[right];
                array[right] = temporary;
            }
            this.setRows(array);
            return this;
        },
        render: function() {
            core.render();

            return this;
        },
        renderSortingArrows: function() {
            // remove current sorting classes
            utils.iterate(container.querySelectorAll('.sort-up, .sort-down'), function(i, cell){
                utils.removeClass(cell, 'sort-up');
                utils.removeClass(cell, 'sort-down');
            });

            var length = this.indices.length;

            if (length > 0) {
                var l = length - 1;
                for (; l >= 0; l--) {
                    var index = this.indices[l];
                    var asc = this.orders[l];
                    var cell = this.headCells[index];

                    if (asc) { // ascending
                        utils.addClass(cell, 'sort-up');
                    } else { // descending
                        utils.addClass(cell, 'sort-down');
                    }
                }
            }
            return this;
        },

        manage: function(i) {

            if (!this.ready) return;
            this.ready = false;

            if (this.getIndex() === i) {

                this.setOrderAsc(!this.getOrderAsc());  // invertiere aktuelle Sortierung

            } else if (this.getIsEnabled(i)) {

                this.setOrderAsc();                     // sort ascending

            }

            this.setIndex(i)
                .sort()
                .render()
                .renderSortingArrows();

            this.ready = true;
            return this;
        },
        manageMulti: function(i) {
            // add i to the multi indices
            if (!this.ready) return;
            this.ready = false;

            var indices = this.indices,
                exists = indices.indexOf(i);

            if (exists === -1) {
                // add new multisort index
                this.indices.push(i);
                this.orders.push(true);
            } else {
                // invert
                this.orders[exists] = !this.orders[exists];
            }
            // now sort
            this.multiSort()
                .render()
                .renderSortingArrows();

            this.ready = true;
            return this;
        }
    }
    var sorterInstance = new Sorter();

    return {
            sortAsc: function(i) {
                sorterInstance
                    .setIndex(i)
                    .setOrderAsc()
                    .sort()
                    .render()
                    .renderSortingArrows();
            },
            sortDesc: function(i) {
                sorterInstance
                    .setIndex(i)
                    .setOrderAsc(false)
                    .sort()
                    .render()
                    .renderSortingArrows();
            }
    };
}
