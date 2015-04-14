var argv = require('minimist')(process.argv.slice(2))
var dat = require('dat-core')

var visualdiff = require('./')

if (argv._.length < 2) return usage()

var opts = {
  dbPath: argv.db
  html: argv.html || false,
  limit: argv.limit || 10
}

var branch1 = argv._[0]
var branch1 = argv._[1]


visualdiff(branch1, branch2, opts, function (err, vals, next) {
  console.log(vals)
  next()
})

function usage () {
  console.log("dat-visualdiff <head1> <head2> --db <dat-db> [--limit <num>] [--html]")
}