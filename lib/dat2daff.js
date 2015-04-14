var daff = require('daff')
var formatData = require('format-data')
var batcher = require('byte-stream')
var concat = require('concat-stream')
var through = require('through2')

var NdjsonTable = require('./ndjson_table_view.js')

module.exports = dat2daff

function dat2daff (head1, head2, opts, cb) {
  if (!opts.db) throw new Error('opts.db required')
  var db = opts.db
  var stream1 = db.checkout(head1).createReadStream()
  var stream2 = db.checkout(head2).createReadStream()
  dat2daff.fromReadStreams(stream1, stream2, opts, cb)
}

dat2daff.fromReadStreams = function (stream1, stream2, opts, cb) {
  if (!opts) opts = {}

  function streamToTable (stream, cb) {
    var batchedStream = batcher(opts.limit)
    stream
    .pipe(through.obj(function (data, enc, next) {
      next(null, data.value)
    }))
    .pipe(formatData('ndjson'))
    .pipe(concat(function (data) {
      // TODO: modularize this function into daff's core js env
      var target = []
      var tableView = new daff.TableView(target)
      var loader = new daff.Ndjson(tableView)
      loader.parse(data)
      cb(tableView)
    }))
  }

  streamToTable(stream1, function (table1) {
    streamToTable(stream2, function (table2) {
      var output = tablesToOutput(table1, table2, opts)
      cb(null, output)
    })
  })
}

var flags = new daff.CompareFlags();

function tablesToOutput(table1, table2, opts) {
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
  else {
    var diff2terminal = new daff.TerminalDiffRender();
    return diff2terminal.render(table_diff)
  }
}


function fromDiff (changes, opts, cb) {
  // alternative implementation that has bugs. experimental
  if (!opts) opts = {}

  var data1 = []
  var data2 = []
  for (var i = 0; i < changes.length; i++) {
    var change = changes[i]
    if (change[0] && change[0]['value']) {
      data1.push(change[0]["value"])
    }
    else {
      data2.push(change[1]["value"])
    }
  }
  var table1 = new NdjsonTable(data1)
  var table2 = new NdjsonTable(data2)
  //  return row[1]["value"]

  var output = tablesToOutput(table1, table2, opts)
  cb(null, output)
}

