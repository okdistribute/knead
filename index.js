var dat = require('dat-core')
var daff = require('daff')
var debug = require('debug')('daff.visualdiff')
var batcher = require('byte-stream')
var through = require('through2')

var NdjsonTable = require('./lib/ndjson_table_view.js')

module.exports = {}

var flags = new daff.CompareFlags();
flags.allow_nested_cells = true;

function visualdiff(diffStream, opts, cb) {
  var batchedStream = batcher(10)
  diffStream
    .pipe(batchedStream)
    .pipe(through.obj(function (data, enc, next) {
      var daff = toDaff(data, opts)
      console.log(daff)
      //cb(null, merges, next)
    }))
}

function toDaff (changes, opts) {
  if (!opts) opts = {}

  var table1 = new NdjsonTable(changes, function(row) {
    console.log(row)
    if (row) return row[0]["row"]
    else return null
  });

  var table2 = new NdjsonTable(changes, function(row) {
    if (row) return row[1]["row"]
    else return null
  });

//  console.log(table1, table2)
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

module.exports = visualdiff
