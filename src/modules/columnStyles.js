const Module = require('./module.js')
const {addClass, iterate, info, error, replaceIdsWithIndices} = require('../utils.js')

let tm

class ColumnStyles {
  constructor (settings) {
    addClass(tm.domElements.container, 'tm-column-styles')

    let containerId = tm.containerId
    settings = replaceIdsWithIndices(settings)

        // style general
    let text = `div#${containerId} table tr > * {`
    iterate(settings.all, function (prop, value) {
      text += `${prop}: ${value};`
    })
    text += '}'

        // add custom styles to the single columns
    iterate(settings, function (index, cssStyles) {
      if (index === 'all') return
      let i = parseInt(index) + 1

      text += `div#${containerId} table tr > *:nth-of-type(${i}) {`
      iterate(cssStyles, function (prop, value) {
        text += `${prop}: ${value};`
      })
      text += '}'
    })

    tm.appendStyles(text)
    info('module columnStyles loaded')
  }
}

module.exports = new Module({
  name: 'columnStyles',
  defaultSettings: {
    all: {}
  },
  initializer: function (settings) {
    try {
      tm = this
      let instance = new ColumnStyles(settings)
      return {}
    } catch (e) {
      error(e)
    }
  }
})
