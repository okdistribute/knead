var daff = require('daff')
var NdjsonTable = require('./ndjson_table_view.js')

var flags = new daff.CompareFlags();
//flags.allow_nested_cells = true

function toDaff (changes, opts, cb) {
  if (!opts) opts = {}
  var table1 = new NdjsonTable(changes, function(row) {
    if (row && row[0]) return row[0]["value"]
    else return
  });

  var table2 = new NdjsonTable(changes, function(row) {
    if (row && row[1]) return row[1]["value"]
    else return
  });

  var alignment = daff.compareTables(table1, table2, flags).align();
  var highlighter = new daff.TableDiff(alignment,flags);
  var table_diff = new daff.SimpleTable();
  highlighter.hilite(table_diff);

  if (opts.html) {
    var diff2html = new daff.DiffRender();
    diff2html.render(table_diff);
    var table_diff_html = diff2html.html();
    return cb(table_diff_html)
  }
  else {
    var diff2terminal = new daff.TerminalDiffRender();
    return cb(diff2terminal.render(table_diff))
  }
}

module.exports = toDaff