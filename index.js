var Batcher = require('byte-stream')
var manualMergeStream = require('manual-merge-stream')
var diff2daff = require('diff2daff')

module.exports = function (diffStream, opts, merge) {
  if (!merge) {
    merge = opts
    opts = {}
  }
  var batchStream = Batcher((opts.limit || 20) * 2)
  var vizFn = opts.vizFn || diff2daff

  return diffStream.pipe(batchStream).pipe(manualMergeStream(vizFn, merge))
}