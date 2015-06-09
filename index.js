var Batcher = require('byte-stream')
var manualMergeStream = require('manual-merge-stream')
var diffs2string = require('diffs-to-string')

module.exports = function (diffStream, opts, merge) {
  if (!opts) {
    opts = {}
  }
  var limit = (opts.limit || 1) * 2
  var batchStream = Batcher(limit)
  var opts = {
    vizFn:  opts.vizFn || function (changes, cb) {
      cb(diffs2string(changes))
    },
    merge: merge
  }

  return diffStream.pipe(batchStream).pipe(manualMergeStream(opts))
}