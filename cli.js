#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')

var visualdiff = require('./')

if (argv._.length !== 1) {
  usage()
  process.exit()
}

var opts = {
  limit: argv.limit || 20,
  strategy: 'rows',
  html: false // TODO: make atom shell option
}

function makeDiffer (heads) {
  var diffStream = opts.db.createDiffStream(heads[0], heads[1])
  visualdiff(diffStream, opts, function (err, mergeStream) {
    mergeStream.on('data', console.log)
  })
}

if (!argv.heads) {
  opts.db.heads(function (err, heads) {
    if (err) throw err
    makeDiffer(heads)
  })
} else {
  makeDiffer(argv.heads.split(','))
}

function getOlderChange (changes) {
  // find which one is older
  for (var i = 0; i < changes.length; i++) {
    var change = changes[i]
    if (change[0] && change[1]) {
      if (change[0].change < change[1].change) {
        return 'left'
      }
      if (change[0].change > change[1].change) {
        return 'right'
      }
    }
  }
}
