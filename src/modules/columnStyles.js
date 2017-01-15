const Module = require('./module.js');
const {addClass, iterate, info, error} = require('../utils.js');

module.exports = new Module({
    name: "columnStyles",
    initializer: function(settings) {
        try {
            addClass(this.container, 'tm-column-styles');

            let containerId = this.containerId;

            // style general
            let text = `div #${containerId} table tr > * {`;
            iterate(settings.all, function(prop, value) {
                text += `${prop}: ${value};`;
            });
            text += '}';

            // add custom styles to the single columns
            iterate(settings, function(index, cssStyles) {
                if (index === 'all') return;
                var i = parseInt(index) + 1;

                text += `div #${containerId} table tr > *:nth-of-type(${i}) {`;
                iterate(cssStyles, function(prop, value) {
                    text += `${prop}: ${value};`;
                });
                text += '}';
            });
            this.appendStyles(text);
            info('module columnStyles loaded');
        } catch(e) {
            error(e);
        }
    }
});
