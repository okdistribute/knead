var visualdiff = require('./')
var diffinterface = require('')
var argv = require('minimist')(process.argv.slice(2))

if (argv._.length < 2) return usage()

var diffStream = process.stdin

var opts = {
  html: argv.html || false,
  limit: argv.limit || 10
}

visualdiff.batch(diffStream, opts, function (err, vals, next) {
  console.log(vals)
  next()
})

function usage () {
  console.log("visualdiff [--html] <changes>")
}