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

  returns:
    cb(data, visual, next)
    - data: object
      {
        older: 'left' or 'right',
        heads: original heads passed,
        changes: batched dat diffStream
      }

    - visual: string
    - next: function
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
    this.diffStream.on('data', function (data) {
      debug('diffstream data ', data[0], data[1])
    })
    this.diffStream
      .pipe(batchedStream)
      .pipe(through.obj(function (data, enc, next) {
        var older = getOlderChange(data)
        dat2daff.fromDiff(data, opts, function (data, visual) {
          debug('tables', data.tables)
          debug('output', visual)
          data.heads = heads
          data.older = older
          cb(data, visual, next)
        })
      })
    )
  }
  else {
    throw new Error('cols not supported')
  }
}

function getOlderChange (changes) {
  // find which one is older
  for (var i = 0; i < changes.length; i++) {
    var change = changes[i]
    if (change[0] && change[1]) {
      if (change[0].change < change[1].change) {
        return 'left'
      }
      if (change[0].change > change[1].change) {
        return 'right'
      }
    }
  }
}

VisualDiff.prototype.decline = function () {

}

VisualDiff.prototype.merge = function () {
  this.mergeStream.write()
  this.next()
}

module.exports = VisualDiff
