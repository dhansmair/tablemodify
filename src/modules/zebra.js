const {addClass, extend, info, error} = require('../utils.js');
const Module = require('./module.js');
/*

    DEPRECATED, can be realized via CSS, see default theme

*/
module.exports = new Module({
    name: "zebra",
    defaultSettings: {
        even:'#f0f0f0',
        odd:'white'
    },
    initializer: function(settings) {
        // this := Tablemodify-instance
        try {
            addClass(this.container, 'tm-zebra');

            var defaults = {even:'#f0f0f0', odd:'white'};
            extend(defaults, settings);

            var text = 'table' + this.bodySelector + ' tr:nth-of-type(even){background-color:' + settings.even + '}'
                     + 'table' + this.bodySelector + ' tr:nth-of-type(odd) {background-color:' + settings.odd + '}';
            this.appendStyles(text);

            info('module zebra loaded');
        } catch (e) {
            error(e);
        }
    }
});
