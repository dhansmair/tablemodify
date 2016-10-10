const {addClass, iterate, info, error} = require('../utils.js');
const Module = require('./module.js');

const newCell = (function() {
    let cell = document.createElement('td');
    cell.innerHTML = "<div class='tm-input-div'><input type='text' placeholder='type filter here'/></div>"
                    + "<span class='tm-custom-checkbox' title='case-sensitive'>"
                    + "<input type='checkbox' value='1' name='checkbox' />"
                    + "<label for='checkbox'></label>"
                    + "</span>";


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
        this.rows = tm.getRows();

        this.indices = [];
        this.patterns = [];
        this.options = [];
    }

    // new version setters
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
    // new version getters
    getPatterns() {
        return this.patterns;
    }
    getIndices() {
        return this.indices;
    }
    getOptions() {
        return this.options;
    }

    filter() {
        let indices = this.getIndices(),
            patterns = this.getPatterns(),
            options = this.getOptions();

        const maxDeph = indices.length - 1;

        // filter rows
        let arr = this.rows.filter(function(row) {
            let deph = 0, matches = true;

            while (matches && deph <= maxDeph) {
                let i = indices[deph];
                let pattern = patterns[deph];
                let tester = row.cells[i].innerHTML;

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

        this.tm.setRows(arr).render();
        return this;
    }
};

class FilterDefault extends Filter {
    constructor(tm) {
        super(tm);
        this.tHead = tm.head ? tm.head.tHead : tm.origHead;

        // create the toolbar row
        let num = this.tHead.firstElementChild.cells.length - 1;
        let row = document.createElement('tr');
        for (; num >= 0; num--) {
            row.appendChild(newCell());
        }
        addClass(row, 'tm-filter-row');

        // bind listeners
        let _this = this, timeout;
        row.onkeyup = function(e) {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                _this.run();
            }, 500);
        }
        row.onclick = function(e) {
            const cell = getCell(e),
                  target = e.target;

            if (target.nodeName == 'SPAN' || target.nodeName == 'LABEL') {
                // checkbox click
                let checkbox = cell.querySelector('input[type=checkbox]');
                checkbox.checked = !checkbox.checked;
                _this.run();
            } else if (target.nodeName == 'INPUT') {
                target.select();
            }
        }
        row.onchange = function(e) {
            _this.run();
        }

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

        return this;
    }
}

// constructor for special filter template
/*
function FilterB() {
    var _this = this, timeout;
    // modify DOM
    var wrapper = document.createElement('div');
    addClass(wrapper, 'tm-filter-wrap');
    core.container.insertBefore(wrapper, core.bodyWrap);

    wrapper.innerHTML = "<span class='tm-filter-loaded'>&nbsp;</span>"
                      + "<span class='tm-filter-add-button'>+</span>";

    wrapper.onclick = function(e) {
        var target = e.target;

        if (hasClass(target, 'tm-filter-instance')) {
            if (hasClass(target, 'tm-open')) {
                // close it
                removeClass(target, 'tm-open');
            } else {
                // open it
                _this.minAll();
                addClass(target, 'tm-open');
            }
        } else if (hasClass(target, 'tm-filter-add-button')) {
            _this.minAll();
            _this.addFilter();
        } else if (hasClass(target, 'tm-custom-checkbox')) {
            target.firstElementChild.checked = !target.firstElementChild.checked;
            _this.run();
        } else if (hasClass(target.parentNode, 'tm-custom-checkbox')) {
            target.previousSibling.checked = !target.previousSibling.checked;

            _this.run();
        } else if (hasClass(target, 'tm-filter-wrap')) {
            _this.minAll();
        }
    };
    wrapper.onchange = function(e) {
        _this.run();
    }
    wrapper.onkeyup = function(e) {
        if (e.target.nodeName === 'INPUT') {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                _this.run();
            }, 500);
        }
    }

    this.activeFilters = wrapper.querySelector('.tm-filter-loaded');
    this.filterWrap = wrapper;
    this.rows = core.getRows();

    this.addFilter = function() {
        var newFilter = document.createElement('span');
        addClass(newFilter, 'tm-filter-instance');
        addClass(newFilter, 'tm-open');

        newFilter.innerHTML = "<select></select>"
                            + "<input type='text' placeholder='type filter here' />"
                            + "<span class='tm-custom-checkbox' title='case-sensitive'>"
                                + "<input type='checkbox' value='1' name='checkbox' />"
                                + "<label for='checkbox'></label>"
                                + "</span>";

        // add options to select field
        var select = newFilter.firstElementChild;

        iterate(core.origHead.firstElementChild.cells, function(i, cell) {
            var option = document.createElement('option');
            option.text = cell.innerHTML;
            option.value = i;

            select.add(option);
        });

        // define getters
        newFilter.getIndex = function() {
            var select = this.firstElementChild;
            return select.options[select.selectedIndex].value;
        }
        newFilter.getPattern = function() {
            return this.children[1].value.trim();
        }
        newFilter.getOption = function() {
            return this.querySelector('input[type=checkbox]').checked;
        }

        this.activeFilters.appendChild(newFilter);
    }
    this.minAll = function() {
        iterate(this.filterWrap.querySelectorAll('.tm-filter-instance.tm-open'), function(i, instance) {
            removeClass(instance, 'tm-open');
        });
    }
    this.run = function() {
        // collect all information
        var filters = [].slice.call(this.activeFilters.children),
            patterns = [], indices = [], options = [];

        iterate(filters, function(i, filterObj) {
            indices.push(filterObj.getIndex());
            patterns.push(filterObj.getPattern());
            options.push(filterObj.getOption());
        });

        this.setIndices(indices)
            .setPatterns(patterns)
            .setOptions(options)
            .filter();
    }

}
*/

module.exports = new Module({
    name: "filter",
    defaultSettings: {
        filterStyle: 'default'
    },
    initializer: function(settings) {
        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-filter');

            switch (settings.filterStyle) {
                /*
                case 'special':
                    new FilterB();
                break;*/
                default:
                    new FilterDefault(this);
            }

            info('module filter loaded');
        } catch (e) {
            error(e);
        }
    }
});
