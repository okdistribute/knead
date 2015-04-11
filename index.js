var dat = require('dat-core')
var debug = require('debug')('daff.visualdiff')
var batcher = require('byte-stream')
var through = require('through2')

var toDaff = require('./lib/dat2daff.js')

function visualdiff(diffStream, opts, cb) {
  var batchedStream = batcher(10)
  diffStream
    .pipe(batchedStream)
    .pipe(through.obj(function (data, enc, next) {
      toDaff(data, opts, function (daff) {
        cb(null, daff)
      })
    })
  )
}



module.exports = visualdiff
