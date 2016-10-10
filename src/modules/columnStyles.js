const Module = require('./module.js');
const {addClass, iterate, info, error} = require('../utils.js');

module.exports = new Module({
    name: "columnStyles",
    defaultSettings: {
        all: {
            'text-align':'center',
            'padding': '3px'
        }
    },
    initializer: function(settings) {
        try {
            addClass(this.container, 'tm-column-styles');

            var containerId = this.containerId;

            // style general
            var text = 'div#' + containerId + ' table tr > *{';
            iterate(settings.all, function(prop, value) {
                text += prop + ':' + value + ';';
            });
            text += '}';

            delete settings.all;

            // add custom styles to the single columns
            iterate(settings, function(index, cssStyles) {
                var i = parseInt(index) + 1;

                text += 'div#' + containerId + ' table tr > *:nth-of-type(' + i + '){';
                iterate(cssStyles, function(prop, value) {
                    text += prop + ':' + value + ';';
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
