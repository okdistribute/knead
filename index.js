var batcher = require('byte-stream')
var through = require('through2')
var debug = require('debug')('visualdiff')
var prompt = require('prompt-sync')

var dat2daff = require('./lib/dat2daff.js')

function VisualDiff (diffStream, opts, cb) {
  if (!(this instanceof VisualDiff)) return new VisualDiff(diffStream, opts, cb)
  /*
  strategy:
    - 'rows': by limit of row, seeing the full table
    - 'cols': by each column that has been identified as 'mostly changed', 'added', or 'deleted'

  returns:
    cb(output, visual, next)
    - output: object
      {
        older: 'left' or 'right',
        tables: daff tables,
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

  this.diffStream = diffStream

  if (this.strategy == 'rows') {
    var batchedStream = batcher(this.limit)
    this.diffStream.on('data', function (data) {
      debug('diffstream data ', data[0], data[1])
    })
    this.diffStream
      .pipe(batchedStream)
      .pipe(through.obj(function (data, enc, next) {
        var output = {
          changes: data,
          older: getOlderChange(data)
        }
        dat2daff.fromDiff(data, opts, function (tables, visual) {
          debug('tables', tables)
          debug('output', visual)
          output.tables = tables
          cb(output, visual, next)
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

module.exports = VisualDiff