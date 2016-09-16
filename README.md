# tablemodify

This is a plain js plugin for modifying html tables. It is based on a core function and can be extended with several plugins (you can even add your own!)

# version

The current version is alpha 0.3, the basic methods are implemented & work quite well. It will take some more time until a stable beta version will be finished. 

# browser support 

Please note that tablemodify uses CSS flexboxes. Therefore I can only guarantee support of all browsers which support these flexboxes.

# API

to start, include these files:
<code>
tablemodify.js,
tablemodify.css
</code>

add the following code into your JS part:

<pre><code>
// available options:
var settings = {
  debug: true,      // true (default )|| false 
  modules: {        // available basic modules: zebra, fixed, sorter
    zebra: {
      even:'white',
      odd:'lightgray
    },
    fixed: {
      fixHeader: true,
      fixFooter: true,
      minWidths: ['100px', '80px', 'auto'] // min-widths of the columns. If the Array contains less values than your table has,
                                           // the additional columns will all get the last value in the array.
                                           // By just appending "minWidths: '100px'", all columns get the same value
    }, 
    sorter: {
      default: ['both', 'string'],
      // pattern: "colIndex: [order, parsername]"
      0: false, // no sorting for column 0
      1: ['asc', 'number'], // only allow ascending sorting. parser = "number"
      2: ['desc', 'string'] // only descending sorting
      
      // ...
    }
};

function initTM() {

  var tm = new Tablemodify('#myTable', settings);

}
document.addEventListener('DOMContentLoaded', initTM);
</code></pre>
