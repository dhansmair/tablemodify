const Module = require('./module.js')
const {iterate, addClass, info} = require('../utils.js')

function getScrollbarWidth () {
  var outer = document.createElement('div')
  var inner = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
  document.body.appendChild(outer)
  var widthNoScroll = outer.offsetWidth
  // force scrollbars
  outer.style.overflow = 'scroll'
  // add innerdiv
  inner.style.width = '100%'
  outer.appendChild(inner)
  var widthWithScroll = inner.offsetWidth
  // remove divs
  outer.parentNode.removeChild(outer)
  return widthNoScroll - widthWithScroll
}
var inPx = c => c + 'px'

let tm, scrollbarWidth

class Fixed {
  constructor (settings) {
    try {
            // set up
      let headTable,
        bodyTable = tm.domElements.table,
        footTable,

        headWrap,
        tableWrap = tm.domElements.tableWrap,
        footWrap,

        origHead = tm.domElements.origHead,
        origFoot = tm.domElements.origFoot,
        _this = this,

        container = tm.domElements.container,
        borderCollapse = window.getComputedStyle(tm.domElements.table, null)['border-collapse']
      scrollbarWidth = getScrollbarWidth()

      if (origHead && settings.fixHeader) {
        let headerHeight = this.getHeaderHeight()
        headTable = document.createElement('table')
        headWrap = document.createElement('div')
        let rightUpperCorner = document.createElement('div')
        headTable.appendChild(origHead.cloneNode(true))
        headWrap.appendChild(headTable)
        container.insertBefore(headWrap, tableWrap)
        headWrap.appendChild(rightUpperCorner)

        addClass(headTable, 'tm-head')
        addClass(headWrap, 'tm-head-wrap')
        addClass(rightUpperCorner, 'tm-head-rightCorner')

        headTable.style.borderCollapse = borderCollapse
        origHead.style.visibility = 'hidden'
        bodyTable.style.marginTop = inPx('-' + headerHeight)
        headWrap.style.marginRight = inPx(scrollbarWidth)
        rightUpperCorner.style.width = inPx(scrollbarWidth)
        rightUpperCorner.style.right = inPx(-scrollbarWidth)

        tm.domElements.headWrap = headWrap
        tm.domElements.head = headTable.tHead
      }
      if (origFoot && settings.fixFooter) {
        let footerHeight = this.getFooterHeight()
        footTable = document.createElement('table')
        footWrap = document.createElement('div')
        footTable.appendChild(origFoot.cloneNode(true))
        footWrap.appendChild(footTable)
        container.appendChild(footWrap)

        addClass(footTable, 'tm-foot')
        addClass(footWrap, 'tm-foot-wrap')

                // add DIVs to origFoot cells so its height can be set to 0px
        iterate(origFoot.firstElementChild.cells, (i, cell) => {
          cell.innerHTML = '<div class="tm-fixed-helper-wrapper">' + cell.innerHTML + '</div>'
        })

        footTable.style.borderCollapse = borderCollapse
        origFoot.style.visibility = 'hidden'
        tableWrap.style.overflowX = 'scroll'
        tableWrap.style.marginBottom = inPx('-' + (scrollbarWidth + footerHeight))
        footWrap.style.marginRight = inPx(scrollbarWidth)

        tm.domElements.footWrap = footWrap
        tm.domElements.foot = footTable.tFoot
      }

            // add event listeners
      if (headTable) {
        window.addEventListener('resize', () => {
          _this.renderHead()
          if (tm.domElements.table.clientWidth > tm.domElements.tableWrap.clientWidth) {
            tm.domElements.tableWrap.style.overflowX = 'scroll'
          } else {
            tm.domElements.tableWrap.style.overflowX = 'auto'
          }
        })
      }

      if (footTable) {
        window.addEventListener('resize', () => {
          _this.renderFoot()
        })
      }

      if (headTable && footTable) {
        tableWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            headTable.style.transform = 'translateX(-' + tableWrap.scrollLeft + 'px)'
            footWrap.scrollLeft = tableWrap.scrollLeft
          }, false)
        })
        footWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            headTable.style.transform = 'translateX(-' + footWrap.scrollLeft + 'px)'
            tableWrap.scrollLeft = footWrap.scrollLeft
          })
        }, false)
      } else if (headTable && !footTable) {
        tableWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            headTable.style.marginLeft = inPx('-' + tableWrap.scrollLeft)
          })
        })
      } else if (!headTable && footTable) {
        footWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            tableWrap.scrollLeft = footWrap.scrollLeft
          })
        })
        tableWrap.addEventListener('scroll', function () {
          window.requestAnimationFrame(function () {
            footWrap.scrollLeft = tableWrap.scrollLeft
          })
        })
      }

      setTimeout(() => {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
        this.renderHead()
        this.renderFoot()
      }, 50)
      setTimeout(() => {
                // nötig, weil der Browser zum rendern manchmal eine gewisse Zeit braucht
        this.renderHead()
        this.renderFoot()
      }, 500)

      this.headTable = headTable
      this.footTable = footTable
      this.headWrap = headWrap
      this.footWrap = footWrap

      info('module fixed loaded')
    } catch (e) {
      console.warn(e)
    }
  }

  getHeaderHeight () {
    return tm.domElements.origHead.clientHeight
  }

  getFooterHeight () {
    return tm.domElements.origFoot.clientHeight
  }

  renderHead () {
    if (!this.headTable) return

    let allNew = [].slice.call(this.headTable.firstElementChild.firstElementChild.cells),
      allOld = [].slice.call(tm.domElements.origHead.firstElementChild.cells)
    tm.domElements.table.style.marginTop = inPx('-' + this.getHeaderHeight()) // if header resizes because of a text wrap

    iterate(allNew, function (i, neu) {
      let w = inPx(allOld[i].getBoundingClientRect().width)

      neu.style.width = w
      neu.style['minWidth'] = w
      neu.style['maxWidth'] = w
    })
  }

  renderFoot () {
    if (!this.footTable) return
    let allNew = [].slice.call(this.footTable.firstElementChild.firstElementChild.cells),
      allOld = [].slice.call(tm.domElements.origFoot.firstElementChild.cells)

    tm.domElements.tableWrap.style.marginBottom = inPx('-' + (scrollbarWidth + this.getFooterHeight() + 1)) // if footer resizes because of a text wrap

    iterate(allNew, function (i, neu) {
      let w = inPx(allOld[i].getBoundingClientRect().width)

      neu.style.width = w
      neu.style['minWidth'] = w
      neu.style['maxWidth'] = w
    })
  }
}

module.exports = new Module({
  name: 'fixed',
  defaultSettings: {
    fixHeader: false,
    fixFooter: false
  },
  initializer: function (settings) {
    tm = this

    addClass(tm.domElements.container, 'tm-fixed')
    scrollbarWidth = getScrollbarWidth()
    let instance = new Fixed(settings)

    return {
      notify: () => {
        instance.renderHead()
        instance.renderFoot()
      },
      renderHead: instance.renderHead,
      renderFoot: instance.renderFoot
    }
  }
})
