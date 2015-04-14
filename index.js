var dat = require('dat-core')
var debug = require('debug')('daff.visualdiff')
var batcher = require('byte-stream')
var through = require('through2')

var dat2daff = require('./lib/dat2daff.js')

function visualdiff(head1, head2, opts, cb) {
  opts = defaultOpts(opts)
  if (!opts.db) throw new Error('db required')

  // TODO: batch
  dat2daff(head1, head2, opts, function (err, output) {
    cb(null, output)
  })
}


function defaultOpts (opts) {
  if (!opts) opts = {
    db: false,
    html: false,
    limit: 20
  }
  return opts
}

module.exports = visualdiff

visualdiff.fromDiffStream = function(diffStream, opts, cb) {
  // alternative implementation that has bugs. experimental

  opts = defaultOpts(opts)

  diffStream
    .pipe(batchedStream)
    .pipe(through.obj(function (data, enc, next) {
      dat2daff.fromDiff(data, opts, function (err, daff) {
        cb(null, daff)
      })
    })
  )
}