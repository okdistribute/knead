var batcher = require('byte-stream')
var through = require('through2')

var dat2daff = require('./lib/dat2daff.js')

function VisualDiff (head1, head2, opts, cb) {
  if (!(this instanceof VisualDiff)) return new VisualDiff(head1, head2, opts, cb)
  /*
  strategy:
    - 'page': by limit of row, seeing the full table
    - 'cols': by each column that has been identified as 'mostly changed', 'added', or 'deleted'
    - 'rows': by each row that has been changed (skip rows that have been unchanged)
  */

  if (!opts) opts = {}
  if (!opts.db) throw new Error('db required')
  var db = opts.db

  this.mergeStream = db.createMergeStream(head1, head2)
  this.strategy = opts.strategy || 'pages'
  this.stream1 = createStream(db, head1)
  this.stream2 = createStream(db, head2)

  dat2daff(this.stream1, this.stream2, opts, cb)
}

function createStream(db, head) {
  return db.checkout(head).createReadStream()
}

VisualDiff.prototype.decline = function () {

}

VisualDiff.prototype.merge = function () {
  this.mergeStream.write()
  this.next()
}

VisualDiff.fromDiffStream = function (diffStream, opts, cb) {
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

module.exports = VisualDiff
