var Batcher = require('byte-stream')
var manualMergeStream = require('manual-merge-stream')
var diff2daff = require('diff2daff')

module.exports = function (diffStream, opts, merge) {
  if (!opts) {
    opts = {}
  }
  var limit = (opts.limit || 20) * 2
  var batchStream = Batcher(limit)
  var vizFn = opts.vizFn || diff2daff

  var mergeStream
  if (merge) mergeStream = manualMergeStream(vizFn, merge)
  else mergeStream = manualMergeStream(vizFn)

  return diffStream.pipe(batchStream).pipe(mergeStream)
}