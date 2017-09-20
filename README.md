# tablemodify

tablemodify is a javascript-plugin which boosts your html tables with awesome style and functionalities! :boom:
It is written in plain js, so no jQuery is required. Tm is based on a core Tablemodify-object which can be extended by several modules. There are some modules defined by default or you could even write your own if you wish to. 

See the Demo and the Documentation at https://dhansmair.github.io/tablemodify/.
The documentation is currently in progress.

# overview

tm includes basic modules:
- fixed table header and footer
- filtering 
  - string search (optional matching, case-sensitive), 
  - numeric search (comparators =, <, >, <=, >=, or a value range)
- sorting
  - sort by strings, numerics, dates
  - add custom sorting rules
  - sort by multiple columns
- paging 
  - js can handle a lot of data, but rendering too many rows can cause problems for the Browser.
    the pager module works perfectly with filtering and sorting, 
    and allows to deal with hundred thousands of rows, by only displaying a part of the data.
- column styling
  - simply apply css-styles to all cells of a column 
- column resizing is coming soon!
