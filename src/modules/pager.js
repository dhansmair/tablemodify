const Module = require('./module.js')
const {addClass, info, error, delay} = require('../utils.js')

let tm

class Controller {
  constructor (sets, pager) {
    let _this = this
    this.pager = pager

    Object.keys(sets).forEach((key) => {
      if (sets[key] == null) throw new Error(key + ' setting must be set!')
      _this[key] = (sets[key] instanceof Element) ? sets[key] : document.querySelector(sets[key])
    })

    this.left.addEventListener('click', () => {
      let val = _this.getCurrentPageNumber() - 1

      if (val > 0) {
        _this.setCurrentPageNumber(val)
        delay(() => {
          _this.pager.update().run()
        })
      }
    })

    this.right.addEventListener('click', () => {
      let val = _this.getCurrentPageNumber() + 1

      if (val <= _this.getTotalPages()) {
        _this.setCurrentPageNumber(val)
        delay(() => {
          _this.pager.update().run()
        })
      }
    })

    this.number.addEventListener('change', () => {
      let val = _this.getCurrentPageNumber()

      if (isNaN(val) || val < 1) {
        val = 1
      } else if (val > _this.getTotalPages()) {
        val = _this.getTotalPages()
      }
      _this.setCurrentPageNumber(val)
        .pager.update().run()
    })

    this.limit.addEventListener('change', () => {
      let val = _this.limit.value
      if (isNaN(val) || val < 1) {
        _this.limit.value = 1
      }
      _this.setCurrentPageNumber(1)
      .updateTotalPages()
      .pager.update().run()
    })

    this.updateTotalPages()
  }

  getOffset () {
    let val = parseInt(this.number.value)
    let totalPages = this.getTotalPages()
    if (isNaN(val) || (val < 1 && totalPages !== 0)) {
      this.setCurrentPageNumber(1)
    } else if (val > totalPages) {
      this.setCurrentPageNumber(totalPages)
    }

    if (this.getCurrentPageNumber() <= 1) return 0

    return parseInt(this.getCurrentPageNumber() - 1) * this.getLimit()
  }

  getLimit () {
    let val = parseInt(this.limit.value)

    if (isNaN(val) || val < 1) {
      this.limit.value = this.pager.limit
      return this.pager.limit
    }
    return val
  }

  getTotalPages () {
    let total = 0

    if (this.pager.totalManually && this.pager.totalManually >= 0) {
      total = this.pager.totalManually
    } else {
      total = tm.countAvailableRows()
    }
    return Math.ceil(total / this.getLimit())
  }

  setCurrentPageNumber (num) {
    num = parseInt(num)

    if (!isNaN(num)) {
      this.number.style.width = (num.toString().length * 12) + 'px'
      this.number.value = num
    }
    return this
  }

  getCurrentPageNumber () {
    return parseInt(this.number.value)
  }

  updateTotalPages () {
    if (this.total != null) {
      this.total.innerHTML = tm.getTerm('PAGER_PAGENUMBER_SEPARATOR') + this.getTotalPages() + ' '
    }
    return this
  }

  updatePageNumber () {
    let totalPages = this.getTotalPages()
    if (this.getCurrentPageNumber() > totalPages) {
      this.setCurrentPageNumber(totalPages)
    }
    return this
  }

  update () {
    this.updateTotalPages().updatePageNumber()
    return this
  }
}

class Pager {
  constructor (settings) {
    this.offset = parseInt(settings.offset)
    this.limit = parseInt(settings.limit)
    this.totalManually = parseInt(settings.totalManually)
    this.controller = new Controller(settings.controller, this)

    try {
      this.controller.setCurrentPageNumber(this.controller.getCurrentPageNumber())
      this.controller.number.removeAttribute('disabled')
    } catch (e) {}
  }

    /**
     * main method run(): performs change
     */
  run () {
    if (tm.beforeUpdate('pager')) {
      tm.actionPipeline.notify('pager', {
        offset: this.getOffset(),
        limit: this.getLimit()
      })
    }
    return this
  }

    /**
     * fetches limit and offset from the view
     */
  update () {
    this.controller.update()
    return this.setOffset(this.controller.getOffset())
        .setLimit(this.controller.getLimit())
  }

  // setters
  setOffset (offset) {
    if (offset != null && !isNaN(offset)) this.offset = offset
    return this
  }
  setLimit (limit) {
    if (limit != null && !isNaN(limit)) this.limit = limit
    return this
  }

  setTotalManually (num) {
    this.totalManually = parseInt(num)
    this.update()
    return this
  }

  getOffset () {
    return this.offset
  }
  getLimit () {
    return this.limit
  }
}

module.exports = new Module({
  name: 'pager',
  defaultSettings: {
    offset: 0,
    limit: 500,
    totalManually: false,
    controller: {
      left: null,
      right: null,
      number: null,
      total: null,
      limit: null
    }
  },
  initializer: function (settings) {
    try {
      tm = this
      let instance = new Pager(settings)
      addClass(tm.domElements.container, 'tm-pager')
      info('module pager loaded')

      return {
        instance: instance,
        show: (limit, offset) => {
          instance
            .setOffset(offset)
            .setLimit(limit)
            .run()
        },
        getStats: () => {
          return {
            offset: instance.getOffset(),
            limit: instance.getLimit()
          }
        },
        notify: () => {
            // force pager to run again
          instance.update().run()
        },
        setTotalManually: (num) => {
          instance.setTotalManually(num)
        }
      }
    } catch (e) {
      error(e)
    }
  }
})
