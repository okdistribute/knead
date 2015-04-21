var batcher = require('byte-stream')
var through = require('through2')
var debug = require('debug')('visualdiff')

var dat2daff = require('./lib/dat2daff.js')

function VisualDiff (heads, opts, cb) {
  if (!(this instanceof VisualDiff)) return new VisualDiff(heads, opts, cb)
  /*
  strategy:
    - 'rows': by limit of row, seeing the full table
    - 'cols': by each column that has been identified as 'mostly changed', 'added', or 'deleted'
  */

  if (!opts) opts = {}
  if (!opts.db) throw new Error('db required')
  this.limit = (opts.limit || 20) * 2
  this.strategy = opts.strategy || 'rows'

  var db = opts.db

  this.diffStream = db.createDiffStream(heads[0], heads[1])
  this.mergeStream = db.createMergeStream(heads[0], heads[1])

  if (this.strategy == 'rows') {
    var batchedStream = batcher(this.limit)
    this.diffStream
      .pipe(batchedStream)
      .pipe(through.obj(function (data, enc, next) {
        debug('visual diff batched ', data)
        dat2daff.fromDiff(data, opts, function (tables, output) {
          debug('tables', tables)
          debug('output', output)
          cb(heads, tables, output, next)
        })
      })
    )
  }
  else {
    throw new Error('cols not supported')
  }
}

VisualDiff.prototype.decline = function () {

}

VisualDiff.prototype.merge = function () {
  this.mergeStream.write()
  this.next()
}

module.exports = VisualDiff
