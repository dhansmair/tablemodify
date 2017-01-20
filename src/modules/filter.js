const {addClass, iterate, info, error, trigger} = require('../utils.js');
const Module = require('./module.js');

const newCell = (function() {
    let cell = document.createElement('td');
    cell.innerHTML =   `<div class='tm-input-div'><input type='text' placeholder='type filter here' /></div>
                        <span class='tm-custom-checkbox' title='case-sensitive'>
                            <input type='checkbox' value='1' name='checkbox' />
                            <label for='checkbox'></label>
                        </span>`;


    return function() {
        return cell.cloneNode(true);
    }
}());

function getCell(e) {
    let cell = e.target;
    while (cell.cellIndex === undefined) {
        cell = cell.parentNode;
    }
    return cell;
}

// prototype for Filter
class Filter {

    constructor(tm) {
        this.tm = tm;

        this.indices = [];
        this.patterns = [];
        this.options = [];
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

    isFilterActive() {
        return this.getPatterns().length !== 0;
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
        super(tm);
        this.tHead = tm.head ? tm.head.tHead : tm.origHead;

        // create the toolbar row
        let num = this.tHead.firstElementChild.cells.length - 1,
            row = document.createElement('tr'),
            timeout;
        for (; num >= 0; num--) {
            row.appendChild(newCell());
        }
        addClass(row, 'tm-filter-row');

        if (!settings.autoCollapse) row.style.height = '30px';

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
            if (this.isFilterActive()) this.run();
        });

        // insert toolbar row into tHead
        this.tHead.appendChild(row);
    }

    run() {
        const inputs = [].slice.call(this.tHead.querySelectorAll('input[type=text]'));
        const checkboxes = [].slice.call(this.tHead.querySelectorAll('input[type=checkbox]'));

        let patterns = [], indices = [], options = [];

        iterate(inputs, function(i, input) {
            if (input.value.trim() !== '') {
                indices.push(i);
                patterns.push(input.value.trim());
                options.push(checkboxes[i].checked);
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
        autoCollapse: true
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
