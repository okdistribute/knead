var daff = require('daff')
var formatData = require('format-data')
var batcher = require('byte-stream')
var concat = require('concat-stream')
var through = require('through2')

var NdjsonTable = require('./ndjson_table_view.js')

var dat2daff = {}

dat2daff.fromDiff = function (changes, opts, cb) {
  // takes a dat
  if (!opts) opts = {}

  var data1 = []
  var data2 = []
  for (var i = 0; i < changes.length; i++) {
    var change = changes[i]
    if (change[0] && change[0]['value']) {
      data1.push(change[0]['value'])
    }
    if (change[1] && change[1]['value']) {
      data2.push(change[1]['value'])
    }
  }
  var table1 = new NdjsonTable(data1)
  var table2 = new NdjsonTable(data2)

  var output = tablesToOutput(table1, table2, opts)
  cb(table1, table2, output)
}


dat2daff.fromStreams = function (stream1, stream2, opts, cb) {
  // takes two ndjson streams
  // TODO: modularize
  // returns cb(table1, table2, output, next)

  if (!opts) opts = {}
  if (!opts.limit) opts.limit = 50
  if (!cb) throw new Error('no callback')

  stream1 = createBatchedStream(stream1, opts.limit)
  stream2 = createBatchedStream(stream2, opts.limit)

  batchedStreamToTable(stream1, function (table1, next1) {
    batchedStreamToTable(stream2, function (table2, next2) {
      var output = tablesToOutput(table1, table2, opts)
      cb(table1, table2, output, function next (cb) {
        next1()
        next2()
      })
    })
  })
}

function createBatchedStream (stream, limit) {
  var batchedStream = batcher(limit)
  return stream.pipe(batchedStream)
}

function batchedStreamToTable (stream, cb) {
  stream.pipe(through.obj(function (data, enc, next) {
    for (var i = 0; i < data.length; i++) {
      data[i] = data[i].value
    }
    var table = new NdjsonTable(data)
    cb(table, next)
  }))
}

var flags = new daff.CompareFlags();

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


module.exports = dat2daff
