var Batcher = require('byte-stream')
var KneadStream = require('knead-stream')
var diff2daff = require('diff2daff')

module.exports = function (diffStream, opts, merge) {
  if (!merge) {
    merge = opts
    opts = {}
  }
  var limit = (opts.limit || 20) * 2
  var batchStream = Batcher(limit)
  var kneadStream = KneadStream(diff2daff, merge)

  return diffStream.pipe(batchStream).pipe(kneadStream)
}