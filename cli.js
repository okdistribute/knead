#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))
var detect = require('detect-data-stream')
var formatData = require('format-data')
var diff = require('sorted-diff-stream')
var fs = require('fs')
var knead = require('./')

if (argv._.length !== 3) {
  usage()
  process.exit()
}

var localPath = argv._[0]
var remotePath = argv._[1]
var outPath = argv._[2]
var format = argv.format || 'csv'
var limit = (argv.limit || 20) * 2

var opts = {
  limit: limit,
  strategy: 'rows'
}

if (fs.existsSync(outPath)) {
  console.log(outPath, 'exists. Appending to end of file.')
} else {
  console.log('Creating new file', outPath)
}

var localFile = fs.createReadStream(localPath).pipe(detect())
var newFile = fs.createReadStream(remotePath).pipe(detect())
var outFile = fs.createWriteStream(outPath, {flags: 'a'})
var diffStream = diff(localFile, newFile, jsonEquals)

var outStream = knead(diffStream, opts).pipe(formatData(format))

outStream.on('data', function (data) {
  outFile.write(data)
})

function usage () {
  console.log('knead <basefile> <newfile> <outfile> [--format csv,ndjson,json] [--limit <num>]')
}

function jsonEquals (a, b, cb) {
  if (JSON.stringify(a) === JSON.stringify(b)) cb(null, true)
  else cb(null, false)
}
