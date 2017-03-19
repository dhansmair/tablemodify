const {addClass, iterate, info, error, trigger, replaceIdsWithIndices} = require('../utils.js');
const Module = require('./module.js');
const FILTER_HEIGHT = '30px';

/**
    Factory class to produce filter cells
*/
class CellFactory {
    constructor(tm) {
        let placeholder = tm.getTerm('FILTER_PLACEHOLDER'),
            caseSensitive = tm.getTerm('FILTER_CASESENSITIVE');


        this.cell = document.createElement('td');
        this.cell.innerHTML = `<div class='tm-input-div'><input type='text' placeholder='${placeholder}' /></div>
                                                <span class='tm-custom-checkbox' title='${caseSensitive}'>
                                                    <input type='checkbox' value='1' name='checkbox' />
                                                    <label for='checkbox'></label>
                                                </span>`;
    }

    produce(enabled = true, caseSensitive = true) {
        if (!enabled) return document.createElement('td');
        let ret = this.cell.cloneNode(true);
        if (!caseSensitive) ret.removeChild(ret.lastChild); // remove custom checkbox
        return ret;
    }
}

function getCell(e) {
    let cell = e.target;
    while (cell.cellIndex === undefined) {
        cell = cell.parentNode;
    }
    return cell;
}

// prototype for Filter
class Filter {

    constructor(tm, settings) {
        this.tm = tm;

        this.indices = [];
        this.patterns = [];
        this.options = [];

        settings.columns = replaceIdsWithIndices(settings.columns);
        this.settings = settings;
    }

    // setters
    setPatterns(patterns) {
        this.patterns = patterns;
        return this;
    }
    setIndices(indices) {
        this.indices = indices;
        return this;
    }
    setOptions(options) {
        this.options = options;
        return this;
    }
    // getters
    getPatterns() {
        return this.patterns;
    }
    getIndices() {
        return this.indices;
    }
    getOptions() {
        return this.options;
    }

    anyFilterActive() {
        return this.getPatterns().length !== 0;
    }

    getIsEnabled(i) {return this.getColumnSetting(i, 'enabled');}
    getIsCaseSensitive(i) {return this.getColumnSetting(i, 'caseSensitive');}

    getColumnSetting(i, setting) {
        let cols = this.settings.columns;
        if (cols.hasOwnProperty(i) && cols[i].hasOwnProperty(setting)) {
            // a custom value was set
            return cols[i][setting];
        }
        return cols.all[setting];
    }

    filter() {
        let indices = this.getIndices(),
            patterns = this.getPatterns(),
            options = this.getOptions();

        const maxDeph = indices.length - 1;

        // filter rows
        let arr = this.tm.getAllRows().filter(function(row) {
            let deph = 0, matches = true;

            while (matches && deph <= maxDeph) {
                let i = indices[deph],
                    pattern = patterns[deph],
                    tester = row.cells[i].innerHTML;

                if (!options[deph]) {
                    // not case-sensitive
                    pattern = pattern.toLowerCase();
                    tester = tester.toLowerCase();
                }

                matches = tester.indexOf(pattern) !== -1;
                deph++;
            }
            return matches;

        });

        return this.tm.showRows(arr);
    }
};

class FilterDefault extends Filter {
    constructor(tm, settings) {
        super(tm, settings);
        this.tHead = tm.head ? tm.head.tHead : tm.origHead;

        // create the toolbar row
        let num = this.tHead.firstElementChild.cells.length,
            row = document.createElement('tr'),
            cellFactory = new CellFactory(tm),
            timeout;

        for (let i = 0; i < num; i++) {
            let enabled = this.getIsEnabled(i);
            let cs = this.getIsCaseSensitive(i);

            row.appendChild(cellFactory.produce(enabled, cs));
        }
        addClass(row, 'tm-filter-row');

        if (settings.autoCollapse){
            // keep filter row visible if an input is focused
            [].slice.call(row.querySelectorAll('input')).forEach((input) => { // it seems like in IE11 .forEach only works on real arrays
                input.onfocus = (e) => {
                    row.style.height = FILTER_HEIGHT;
                };
                input.onblur = (e) => {
                    row.style.removeProperty('height');
                };
            });
        } else {
            row.style.height = FILTER_HEIGHT;
        }


        // bind listeners
        row.onkeyup = (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.run();
            }, 500);
        }
        row.onclick = (e) => {
            const cell = getCell(e),
                  target = e.target;

            if (target.nodeName == 'SPAN' || target.nodeName == 'LABEL') {
                // checkbox click
                let checkbox = cell.querySelector('input[type=checkbox]');
                checkbox.checked = !checkbox.checked;
                this.run();
            } else if (target.nodeName == 'INPUT') {
                target.select();
            }
        }

        row.onchange = () => {
            this.run();
        }

        tm.body.addEventListener('tmRowsAdded', () => {
            if (this.anyFilterActive()) this.run();
        });

        // insert toolbar row into tHead
        this.tHead.appendChild(row);
    }

    run() {
        const filterCells = [].slice.call(this.tHead.querySelector('tr.tm-filter-row').cells);
        let patterns = [], indices = [], options = [];

        iterate(filterCells, function(i, cell) {
            let input = cell.querySelector('input[type=text]');
            let checkbox = cell.querySelector('input[type=checkbox]');

            if (input && input.value.trim() !== '') {
                indices.push(i);
                patterns.push(input.value.trim());
                if (checkbox) options.push(checkbox.checked);
            }
        });

        this.setPatterns(patterns)
            .setIndices(indices)
            .setOptions(options)
            .filter();

        this.tm.signal('tmSorterSortAgain', 'tmFixedForceRendering');

        return this;
    }
}

module.exports = new Module({
    name: "filter",
    defaultSettings: {
        autoCollapse: true,
        columns: {
            all: {
                enabled: true,
                caseSensitive: true
            }
        }
    },
    initializer: function(settings) {
        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-filter');

            let instance = new FilterDefault(this, settings);

            info('module filter loaded');

            return {
                instance: instance,
                unset: () => {
                    info('unsetting filter');
                    // remove all filters;
                    this.showAllRows();
                }
            };
        } catch (e) {
            error(e);
        }
    }
});
