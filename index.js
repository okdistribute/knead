var batcher = require('byte-stream')
var through = require('through2')
var debug = require('debug')('visualdiff')

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
  var self = this

  if (!opts) opts = {}
  if (!opts.db) throw new Error('db required')
  self.limit = (opts.limit || 20) * 2
  self.html = opts.html || false
  self.strategy = opts.strategy || 'rows'

  var db = opts.db

  if (self.strategy == 'rows') {
    self.rows(diffStream, cb)
  }
  else {
    self.cols(diffStream, cb)
  }
}

VisualDiff.prototype.rows = function (diffStream, cb) {
  var self = this
  var batchedStream = batcher(self.limit)

  diffStream.on('data', function (data) {
    debug('diffstream data ', data[0], data[1])
  })

  diffStream
    .pipe(batchedStream)
    .pipe(through.obj(function (data, enc, next) {
      var opts = {
        html: self.html
      }
      dat2daff.fromDiff(data, opts, function (tables, visual) {
        var output = {
          changes: data,
          older: getOlderChange(data),
          tables: tables
        }
        debug('visualdiff callback', output, visual)
        cb(output, visual, next)
      })
    })
  )
}

VisualDiff.prototype.cols = function (diffStream, cb) {
  var self = this
  throw new Error('cols not implemented yet')
  // TODO: return rows(diffStream.pipe(colStream), cb)
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
