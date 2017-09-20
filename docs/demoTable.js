var tm

var factory = {
  cols: [
        {type: 'choice', options: ['Andy', 'Ben', 'Carl', 'Peter', 'David', 'Daniel', 'Daniela', 'Thomas', 'Susanne', 'Claudia', 'Anne', 'Lisa', 'Mary', 'Simone', 'Yvonne', 'Zack', 'Vitus']},
        {type: 'choice', options: ['Lewis', 'Scott', 'Simpson', 'Griffin', 'Potter', 'Granger', 'Simons', 'Jackson', 'Sparrow', 'Werner', 'McAbbot', 'Burns', 'Flanders', 'Parker']},
        {type: 'date'},
        {type: 'number', min: 5, max: 120},
        {type: 'choice', options: ['dog', 'cat', 'mouse', 'snake', 'hedgehog']}
  ],

  rand: function (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
  },

  createCell: function (params) {
    var _this = this

    switch (params.type) {
      case 'string':
        return {c: Math.random().toString(36).substr(2, _this.rand(params.min, params.max) + 2)}
      case 'number':
        return {c: _this.rand(params.min, params.max)}
      case 'choice':
        return {c: params.options[_this.rand(0, params.options.length - 1)]}
      case 'date':
        var m = this.rand(1, 12), d = this.rand(1, 28), y = this.rand(1930, 2000)
        return {c: m + '/' + d + '/' + y}
      default:
        return {c: Math.random().toString().substr(2, 5)}
    }
  },

  createRow: function () {
    var ret = [], _this = this

    this.cols.forEach(function (params) {
      ret.push(_this.createCell(params))
    })
    return ret
  },

  createTable: function (num) {
    var ret = []
    for (; num > 0; num--) {
      ret.push(this.createRow())
    }
    return ret
  }
}

document.addEventListener('DOMContentLoaded', function () {
  tm = new Tablemodify('#test', {
    theme: 'bootstrap',
    language: 'en',
    containerId: 'meinContainer',
    transition: 'fade',
    modules: {
      sorter: {
        columns: {
          all: {
            parser: 'string'
          },
          2: {
            parser: 'date',
            parserOptions: {   // provide parameters to the parser
              preset: 'english'
            }
          },
          3: {
            parser: 'numeric'
          }
        }

      },
      filter: {
        filterAfterTimeout: 500,
        autoCollapse: true,
        columns: {
          all: {
            type: 'string',
            options: {
              cs: true,
              matching: true
            }
          },
          3: {
            type: 'numeric',
            options: {
              comparator: true,
              range: true
            }
          }
        }
      },
      pager: {
        controller: {
          left: '#pager-left',
          right: '#pager-right',
          number: '#pager-pagenumber',
          total: '#pager-total',
          limit: '#pager-limit'
        }
      },
      fixed: {
        fixHeader: true
      },
      columnStyles: {
        all: {
          'min-width': '200px'
        },
        2: {
          'text-align': 'right',
          'width': '100px',
          'min-width': '100px'
        },
        3: {
          'text-align': 'right',
          'width': '80px',
          'min-width': '80px'
        }
      },
      resizer: {}
    }
  })

  tm.appendRaw(factory.createTable(320))

  document.getElementById('number-add').onclick = function () {
    var count = parseInt(document.getElementById('number-inserts').value)

    if (!isNaN(count)) {
      var rows = factory.createTable(count)

      tm.appendRaw(rows)
    }
  }
  document.getElementById('number-remove').onclick = function () {
    tm.removeRows()
  }
})
