var dat = require('dat-core')
var daff = require('daff')
var debug = require('debug')('daff.visualdiff')
var NdjsonTable = require('./ndjson_table_view.js')

module.exports = datVisualDiff

var flags = new daff.CompareFlags();
flags.allow_nested_cells = true;

function datVisualDiff (changes, opts) {
  if (!opts) opts = {}
  var table1 = new NdjsonTable(changes, function(row) {
      return row["versions"][0]["row"];
  });

  var table2 = new NdjsonTable(changes, function(row) {
      return row["versions"][1]["row"];
  });


  var alignment = daff.compareTables(table1, table2, flags).align();
  var highlighter = new daff.TableDiff(alignment,flags);
  var table_diff = new daff.SimpleTable();
  highlighter.hilite(table_diff);

  if (opts.html) {
    var diff2html = new daff.DiffRender();
    diff2html.render(table_diff);
    var table_diff_html = diff2html.html();
    return table_diff_html
  }
  return table_diff
}


function Table (obj) {

}

function keep (branch, row) {

}