# tablemodify

tablemodify is a javascript-plugin which boosts your html tables with awesome style and functionalities! :boom:
It is written in plain js, so no jQuery is required. Tm is based on a core Tablemodify-object which can be extended by several modules. There are some modules defined by default or you could even write your own if you wish to. 

### Browser support

supports all newer browsers, including IE11, edge, firefox, chrome, safari and opera. 
It also supports the common mobile browsers for android. 

# demo

watch and edit an example here: 
[http://codepen.io/dhansmair/pen/ZLpzKg/](http://codepen.io/dhansmair/pen/ZLpzKg/)

# basic setup

First of all, get the dist-folder from Github. 
Include these files:
```html
<script src='path/to/tablemodify.js'></script> // or the .min version
<link rel='stylesheet' href='path/to/tablemodify.css' />
<link rel='stylesheet' href='path/to/theme/default.css' />
```

after your document has loaded completely, create a new object:

```javascript
window.addEventListener('DOMContentLoaded', function() {
    
    var settings = {
        /* explained in the following chapters */
        };
        
    var tm = new Tablemodify('#tm-example', settings); // pass unique selector of your table and the settings
});
```
now we'll have a closer look on the settings-object. It may have the following structure:

```javascript
var settings = {
    // the table is going to be wrapped in a div. It may be useful to add an Id to it
    containerId: 'myCustomContainer', 
    
    // theming is explained later on
    theme: 'default', 
    
    /*
        This is an overview of the default modules tablemodify offers. 
        All modules are optional.
        To run a module, add it's name to the following object. the values are js-objects again.
        To run a module with default values, you can just pass an empty object, for example: "zebra: {}",
        The specific module settings will be explained in the accompaniyng chapter.
    */
    modules: {
        columnStyles: columnStylesSettings,
        zebra: zebraSettings,
        filter: filterSettings,
        fixed: fixedSettings,
        sorter: sorterSettings     
    }
};
```

# Modules

now here is a detailed tutorial about the configuration of each module:

## columnStyles

Use columnStyles to set the CSS for the cells in each column.
```javascript
 var columnStylesSettings = {
        /*
            this styles all cells.
            you can add any CSS property that work for html td and th elements.
            Notice that the values will be overwritten by specific styling of single columns!
        */
        all: {
            'text-align': 'left',
            'padding': '5px',
            'min-width': '150px',
            'max-width': '300px'
        },
        /*
            attach styles to cells with these indices.
            First index is 0.
        */
        0: {
            'text-align': 'right',
            'font-weight': 'bold'
            // ...
        },
        1: {
            'background-color':'rgba(0,0,0,0.5)'
            // ...
        }
        // ...
```

## zebra

A small module to add stripes to your table.
```javascript
   var zebraSettings = {
        // these are the default settings:
        even: '#dbe7f0',
        odd: '#ffffff'
    };
```

## filter

Adds a row to the thead so you can filter the table by columns.

```javascript
   var filterSettings = {
        // default value
        autoCollapse: true // only show the row when thead is hovered        
    };
```

## fixed

a super useful module and basically the reason why i built Tablemodify.
In my opinion there is no good solution for fixed table headers on the internet, most of them have problems this module can deal with:
            
- window resizing
- horizontal scrolling
- cross-browser functionality
- compatibility with a table-sorter

it is possible to fix both thead and tfoot elements.
The settings are simple:
```javascript
    var columnStylesSettings = {
        /*
            these are the defaults.
            To fix thead or tfoot, set it to true
        */
        fixHeader: false,
        fixFooter: false
    };            
```

## sorter

This module sorts the rows of your tbody, ascending or descending, sorted by a single column or even by multiple columns. For multisort, press shift and click another head cell. Still press shift and click a selected cell again to invert the order. Please keep in mind that js is generally rather slow and not made for handling big data amounts. Handling about 3000 rows works fine. 5000 still work, but it will take some time to sort and re-render, so bigger tables should be sorted on the backend, for example via php.

```javascript
  var sorterSettings = {
        /*
            these are the defaults:
        */
        initialColumn: 'firstEnabled',   // initial sorting column, either a column index or the special value 'firstEnabled'
        initialOrder: 'asc',             // initial sorting order, either 'asc', or 'desc'
        enableMultisort: true,           // enable/disable multisort functionality
        columns: {
            all: {
                enabled: true,
                parser: 'intelligent'
            },

            /*
                custom settings for single columns:
            */
            0: {
                enabled: false           // disable sorting
            },
            1: {
                parser: 'date',    // use another parser for this column
                parserOptions: {   // provide parameters to the parser
                    preset: 'english'
                }
            }
        },
        /*
            adding own parsers. Read below how it works.
        */
        customParsers: customParsers
    };
```

### parsers

so what about the parsers? There are some available by default:

| parsername    | notice  | description                                         | parameters |
| ---           | ---     | ---                                                 | ---        |
| "intelligent" | default | differentiates automatically between strings and numbers. recommended for mixed types. | none |
| "string"      || sorts in alphabetic order. efficient, recommended for pure strings | none |                          
| "numeric"     || sorts numbers (also floats). efficient, recommended for numbers | none | 
| "date"        || sorts by a given date format | format: A date/time format string which will be used to parse the dates preset: either 'english' or 'german', 'german' will match 'TT.MM.YYYY' and 'TT.MM.YY', 'english' will match 'YYYY-MM-DD' or 'MM/DD/YYYY'. It is recommended not to rely on the presets but rather provide your own date format string [Here you can find an overview of the tokens which can be used](https://github.com/taylorhakes/fecha#formatting-tokens) |

A parser is simply a compare function which is passed to the Array.sort() method. [here you can read more about compare functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) If you want to define your own parsers, add them like this:

```javascript
    var customParsers = {
        myParser: function(a, b) {
            /*
                parameters a, b: strings of two cell-contents to compare.

                if a > b, return a positive number,
                if a < b, return a negative number,
                if a = b, return 0. (<- this is important for multisort!)
            */
            // for example, this is the implementation of parser "string"
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        }
    };
```

### change header appearance

you can simply overwrite the default sorter styles of your table. Therefore, tm provides several css-classes.

Different order-icons: 
```css
/* default sorter icon (for no active sorting) */
.tm-container td.sortable {
    background-image:url(path/to/your/icon-default.jpg);
}

/* icon for active ascending order */
.tm-container td.sortable.sort-up {
    background-image:url(path/to/your/icon-up.jpg);
}
/* icon for active descending order */
.tm-container td.sortable.sort-down {
    background-image:url(path/to/your/icon-down.jpg);
}
```
Different background-color of active sorting:
```css
/* this will set the color to yellow */
.tm-container td.sortable.sort-up, .tm-container td.sortable.sort-down {
    background-color: 'yellow' 
}

```

# Modules - writing your own

to define a new module, create a new instance of `Tablemodify.Module` and pass it to `Tablemodify.addModule()`.

```javascript

    // writing custom module
    var myModule = new Tablemodify.Module({
        // required
        name: 'zebra2', 
        // optional
        defaultSettings: { 
            even: '#F9F9F9',
            odd: '#FFFFFF'
        },
        // optional
        settingsValidator: function(settings) {
            // you may throw an error if the passed settings are not valid
        },
        // required
        initializer: function(settings) {
            try {
                // ... your code goes here ... 

                var text = 'table' + this.bodySelector + ' tr:nth-of-type(even){background-color:' + settings.even + '}'
                         + 'table' + this.bodySelector + ' tr:nth-of-type(odd) {background-color:' + settings.odd + '}';
                this.appendStyles(text);
            } catch (e) {
                console.log(e);
            }
        }
    });

    Tablemodify.addModule(myModule);

```

- your initializer will get the settings as a parameter-object: these are the defaultSettings merged with the ones you 
  pass during the creation of the Tablemodify-instance
- inside the initializer-method you can access the current instance via `this` and use all internal methods
  like `this.appendStyles()`
- each module name is unique and can not be overwritten
- The `name` and `initializer` properties have to be defined, otherwise it will throw an error. 
- `defaultSettings` and `settingsValidator` are optional.

to activate the module:

```javascript

    var tm = new Tablemodify('#selector', {
        // ...
        modules: {
            'zebra2': {
                even: '#428BCA'
            }
            // ... other modules
        }
    });

```
in this example, the initializer parameter settings will be: 

```javascript
{
    even: '#428BCA', // what you passed
    odd: '#FFFFFF'   // from the defaultSettings
}
``` 
# dynamically adding rows

adding rows works like this:
```javascript
var tm = new Tablemodify(/* ... */);

tm.addRow(trElement);
// or
tm.addRows(arrayOfTrElements);
// or
tm.addRows(twoDimentionalArray);
```
you can pass either an array of tr-elements directly or a two-dimensional array of values. 
Note that the inner array should have a length equal to the number of columns in your table.

if any sorting is active, the rows are automatically inserted at the right position,
and if a filter is active, tm also decides whether to hide the new rows or not. 

# Theming

include a theme file you want and set the `theme`-property to the right name.
to create own themes, edit an existing theme *.css or *.less file (I recommend using the second option).
if your theme's name would be `myCustom`, Do not forget to change the name of the css-class `.tm-theme-default` to `.tm-theme-myCustom`!
