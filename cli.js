#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')
var fs = require('fs')
var batcher = require('byte-stream')
var dough = require('./')

if (argv._.length !== 1) {
  usage()
  process.exit()
}

var db = dat(argv._[0], { valueEncoding: 'json' })

var opts = {
  strategy: 'rows',
  html: false // TODO: make atom shell option
}

function makeDatDough (heads) {
  var diffStream = db.createDiffStream(heads[0], heads[1])

  var limit = (argv.limit || 20) * 2
  var batchStream = batcher(limit)
  var doughStream = dough(opts)

  var outStream = diffStream.pipe(batchStream).pipe(doughStream)
  outStream.on('data', console.log)
}

if (!argv.heads) {
  db.heads(function (err, heads) {
    if (err) throw err
    makeDatDough(heads)
  })
} else {
  makeDatDough(argv.heads.split(','))
}
