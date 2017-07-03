var timeout

// MENUE class
var Menue = function(el) {
    this.el = el
    this.items = [].slice.call(el.children)
}
Menue.prototype = {
    constructor: Menue,

    show: function(arr) {
        var nav = this.el
        nav.innerHTML = ''
        arr.forEach(function(item) {
            nav.appendChild(item)
        })
    },
    showAll: function() {
        var nav = this.el
        nav.innerHTML = ''
        for (var i = 0; i < this.items.length; i++) {
            nav.appendChild(this.items[i])
        }
    },
    getItems: function() {
        return this.items
    }
}


// SEARCH class
var Search = function(input, menue) {
    this.input = input
    this.menue = menue
    var _this = this

    input.addEventListener('keyup', function(e) {
        clearTimeout(timeout)
        timeout = window.setTimeout(function() {
            _this.run()
        }, 500)
    })
}
Search.prototype = {
    constructor: Search,
    input: null,
    getNeedle: function() {
        return this.input.value.trim()
    },
    run: function() {
        var needle = this.getNeedle().toLowerCase(),
            haystack = this.menue.getItems(),
            main = document.querySelector('main')

        if (needle === '') {
            this.menue.showAll()
        } else {
            var matches = haystack.filter(function(el) {
                var id = el.hash
                var textContainer = main.querySelector(id)

                return textContainer && textContainer.textContent.toLowerCase().indexOf(needle) !== -1
            })
            this.menue.show(matches)
        }



    }
}
