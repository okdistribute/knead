#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))
var diff = require('sorted-diff-stream')
var fs = require('fs')
var batcher = require('byte-stream')
var dough = require('./')

if (argv._.length !== 3) {
  usage()
  process.exit()
}

var base = fs.createReadStream(argv[0])
var newfile = fs.createReadStream(argv[1])
var diffStream = diff(base, newfile)

var limit = (argv.limit || 20) * 2
var batchStream = batcher(limit)

var opts = {
  strategy: 'rows',
  html: false // TODO: make atom shell option
}
var doughStream = dough(opts)

var outStream = diffStream.pipe(batchStream).pipe(doughStream)
outStream.on('data', console.log)


function usage () {
  console.log('dough <basefile> <newfile> <outfile> [--limit <num>]')
}
