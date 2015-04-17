var batcher = require('byte-stream')
var through = require('through2')

var dat2daff = require('./lib/dat2daff.js')

var VisualDiff = function (head1, head2, opts) {
  if (!(this instanceof VisualDiff)) return new VisualDiff(head1, head2, opts)
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
  this.strategy = opts.strategy || 'page'
  this.stream1 = createStream(head1)
  this.stream2 = createStream(head2)

  dat2daff(this.stream1, this.stream2, opts, function (err, table1, table2, output, _next) {
    this.tables = [table1, table2]
    this.visual = output
    this._next = _next
  })
}

function createStream(head) {
  return db.checkout(head).createReadStream()
}

VisualDiff.prototype.next = function () {
  this._next()
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
