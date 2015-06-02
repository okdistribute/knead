var Batcher = require('byte-stream')
var KneadStream = require('knead-stream')

module.exports = function (diffStream, opts, merge) {
  if (!opts) opts = {}
  var limit = (opts.limit || 20) * 2
  var batch = opts.batch || true
  var vizStream = opts.vizStream
  var batchStream = Batcher(limit)
  var kneadStream = KneadStream(merge)

  if (batch) diffStream = diffStream.pipe(batchStream)

  return diffStream.pipe(vizStream).pipe(kneadStream)
}