var dat = require('dat-core')
var debug = require('debug')('daff.visualdiff')
var batcher = require('byte-stream')
var through = require('through2')

var dat2daff = require('./lib/dat2daff.js')

function visualdiff(diffStream, opts, cb) {
  if (!opts) opts = {
    html: false,
    limit: 20
  }
  var batchedStream = batcher(opts.limit)
  diffStream
    .pipe(batchedStream)
    .pipe(through.obj(function (data, enc, next) {
      dat2daff.fromDiff(data, opts, function (err, daff) {
        cb(null, daff)
      })
    })
  )
}

module.exports = visualdiff
