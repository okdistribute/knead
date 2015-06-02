#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))
var detect = require('detect-data-stream')
var formatData = require('format-data')
var diff = require('sorted-diff-stream')
var fs = require('fs')
var knead = require('./')

if (argv._.length !== 3 && argv._[0] !== '-') {
  usage()
  process.exit()
}

function usage () {
  console.log('knead <basefile> <newfile> <outfile> [--format csv,ndjson,json] [--limit <num>]')
}

function jsonEquals (a, b, cb) {
  if (JSON.stringify(a) === JSON.stringify(b)) cb(null, true)
  else cb(null, false)
}

var opts = {
  limit: argv.limit,
  strategy: 'rows'
}

if (argv._[0] === '-') {
  knead(process.stdin, opts).pipe(process.stdout)
} else {
  var localPath = argv._[0]
  var remotePath = argv._[1]
  var outPath = argv._[2]
  var format = argv.format || 'csv'

  if (fs.existsSync(outPath)) {
    console.log(outPath, 'exists. Appending to end of file.')
  } else {
    console.log('Creating new file', outPath)
  }

  var localStream = fs.createReadStream(localPath).pipe(detect())
  var newStream = fs.createReadStream(remotePath).pipe(detect())
  var outStream = fs.createWriteStream(outPath, {flags: 'a'})

  var diffStream = diff(localStream, newStream, jsonEquals)
  var kneadStream = knead(diffStream, opts).pipe(formatData(format))

  kneadStream.on('data', function (data) {
    outStream.write(data)
  })

  outStream.on('end', function () {
    process.exit()
  })
}
