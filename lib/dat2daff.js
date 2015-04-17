var daff = require('daff')
var formatData = require('format-data')
var batcher = require('byte-stream')
var concat = require('concat-stream')
var through = require('through2')

var NdjsonTable = require('./ndjson_table_view.js')

var flags = new daff.CompareFlags();

function createBatchedStream (stream, limit) {
  var batchedStream = batcher(limit)
  return stream.pipe(batchedStream)
}

var dat2daff = function (stream1, stream2, opts, cb) {
  if (!opts) opts = {}
  if (!opts.limit) opts.limit = 50

  stream1 = createBatchedStream(stream1, opts.limit)
  stream2 = createBatchedStream(stream2, opts.limit)

  dat2daff.batchedStreamToTable(stream1, function (table1, next1) {
    dat2daff.batchedStreamToTable(stream2, function (table2, next2) {
      var output = tablesToOutput(table1, table2, opts)
      cb(null, table1, table2, output)
    })
  })
}

dat2daff.batchedStreamToTable = function (stream, cb) {
  stream.pipe(through.obj(function (data, enc, next) {
    for (var i = 0; i < data.length; i++) {
      data[i] = data[i].value
    }
    var table = new NdjsonTable(data)
    cb(table, next)
  }))
}

function tablesToOutput (table1, table2, opts) {
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


module.exports = dat2daff
